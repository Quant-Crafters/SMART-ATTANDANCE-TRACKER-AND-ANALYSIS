import sys
from pathlib import Path
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from models.model_utils import load_model, load_model_metadata, verify_feature_compatibility
from models.training import ModelTrainer, FEATURE_COLUMNS
from utils.helpers import determine_risk_level
from utils.logger import get_logger

logger = get_logger(__name__)

class AttendancePredictor:
    """
    Inference Engine for Module 1: Attendance Prediction.
    Single Source of Truth for Student Predictions, Risk Categories, and Prediction Reliability.
    """

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model = self._ensure_model_loaded()
        self.metadata = load_model_metadata(model_path)

    def _ensure_model_loaded(self) -> Optional[Any]:
        model = load_model(self.model_path)
        if model is None:
            logger.info("No trained model artifact found. Triggering automated initial training...")
            try:
                model, _ = ModelTrainer.train_and_select_best_model()
                self.metadata = load_model_metadata(self.model_path)
            except Exception as e:
                logger.error(f"Automated initial model training failed: {e}")
                model = None
        return model

    def predict_student_attendance(self, feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates predicted semester attendance %, risk category, prediction reliability, and interval bounds.

        Args:
            feature_dict (Dict[str, Any]): Feature vector from FeatureEngineer.

        Returns:
            Dict[str, Any]: Prediction result dictionary containing:
                            - student_id
                            - predicted_pct
                            - predicted_min_pct
                            - predicted_max_pct
                            - risk_level ("LOW", "MEDIUM", "HIGH", "CRITICAL")
                            - prediction_reliability ("HIGH", "MEDIUM", "LOW")
        """
        if self.model is None:
            self.model = self._ensure_model_loaded()

        is_sufficient = feature_dict.get("is_data_sufficient", True)

        # Prepare input DataFrame with exact FEATURE_COLUMNS ordering
        input_data = {col: [feature_dict.get(col, 0.0)] for col in FEATURE_COLUMNS}
        df_features = pd.DataFrame(input_data)

        # Verify feature order compatibility if metadata exists
        if self.metadata and "feature_columns" in self.metadata:
            verify_feature_compatibility(FEATURE_COLUMNS, self.metadata["feature_columns"])

        # Run Prediction (with heuristic fallback)
        if self.model is not None and is_sufficient:
            try:
                raw_pred = self.model.predict(df_features)[0]
                predicted_pct = round(float(np.clip(raw_pred, 0.0, 100.0)), 2)
                used_ml_model = True
            except Exception as e:
                logger.error(f"Error during model prediction: {e}. Falling back to rule-based estimate.")
                predicted_pct = self._calculate_heuristic_prediction(feature_dict)
                used_ml_model = False
        else:
            logger.warning("ML model is unavailable or attendance records insufficient; using rule-based estimate.")
            predicted_pct = self._calculate_heuristic_prediction(feature_dict)
            used_ml_model = False

        # Categorize Risk
        from config import settings
        risk_level = determine_risk_level(predicted_pct, threshold=settings.REQUIRED_ATTENDANCE_PCT)

        # Determine Defensible Prediction Reliability & Interval Bounds
        total_conducted = feature_dict.get("total_conducted", 0)
        rmse_err = 3.5
        if self.metadata and "metrics" in self.metadata and "rmse" in self.metadata["metrics"]:
            rmse_err = self.metadata["metrics"]["rmse"]

        if total_conducted >= 20 and is_sufficient and used_ml_model:
            reliability = "HIGH"
            margin = round(rmse_err * 0.75, 2)
        elif total_conducted >= 8 and is_sufficient:
            reliability = "MEDIUM"
            margin = round(rmse_err * 1.25, 2)
        else:
            reliability = "LOW"
            margin = round(rmse_err * 2.0, 2)

        predicted_min_pct = round(float(max(0.0, predicted_pct - margin)), 2)
        predicted_max_pct = round(float(min(100.0, predicted_pct + margin)), 2)

        result = {
            "student_id": feature_dict.get("student_id", 0),
            "predicted_pct": predicted_pct,
            "predicted_min_pct": predicted_min_pct,
            "predicted_max_pct": predicted_max_pct,
            "risk_level": risk_level,
            "prediction_reliability": reliability,
            "current_pct": feature_dict.get("current_attendance_pct", 0.0),
            "remaining_classes": feature_dict.get("remaining_classes", 0),
            "dataset_mode": "SYNTHETIC_DEVELOPMENT",
            "used_ml_model": used_ml_model
        }

        logger.info(f"Generated Prediction for student_id={result['student_id']}: Predicted={predicted_pct}% [{predicted_min_pct}% - {predicted_max_pct}%], Risk={risk_level}, Reliability={reliability}")
        return result

    @staticmethod
    def _calculate_heuristic_prediction(feature_dict: Dict[str, Any]) -> float:
        """
        Fallback heuristic formula for attendance prediction when ML artifact is unavailable or records are limited.
        """
        current_pct = feature_dict.get("current_attendance_pct", 75.0)
        recent_pct = feature_dict.get("recent_attendance_pct", current_pct)
        consecutive_abs = feature_dict.get("current_consecutive_absences", feature_dict.get("consecutive_absences", 0))

        weighted_pct = (current_pct * 0.6) + (recent_pct * 0.4) - (consecutive_abs * 1.5)
        return round(float(np.clip(weighted_pct, 0.0, 100.0)), 2)
