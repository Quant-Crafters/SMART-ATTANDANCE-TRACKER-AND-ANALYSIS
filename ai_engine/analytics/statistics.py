import sys
from pathlib import Path
import numpy as np
import pandas as pd
from typing import Dict, Any, List

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)

class AttendanceStatistics:
    """
    Descriptive statistical distribution calculations for attendance series.
    """

    @staticmethod
    def calculate_distribution_stats(attendance_pct_list: List[float]) -> Dict[str, float]:
        """
        Calculates mean, median, stddev, min, max, and quartiles for a list of attendance percentages.
        """
        if not attendance_pct_list:
            return {
                "mean": 0.0,
                "median": 0.0,
                "std_dev": 0.0,
                "min": 0.0,
                "max": 0.0,
                "p25": 0.0,
                "p75": 0.0
            }

        arr = np.array(attendance_pct_list)
        return {
            "mean": round(float(np.mean(arr)), 2),
            "median": round(float(np.median(arr)), 2),
            "std_dev": round(float(np.std(arr)), 2),
            "min": round(float(np.min(arr)), 2),
            "max": round(float(np.max(arr)), 2),
            "p25": round(float(np.percentile(arr, 25)), 2),
            "p75": round(float(np.percentile(arr, 75)), 2)
        }
