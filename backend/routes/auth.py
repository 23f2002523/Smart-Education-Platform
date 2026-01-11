from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    role = data.get("role")

    return jsonify({
        "status": "success",
        "role": role,
        "token": "fake-jwt-token"
    })
