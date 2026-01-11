from flask import Blueprint, jsonify

student_bp = Blueprint("student", __name__)

@student_bp.route("/dashboard", methods=["GET"])
def dashboard():
    return jsonify({
        "mastery_score": 0,
        "engagement_index": 0,
        "recommended_tasks": []
    })
