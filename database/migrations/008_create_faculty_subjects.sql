-- 008_create_faculty_subjects.sql

CREATE TABLE IF NOT EXISTS faculty_subjects (
    id BIGSERIAL PRIMARY KEY,

    faculty_id BIGINT NOT NULL,

    subject_id BIGINT NOT NULL,

    status BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_faculty_subjects_faculty
        FOREIGN KEY (faculty_id)
        REFERENCES faculty(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_faculty_subjects_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT unique_faculty_subject
        UNIQUE (faculty_id, subject_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faculty_subjects_faculty
    ON faculty_subjects(faculty_id);

CREATE INDEX IF NOT EXISTS idx_faculty_subjects_subject
    ON faculty_subjects(subject_id);

CREATE INDEX IF NOT EXISTS idx_faculty_subjects_status
    ON faculty_subjects(status);