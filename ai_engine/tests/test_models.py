import sys
import unittest
from pathlib import Path

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from models.attendance_prediction import AttendancePredictor
from models.forecasting import AttendanceForecaster
from database.synthetic_provider import SyntheticTrainingDataProvider

class TestModelsLayer(unittest.TestCase):
    """
    Unit tests for ML prediction models, prediction reliability, interval bounds, and forecasting.
    """

    def setUp(self):
        self.predictor = AttendancePredictor()
        self.sample_features = {
            "student_id": 1,
            "current_attendance_pct": 72.0,
            "total_conducted": 30,
            "classes_attended": 21,
            "classes_absent": 9,
            "classes_excused": 0,
            "remaining_classes": 62,
            "recent_attendance_pct": 68.0,
            "recent_3week_trend": -4.0,
            "current_consecutive_absences": 3,
            "max_consecutive_absences": 3,
            "consecutive_absences": 3,
            "worst_subject_pct": 60.0,
            "best_subject_pct": 80.0,
            "average_subject_attendance": 70.0,
            "subject_attendance_std": 5.0,
            "most_absent_day": "Monday",
            "most_absent_day_rate": 40.0
        }

    def test_attendance_prediction_reliability_and_no_confidence_score(self):
        """Final Change 1 & 2: Test prediction reliability and verify zero active confidence_score references."""
        result = self.predictor.predict_student_attendance(self.sample_features)
        self.assertIn("predicted_pct", result)
        self.assertIn("risk_level", result)
        self.assertIn("prediction_reliability", result)
        self.assertIn(result["prediction_reliability"], ["HIGH", "MEDIUM", "LOW"])
        self.assertIn("predicted_min_pct", result)
        self.assertIn("predicted_max_pct", result)
        self.assertGreaterEqual(result["predicted_max_pct"], result["predicted_min_pct"])
        
        # Verify confidence_score key is COMPLETELY PURGED
        self.assertNotIn("confidence_score", result)

    def test_forecasting_with_authoritative_schedule(self):
        """Final Change 4 & 6: Test forecasting uses authoritative actual total sessions."""
        actual_sessions = SyntheticTrainingDataProvider().get_total_actual_semester_sessions()
        forecast = AttendanceForecaster.calculate_classes_needed(
            classes_attended=21,
            total_conducted=30,
            target_pct=75.0,
            total_semester_classes=actual_sessions
        )
        self.assertIn("classes_needed", forecast)
        self.assertIn("is_target_achieved", forecast)
        self.assertFalse(forecast["is_target_achieved"])
        self.assertEqual(forecast["remaining_classes"], actual_sessions - 30)
        self.assertTrue(forecast["is_achievable"])

if __name__ == "__main__":
    unittest.main()
