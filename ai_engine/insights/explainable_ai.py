import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from models.forecasting import AttendanceForecaster
from utils.logger import get_logger

logger = get_logger(__name__)

class ExplainableAI:
    """
    Module 7: Explainable AI Engine.
    Generates dynamic, human-readable explanations detailing WHY a specific
    prediction or risk category was assigned to a student using actual feature values.
    Uses centralized REQUIRED_ATTENDANCE_PCT criterion.
    """

    @staticmethod
    def generate_prediction_explanation(
        feature_dict: Dict[str, Any],
        prediction_dict: Dict[str, Any],
        pattern_dict: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates a human-readable explanation narrative and key contributing factors.
        """
        student_id = feature_dict.get("student_id", 0)
        current_pct = feature_dict.get("current_attendance_pct", 0.0)
        classes_attended = feature_dict.get("classes_attended", 0)
        total_conducted = feature_dict.get("total_conducted", 0)
        predicted_pct = prediction_dict.get("predicted_pct", current_pct)
        risk_level = prediction_dict.get("risk_level", "LOW")
        consecutive_absences = feature_dict.get("current_consecutive_absences", feature_dict.get("consecutive_absences", 0))
        recent_trend = feature_dict.get("recent_3week_trend", 0.0)
        req_pct = settings.REQUIRED_ATTENDANCE_PCT

        reasons = []

        # ----------------------------------------------------
        # 1. CURRENT VS PROJECTED PERCENTAGE & CRITERION EXPLANATION
        # ----------------------------------------------------
        reasons.append(f"Current attendance is {current_pct}%.")

        if predicted_pct < req_pct:
            reasons.append(f"Projected semester attendance ({predicted_pct}%) falls below the required {req_pct}% threshold.")
        else:
            reasons.append(f"Projected semester attendance ({predicted_pct}%) satisfies the required {req_pct}% threshold.")

        # Classes-needed detailed explanation
        if total_conducted > 0:
            forecast = AttendanceForecaster.calculate_classes_needed(
                classes_attended=classes_attended,
                total_conducted=total_conducted,
                target_pct=req_pct
            )
            if forecast["is_target_achieved"]:
                reasons.append(f"Based on {classes_attended} attended classes out of {total_conducted} conducted, you currently meet the required {req_pct}% attendance.")
            elif forecast.get("is_achievable", True):
                needed = forecast["classes_needed"]
                reasons.append(f"Based on {classes_attended} attended classes out of {total_conducted} conducted, attending the next {needed} classes consecutively brings attendance to the required {req_pct}%.")
            else:
                rem = forecast.get("remaining_classes", 0)
                reasons.append(f"Based on {classes_attended} attended classes out of {total_conducted} conducted, the required {req_pct}% attendance target cannot be reached within the remaining {rem} classes.")

        # ----------------------------------------------------
        # 2. RECENT 3-WEEK TREND
        # ----------------------------------------------------
        if recent_trend < -2.0:
            reasons.append(f"Attendance has decreased by {abs(recent_trend)}% over the last 3 weeks.")
        elif recent_trend > 2.0:
            reasons.append(f"Attendance has improved by {recent_trend}% over the last 3 weeks.")

        # ----------------------------------------------------
        # 3. RECENT CONSECUTIVE ABSENCES
        # ----------------------------------------------------
        if consecutive_absences >= 2:
            reasons.append(f"Missed {consecutive_absences} consecutive lectures recently.")

        # ----------------------------------------------------
        # 4. SUBJECT-SPECIFIC & WEEKDAY FACTORS
        # ----------------------------------------------------
        if pattern_dict:
            worst_sub_pct = pattern_dict.get("worst_subject_attendance_pct", 100.0)
            worst_sub_name = feature_dict.get("worst_subject_name", f"Subject ID {pattern_dict.get('worst_performing_subject_id', 0)}")
            if worst_sub_pct < 70.0:
                reasons.append(f"Low attendance in {worst_sub_name} ({worst_sub_pct}%).")

            most_absent_day = pattern_dict.get("most_absent_weekday")
            if most_absent_day and most_absent_day != "N/A":
                day_rate = pattern_dict.get("worst_day_absence_rate", 0.0)
                if day_rate > 30.0:
                    reasons.append(f"High absence rate on {most_absent_day}s ({day_rate}% missed).")

        narrative_header = f"{risk_level} Risk because"
        explanation_text = f"{narrative_header}: " + " ".join(reasons)

        result = {
            "student_id": student_id,
            "risk_level": risk_level,
            "explanation_text": explanation_text,
            "reasons": reasons
        }

        logger.info(f"Generated XAI Explanation for student_id={student_id}: '{explanation_text}'")
        return result
