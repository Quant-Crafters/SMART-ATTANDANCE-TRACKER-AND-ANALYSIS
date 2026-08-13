import sys
from pathlib import Path

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from utils.logger import get_logger
from database.connection import init_db

# Import Routers
from api.prediction_routes import router as prediction_router
from api.analytics_routes import router as analytics_router
from api.insights_routes import router as insights_router
from api.reports_routes import router as reports_router
from api.calendar_routes import router as calendar_router

logger = get_logger(__name__)

def create_app() -> FastAPI:
    """
    Application factory initializing FastAPI with middleware, routers, and lifecycle events.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description="Production AI Engine for Automated Student Attendance Monitoring & Analytics System",
        version="1.0.0",
        debug=settings.DEBUG,
    )

    # CORS Middleware Setup
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API Routers
    app.include_router(prediction_router)
    app.include_router(analytics_router)
    app.include_router(insights_router)
    app.include_router(reports_router)
    app.include_router(calendar_router)

    @app.on_event("startup")
    def on_startup():
        """
        Runs table initialization on FastAPI startup.
        """
        try:
            init_db()
            logger.info("Database tables initialized successfully on app startup.")
        except Exception as e:
            logger.warning(f"Database connection skipped during startup or database unavailable: {e}")

    @app.get("/health", tags=["Health"])
    def health_check():
        """
        Health Check Endpoint.
        """
        return {
            "status": "healthy",
            "app_name": settings.APP_NAME,
            "environment": settings.APP_ENV
        }

    logger.info(f"Initialized {settings.APP_NAME} in {settings.APP_ENV} mode with all 4 API routers registered.")
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
