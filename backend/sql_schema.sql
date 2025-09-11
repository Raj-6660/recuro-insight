-- Career Platform Database Schema
-- Run these commands in your preferred SQL database (PostgreSQL, MySQL, SQLite, etc.)

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'recruiter')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student profiles
CREATE TABLE student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    current_skills TEXT[], -- Array of skill names
    target_role VARCHAR(255),
    experience_level VARCHAR(50),
    education TEXT[],
    cv_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job descriptions
CREATE TABLE job_descriptions (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    experience_level VARCHAR(50),
    required_skills TEXT[] NOT NULL,
    preferred_skills TEXT[],
    responsibilities TEXT[],
    qualifications TEXT[],
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidate CVs
CREATE TABLE candidate_cvs (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    skills TEXT[] NOT NULL,
    experience_years INTEGER DEFAULT 0,
    education TEXT[],
    previous_roles TEXT[],
    cv_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match results between JD and CV
CREATE TABLE match_results (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_description_id INTEGER REFERENCES job_descriptions(id) ON DELETE CASCADE,
    candidate_cv_id INTEGER REFERENCES candidate_cvs(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    matching_skills TEXT[],
    missing_skills TEXT[],
    status VARCHAR(20) CHECK (status IN ('shortlisted', 'rejected')) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview scheduling
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    match_result_id INTEGER REFERENCES match_results(id) ON DELETE CASCADE,
    recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    candidate_cv_id INTEGER REFERENCES candidate_cvs(id) ON DELETE CASCADE,
    interview_date TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    meeting_link VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill analysis results for students
CREATE TABLE skill_analyses (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    category VARCHAR(255),
    source_file VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Career path recommendations
CREATE TABLE career_paths (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    required_skills TEXT[] NOT NULL,
    match_percentage INTEGER CHECK (match_percentage >= 0 AND match_percentage <= 100),
    missing_skills TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning resources and roadmaps
CREATE TABLE learning_resources (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) CHECK (resource_type IN ('Course', 'Certification', 'Project', 'Book')),
    priority VARCHAR(20) CHECK (priority IN ('High', 'Medium', 'Low')),
    resource_url VARCHAR(500),
    target_role VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job market insights
CREATE TABLE job_market_insights (
    id SERIAL PRIMARY KEY,
    role VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    openings_count INTEGER DEFAULT 0,
    salary_range VARCHAR(100),
    growth_trend VARCHAR(20) CHECK (growth_trend IN ('Rising', 'Stable', 'Declining')),
    data_source VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, location)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_job_descriptions_recruiter_id ON job_descriptions(recruiter_id);
CREATE INDEX idx_candidate_cvs_recruiter_id ON candidate_cvs(recruiter_id);
CREATE INDEX idx_match_results_recruiter_id ON match_results(recruiter_id);
CREATE INDEX idx_match_results_score ON match_results(match_score);
CREATE INDEX idx_interviews_recruiter_id ON interviews(recruiter_id);
CREATE INDEX idx_interviews_date ON interviews(interview_date);
CREATE INDEX idx_skill_analyses_student_id ON skill_analyses(student_id);
CREATE INDEX idx_career_paths_student_id ON career_paths(student_id);
CREATE INDEX idx_learning_resources_student_id ON learning_resources(student_id);
CREATE INDEX idx_job_market_role ON job_market_insights(role);

-- Sample data for testing
INSERT INTO job_market_insights (role, location, openings_count, salary_range, growth_trend, data_source) VALUES
('Frontend Developer', 'Remote/Global', 1250, '$70K - $120K', 'Rising', 'Job Boards API'),
('Full Stack Developer', 'Remote/Global', 980, '$80K - $140K', 'Rising', 'Job Boards API'),
('Data Scientist', 'San Francisco, CA', 750, '$95K - $160K', 'Rising', 'Job Boards API'),
('DevOps Engineer', 'Remote/Global', 650, '$85K - $150K', 'Stable', 'Job Boards API'),
('Product Manager', 'New York, NY', 420, '$100K - $180K', 'Stable', 'Job Boards API'),
('UI/UX Designer', 'Remote/Global', 380, '$65K - $110K', 'Rising', 'Job Boards API'),
('Mobile Developer', 'Remote/Global', 320, '$75K - $130K', 'Stable', 'Job Boards API'),
('QA Engineer', 'Austin, TX', 280, '$60K - $100K', 'Declining', 'Job Boards API'),
('Machine Learning Engineer', 'Seattle, WA', 220, '$110K - $190K', 'Rising', 'Job Boards API'),
('Cybersecurity Analyst', 'Washington, DC', 190, '$80K - $140K', 'Rising', 'Job Boards API');