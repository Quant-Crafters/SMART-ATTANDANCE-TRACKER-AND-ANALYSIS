-- 005_create_subjects.sql

CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    code VARCHAR(30) NOT NULL UNIQUE,

    department_id BIGINT NOT NULL,

    semester INTEGER NOT NULL,

    credits INTEGER NOT NULL DEFAULT 0,

    status BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subject_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT subjects_semester_check
        CHECK (semester BETWEEN 1 AND 8),

    CONSTRAINT subjects_credits_check
        CHECK (credits >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_code
    ON subjects(code);

CREATE INDEX IF NOT EXISTS idx_subjects_department
    ON subjects(department_id);

CREATE INDEX IF NOT EXISTS idx_subjects_semester
    ON subjects(semester);

CREATE INDEX IF NOT EXISTS idx_subjects_status
    ON subjects(status);