import re
import io
from pathlib import Path
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional, Tuple, Union
import pypdf

from utils.logger import get_logger

logger = get_logger(__name__)

MONTH_MAP = {
    "january": 1, "jan": 1,
    "february": 2, "feb": 2,
    "march": 3, "mar": 3,
    "april": 4, "apr": 4,
    "may": 5,
    "june": 6, "jun": 6,
    "july": 7, "jul": 7,
    "august": 8, "aug": 8,
    "september": 9, "sep": 9, "sept": 9,
    "october": 10, "oct": 10,
    "november": 11, "nov": 11,
    "december": 12, "dec": 12
}

from config import settings

class CalendarPDFParser:
    """
    Isolated PDF Calendar Ingestion & Validation Component.
    Two-Stage Extraction Strategy:
    - Stage 1: Deterministic text-based parsing via pypdf.
    - Stage 2: Gemini Multimodal PDF Extraction fallback for scanned, grid-based, or low-text PDFs.
    """

    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

    @classmethod
    def validate_file_security(cls, pdf_bytes: bytes, filename: str = "calendar.pdf") -> None:
        """
        Validates file size, extension, and PDF header signature.
        """
        if len(pdf_bytes) > cls.MAX_FILE_SIZE_BYTES:
            raise ValueError(f"File size exceeds limit of {cls.MAX_FILE_SIZE_BYTES / (1024*1024):.1f}MB.")

        if filename and not filename.lower().endswith(".pdf"):
            raise ValueError("Uploaded file must have a .pdf extension.")

        if not pdf_bytes.startswith(b"%PDF-"):
            raise ValueError("Uploaded file content does not have a valid PDF header signature.")

    @classmethod
    def _is_text_extraction_sufficient(cls, events: List[Dict[str, Any]], full_doc_text: str) -> bool:
        """
        Determines whether Stage 1 deterministic text extraction produced adequate calendar content.
        """
        cleaned_text = (full_doc_text or "").strip()
        # Insufficient if document text is too short or fewer than 2 valid calendar events were parsed
        if len(cleaned_text) < 100 or len(events) < 2:
            return False
        return True

    @classmethod
    def parse_pdf(
        cls,
        pdf_source: Union[bytes, io.BytesIO, str, Path],
        filename: str = "calendar.pdf"
    ) -> Dict[str, Any]:
        """
        Parses a PDF calendar source into structured events using two-stage extraction.
        """
        if isinstance(pdf_source, (str, Path)):
            with open(pdf_source, "rb") as f:
                pdf_bytes = f.read()
            source_filename = Path(pdf_source).name
        elif isinstance(pdf_source, io.BytesIO):
            pdf_bytes = pdf_source.getvalue()
            source_filename = filename
        elif isinstance(pdf_source, bytes):
            pdf_bytes = pdf_source
            source_filename = filename
        else:
            raise ValueError("Invalid PDF input source type.")

        cls.validate_file_security(pdf_bytes, source_filename)

        # STAGE 1: Deterministic pypdf text extraction
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        total_pages = len(reader.pages)
        logger.info(f"Extracting Stage 1 text from PDF '{source_filename}' ({total_pages} pages)...")

        page_texts: List[Tuple[int, str]] = []
        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            page_texts.append((idx + 1, text))

        full_doc_text = "\n".join([t[1] for t in page_texts])

        academic_year = cls._extract_academic_year(full_doc_text)
        semester = cls._extract_semester(full_doc_text)
        semester_start_date, semester_end_date = cls._extract_semester_boundaries(full_doc_text, academic_year)

        events: List[Dict[str, Any]] = []
        for page_num, text in page_texts:
            page_events = cls._extract_events_from_page(
                text=text,
                page_num=page_num,
                source_pdf=source_filename,
                academic_year=academic_year,
                semester=semester
            )
            events.extend(page_events)

        # Evaluate Stage 1 Sufficiency
        if cls._is_text_extraction_sufficient(events, full_doc_text):
            logger.info(f"Stage 1 deterministic text extraction successful for '{source_filename}' ({len(events)} events extracted).")
            validation_result = cls.validate_calendar_data(
                events=events,
                semester_start_date=semester_start_date,
                semester_end_date=semester_end_date
            )
            return {
                "academic_year": academic_year,
                "semester": semester,
                "semester_start_date": semester_start_date,
                "semester_end_date": semester_end_date,
                "events": validation_result["clean_events"],
                "validation_errors": validation_result["errors"],
                "validation_warnings": validation_result["warnings"],
                "source_pdf": source_filename,
                "total_pages": total_pages,
                "parser_used": "DETERMINISTIC"
            }

        # STAGE 2: Gemini Multimodal Fallback for low-text / scanned / visual grid PDFs
        logger.info(f"Stage 1 text extraction insufficient for '{source_filename}'. Triggering Stage 2 Gemini extraction...")
        
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY is not configured while parsing a visual/low-text calendar PDF.")
            return {
                "academic_year": None,
                "semester": None,
                "semester_start_date": None,
                "semester_end_date": None,
                "events": [],
                "validation_errors": [
                    "Calendar PDF requires Gemini extraction because no readable text was found, "
                    "but GEMINI_API_KEY is not configured."
                ],
                "validation_warnings": ["Stage 1 text extraction yielded insufficient content."],
                "source_pdf": source_filename,
                "total_pages": total_pages,
                "parser_used": "FAILED"
            }

        try:
            from preprocessing.gemini_calendar_extractor import GeminiCalendarExtractor
            gemini_result = GeminiCalendarExtractor.extract_calendar_from_pdf(pdf_bytes, filename=source_filename)
        except Exception as e:
            logger.error(f"Stage 2 Gemini extraction failed for '{source_filename}': {e}")
            return {
                "academic_year": None,
                "semester": None,
                "semester_start_date": None,
                "semester_end_date": None,
                "events": [],
                "validation_errors": [f"Gemini calendar extraction failed: {e}"],
                "validation_warnings": ["Stage 1 text extraction yielded insufficient content."],
                "source_pdf": source_filename,
                "total_pages": total_pages,
                "parser_used": "FAILED"
            }

        gemini_events = gemini_result.get("events", [])
        validation_result = cls.validate_calendar_data(
            events=gemini_events,
            semester_start_date=gemini_result.get("semester_start_date"),
            semester_end_date=gemini_result.get("semester_end_date")
        )

        return {
            "academic_year": gemini_result.get("academic_year"),
            "semester": gemini_result.get("semester"),
            "semester_start_date": gemini_result.get("semester_start_date"),
            "semester_end_date": gemini_result.get("semester_end_date"),
            "events": validation_result["clean_events"],
            "validation_errors": validation_result["errors"],
            "validation_warnings": validation_result["warnings"],
            "source_pdf": source_filename,
            "total_pages": total_pages,
            "parser_used": "GEMINI"
        }

    @classmethod
    def _extract_academic_year(cls, text: str) -> Optional[str]:
        """
        Extracts academic year pattern such as '2026-27', '2026-2027', '2026–2027'.
        """
        match = re.search(r'(?:academic\s+year|ay|session|year)[\s:]*([2][0-9]{3}[–\-][0-9]{2,4})', text, re.IGNORECASE)
        if match:
            return match.group(1).replace("–", "-")
        
        match2 = re.search(r'\b(20\d{2}[–\-]\d{2,4})\b', text)
        if match2:
            return match2.group(1).replace("–", "-")
        
        return None

    @classmethod
    def _extract_semester(cls, text: str) -> Optional[str]:
        """
        Extracts semester label such as 'Semester 1', 'Semester I', 'Odd Semester', 'Sem 5'.
        """
        match = re.search(r'\b(Semester\s+[0-9IVX]+|Sem\s+[0-9IVX]+|Odd\s+Semester|Even\s+Semester)\b', text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        return None

    @classmethod
    def _extract_semester_boundaries(cls, text: str, default_year_str: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
        """
        Extracts explicitly stated semester start and end dates.
        """
        start_date = None
        end_date = None

        default_year = None
        if default_year_str:
            y_match = re.match(r'^(20\d{2})', default_year_str)
            if y_match:
                default_year = int(y_match.group(1))

        start_match = re.search(
            r'(?:semester\s+start|session\ commencement|classes\ commence|term\ starts|start\ date)[\s:]*([^\n,]+)',
            text, re.IGNORECASE
        )
        if start_match:
            d_parsed = cls._parse_single_date_string(start_match.group(1), default_year=default_year)
            if d_parsed:
                start_date = d_parsed.strftime("%Y-%m-%d")

        end_match = re.search(
            r'(?:semester\s+end|term\ ends|last\ teaching\ day|semester\ closes|end\ date)[\s:]*([^\n,]+)',
            text, re.IGNORECASE
        )
        if end_match:
            d_parsed = cls._parse_single_date_string(end_match.group(1), default_year=default_year)
            if d_parsed:
                end_date = d_parsed.strftime("%Y-%m-%d")

        return start_date, end_date

    @classmethod
    def _extract_events_from_page(
        cls,
        text: str,
        page_num: int,
        source_pdf: str,
        academic_year: Optional[str],
        semester: Optional[str]
    ) -> List[Dict[str, Any]]:
        """
        Extracts date-labeled holiday/event records from a page's text lines.
        """
        events: List[Dict[str, Any]] = []

        default_year = None
        if academic_year:
            y_match = re.match(r'^(20\d{2})', academic_year)
            if y_match:
                default_year = int(y_match.group(1))

        lines = text.split("\n")
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            parsed_dates, event_name = cls._parse_line_for_date_and_name(line_str, default_year=default_year)
            if parsed_dates and event_name:
                event_type, is_holiday = cls._classify_event(event_name)
                for dt in parsed_dates:
                    events.append({
                        "date": dt.strftime("%Y-%m-%d"),
                        "holiday_name": event_name,
                        "holiday_type": event_type,
                        "is_holiday": is_holiday,
                        "source_pdf": source_pdf,
                        "source_page": page_num,
                        "academic_year": academic_year,
                        "semester": semester
                    })

        return events

    @classmethod
    def _parse_line_for_date_and_name(
        cls,
        line: str,
        default_year: Optional[int]
    ) -> Tuple[List[date], Optional[str]]:
        """
        Parses a single line for dates (single date or date range) and associated event name.
        """
        # Pattern 1: ISO Date YYYY-MM-DD
        iso_match = re.search(r'\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12][0-9]|3[01])\b', line)
        if iso_match:
            try:
                dt = datetime.strptime(iso_match.group(0).replace("/", "-"), "%Y-%m-%d").date()
                name = line.replace(iso_match.group(0), "").strip(" -—:,\t")
                return [dt], name or "Academic Event"
            except ValueError:
                pass

        # Pattern 2: Date Range "26–27 August 2026" or "26-27 Aug 2026" or "26 August 2026 - 28 August 2026"
        range_match = re.search(
            r'\b(\d{1,2})[–\-–](\d{1,2})\s+([A-Za-z]+)(?:\s+(20\d{2}))?\b',
            line
        )
        if range_match:
            day1 = int(range_match.group(1))
            day2 = int(range_match.group(2))
            month_str = range_match.group(3).lower()
            year_str = range_match.group(4)

            month_num = MONTH_MAP.get(month_str)
            if month_num and day1 <= day2:
                year = int(year_str) if year_str else (default_year or datetime.now().year)
                try:
                    dates = [date(year, month_num, d) for d in range(day1, day2 + 1)]
                    name = line.replace(range_match.group(0), "").strip(" -—:,\t")
                    return dates, name or "Academic Event Range"
                except ValueError:
                    pass

        # Pattern 3: Standard Date "15 August 2026", "15 Aug 2026", "August 15, 2026"
        std_match = re.search(
            r'\b(\d{1,2})\s+([A-Za-z]+)(?:\s+(20\d{2}))?\b',
            line
        )
        if std_match:
            day = int(std_match.group(1))
            month_str = std_match.group(2).lower()
            year_str = std_match.group(3)

            month_num = MONTH_MAP.get(month_str)
            if month_num and 1 <= day <= 31:
                year = int(year_str) if year_str else default_year
                if year:
                    try:
                        dt = date(year, month_num, day)
                        name = line.replace(std_match.group(0), "").strip(" -—:,\t")
                        return [dt], name or "Academic Event"
                    except ValueError:
                        pass
                else:
                    return [], None

        # Pattern 4: "August 15, 2026"
        rev_match = re.search(
            r'\b([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b',
            line
        )
        if rev_match:
            month_str = rev_match.group(1).lower()
            day = int(rev_match.group(2))
            year = int(rev_match.group(3))
            month_num = MONTH_MAP.get(month_str)
            if month_num:
                try:
                    dt = date(year, month_num, day)
                    name = line.replace(rev_match.group(0), "").strip(" -—:,\t")
                    return [dt], name or "Academic Event"
                except ValueError:
                    pass

        return [], None

    @classmethod
    def _parse_single_date_string(cls, date_str: str, default_year: Optional[int] = None) -> Optional[date]:
        """
        Parses an isolated string date candidate into a date object.
        """
        date_str_clean = date_str.strip()
        m = re.search(r'\b(\d{1,2})\s+([A-Za-z]+)(?:\s+(20\d{2}))?\b', date_str_clean)
        if m:
            day = int(m.group(1))
            month_str = m.group(2).lower()
            year = int(m.group(3)) if m.group(3) else default_year
            month_num = MONTH_MAP.get(month_str)
            if month_num and year:
                try:
                    return date(year, month_num, day)
                except ValueError:
                    pass
        return None

    @classmethod
    def _classify_event(cls, event_name: str) -> Tuple[str, int]:
        """
        Classifies an event name into event_type and is_holiday (1 or 0).
        """
        name_lower = event_name.lower()

        if any(w in name_lower for w in ["exam", "examination", "mid-term", "end-term", "test", "quiz"]):
            return "EXAM", 1
        elif any(w in name_lower for w in ["vacation", "recess", "summer break", "winter break"]):
            return "VACATION", 1
        elif any(w in name_lower for w in ["academic break", "seminar break", "study leave", "teaching break"]):
            return "ACADEMIC_BREAK", 1
        elif any(w in name_lower for w in ["working day", "instructional day", "compensatory working"]):
            return "SPECIAL_WORKING_DAY", 0
        elif any(w in name_lower for w in ["holiday", "festival", "diwali", "independence", "gandhi", "republic", "eid", "christmas", "holi", "pujas"]):
            return "FESTIVAL" if any(w in name_lower for w in ["festival", "diwali", "eid", "christmas", "holi", "puja"]) else "NATIONAL", 1
        else:
            return "HOLIDAY", 1

    @classmethod
    def validate_calendar_data(
        cls,
        events: List[Dict[str, Any]],
        semester_start_date: Optional[str] = None,
        semester_end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Validates calendar events for duplicate dates, malformed date formats, and logical date ranges.
        Does NOT invent dates if ambiguous.
        """
        errors: List[str] = []
        warnings: List[str] = []
        clean_events: List[Dict[str, Any]] = []
        seen_dates: set = set()

        if semester_start_date and semester_end_date:
            try:
                dt_start = datetime.strptime(semester_start_date, "%Y-%m-%d").date()
                dt_end = datetime.strptime(semester_end_date, "%Y-%m-%d").date()
                if dt_start >= dt_end:
                    errors.append(f"Invalid date range: semester start ({semester_start_date}) must be before semester end ({semester_end_date}).")
            except ValueError:
                errors.append("Invalid date format for semester start/end boundaries.")

        for ev in events:
            d_str = ev.get("date")
            if not d_str:
                warnings.append(f"Skipped event '{ev.get('holiday_name')}' with missing date.")
                continue

            try:
                dt_val = datetime.strptime(d_str, "%Y-%m-%d").date()
            except ValueError:
                errors.append(f"Invalid date format '{d_str}' for event '{ev.get('holiday_name')}'.")
                continue

            if d_str in seen_dates:
                warnings.append(f"Duplicate calendar event date '{d_str}' detected and deduplicated.")
                continue

            seen_dates.add(d_str)

            if semester_start_date and semester_end_date and (d_str < semester_start_date or d_str > semester_end_date):
                warnings.append(f"Event date '{d_str}' ({ev.get('holiday_name')}) falls outside defined semester range ({semester_start_date} to {semester_end_date}).")

            clean_events.append(ev)

        return {
            "clean_events": clean_events,
            "errors": errors,
            "warnings": warnings
        }
