import pytest
import pandas as pd
from config import settings
from models.forecasting import AttendanceForecaster
from insights.recommendations import RecommendationEngine
from insights.explainable_ai import ExplainableAI
from models.attendance_prediction import AttendancePredictor
from analytics.pattern_analysis import PatternAnalyzer
from utils.helpers import determine_risk_level

def test_10_attendance_criterion_defaults_to_75():
    assert settings.REQUIRED_ATTENDANCE_PCT == 75.0

def test_11_attendance_criterion_is_centralized():
    forecast = AttendanceForecaster.calculate_classes_needed(
        classes_attended=34,
        total_conducted=50
    )
    assert forecast["target_pct"] == settings.REQUIRED_ATTENDANCE_PCT

def test_12_classes_needed_calculation_uses_configured_criterion():
    # 34 attended / 50 conducted = 68%
    # Target = 75%
    # (34 + X) / (50 + X) = 0.75 -> 34 + X = 37.5 + 0.75X -> 0.25X = 3.5 -> X = 14 classes
    forecast = AttendanceForecaster.calculate_classes_needed(
        classes_attended=34,
        total_conducted=50,
        target_pct=75.0,
        total_semester_classes=100
    )
    assert forecast["current_pct"] == 68.0
    assert forecast["classes_needed"] == 14
    assert forecast["remaining_classes"] == 50
    assert forecast["is_achievable"] is True
    assert forecast["is_target_achieved"] is False

def test_13_reachable_attendance_target():
    forecast = AttendanceForecaster.calculate_classes_needed(
        classes_attended=34,
        total_conducted=50,
        total_semester_classes=100
    )
    assert forecast["is_achievable"] is True
    assert forecast["classes_needed"] == 14

    rec = RecommendationEngine.generate_personalized_recommendations(
        feature_dict={"student_id": 1, "current_attendance_pct": 68.0, "classes_attended": 34, "total_conducted": 50},
        prediction_dict={"predicted_pct": 72.0, "risk_level": "HIGH"}
    )
    assert any("Attend the next 14 consecutive classes" in r["recommendation_text"] for r in rec)

def test_14_unreachable_attendance_target():
    # 20 attended / 90 conducted = 22.2%
    # Remaining classes = 10 (Total 100)
    # Max possible attendance = (20 + 10) / 100 = 30.0% < 75%
    forecast = AttendanceForecaster.calculate_classes_needed(
        classes_attended=20,
        total_conducted=90,
        total_semester_classes=100
    )
    assert forecast["is_achievable"] is False

    rec = RecommendationEngine.generate_personalized_recommendations(
        feature_dict={"student_id": 2, "current_attendance_pct": 22.2, "classes_attended": 20, "total_conducted": 90},
        prediction_dict={"predicted_pct": 30.0, "risk_level": "CRITICAL"}
    )
    assert any("cannot be reached" in r["recommendation_text"].lower() for r in rec)
    assert any("CRITICAL" in r["priority"] for r in rec)

def test_15_already_above_threshold_student():
    forecast = AttendanceForecaster.calculate_classes_needed(
        classes_attended=42,
        total_conducted=50,
        total_semester_classes=100
    )
    assert forecast["is_target_achieved"] is True
    assert forecast["classes_needed"] == 0
    assert forecast["max_missable_classes"] >= 1

    rec = RecommendationEngine.generate_personalized_recommendations(
        feature_dict={"student_id": 3, "current_attendance_pct": 84.0, "classes_attended": 42, "total_conducted": 50},
        prediction_dict={"predicted_pct": 85.0, "risk_level": "LOW"}
    )
    assert any("meets the required" in r["recommendation_text"].lower() for r in rec)

def test_16_recommendation_uses_centralized_criterion():
    rec = RecommendationEngine.generate_personalized_recommendations(
        feature_dict={"student_id": 4, "current_attendance_pct": 68.0, "classes_attended": 34, "total_conducted": 50},
        prediction_dict={"predicted_pct": 72.0, "risk_level": "HIGH"}
    )
    req_pct = settings.REQUIRED_ATTENDANCE_PCT
    assert any(f"{req_pct}%" in r["recommendation_text"] for r in rec)

def test_17_explainable_ai_uses_same_criterion():
    xai = ExplainableAI.generate_prediction_explanation(
        feature_dict={"student_id": 5, "current_attendance_pct": 68.0, "classes_attended": 34, "total_conducted": 50},
        prediction_dict={"predicted_pct": 72.0, "risk_level": "HIGH"}
    )
    req_pct = settings.REQUIRED_ATTENDANCE_PCT
    assert f"required {req_pct}%" in xai["explanation_text"]
    assert any("consecutively" in r for r in xai["reasons"])

def test_18_prediction_status_uses_same_criterion():
    risk_below = determine_risk_level(72.0, threshold=settings.REQUIRED_ATTENDANCE_PCT)
    risk_above = determine_risk_level(82.0, threshold=settings.REQUIRED_ATTENDANCE_PCT)

    assert risk_below in ("HIGH", "CRITICAL")
    assert risk_above in ("LOW", "MEDIUM")

def test_19_holiday_analysis_uses_uploaded_calendar_data():
    from preprocessing.clean_data import DataCleaner
    df_raw = pd.DataFrame([
        {"attendance_id": 1, "student_id": 1, "subject_id": 101, "date": "2026-08-13", "status": "PRESENT"},
        {"attendance_id": 2, "student_id": 1, "subject_id": 101, "date": "2026-08-14", "status": "ABSENT"},
        {"attendance_id": 3, "student_id": 1, "subject_id": 101, "date": "2026-08-17", "status": "ABSENT"},
    ])
    df_attendance = DataCleaner.clean_attendance_data(df_raw)
    df_uploaded_calendar = pd.DataFrame([
        {"id": 1, "date": pd.to_datetime("2026-08-15"), "holiday_name": "Independence Day", "holiday_type": "NATIONAL", "is_holiday": 1}
    ])

    patterns = PatternAnalyzer.analyze_student_patterns(df_attendance, df_uploaded_calendar)
    assert "pre_holiday_drop_pct" in patterns
    assert "post_holiday_drop_pct" in patterns
    assert patterns["is_pattern_reliable"] is True

def test_20_existing_functionality_remains_unchanged():
    predictor = AttendancePredictor()
    pred_res = predictor.predict_student_attendance({
        "student_id": 10,
        "current_attendance_pct": 78.0,
        "total_conducted": 40,
        "is_data_sufficient": True
    })

    assert "predicted_pct" in pred_res
    assert "predicted_min_pct" in pred_res
    assert "predicted_max_pct" in pred_res
    assert "risk_level" in pred_res
    assert "prediction_reliability" in pred_res
    assert "confidence_score" not in pred_res
