import os
import io
import pytest
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from config import settings
from database.connection import Base, get_db
from database.schema import AcademicCalendarModel
from database.queries import save_academic_calendar_events
from preprocessing.calendar_pdf_parser import CalendarPDFParser
from preprocessing.data_loader import DataLoader
from fastapi.testclient import TestClient
from app import app

# Create in-memory SQLite database for isolated unit testing
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

client = TestClient(app)

def create_sample_calendar_pdf_bytes() -> bytes:
    """
    Generates a deterministic synthetic calendar PDF using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Academic Calendar 2026-27", styles["Title"]))
    story.append(Paragraph("Semester: Semester 1", styles["Heading2"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Semester Start: 03 August 2026", styles["Normal"]))
    story.append(Paragraph("Semester End: 11 October 2026", styles["Normal"]))
    story.append(Spacer(1, 15))

    story.append(Paragraph("List of Scheduled Holidays & Breaks:", styles["Heading3"]))
    story.append(Paragraph("15 August 2026 - Independence Day", styles["Normal"]))
    story.append(Paragraph("26-27 August 2026 - Festival Break", styles["Normal"]))
    story.append(Paragraph("17 September 2026 - Teachers Seminar Break", styles["Normal"]))
    story.append(Paragraph("02 October 2026 - Gandhi Jayanti", styles["Normal"]))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    db = TestingSessionLocal()
    yield db
    db.close()
    app.dependency_overrides.clear()

def test_1_valid_academic_calendar_pdf_parsing():
    pdf_bytes = create_sample_calendar_pdf_bytes()
    parse_result = CalendarPDFParser.parse_pdf(pdf_bytes, filename="test_calendar.pdf")

    assert parse_result["source_pdf"] == "test_calendar.pdf"
    assert len(parse_result["events"]) >= 4
    assert parse_result["total_pages"] == 1
    assert len(parse_result["validation_errors"]) == 0

def test_2_holiday_date_extraction():
    pdf_bytes = create_sample_calendar_pdf_bytes()
    parse_result = CalendarPDFParser.parse_pdf(pdf_bytes, filename="test_calendar.pdf")
    events = parse_result["events"]

    event_dates = {e["date"]: e["holiday_name"] for e in events}
    assert "2026-08-15" in event_dates
    assert "Independence Day" in event_dates["2026-08-15"]

    assert "2026-08-26" in event_dates
    assert "2026-08-27" in event_dates

def test_3_academic_year_extraction():
    pdf_bytes = create_sample_calendar_pdf_bytes()
    parse_result = CalendarPDFParser.parse_pdf(pdf_bytes, filename="test_calendar.pdf")
    assert parse_result["academic_year"] == "2026-27"

def test_4_semester_start_end_extraction():
    pdf_bytes = create_sample_calendar_pdf_bytes()
    parse_result = CalendarPDFParser.parse_pdf(pdf_bytes, filename="test_calendar.pdf")

    assert parse_result["semester"] == "Semester 1"
    assert parse_result["semester_start_date"] == "2026-08-03"
    assert parse_result["semester_end_date"] == "2026-10-11"

def test_5_invalid_date_handling():
    events_malformed = [
        {"date": "2026-02-31", "holiday_name": "Invalid Leap Day"},
        {"date": "not-a-date", "holiday_name": "Bad Format"}
    ]
    val_res = CalendarPDFParser.validate_calendar_data(events_malformed)
    assert len(val_res["errors"]) >= 1
    assert len(val_res["clean_events"]) == 0

def test_6_duplicate_calendar_event_handling():
    events_dup = [
        {"date": "2026-08-15", "holiday_name": "Independence Day"},
        {"date": "2026-08-15", "holiday_name": "Independence Day Duplicate"}
    ]
    val_res = CalendarPDFParser.validate_calendar_data(events_dup)
    assert len(val_res["clean_events"]) == 1
    assert len(val_res["warnings"]) >= 1

def test_7_calendar_database_persistence(setup_db):
    db = setup_db
    pdf_bytes = create_sample_calendar_pdf_bytes()
    parse_result = CalendarPDFParser.parse_pdf(pdf_bytes, filename="test_calendar.pdf")

    saved_count = save_academic_calendar_events(db, parse_result["events"], source_type="UPLOADED_PDF")
    assert saved_count >= 4

    recs = db.query(AcademicCalendarModel).filter(AcademicCalendarModel.source_type == "UPLOADED_PDF").all()
    assert len(recs) == saved_count

def test_8_uploaded_calendar_becomes_active(setup_db):
    db = setup_db
    df_cal = DataLoader.load_academic_calendar(db)
    assert not df_cal.empty
    assert df_cal["source_type"].iloc[0] == "UPLOADED_PDF"

def test_9_synthetic_calendar_fallback(setup_db):
    db = setup_db
    db.query(AcademicCalendarModel).filter(AcademicCalendarModel.source_type == "UPLOADED_PDF").delete()
    db.commit()

    df_cal = DataLoader.load_academic_calendar(db)
    assert not df_cal.empty
    assert df_cal["source_type"].iloc[0] == "SYNTHETIC_DEVELOPMENT"

def test_10_upload_api_pdf_only_rejection():
    response = client.post(
        "/api/v1/calendar/upload",
        files={"file": ("calendar.txt", b"Plain text content", "text/plain")}
    )
    assert response.status_code == 400
    assert "Only PDF documents" in response.json()["detail"]

def test_11_upload_api_success():
    pdf_bytes = create_sample_calendar_pdf_bytes()
    response = client.post(
        "/api/v1/calendar/upload",
        files={"file": ("college_calendar.pdf", pdf_bytes, "application/pdf")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["calendar"]["source_type"] == "UPLOADED_PDF"
    assert data["calendar"]["events_extracted"] >= 4

def test_12_inspect_active_calendar_api():
    response = client.get("/api/v1/calendar")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["source_type"] == "UPLOADED_PDF"
    assert len(data["events"]) >= 4
