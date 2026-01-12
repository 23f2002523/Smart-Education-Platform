import sqlite3
import uuid
import random
import bcrypt
from datetime import datetime, timedelta

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_data():
    db_path = 'c:/Users/SAGAR/OneDrive/Desktop/smart_Ed/database/smarted.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Clear existing data
    cursor.execute("DELETE FROM project_activity")
    cursor.execute("DELETE FROM engagement_logs")
    cursor.execute("DELETE FROM quiz_attempts")
    cursor.execute("DELETE FROM students")
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM mastery_scores")

    students_info = [
        ("Sagar Kumar", "sagar@smarted.com", "password123", 10, "A", "High"),
        ("Aavash Adhikari", "aavash@smarted.com", "password123", 10, "A", "Medium"),
        ("Bibek Thapa", "bibek@smarted.com", "password123", 10, "B", "Low"),
        ("Anjali Rana", "anjali@smarted.com", "password123", 10, "B", "High"),
        ("Prakash Bhatta", "prakash@smarted.com", "password123", 10, "A", "Medium"),
        ("Sita Sharma", "sita@smarted.com", "password123", 10, "C", "Low"),
        ("Ramesh Giri", "ramesh@smarted.com", "password123", 10, "C", "High"),
        ("Sunita Yadav", "sunita@smarted.com", "password123", 10, "A", "Medium"),
        ("Gopal Jha", "gopal@smarted.com", "password123", 10, "B", "Low"),
        ("Maya Rai", "maya@smarted.com", "password123", 10, "C", "High")
    ]

    subjects = ["Mathematics", "Science", "Computer Science"]
    topics = {
        "Mathematics": ["Algebra", "Geometry", "Calculus"],
        "Science": ["Physics", "Chemistry", "Biology"],
        "Computer Science": ["Programming", "Data Structures", "Web Development"]
    }

    print("Seeding users and students...")
    for full_name, email, password, grade, section, perf_type in students_info:
        user_id = str(uuid.uuid4())
        student_id = str(uuid.uuid4())
        password_hash = hash_password(password)

        # Insert User
        cursor.execute("""
            INSERT INTO users (user_id, email, password_hash, full_name, role, grade)
            VALUES (?, ?, ?, ?, 'student', ?)
        """, (user_id, email, password_hash, full_name, str(grade)))

        # Insert Student
        learning_style = random.choice(['visual', 'textual', 'mixed'])
        learning_pace = 'fast' if perf_type == "High" else 'average' if perf_type == "Medium" else 'slow'
        baseline = 80 if perf_type == "High" else 60 if perf_type == "Medium" else 40
        
        cursor.execute("""
            INSERT INTO students (student_id, user_id, student_name, grade, section, institution_id, baseline_proficiency, learning_pace, preferred_learning_style)
            VALUES (?, ?, ?, ?, ?, 'INST001', ?, ?, ?)
        """, (student_id, user_id, full_name, grade, section, baseline, learning_pace, learning_style))

        # Seed Quiz Attempts and Mastery Scores
        for sub in subjects:
            for top in topics[sub]:
                num_attempts = random.randint(2, 5)
                last_score = 0
                for i in range(num_attempts):
                    attempt_id = str(uuid.uuid4())
                    score = random.randint(70, 100) if perf_type == "High" else random.randint(50, 85) if perf_type == "Medium" else random.randint(30, 65)
                    last_score = score
                    time_taken = random.randint(300, 1800)
                    difficulty = random.choice(['easy', 'medium', 'hard'])
                    
                    cursor.execute("""
                        INSERT INTO quiz_attempts (attempt_id, student_id, subject, topic, quiz_id, quiz_score, time_taken_seconds, number_of_attempts, difficulty_level, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (attempt_id, student_id, sub, top, f"QUIZ_{random.randint(100,999)}", score, time_taken, i+1, difficulty, (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()))
                
                # Mastery Score for this topic
                level = 'advanced' if last_score > 80 else 'intermediate' if last_score > 50 else 'beginner'
                cursor.execute("""
                    INSERT INTO mastery_scores (student_id, subject, topic, final_mastery_score, mastery_level)
                    VALUES (?, ?, ?, ?, ?)
                """, (student_id, sub, top, last_score, level))

        # Seed Engagement Logs
        for _ in range(20):
            cursor.execute("""
                INSERT INTO engagement_logs (student_id, session_id, activity_type, duration_seconds, interaction_count, timestamp, engagement_score)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (student_id, str(uuid.uuid4()), random.choice(['video', 'reading', 'quiz', 'forum']), random.randint(60, 3000), random.randint(5, 50), (datetime.now() - timedelta(hours=random.randint(1, 500))).isoformat(), random.randint(40, 100)))

        # Seed Project Activity
        cursor.execute("""
            INSERT INTO project_activity (project_id, student_id, team_id, role_in_team, tasks_completed, peer_review_score, communication_score, collaboration_score, creativity_score, project_completion_pct)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"PROJ_{random.randint(1,10)}", student_id, f"TEAM_{random.randint(1,5)}", random.choice(['Leader', 'Coder', 'Designer']), random.randint(1, 10), random.uniform(3, 5), random.uniform(3, 5), random.uniform(3, 5), random.uniform(3, 5), random.randint(50, 100)))

    conn.commit()
    conn.close()
    print("Successfully seeded 10 students with historical data and mastery levels.")

if __name__ == "__main__":
    seed_data()
