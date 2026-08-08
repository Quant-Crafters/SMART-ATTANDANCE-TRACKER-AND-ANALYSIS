-- 002_create_departments.sql

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    code VARCHAR(20) NOT NULL UNIQUE,

    description TEXT,

    status BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_departments_code
    ON departments(code);

CREATE INDEX IF NOT EXISTS idx_departments_status
    ON departments(status);