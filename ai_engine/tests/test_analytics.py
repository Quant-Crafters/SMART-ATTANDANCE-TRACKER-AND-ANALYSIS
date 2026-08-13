import sys
import unittest
import pandas as pd
from pathlib import Path

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from preprocessing.clean_data import DataCleaner
from analytics.pattern_analysis import PatternAnalyzer
from analytics.faculty_analytics import FacultyAnalytics
from analytics.statistics import AttendanceStatistics

class TestAnalyticsLayer(unittest.TestCase):
    """
    Unit tests for Pattern Analysis, Holiday baseline calculation, and Faculty Analytics without department fallback.
    """

    def setUp(self):
        raw = pd.DataFrame([
            {"attendance_id": 1, "student_id": 1, "subject_id": 101, "date": "2026-08-11", "status": "ABSENT"},
            {"attendance_id": 2, "student_id": 1, "subject_id": 101, "date": "2026-08-12", "status": "PRESENT"},
            {"attendance_id": 3, "student_id": 1, "subject_id": 101, "date": "2026-08-13", "status": "ABSENT"},
            {"attendance_id": 4, "student_id": 1, "subject_id": 102, "date": "2026-08-17", "status": "PRESENT"}
        ])
        self.df_clean = DataCleaner.clean_attendance_data(raw)
        self.df_calendar = pd.DataFrame([
            {"id": 1, "date": pd.to_datetime("2026-08-14"), "holiday_name": "Independence Day", "is_holiday": 1}
        ])

    def test_holiday_effect_baseline(self):
        """Fix 7: Baseline excludes holiday window dates."""
        patterns = PatternAnalyzer.analyze_student_patterns(self.df_clean, self.df_calendar)
        self.assertIn("holiday_effect_summary", patterns)
        self.assertIn("pre_holiday_drop_pct", patterns)

    def test_faculty_analytics_no_department_fallback(self):
        """Fix 5: Faculty with no assigned subjects returns controlled empty result without department fallback."""
        # Unassigned faculty (empty subject_names_map)
        fac_unassigned = FacultyAnalytics.generate_classroom_insights(
            df_dept_attendance=self.df_clean,
            predictions_list=[],
            faculty_id=99,
            subject_names_map=None
        )
        self.assertEqual(fac_unassigned["class_avg_pct"], 0.0)
        self.assertEqual(fac_unassigned["at_risk_count"], 0)
        self.assertEqual(fac_unassigned["total_students_evaluated"], 0)

    def test_faculty_analytics_with_assigned_subjects(self):
        """Fix 5: Faculty with assigned subjects aggregates prediction results."""
        sub_map = {101: "Operating Systems", 102: "DBMS"}
        sample_predictions = [
            {"student_id": 1, "risk_level": "HIGH", "predicted_pct": 68.0},
            {"student_id": 2, "risk_level": "LOW", "predicted_pct": 88.0}
        ]
        fac_analytics = FacultyAnalytics.generate_classroom_insights(
            df_dept_attendance=self.df_clean,
            predictions_list=sample_predictions,
            faculty_id=1,
            subject_names_map=sub_map
        )
        self.assertEqual(fac_analytics["at_risk_count"], 1)
        self.assertEqual(fac_analytics["worst_subject_name"], "Operating Systems")

    def test_statistics(self):
        stats = AttendanceStatistics.calculate_distribution_stats([60.0, 70.0, 80.0, 90.0])
        self.assertEqual(stats["mean"], 75.0)
        self.assertEqual(stats["median"], 75.0)

if __name__ == "__main__":
    unittest.main()
