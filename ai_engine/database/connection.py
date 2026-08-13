import sys
from pathlib import Path

# Ensure ai_engine root is in sys.path for import resolution
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

# Base class for SQLAlchemy ORM models
Base = declarative_base()

# Configure SQLAlchemy Engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Checks connection health before reuse
    pool_size=10,             # Maintains active pool
    max_overflow=20,          # Allows temporary overflow under load
    echo=False                # Set to True for verbose SQL debug logs
)

# SessionFactory for creating DB sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    """
    FastAPI Dependency yielding a managed database session with auto-close.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """
    Creates ONLY AI engine dedicated output tables and academic calendar.
    Does NOT recreate main application-owned tables (students, attendance, subjects, etc.).
    """
    try:
        logger.info("Initializing AI Engine output database tables...")
        # Import models locally to avoid circular dependencies
        from database.schema import (
            PredictionResultModel, AIAlertModel, PatternAnalysisModel,
            RecommendationModel, FacultyAnalyticsModel, GeneratedReportModel,
            AcademicCalendarModel
        )
        ai_tables = [
            PredictionResultModel.__table__,
            AIAlertModel.__table__,
            PatternAnalysisModel.__table__,
            RecommendationModel.__table__,
            FacultyAnalyticsModel.__table__,
            GeneratedReportModel.__table__,
            AcademicCalendarModel.__table__
        ]
        Base.metadata.create_all(bind=engine, tables=ai_tables)
        logger.info("AI Database output tables verified successfully.")
    except Exception as e:
        logger.warning(f"Database table initialization warning (Database may be unavailable): {e}")
