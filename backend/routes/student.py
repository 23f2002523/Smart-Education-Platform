from flask import Blueprint, jsonify, request
import sys
import os

# Add relevant paths for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'ml', 'src'))

from utils.auth import token_required
from utils.db import execute_query
from datetime import datetime, timedelta
import random

# Import ML Predictor
try:
    from predict import AMEPPredictor
    ML_MODELS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'ml', 'models', '')
    predictor = AMEPPredictor(models_path=ML_MODELS_PATH)
    HAS_ML = True
except Exception as e:
    print(f"Warning: Could not initialize ML Predictor: {e}")
    HAS_ML = False

student_bp = Blueprint("student", __name__)

@student_bp.route("/dashboard", methods=["GET"])
@token_required
def dashboard(current_user):
    """Get comprehensive student dashboard data"""
    try:
        student_id = current_user.get('user_id')
        
        # Get student profile
        student_profile = execute_query(
            "SELECT s.*, u.full_name, u.email FROM students s JOIN users u ON s.user_id = u.user_id WHERE s.user_id = ?",
            (student_id,),
            fetch_one=True
        )
        
        if not student_profile:
            return jsonify({"error": "Student profile not found"}), 404
        
        # Get overall mastery score across all subjects
        mastery_data = execute_query(
            """SELECT AVG(final_mastery_score) as avg_mastery, 
               COUNT(DISTINCT subject) as subject_count
               FROM mastery_scores WHERE student_id = ?""",
            (student_profile['student_id'],),
            fetch_one=True
        )
        
        # Get subject-wise mastery
        subject_mastery = execute_query(
            """SELECT subject, AVG(final_mastery_score) as mastery, 
               COUNT(DISTINCT topic) as topics_covered
               FROM mastery_scores 
               WHERE student_id = ? 
               GROUP BY subject
               ORDER BY mastery DESC""",
            (student_profile['student_id'],)
        )
        
        # Get engagement metrics for last 30 days
        engagement_data = execute_query(
            """SELECT AVG(engagement_score) as avg_engagement,
               SUM(duration_seconds) as total_time,
               COUNT(*) as session_count
               FROM engagement_logs 
               WHERE student_id = ? 
               AND timestamp >= datetime('now', '-30 days')""",
            (student_profile['student_id'],),
            fetch_one=True
        )
        
        # Get recent quiz performance
        recent_quizzes = execute_query(
            """SELECT subject, topic, quiz_score, timestamp, difficulty_level
               FROM quiz_attempts 
               WHERE student_id = ? 
               ORDER BY timestamp DESC 
               LIMIT 10""",
            (student_profile['student_id'],)
        )
        
        # Get weekly performance trend
        weekly_performance = execute_query(
            """SELECT strftime('%Y-%W', timestamp) as week, 
               AVG(quiz_score) as avg_score
               FROM quiz_attempts 
               WHERE student_id = ? 
               AND timestamp >= datetime('now', '-8 weeks')
               GROUP BY week
               ORDER BY week DESC
               LIMIT 8""",
            (student_profile['student_id'],)
        )
        
        # Get project activity
        project_data = execute_query(
            """SELECT project_id, role_in_team, tasks_completed,
               peer_review_score, collaboration_score, 
               project_completion_pct, created_at
               FROM project_activity 
               WHERE student_id = ?
               ORDER BY created_at DESC
               LIMIT 5""",
            (student_profile['student_id'],)
        )
        
        # Get weak subjects for initial recommendations
        weak_subjects = execute_query(
            """SELECT subject, topic, final_mastery_score
               FROM mastery_scores 
               WHERE student_id = ? 
               AND final_mastery_score < 70
               ORDER BY final_mastery_score ASC
               LIMIT 5""",
            (student_profile['student_id'],)
        )
        
        # ML-Powered Recommendations and Insights
        recommendations = []
        ai_insight = "Based on your recent activity, you are progressing well."
        
        if HAS_ML:
            try:
                # Prepare data for ML prediction
                ml_input = {
                    'grade': student_profile['grade'],
                    'learning_pace': student_profile['learning_pace'],
                    'baseline_proficiency': student_profile.get('baseline_proficiency', 70),
                    'avg_mastery_score': mastery_data['avg_mastery'] or 0,
                    'total_tasks': sum(p['tasks_completed'] for p in project_data) if project_data else 0,
                    'avg_peer_score': sum(p['peer_review_score'] for p in project_data)/len(project_data) if project_data else 0
                }
                
                # Get ML recommendations
                ml_recommendation = predictor.recommend_tasks(ml_input)
                diff = ml_recommendation['difficulty_level']
                
                recommendations.append({
                    "type": "ai_recommendation",
                    "subject": "Personalized",
                    "topic": f"{diff.capitalize()} Level Tasks",
                    "priority": "high",
                    "description": f"Our AI suggests focusing on {diff} difficulty tasks to optimize your learning pace.",
                    "icon": "ai"
                })
                
                # Get a prediction for next mastery level
                if recent_quizzes:
                    recent = recent_quizzes[0]
                    ml_input.update({
                        'quiz_score': recent['quiz_score'],
                        'time_taken_seconds': 300, # Default if not tracked
                        'difficulty_level': recent['difficulty_level']
                    })
                    predicted_next = predictor.predict_mastery_score(ml_input)
                    ai_insight = f"Your predicted mastery for the next session is {predicted_next}%. Keep it up!"
                
            except Exception as ml_err:
                print(f"ML Prediction Error: {ml_err}")

        # Add rule-based recommendations
        for weak in weak_subjects:
            recommendations.append({
                "type": "practice",
                "subject": weak['subject'],
                "topic": weak['topic'],
                "priority": "high" if weak['final_mastery_score'] < 50 else "medium",
                "description": f"Practice {weak['topic']} to improve from {weak['final_mastery_score']}%",
                "icon": "practice"
            })
        
        # Add project recommendations
        if len(project_data) < 2:
            recommendations.append({
                "type": "project",
                "subject": "General",
                "topic": "Project-Based Learning",
                "priority": "medium",
                "description": "Join a collaborative project to enhance teamwork skills",
                "icon": "project"
            })
        
        # Calculate streak and engagement level
        recent_engagement = execute_query(
            """SELECT DATE(timestamp) as activity_date
               FROM engagement_logs
               WHERE student_id = ?
               AND timestamp >= datetime('now', '-30 days')
               GROUP BY DATE(timestamp)
               ORDER BY activity_date DESC""",
            (student_profile['student_id'],)
        )
        
        streak = calculate_streak(recent_engagement)
        
        response_data = {
            "profile": {
                "name": student_profile['full_name'] or student_profile['student_name'],
                "grade": student_profile['grade'],
                "section": student_profile['section'],
                "learning_pace": student_profile['learning_pace'],
                "learning_style": student_profile['preferred_learning_style'],
                "ai_insight": ai_insight
            },
            "mastery": {
                "overall": int(mastery_data['avg_mastery'] or 0),
                "subject_count": mastery_data['subject_count'] or 0,
                "by_subject": [
                    {
                        "subject": s['subject'],
                        "score": int(s['mastery']),
                        "topics": s['topics_covered']
                    } for s in subject_mastery
                ]
            },
            "engagement": {
                "score": int(engagement_data['avg_engagement'] or 0),
                "total_time_hours": round((engagement_data['total_time'] or 0) / 3600, 1),
                "session_count": engagement_data['session_count'] or 0,
                "streak_days": streak
            },
            "weekly_performance": [
                {
                    "week": w['week'],
                    "score": int(w['avg_score'])
                } for w in reversed(weekly_performance)
            ],
            "recent_quizzes": [
                {
                    "subject": q['subject'],
                    "topic": q['topic'],
                    "score": q['quiz_score'],
                    "difficulty": q['difficulty_level'],
                    "date": q['timestamp']
                } for q in recent_quizzes
            ],
            "projects": [
                {
                    "project_id": p['project_id'],
                    "role": p['role_in_team'],
                    "tasks_completed": p['tasks_completed'],
                    "peer_score": p['peer_review_score'],
                    "collaboration": p['collaboration_score'],
                    "completion": p['project_completion_pct'],
                    "date": p['created_at']
                } for p in project_data
            ],
            "recommendations": recommendations[:6]
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in student dashboard: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_streak(engagement_dates):
    """Calculate consecutive days streak"""
    if not engagement_dates:
        return 0
    
    streak = 0
    current_date = datetime.now().date()
    
    for record in engagement_dates:
        activity_date = datetime.strptime(record['activity_date'], '%Y-%m-%d').date()
        expected_date = current_date - timedelta(days=streak)
        
        if activity_date == expected_date:
            streak += 1
        else:
            break
    
    return streak

@student_bp.route("/analytics", methods=["GET"])
@token_required
def analytics(current_user):
    """Get detailed analytics data for student"""
    try:
        student_id = current_user.get('user_id')
        
        # Get student ID from user_id
        student = execute_query(
            "SELECT student_id, student_name FROM students WHERE user_id = ?",
            (student_id,),
            fetch_one=True
        )
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Get comprehensive mastery data
        mastery_data = execute_query(
            """SELECT AVG(final_mastery_score) as avg_mastery
               FROM mastery_scores WHERE student_id = ?""",
            (student['student_id'],),
            fetch_one=True
        )
        
        # Subject-wise mastery with topics
        subject_mastery = execute_query(
            """SELECT subject, topic, final_mastery_score, predicted_mastery_score,
               updated_at
               FROM mastery_scores 
               WHERE student_id = ? 
               ORDER BY subject, final_mastery_score DESC""",
            (student['student_id'],)
        )
        
        # Engagement trends over time
        engagement_trends = execute_query(
            """SELECT DATE(timestamp) as date, 
               AVG(engagement_score) as avg_engagement,
               SUM(duration_seconds) as total_duration
               FROM engagement_logs 
               WHERE student_id = ? 
               AND timestamp >= datetime('now', '-30 days')
               GROUP BY DATE(timestamp)
               ORDER BY date""",
            (student['student_id'],)
        )
        
        # Quiz performance trends
        quiz_trends = execute_query(
            """SELECT DATE(timestamp) as date,
               AVG(quiz_score) as avg_score,
               COUNT(*) as quiz_count
               FROM quiz_attempts 
               WHERE student_id = ? 
               AND timestamp >= datetime('now', '-60 days')
               GROUP BY DATE(timestamp)
               ORDER BY date""",
            (student['student_id'],)
        )
        
        # Get weekly performance
        weekly_performance = execute_query(
            """SELECT strftime('%Y-%W', timestamp) as week,
               AVG(quiz_score) as avg_score,
               COUNT(*) as attempts
               FROM quiz_attempts 
               WHERE student_id = ? 
               AND timestamp >= datetime('now', '-12 weeks')
               GROUP BY week
               ORDER BY week""",
            (student['student_id'],)
        )
        
        # Calculate engagement score and time
        engagement_summary = execute_query(
            """SELECT AVG(engagement_score) as score,
               SUM(duration_seconds) as total_time
               FROM engagement_logs 
               WHERE student_id = ? 
               AND timestamp >= datetime('now', '-30 days')""",
            (student['student_id'],),
            fetch_one=True
        )

        # Get project metrics for ML
        project_metrics = execute_query(
            """SELECT AVG(communication_score) as avg_comm,
               AVG(collaboration_score) as avg_collab,
               AVG(creativity_score) as avg_creat,
               AVG(peer_review_score) as avg_peer,
               AVG(project_completion_pct) as avg_completion,
               SUM(tasks_completed) as total_tasks
               FROM project_activity 
               WHERE student_id = ?""",
            (student['student_id'],),
            fetch_one=True
        )

        # Predict future engagement if possible
        predicted_engagement = None
        if HAS_ML and engagement_summary and engagement_summary['score'] is not None:
            try:
                ml_input = {
                    'tasks_completed': project_metrics['total_tasks'] or 5,
                    'peer_review_score': project_metrics['avg_peer'] or 4.0,
                    'communication_score': project_metrics['avg_comm'] or 4.0,
                    'collaboration_score': project_metrics['avg_collab'] or 4.0,
                    'creativity_score': project_metrics['avg_creat'] or 4.0,
                    'project_completion_pct': project_metrics['avg_completion'] or 75.0,
                    'role_in_team': 'Member',
                    'grade': student.get('grade', 10)
                }
                predicted_engagement = predictor.predict_engagement_index(ml_input)
            except Exception as ml_err:
                print(f"Engagement Prediction Error: {ml_err}")
                pass
        
        return jsonify({
            "profile": {
                "name": student['student_name'],
                "predicted_engagement": predicted_engagement
            },
            "mastery": {
                "overall": int(mastery_data['avg_mastery'] or 0),
                "by_subject": organize_subject_mastery(subject_mastery)
            },
            "engagement": {
                "score": int(engagement_summary['score'] or 0),
                "total_time_hours": round((engagement_summary['total_time'] or 0) / 3600, 1),
                "trends": [
                    {
                        "date": e['date'],
                        "score": int(e['avg_engagement'] or 0),
                        "duration": e['total_duration'] or 0
                    } for e in engagement_trends
                ]
            },
            "weekly_performance": [
                {
                    "week": w['week'],
                    "score": int(w['avg_score'] or 0),
                    "attempts": w['attempts'] or 0
                } for w in weekly_performance
            ],
            "quiz_trends": [
                {
                    "date": q['date'],
                    "score": int(q['avg_score'] or 0),
                    "count": q['quiz_count'] or 0
                } for q in quiz_trends
            ]
        }), 200
        
    except Exception as e:
        print(f"Error in analytics: {str(e)}")
        return jsonify({"error": str(e)}), 500

@student_bp.route("/practice", methods=["GET"])
@token_required
def practice(current_user):
    """Get practice recommendations and history"""
    try:
        student_id = current_user.get('user_id')
        
        student = execute_query(
            "SELECT student_id, student_name FROM students WHERE user_id = ?",
            (student_id,),
            fetch_one=True
        )
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Get weak areas for practice
        weak_areas = execute_query(
            """SELECT subject, topic, final_mastery_score
               FROM mastery_scores 
               WHERE student_id = ? 
               AND final_mastery_score < 70
               ORDER BY final_mastery_score ASC
               LIMIT 10""",
            (student['student_id'],)
        )
        
        # Get strong areas for challenges
        strong_areas = execute_query(
            """SELECT subject, topic, final_mastery_score
               FROM mastery_scores 
               WHERE student_id = ? 
               AND final_mastery_score >= 75
               ORDER BY final_mastery_score DESC
               LIMIT 5""",
            (student['student_id'],)
        )
        
        # Get practice history from quiz attempts
        practice_history = execute_query(
            """SELECT subject, topic, quiz_score, difficulty_level, timestamp
               FROM quiz_attempts 
               WHERE student_id = ? 
               ORDER BY timestamp DESC 
               LIMIT 20""",
            (student['student_id'],)
        )
        
        # Calculate streak
        recent_activity = execute_query(
            """SELECT DATE(timestamp) as activity_date
               FROM quiz_attempts
               WHERE student_id = ?
               AND timestamp >= datetime('now', '-30 days')
               GROUP BY DATE(timestamp)
               ORDER BY activity_date DESC""",
            (student['student_id'],)
        )
        
        streak = calculate_streak(recent_activity)
        
        # Get ML recommendations if available
        ai_recommendations = []
        if HAS_ML:
            try:
                # Get latest stats for ML
                latest_stats = execute_query(
                    """SELECT AVG(final_mastery_score) as avg_mastery,
                              AVG(engagement_score) as avg_engagement
                       FROM mastery_scores m
                       JOIN engagement_logs e ON m.student_id = e.student_id
                       WHERE m.student_id = ?""",
                    (student['student_id'],),
                    fetch_one=True
                )
                
                ml_input = {
                    'mastery_score': latest_stats['avg_mastery'] or 60,
                    'engagement_score': latest_stats['avg_engagement'] or 60,
                    'last_quiz_score': 70, # Default
                    'time_spent': 1200,
                    'subject': weak_areas[0]['subject'] if weak_areas else 'Mathematics'
                }
                
                recs = predictor.recommend_tasks(ml_input)
                for r in recs[:3]:
                    ai_recommendations.append({
                        "subject": r['subject'],
                        "topic": r['topic'],
                        "reason": f"AI identified this as optimal for your current level ({r['match_score']}% match)",
                        "current_mastery": int(latest_stats['avg_mastery'] or 0),
                        "type": "ai_recommended",
                        "priority": "critical"
                    })
            except Exception as ml_err:
                print(f"ML Rec Error: {ml_err}")

        # Get mastery overview
        mastery_overview = execute_query(
            """SELECT AVG(final_mastery_score) as overall
               FROM mastery_scores WHERE student_id = ?""",
            (student['student_id'],),
            fetch_one=True
        )
        
        return jsonify({
            "profile": {
                "name": student['student_name']
            },
            "mastery": {
                "overall": int(mastery_overview['overall'] or 0)
            },
            "recommendations": ai_recommendations + [
                {
                    "subject": w['subject'],
                    "topic": w['topic'],
                    "reason": f"Current mastery: {int(w['final_mastery_score'])}%. Practice to improve.",
                    "current_mastery": int(w['final_mastery_score']),
                    "type": "improvement"
                } for w in weak_areas
            ],
            "challenges": [
                {
                    "subject": s['subject'],
                    "topic": s['topic'],
                    "reason": f"You've mastered this at {int(s['final_mastery_score'])}%! Ready for advanced challenges?",
                    "current_mastery": int(s['final_mastery_score']),
                    "type": "challenge"
                } for s in strong_areas
            ],
            "practice_history": [
                {
                    "subject": p['subject'],
                    "topic": p['topic'],
                    "score": p['quiz_score'],
                    "difficulty": p['difficulty_level'],
                    "timestamp": p['timestamp']
                } for p in practice_history
            ],
            "streak_days": streak
        }), 200
        
    except Exception as e:
        print(f"Error in practice: {str(e)}")
        return jsonify({"error": str(e)}), 500

@student_bp.route("/projects", methods=["GET"])
@token_required
def projects(current_user):
    """Get PBL project data"""
    try:
        student_id = current_user.get('user_id')
        
        student = execute_query(
            "SELECT student_id, student_name FROM students WHERE user_id = ?",
            (student_id,),
            fetch_one=True
        )
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Get all projects
        project_data = execute_query(
            """SELECT project_id, role_in_team, tasks_completed,
               peer_review_score, collaboration_score, 
               project_completion_pct, created_at
               FROM project_activity 
               WHERE student_id = ?
               ORDER BY created_at DESC""",
            (student['student_id'],)
        )
        
        return jsonify({
            "profile": {
                "name": student['student_name']
            },
            "projects": [
                {
                    "id": p['project_id'],
                    "role": p['role_in_team'],
                    "tasks_completed": p['tasks_completed'],
                    "peer_score": p['peer_review_score'],
                    "collaboration": p['collaboration_score'],
                    "completion": p['project_completion_pct'],
                    "created_at": p['created_at']
                } for p in project_data
            ]
        }), 200
        
    except Exception as e:
        print(f"Error in projects: {str(e)}")
        return jsonify({"error": str(e)}), 500

@student_bp.route("/settings", methods=["GET"])
@token_required
def get_settings(current_user):
    """Get student settings and profile"""
    try:
        student_id = current_user.get('user_id')
        
        student_profile = execute_query(
            """SELECT s.*, u.full_name, u.email 
               FROM students s 
               JOIN users u ON s.user_id = u.user_id 
               WHERE s.user_id = ?""",
            (student_id,),
            fetch_one=True
        )
        
        if not student_profile:
            return jsonify({"error": "Student not found"}), 404
        
        return jsonify({
            "profile": {
                "name": student_profile['full_name'] or student_profile['student_name'],
                "email": student_profile['email'],
                "grade": student_profile['grade'],
                "section": student_profile['section'],
                "learning_pace": student_profile['learning_pace'],
                "learning_style": student_profile['preferred_learning_style']
            }
        }), 200
        
    except Exception as e:
        print(f"Error in settings: {str(e)}")
        return jsonify({"error": str(e)}), 500

@student_bp.route("/settings", methods=["PUT"])
@token_required
def update_settings(current_user):
    """Update student settings"""
    try:
        student_id = current_user.get('user_id')
        data = request.get_json()
        
        # Update student profile
        if 'learning_pace' in data or 'preferred_learning_style' in data:
            execute_query(
                """UPDATE students 
                   SET learning_pace = COALESCE(?, learning_pace),
                       preferred_learning_style = COALESCE(?, preferred_learning_style)
                   WHERE user_id = ?""",
                (data.get('learning_pace'), data.get('preferred_learning_style'), student_id),
                commit=True
            )
        
        # Update user info
        if 'full_name' in data or 'email' in data:
            execute_query(
                """UPDATE users 
                   SET full_name = COALESCE(?, full_name),
                       email = COALESCE(?, email)
                   WHERE user_id = ?""",
                (data.get('full_name'), data.get('email'), student_id),
                commit=True
            )
        
        return jsonify({"message": "Settings updated successfully"}), 200
        
    except Exception as e:
        print(f"Error updating settings: {str(e)}")
        return jsonify({"error": str(e)}), 500

def organize_subject_mastery(mastery_list):
    """Organize mastery data by subject with topics"""
    subjects = {}
    for item in mastery_list:
        subject = item['subject']
        if subject not in subjects:
            subjects[subject] = {
                "subject": subject,
                "topics": [],
                "avg_score": 0
            }
        subjects[subject]["topics"].append({
            "topic": item['topic'],
            "mastery": int(item['final_mastery_score']),
            "predicted_score": item['predicted_mastery_score']
        })
    
    # Calculate average score per subject
    for subject in subjects.values():
        if subject["topics"]:
            subject["avg_score"] = int(sum(t['mastery'] for t in subject['topics']) / len(subject['topics']))
            subject["score"] = subject["avg_score"]
    
    return list(subjects.values())
