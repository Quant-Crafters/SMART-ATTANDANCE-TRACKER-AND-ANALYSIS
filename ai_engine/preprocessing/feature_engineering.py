import sys
from pathlib import Path
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.synthetic_provider import SyntheticTrainingDataProvider
from utils.helpers import calculate_percentage
from utils.logger import get_logger

logger = get_logger(__name__)

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

class FeatureEngineer:
    """
    Computes statistical feature matrices for ML prediction models and analytics engines.
    
    EXCUSED ATTENDANCE POLICY (SINGLE SOURCE OF TRUTH):
    - Denominator total_conducted = len(df_clean) = PRESENT + LATE + ABSENT + EXCUSED.
    - Attended classes_attended = PRESENT + LATE.
    - Attendance Percentage = (classes_attended / total_conducted) * 100.0.
    - Excused classes_excused = EXCUSED (tracked separately as approved leave).
    """

    @staticmethod
    def extract_student_features(
        df_clean: pd.DataFrame,
        df_leaves: Optional[pd.DataFrame] = None,
        total_semester_classes: Optional[int] = None,
        subject_names_map: Optional[Dict[int, str]] = None
    ) -> Dict[str, Any]:
        """
        Extracts a comprehensive feature vector for a single student.

        Args:
            df_clean (pd.DataFrame): Cleaned attendance DataFrame output by DataCleaner.
            df_leaves (pd.DataFrame, optional): Leave history DataFrame.
            total_semester_classes (int, optional): Total expected actual classes in semester (derived from academic schedule if None).
            subject_names_map (Dict[int, str], optional): Mapping from subject_id to subject_name string.

        Returns:
            Dict[str, Any]: Feature dictionary containing overall, subject-level, rolling trend,
                            and leave-impact metrics.
        """
        if total_semester_classes is None:
            total_semester_classes = SyntheticTrainingDataProvider().get_total_actual_semester_sessions()

        if df_clean is None or df_clean.empty or len(df_clean) < 3:
            logger.warning("Insufficient attendance logs (<3 records). Returning default zero features with is_data_sufficient=False.")
            defaults = FeatureEngineer._get_default_features(total_semester_classes)
            if df_clean is not None and not df_clean.empty:
                defaults["student_id"] = int(df_clean["student_id"].iloc[0])
                defaults["total_conducted"] = len(df_clean)
                defaults["classes_attended"] = int(df_clean["is_present"].sum())
                defaults["classes_absent"] = int(df_clean["is_absent"].sum())
                defaults["classes_excused"] = int(df_clean["is_excused"].sum())
                defaults["current_attendance_pct"] = calculate_percentage(defaults["classes_attended"], defaults["total_conducted"])
                defaults["remaining_classes"] = max(0, total_semester_classes - defaults["total_conducted"])
            defaults["is_data_sufficient"] = False
            return defaults

        student_id = int(df_clean["student_id"].iloc[0])
        total_conducted = len(df_clean)
        classes_attended = int(df_clean["is_present"].sum())
        classes_absent = int(df_clean["is_absent"].sum())
        classes_excused = int(df_clean["is_excused"].sum())

        current_attendance_pct = calculate_percentage(classes_attended, total_conducted)
        remaining_classes = max(0, total_semester_classes - total_conducted)

        # ----------------------------------------------------
        # 1. LEAVE METRICS
        # ----------------------------------------------------
        leave_record_count = 0
        leave_days = 0
        if df_leaves is not None and not df_leaves.empty:
            leave_record_count = len(df_leaves)
            if "leave_days" in df_leaves.columns:
                leave_days = int(df_leaves["leave_days"].sum())
            else:
                leave_days = leave_record_count

        total_missed = classes_absent + classes_excused
        leave_to_absence_ratio = calculate_percentage(classes_excused, total_missed) if total_missed > 0 else 100.0

        # ----------------------------------------------------
        # 2. RECENT 3-WEEK TREND ANALYSIS
        # ----------------------------------------------------
        df_sorted = df_clean.sort_values(by="date", ascending=True).copy()
        max_date = df_sorted["date"].max()
        three_weeks_ago = max_date - pd.Timedelta(days=21)

        recent_df = df_sorted[df_sorted["date"] >= three_weeks_ago]
        if not recent_df.empty:
            recent_attended = recent_df["is_present"].sum()
            recent_conducted = len(recent_df)
            recent_attendance_pct = calculate_percentage(recent_attended, recent_conducted)
            recent_3week_trend = round(recent_attendance_pct - current_attendance_pct, 2)
        else:
            recent_attendance_pct = current_attendance_pct
            recent_3week_trend = 0.0

        # ----------------------------------------------------
        # 3. CURRENT vs MAX CONSECUTIVE ABSENCES
        # ----------------------------------------------------
        statuses = df_sorted["is_absent"].tolist()
        
        current_consecutive_absences = 0
        for status in reversed(statuses):
            if status == 1:
                current_consecutive_absences += 1
            else:
                break

        max_consecutive_absences = 0
        current_streak = 0
        for status in statuses:
            if status == 1:
                current_streak += 1
                if current_streak > max_consecutive_absences:
                    max_consecutive_absences = current_streak
            else:
                current_streak = 0

        # ----------------------------------------------------
        # 4. SUBJECT-WISE ANALYSIS & NAMES
        # ----------------------------------------------------
        subject_grouped = df_clean.groupby("subject_id")["is_present"].agg(["sum", "count"])
        subject_grouped["pct"] = (subject_grouped["sum"] / subject_grouped["count"]) * 100.0

        if not subject_grouped.empty:
            worst_sub_id = int(subject_grouped["pct"].idxmin())
            worst_subject_pct = round(float(subject_grouped.loc[worst_sub_id, "pct"]), 2)
            
            best_sub_id = int(subject_grouped["pct"].idxmax())
            best_subject_pct = round(float(subject_grouped.loc[best_sub_id, "pct"]), 2)

            average_subject_attendance = round(float(subject_grouped["pct"].mean()), 2)
            subject_attendance_std = round(float(subject_grouped["pct"].std()), 2) if len(subject_grouped) > 1 else 0.0
        else:
            worst_sub_id = 0
            worst_subject_pct = current_attendance_pct
            best_sub_id = 0
            best_subject_pct = current_attendance_pct
            average_subject_attendance = current_attendance_pct
            subject_attendance_std = 0.0

        sub_map = subject_names_map or {}
        worst_subject_name = sub_map.get(worst_sub_id, f"Subject ID {worst_sub_id}" if worst_sub_id > 0 else "N/A")
        best_subject_name = sub_map.get(best_sub_id, f"Subject ID {best_sub_id}" if best_sub_id > 0 else "N/A")

        # ----------------------------------------------------
        # 5. ALL 7 WEEKDAYS ABSENCE ANALYSIS (GENERALIZED METRICS)
        # ----------------------------------------------------
        day_grouped = df_clean.groupby("day_of_week")["is_absent"].agg(["sum", "count"])
        day_grouped["absence_rate"] = (day_grouped["sum"] / day_grouped["count"]) * 100.0
        
        if not day_grouped.empty:
            worst_day_idx = int(day_grouped["absence_rate"].idxmax())
            most_absent_day = DAY_NAMES[worst_day_idx] if worst_day_idx < len(DAY_NAMES) else "N/A"
            most_absent_day_rate = round(float(day_grouped.loc[worst_day_idx, "absence_rate"]), 2)
        else:
            most_absent_day = "N/A"
            most_absent_day_rate = 0.0

        features = {
            "student_id": student_id,
            "current_attendance_pct": current_attendance_pct,
            "total_conducted": total_conducted,
            "classes_attended": classes_attended,
            "classes_absent": classes_absent,
            "classes_excused": classes_excused,
            "remaining_classes": remaining_classes,
            "leave_record_count": leave_record_count,
            "leave_days": leave_days,
            "leave_to_absence_ratio": leave_to_absence_ratio,
            "recent_attendance_pct": recent_attendance_pct,
            "recent_3week_trend": recent_3week_trend,
            "current_consecutive_absences": current_consecutive_absences,
            "max_consecutive_absences": max_consecutive_absences,
            "consecutive_absences": current_consecutive_absences,  # Backwards compatibility key
            "worst_subject_id": worst_sub_id,
            "worst_subject_name": worst_subject_name,
            "worst_subject_pct": worst_subject_pct,
            "best_subject_id": best_sub_id,
            "best_subject_name": best_subject_name,
            "best_subject_pct": best_subject_pct,
            "average_subject_attendance": average_subject_attendance,
            "subject_attendance_std": subject_attendance_std,
            "most_absent_day": most_absent_day,  # Human-readable string for XAI/Reports
            "most_absent_day_rate": most_absent_day_rate,  # Generalized numerical feature for ML
            "is_data_sufficient": True
        }

        logger.info(f"Extracted {len(features)} features for student_id={student_id} (Current: {current_attendance_pct}%, Remaining: {remaining_classes}).")
        return features

    @staticmethod
    def _get_default_features(total_semester_classes: Optional[int] = None) -> Dict[str, Any]:
        """
        Default zero-value feature vector for empty/new student profiles.
        """
        if total_semester_classes is None:
            total_semester_classes = SyntheticTrainingDataProvider().get_total_actual_semester_sessions()
        return {
            "student_id": 0,
            "current_attendance_pct": 0.0,
            "total_conducted": 0,
            "classes_attended": 0,
            "classes_absent": 0,
            "classes_excused": 0,
            "remaining_classes": total_semester_classes,
            "leave_record_count": 0,
            "leave_days": 0,
            "leave_to_absence_ratio": 0.0,
            "recent_attendance_pct": 0.0,
            "recent_3week_trend": 0.0,
            "current_consecutive_absences": 0,
            "max_consecutive_absences": 0,
            "consecutive_absences": 0,
            "worst_subject_id": 0,
            "worst_subject_name": "N/A",
            "worst_subject_pct": 0.0,
            "best_subject_id": 0,
            "best_subject_name": "N/A",
            "best_subject_pct": 0.0,
            "average_subject_attendance": 0.0,
            "subject_attendance_std": 0.0,
            "most_absent_day": "N/A",
            "most_absent_day_rate": 0.0,
            "is_data_sufficient": False
        }
