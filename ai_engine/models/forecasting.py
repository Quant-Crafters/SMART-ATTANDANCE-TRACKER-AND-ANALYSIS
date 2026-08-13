import sys
import math
from pathlib import Path
from typing import Dict, Any, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from database.synthetic_provider import SyntheticTrainingDataProvider
from utils.logger import get_logger

logger = get_logger(__name__)

class AttendanceForecaster:
    """
    Forecasting & scenario analysis tool to compute classes needed or safe absences.
    Uses centralized REQUIRED_ATTENDANCE_PCT criterion by default.
    """

    @staticmethod
    def calculate_classes_needed(
        classes_attended: int,
        total_conducted: int,
        target_pct: float = settings.REQUIRED_ATTENDANCE_PCT,
        total_semester_classes: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Calculates consecutive future lectures a student must attend to reach target_pct.
        Derives total expected actual classes from authoritative academic schedule if None.
        """
        if total_semester_classes is None:
            total_semester_classes = SyntheticTrainingDataProvider().get_total_actual_semester_sessions()

        current_pct = (classes_attended / total_conducted * 100.0) if total_conducted > 0 else 0.0
        remaining_classes = max(0, total_semester_classes - total_conducted)

        if current_pct >= target_pct:
            # How many classes can student miss while keeping >= target_pct?
            # (classes_attended / (total_conducted + X)) >= (target_pct / 100)
            max_missable = math.floor((classes_attended * 100.0 / target_pct) - total_conducted)
            max_missable = max(0, max_missable)
            return {
                "current_pct": round(current_pct, 2),
                "target_pct": target_pct,
                "classes_needed": 0,
                "max_missable_classes": max_missable,
                "is_target_achieved": True,
                "is_achievable": True,
                "remaining_classes": remaining_classes
            }

        # Solving: (classes_attended + X) / (total_conducted + X) >= (target_pct / 100)
        # 100 * (classes_attended + X) >= target_pct * (total_conducted + X)
        # X * (100 - target_pct) >= target_pct * total_conducted - 100 * classes_attended
        numerator = (target_pct * total_conducted) - (100.0 * classes_attended)
        denominator = 100.0 - target_pct

        if denominator <= 0:
            classes_needed = 999
        else:
            classes_needed = math.ceil(numerator / denominator)

        classes_needed = max(0, classes_needed)
        is_achievable = classes_needed <= remaining_classes

        return {
            "current_pct": round(current_pct, 2),
            "target_pct": target_pct,
            "classes_needed": classes_needed,
            "max_missable_classes": 0,
            "is_target_achieved": False,
            "is_achievable": is_achievable,
            "remaining_classes": remaining_classes
        }
