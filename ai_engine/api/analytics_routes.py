import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.connection import get_db
from database.queries import save_pattern_analysis, save_faculty_analytics, get_faculty_subjects
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

@router.get("/patterns/student/{student_id}")
def get_student_patterns(
    student_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 3 Endpoint:
    Returns attendance pattern analysis (most absent weekday, subject breakdown, holiday drops).
    """
    df_raw = DataLoader.load_student_attendance(db, student_id)
    if df_raw.empty:
        raise HTTPException(status_code=404, detail=f"No attendance logs found for student_id={student_id}")

    # Fix 12: Validate Data and halt on fatal error
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
            student_id=student_id,
            department=None,
            pattern_type="STUDENT_ATTENDANCE_PATTERN",
            pattern_summary=f"Most absent on {patterns['most_absent_weekday']}",
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
    faculty_id: int,
    department: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 5 Endpoint:
    Returns classroom analytics strictly scoped to subjects assigned to faculty_id.
    Fix 5: Never falls back to department data if faculty has no assigned subjects.
    """
    # 1. Fetch subjects assigned to this faculty
    subjects = get_faculty_subjects(db, faculty_id)
    
    # Fix 5: If faculty has no assigned subjects, return controlled empty result without department fallback
    if not subjects:
        logger.info(f"Faculty faculty_id={faculty_id} has no assigned subjects. Returning controlled empty result.")
        return {
            "success": True,
            "faculty_id": faculty_id,
            "status": "NO_SUBJECTS_ASSIGNED",
            "message": "No subjects assigned to this faculty member.",
            "analytics": FacultyAnalytics._get_default_faculty_analytics(faculty_id)
        }

    sub_map = {s.subject_id: s.subject_name for s in subjects}
    target_dept = department or (subjects[0].faculty.department if subjects[0].faculty else "Computer Science")

    # 2. Fetch attendance logs for assigned subjects only
    df_dept_raw = DataLoader.load_department_attendance(db, target_dept)

    if df_dept_raw.empty:
        classroom_analytics = FacultyAnalytics._get_default_faculty_analytics(faculty_id)
    else:
        df_faculty_att = df_dept_raw[df_dept_raw["subject_id"].isin(sub_map.keys())]
        if df_faculty_att.empty:
            classroom_analytics = FacultyAnalytics._get_default_faculty_analytics(faculty_id)
        else:
            df_clean = DataCleaner.clean_attendance_data(df_faculty_att)

            # Generate predictions for enrolled students as single source of truth
            student_ids = df_clean["student_id"].unique()
            predictions_list = []
            for s_id in student_ids:
                s_att = df_clean[df_clean["student_id"] == s_id]
                if len(s_att) >= 3:
                    s_feats = FeatureEngineer.extract_student_features(s_att, None, subject_names_map=sub_map)
                    s_pred = predictor.predict_student_attendance(s_feats)
                    predictions_list.append(s_pred)

            classroom_analytics = FacultyAnalytics.generate_classroom_insights(
                df_dept_attendance=df_clean,
                predictions_list=predictions_list,
                faculty_id=faculty_id,
                subject_names_map=sub_map
            )

    # Persist faculty analytics
    try:
        save_faculty_analytics(
            db=db,
            faculty_id=faculty_id,
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
