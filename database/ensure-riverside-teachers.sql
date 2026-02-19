-- Ensure Riverside District school and teachers exist (run if you can't log in as Riverside users).
-- Uses ON CONFLICT so safe to run multiple times.

INSERT INTO districts (id, name, state) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'Riverside District', 'Nevada')
ON CONFLICT (id) DO NOTHING;

INSERT INTO schools (id, district_id, name) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Riverside Elementary')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teachers (id, school_id, email, first_name, last_name, role, password_hash) VALUES
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'teacher@riverside.edu', 'Robert', 'Kim', 'teacher', 'placeholder:password123'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'district@riverside.edu', 'Linda', 'Martinez', 'district_admin', 'placeholder:password123')
ON CONFLICT (id) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;
