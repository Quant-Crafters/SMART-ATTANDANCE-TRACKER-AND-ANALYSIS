-- 003_create_students.sql

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,

    student_id VARCHAR(50) NOT NULL UNIQUE,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(15),

    department VARCHAR(100) NOT NULL,

    semester INTEGER NOT NULL,

    section VARCHAR(10),

    year INTEGER,

    status BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT students_semester_check
        CHECK (semester BETWEEN 1 AND 8),

    CONSTRAINT students_year_check
        CHECK (year IS NULL OR year BETWEEN 1 AND 6)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_students_student_id
    ON students(student_id);

CREATE INDEX IF NOT EXISTS idx_students_email
    ON students(email);

CREATE INDEX IF NOT EXISTS idx_students_department
    ON students(department);

CREATE INDEX IF NOT EXISTS idx_students_semester
    ON students(semester);

CREATE INDEX IF NOT EXISTS idx_students_status
    ON students(status);