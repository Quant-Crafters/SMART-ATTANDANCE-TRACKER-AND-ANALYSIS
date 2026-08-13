import sys
import os
import unittest
from pathlib import Path

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from reports.report_generator import ReportGenerator

class TestReportsLayer(unittest.TestCase):
    """
    Integration tests for PDF and Excel report generation.
    """

    def setUp(self):
        self.features = {
            "student_id": 99,
            "current_attendance_pct": 75.0,
            "total_conducted": 40,
            "classes_attended": 30,
            "classes_absent": 10,
            "remaining_classes": 20
        }
        self.prediction = {"predicted_pct": 76.0, "risk_level": "MEDIUM", "prediction_reliability": "HIGH", "predicted_min_pct": 72.0, "predicted_max_pct": 80.0}
        self.patterns = {"most_absent_weekday": "Friday", "worst_day_absence_rate": 20.0, "worst_performing_subject_id": 101, "worst_subject_attendance_pct": 70.0}
        self.recs = [{"priority": "MEDIUM", "recommendation_text": "Maintain your regular attendance."}]
        self.xai = {"explanation_text": "MEDIUM Risk because current attendance is 75%."}

    def test_pdf_report_generation(self):
        res = ReportGenerator.generate_student_report(
            format_type="PDF",
            feature_dict=self.features,
            prediction_dict=self.prediction,
            pattern_dict=self.patterns,
            recommendations=self.recs,
            xai_dict=self.xai
        )
        self.assertTrue(os.path.exists(res["file_path"]))
        self.assertTrue(res["file_path"].endswith(".pdf"))

    def test_excel_report_generation(self):
        res = ReportGenerator.generate_student_report(
            format_type="EXCEL",
            feature_dict=self.features,
            prediction_dict=self.prediction,
            pattern_dict=self.patterns,
            recommendations=self.recs,
            xai_dict=self.xai
        )
        self.assertTrue(os.path.exists(res["file_path"]))
        self.assertTrue(res["file_path"].endswith(".xlsx"))

if __name__ == "__main__":
    unittest.main()
