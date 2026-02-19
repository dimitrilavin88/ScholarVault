-- Ensure each school has at least two teachers per grade level.
-- Demo School: grade 3 (Maria + 1), grade 4 (2 new). Riverside: grade 3 (Robert + 1), grade 4 (Robert + 1).
-- Password for new teachers: password123 (placeholder:password123).

-- Demo School = b0000000-0000-0000-0000-000000000001
-- Riverside Elementary = b0000000-0000-0000-0000-000000000002

-- New teachers at Demo School (grade 3 second teacher, grade 4 two teachers)
INSERT INTO teachers (id, school_id, email, first_name, last_name, role, password_hash) VALUES
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'teacher2-grade3@demo.edu', 'Anna', 'Bell', 'teacher', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'teacher-grade4a@demo.edu', 'David', 'Park', 'teacher', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'teacher-grade4b@demo.edu', 'Emily', 'Wong', 'teacher', 'placeholder:password123')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash;

-- New teachers at Riverside Elementary (grade 3 second teacher, grade 4 second teacher)
INSERT INTO teachers (id, school_id, email, first_name, last_name, role, password_hash) VALUES
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002', 'teacher2-grade3@riverside.edu', 'Carlos', 'Mendez', 'teacher', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'teacher2-grade4@riverside.edu', 'Jennifer', 'Lee', 'teacher', 'placeholder:password123')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash;

-- Classrooms: Demo School — Maria (c...001) already has grade 3. Add Anna Bell grade 3, David & Emily grade 4.
INSERT INTO classrooms (id, teacher_id, school_id, name, grade_level, is_homeroom) VALUES
  ('e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'Grade 3 Homeroom B', '3', true),
  ('e0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'Grade 4 Homeroom A', '4', true),
  ('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'Grade 4 Homeroom B', '4', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  grade_level = EXCLUDED.grade_level,
  is_homeroom = EXCLUDED.is_homeroom;

-- Classrooms: Riverside — Robert (c...004) already has grade 3 (e...004) and grade 4 (e...003). Add Carlos grade 3, Jennifer grade 4.
INSERT INTO classrooms (id, teacher_id, school_id, name, grade_level, is_homeroom) VALUES
  ('e0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000002', 'Grade 3 Homeroom B', '3', true),
  ('e0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', 'Grade 4 Homeroom B', '4', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  grade_level = EXCLUDED.grade_level,
  is_homeroom = EXCLUDED.is_homeroom;
