-- 006_create_attendance.sql

CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,

    student_id BIGINT NOT NULL,

    subject_id BIGINT NOT NULL,

    faculty_id BIGINT NOT NULL,

    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(20) NOT NULL DEFAULT 'present',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_attendance_faculty
        FOREIGN KEY (faculty_id)
        REFERENCES faculty(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT attendance_status_check
        CHECK (status IN ('present', 'absent', 'late')),

    CONSTRAINT unique_student_subject_date
        UNIQUE (student_id, subject_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student
    ON attendance(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_subject
    ON attendance(subject_id);

CREATE INDEX IF NOT EXISTS idx_attendance_faculty
    ON attendance(faculty_id);

CREATE INDEX IF NOT EXISTS idx_attendance_date
    ON attendance(date);

CREATE INDEX IF NOT EXISTS idx_attendance_status
    ON attendance(status);