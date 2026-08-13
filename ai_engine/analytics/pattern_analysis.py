import sys
from pathlib import Path
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from analytics.trend_analysis import TrendAnalyzer
from utils.logger import get_logger
from utils.helpers import calculate_percentage

logger = get_logger(__name__)

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

class PatternAnalyzer:
    """
    Module 3: Attendance Pattern Analysis Engine.
    Identifies frequently absent weekdays, worst performing subjects, calendar holiday boundary drops,
    and integrated trend momentum.
    """

    @staticmethod
    def analyze_student_patterns(
        df_clean: pd.DataFrame,
        df_calendar: Optional[pd.DataFrame] = None
    ) -> Dict[str, Any]:
        """
        Analyzes attendance logs for a single student to uncover temporal, subject, and holiday patterns.

        Args:
            df_clean (pd.DataFrame): Cleaned attendance DataFrame.
            df_calendar (pd.DataFrame, optional): Academic calendar holiday DataFrame.

        Returns:
            Dict[str, Any]: Pattern analysis dictionary.
        """
        if df_clean is None or df_clean.empty or len(df_clean) < 3:
            logger.warning("Insufficient attendance data passed to PatternAnalyzer. Returning default pattern structure.")
            return PatternAnalyzer._get_default_pattern()

        # ----------------------------------------------------
        # 1. FREQUENTLY ABSENT WEEKDAY DETECTION (ALL 7 DAYS)
        # ----------------------------------------------------
        day_counts = df_clean.groupby("day_of_week")["is_absent"].agg(["sum", "count"]).reset_index()
        day_counts["absence_rate"] = (day_counts["sum"] / day_counts["count"]) * 100.0
        
        worst_day_row = day_counts.sort_values(by="absence_rate", ascending=False).iloc[0]
        worst_day_idx = int(worst_day_row["day_of_week"])
        most_absent_weekday = DAY_NAMES[worst_day_idx] if worst_day_idx < len(DAY_NAMES) else "Unknown"
        worst_day_absence_rate = round(float(worst_day_row["absence_rate"]), 2)

        # ----------------------------------------------------
        # 2. SUBJECT-WISE ABSENCE ANALYSIS
        # ----------------------------------------------------
        subject_grouped = df_clean.groupby("subject_id")["is_absent"].agg(["sum", "count"]).reset_index()
        subject_grouped["absence_rate"] = (subject_grouped["sum"] / subject_grouped["count"]) * 100.0
        subject_grouped["attendance_rate"] = 100.0 - subject_grouped["absence_rate"]

        worst_sub_row = subject_grouped.sort_values(by="absence_rate", ascending=False).iloc[0]
        worst_subject_id = int(worst_sub_row["subject_id"])
        worst_subject_attendance_pct = round(float(worst_sub_row["attendance_rate"]), 2)

        # ----------------------------------------------------
        # 3. REAL CALENDAR-DRIVEN HOLIDAY EFFECT ANALYSIS (FIX 6 & FIX 7)
        # ----------------------------------------------------
        holiday_effect_summary = "Insufficient calendar data for holiday effect analysis."
        pre_holiday_drop_pct = 0.0
        post_holiday_drop_pct = 0.0

        if df_calendar is not None and not df_calendar.empty and "is_holiday" in df_calendar.columns:
            holiday_dates = pd.to_datetime(df_calendar[df_calendar["is_holiday"] == 1]["date"]).tolist()
            
            if holiday_dates:
                df_sorted = df_clean.sort_values(by="date").copy()
                
                # Fix 7: Compute baseline attendance percentage on normal teaching days EXCLUDING holiday window dates
                window_dates = set()
                for h_date in holiday_dates:
                    window_dates.update(pd.date_range(h_date - pd.Timedelta(days=3), h_date + pd.Timedelta(days=3)))

                normal_df = df_sorted[~df_sorted["date"].isin(window_dates)]
                if not normal_df.empty:
                    baseline_attendance_pct = calculate_percentage(normal_df["is_present"].sum(), len(normal_df))
                else:
                    baseline_attendance_pct = calculate_percentage(df_clean["is_present"].sum(), len(df_clean))

                pre_holiday_records = []
                post_holiday_records = []

                for h_date in holiday_dates:
                    pre_window = df_sorted[(df_sorted["date"] >= (h_date - pd.Timedelta(days=3))) & (df_sorted["date"] < h_date)]
                    post_window = df_sorted[(df_sorted["date"] > h_date) & (df_sorted["date"] <= (h_date + pd.Timedelta(days=3)))]
                    
                    if not pre_window.empty:
                        pre_holiday_records.append(pre_window)
                    if not post_window.empty:
                        post_holiday_records.append(post_window)

                # Fix 6: Deduplicate records pooled across overlapping holiday windows
                dedup_col = "attendance_id" if "attendance_id" in df_sorted.columns else "date"

                if pre_holiday_records:
                    pre_df = pd.concat(pre_holiday_records).drop_duplicates(subset=[dedup_col])
                    pre_pct = calculate_percentage(pre_df["is_present"].sum(), len(pre_df))
                    pre_holiday_drop_pct = round(max(0.0, baseline_attendance_pct - pre_pct), 2)

                if post_holiday_records:
                    post_df = pd.concat(post_holiday_records).drop_duplicates(subset=[dedup_col])
                    post_pct = calculate_percentage(post_df["is_present"].sum(), len(post_df))
                    post_holiday_drop_pct = round(max(0.0, baseline_attendance_pct - post_pct), 2)

                holiday_effect_summary = (
                    f"Attendance decreases by approximately {pre_holiday_drop_pct} percentage points before holidays "
                    f"and {post_holiday_drop_pct} percentage points after holidays compared to baseline ({baseline_attendance_pct}%)."
                )

        # ----------------------------------------------------
        # 4. INTEGRATED TREND ANALYZER MOMENTUM
        # ----------------------------------------------------
        momentum = TrendAnalyzer.calculate_monthly_momentum(df_clean)
        rolling_trends = TrendAnalyzer.calculate_rolling_trend(df_clean, window=7)

        df_clean_copy = df_clean.copy()
        df_clean_copy["week_num"] = df_clean_copy["date"].dt.isocalendar().week
        weekly_stats = df_clean_copy.groupby("week_num")["is_present"].mean() * 100.0
        weekly_trends = {f"Week_{int(w)}": round(float(val), 2) for w, val in weekly_stats.items()}

        df_clean_copy["month_name"] = df_clean_copy["date"].dt.month_name()
        monthly_stats = df_clean_copy.groupby("month_name")["is_present"].mean() * 100.0
        monthly_trends = {str(m): round(float(val), 2) for m, val in monthly_stats.items()}

        patterns = {
            "most_absent_weekday": most_absent_weekday,
            "worst_day_absence_rate": worst_day_absence_rate,
            "worst_performing_subject_id": worst_subject_id,
            "worst_subject_attendance_pct": worst_subject_attendance_pct,
            "pre_holiday_drop_pct": pre_holiday_drop_pct,
            "post_holiday_drop_pct": post_holiday_drop_pct,
            "holiday_weekend_drop_pct": pre_holiday_drop_pct,  # Backwards compatibility key
            "holiday_effect_summary": holiday_effect_summary,
            "trend_direction": momentum.get("direction", "STABLE"),
            "month_over_month_change_pct": momentum.get("month_over_month_change_pct", 0.0),
            "weekly_trends": weekly_trends,
            "monthly_trends": monthly_trends,
            "rolling_trends": rolling_trends[:10],
            "is_pattern_reliable": True
        }

        logger.info(f"Pattern Analysis completed: Most Absent Weekday={most_absent_weekday}, Trend={momentum.get('direction')}.")
        return patterns

    @staticmethod
    def _get_default_pattern() -> Dict[str, Any]:
        """
        Default pattern structure for missing or insufficient attendance datasets.
        """
        return {
            "most_absent_weekday": "N/A",
            "worst_day_absence_rate": 0.0,
            "worst_performing_subject_id": 0,
            "worst_subject_attendance_pct": 0.0,
            "pre_holiday_drop_pct": 0.0,
            "post_holiday_drop_pct": 0.0,
            "holiday_weekend_drop_pct": 0.0,
            "holiday_effect_summary": "Insufficient attendance history for reliable pattern analysis.",
            "trend_direction": "STABLE",
            "month_over_month_change_pct": 0.0,
            "weekly_trends": {},
            "monthly_trends": {},
            "rolling_trends": [],
            "is_pattern_reliable": False
        }
