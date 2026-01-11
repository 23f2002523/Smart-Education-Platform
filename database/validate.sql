-- Validation Queries for AMEP Database

-- 1. Check all tables exist
SELECT name FROM sqlite_master WHERE type='table';

-- 2. Count records in each table
SELECT 'students' as table_name, COUNT(*) as count FROM students
UNION ALL
SELECT 'quiz_attempts', COUNT(*) FROM quiz_attempts
UNION ALL
SELECT 'engagement_logs', COUNT(*) FROM engagement_logs
UNION ALL
SELECT 'project_activity', COUNT(*) FROM project_activity
UNION ALL
SELECT 'mastery_scores', COUNT(*) FROM mastery_scores;

-- 3. Verify foreign key relationships
SELECT 
    q.attempt_id,
    q.student_id,
    s.student_name,
    q.subject,
    q.quiz_score
FROM quiz_attempts q
JOIN students s ON q.student_id = s.student_id
LIMIT 5;

-- 4. Check data integrity
SELECT 
    student_id,
    COUNT(*) as total_quizzes,
    AVG(quiz_score) as avg_score
FROM quiz_attempts
GROUP BY student_id
LIMIT 10;

-- 5. Verify mastery scores
SELECT 
    m.student_id,
    s.student_name,
    m.subject,
    m.topic,
    m.final_mastery_score,
    m.mastery_level
FROM mastery_scores m
JOIN students s ON m.student_id = s.student_id
LIMIT 10;

-- 6. Check project activity
SELECT 
    p.project_id,
    p.student_id,
    s.student_name,
    p.role_in_team,
    p.tasks_completed,
    p.peer_review_score
FROM project_activity p
JOIN students s ON p.student_id = s.student_id
LIMIT 10;

-- 7. Student performance summary
SELECT 
    s.student_id,
    s.student_name,
    s.grade,
    COUNT(DISTINCT q.attempt_id) as total_attempts,
    AVG(q.quiz_score) as avg_quiz_score,
    MAX(m.final_mastery_score) as max_mastery
FROM students s
LEFT JOIN quiz_attempts q ON s.student_id = q.student_id
LEFT JOIN mastery_scores m ON s.student_id = m.student_id
GROUP BY s.student_id, s.student_name, s.grade
LIMIT 10;
