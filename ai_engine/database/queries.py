import sys
from pathlib import Path
from typing import List, Optional, Dict, Any, Union

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import Session
from database.schema import (
    StudentModel, AttendanceModel, SubjectModel, FacultyModel, LeaveModel,
    PredictionResultModel, AIAlertModel, PatternAnalysisModel,
    RecommendationModel, FacultyAnalyticsModel, GeneratedReportModel
)
from utils.logger import get_logger

logger = get_logger(__name__)

# ==========================================
# READ DATA QUERIES
# ==========================================

def get_all_students(db: Session, department: Optional[str] = None) -> List[StudentModel]:
    """
    Fetches all student records, optionally filtered by department.
    """
    query = db.query(StudentModel)
    if department:
        query = query.filter(StudentModel.department == department)
    return query.all()

def get_student_by_id(db: Session, identifier: Union[int, str]) -> Optional[StudentModel]:
    """
    Fetches a single student by relational database primary key ID (students.id)
    or by human/business student_id string (students.student_id).
    """
    # 1. Try numeric primary key lookup first if identifier can be integer
    if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
        s = db.query(StudentModel).filter(StudentModel.id == int(identifier)).first()
        if s:
            return s

    # 2. Fall back to business student_id VARCHAR match
    return db.query(StudentModel).filter(StudentModel.student_id == str(identifier)).first()

def get_faculty_by_id(db: Session, identifier: Union[int, str]) -> Optional[FacultyModel]:
    """
    Fetches a single faculty member by relational database primary key ID (faculty.id)
    or by human/business faculty_id string (faculty.faculty_id).
    """
    if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
        f = db.query(FacultyModel).filter(FacultyModel.id == int(identifier)).first()
        if f:
            return f
    return db.query(FacultyModel).filter(FacultyModel.faculty_id == str(identifier)).first()

def get_student_attendance_history(db: Session, student_db_id: int) -> List[AttendanceModel]:
    """
    Fetches all historical attendance records for a specific student using database PK (students.id).
    """
    return (
        db.query(AttendanceModel)
        .filter(AttendanceModel.student_id == student_db_id)
        .order_by(AttendanceModel.date.asc())
        .all()
    )

def get_student_leaves(db: Session, student_db_id: int) -> List[LeaveModel]:
    """
    Safely fetches leave records for a specific student.
    If the optional 'leaves' table does not exist in PostgreSQL, returns empty list safely.
    """
    try:
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        if not inspector.has_table("leaves"):
            return []
        return (
            db.query(LeaveModel)
            .filter(LeaveModel.student_id == student_db_id)
            .order_by(LeaveModel.start_date.asc())
            .all()
        )
    except Exception as e:
        logger.info(f"Leaves table unqueryable or not present ({e}). Returning empty leave list.")
        db.rollback()
        return []

def get_department_attendance_records(db: Session, department: str) -> List[AttendanceModel]:
    """
    Fetches attendance records for all students within a department.
    Joins attendance.student_id = students.id.
    """
    return (
        db.query(AttendanceModel)
        .join(StudentModel, AttendanceModel.student_id == StudentModel.id)
        .filter(StudentModel.department == department)
        .all()
    )

def get_faculty_subjects(db: Session, faculty_db_id: int) -> List[SubjectModel]:
    """
    Fetches all subjects taught by a specific faculty member.
    Joins subjects.id = attendance.subject_id where attendance.faculty_id = faculty.id.
    """
    return (
        db.query(SubjectModel)
        .join(AttendanceModel, SubjectModel.id == AttendanceModel.subject_id)
        .filter(AttendanceModel.faculty_id == faculty_db_id)
        .distinct()
        .all()
    )


# ==========================================
# WRITE / PERSISTENCE QUERIES
# ==========================================

def save_prediction_result(
    db: Session,
    student_id: int,
    predicted_pct: float,
    risk_level: str,
    explanation: Optional[str] = None
) -> PredictionResultModel:
    """
    Persists attendance prediction output to the database referencing students.id.
    """
    record = PredictionResultModel(
        student_id=student_id,
        predicted_pct=predicted_pct,
        risk_level=risk_level,
        explanation=explanation
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def save_ai_alert(
    db: Session,
    student_id: Optional[int],
    alert_type: str,
    message: str,
    severity: str
) -> AIAlertModel:
    """
    Persists a generated contextual dashboard alert.
    """
    record = AIAlertModel(
        student_id=student_id,
        alert_type=alert_type,
        message=message,
        severity=severity
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def save_recommendation(
    db: Session,
    student_id: int,
    recommendation_text: str,
    priority: str = "MEDIUM"
) -> RecommendationModel:
    """
    Persists a personalized student recommendation.
    """
    record = RecommendationModel(
        student_id=student_id,
        recommendation_text=recommendation_text,
        priority=priority
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def save_pattern_analysis(
    db: Session,
    student_id: Optional[int],
    department: Optional[str],
    pattern_type: str,
    pattern_summary: str,
    data_json: Optional[Dict[str, Any]] = None
) -> PatternAnalysisModel:
    """
    Persists pattern analysis insights.
    """
    record = PatternAnalysisModel(
        student_id=student_id,
        department=department,
        pattern_type=pattern_type,
        pattern_summary=pattern_summary,
        data_json=data_json
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def save_faculty_analytics(
    db: Session,
    faculty_id: int,
    subject_id: Optional[int],
    class_avg_pct: float,
    at_risk_count: int,
    insights_json: Optional[Dict[str, Any]] = None
) -> FacultyAnalyticsModel:
    """
    Persists faculty classroom analytics.
    """
    record = FacultyAnalyticsModel(
        faculty_id=faculty_id,
        subject_id=subject_id,
        class_avg_pct=class_avg_pct,
        at_risk_count=at_risk_count,
        insights_json=insights_json
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def save_generated_report(
    db: Session,
    report_type: str,
    target_id: Optional[int],
    file_path: str,
    summary_text: Optional[str] = None
) -> GeneratedReportModel:
    """
    Persists generated report metadata.
    """
    record = GeneratedReportModel(
        report_type=report_type,
        target_id=target_id,
        file_path=file_path,
        summary_text=summary_text
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def save_academic_calendar_events(
    db: Session,
    events: List[Dict[str, Any]],
    source_type: str = "UPLOADED_PDF"
) -> int:
    """
    Safely stores/replaces uploaded academic calendar events in AcademicCalendarModel table.
    """
    from database.schema import AcademicCalendarModel
    from datetime import datetime

    if source_type == "UPLOADED_PDF":
        db.query(AcademicCalendarModel).filter(
            (AcademicCalendarModel.source_type == "UPLOADED_PDF") | 
            (AcademicCalendarModel.source_type == None)
        ).delete(synchronize_session=False)
        db.commit()

    count = 0
    for ev in events:
        d_str = ev.get("date")
        if not d_str:
            continue
        
        if isinstance(d_str, str):
            dt_obj = datetime.strptime(d_str, "%Y-%m-%d").date()
        else:
            dt_obj = d_str

        existing = db.query(AcademicCalendarModel).filter(AcademicCalendarModel.date == dt_obj).first()
        if existing:
            existing.holiday_name = ev.get("holiday_name", "Holiday")
            existing.holiday_type = ev.get("holiday_type", "HOLIDAY")
            existing.is_holiday = int(ev.get("is_holiday", 1))
            existing.source_pdf = ev.get("source_pdf")
            existing.source_page = ev.get("source_page")
            existing.source_type = source_type
            existing.academic_year = ev.get("academic_year")
            existing.semester = ev.get("semester")
        else:
            rec = AcademicCalendarModel(
                date=dt_obj,
                holiday_name=ev.get("holiday_name", "Holiday"),
                holiday_type=ev.get("holiday_type", "HOLIDAY"),
                is_holiday=int(ev.get("is_holiday", 1)),
                source_pdf=ev.get("source_pdf"),
                source_page=ev.get("source_page"),
                source_type=source_type,
                academic_year=ev.get("academic_year"),
                semester=ev.get("semester")
            )
            db.add(rec)
        count += 1

    db.commit()
    return count
