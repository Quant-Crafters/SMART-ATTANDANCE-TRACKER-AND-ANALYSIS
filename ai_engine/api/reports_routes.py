import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.connection import get_db
from database.queries import save_generated_report
from preprocessing.data_loader import DataLoader
from preprocessing.validator import DataValidator
from preprocessing.clean_data import DataCleaner
from preprocessing.feature_engineering import FeatureEngineer
from models.attendance_prediction import AttendancePredictor
from analytics.pattern_analysis import PatternAnalyzer
from insights.recommendations import RecommendationEngine
from insights.explainable_ai import ExplainableAI
from reports.report_generator import ReportGenerator
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/reports", tags=["AI Reporting"])
predictor = AttendancePredictor()

@router.post("/student/{student_id}")
def generate_student_report_api(
    student_id: int,
    format_type: str = Query("PDF", description="PDF or EXCEL"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Module 6 Endpoint:
    Triggers PDF or Excel report generation for a student.
    Consumes centralized AI results without duplicating prediction logic.
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
    xai = ExplainableAI.generate_prediction_explanation(features, prediction, patterns)

    report_result = ReportGenerator.generate_student_report(
        format_type=format_type,
        feature_dict=features,
        prediction_dict=prediction,
        pattern_dict=patterns,
        recommendations=recs,
        xai_dict=xai
    )

    # Persist report metadata in DB
    try:
        save_generated_report(
            db=db,
            report_type=f"STUDENT_{format_type.upper()}",
            target_id=student_id,
            file_path=report_result["file_path"],
            summary_text=report_result["summary_text"]
        )
    except Exception as e:
        logger.error(f"Error persisting generated report metadata: {e}")

    return {
        "success": True,
        "report": report_result
    }
