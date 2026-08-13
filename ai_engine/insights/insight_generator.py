import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

class InsightGenerator:
    """
    Summarizes analytical findings into human-readable textual insight cards for web dashboards.
    Uses centralized REQUIRED_ATTENDANCE_PCT threshold.
    """

    @staticmethod
    def generate_student_summary(
        feature_dict: Dict[str, Any],
        prediction_dict: Dict[str, Any],
        pattern_dict: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """
        Generates dynamic text insights for student dashboard widgets.
        """
        insights = []

        current_pct = feature_dict.get("current_attendance_pct", 0.0)
        predicted_pct = prediction_dict.get("predicted_pct", current_pct)
        risk_level = prediction_dict.get("risk_level", "LOW")
        worst_sub_name = feature_dict.get("worst_subject_name", "N/A")
        worst_sub_pct = feature_dict.get("worst_subject_pct", 0.0)
        req_pct = settings.REQUIRED_ATTENDANCE_PCT

        insights.append(f"Current overall attendance stands at {current_pct}%, with an estimated semester forecast of {predicted_pct}%.")

        if risk_level in ("HIGH", "CRITICAL"):
            insights.append(f"Your attendance status is classified as {risk_level} Risk. Immediate regular attendance is recommended.")

        if pattern_dict:
            worst_day = pattern_dict.get("most_absent_weekday", "N/A")
            if worst_day != "N/A":
                insights.append(f"Pattern analysis indicates your highest absence rate occurs on {worst_day}s.")
            
            trend_dir = pattern_dict.get("trend_direction", "STABLE")
            if trend_dir == "DECLINING":
                insights.append("Your attendance trajectory shows a declining trend over the past month.")
            elif trend_dir == "IMPROVING":
                insights.append("Your attendance trajectory shows positive improvement over recent weeks.")

        if worst_sub_name != "N/A" and worst_sub_pct < req_pct:
            insights.append(f"{worst_sub_name} currently has your lowest subject attendance ({worst_sub_pct}%).")

        return insights

    @staticmethod
    def generate_faculty_summary(faculty_analytics_dict: Dict[str, Any]) -> List[str]:
        """
        Generates dynamic text insights for faculty dashboard widgets.
        """
        insights = []

        class_avg = faculty_analytics_dict.get("class_avg_pct", 0.0)
        at_risk = faculty_analytics_dict.get("at_risk_count", 0)
        worst_sub_name = faculty_analytics_dict.get("worst_subject_name", f"Subject ID {faculty_analytics_dict.get('worst_subject_id', 0)}")
        lowest_day = faculty_analytics_dict.get("lowest_attendance_weekday", "N/A")
        req_pct = settings.REQUIRED_ATTENDANCE_PCT

        insights.append(f"Classroom overall attendance average is currently {class_avg}%.")
        insights.append(f"{at_risk} student(s) are projected to fall below the required {req_pct}% threshold.")

        if worst_sub_name != "N/A":
            insights.append(f"{worst_sub_name} has the lowest attendance rate in your assigned subjects.")

        if lowest_day != "N/A":
            insights.append(f"Classroom attendance drops lowest on {lowest_day} lectures.")

        return insights
