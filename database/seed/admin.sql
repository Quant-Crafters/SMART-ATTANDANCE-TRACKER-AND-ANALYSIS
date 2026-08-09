-- Seed default admin user

INSERT INTO users (
    name,
    email,
    password,
    role
)
VALUES (
    'System Admin',
    'admin@college.edu',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCqgqK5nG4K0dF0ZQv2G',
    'admin'
)
ON CONFLICT (email) DO NOTHING;


