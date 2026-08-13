-- บัญชีเริ่มต้นสำหรับระบบ School Assets
-- รหัสผ่านควรเปลี่ยนหลัง Login ครั้งแรก
INSERT INTO roles (name, guard_name, created_at, updated_at)
SELECT 'teacher', 'web', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'teacher');

INSERT INTO roles (name, guard_name, created_at, updated_at)
SELECT 'student', 'web', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'student');

INSERT INTO users (name, email, password, status, created_at, updated_at)
SELECT 'ครูตัวอย่าง', 'teacher@example.com', '$2b$10$lWfaNFdIqKGKgJmbhJDsneaWJtzZriDZECk7dOmkF3Llca5L.A7ay', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'teacher@example.com');

INSERT INTO users (name, email, password, status, created_at, updated_at)
SELECT 'นักเรียนตัวอย่าง', 'student@example.com', '$2b$10$KJ82WjjajH.ngBPNenLVLOAQ.5IoXrGu2CW/dZWA6dkFudvKpDfAO', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'student@example.com');

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id, 'App\\Models\\User', u.id
FROM roles r JOIN users u
WHERE r.name = 'teacher' AND u.email = 'teacher@example.com'
  AND NOT EXISTS (SELECT 1 FROM model_has_roles m WHERE m.role_id = r.id AND m.model_id = u.id AND m.model_type = 'App\\Models\\User');

INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id, 'App\\Models\\User', u.id
FROM roles r JOIN users u
WHERE r.name = 'student' AND u.email = 'student@example.com'
  AND NOT EXISTS (SELECT 1 FROM model_has_roles m WHERE m.role_id = r.id AND m.model_id = u.id AND m.model_type = 'App\\Models\\User');
