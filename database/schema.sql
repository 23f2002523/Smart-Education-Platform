-- AMEP Database Schema
-- SQLite Database for Adaptive Mastery & Engagement Platform

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    grade INTEGER NOT NULL,
    section TEXT NOT NULL,
    institution_id TEXT NOT NULL,
    baseline_proficiency INTEGER,
    learning_pace TEXT CHECK(learning_pace IN ('slow', 'average', 'fast')),
    preferred_learning_style TEXT CHECK(preferred_learning_style IN ('visual', 'textual', 'mixed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    quiz_score INTEGER NOT NULL CHECK(quiz_score >= 0 AND quiz_score <= 100),
    time_taken_seconds INTEGER NOT NULL,
    number_of_attempts INTEGER NOT NULL,
    difficulty_level TEXT CHECK(difficulty_level IN ('easy', 'medium', 'hard')),
    previous_mastery_score INTEGER DEFAULT 0,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Engagement Logs Table
CREATE TABLE IF NOT EXISTS engagement_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    duration_seconds INTEGER,
    interaction_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP NOT NULL,
    engagement_score INTEGER CHECK(engagement_score >= 0 AND engagement_score <= 100),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Project Activity Table
CREATE TABLE IF NOT EXISTS project_activity (
    activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    role_in_team TEXT NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    peer_review_score REAL CHECK(peer_review_score >= 0 AND peer_review_score <= 5),
    communication_score REAL CHECK(communication_score >= 0 AND communication_score <= 5),
    collaboration_score REAL CHECK(collaboration_score >= 0 AND collaboration_score <= 5),
    creativity_score REAL CHECK(creativity_score >= 0 AND creativity_score <= 5),
    project_completion_pct INTEGER CHECK(project_completion_pct >= 0 AND project_completion_pct <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Mastery Scores Table (ML Predictions + Ground Truth)
CREATE TABLE IF NOT EXISTS mastery_scores (
    mastery_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    final_mastery_score INTEGER NOT NULL CHECK(final_mastery_score >= 0 AND final_mastery_score <= 100),
    mastery_level TEXT CHECK(mastery_level IN ('beginner', 'intermediate', 'advanced')),
    predicted_mastery_score INTEGER CHECK(predicted_mastery_score >= 0 AND predicted_mastery_score <= 100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE(student_id, subject, topic)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_engagement_student ON engagement_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_project_student ON project_activity(student_id);
CREATE INDEX IF NOT EXISTS idx_mastery_student ON mastery_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_subject_topic ON quiz_attempts(subject, topic);
CREATE INDEX IF NOT EXISTS idx_mastery_subject_topic ON mastery_scores(subject, topic);
