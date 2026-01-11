import sqlite3

def run_validation(db_path='amep.db'):
    """Run validation queries on AMEP database"""
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("="*60)
    print("AMEP DATABASE VALIDATION")
    print("="*60)
    
    print("\n1. Tables in database:")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    for row in cursor.fetchall():
        print(f"   - {row[0]}")
    
    print("\n2. Record counts:")
    tables = ['students', 'quiz_attempts', 'engagement_logs', 'project_activity', 'mastery_scores']
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"   {table}: {count} records")
    
    print("\n3. Sample student data:")
    cursor.execute("SELECT student_id, student_name, grade, section FROM students LIMIT 5")
    for row in cursor.fetchall():
        print(f"   {row[0]} | {row[1]} | Grade {row[2]} | Section {row[3]}")
    
    print("\n4. Sample quiz attempts with student names:")
    cursor.execute("""
        SELECT q.attempt_id, s.student_name, q.subject, q.quiz_score 
        FROM quiz_attempts q 
        JOIN students s ON q.student_id = s.student_id 
        LIMIT 5
    """)
    for row in cursor.fetchall():
        print(f"   {row[0]} | {row[1]} | {row[2]} | Score: {row[3]}")
    
    print("\n5. Sample mastery scores:")
    cursor.execute("""
        SELECT s.student_name, m.subject, m.topic, m.final_mastery_score, m.mastery_level
        FROM mastery_scores m
        JOIN students s ON m.student_id = s.student_id
        LIMIT 5
    """)
    for row in cursor.fetchall():
        print(f"   {row[0]} | {row[1]}/{row[2]} | Score: {row[3]} | Level: {row[4]}")
    
    print("\n" + "="*60)
    print("✅ VALIDATION COMPLETE")
    print("="*60)
    
    conn.close()

if __name__ == "__main__":
    run_validation()
