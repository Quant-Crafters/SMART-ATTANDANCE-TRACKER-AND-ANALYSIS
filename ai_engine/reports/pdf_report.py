import sys
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from reports.templates import get_report_styles
from utils.logger import get_logger

logger = get_logger(__name__)

class PDFReportBuilder:
    """
    Generates intelligent PDF reports for Students, Faculty, or Admin overview.
    Consumes centralized AI results without duplicating prediction logic.
    """

    @staticmethod
    def generate_student_pdf_report(
        output_filepath: str,
        feature_dict: Dict[str, Any],
        prediction_dict: Dict[str, Any],
        pattern_dict: Dict[str, Any],
        recommendations: List[Dict[str, Any]],
        xai_dict: Dict[str, Any]
    ) -> str:
        """
        Builds a comprehensive student attendance AI report PDF.
        """
        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
        doc = SimpleDocTemplate(output_filepath, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
        styles = get_report_styles()
        elements = []

        student_id = feature_dict.get("student_id", 0)
        worst_sub_name = feature_dict.get("worst_subject_name", f"Subject ID {pattern_dict.get('worst_performing_subject_id', 'N/A')}")

        # Title
        elements.append(Paragraph(f"AI Attendance Analytics Report — Student #{student_id}", styles["title"]))
        elements.append(Spacer(1, 8))

        # Executive Summary Box
        summary_text = (
            f"<b>AI Executive Summary:</b> Current attendance is <b>{feature_dict.get('current_attendance_pct', 0.0)}%</b>. "
            f"End-of-semester forecast predicts <b>{prediction_dict.get('predicted_pct', 0.0)}%</b> "
            f"({prediction_dict.get('risk_level', 'LOW')} Risk). "
            f"{xai_dict.get('explanation_text', '')}"
        )
        elements.append(Paragraph(summary_text, styles["summary"]))
        elements.append(Spacer(1, 10))

        # Prediction Summary Table
        from config import settings
        from models.forecasting import AttendanceForecaster
        req_pct = settings.REQUIRED_ATTENDANCE_PCT
        classes_att = feature_dict.get("classes_attended", 0)
        total_cond = feature_dict.get("total_conducted", 0)
        forecast_info = AttendanceForecaster.calculate_classes_needed(classes_att, total_cond, target_pct=req_pct)
        classes_needed_str = str(forecast_info.get("classes_needed", 0)) if not forecast_info.get("is_target_achieved") else "0 (Requirement Met)"
        if not forecast_info.get("is_target_achieved") and not forecast_info.get("is_achievable"):
            classes_needed_str = "Unreachable with remaining classes"

        cal_source = pattern_dict.get("source_type", feature_dict.get("calendar_source", "SYNTHETIC_DEVELOPMENT"))
        if cal_source == "UPLOADED_PDF":
            cal_source_label = "Uploaded PDF"
        else:
            cal_source_label = "SYNTHETIC_DEVELOPMENT"

        elements.append(Paragraph("1. Attendance Predictions & Risk Overview", styles["section"]))
        pred_data = [
            ["Metric", "Value"],
            ["Current Attendance", f"{feature_dict.get('current_attendance_pct', 0.0)}%"],
            ["Required Attendance Criterion", f"{req_pct}%"],
            ["Predicted Semester Attendance", f"{prediction_dict.get('predicted_pct', 0.0)}%"],
            ["Prediction Interval Bounds", f"[{prediction_dict.get('predicted_min_pct', 0.0)}% - {prediction_dict.get('predicted_max_pct', 100.0)}%]"],
            ["Status vs Requirement", "Below Requirement" if prediction_dict.get("predicted_pct", 0.0) < req_pct else "Meets Requirement"],
            ["Classes Needed for Requirement", classes_needed_str],
            ["Risk Level", prediction_dict.get("risk_level", "LOW")],
            ["Prediction Reliability", prediction_dict.get("prediction_reliability", "MEDIUM")],
            ["Academic Calendar Source", cal_source_label],
            ["Total Classes Conducted", str(total_cond)],
            ["Classes Attended", str(classes_att)],
            ["Classes Absent", str(feature_dict.get("classes_absent", 0))],
            ["Remaining Classes", str(feature_dict.get("remaining_classes", 0))]
        ]
        t = Table(pred_data, colWidths=[200, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1'))
        ]))
        elements.append(t)
        elements.append(Spacer(1, 14))

        # Attendance Pattern Analysis
        elements.append(Paragraph("2. Attendance Pattern Analysis", styles["section"]))
        pattern_data = [
            ["Pattern Feature", "Observation"],
            ["Most Absent Weekday", pattern_dict.get("most_absent_weekday", "N/A")],
            ["Worst Weekday Absence Rate", f"{pattern_dict.get('worst_day_absence_rate', 0.0)}%"],
            ["Lowest Attended Subject", worst_sub_name],
            ["Lowest Subject Attendance %", f"{pattern_dict.get('worst_subject_attendance_pct', 0.0)}%"],
            ["Holiday Boundary Drop %", f"{pattern_dict.get('pre_holiday_drop_pct', 0.0)}%"],
            ["Trend Trajectory Direction", pattern_dict.get("trend_direction", "STABLE")]
        ]
        t_pattern = Table(pattern_data, colWidths=[200, 300])
        t_pattern.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#334155')),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1'))
        ]))
        elements.append(t_pattern)
        elements.append(Spacer(1, 14))

        # Personalized Recommendations
        elements.append(Paragraph("3. Actionable Recommendations", styles["section"]))
        rec_rows = [["Priority", "Actionable Advice"]]
        for rec in recommendations:
            rec_rows.append([rec.get("priority", "MEDIUM"), rec.get("recommendation_text", "")])

        t_rec = Table(rec_rows, colWidths=[80, 420])
        t_rec.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1'))
        ]))
        elements.append(t_rec)

        doc.build(elements)
        logger.info(f"Successfully generated student PDF report at {output_filepath}")
        return output_filepath
