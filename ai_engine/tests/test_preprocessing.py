import sys
import unittest
import pandas as pd
from pathlib import Path

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from preprocessing.clean_data import DataCleaner
from preprocessing.validator import DataValidator, DataValidationError
from preprocessing.feature_engineering import FeatureEngineer
from database.synthetic_provider import SyntheticTrainingDataProvider
from models.training import ModelTrainer

class TestPreprocessingLayer(unittest.TestCase):
    """
    Unit tests for preprocessing layer, schedule totals after holidays, future leave leakage prevention,
    synthetic leave mapping to EXCUSED, and validator fatal error handling.
    """

    def setUp(self):
        self.raw_data = pd.DataFrame([
            {"attendance_id": 1, "student_id": 1, "subject_id": 101, "date": "2026-08-01", "status": "PRESENT"},
            {"attendance_id": 2, "student_id": 1, "subject_id": 101, "date": "2026-08-02", "status": "ABSENT"},
            {"attendance_id": 3, "student_id": 1, "subject_id": 102, "date": "2026-08-03", "status": "PRESENT"},
            {"attendance_id": 4, "student_id": 1, "subject_id": 102, "date": "2026-08-04", "status": "ABSENT"},
            {"attendance_id": 5, "student_id": 1, "subject_id": 101, "date": "2026-08-05", "status": "EXCUSED"}
        ])

    def test_exact_10_week_schedule_and_holiday_cancellations(self):
        """Fix 1: Test 10 weeks exclusive boundary = 100 scheduled sessions before holiday removal, 90 actual sessions after."""
        provider = SyntheticTrainingDataProvider(random_seed=42)
        scheduled = provider.get_total_scheduled_sessions(num_weeks=10)
        actual = provider.get_total_actual_semester_sessions(start_date_str="2026-08-03", num_weeks=10)
        
        # 10 weeks * 5 days/week * 2 sessions/day = 100 scheduled sessions
        self.assertEqual(scheduled, 100)
        # 5 Mon-Fri holidays * 2 sessions/day = 10 cancelled sessions -> 90 actual semester sessions
        self.assertEqual(actual, 90)

    def test_synthetic_leave_creates_excused_attendance(self):
        """Fix 6: Test approved synthetic leave overlapping scheduled classes generates EXCUSED status."""
        provider = SyntheticTrainingDataProvider(random_seed=42)
        dataset = provider.generate_full_synthetic_dataset(num_students=10, num_weeks=4)
        df_att = dataset["attendance"]
        
        s5_att = df_att[(df_att["student_id"] == 5) & (df_att["date"] >= "2026-08-10") & (df_att["date"] <= "2026-08-12")]
        self.assertGreater(len(s5_att), 0)
        self.assertTrue((s5_att["status"] == "EXCUSED").all(), "All scheduled classes during approved student leave must be EXCUSED")

    def test_future_leave_leakage_in_training_pipeline(self):
        """Fix 3 & Change 7: Prove future Week 8 leave does NOT leak into Week 3 training snapshot features."""
        student_att = pd.DataFrame([
            {"attendance_id": i, "student_id": 1, "subject_id": 101, "date": pd.to_datetime(d), "status": "PRESENT", "is_present": 1, "is_absent": 0, "is_excused": 0, "day_of_week": 0, "day_name": "Monday"}
            for i, d in enumerate(["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-10", "2026-08-11", "2026-08-17", "2026-08-18"], 1)
        ])

        # Leave A (Week 2 - Aug 10 to Aug 12)
        leaves_dataset_A = pd.DataFrame([
            {"leave_id": 1, "student_id": 1, "start_date": pd.to_datetime("2026-08-10"), "end_date": pd.to_datetime("2026-08-12"), "leave_days": 3}
        ])

        # Leave A (Week 2) + Future Leave B (Week 8 - Sept 20 to Sept 25)
        leaves_dataset_B = pd.DataFrame([
            {"leave_id": 1, "student_id": 1, "start_date": pd.to_datetime("2026-08-10"), "end_date": pd.to_datetime("2026-08-12"), "leave_days": 3},
            {"leave_id": 2, "student_id": 1, "start_date": pd.to_datetime("2026-09-20"), "end_date": pd.to_datetime("2026-09-25"), "leave_days": 6}
        ])

        cutoff_week3 = pd.to_datetime("2026-08-21")

        # Invoke actual training snapshot pipeline feature builder
        snapshot_A = ModelTrainer.build_snapshot_features(student_att, leaves_dataset_A, cutoff_week3, total_actual_classes=90)
        snapshot_B = ModelTrainer.build_snapshot_features(student_att, leaves_dataset_B, cutoff_week3, total_actual_classes=90)

        self.assertIsNotNone(snapshot_A)
        self.assertIsNotNone(snapshot_B)

        # Assert feature vector A == feature vector B (future Leave B had ZERO impact on Week 3 snapshot)
        self.assertEqual(snapshot_A, snapshot_B, "Week 3 training snapshot features must be identical regardless of future Week 8 leave addition")

    def test_clean_data_and_excused_policy(self):
        df_clean = DataCleaner.clean_attendance_data(self.raw_data)
        self.assertEqual(len(df_clean), 5)
        features = FeatureEngineer.extract_student_features(df_clean)
        self.assertEqual(features["total_conducted"], 5)
        self.assertEqual(features["classes_attended"], 2)
        self.assertEqual(features["classes_absent"], 2)
        self.assertEqual(features["classes_excused"], 1)

    def test_data_validator_fatal_errors(self):
        df_clean = DataCleaner.clean_attendance_data(self.raw_data)
        is_valid, is_fatal, fatal_errors, warnings = DataValidator.validate_attendance_dataframe(df_clean)
        self.assertTrue(is_valid)
        self.assertFalse(is_fatal)

        with self.assertRaises(DataValidationError):
            DataValidator.assert_valid(pd.DataFrame())

if __name__ == "__main__":
    unittest.main()
