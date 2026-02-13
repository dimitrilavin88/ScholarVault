-- Add student_transfers table (run if DB was created before this feature).
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

CREATE INDEX IF NOT EXISTS idx_transfers_status ON student_transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_student ON student_transfers(student_id);
