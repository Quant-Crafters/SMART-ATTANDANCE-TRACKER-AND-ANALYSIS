import sys
from pathlib import Path
import pandas as pd
from typing import Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session
from database.queries import (
    get_student_attendance_history,
    get_student_leaves,
    get_department_attendance_records,
    get_all_students
)
from utils.logger import get_logger

logger = get_logger(__name__)

class DataLoader:
    """
    Loads raw relational database entities into Pandas DataFrames.
    """

    @staticmethod
    def load_student_attendance(db: Session, student_id: int) -> pd.DataFrame:
        """
        Loads all attendance logs for a single student into a DataFrame.
        """
        records = get_student_attendance_history(db, student_id)
        if not records:
            logger.warning(f"No attendance records found for student_id={student_id}")
            return pd.DataFrame(columns=["attendance_id", "student_id", "subject_id", "date", "status"])

        data = [
            {
                "attendance_id": r.attendance_id,
                "student_id": r.student_id,
                "subject_id": r.subject_id,
                "date": pd.to_datetime(r.date),
                "status": r.status.upper() if r.status else "ABSENT"
            }
            for r in records
        ]
        df = pd.DataFrame(data)
        df.sort_values(by="date", inplace=True)
        return df

    @staticmethod
    def load_student_leaves(db: Session, student_id: int) -> pd.DataFrame:
        """
        Loads leave history for a single student into a DataFrame with calculated leave day spans.
        """
        leaves = get_student_leaves(db, student_id)
        if not leaves:
            return pd.DataFrame(columns=["leave_id", "student_id", "start_date", "end_date", "leave_days", "reason"])

        data = []
        for l in leaves:
            start_dt = pd.to_datetime(l.start_date)
            end_dt = pd.to_datetime(l.end_date)
            # Calculate actual inclusive calendar leave days
            leave_days = max(1, (end_dt - start_dt).days + 1) if pd.notnull(start_dt) and pd.notnull(end_dt) else 1
            data.append({
                "leave_id": l.leave_id,
                "student_id": l.student_id,
                "start_date": start_dt,
                "end_date": end_dt,
                "leave_days": leave_days,
                "reason": l.reason or ""
            })
        return pd.DataFrame(data)

    @staticmethod
    def load_academic_calendar(db: Session) -> pd.DataFrame:
        """
        Loads college academic calendar and holiday schedule into a DataFrame.
        Uses UPLOADED_PDF records if available in DB; falls back to synthetic calendar otherwise.
        """
        try:
            from database.schema import AcademicCalendarModel
            # Check for UPLOADED_PDF records first
            uploaded_records = db.query(AcademicCalendarModel).filter(
                AcademicCalendarModel.source_type == "UPLOADED_PDF"
            ).order_by(AcademicCalendarModel.date.asc()).all()

            if uploaded_records:
                records = uploaded_records
            else:
                records = db.query(AcademicCalendarModel).order_by(AcademicCalendarModel.date.asc()).all()

            if not records:
                # Fallback to synthetic development calendar
                from database.synthetic_provider import SyntheticTrainingDataProvider
                synth_ds = SyntheticTrainingDataProvider().generate_full_synthetic_dataset()
                df_synth = synth_ds["academic_calendar"].copy()
                df_synth["source_type"] = "SYNTHETIC_DEVELOPMENT"
                df_synth["source_pdf"] = "synthetic_demo.pdf"
                df_synth["source_page"] = 1
                return df_synth

            data = [
                {
                    "id": r.id,
                    "date": pd.to_datetime(r.date),
                    "holiday_name": r.holiday_name or "Holiday",
                    "holiday_type": r.holiday_type or "ACADEMIC",
                    "is_holiday": int(r.is_holiday),
                    "source_pdf": r.source_pdf or "synthetic_demo.pdf",
                    "source_page": r.source_page or 1,
                    "source_type": r.source_type or "SYNTHETIC_DEVELOPMENT",
                    "academic_year": r.academic_year or "2026-27",
                    "semester": r.semester or "Semester 1"
                }
                for r in records
            ]
            return pd.DataFrame(data)
        except Exception as e:
            logger.warning(f"Unable to load academic calendar from DB: {e}. Using synthetic fallback.")
            from database.synthetic_provider import SyntheticTrainingDataProvider
            synth_ds = SyntheticTrainingDataProvider().generate_full_synthetic_dataset()
            df_synth = synth_ds["academic_calendar"].copy()
            df_synth["source_type"] = "SYNTHETIC_DEVELOPMENT"
            df_synth["source_pdf"] = "synthetic_demo.pdf"
            df_synth["source_page"] = 1
            return df_synth

    @staticmethod
    def load_department_attendance(db: Session, department: str) -> pd.DataFrame:
        """
        Loads attendance logs for all students in a department.
        """
        records = get_department_attendance_records(db, department)
        if not records:
            logger.warning(f"No attendance records found for department={department}")
            return pd.DataFrame(columns=["attendance_id", "student_id", "subject_id", "date", "status"])

        data = [
            {
                "attendance_id": r.attendance_id,
                "student_id": r.student_id,
                "subject_id": r.subject_id,
                "date": pd.to_datetime(r.date),
                "status": r.status.upper() if r.status else "ABSENT"
            }
            for r in records
        ]
        df = pd.DataFrame(data)
        df.sort_values(by="date", inplace=True)
        return df
