from flask import Flask
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

try:
    from utils.db import init_db
    import os
    if not os.path.exists(Config.DATABASE_PATH):
        init_db()
        print("Database initialized!")
except Exception as e:
    print(f"Database initialization: {e}")

from routes.auth import auth_bp
from routes.student import student_bp
from routes.teacher import teacher_bp
from routes.admin import admin_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(student_bp, url_prefix="/api/student")
app.register_blueprint(teacher_bp, url_prefix="/api/teacher")
app.register_blueprint(admin_bp, url_prefix="/api/admin")

@app.route("/")
def index():
    return {"message": "SmartEd API is running", "status": "success"}

@app.route("/api/health")
def health():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
