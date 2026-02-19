-- Phase 1: Seed districts, schools, and teachers for local testing.
-- Password: use PLACEHOLDER_PASSWORD (e.g. password123) or store placeholder:password123 in password_hash.

INSERT INTO districts (id, name, state) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Demo District', 'California'),
  ('a0000000-0000-0000-0000-000000000002', 'Riverside District', 'Nevada')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, district_id, name) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Demo School'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Riverside Elementary')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teachers (id, school_id, email, first_name, last_name, role, password_hash) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'teacher@demo.edu', 'Maria', 'Santos', 'teacher', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'admin@demo.edu', 'James', 'Chen', 'admin', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'district@demo.edu', 'Patricia', 'Williams', 'district_admin', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'teacher@riverside.edu', 'Robert', 'Kim', 'teacher', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'district@riverside.edu', 'Linda', 'Martinez', 'district_admin', 'placeholder:password123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, district_id, first_name, last_name, dob, unique_student_identifier) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Jane', 'Doe', '2015-03-10', 'DEMO-001'),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'John', 'Smith', '2014-08-22', 'DEMO-002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO classrooms (id, teacher_id, school_id, name, grade_level, is_homeroom) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Math 3 - Period 1', '3', true),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Science 3 - Period 2', '3', false),
  ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Grade 4 Homeroom', '4', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO enrollments (id, student_id, classroom_id) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;
