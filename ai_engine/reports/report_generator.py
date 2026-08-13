import sys
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from reports.pdf_report import PDFReportBuilder
from reports.excel_report import ExcelReportBuilder
from utils.logger import get_logger

logger = get_logger(__name__)

REPORTS_DIR = os.path.abspath(os.path.join(Path(__file__).resolve().parent.parent.parent, "uploads", "reports"))

class ReportGenerator:
    """
    Module 6: Report Generation Engine Orchestrator.
    Coordinates creation of PDF and Excel attendance intelligence reports.
    """

    @staticmethod
    def generate_student_report(
        format_type: str,
        feature_dict: Dict[str, Any],
        prediction_dict: Dict[str, Any],
        pattern_dict: Dict[str, Any],
        recommendations: List[Dict[str, Any]],
        xai_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Orchestrates student report export (PDF or Excel).

        Args:
            format_type (str): "PDF" or "EXCEL".
            feature_dict: Feature metrics.
            prediction_dict: ML prediction results.
            pattern_dict: Pattern analysis metrics.
            recommendations: List of personalized recommendations.
            xai_dict: Explainable AI explanation narrative.

        Returns:
            Dict[str, Any]: {report_type, file_path, format_type, summary_text}
        """
        os.makedirs(REPORTS_DIR, exist_ok=True)
        student_id = feature_dict.get("student_id", 0)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        format_clean = format_type.upper().strip()

        if format_clean == "PDF":
            filename = f"student_report_{student_id}_{timestamp}.pdf"
            file_path = os.path.join(REPORTS_DIR, filename)
            PDFReportBuilder.generate_student_pdf_report(
                output_filepath=file_path,
                feature_dict=feature_dict,
                prediction_dict=prediction_dict,
                pattern_dict=pattern_dict,
                recommendations=recommendations,
                xai_dict=xai_dict
            )
        elif format_clean in ("EXCEL", "XLSX"):
            filename = f"student_report_{student_id}_{timestamp}.xlsx"
            file_path = os.path.join(REPORTS_DIR, filename)
            ExcelReportBuilder.generate_student_excel_report(
                output_filepath=file_path,
                feature_dict=feature_dict,
                prediction_dict=prediction_dict,
                pattern_dict=pattern_dict,
                recommendations=recommendations,
                xai_dict=xai_dict
            )
        else:
            raise ValueError(f"Unsupported report format: '{format_type}'. Expected 'PDF' or 'EXCEL'.")

        summary_text = f"Generated {format_clean} report for student_id={student_id} (Predicted: {prediction_dict.get('predicted_pct', 0.0)}%, Risk: {prediction_dict.get('risk_level', 'LOW')})."
        
        result = {
            "student_id": student_id,
            "report_type": "STUDENT_ATTENDANCE",
            "format_type": format_clean,
            "file_path": file_path,
            "summary_text": summary_text
        }

        logger.info(f"ReportGenerator successfully created report: {result['file_path']}")
        return result
