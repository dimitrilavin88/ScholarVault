-- Intra-school class transfer requests (teacher-to-teacher, no district admin).
-- Run on existing DB: psql ... -f database/add-class-transfer-requests.sql

CREATE TABLE IF NOT EXISTS class_transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  to_classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  requested_by_teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  resolved_at TIMESTAMP,
  resolved_by_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_class_transfer_requests_status ON class_transfer_requests(status);
CREATE INDEX IF NOT EXISTS idx_class_transfer_requests_requested_by ON class_transfer_requests(requested_by_teacher_id);
