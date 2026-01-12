from flask import Blueprint, jsonify, request
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import token_required
from utils.db import execute_query
from datetime import datetime

teacher_bp = Blueprint("teacher", __name__)

@teacher_bp.route("/dashboard", methods=["GET"])
@token_required
def dashboard(current_user):
    """Get comprehensive teacher dashboard data"""
    try:
        teacher_id = current_user.get('user_id')
        teacher_subject = current_user.get('subject', 'Mathematics')
        
        # Get all students (in a real system, filter by teacher's classes)
        students = execute_query(
            "SELECT student_id, student_name, grade, section FROM students ORDER BY grade, section"
        )
        
        student_ids = [s['student_id'] for s in students]
        
        if not student_ids:
            return jsonify({"message": "No students found"}), 200
        
        # Calculate class-wide mastery
        class_mastery = execute_query(
            f"""SELECT AVG(final_mastery_score) as avg_mastery
               FROM mastery_scores 
               WHERE student_id IN ({','.join(['?']*len(student_ids))})""",
            tuple(student_ids),
            fetch_one=True
        )
        
        # Calculate engagement index
        engagement_index = execute_query(
            f"""SELECT AVG(engagement_score) as avg_engagement
               FROM engagement_logs 
               WHERE student_id IN ({','.join(['?']*len(student_ids))})
               AND timestamp >= datetime('now', '-30 days')""",
            tuple(student_ids),
            fetch_one=True
        )
        
        # Find at-risk students (low mastery or low engagement)
        at_risk_students = execute_query(
            f"""SELECT 
                s.student_id, s.student_name, s.grade, s.section,
                COALESCE(AVG(m.final_mastery_score), 0) as avg_mastery,
                COALESCE(AVG(e.engagement_score), 0) as avg_engagement
               FROM students s
               LEFT JOIN mastery_scores m ON s.student_id = m.student_id
               LEFT JOIN engagement_logs e ON s.student_id = e.student_id 
                   AND e.timestamp >= datetime('now', '-30 days')
               WHERE s.student_id IN ({','.join(['?']*len(student_ids))})
               GROUP BY s.student_id, s.student_name, s.grade, s.section
               HAVING avg_mastery < 65 OR avg_engagement < 60
               ORDER BY avg_mastery ASC
               LIMIT 10""",
            tuple(student_ids)
        )
        
        # Get topic-wise mastery breakdown
        topic_mastery = execute_query(
            f"""SELECT 
                topic, 
                AVG(final_mastery_score) as avg_mastery,
                COUNT(DISTINCT student_id) as student_count
               FROM mastery_scores 
               WHERE student_id IN ({','.join(['?']*len(student_ids))})
               GROUP BY topic
               ORDER BY avg_mastery ASC
               LIMIT 10""",
            tuple(student_ids)
        )
        
        # Get engagement distribution
        engagement_distribution = execute_query(
            f"""SELECT 
                CASE 
                    WHEN avg_eng >= 75 THEN 'high'
                    WHEN avg_eng >= 50 THEN 'medium'
                    ELSE 'low'
                END as level,
                COUNT(*) as count
               FROM (
                   SELECT student_id, AVG(engagement_score) as avg_eng
                   FROM engagement_logs
                   WHERE student_id IN ({','.join(['?']*len(student_ids))})
                   AND timestamp >= datetime('now', '-30 days')
                   GROUP BY student_id
               )
               GROUP BY level""",
            tuple(student_ids)
        )
        
        # Get recent quiz results
        recent_quizzes = execute_query(
            f"""SELECT 
                s.student_name, q.subject, q.topic, q.quiz_score, q.timestamp
               FROM quiz_attempts q
               JOIN students s ON q.student_id = s.student_id
               WHERE q.student_id IN ({','.join(['?']*len(student_ids))})
               ORDER BY q.timestamp DESC
               LIMIT 20""",
            tuple(student_ids)
        )
        
        # Generate AI insights
        insights = []
        
        # Insight 1: Struggling topics
        if topic_mastery:
            worst_topic = topic_mastery[0]
            insights.append({
                "type": "warning",
                "title": "Topic Needs Attention",
                "message": f"{worst_topic['topic']} has class average of {int(worst_topic['avg_mastery'])}%",
                "recommendation": f"Consider review session or alternative teaching approach for {worst_topic['topic']}"
            })
        
        # Insight 2: At-risk students
        if at_risk_students:
            insights.append({
                "type": "alert",
                "title": "Students Need Support",
                "message": f"{len(at_risk_students)} students showing low mastery or engagement",
                "recommendation": "Schedule one-on-one check-ins or provide targeted interventions"
            })
        
        # Insight 3: Engagement trends
        if engagement_index['avg_engagement'] and engagement_index['avg_engagement'] > 70:
            insights.append({
                "type": "success",
                "title": "Strong Class Engagement",
                "message": f"Class engagement at {int(engagement_index['avg_engagement'])}%",
                "recommendation": "Maintain current teaching strategies and interactive activities"
            })
        
        # Format engagement distribution
        engagement_dist = {"high": 0, "medium": 0, "low": 0}
        for dist in engagement_distribution:
            engagement_dist[dist['level']] = dist['count']
        
        total_students = len(student_ids)
        engagement_percentages = {
            "high": round((engagement_dist['high'] / total_students * 100), 1) if total_students > 0 else 0,
            "medium": round((engagement_dist['medium'] / total_students * 100), 1) if total_students > 0 else 0,
            "low": round((engagement_dist['low'] / total_students * 100), 1) if total_students > 0 else 0
        }
        
        response_data = {
            "kpi": {
                "avg_class_mastery": int(class_mastery['avg_mastery'] or 0),
                "engagement_index": int(engagement_index['avg_engagement'] or 0),
                "students_at_risk": len(at_risk_students),
                "total_students": total_students
            },
            "topic_mastery": [
                {
                    "topic": t['topic'],
                    "mastery": int(t['avg_mastery']),
                    "student_count": t['student_count'],
                    "status": "high" if t['avg_mastery'] >= 75 else "medium" if t['avg_mastery'] >= 50 else "low"
                } for t in topic_mastery
            ],
            "engagement_distribution": engagement_percentages,
            "at_risk_students": [
                {
                    "student_id": s['student_id'],
                    "name": s['student_name'],
                    "grade": s['grade'],
                    "section": s['section'],
                    "mastery": int(s['avg_mastery']),
                    "engagement": int(s['avg_engagement']),
                    "priority": "critical" if s['avg_mastery'] < 50 else "high"
                } for s in at_risk_students
            ],
            "recent_activity": [
                {
                    "student": q['student_name'],
                    "subject": q['subject'],
                    "topic": q['topic'],
                    "score": q['quiz_score'],
                    "date": q['timestamp']
                } for q in recent_quizzes[:10]
            ],
            "ai_insights": insights
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in teacher dashboard: {str(e)}")
        return jsonify({"error": str(e)}), 500

@teacher_bp.route("/classes", methods=["GET"])
@token_required
def get_classes(current_user):
    """Get teacher's classes"""
    try:
        # Get unique grade/section combinations
        classes = execute_query(
            """SELECT DISTINCT grade, section, COUNT(*) as student_count
               FROM students
               GROUP BY grade, section
               ORDER BY grade, section"""
        )
        
        return jsonify({
            "classes": [
                {
                    "grade": c['grade'],
                    "section": c['section'],
                    "student_count": c['student_count']
                } for c in classes
            ]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
