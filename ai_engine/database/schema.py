import sys
from pathlib import Path
from datetime import datetime, timezone

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import Column, Integer, BigInteger, String, Float, Date, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from database.connection import Base

# ==========================================
# EXISTING APPLICATION TABLES (READ ONLY)
# ==========================================

class StudentModel(Base):
    """
    Mapped ORM Model for existing 'students' database table.
    """
    __tablename__ = "students"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(15), nullable=True)
    department = Column(String(100), nullable=False, index=True)
    semester = Column(Integer, nullable=False, index=True)
    section = Column(String(10), nullable=True)
    year = Column(Integer, nullable=True)
    status = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    attendances = relationship("AttendanceModel", back_populates="student")


class FacultyModel(Base):
    """
    Mapped ORM Model for existing 'faculty' database table.
    """
    __tablename__ = "faculty"

    id = Column(BigInteger, primary_key=True, index=True)
    faculty_id = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(15), nullable=True)
    department = Column(String(100), nullable=True, index=True)
    designation = Column(String(100), nullable=True)
    status = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    attendances = relationship("AttendanceModel", back_populates="faculty")


class DepartmentModel(Base):
    """
    Mapped ORM Model for existing 'departments' database table.
    """
    __tablename__ = "departments"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(20), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    status = Column(Boolean, nullable=False, default=True)


class SubjectModel(Base):
    """
    Mapped ORM Model for existing 'subjects' database table.
    """
    __tablename__ = "subjects"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(30), nullable=False, unique=True, index=True)
    department_id = Column(BigInteger, ForeignKey("departments.id"), nullable=False, index=True)
    semester = Column(Integer, nullable=False, index=True)
    credits = Column(Integer, nullable=False, default=0)
    status = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    attendances = relationship("AttendanceModel", back_populates="subject")


class AttendanceModel(Base):
    """
    Mapped ORM Model for existing 'attendance' database table.
    """
    __tablename__ = "attendance"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("students.id"), nullable=False, index=True)
    subject_id = Column(BigInteger, ForeignKey("subjects.id"), nullable=False, index=True)
    faculty_id = Column(BigInteger, ForeignKey("faculty.id"), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(20), nullable=False, index=True)  # present, absent, late

    # Relationships
    student = relationship("StudentModel", back_populates="attendances")
    subject = relationship("SubjectModel", back_populates="attendances")
    faculty = relationship("FacultyModel", back_populates="attendances")


class LeaveModel(Base):
    """
    Mapped ORM Model for optional 'leaves' table.
    """
    __tablename__ = "leaves"

    leave_id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("students.id"), nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=True)


class AcademicCalendarModel(Base):
    """
    Mapped ORM Model for college academic calendar (holidays, exams, festivals).
    """
    __tablename__ = "academic_calendar"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, unique=True, index=True)
    holiday_name = Column(String(100), nullable=True)
    holiday_type = Column(String(50), nullable=True)
    is_holiday = Column(Integer, default=1, nullable=False)
    source_pdf = Column(String(255), nullable=True)
    source_page = Column(Integer, nullable=True)
    source_type = Column(String(50), default="SYNTHETIC_DEVELOPMENT", nullable=True)
    academic_year = Column(String(50), nullable=True)
    semester = Column(String(50), nullable=True)


# ==========================================
# AI MODULE DEDICATED OUTPUT TABLES
# ==========================================

class PredictionResultModel(Base):
    """
    Stores student attendance predictions generated by ML models.
    """
    __tablename__ = "prediction_results"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("students.id"), nullable=False, index=True)
    predicted_pct = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False, index=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class AIAlertModel(Base):
    """
    Stores contextual dashboard alerts generated for students or faculty.
    """
    __tablename__ = "ai_alerts"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("students.id"), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class PatternAnalysisModel(Base):
    """
    Stores pattern analysis findings (weekday trends, holiday effects, subject trends).
    """
    __tablename__ = "pattern_analysis"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, nullable=True, index=True)
    department = Column(String(100), nullable=True, index=True)
    pattern_type = Column(String(50), nullable=False)
    pattern_summary = Column(Text, nullable=False)
    data_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class RecommendationModel(Base):
    """
    Stores personalized student actionable recommendations.
    """
    __tablename__ = "recommendations"

    id = Column(BigInteger, primary_key=True, index=True)
    student_id = Column(BigInteger, ForeignKey("students.id"), nullable=False, index=True)
    recommendation_text = Column(Text, nullable=False)
    priority = Column(String(20), default="MEDIUM")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class FacultyAnalyticsModel(Base):
    """
    Stores faculty and subject-level classroom analytics.
    """
    __tablename__ = "faculty_analytics"

    id = Column(BigInteger, primary_key=True, index=True)
    faculty_id = Column(BigInteger, ForeignKey("faculty.id"), nullable=False, index=True)
    subject_id = Column(BigInteger, ForeignKey("subjects.id"), nullable=True)
    class_avg_pct = Column(Float, nullable=False)
    at_risk_count = Column(Integer, nullable=False)
    insights_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class GeneratedReportModel(Base):
    """
    Stores generated PDF/Excel reports metadata.
    """
    __tablename__ = "generated_reports"

    id = Column(BigInteger, primary_key=True, index=True)
    report_type = Column(String(50), nullable=False)
    target_id = Column(BigInteger, nullable=True)
    file_path = Column(String(255), nullable=False)
    summary_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
