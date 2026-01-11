"""
Data Preprocessing Pipeline for AMEP Platform
Handles data loading, cleaning, and feature engineering
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split

class AMEPDataProcessor:
    """Centralized data processor for all AMEP datasets"""
    
    def __init__(self, data_path='../datasets/'):
        self.data_path = data_path
        self.label_encoders = {}
        self.scalers = {}
        
    def load_datasets(self):
        """Load all CSV datasets"""
        print("Loading datasets...")
        
        self.students = pd.read_csv(f'{self.data_path}student.csv')
        self.quiz_attempts = pd.read_csv(f'{self.data_path}quizattempts_fixed.csv')
        self.mastery_labels = pd.read_csv(f'{self.data_path}masterylabels_fixed.csv')
        self.project_activities = pd.read_csv(f'{self.data_path}projectactivities_fixed.csv')
        
        # Handle engagement logs separately (might be binary)
        try:
            self.engagement_logs = pd.read_csv(f'{self.data_path}engagementlogs.csv')
        except:
            print("Warning: engagementlogs.csv could not be loaded as CSV")
            self.engagement_logs = None
        
        print(f"Students: {len(self.students)} records")
        print(f"Quiz Attempts: {len(self.quiz_attempts)} records")
        print(f"Mastery Labels: {len(self.mastery_labels)} records")
        print(f"Project Activities: {len(self.project_activities)} records")
        
        return self
    
    def prepare_mastery_features(self):
        """
        Prepare features for Mastery Score Prediction
        Target: final_mastery_score (0-100)
        """
        print("\n=== Preparing Mastery Prediction Dataset ===")
        
        # Merge quiz attempts with student data
        df = self.quiz_attempts.merge(self.students, on='student_id', how='left')
        
        # Merge with mastery labels
        df = df.merge(
            self.mastery_labels[['student_id', 'subject', 'topic', 'final_mastery_score']], 
            on=['student_id', 'subject', 'topic'], 
            how='left'
        )
        
        # Feature engineering
        features = df.copy()
        
        # Encode categorical variables
        categorical_cols = ['subject', 'topic', 'difficulty_level', 'grade', 
                          'section', 'preferred_learning_style', 'learning_pace']
        
        for col in categorical_cols:
            if col in features.columns:
                le = LabelEncoder()
                features[f'{col}_encoded'] = le.fit_transform(features[col].astype(str))
                self.label_encoders[col] = le
        
        # Select numeric features
        feature_columns = [
            'quiz_score', 'time_taken_seconds', 'number_of_attempts',
            'previous_mastery_score', 'baseline_proficiency',
            'subject_encoded', 'topic_encoded', 'difficulty_level_encoded',
            'grade', 'learning_pace_encoded', 'preferred_learning_style_encoded'
        ]
        
        # Remove rows with missing target
        features = features.dropna(subset=['final_mastery_score'])
        
        X = features[feature_columns].fillna(0)
        y = features['final_mastery_score']
        
        print(f"Features shape: {X.shape}")
        print(f"Target shape: {y.shape}")
        
        return X, y, feature_columns
    
    def prepare_engagement_features(self):
        """
        Prepare features for Engagement Index Prediction
        Creates engagement score from project activities
        """
        print("\n=== Preparing Engagement Prediction Dataset ===")
        
        df = self.project_activities.merge(self.students, on='student_id', how='left')
        
        # Calculate Engagement Index (0-100)
        df['engagement_index'] = (
            df['tasks_completed'] * 2 +
            df['peer_review_score'] * 10 +
            df['communication_score'] * 8 +
            df['collaboration_score'] * 8
        ).clip(0, 100)
        
        # Encode categorical variables
        categorical_cols = ['role_in_team', 'grade', 'section', 
                          'preferred_learning_style', 'learning_pace']
        
        for col in categorical_cols:
            if col in df.columns:
                if col not in self.label_encoders:
                    le = LabelEncoder()
                    df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                    self.label_encoders[col] = le
                else:
                    df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col].astype(str))
        
        feature_columns = [
            'tasks_completed', 'peer_review_score', 'communication_score',
            'collaboration_score', 'creativity_score', 'project_completion_pct',
            'baseline_proficiency', 'role_in_team_encoded', 'grade',
            'learning_pace_encoded', 'preferred_learning_style_encoded'
        ]
        
        X = df[feature_columns].fillna(0)
        y = df['engagement_index']
        
        print(f"Features shape: {X.shape}")
        print(f"Target shape: {y.shape}")
        
        return X, y, feature_columns
    
    def prepare_recommendation_features(self):
        """
        Prepare features for Adaptive Task Recommendation
        Combines mastery and engagement data
        """
        print("\n=== Preparing Task Recommendation Dataset ===")
        
        # Aggregate student performance
        mastery_avg = self.mastery_labels.groupby('student_id').agg({
            'final_mastery_score': 'mean'
        }).reset_index()
        mastery_avg.columns = ['student_id', 'avg_mastery_score']
        
        # Merge with student data
        df = self.students.merge(mastery_avg, on='student_id', how='left')
        
        # Add project performance if available
        if len(self.project_activities) > 0:
            project_avg = self.project_activities.groupby('student_id').agg({
                'peer_review_score': 'mean',
                'tasks_completed': 'sum'
            }).reset_index()
            project_avg.columns = ['student_id', 'avg_peer_score', 'total_tasks']
            
            df = df.merge(project_avg, on='student_id', how='left')
        
        # Create task difficulty recommendation (easy=0, medium=1, hard=2)
        df['recommended_difficulty'] = pd.cut(
            df['avg_mastery_score'].fillna(50),
            bins=[0, 50, 75, 100],
            labels=[0, 1, 2]
        ).astype(int)
        
        # Encode categorical
        categorical_cols = ['grade', 'section', 'preferred_learning_style', 'learning_pace']
        
        for col in categorical_cols:
            if col not in self.label_encoders:
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
            else:
                df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col].astype(str))
        
        feature_columns = [
            'baseline_proficiency', 'avg_mastery_score', 'grade',
            'learning_pace_encoded', 'preferred_learning_style_encoded'
        ]
        
        if 'avg_peer_score' in df.columns:
            feature_columns.extend(['avg_peer_score', 'total_tasks'])
        
        X = df[feature_columns].fillna(0)
        y = df['recommended_difficulty']
        
        print(f"Features shape: {X.shape}")
        print(f"Target shape: {y.shape}")
        
        return X, y, feature_columns
    
    def get_student_profile(self, student_id):
        """Get comprehensive student profile for predictions"""
        student = self.students[self.students['student_id'] == student_id].iloc[0].to_dict()
        
        # Get mastery scores
        mastery = self.mastery_labels[
            self.mastery_labels['student_id'] == student_id
        ][['subject', 'topic', 'final_mastery_score']].to_dict('records')
        
        student['mastery_scores'] = mastery
        
        return student

if __name__ == "__main__":
    # Test the processor
    processor = AMEPDataProcessor(data_path='../datasets/')
    processor.load_datasets()
    
    # Prepare all datasets
    X_mastery, y_mastery, mastery_cols = processor.prepare_mastery_features()
    X_engagement, y_engagement, engagement_cols = processor.prepare_engagement_features()
    X_recommend, y_recommend, recommend_cols = processor.prepare_recommendation_features()
    
    print("\n=== Data Preparation Complete ===")
    print(f"Mastery dataset ready: {X_mastery.shape}")
    print(f"Engagement dataset ready: {X_engagement.shape}")
    print(f"Recommendation dataset ready: {X_recommend.shape}")
