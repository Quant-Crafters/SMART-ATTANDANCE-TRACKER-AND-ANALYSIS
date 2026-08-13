import sys
from pathlib import Path
import pandas as pd
from typing import Dict, Any, List

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)

class TrendAnalyzer:
    """
    Time-series trend and momentum analyzer.
    """

    @staticmethod
    def calculate_rolling_trend(df_clean: pd.DataFrame, window: int = 14) -> List[Dict[str, Any]]:
        """
        Calculates a rolling window attendance average.
        """
        if df_clean.empty:
            return []

        df_sorted = df_clean.sort_values(by="date").copy()
        df_sorted["rolling_avg"] = df_sorted["is_present"].rolling(window=window, min_periods=1).mean() * 100.0

        results = []
        for _, row in df_sorted.iterrows():
            results.append({
                "date": row["date"].strftime("%Y-%m-%d"),
                "status": row["status"],
                "rolling_avg_pct": round(float(row["rolling_avg"]), 2)
            })

        return results

    @staticmethod
    def calculate_monthly_momentum(df_clean: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculates month-over-month percentage change in attendance.
        """
        if df_clean.empty:
            return {"month_over_month_change_pct": 0.0, "direction": "STABLE"}

        df_sorted = df_clean.sort_values(by="date").copy()
        df_sorted["year_month"] = df_sorted["date"].dt.to_period("M")
        monthly_avg = df_sorted.groupby("year_month")["is_present"].mean() * 100.0

        if len(monthly_avg) < 2:
            return {"month_over_month_change_pct": 0.0, "direction": "STABLE"}

        last_month = monthly_avg.iloc[-1]
        prev_month = monthly_avg.iloc[-2]
        mom_change = round(float(last_month - prev_month), 2)

        direction = "IMPROVING" if mom_change > 2.0 else ("DECLINING" if mom_change < -2.0 else "STABLE")

        return {
            "last_month_pct": round(float(last_month), 2),
            "previous_month_pct": round(float(prev_month), 2),
            "month_over_month_change_pct": mom_change,
            "direction": direction
        }
