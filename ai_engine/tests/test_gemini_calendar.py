import os
import io
import json
import pytest
from unittest.mock import MagicMock, patch
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from config import settings
from preprocessing.calendar_pdf_parser import CalendarPDFParser
from preprocessing.gemini_calendar_extractor import (
    GeminiCalendarExtractor,
    GeminiCalendarResponse,
    GeminiSemester,
    GeminiCalendarEvent
)

def create_sample_text_pdf_bytes() -> bytes:
    """Generates a text-heavy PDF that Stage 1 pypdf can extract."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("Academic Calendar 2026-27", styles["Title"]),
        Paragraph("Semester: Semester 1", styles["Heading2"]),
        Paragraph("Semester Start: 03 August 2026", styles["Normal"]),
        Paragraph("Semester End: 11 October 2026", styles["Normal"]),
        Paragraph("15 August 2026 - Independence Day", styles["Normal"]),
        Paragraph("26-27 August 2026 - Festival Break", styles["Normal"]),
        Paragraph("17 September 2026 - Teachers Seminar Break", styles["Normal"]),
        Paragraph("02 October 2026 - Gandhi Jayanti", styles["Normal"])
    ]
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def create_sample_scanned_pdf_bytes() -> bytes:
    """Generates a PDF with almost no extractable text simulating a scanned/grid PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    # Very short text that triggers Stage 2 fallback
    story = [Paragraph("Visual Calendar", styles["Title"])]
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def test_stage1_deterministic_used_for_text_pdf():
    pdf_bytes = create_sample_text_pdf_bytes()
    res = CalendarPDFParser.parse_pdf(pdf_bytes, filename="text_calendar.pdf")

    assert res["parser_used"] == "DETERMINISTIC"
    assert len(res["events"]) >= 4

def test_stage2_triggered_when_text_insufficient_and_key_missing(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", None)
    pdf_bytes = create_sample_scanned_pdf_bytes()
    res = CalendarPDFParser.parse_pdf(pdf_bytes, filename="scanned_calendar.pdf")

    assert res["parser_used"] == "FAILED"
    assert len(res["validation_errors"]) >= 1
    assert "GEMINI_API_KEY is not configured" in res["validation_errors"][0]

def test_gemini_extractor_normalization_and_range_expansion():
    raw_response = GeminiCalendarResponse(
        academic_year="2026-27",
        semesters=[
            GeminiSemester(
                name="ODD SEMESTER",
                semester_start_date="2026-08-03",
                semester_end_date="2026-11-30",
                events=[
                    GeminiCalendarEvent(
                        start_date="2026-10-19",
                        end_date="2026-10-21",
                        event_name="Festival Vacation",
                        event_type="VACATION",
                        is_holiday=True,
                        source_page=1
                    ),
                    GeminiCalendarEvent(
                        start_date="2026-09-15",
                        end_date=None,
                        event_name="Mid-Term Examination",
                        event_type="EXAM",
                        is_holiday=False,
                        source_page=1
                    )
                ]
            )
        ]
    )

    normalized = GeminiCalendarExtractor._normalize_gemini_response(raw_response, source_pdf="demo.pdf")

    assert normalized["academic_year"] == "2026-27"
    assert normalized["semester"] == "ODD SEMESTER"
    assert len(normalized["events"]) == 4  # 3 days for vacation (19, 20, 21) + 1 day for exam

    dates_dict = {e["date"]: e for e in normalized["events"]}
    assert "2026-10-19" in dates_dict
    assert "2026-10-20" in dates_dict
    assert "2026-10-21" in dates_dict
    assert dates_dict["2026-10-19"]["is_holiday"] == 1

def test_exam_events_not_automatically_marked_holiday():
    raw_response = GeminiCalendarResponse(
        academic_year="2026-27",
        semesters=[
            GeminiSemester(
                name="ODD SEMESTER",
                events=[
                    GeminiCalendarEvent(
                        start_date="2026-09-15",
                        event_name="End-Term Exam Start",
                        event_type="EXAM",
                        is_holiday=False,
                        source_page=1
                    )
                ]
            )
        ]
    )

    normalized = GeminiCalendarExtractor._normalize_gemini_response(raw_response, source_pdf="demo.pdf")
    exam_event = normalized["events"][0]

    assert exam_event["holiday_type"] == "EXAM"
    assert exam_event["is_holiday"] == 0

def test_gemini_extractor_mocked_success(monkeypatch):
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "fake_test_key")

    mock_gemini_response = GeminiCalendarResponse(
        academic_year="2026-27",
        semesters=[
            GeminiSemester(
                name="ODD SEMESTER",
                semester_start_date="2026-08-03",
                semester_end_date="2026-11-30",
                events=[
                    GeminiCalendarEvent(
                        start_date="2026-08-15",
                        event_name="Independence Day",
                        event_type="NATIONAL",
                        is_holiday=True,
                        source_page=1
                    ),
                    GeminiCalendarEvent(
                        start_date="2026-10-02",
                        event_name="Gandhi Jayanti",
                        event_type="NATIONAL",
                        is_holiday=True,
                        source_page=1
                    )
                ]
            )
        ]
    )

    with patch("preprocessing.gemini_calendar_extractor.GeminiCalendarExtractor.extract_calendar_from_pdf") as mock_extract:
        mock_extract.return_value = {
            "academic_year": "2026-27",
            "semester": "ODD SEMESTER",
            "semester_start_date": "2026-08-03",
            "semester_end_date": "2026-11-30",
            "events": [
                {"date": "2026-08-15", "holiday_name": "Independence Day", "holiday_type": "NATIONAL", "is_holiday": 1, "source_pdf": "scanned.pdf", "source_page": 1},
                {"date": "2026-10-02", "holiday_name": "Gandhi Jayanti", "holiday_type": "NATIONAL", "is_holiday": 1, "source_pdf": "scanned.pdf", "source_page": 1}
            ],
            "parser_used": "GEMINI"
        }

        pdf_bytes = create_sample_scanned_pdf_bytes()
        res = CalendarPDFParser.parse_pdf(pdf_bytes, filename="scanned.pdf")

        assert res["parser_used"] == "GEMINI"
        assert res["academic_year"] == "2026-27"
        assert len(res["events"]) == 2

@pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="Live Gemini integration test requires GEMINI_API_KEY environment variable")
def test_live_gemini_integration():
    sample_pdf_path = Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "sample_academic_calendar.pdf"
    if not sample_pdf_path.exists():
        pytest.skip(f"Sample PDF fixture not found at {sample_pdf_path}")

    with open(sample_pdf_path, "rb") as f:
        pdf_bytes = f.read()

    res = CalendarPDFParser.parse_pdf(pdf_bytes, filename="sample_academic_calendar.pdf")
    assert res["parser_used"] == "GEMINI"
    assert len(res["events"]) > 0
