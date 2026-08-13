import sys
from pathlib import Path
import pandas as pd
from typing import Dict, Any, List, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.logger import get_logger
from utils.helpers import calculate_percentage, determine_risk_level

logger = get_logger(__name__)

class FacultyAnalytics:
    """
    Module 5: Faculty Analytics Engine.
    Generates classroom insights, class averages, at-risk student counts,
    and subject statistics for faculty members.
    
    Rule: Never falls back to department-wide defaults if faculty has no assigned subjects.
    """

    @staticmethod
    def generate_classroom_insights(
        df_dept_attendance: pd.DataFrame,
        predictions_list: Optional[List[Dict[str, Any]]] = None,
        faculty_id: int = 1,
        subject_names_map: Optional[Dict[int, str]] = None
    ) -> Dict[str, Any]:
        """
        Generates classroom analytics strictly for subjects assigned to a specific faculty member.
        """
        if df_dept_attendance is None or df_dept_attendance.empty or not subject_names_map:
            logger.info(f"No assigned subject attendance logs found for faculty_id={faculty_id}. Returning controlled default faculty analytics.")
            return FacultyAnalytics._get_default_faculty_analytics(faculty_id)

        sub_map = subject_names_map
        total_records = len(df_dept_attendance)
        total_present = int(df_dept_attendance["is_present"].sum())
        class_avg_pct = calculate_percentage(total_present, total_records)

        # ----------------------------------------------------
        # 1. AT-RISK STUDENTS COUNT & RISK DISTRIBUTION
        # ----------------------------------------------------
        at_risk_count = 0
        risk_distribution = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}

        if predictions_list:
            for pred in predictions_list:
                r_level = pred.get("risk_level", "LOW")
                risk_distribution[r_level] = risk_distribution.get(r_level, 0) + 1
                if r_level in ("HIGH", "CRITICAL"):
                    at_risk_count += 1
        else:
            from config import settings
            student_stats = df_dept_attendance.groupby("student_id")["is_present"].agg(["sum", "count"])
            student_stats["pct"] = (student_stats["sum"] / student_stats["count"]) * 100.0
            for pct in student_stats["pct"]:
                r_level = determine_risk_level(pct, threshold=settings.REQUIRED_ATTENDANCE_PCT)
                risk_distribution[r_level] = risk_distribution.get(r_level, 0) + 1
                if r_level in ("HIGH", "CRITICAL"):
                    at_risk_count += 1

        # ----------------------------------------------------
        # 2. WORST & BEST PERFORMING SUBJECT FOR FACULTY
        # ----------------------------------------------------
        subject_stats = df_dept_attendance.groupby("subject_id")["is_present"].agg(["sum", "count"]).reset_index()
        subject_stats["pct"] = (subject_stats["sum"] / subject_stats["count"]) * 100.0
        
        worst_sub_row = subject_stats.sort_values(by="pct", ascending=True).iloc[0]
        worst_subject_id = int(worst_sub_row["subject_id"])
        worst_subject_pct = round(float(worst_sub_row["pct"]), 2)
        worst_subject_name = sub_map.get(worst_subject_id, f"Subject ID {worst_subject_id}")

        best_sub_row = subject_stats.sort_values(by="pct", ascending=False).iloc[0]
        best_subject_id = int(best_sub_row["subject_id"])
        best_subject_pct = round(float(best_sub_row["pct"]), 2)
        best_subject_name = sub_map.get(best_subject_id, f"Subject ID {best_subject_id}")

        # ----------------------------------------------------
        # 3. LOWEST ATTENDANCE WEEKDAY
        # ----------------------------------------------------
        day_stats = df_dept_attendance.groupby("day_name")["is_present"].agg(["sum", "count"]).reset_index()
        day_stats["pct"] = (day_stats["sum"] / day_stats["count"]) * 100.0
        worst_day = str(day_stats.sort_values(by="pct", ascending=True).iloc[0]["day_name"])

        result = {
            "faculty_id": faculty_id,
            "class_avg_pct": class_avg_pct,
            "at_risk_count": at_risk_count,
            "risk_distribution": risk_distribution,
            "worst_subject_id": worst_subject_id,
            "worst_subject_name": worst_subject_name,
            "worst_subject_pct": worst_subject_pct,
            "best_subject_id": best_subject_id,
            "best_subject_name": best_subject_name,
            "best_subject_pct": best_subject_pct,
            "lowest_attendance_weekday": worst_day,
            "total_students_evaluated": len(predictions_list) if predictions_list else len(df_dept_attendance["student_id"].unique())
        }

        logger.info(f"Generated Faculty Analytics for faculty_id={faculty_id}: Avg={class_avg_pct}%, At-Risk={at_risk_count}.")
        return result

    @staticmethod
    def _get_default_faculty_analytics(faculty_id: int = 1) -> Dict[str, Any]:
        """
        Default zero-value faculty analytics for unassigned or empty faculty profiles.
        """
        return {
            "faculty_id": faculty_id,
            "class_avg_pct": 0.0,
            "at_risk_count": 0,
            "risk_distribution": {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0},
            "worst_subject_id": 0,
            "worst_subject_name": "N/A",
            "worst_subject_pct": 0.0,
            "best_subject_id": 0,
            "best_subject_name": "N/A",
            "best_subject_pct": 0.0,
            "lowest_attendance_weekday": "N/A",
            "total_students_evaluated": 0
        }
