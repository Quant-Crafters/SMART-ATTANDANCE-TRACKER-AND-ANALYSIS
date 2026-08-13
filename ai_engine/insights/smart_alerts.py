import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

class SmartAlertGenerator:
    """
    Module 2: Smart Alerts Engine.
    Generates dynamic, data-driven dashboard alerts for students and faculty.
    Strictly WEB DASHBOARD ONLY (No Email, No SMS, No Push Notifications).
    Uses centralized REQUIRED_ATTENDANCE_PCT threshold.
    """

    @staticmethod
    def generate_student_alerts(
        feature_dict: Dict[str, Any],
        prediction_dict: Dict[str, Any],
        pattern_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Generates dynamic dashboard alert messages for a student.
        """
        alerts = []
        student_id = feature_dict.get("student_id", 0)
        current_pct = feature_dict.get("current_attendance_pct", 0.0)
        predicted_pct = prediction_dict.get("predicted_pct", current_pct)
        risk_level = prediction_dict.get("risk_level", "LOW")
        consecutive_absences = feature_dict.get("current_consecutive_absences", feature_dict.get("consecutive_absences", 0))
        recent_trend = feature_dict.get("recent_3week_trend", 0.0)
        req_pct = settings.REQUIRED_ATTENDANCE_PCT

        # ----------------------------------------------------
        # 1. PREDICTED ATTENDANCE BELOW THRESHOLD ALERT
        # ----------------------------------------------------
        if predicted_pct < req_pct:
            severity = "CRITICAL" if predicted_pct < (req_pct - 10.0) else "WARNING"
            alerts.append({
                "student_id": student_id,
                "alert_type": "PROJECTED_FALL_BELOW_THRESHOLD",
                "message": f"Your attendance is projected to fall below the required {req_pct}% (Estimated: {predicted_pct}%).",
                "severity": severity
            })

        # ----------------------------------------------------
        # 2. CONSECUTIVE ABSENCES ALERT
        # ----------------------------------------------------
        if consecutive_absences >= 3:
            alerts.append({
                "student_id": student_id,
                "alert_type": "CONSECUTIVE_ABSENCES_DETECTED",
                "message": f"You have missed {consecutive_absences} consecutive lectures recently.",
                "severity": "WARNING"
            })

        # ----------------------------------------------------
        # 3. POSITIVE / NEGATIVE TREND ALERT
        # ----------------------------------------------------
        if recent_trend > 3.0:
            alerts.append({
                "student_id": student_id,
                "alert_type": "ATTENDANCE_IMPROVING",
                "message": f"Your attendance trend has improved by {recent_trend}% over the last 3 weeks.",
                "severity": "INFO"
            })
        elif recent_trend < -4.0:
            alerts.append({
                "student_id": student_id,
                "alert_type": "ATTENDANCE_DECLINING",
                "message": f"Your recent attendance has decreased by {abs(recent_trend)}% compared to your overall average.",
                "severity": "WARNING"
            })

        # ----------------------------------------------------
        # 4. PATTERN-BASED ALERTS (WEEKDAY & SUBJECT DROPS)
        # ----------------------------------------------------
        if pattern_dict:
            most_absent_day = pattern_dict.get("most_absent_weekday")
            day_absence_rate = pattern_dict.get("worst_day_absence_rate", 0.0)
            if day_absence_rate > 35.0 and most_absent_day != "N/A":
                alerts.append({
                    "student_id": student_id,
                    "alert_type": "WEEKDAY_ABSENCE_PATTERN",
                    "message": f"You are absent most frequently on {most_absent_day}s ({day_absence_rate}% missed).",
                    "severity": "INFO"
                })

            worst_sub_pct = pattern_dict.get("worst_subject_attendance_pct", 100.0)
            worst_sub_name = feature_dict.get("worst_subject_name", f"Subject ID {pattern_dict.get('worst_performing_subject_id', 0)}")
            if worst_sub_pct < 70.0:
                alerts.append({
                    "student_id": student_id,
                    "alert_type": "SUBJECT_SPECIFIC_LOW_ATTENDANCE",
                    "message": f"{worst_sub_name} currently has your lowest attendance rate at {worst_sub_pct}%.",
                    "severity": "WARNING"
                })

        logger.info(f"Generated {len(alerts)} dashboard smart alerts for student_id={student_id}.")
        return alerts
