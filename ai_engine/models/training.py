import sys
from pathlib import Path
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List, Optional
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.linear_model import LinearRegression

# Ensure ai_engine root is in sys.path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from database.synthetic_provider import SyntheticTrainingDataProvider, DATA_PROVIDER_TYPE
from preprocessing.clean_data import DataCleaner
from preprocessing.feature_engineering import FeatureEngineer
from models.model_utils import save_model, evaluate_model_performance
from utils.logger import get_logger

logger = get_logger(__name__)

# Generalized Numerical Feature Matrix Columns for ML Regression Model
FEATURE_COLUMNS = [
    "current_attendance_pct",
    "total_conducted",
    "classes_attended",
    "classes_absent",
    "remaining_classes",
    "leave_days",
    "leave_to_absence_ratio",
    "recent_attendance_pct",
    "recent_3week_trend",
    "current_consecutive_absences",
    "max_consecutive_absences",
    "worst_subject_pct",
    "best_subject_pct",
    "average_subject_attendance",
    "subject_attendance_std",
    "most_absent_day_rate"
]

class ModelTrainer:
    """
    Trains development ML models (Random Forest / XGBoost) on temporal synthetic attendance data.
    Separates Model Selection (Validation Set) from Final Evaluation (Test Set).
    Prevents Future Leave Data Leakage.
    """

    @staticmethod
    def build_snapshot_features(
        student_full_att: pd.DataFrame,
        student_leaves_all: Optional[pd.DataFrame],
        cutoff_dt: pd.Timestamp,
        total_actual_classes: int = 90
    ) -> Optional[Dict[str, Any]]:
        """
        Fix 3 & Change 7: Helper function constructing a training snapshot feature vector at cutoff_dt.
        Filters attendance and leaves strictly up to cutoff_dt (start_date <= cutoff_dt) to guarantee ZERO future leakage.
        """
        snapshot_att = student_full_att[student_full_att["date"] <= cutoff_dt]
        if len(snapshot_att) < 3:
            return None
        
        # Filter leaves up to cutoff date ONLY
        if student_leaves_all is not None and not student_leaves_all.empty:
            snapshot_leaves = student_leaves_all[student_leaves_all["start_date"] <= cutoff_dt]
        else:
            snapshot_leaves = None

        feats = FeatureEngineer.extract_student_features(
            snapshot_att,
            snapshot_leaves,
            total_semester_classes=total_actual_classes
        )
        return {col: feats.get(col, 0.0) for col in FEATURE_COLUMNS}

    @staticmethod
    def generate_training_dataset_from_provider(num_students: int = 100) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
        """
        Extracts multi-week temporal snapshot feature vectors (Week 3, Week 5, Week 7, Week 8.5 cutoffs)
        and targets at semester end (Week 10) from SyntheticTrainingDataProvider.
        
        Fix 3: Filters leave history per snapshot (start_date <= cutoff) to prevent future leave data leakage.
        Fix 4: Splits into Train, Validation (for model selection), and Test (for final evaluation).
        """
        provider = SyntheticTrainingDataProvider(random_seed=42)
        dataset = provider.generate_full_synthetic_dataset(num_students=num_students, num_weeks=10)

        df_att_full = dataset["attendance"]
        df_clean_full = DataCleaner.clean_attendance_data(df_att_full)
        df_leaves = dataset["leaves"]
        total_actual_classes = dataset.get("total_actual_semester_sessions", 90)

        dates_sorted = df_clean_full["date"].sort_values().unique()
        total_days = len(dates_sorted)

        # Temporal Cutoffs
        train_cutoffs = [dates_sorted[int(total_days * 0.3)], dates_sorted[int(total_days * 0.5)]]
        val_cutoffs = [dates_sorted[int(total_days * 0.7)]]
        test_cutoffs = [dates_sorted[int(total_days * 0.85)]]

        train_rows, train_targets = [], []
        val_rows, val_targets = [], []
        test_rows, test_targets = [], []

        student_ids = df_clean_full["student_id"].unique()

        for s_id in student_ids:
            student_full = df_clean_full[df_clean_full["student_id"] == s_id]
            student_leaves_all = df_leaves[df_leaves["student_id"] == s_id] if not df_leaves.empty else None

            if student_full.empty:
                continue

            # Compute actual semester-end attendance % as synthetic target
            final_attended = int(student_full["is_present"].sum())
            final_conducted = len(student_full)
            final_pct = round((final_attended / final_conducted) * 100.0, 2) if final_conducted > 0 else 0.0

            # 1. Training Set (Earlier Temporal Cutoffs)
            for cutoff in train_cutoffs:
                row = ModelTrainer.build_snapshot_features(student_full, student_leaves_all, cutoff, total_actual_classes)
                if row:
                    train_rows.append(row)
                    train_targets.append(final_pct)

            # 2. Validation Set (Middle Temporal Cutoffs for Model Selection)
            for cutoff in val_cutoffs:
                row = ModelTrainer.build_snapshot_features(student_full, student_leaves_all, cutoff, total_actual_classes)
                if row:
                    val_rows.append(row)
                    val_targets.append(final_pct)

            # 3. Test Set (Latest Temporal Cutoffs for Final Single Evaluation)
            for cutoff in test_cutoffs:
                row = ModelTrainer.build_snapshot_features(student_full, student_leaves_all, cutoff, total_actual_classes)
                if row:
                    test_rows.append(row)
                    test_targets.append(final_pct)

        X_train, y_train = pd.DataFrame(train_rows), pd.Series(train_targets, name="target")
        X_val, y_val = pd.DataFrame(val_rows), pd.Series(val_targets, name="target")
        X_test, y_test = pd.DataFrame(test_rows), pd.Series(test_targets, name="target")

        logger.info(f"Built datasets: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}. [Provider: {DATA_PROVIDER_TYPE}]")
        return X_train, y_train, X_val, y_val, X_test, y_test

    @staticmethod
    def train_and_select_best_model() -> Tuple[Any, Dict[str, Any]]:
        """
        Trains LinearRegression, RandomForest, and XGBoost regressors on Train set.
        Fix 4: Evaluates candidate models on Validation Set to SELECT the best model.
        Evaluates the selected best model ONCE on the Final Test Set.
        """
        X_train, y_train, X_val, y_val, X_test, y_test = ModelTrainer.generate_training_dataset_from_provider(num_students=100)

        models = {
            "RandomForest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42),
            "LinearRegression": LinearRegression()
        }

        best_model = None
        best_val_rmse = float("inf")
        best_name = ""
        val_results = {}

        # 1. Model Selection using Validation Set ONLY
        for name, model in models.items():
            try:
                model.fit(X_train, y_train)
                val_preds = model.predict(X_val)
                val_metrics = evaluate_model_performance(y_val.values, val_preds)
                val_results[name] = val_metrics

                if val_metrics["rmse"] < best_val_rmse:
                    best_val_rmse = val_metrics["rmse"]
                    best_model = model
                    best_name = name
            except Exception as e:
                logger.error(f"Failed training candidate model '{name}': {e}")

        if best_model is None:
            raise RuntimeError("Failed to train any candidate ML models.")

        # 2. Evaluate Selected Best Model ONCE on Final Test Set
        final_test_preds = best_model.predict(X_test)
        final_test_metrics = evaluate_model_performance(y_test.values, final_test_preds)

        metadata = {
            "model_name": best_name,
            "feature_columns": FEATURE_COLUMNS,
            "training_samples": len(X_train),
            "validation_samples": len(X_val),
            "test_samples": len(X_test),
            "validation_metrics": val_results[best_name],
            "metrics": final_test_metrics,  # Final Test Metrics
            "dataset_type": "SYNTHETIC_DEVELOPMENT",
            "disclaimer": "Development / Synthetic Dataset model for SIH demonstration stage."
        }

        logger.info(f"Selected Best Model via Validation: '{best_name}' (Val RMSE: {best_val_rmse:.4f}, Test RMSE: {final_test_metrics['rmse']:.4f}). Saving artifact & metadata...")
        save_model(best_model, metadata=metadata)

        return best_model, metadata

if __name__ == "__main__":
    ModelTrainer.train_and_select_best_model()
