import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from models.forecasting import AttendanceForecaster
from utils.logger import get_logger

logger = get_logger(__name__)

class RecommendationEngine:
    """
    Module 4: Personalized Recommendation Engine.
    Generates tailored, student-specific actionable advice combining predictions,
    forecasting scenario calculations, current attendance, and pattern analysis.
    Uses centralized REQUIRED_ATTENDANCE_PCT threshold.
    """

    @staticmethod
    def generate_personalized_recommendations(
        feature_dict: Dict[str, Any],
        prediction_dict: Dict[str, Any],
        pattern_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates personalized recommendations for a student.
        """
        recommendations = []
        student_id = feature_dict.get("student_id", 0)
        current_pct = feature_dict.get("current_attendance_pct", 0.0)
        classes_attended = feature_dict.get("classes_attended", 0)
        total_conducted = feature_dict.get("total_conducted", 0)
        predicted_pct = prediction_dict.get("predicted_pct", current_pct)
        risk_level = prediction_dict.get("risk_level", "LOW")
        req_pct = settings.REQUIRED_ATTENDANCE_PCT

        # ----------------------------------------------------
        # 1. CLASSES NEEDED TO REACH CENTRALIZED THRESHOLD
        # ----------------------------------------------------
        forecast_req = AttendanceForecaster.calculate_classes_needed(
            classes_attended=classes_attended,
            total_conducted=total_conducted,
            target_pct=req_pct
        )

        if not forecast_req["is_target_achieved"]:
            needed_req = forecast_req["classes_needed"]
            if forecast_req.get("is_achievable", True):
                recommendations.append({
                    "student_id": student_id,
                    "recommendation_text": f"Attend the next {needed_req} consecutive classes to reach the required {req_pct}% attendance.",
                    "priority": "HIGH" if risk_level in ("HIGH", "CRITICAL") else "MEDIUM"
                })
            else:
                recommendations.append({
                    "student_id": student_id,
                    "recommendation_text": f"The required attendance target of {req_pct}% cannot be reached with the remaining classes. Attend all remaining classes to maximize final attendance.",
                    "priority": "CRITICAL"
                })
        else:
            max_missable = forecast_req.get("max_missable_classes", 0)
            if max_missable > 0:
                recommendations.append({
                    "student_id": student_id,
                    "recommendation_text": f"Your attendance currently meets the required {req_pct}% threshold. You can miss up to {max_missable} class(es) while maintaining eligibility.",
                    "priority": "LOW"
                })
            else:
                recommendations.append({
                    "student_id": student_id,
                    "recommendation_text": f"You currently meet the required {req_pct}% attendance threshold.",
                    "priority": "LOW"
                })

        # ----------------------------------------------------
        # 2. CLASSES NEEDED TO REACH EXCELLENCE THRESHOLD (80.0%)
        # ----------------------------------------------------
        if current_pct >= req_pct and current_pct < 80.0:
            forecast_80 = AttendanceForecaster.calculate_classes_needed(
                classes_attended=classes_attended,
                total_conducted=total_conducted,
                target_pct=80.0
            )
            needed_80 = forecast_80["classes_needed"]
            if needed_80 > 0 and forecast_80.get("is_achievable", True):
                recommendations.append({
                    "student_id": student_id,
                    "recommendation_text": f"Attend the next {needed_80} classes to elevate your attendance to 80.0%.",
                    "priority": "MEDIUM"
                })

        # ----------------------------------------------------
        # 3. WEEKDAY ABSENCE PATTERN & SUBJECT ADVICE
        # ----------------------------------------------------
        if pattern_dict:
            most_absent_day = pattern_dict.get("most_absent_weekday")
            day_rate = pattern_dict.get("worst_day_absence_rate", 0.0)
            if day_rate > 25.0 and most_absent_day != "N/A":
                recommendations.append({
                    "student_id": student_id,
                    "recommendation_text": f"Avoid missing {most_absent_day} classes where your absence frequency is highest ({day_rate}% missed).",
                    "priority": "MEDIUM"
                })

            worst_sub_name = feature_dict.get("worst_subject_name", f"Subject ID {pattern_dict.get('worst_performing_subject_id', 0)}")
            worst_sub_pct = pattern_dict.get("worst_subject_attendance_pct", 100.0)
            if worst_sub_pct < req_pct:
                recommendations.append({
                    "student_id": student_id,
                    "recommendation_text": f"Prioritize attending {worst_sub_name} lectures where your attendance is lowest ({worst_sub_pct}%).",
                    "priority": "HIGH"
                })

        logger.info(f"Generated {len(recommendations)} personalized recommendations for student_id={student_id}.")
        return recommendations
