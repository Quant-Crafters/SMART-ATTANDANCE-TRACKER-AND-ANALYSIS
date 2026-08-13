import sys
import unittest
from pathlib import Path

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from insights.smart_alerts import SmartAlertGenerator
from insights.insight_generator import InsightGenerator
from insights.recommendations import RecommendationEngine
from insights.explainable_ai import ExplainableAI

class TestInsightsLayer(unittest.TestCase):
    """
    Unit tests for Smart Alerts, InsightGenerator, Recommendations, and Explainable AI engines.
    """

    def setUp(self):
        self.features = {
            "student_id": 1,
            "current_attendance_pct": 72.0,
            "classes_attended": 21,
            "total_conducted": 30,
            "current_consecutive_absences": 3,
            "consecutive_absences": 3,
            "recent_3week_trend": -4.5,
            "worst_subject_name": "Database Management Systems",
            "worst_subject_pct": 60.0
        }
        self.prediction = {
            "predicted_pct": 67.5,
            "risk_level": "HIGH",
            "prediction_reliability": "HIGH"
        }
        self.patterns = {
            "most_absent_weekday": "Monday",
            "worst_day_absence_rate": 40.0,
            "worst_performing_subject_id": 2,
            "worst_subject_attendance_pct": 60.0,
            "trend_direction": "DECLINING"
        }

    def test_smart_alerts(self):
        alerts = SmartAlertGenerator.generate_student_alerts(self.features, self.prediction, self.patterns)
        self.assertGreater(len(alerts), 0)
        types = [a["alert_type"] for a in alerts]
        self.assertIn("PROJECTED_FALL_BELOW_THRESHOLD", types)
        self.assertIn("CONSECUTIVE_ABSENCES_DETECTED", types)

    def test_insight_generator(self):
        insights = InsightGenerator.generate_student_summary(self.features, self.prediction, self.patterns)
        self.assertGreater(len(insights), 0)
        self.assertTrue(any("Database Management Systems" in text for text in insights))

    def test_recommendations(self):
        recs = RecommendationEngine.generate_personalized_recommendations(self.features, self.prediction, self.patterns)
        self.assertGreater(len(recs), 0)
        rec_texts = [r["recommendation_text"] for r in recs]
        self.assertTrue(any("Database Management Systems" in text for text in rec_texts))

    def test_explainable_ai(self):
        xai = ExplainableAI.generate_prediction_explanation(self.features, self.prediction, self.patterns)
        self.assertIn("explanation_text", xai)
        self.assertTrue(xai["explanation_text"].startswith("HIGH Risk because"))

if __name__ == "__main__":
    unittest.main()
