from enum import Enum

class RiskLevel(str, Enum):
    """
    Standardized Attendance Risk Categories.
    """
    LOW = "LOW"             # >= 80% predicted
    MEDIUM = "MEDIUM"       # 75% - 79.9% predicted
    HIGH = "HIGH"           # 65% - 74.9% predicted
    CRITICAL = "CRITICAL"   # < 65% predicted

class AttendanceStatus(str, Enum):
    """
    Attendance Record Status Enum matching DB values.
    """
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"

# Threshold Constants
DEFAULT_REQUIRED_ATTENDANCE_PCT = 75.0
HIGH_RISK_THRESHOLD = 75.0
CRITICAL_RISK_THRESHOLD = 65.0
EXCELLENT_ATTENDANCE_THRESHOLD = 85.0

# Authoritative Academic Schedule Constants for Synthetic / Development Mode
TOTAL_SEMESTER_WEEKS = 10
TEACHING_DAYS_PER_WEEK = 5
CLASSES_PER_TEACHING_DAY = 2
DEFAULT_TOTAL_SEMESTER_SESSIONS = TOTAL_SEMESTER_WEEKS * TEACHING_DAYS_PER_WEEK * CLASSES_PER_TEACHING_DAY  # 100 sessions
