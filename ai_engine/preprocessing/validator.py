import sys
from pathlib import Path
import pandas as pd
from typing import List, Tuple

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.logger import get_logger

logger = get_logger(__name__)

class DataValidationError(Exception):
    """Custom exception raised when a fatal data validation failure occurs."""
    def __init__(self, fatal_errors: List[str]):
        self.fatal_errors = fatal_errors
        super().__init__(f"Fatal Data Validation Error: {fatal_errors}")

class DataValidator:
    """
    Validates structure, types, and constraints of preprocessed DataFrames.
    Distinguishes between FATAL ERRORS (stops pipeline) and WARNINGS (allows safe processing).
    """

    @staticmethod
    def validate_attendance_dataframe(df: pd.DataFrame) -> Tuple[bool, bool, List[str], List[str]]:
        """
        Validates presence of required columns, non-empty data, valid date formats, and ID sanity.

        Returns:
            Tuple[bool, bool, List[str], List[str]]: (is_valid, is_fatal, fatal_errors, warnings)
        """
        fatal_errors = []
        warnings = []
        required_cols = {"student_id", "subject_id", "date", "status"}

        if df is None or df.empty:
            fatal_errors.append("DataFrame is empty or None.")
            return False, True, fatal_errors, warnings

        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            fatal_errors.append(f"Missing required columns: {missing_cols}")

        if "student_id" in df.columns and (df["student_id"].isnull().any() or (df["student_id"] <= 0).any()):
            fatal_errors.append("Invalid or missing student_id values detected.")

        if "date" in df.columns and df["date"].isnull().any():
            fatal_errors.append("Missing or unparseable date entries detected.")

        if "status" in df.columns:
            valid_statuses = {"PRESENT", "ABSENT", "LATE", "EXCUSED"}
            invalid_statuses = set(df["status"].astype(str).str.upper().unique()) - valid_statuses
            if invalid_statuses:
                warnings.append(f"Non-standard status values found: {invalid_statuses}")

        is_fatal = len(fatal_errors) > 0
        is_valid = len(fatal_errors) == 0 and len(warnings) == 0

        if is_fatal:
            logger.error(f"Fatal Data Validation Failure: {fatal_errors}")
        elif warnings:
            logger.warning(f"Data Validation Warnings: {warnings}")
            
        return is_valid, is_fatal, fatal_errors, warnings

    @staticmethod
    def assert_valid(df: pd.DataFrame):
        """
        Raises DataValidationError if dataframe has fatal validation issues.
        """
        is_valid, is_fatal, fatal_errors, warnings = DataValidator.validate_attendance_dataframe(df)
        if is_fatal:
            raise DataValidationError(fatal_errors)
