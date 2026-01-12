"""
Model Training Script for AMEP Platform
Trains three core ML models:
1. Mastery Score Predictor (Regression)
2. Engagement Index Predictor (Regression)
3. Adaptive Task Recommender (Classification)
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, classification_report
import sys

# Add src to path
sys.path.append(os.path.dirname(__file__))
from data_preprocessing import AMEPDataProcessor

class AMEPModelTrainer:
    """Trains and saves all AMEP models"""
    
    def __init__(self, models_path='../models/'):
        self.models_path = models_path
        self.models = {}
        self.feature_columns = {}
        self.metrics = {}
        
        # Create models directory if it doesn't exist
        os.makedirs(models_path, exist_ok=True)
    
    def train_mastery_model(self, X, y, feature_columns):
        """
        Train Mastery Score Prediction Model
        Predicts student's concept mastery (0-100) based on assessment performance
        """
        print("\n" + "="*60)
        print("TRAINING MASTERY SCORE PREDICTION MODEL")
        print("="*60)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Testing samples: {len(X_test)}")
        
        # Train Gradient Boosting model (best for regression)
        model = GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        
        print("\nTraining Gradient Boosting Regressor...")
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Clip predictions to 0-100 range
        y_pred_train = np.clip(y_pred_train, 0, 100)
        y_pred_test = np.clip(y_pred_test, 0, 100)
        
        # Evaluate
        train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
        test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        train_r2 = r2_score(y_train, y_pred_train)
        test_r2 = r2_score(y_test, y_pred_test)
        
        print(f"\n📊 Model Performance:")
        print(f"  Train RMSE: {train_rmse:.2f}")
        print(f"  Test RMSE:  {test_rmse:.2f}")
        print(f"  Train R²:   {train_r2:.4f}")
        print(f"  Test R²:    {test_r2:.4f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔍 Top 5 Important Features:")
        for idx, row in feature_importance.head().iterrows():
            print(f"  {row['feature']}: {row['importance']:.4f}")
        
        # Save model
        model_file = f'{self.models_path}mastery_predictor.pkl'
        joblib.dump(model, model_file)
        print(f"\n✅ Model saved: {model_file}")
        
        self.models['mastery'] = model
        self.feature_columns['mastery'] = feature_columns
        self.metrics['mastery'] = {
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'train_r2': train_r2,
            'test_r2': test_r2
        }
        
        return model
    
    def train_engagement_model(self, X, y, feature_columns):
        """
        Train Engagement Index Prediction Model
        Predicts student engagement (0-100) from project activities
        """
        print("\n" + "="*60)
        print("TRAINING ENGAGEMENT INDEX PREDICTION MODEL")
        print("="*60)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Testing samples: {len(X_test)}")
        
        # Train Random Forest model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        print("\nTraining Random Forest Regressor...")
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Clip predictions to 0-100 range
        y_pred_train = np.clip(y_pred_train, 0, 100)
        y_pred_test = np.clip(y_pred_test, 0, 100)
        
        # Evaluate
        train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
        test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
        train_r2 = r2_score(y_train, y_pred_train)
        test_r2 = r2_score(y_test, y_pred_test)
        
        print(f"\n📊 Model Performance:")
        print(f"  Train RMSE: {train_rmse:.2f}")
        print(f"  Test RMSE:  {test_rmse:.2f}")
        print(f"  Train R²:   {train_r2:.4f}")
        print(f"  Test R²:    {test_r2:.4f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔍 Top 5 Important Features:")
        for idx, row in feature_importance.head().iterrows():
            print(f"  {row['feature']}: {row['importance']:.4f}")
        
        # Save model
        model_file = f'{self.models_path}engagement_predictor.pkl'
        joblib.dump(model, model_file)
        print(f"\n✅ Model saved: {model_file}")
        
        self.models['engagement'] = model
        self.feature_columns['engagement'] = feature_columns
        self.metrics['engagement'] = {
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'train_r2': train_r2,
            'test_r2': test_r2
        }
        
        return model
    
    def train_recommendation_model(self, X, y, feature_columns):
        """
        Train Adaptive Task Recommendation Model
        Classifies task difficulty (easy/medium/hard) based on student profile
        """
        print("\n" + "="*60)
        print("TRAINING ADAPTIVE TASK RECOMMENDATION MODEL")
        print("="*60)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"Training samples: {len(X_train)}")
        print(f"Testing samples: {len(X_test)}")
        
        # Train Random Forest Classifier
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        print("\nTraining Random Forest Classifier...")
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred_train = model.predict(X_train)
        y_pred_test = model.predict(X_test)
        
        # Evaluate
        train_acc = accuracy_score(y_train, y_pred_train)
        test_acc = accuracy_score(y_test, y_pred_test)
        
        print(f"\n📊 Model Performance:")
        print(f"  Train Accuracy: {train_acc:.4f}")
        print(f"  Test Accuracy:  {test_acc:.4f}")
        
        print(f"\n📋 Classification Report (Test Set):")
        print(classification_report(y_test, y_pred_test, 
                                   target_names=['Easy', 'Medium', 'Hard']))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔍 Top 5 Important Features:")
        for idx, row in feature_importance.head().iterrows():
            print(f"  {row['feature']}: {row['importance']:.4f}")
        
        # Save model
        model_file = f'{self.models_path}task_recommender.pkl'
        joblib.dump(model, model_file)
        print(f"\n✅ Model saved: {model_file}")
        
        self.models['recommendation'] = model
        self.feature_columns['recommendation'] = feature_columns
        self.metrics['recommendation'] = {
            'train_accuracy': train_acc,
            'test_accuracy': test_acc
        }
        
        return model
    
    def save_metadata(self):
        """Save feature columns and label encoders"""
        metadata = {
            'feature_columns': self.feature_columns,
            'metrics': self.metrics
        }
        joblib.dump(metadata, f'{self.models_path}model_metadata.pkl')
        print(f"\n✅ Metadata saved: {self.models_path}model_metadata.pkl")
    
    def print_summary(self):
        """Print training summary"""
        print("\n" + "="*60)
        print("TRAINING SUMMARY")
        print("="*60)
        
        print("\n📦 Trained Models:")
        print(f"  1. Mastery Score Predictor    → {self.models_path}mastery_predictor.pkl")
        print(f"  2. Engagement Index Predictor → {self.models_path}engagement_predictor.pkl")
        print(f"  3. Task Recommender          → {self.models_path}task_recommender.pkl")
        
        print("\n📊 Performance Metrics:")
        if 'mastery' in self.metrics:
            print(f"  Mastery Model:      Test RMSE = {self.metrics['mastery']['test_rmse']:.2f}, R² = {self.metrics['mastery']['test_r2']:.4f}")
        if 'engagement' in self.metrics:
            print(f"  Engagement Model:   Test RMSE = {self.metrics['engagement']['test_rmse']:.2f}, R² = {self.metrics['engagement']['test_r2']:.4f}")
        if 'recommendation' in self.metrics:
            print(f"  Recommendation Model: Test Acc = {self.metrics['recommendation']['test_accuracy']:.4f}")
        
        print("\n✅ All models trained and saved successfully!")
        print("="*60)


def main():
    """Main training pipeline"""
    print("\n🚀 AMEP MODEL TRAINING PIPELINE")
    print("="*60)
    
    # Initialize processor
    processor = AMEPDataProcessor(data_path='../datasets/')
    processor.load_datasets()
    
    # Prepare datasets
    print("\n📊 Preparing datasets...")
    X_mastery, y_mastery, mastery_cols = processor.prepare_mastery_features()
    X_engagement, y_engagement, engagement_cols = processor.prepare_engagement_features()
    X_recommend, y_recommend, recommend_cols = processor.prepare_recommendation_features()
    
    # Initialize trainer
    trainer = AMEPModelTrainer(models_path='../models/')
    
    # Train models
    trainer.train_mastery_model(X_mastery, y_mastery, mastery_cols)
    trainer.train_engagement_model(X_engagement, y_engagement, engagement_cols)
    trainer.train_recommendation_model(X_recommend, y_recommend, recommend_cols)
    
    # Save metadata
    trainer.save_metadata()
    
    # Also save the processor's label encoders
    joblib.dump(processor.label_encoders, '../models/label_encoders.pkl')
    print(f"✅ Label encoders saved: ../models/label_encoders.pkl")
    
    # Print summary
    trainer.print_summary()


if __name__ == "__main__":
    main()
