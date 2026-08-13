import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    """
    Centralized configuration class loaded from environment variables or .env file.
    """
    APP_NAME: str = "AI_Attendance_Engine"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # PostgreSQL Connection Parameters
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_NAME: str = "attendsmart"
    # Domain / Business Logic Thresholds
    REQUIRED_ATTENDANCE_PCT: float = 75.0
    MODEL_DIR: str = os.path.join(BASE_DIR, "saved_models")
    LOG_LEVEL: str = "INFO"

    # Gemini Multimodal API Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    @property
    def DATABASE_URL(self) -> str:
        """
        Constructs PostgreSQL SQLAlchemy connection string.
        """
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
