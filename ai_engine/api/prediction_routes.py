import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.synthetic_provider import SyntheticTrainingDataProvider
from database.connection import get_db
from database.queries import save_prediction_result
from preprocessing.data_loader import DataLoader
from preprocessing.validator import DataValidator
from preprocessing.clean_data import DataCleaner
from preprocessing.feature_engineering import FeatureEngineer
from models.attendance_prediction import AttendancePredictor
from models.forecasting import AttendanceForecaster
from insights.explainable_ai import ExplainableAI
from analytics.pattern_analysis import PatternAnalyzer
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/predict", tags=["Attendance Prediction & XAI"])
predictor = AttendancePredictor()

@router.get("/student/{student_id}")
def predict_student_attendance(
    student_id: int,
    total_semester_classes: Optional[int] = Query(None, description="Optional override for total actual semester sessions"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 1 & Module 7 Endpoint:
    Generates predicted semester attendance %, risk level, prediction reliability, and XAI explanation.
    Uses authoritative actual semester session count derived from academic schedule.
    """
    df_raw = DataLoader.load_student_attendance(db, student_id)
    if df_raw.empty:
        raise HTTPException(status_code=404, detail=f"No attendance logs found for student_id={student_id}")

    # Fix 12: Validate Data and halt on fatal error
    _, is_fatal, fatal_errors, _ = DataValidator.validate_attendance_dataframe(df_raw)
    if is_fatal:
        raise HTTPException(status_code=422, detail=f"Fatal Data Validation Error: {fatal_errors}")

    if total_semester_classes is None:
        total_semester_classes = SyntheticTrainingDataProvider().get_total_actual_semester_sessions()

    df_leaves = DataLoader.load_student_leaves(db, student_id)
    df_calendar = DataLoader.load_academic_calendar(db)
    df_clean = DataCleaner.clean_attendance_data(df_raw)

    features = FeatureEngineer.extract_student_features(df_clean, df_leaves, total_semester_classes)
    prediction = predictor.predict_student_attendance(features)
    patterns = PatternAnalyzer.analyze_student_patterns(df_clean, df_calendar)
    xai = ExplainableAI.generate_prediction_explanation(features, prediction, patterns)

    # Persist prediction result to DB
    try:
        save_prediction_result(
            db=db,
            student_id=student_id,
            predicted_pct=prediction["predicted_pct"],
            risk_level=prediction["risk_level"],
            explanation=xai["explanation_text"]
        )
    except Exception as e:
        logger.error(f"Error persisting prediction result for student_id={student_id}: {e}")

    return {
        "success": True,
        "prediction": prediction,
        "explanation": xai,
        "features": features
    }

from config import settings

@router.get("/forecast/student/{student_id}")
def forecast_classes_needed(
    student_id: int,
    target_pct: float = Query(settings.REQUIRED_ATTENDANCE_PCT, ge=50.0, le=100.0),
    total_semester_classes: Optional[int] = Query(None, description="Optional override for total actual semester sessions"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Forecasting Scenario Endpoint:
    Calculates consecutive lectures needed to achieve target_pct.
    """
    df_raw = DataLoader.load_student_attendance(db, student_id)
    if df_raw.empty:
        raise HTTPException(status_code=404, detail=f"No attendance logs found for student_id={student_id}")

    # Fix 12: Validate Data and halt on fatal error
    _, is_fatal, fatal_errors, _ = DataValidator.validate_attendance_dataframe(df_raw)
    if is_fatal:
        raise HTTPException(status_code=422, detail=f"Fatal Data Validation Error: {fatal_errors}")

    if total_semester_classes is None:
        total_semester_classes = SyntheticTrainingDataProvider().get_total_actual_semester_sessions()

    df_clean = DataCleaner.clean_attendance_data(df_raw)
    features = FeatureEngineer.extract_student_features(df_clean, None, total_semester_classes)

    forecast = AttendanceForecaster.calculate_classes_needed(
        classes_attended=features["classes_attended"],
        total_conducted=features["total_conducted"],
        target_pct=target_pct,
        total_semester_classes=total_semester_classes
    )

    return {
        "success": True,
        "student_id": student_id,
        "forecast": forecast
    }
