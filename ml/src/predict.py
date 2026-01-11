"""
Prediction Service for AMEP Platform
Loads trained models and provides prediction APIs
"""

import joblib
import numpy as np
import pandas as pd
import os

class AMEPPredictor:
    """Unified prediction service for all AMEP models"""
    
    def __init__(self, models_path='../models/'):
        self.models_path = models_path
        self.models = {}
        self.label_encoders = {}
        self.feature_columns = {}
        self.load_models()
    
    def load_models(self):
        """Load all trained models and metadata"""
        print("Loading AMEP models...")
        
        try:
            # Load models
            self.models['mastery'] = joblib.load(f'{self.models_path}mastery_predictor.pkl')
            self.models['engagement'] = joblib.load(f'{self.models_path}engagement_predictor.pkl')
            self.models['recommendation'] = joblib.load(f'{self.models_path}task_recommender.pkl')
            
            # Load metadata
            metadata = joblib.load(f'{self.models_path}model_metadata.pkl')
            self.feature_columns = metadata['feature_columns']
            
            # Load label encoders
            self.label_encoders = joblib.load(f'{self.models_path}label_encoders.pkl')
            
            print("✅ All models loaded successfully!")
            
        except FileNotFoundError as e:
            print(f"❌ Error loading models: {e}")
            print("Please run train_model.py first to train the models.")
            raise
    
    def predict_mastery_score(self, student_data):
        """
        Predict mastery score for a student
        
        Args:
            student_data (dict): Contains quiz_score, time_taken_seconds, 
                               number_of_attempts, previous_mastery_score, etc.
        
        Returns:
            float: Predicted mastery score (0-100)
        """
        # Prepare features
        features = self._prepare_mastery_features(student_data)
        
        # Predict
        mastery_score = self.models['mastery'].predict([features])[0]
        
        # Clip to 0-100 range
        mastery_score = np.clip(mastery_score, 0, 100)
        
        return round(float(mastery_score), 2)
    
    def predict_engagement_index(self, student_data):
        """
        Predict engagement index for a student
        
        Args:
            student_data (dict): Contains tasks_completed, peer_review_score,
                               communication_score, collaboration_score, etc.
        
        Returns:
            float: Predicted engagement index (0-100)
        """
        # Prepare features
        features = self._prepare_engagement_features(student_data)
        
        # Predict
        engagement_index = self.models['engagement'].predict([features])[0]
        
        # Clip to 0-100 range
        engagement_index = np.clip(engagement_index, 0, 100)
        
        return round(float(engagement_index), 2)
    
    def recommend_tasks(self, student_data):
        """
        Recommend adaptive tasks based on student profile
        
        Args:
            student_data (dict): Contains baseline_proficiency, avg_mastery_score,
                               grade, learning_pace, etc.
        
        Returns:
            dict: {
                'difficulty_level': 'easy'|'medium'|'hard',
                'confidence': float (0-1)
            }
        """
        # Prepare features
        features = self._prepare_recommendation_features(student_data)
        
        # Predict
        difficulty_code = self.models['recommendation'].predict([features])[0]
        probabilities = self.models['recommendation'].predict_proba([features])[0]
        
        # Map code to difficulty level
        difficulty_map = {0: 'easy', 1: 'medium', 2: 'hard'}
        difficulty_level = difficulty_map[difficulty_code]
        confidence = float(probabilities[difficulty_code])
        
        return {
            'difficulty_level': difficulty_level,
            'confidence': round(confidence, 3),
            'probabilities': {
                'easy': round(float(probabilities[0]), 3),
                'medium': round(float(probabilities[1]), 3),
                'hard': round(float(probabilities[2]), 3)
            }
        }
    
    def get_student_insights(self, student_data):
        """
        Get comprehensive insights for a student
        
        Args:
            student_data (dict): Complete student profile
        
        Returns:
            dict: All predictions combined
        """
        insights = {}
        
        # Predict mastery if quiz data available
        if all(k in student_data for k in ['quiz_score', 'time_taken_seconds']):
            insights['mastery_score'] = self.predict_mastery_score(student_data)
        
        # Predict engagement if project data available
        if all(k in student_data for k in ['tasks_completed', 'peer_review_score']):
            insights['engagement_index'] = self.predict_engagement_index(student_data)
        
        # Always recommend tasks
        insights['task_recommendation'] = self.recommend_tasks(student_data)
        
        return insights
    
    def _prepare_mastery_features(self, data):
        """Prepare feature vector for mastery prediction"""
        feature_order = self.feature_columns['mastery']
        features = []
        
        for col in feature_order:
            if '_encoded' in col:
                # Handle encoded features
                original_col = col.replace('_encoded', '')
                if original_col in data and original_col in self.label_encoders:
                    try:
                        encoded_val = self.label_encoders[original_col].transform([str(data[original_col])])[0]
                        features.append(encoded_val)
                    except:
                        features.append(0)
                else:
                    features.append(0)
            else:
                # Handle numeric features
                features.append(data.get(col, 0))
        
        return features
    
    def _prepare_engagement_features(self, data):
        """Prepare feature vector for engagement prediction"""
        feature_order = self.feature_columns['engagement']
        features = []
        
        for col in feature_order:
            if '_encoded' in col:
                original_col = col.replace('_encoded', '')
                if original_col in data and original_col in self.label_encoders:
                    try:
                        encoded_val = self.label_encoders[original_col].transform([str(data[original_col])])[0]
                        features.append(encoded_val)
                    except:
                        features.append(0)
                else:
                    features.append(0)
            else:
                features.append(data.get(col, 0))
        
        return features
    
    def _prepare_recommendation_features(self, data):
        """Prepare feature vector for task recommendation"""
        feature_order = self.feature_columns['recommendation']
        features = []
        
        for col in feature_order:
            if '_encoded' in col:
                original_col = col.replace('_encoded', '')
                if original_col in data and original_col in self.label_encoders:
                    try:
                        encoded_val = self.label_encoders[original_col].transform([str(data[original_col])])[0]
                        features.append(encoded_val)
                    except:
                        features.append(0)
                else:
                    features.append(0)
            else:
                features.append(data.get(col, 0))
        
        return features


# Example usage
if __name__ == "__main__":
    predictor = AMEPPredictor(models_path='../models/')
    
    # Example student data
    test_student = {
        'quiz_score': 85,
        'time_taken_seconds': 180,
        'number_of_attempts': 1,
        'previous_mastery_score': 70,
        'baseline_proficiency': 75,
        'subject': 'Math',
        'topic': 'Algebra',
        'difficulty_level': 'hard',
        'grade': 10,
        'learning_pace': 'fast',
        'preferred_learning_style': 'visual',
        'tasks_completed': 10,
        'peer_review_score': 4.5,
        'communication_score': 4.3,
        'collaboration_score': 4.6,
        'creativity_score': 4.2,
        'project_completion_pct': 95,
        'role_in_team': 'Leader',
        'avg_mastery_score': 75,
        'section': 'A'
    }
    
    print("\n🔮 AMEP Prediction Example\n")
    print("Student Profile:")
    print(f"  Grade: {test_student['grade']}")
    print(f"  Learning Pace: {test_student['learning_pace']}")
    print(f"  Baseline Proficiency: {test_student['baseline_proficiency']}")
    
    # Get insights
    insights = predictor.get_student_insights(test_student)
    
    print("\n📊 Predictions:")
    if 'mastery_score' in insights:
        print(f"  Mastery Score: {insights['mastery_score']}/100")
    if 'engagement_index' in insights:
        print(f"  Engagement Index: {insights['engagement_index']}/100")
    if 'task_recommendation' in insights:
        rec = insights['task_recommendation']
        print(f"  Recommended Difficulty: {rec['difficulty_level']} (confidence: {rec['confidence']})")
