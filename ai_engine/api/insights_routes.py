import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.connection import get_db
from database.queries import save_ai_alert, save_recommendation
from preprocessing.data_loader import DataLoader
from preprocessing.validator import DataValidator
from preprocessing.clean_data import DataCleaner
from preprocessing.feature_engineering import FeatureEngineer
from models.attendance_prediction import AttendancePredictor
from analytics.pattern_analysis import PatternAnalyzer
from insights.smart_alerts import SmartAlertGenerator
from insights.insight_generator import InsightGenerator
from insights.recommendations import RecommendationEngine
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/insights", tags=["Smart Alerts & Recommendations"])
predictor = AttendancePredictor()

@router.get("/alerts/student/{student_id}")
def get_student_smart_alerts(
    student_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 2 Endpoint:
    Returns dynamic dashboard alerts and AI insights summary (strictly web dashboard only).
    """
    df_raw = DataLoader.load_student_attendance(db, student_id)
    if df_raw.empty:
        raise HTTPException(status_code=404, detail=f"No attendance logs found for student_id={student_id}")

    # Fix 12: Validate Data and halt on fatal error
    _, is_fatal, fatal_errors, _ = DataValidator.validate_attendance_dataframe(df_raw)
    if is_fatal:
        raise HTTPException(status_code=422, detail=f"Fatal Data Validation Error: {fatal_errors}")

    df_leaves = DataLoader.load_student_leaves(db, student_id)
    # Fix 5: Pass academic calendar to pattern analyzer
    df_calendar = DataLoader.load_academic_calendar(db)
    df_clean = DataCleaner.clean_attendance_data(df_raw)

    features = FeatureEngineer.extract_student_features(df_clean, df_leaves)
    prediction = predictor.predict_student_attendance(features)
    patterns = PatternAnalyzer.analyze_student_patterns(df_clean, df_calendar)

    alerts = SmartAlertGenerator.generate_student_alerts(features, prediction, patterns)
    # Fix 4: Integrate InsightGenerator into response payload
    insights = InsightGenerator.generate_student_summary(features, prediction, patterns)

    # Persist alerts to DB
    for a in alerts:
        try:
            save_ai_alert(
                db=db,
                student_id=student_id,
                alert_type=a["alert_type"],
                message=a["message"],
                severity=a["severity"]
            )
        except Exception as e:
            logger.error(f"Error persisting AI alert for student_id={student_id}: {e}")

    return {
        "success": True,
        "student_id": student_id,
        "alerts_count": len(alerts),
        "alerts": alerts,
        "insights_count": len(insights),
        "insights": insights
    }

@router.get("/recommendations/student/{student_id}")
def get_student_recommendations(
    student_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 4 Endpoint:
    Returns personalized actionable student recommendations.
    """
    df_raw = DataLoader.load_student_attendance(db, student_id)
    if df_raw.empty:
        raise HTTPException(status_code=404, detail=f"No attendance logs found for student_id={student_id}")

    # Fix 12: Validate Data and halt on fatal error
    _, is_fatal, fatal_errors, _ = DataValidator.validate_attendance_dataframe(df_raw)
    if is_fatal:
        raise HTTPException(status_code=422, detail=f"Fatal Data Validation Error: {fatal_errors}")

    df_leaves = DataLoader.load_student_leaves(db, student_id)
    # Fix 5: Pass academic calendar to pattern analyzer
    df_calendar = DataLoader.load_academic_calendar(db)
    df_clean = DataCleaner.clean_attendance_data(df_raw)

    features = FeatureEngineer.extract_student_features(df_clean, df_leaves)
    prediction = predictor.predict_student_attendance(features)
    patterns = PatternAnalyzer.analyze_student_patterns(df_clean, df_calendar)

    recs = RecommendationEngine.generate_personalized_recommendations(features, prediction, patterns)

    # Persist recommendations to DB
    for r in recs:
        try:
            save_recommendation(
                db=db,
                student_id=student_id,
                recommendation_text=r["recommendation_text"],
                priority=r["priority"]
            )
        except Exception as e:
            logger.error(f"Error persisting recommendation for student_id={student_id}: {e}")

    return {
        "success": True,
        "student_id": student_id,
        "recommendations_count": len(recs),
        "recommendations": recs
    }
