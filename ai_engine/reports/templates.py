import sys
from pathlib import Path
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

def get_report_styles():
    """
    Returns custom ReportLab typography and layout styles.
    """
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=12
    )

    section_style = ParagraphStyle(
        "ReportSection",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    summary_box_style = ParagraphStyle(
        "SummaryBox",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1E3A8A"),
        backColor=colors.HexColor("#EFF6FF"),
        borderColor=colors.HexColor("#BFDBFE"),
        borderWidth=1,
        borderPadding=10,
        spaceAfter=12
    )

    return {
        "title": title_style,
        "section": section_style,
        "body": body_style,
        "summary": summary_box_style
    }
