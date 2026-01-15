from flask import Blueprint, jsonify, request
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.auth import token_required, role_required
from utils.db import execute_query
from datetime import datetime

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/dashboard", methods=["GET"])
@token_required
@role_required(['admin'])
def dashboard(current_user):
    """Get comprehensive admin dashboard data"""
    try:
        # Get all students
        all_students = execute_query(
            "SELECT student_id FROM students"
        )
        
        student_ids = [s['student_id'] for s in all_students]
        total_students = len(student_ids)
        
        if total_students == 0:
            return jsonify({"message": "No students in system"}), 200
        
        # Overall institutional mastery rate
        overall_mastery = execute_query(
            f"""SELECT AVG(final_mastery_score) as avg_mastery
               FROM mastery_scores
               WHERE student_id IN ({','.join(['?']*len(student_ids))})""",
            tuple(student_ids),
            fetch_one=True
        )
        
        # Average engagement across institution
        avg_engagement = execute_query(
            f"""SELECT AVG(engagement_score) as avg_engagement
               FROM engagement_logs
               WHERE student_id IN ({','.join(['?']*len(student_ids))})
               AND timestamp >= datetime('now', '-30 days')""",
            tuple(student_ids),
            fetch_one=True
        )
    
        active_students = execute_query(
            f"""SELECT COUNT(DISTINCT student_id) as count
               FROM engagement_logs
               WHERE student_id IN ({','.join(['?']*len(student_ids))})
               AND timestamp >= datetime('now', '-7 days')""",
            tuple(student_ids),
            fetch_one=True
        )
        
        # Teacher adoption (users with teacher role)
        teacher_stats = execute_query(
            """SELECT 
                COUNT(*) as total_teachers,
                SUM(CASE WHEN last_login >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as active_teachers
               FROM users
               WHERE role = 'teacher'""",
            fetch_one=True
        )
        
        # Mastery trend over last 5 months
        mastery_trend = execute_query(
            f"""SELECT 
                strftime('%Y-%m', m.updated_at) as month,
                AVG(m.final_mastery_score) as avg_mastery
               FROM mastery_scores m
               WHERE m.student_id IN ({','.join(['?']*len(student_ids))})
               AND m.updated_at >= datetime('now', '-5 months')
               GROUP BY month
               ORDER BY month ASC""",
            tuple(student_ids)
        )
        
        # Subject-wise performance
        subject_performance = execute_query(
            f"""SELECT 
                subject,
                AVG(final_mastery_score) as avg_mastery,
                COUNT(DISTINCT student_id) as student_count
               FROM mastery_scores
               WHERE student_id IN ({','.join(['?']*len(student_ids))})
               GROUP BY subject
               ORDER BY avg_mastery DESC""",
            tuple(student_ids)
        )
        
        # Engagement distribution
        engagement_dist = execute_query(
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
        
        # Teacher usage patterns
        teacher_usage = execute_query(
            """SELECT 
                COUNT(*) as count,
                CASE 
                    WHEN last_login >= datetime('now', '-3 days') THEN 'high'
                    WHEN last_login >= datetime('now', '-7 days') THEN 'medium'
                    ELSE 'low'
                END as usage_level
               FROM users
               WHERE role = 'teacher'
               GROUP BY usage_level"""
        )
        
        # Calculate confidence score based on multiple factors
        mastery_factor = (overall_mastery['avg_mastery'] or 0) / 100
        engagement_factor = (avg_engagement['avg_engagement'] or 0) / 100
        adoption_rate = (teacher_stats['active_teachers'] / teacher_stats['total_teachers']) if teacher_stats['total_teachers'] > 0 else 0
        coverage_rate = (active_students['count'] / total_students) if total_students > 0 else 0
        
        confidence_score = int((
            mastery_factor * 0.35 +
            engagement_factor * 0.25 +
            adoption_rate * 0.25 +
            coverage_rate * 0.15
        ) * 100)
        
        # Format engagement distribution
        engagement_percentages = {"high": 0, "medium": 0, "low": 0}
        for dist in engagement_dist:
            engagement_percentages[dist['level']] = round((dist['count'] / total_students * 100), 1)
        
        # Format teacher usage
        teacher_usage_dist = {"high": 0, "medium": 0, "low": 0}
        for usage in teacher_usage:
            teacher_usage_dist[usage['usage_level']] = usage['count']
        
        total_teachers = teacher_stats['total_teachers'] or 1
        
        # Generate system alerts
        alerts = []
        
        # Check for subjects needing attention
        for subject in subject_performance:
            if subject['avg_mastery'] < 60:
                alerts.append({
                    "type": "warning",
                    "message": f"{subject['subject']} department mastery below target ({int(subject['avg_mastery'])}%)",
                    "action": "Review curriculum and teaching strategies"
                })
        
        # Check teacher onboarding
        inactive_teachers = total_teachers - teacher_stats['active_teachers']
        if inactive_teachers > 0:
            alerts.append({
                "type": "info",
                "message": f"{inactive_teachers} teachers pending onboarding completion",
                "action": "Send reminder and provide support"
            })
        
        # Positive trends
        if avg_engagement['avg_engagement'] and avg_engagement['avg_engagement'] > 70:
            alerts.append({
                "type": "success",
                "message": f"Overall engagement strong at {int(avg_engagement['avg_engagement'])}%",
                "action": "Share best practices with faculty"
            })
        
        response_data = {
            "kpi": {
                "overall_mastery": int(overall_mastery['avg_mastery'] or 0),
                "avg_engagement": int(avg_engagement['avg_engagement'] or 0),
                "teacher_adoption": int(adoption_rate * 100),
                "active_students": active_students['count'],
                "total_students": total_students
            },
            "mastery_trend": [
                {
                    "month": t['month'],
                    "value": int(t['avg_mastery'])
                } for t in mastery_trend
            ],
            "subject_performance": [
                {
                    "subject": s['subject'],
                    "mastery": int(s['avg_mastery']),
                    "student_count": s['student_count'],
                    "status": "high" if s['avg_mastery'] >= 75 else "medium" if s['avg_mastery'] >= 60 else "low"
                } for s in subject_performance
            ],
            "engagement_distribution": engagement_percentages,
            "teacher_usage": {
                "high": teacher_usage_dist.get('high', 0),
                "medium": teacher_usage_dist.get('medium', 0),
                "low": teacher_usage_dist.get('low', 0),
                "total": total_teachers
            },
            "confidence_score": {
                "score": confidence_score,
                "level": "High" if confidence_score >= 75 else "Medium" if confidence_score >= 50 else "Low",
                "factors": [
                    {"name": "Mastery Trends", "score": int(mastery_factor * 100)},
                    {"name": "Engagement Consistency", "score": int(engagement_factor * 100)},
                    {"name": "Teacher Adoption", "score": int(adoption_rate * 100)},
                    {"name": "Data Coverage", "score": int(coverage_rate * 100)}
                ]
            },
            "alerts": alerts
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Error in admin dashboard: {str(e)}")
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/users", methods=["GET"])
@token_required
@role_required(['admin'])
def get_users(current_user):
    """Get all users in the system"""
    try:
        users = execute_query(
            """SELECT user_id, email, full_name, role, grade, subject, 
                      is_active, created_at, last_login
               FROM users
               ORDER BY created_at DESC"""
        )
        
        return jsonify({
            "users": [
                {
                    "user_id": u['user_id'],
                    "email": u['email'],
                    "name": u['full_name'],
                    "role": u['role'],
                    "grade": u['grade'],
                    "subject": u['subject'],
                    "active": bool(u['is_active']),
                    "created": u['created_at'],
                    "last_login": u['last_login']
                } for u in users
            ]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/reports", methods=["GET"])
@token_required
@role_required(['admin'])
def get_reports(current_user):
    """Get available reports"""
    try:
        reports = [
            {
                "name": "Academic Performance Report",
                "type": "PDF",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "status": "Ready"
            },
            {
                "name": "Engagement Analytics",
                "type": "CSV",
                "date": datetime.now().strftime("%Y-%m-%d"),
                "status": "Ready"
            },
            {
                "name": "Teacher Utilization",
                "type": "PDF",
                "date": (datetime.now().replace(day=datetime.now().day-1)).strftime("%Y-%m-%d"),
                "status": "Ready"
            },
            {
                "name": "Student Progress Summary",
                "type": "CSV",
                "date": (datetime.now().replace(day=datetime.now().day-2)).strftime("%Y-%m-%d"),
                "status": "Ready"
            }
        ]
        
        return jsonify({"reports": reports}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
