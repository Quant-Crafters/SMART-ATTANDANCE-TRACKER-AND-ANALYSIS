from typing import Union
from config import settings

def calculate_percentage(part: Union[int, float], total: Union[int, float]) -> float:
    """
    Calculates percentage ratio safely avoiding division by zero.
    """
    if total == 0 or total is None:
        return 0.0
    return round((float(part) / float(total)) * 100.0, 2)

def determine_risk_level(predicted_pct: float, threshold: float = settings.REQUIRED_ATTENDANCE_PCT) -> str:
    """
    Maps a predicted attendance percentage to a risk category.
    
    Args:
        predicted_pct (float): Predicted semester attendance %.
        threshold (float): Required attendance percentage.
        
    Returns:
        str: Risk level ("LOW", "MEDIUM", "HIGH", "CRITICAL").
    """
    if predicted_pct >= (threshold + 5.0):
        return "LOW"
    elif predicted_pct >= threshold:
        return "MEDIUM"
    elif predicted_pct >= (threshold - 10.0):
        return "HIGH"
    else:
        return "CRITICAL"
