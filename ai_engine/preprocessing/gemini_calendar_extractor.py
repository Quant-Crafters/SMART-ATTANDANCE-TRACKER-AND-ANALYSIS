import json
import re
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

class GeminiCalendarEvent(BaseModel):
    start_date: str = Field(description="Event start date in YYYY-MM-DD format")
    end_date: Optional[str] = Field(default=None, description="Event end date in YYYY-MM-DD format for date ranges, or null for single-day events")
    event_name: str = Field(description="Exact name of the holiday, break, exam, or academic event")
    event_type: str = Field(description="One of: HOLIDAY, FESTIVAL, NATIONAL, ACADEMIC_BREAK, EXAM, VACATION, SPECIAL_WORKING_DAY, OTHER")
    is_holiday: bool = Field(description="True if classes/teaching are suspended/non-working day; False if classes/exams take place")
    source_page: Optional[int] = Field(default=1, description="1-indexed PDF page number where this event appears")

class GeminiSemester(BaseModel):
    name: str = Field(description="Name or title of the semester section, e.g., 'ODD SEMESTER', 'EVEN SEMESTER', 'Semester 1'")
    semester_start_date: Optional[str] = Field(default=None, description="Start date of teaching/classes for this semester in YYYY-MM-DD format")
    semester_end_date: Optional[str] = Field(default=None, description="End date of teaching/classes for this semester in YYYY-MM-DD format")
    events: List[GeminiCalendarEvent] = Field(default_factory=list, description="List of events belonging to this semester section")

class GeminiCalendarResponse(BaseModel):
    academic_year: Optional[str] = Field(default=None, description="Academic year label, e.g., '2026-27' or '2026-2027'")
    semesters: List[GeminiSemester] = Field(default_factory=list, description="All semester sections extracted from the document")

EXTRACTION_PROMPT = """
You are extracting structured academic-calendar information from the supplied PDF document.

Read BOTH visual and textual information in the PDF. The PDF may be a visual/calendar-grid, scanned, or image-based document.

Instructions:
1. Interpret MONTH columns, WEEKDAY rows, individual DATES, VISUAL HIGHLIGHTS, COLOR CODING, and EVENT LEGENDS.
2. Extract only information explicitly visible in the document. Do NOT invent dates, do NOT infer holidays that are not present, and do NOT guess missing years.
3. Deriving Years: Infer exact years (e.g., 2026 vs 2027) based on visible month/year headers (e.g. July '26 -> 2026, Jan '27 -> 2027) and the overall academic session context.
4. Support Multiple Semesters: The document may contain multiple semester sections (e.g., ODD SEMESTER and EVEN SEMESTER). Extract all semester sections.
5. Date Ranges: For multi-day events or vacations (e.g. "19 Oct - 25 Oct 2026"), set start_date to "2026-10-19" and end_date to "2026-10-25". For single-day events, set end_date to null.
6. Event Types: Use ONLY these controlled types: HOLIDAY, FESTIVAL, NATIONAL, ACADEMIC_BREAK, EXAM, VACATION, SPECIAL_WORKING_DAY, OTHER.
7. CRITICAL RULE FOR EXAMS & HOLIDAYS:
   - EXAM events (e.g., Mid-Term Exam, End-Term Exam) are NOT automatically non-working holidays. Set is_holiday = false for exams UNLESS the calendar explicitly indicates that classes are suspended/non-working day.
   - Mark is_holiday = true ONLY for official holidays, festival breaks, vacations, or declared non-working days where regular classes are suspended.
8. Return ONLY the requested structured JSON conforming to the output schema.
"""

class GeminiCalendarExtractor:
    """
    Multimodal PDF Academic Calendar Extractor using official google-genai SDK.
    Parses visual calendar grids, multi-semester layouts, and date ranges into structured events.
    """

    @classmethod
    def extract_calendar_from_pdf(
        cls,
        pdf_bytes: bytes,
        filename: str = "calendar.pdf"
    ) -> Dict[str, Any]:
        """
        Calls Gemini API with native PDF bytes to extract structured calendar JSON.
        """
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError(
                "Calendar PDF requires Gemini extraction because no readable text was found, "
                "but GEMINI_API_KEY is not configured."
            )

        try:
            from google import genai
            from google.genai import types
        except ImportError:
            raise ImportError(
                "The 'google-genai' package is required for Gemini extraction. "
                "Please install it using 'pip install google-genai'."
            )

        model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
        logger.info(f"Triggering Gemini multimodal PDF extraction for '{filename}' using model '{model_name}'...")

        client = genai.Client(api_key=api_key)

        try:
            pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
            response = client.models.generate_content(
                model=model_name,
                contents=[pdf_part, EXTRACTION_PROMPT],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GeminiCalendarResponse
                )
            )
            raw_text = response.text
        except Exception as e:
            logger.error(f"Gemini API execution failed: {e}")
            raise RuntimeError(f"Gemini API calendar extraction failed: {e}")

        if not raw_text or not raw_text.strip():
            raise ValueError("Gemini returned an empty extraction response.")

        try:
            structured_dict = json.loads(raw_text)
            parsed_response = GeminiCalendarResponse(**structured_dict)
        except Exception as e:
            logger.error(f"Failed to parse Gemini JSON output: {e}. Raw output: {raw_text[:500]}")
            raise ValueError(f"Gemini returned invalid or unparseable calendar JSON structure: {e}")

        # Post-process and normalize events
        return cls._normalize_gemini_response(parsed_response, filename)

    @classmethod
    def _normalize_gemini_response(
        cls,
        response_obj: GeminiCalendarResponse,
        source_pdf: str
    ) -> Dict[str, Any]:
        """
        Normalizes Gemini Pydantic output, expands date ranges, and formats into flat event list.
        """
        academic_year = response_obj.academic_year or "2026-27"
        expanded_events: List[Dict[str, Any]] = []
        semesters_summary: List[Dict[str, Any]] = []

        primary_start_date = None
        primary_end_date = None
        primary_semester_name = None

        for sem_idx, sem in enumerate(response_obj.semesters):
            sem_name = sem.name or f"Semester {sem_idx + 1}"
            if sem_idx == 0:
                primary_semester_name = sem_name
                primary_start_date = sem.semester_start_date
                primary_end_date = sem.semester_end_date

            semesters_summary.append({
                "name": sem_name,
                "semester_start_date": sem.semester_start_date,
                "semester_end_date": sem.semester_end_date,
                "events_count": len(sem.events)
            })

            for ev in sem.events:
                if not ev.start_date:
                    continue

                event_name = ev.event_name or "Academic Event"
                event_type = cls._normalize_event_type(ev.event_type)

                # Enforce EXAM non-holiday rule: EXAM is not automatically a holiday
                if event_type == "EXAM":
                    is_hol = 1 if ev.is_holiday else 0
                else:
                    is_hol = 1 if ev.is_holiday else 0

                source_pg = ev.source_page or (sem_idx + 1)

                # Handle Multi-Day Date Ranges
                if ev.end_date and ev.end_date != ev.start_date:
                    try:
                        dt_start = datetime.strptime(ev.start_date, "%Y-%m-%d").date()
                        dt_end = datetime.strptime(ev.end_date, "%Y-%m-%d").date()
                        
                        if dt_start <= dt_end:
                            curr_dt = dt_start
                            while curr_dt <= dt_end:
                                expanded_events.append({
                                    "date": curr_dt.strftime("%Y-%m-%d"),
                                    "holiday_name": event_name,
                                    "holiday_type": event_type,
                                    "is_holiday": is_hol,
                                    "source_pdf": source_pdf,
                                    "source_page": source_pg,
                                    "academic_year": academic_year,
                                    "semester": sem_name
                                })
                                curr_dt += timedelta(days=1)
                        else:
                            # Start date > End date fallback to start date
                            expanded_events.append({
                                "date": ev.start_date,
                                "holiday_name": event_name,
                                "holiday_type": event_type,
                                "is_holiday": is_hol,
                                "source_pdf": source_pdf,
                                "source_page": source_pg,
                                "academic_year": academic_year,
                                "semester": sem_name
                            })
                    except ValueError:
                        # Fallback for malformed date strings
                        expanded_events.append({
                            "date": ev.start_date,
                            "holiday_name": event_name,
                            "holiday_type": event_type,
                            "is_holiday": is_hol,
                            "source_pdf": source_pdf,
                            "source_page": source_pg,
                            "academic_year": academic_year,
                            "semester": sem_name
                        })
                else:
                    expanded_events.append({
                        "date": ev.start_date,
                        "holiday_name": event_name,
                        "holiday_type": event_type,
                        "is_holiday": is_hol,
                        "source_pdf": source_pdf,
                        "source_page": source_pg,
                        "academic_year": academic_year,
                        "semester": sem_name
                    })

        logger.info(f"Gemini extracted {len(expanded_events)} daily event records across {len(response_obj.semesters)} semester section(s).")

        return {
            "academic_year": academic_year,
            "semester": primary_semester_name or "Semester 1",
            "semester_start_date": primary_start_date,
            "semester_end_date": primary_end_date,
            "events": expanded_events,
            "semesters": semesters_summary,
            "parser_used": "GEMINI"
        }

    @classmethod
    def _normalize_event_type(cls, raw_type: str) -> str:
        """
        Maps raw extracted type string to valid controlled event types.
        """
        t = (raw_type or "").upper().strip()
        valid = {"HOLIDAY", "FESTIVAL", "NATIONAL", "ACADEMIC_BREAK", "EXAM", "VACATION", "SPECIAL_WORKING_DAY", "OTHER"}
        if t in valid:
            return t
        
        if "EXAM" in t or "TEST" in t:
            return "EXAM"
        elif "VACATION" in t:
            return "VACATION"
        elif "BREAK" in t:
            return "ACADEMIC_BREAK"
        elif "FESTIVAL" in t:
            return "FESTIVAL"
        elif "HOLIDAY" in t:
            return "HOLIDAY"
        else:
            return "OTHER"
