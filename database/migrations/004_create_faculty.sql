-- 004_create_faculty.sql

CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,

    faculty_id VARCHAR(50) NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(15),

    department VARCHAR(100),

    designation VARCHAR(100),

    status BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faculty_faculty_id
    ON faculty(faculty_id);

CREATE INDEX IF NOT EXISTS idx_faculty_email
    ON faculty(email);

CREATE INDEX IF NOT EXISTS idx_faculty_department
    ON faculty(department);

CREATE INDEX IF NOT EXISTS idx_faculty_status
    ON faculty(status);