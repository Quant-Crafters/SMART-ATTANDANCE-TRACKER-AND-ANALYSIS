-- 002_demo.sql
-- Demo / synthetic data for AttendSmart
-- Safe to run multiple times where unique constraints exist.

BEGIN;

-- =========================================================
-- 1. DEPARTMENTS
-- =========================================================

INSERT INTO departments (name, code, description, status)
VALUES
    (
        'Computer Science and Engineering',
        'CSE',
        'Computer Science and Engineering Department',
        TRUE
    ),
    (
        'Electronics and Communication Engineering',
        'ECE',
        'Electronics and Communication Engineering Department',
        TRUE
    ),
    (
        'Information Technology',
        'IT',
        'Information Technology Department',
        TRUE
    )
ON CONFLICT (code) DO NOTHING;


-- =========================================================
-- 2. STUDENTS
-- =========================================================

INSERT INTO students (
    student_id,
    name,
    email,
    phone,
    department,
    semester,
    section,
    year,
    status
)
VALUES
    (
        'CSE2026001',
        'Rahul Sharma',
        'rahul.sharma@college.edu',
        '9876543210',
        'CSE',
        5,
        'A',
        3,
        TRUE
    ),
    (
        'CSE2026002',
        'Aman Kumar',
        'aman.kumar@college.edu',
        '9876543211',
        'CSE',
        5,
        'A',
        3,
        TRUE
    ),
    (
        'CSE2026003',
        'Priya Singh',
        'priya.singh@college.edu',
        '9876543212',
        'CSE',
        5,
        'A',
        3,
        TRUE
    ),
    (
        'CSE2026004',
        'Ananya Das',
        'ananya.das@college.edu',
        '9876543213',
        'CSE',
        5,
        'B',
        3,
        TRUE
    ),
    (
        'ECE2026001',
        'Arjun Roy',
        'arjun.roy@college.edu',
        '9876543214',
        'ECE',
        5,
        'A',
        3,
        TRUE
    )
ON CONFLICT (student_id) DO NOTHING;


-- =========================================================
-- 3. FACULTY
-- =========================================================

INSERT INTO faculty (
    faculty_id,
    name,
    email,
    phone,
    department,
    designation,
    status
)
VALUES
    (
        'FAC2026001',
        'Dr. Amit Sharma',
        'amit.sharma@college.edu',
        '9876543220',
        'CSE',
        'Assistant Professor',
        TRUE
    ),
    (
        'FAC2026002',
        'Dr. Neha Gupta',
        'neha.gupta@college.edu',
        '9876543221',
        'ECE',
        'Associate Professor',
        TRUE
    )
ON CONFLICT (faculty_id) DO NOTHING;


-- =========================================================
-- 4. SUBJECTS
-- =========================================================

INSERT INTO subjects (
    name,
    code,
    department_id,
    semester,
    credits,
    status
)
SELECT
    'Database Management Systems',
    'CS501',
    id,
    5,
    4,
    TRUE
FROM departments
WHERE code = 'CSE'
ON CONFLICT (code) DO NOTHING;


INSERT INTO subjects (
    name,
    code,
    department_id,
    semester,
    credits,
    status
)
SELECT
    'Operating Systems',
    'CS502',
    id,
    5,
    4,
    TRUE
FROM departments
WHERE code = 'CSE'
ON CONFLICT (code) DO NOTHING;


INSERT INTO subjects (
    name,
    code,
    department_id,
    semester,
    credits,
    status
)
SELECT
    'Computer Networks',
    'CS503',
    id,
    5,
    3,
    TRUE
FROM departments
WHERE code = 'CSE'
ON CONFLICT (code) DO NOTHING;


INSERT INTO subjects (
    name,
    code,
    department_id,
    semester,
    credits,
    status
)
SELECT
    'Digital Electronics',
    'EC501',
    id,
    5,
    4,
    TRUE
FROM departments
WHERE code = 'ECE'
ON CONFLICT (code) DO NOTHING;


-- =========================================================
-- 5. ATTENDANCE
-- =========================================================
-- Synthetic attendance data.
-- Uses CURRENT_DATE so the demo dashboard shows today's data.

INSERT INTO attendance (
    student_id,
    subject_id,
    faculty_id,
    date,
    status
)
SELECT
    s.id,
    sub.id,
    f.id,
    CURRENT_DATE + TIME '09:00:00',
    'present'
FROM students s
JOIN subjects sub
    ON sub.code = 'CS501'
JOIN faculty f
    ON f.faculty_id = 'FAC2026001'
WHERE s.student_id = 'CSE2026001'
ON CONFLICT (student_id, subject_id, date) DO NOTHING;


INSERT INTO attendance (
    student_id,
    subject_id,
    faculty_id,
    date,
    status
)
SELECT
    s.id,
    sub.id,
    f.id,
    CURRENT_DATE + TIME '09:00:00',
    'present'
FROM students s
JOIN subjects sub
    ON sub.code = 'CS501'
JOIN faculty f
    ON f.faculty_id = 'FAC2026001'
WHERE s.student_id = 'CSE2026002'
ON CONFLICT (student_id, subject_id, date) DO NOTHING;


INSERT INTO attendance (
    student_id,
    subject_id,
    faculty_id,
    date,
    status
)
SELECT
    s.id,
    sub.id,
    f.id,
    CURRENT_DATE + TIME '09:00:00',
    'absent'
FROM students s
JOIN subjects sub
    ON sub.code = 'CS501'
JOIN faculty f
    ON f.faculty_id = 'FAC2026001'
WHERE s.student_id = 'CSE2026003'
ON CONFLICT (student_id, subject_id, date) DO NOTHING;


INSERT INTO attendance (
    student_id,
    subject_id,
    faculty_id,
    date,
    status
)
SELECT
    s.id,
    sub.id,
    f.id,
    CURRENT_DATE + TIME '09:00:00',
    'late'
FROM students s
JOIN subjects sub
    ON sub.code = 'CS501'
JOIN faculty f
    ON f.faculty_id = 'FAC2026001'
WHERE s.student_id = 'CSE2026004'
ON CONFLICT (student_id, subject_id, date) DO NOTHING;


-- =========================================================
-- 6. NOTIFICATIONS
-- =========================================================

INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    is_read
)
SELECT
    id,
    'Welcome to AttendSmart',
    'Your attendance monitoring account is ready.',
    'general',
    FALSE
FROM users
WHERE email = 'admin@college.edu'
ON CONFLICT DO NOTHING;


COMMIT;