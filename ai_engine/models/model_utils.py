import sys
import os
import json
import joblib
import platform
import sklearn
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

DEFAULT_MODEL_PATH = os.path.join(settings.MODEL_DIR, "attendance_model.pkl")
DEFAULT_METADATA_PATH = os.path.join(settings.MODEL_DIR, "attendance_model.json")

def get_default_model_path() -> str:
    """
    Returns the absolute path to the saved model binary file.
    """
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    return DEFAULT_MODEL_PATH

def save_model(model: Any, filepath: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> str:
    """
    Serializes and saves a trained machine learning model and its metadata JSON.
    """
    path = filepath or get_default_model_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    # Save Model Artifact
    joblib.dump(model, path)
    logger.info(f"Successfully saved model artifact to {path}")

    # Save Metadata JSON alongside model
    meta_path = path.replace(".pkl", ".json")
    if metadata is not None:
        metadata["saved_at"] = datetime.now().isoformat()
        metadata["python_version"] = platform.python_version()
        metadata["sklearn_version"] = sklearn.__version__
        metadata["dataset_type"] = "SYNTHETIC_DEVELOPMENT"
        
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"Successfully saved model metadata to {meta_path}")

    return path

def load_model(filepath: Optional[str] = None) -> Optional[Any]:
    """
    Loads a serialized ML model artifact from disk using Joblib.
    """
    path = filepath or get_default_model_path()
    if not os.path.exists(path):
        logger.warning(f"Model file not found at {path}. Automated initial training will be required.")
        return None
    try:
        model = joblib.load(path)
        logger.info(f"Loaded trained model artifact from {path}")
        return model
    except Exception as e:
        logger.error(f"Failed to load model artifact from {path}: {e}")
        return None

def load_model_metadata(filepath: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Loads model metadata JSON from disk.
    """
    path = (filepath or get_default_model_path()).replace(".pkl", ".json")
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Unable to read model metadata JSON: {e}")
        return None

def verify_feature_compatibility(input_features: List[str], expected_features: List[str]) -> bool:
    """
    Verifies that feature names and column ordering match model metadata requirements.
    """
    if input_features != expected_features:
        logger.warning(f"Feature order mismatch! Input: {input_features}, Expected: {expected_features}")
        return False
    return True

def evaluate_model_performance(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Calculates regression evaluation metrics (MAE, MSE, RMSE, R2 Score).
    Labelled as Development/Synthetic Dataset metrics.
    """
    mae = float(mean_absolute_error(y_true, y_pred))
    mse = float(mean_squared_error(y_true, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_true, y_pred))

    metrics = {
        "mae": round(mae, 4),
        "mse": round(mse, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4),
        "evaluation_dataset_type": "SYNTHETIC_DEVELOPMENT"
    }
    logger.info(f"Evaluated Development Model Metrics (Synthetic Data): {metrics}")
    return metrics
