import sys
from pathlib import Path
import pandas as pd

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)

class DataCleaner:
    """
    Sanitizes raw attendance DataFrames, encodes status values, and removes anomalies.
    """

    @staticmethod
    def clean_attendance_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Cleans attendance DataFrame by:
        1. Dropping exact duplicate check-ins.
        2. Standardizing status column strings.
        3. Encoding status binary indicators (is_present, is_absent, is_excused).
        4. Extracting temporal features (day_of_week, month, is_weekend).
        """
        if df.empty:
            df["is_present"] = 0
            df["is_absent"] = 0
            df["is_excused"] = 0
            df["day_of_week"] = 0
            df["month"] = 0
            return df

        cleaned_df = df.copy()

        # Deduplicate: Only drop if identical attendance_id OR exact same student+subject+date when attendance_id is missing
        if "attendance_id" in cleaned_df.columns and cleaned_df["attendance_id"].notnull().any():
            cleaned_df.drop_duplicates(subset=["attendance_id"], keep="last", inplace=True)
        else:
            cleaned_df.drop_duplicates(subset=["student_id", "subject_id", "date"], keep="last", inplace=True)

        # Standardize Status
        cleaned_df["status"] = cleaned_df["status"].astype(str).str.upper().str.strip()

        # Explicit Attendance Calculation Policy:
        # PRESENT / LATE -> attended (is_present = 1)
        # ABSENT -> unexcused absent (is_absent = 1)
        # EXCUSED -> excused absent / leave (is_excused = 1)
        cleaned_df["is_present"] = cleaned_df["status"].apply(lambda x: 1 if x in ("PRESENT", "LATE") else 0)
        cleaned_df["is_absent"] = cleaned_df["status"].apply(lambda x: 1 if x == "ABSENT" else 0)
        cleaned_df["is_excused"] = cleaned_df["status"].apply(lambda x: 1 if x == "EXCUSED" else 0)

        # Temporal Metadata Extraction
        cleaned_df["date"] = pd.to_datetime(cleaned_df["date"])
        cleaned_df["day_of_week"] = cleaned_df["date"].dt.dayofweek  # 0=Monday, 6=Sunday
        cleaned_df["day_name"] = cleaned_df["date"].dt.day_name()
        cleaned_df["month"] = cleaned_df["date"].dt.month
        cleaned_df["is_weekend"] = cleaned_df["day_of_week"].apply(lambda x: 1 if x >= 5 else 0)

        logger.info(f"Cleaned {len(cleaned_df)} attendance records successfully.")
        return cleaned_df
