-- Add grade levels (and a Grade 3 homeroom) to Riverside Elementary so transferred students
-- (e.g. Jane Doe) can be placed and seen in District → Students.
-- Safe to run multiple times (ON CONFLICT).

-- Riverside Elementary = b0000000-0000-0000-0000-000000000002
-- Robert Kim (teacher) = c0000000-0000-0000-0000-000000000004
-- Jane Doe = d0000000-0000-0000-0000-000000000001

-- Add Grade 3 homeroom at Riverside (so district admin sees "3" in grade-level list)
INSERT INTO classrooms (id, teacher_id, school_id, name, grade_level, is_homeroom) VALUES
  ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'Grade 3 Homeroom', '3', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  grade_level = EXCLUDED.grade_level,
  is_homeroom = EXCLUDED.is_homeroom;

-- Enroll Jane Doe in Riverside Grade 3 Homeroom (so she appears in District Students at Riverside)
INSERT INTO enrollments (student_id, classroom_id)
VALUES ('d0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004')
ON CONFLICT (student_id, classroom_id) DO NOTHING;
