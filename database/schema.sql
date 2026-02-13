-- ScholarVault Phase 1: Local PostgreSQL schema.
-- Phase 2: Use with Aurora Serverless; run migrations instead of synchronize.

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL CHECK (role IN ('teacher', 'admin', 'district_admin')),
  password_hash VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  unique_student_identifier VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  grade_level VARCHAR(32) NOT NULL,
  subject VARCHAR(64) NOT NULL,
  file_url VARCHAR(1024) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  UNIQUE (student_id, classroom_id)
);

CREATE INDEX IF NOT EXISTS idx_students_district ON students(district_id);
CREATE INDEX IF NOT EXISTS idx_records_student ON records(student_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);
CREATE TABLE IF NOT EXISTS student_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  old_district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  new_district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  old_school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  new_school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_file_url VARCHAR(1024),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_classroom ON enrollments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON student_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_student ON student_transfers(student_id);
