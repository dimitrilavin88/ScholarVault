-- Add grade_level and is_homeroom to classrooms (for district admin browse by school → grade → teacher).
-- Run this if your classrooms table was created before these columns existed.

ALTER TABLE classrooms
  ADD COLUMN IF NOT EXISTS grade_level VARCHAR(32),
  ADD COLUMN IF NOT EXISTS is_homeroom BOOLEAN NOT NULL DEFAULT FALSE;

-- Optionally backfill from existing data (e.g. set grade_level from name or leave null).
-- UPDATE classrooms SET grade_level = '3', is_homeroom = true WHERE name LIKE '%Homeroom%' OR name LIKE '%3%';
