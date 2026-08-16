import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, Union

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.connection import get_db
from database.queries import (
    save_pattern_analysis, save_faculty_analytics, get_faculty_subjects,
    get_student_by_id, get_faculty_by_id
)
from preprocessing.data_loader import DataLoader
from preprocessing.validator import DataValidator
from preprocessing.clean_data import DataCleaner
from preprocessing.feature_engineering import FeatureEngineer
from models.attendance_prediction import AttendancePredictor
from analytics.pattern_analysis import PatternAnalyzer
from analytics.faculty_analytics import FacultyAnalytics
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/analytics", tags=["Pattern & Faculty Analytics"])
predictor = AttendancePredictor()

def _resolve_student_db_id(db: Session, student_id: Union[int, str]) -> int:
    student_obj = get_student_by_id(db, student_id)
    if student_obj:
        return student_obj.id
    if isinstance(student_id, int) or (isinstance(student_id, str) and student_id.isdigit()):
        return int(student_id)
    raise HTTPException(status_code=404, detail=f"Student record not found for student_id={student_id}")

def _resolve_faculty_db_id(db: Session, faculty_id: Union[int, str]) -> int:
    faculty_obj = get_faculty_by_id(db, faculty_id)
    if faculty_obj:
        return faculty_obj.id
    if isinstance(faculty_id, int) or (isinstance(faculty_id, str) and faculty_id.isdigit()):
        return int(faculty_id)
    raise HTTPException(status_code=404, detail=f"Faculty record not found for faculty_id={faculty_id}")

@router.get("/patterns/student/{student_id}")
def get_student_patterns(
    student_id: str,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 3 Endpoint:
    Returns attendance pattern analysis (most absent weekday, subject breakdown, holiday drops).
    """
    student_db_id = _resolve_student_db_id(db, student_id)
    df_raw = DataLoader.load_student_attendance(db, student_db_id)
    if df_raw.empty:
        raise HTTPException(status_code=404, detail=f"No attendance logs found for student_id={student_id}")

    _, is_fatal, fatal_errors, _ = DataValidator.validate_attendance_dataframe(df_raw)
    if is_fatal:
        raise HTTPException(status_code=422, detail=f"Fatal Data Validation Error: {fatal_errors}")

    df_clean = DataCleaner.clean_attendance_data(df_raw)
    df_calendar = DataLoader.load_academic_calendar(db)
    patterns = PatternAnalyzer.analyze_student_patterns(df_clean, df_calendar)

    # Persist pattern analysis
    try:
        save_pattern_analysis(
            db=db,
            student_id=student_db_id,
            department=None,
            pattern_type="STUDENT_ATTENDANCE_PATTERN",
            pattern_summary=f"Most absent on {patterns.get('most_absent_weekday', 'N/A')}",
            data_json=patterns
        )
    except Exception as e:
        logger.error(f"Error persisting pattern analysis for student_id={student_id}: {e}")

    return {
        "success": True,
        "student_id": student_id,
        "patterns": patterns
    }

@router.get("/faculty/{faculty_id}")
def get_faculty_analytics(
    faculty_id: str,
    department: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 5 Endpoint:
    Returns classroom analytics strictly scoped to subjects assigned to faculty_id.
    """
    faculty_db_id = _resolve_faculty_db_id(db, faculty_id)
    subjects = get_faculty_subjects(db, faculty_db_id)
    
    if not subjects:
        logger.info(f"Faculty faculty_id={faculty_id} has no assigned subject attendance records.")
        return {
            "success": True,
            "faculty_id": faculty_id,
            "status": "NO_SUBJECTS_ASSIGNED",
            "message": "No subject attendance assigned to this faculty member.",
            "analytics": FacultyAnalytics._get_default_faculty_analytics(faculty_db_id)
        }

    sub_map = {s.id: s.name for s in subjects}
    faculty_obj = get_faculty_by_id(db, faculty_db_id)
    target_dept = department or (faculty_obj.department if faculty_obj and faculty_obj.department else "CSE")

    df_dept_raw = DataLoader.load_department_attendance(db, target_dept)

    if df_dept_raw.empty:
        classroom_analytics = FacultyAnalytics._get_default_faculty_analytics(faculty_db_id)
    else:
        df_faculty_att = df_dept_raw[df_dept_raw["subject_id"].isin(sub_map.keys())]
        if df_faculty_att.empty:
            classroom_analytics = FacultyAnalytics._get_default_faculty_analytics(faculty_db_id)
        else:
            df_clean = DataCleaner.clean_attendance_data(df_faculty_att)

            student_ids = df_clean["student_id"].unique()
            predictions_list = []
            for s_id in student_ids:
                s_att = df_clean[df_clean["student_id"] == s_id]
                if len(s_att) >= 1:
                    s_feats = FeatureEngineer.extract_student_features(s_att, None, subject_names_map=sub_map)
                    s_pred = predictor.predict_student_attendance(s_feats)
                    predictions_list.append(s_pred)

            classroom_analytics = FacultyAnalytics.generate_classroom_insights(
                df_dept_attendance=df_clean,
                predictions_list=predictions_list,
                faculty_id=faculty_db_id,
                subject_names_map=sub_map
            )

    # Persist faculty analytics
    try:
        save_faculty_analytics(
            db=db,
            faculty_id=faculty_db_id,
            subject_id=classroom_analytics.get("worst_subject_id"),
            class_avg_pct=classroom_analytics["class_avg_pct"],
            at_risk_count=classroom_analytics["at_risk_count"],
            insights_json=classroom_analytics
        )
    except Exception as e:
        logger.error(f"Error persisting faculty analytics for faculty_id={faculty_id}: {e}")

    return {
        "success": True,
        "faculty_id": faculty_id,
        "analytics": classroom_analytics
    }
