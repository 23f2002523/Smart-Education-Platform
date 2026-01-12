from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.db import execute_query
from utils.auth import hash_password, verify_password, generate_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    return jsonify({
        'status': 'error',
        'message': 'Registration is disabled for this demo. Please use the pre-seeded accounts.'
    }), 403

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'status': 'error',
                'message': 'Email and password are required'
            }), 400
        
        email = data.get('email').lower().strip()
        password = data.get('password')
        role = data.get('role', '').lower() if data.get('role') else None
        
        user = execute_query(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            (email,),
            fetch_one=True
        )
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        if not verify_password(password, user['password_hash']):
            return jsonify({
                'status': 'error',
                'message': 'Invalid email or password'
            }), 401
        
        if role and user['role'] != role:
            return jsonify({
                'status': 'error',
                'message': f'This account is not registered as a {role}'
            }), 401
        
        execute_query(
            'UPDATE users SET last_login = ? WHERE user_id = ?',
            (datetime.now(), user['user_id']),
            commit=True
        )
        
        token = generate_token(user['user_id'], user['email'], user['role'])
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'token': token,
            'user': {
                'user_id': user['user_id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'role': user['role'],
                'grade': user['grade'],
                'subject': user['subject']
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred during login'
        }), 500

@auth_bp.route("/verify", methods=["GET"])
def verify():
    try:
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'status': 'error', 'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'status': 'error', 'message': 'Token is missing'}), 401
        
        from utils.auth import decode_token
        payload = decode_token(token)
        
        if not payload:
            return jsonify({'status': 'error', 'message': 'Invalid or expired token'}), 401
        
        return jsonify({
            'status': 'success',
            'user': {
                'user_id': payload['user_id'],
                'email': payload['email'],
                'role': payload['role']
            }
        }), 200
        
    except Exception as e:
        print(f"Verify error: {str(e)}")
        return jsonify({'status': 'error', 'message': 'Token verification failed'}), 500
