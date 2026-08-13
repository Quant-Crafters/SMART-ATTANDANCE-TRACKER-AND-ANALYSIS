import sys
from pathlib import Path
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.connection import get_db
from database.queries import save_academic_calendar_events
from preprocessing.calendar_pdf_parser import CalendarPDFParser
from preprocessing.data_loader import DataLoader
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/calendar", tags=["Academic Calendar Management"])

@router.post("/upload")
async def upload_academic_calendar_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module Endpoint: Academic Calendar PDF Ingestion.
    Accepts, parses, validates, and stores a college academic calendar PDF into structured format.
    Does NOT repeatedly re-parse the PDF; parsed calendar becomes active for all AI engine modules.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF documents (.pdf) are allowed.")

    try:
        content_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded PDF file: {e}")

    try:
        parse_result = CalendarPDFParser.parse_pdf(content_bytes, filename=file.filename)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        logger.error(f"Error parsing uploaded PDF calendar: {e}")
        raise HTTPException(status_code=422, detail=f"Failed to parse calendar PDF structure: {e}")

    errors = parse_result.get("validation_errors", [])
    if errors:
        raise HTTPException(status_code=422, detail={"message": "Calendar validation failed", "errors": errors})

    events = parse_result.get("events", [])
    try:
        saved_count = save_academic_calendar_events(
            db=db,
            events=events,
            source_type="UPLOADED_PDF"
        )
    except Exception as e:
        logger.error(f"Failed to persist calendar events to database: {e}")
        raise HTTPException(status_code=500, detail="Database persistence failed for uploaded calendar.")

    holidays_count = sum(1 for e in events if e.get("is_holiday") == 1)

    return {
        "success": True,
        "calendar": {
            "academic_year": parse_result.get("academic_year") or "2026-27",
            "semester": parse_result.get("semester") or "Semester 1",
            "semester_start_date": parse_result.get("semester_start_date"),
            "semester_end_date": parse_result.get("semester_end_date"),
            "events_extracted": saved_count,
            "holidays_extracted": holidays_count,
            "source_type": "UPLOADED_PDF",
            "parser_used": parse_result.get("parser_used", "DETERMINISTIC"),
            "validation_warnings": parse_result.get("validation_warnings", [])
        }
    }

@router.get("")
def get_active_calendar(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns structured academic calendar details currently loaded into the AI engine.
    """
    df_cal = DataLoader.load_academic_calendar(db)
    if df_cal.empty:
        return {
            "success": True,
            "source_type": "SYNTHETIC_DEVELOPMENT",
            "academic_year": "2026-27",
            "semester": "Semester 1",
            "events_extracted": 0,
            "holidays_extracted": 0,
            "events": []
        }

    source_type = df_cal["source_type"].iloc[0] if "source_type" in df_cal.columns and not df_cal.empty else "SYNTHETIC_DEVELOPMENT"
    academic_year = df_cal["academic_year"].iloc[0] if "academic_year" in df_cal.columns and not df_cal.empty else "2026-27"
    semester = df_cal["semester"].iloc[0] if "semester" in df_cal.columns and not df_cal.empty else "Semester 1"

    events_list = []
    holidays_count = 0
    for _, row in df_cal.iterrows():
        is_hol = int(row.get("is_holiday", 1))
        if is_hol == 1:
            holidays_count += 1
        d_val = row["date"].strftime("%Y-%m-%d") if hasattr(row["date"], "strftime") else str(row["date"])
        events_list.append({
            "date": d_val,
            "holiday_name": row.get("holiday_name", "Holiday"),
            "holiday_type": row.get("holiday_type", "HOLIDAY"),
            "is_holiday": is_hol,
            "source_pdf": row.get("source_pdf", "synthetic_demo.pdf"),
            "source_page": int(row.get("source_page", 1)) if row.get("source_page") else 1
        })

    return {
        "success": True,
        "source_type": source_type,
        "academic_year": academic_year,
        "semester": semester,
        "events_extracted": len(events_list),
        "holidays_extracted": holidays_count,
        "events": events_list
    }
