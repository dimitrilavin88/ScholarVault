-- Add first_name and last_name to teachers (for display in district admin dropdowns).
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
