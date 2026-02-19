-- Two-step transfer: pending_release (sending district) -> released -> approved (receiving district).
-- Run on existing DBs that have student_transfers with old status values.

ALTER TABLE student_transfers
  ADD COLUMN IF NOT EXISTS released_by UUID REFERENCES teachers(id) ON DELETE SET NULL;

-- Extend status check (PostgreSQL: drop existing constraint then add new one)
ALTER TABLE student_transfers DROP CONSTRAINT IF EXISTS student_transfers_status_check;
ALTER TABLE student_transfers ADD CONSTRAINT student_transfers_status_check
  CHECK (status IN ('pending', 'pending_release', 'released', 'approved', 'rejected'));

-- Treat existing 'pending' as pending_release
UPDATE student_transfers SET status = 'pending_release' WHERE status = 'pending';

-- Optional: enforce only new statuses (uncomment to drop 'pending')
-- ALTER TABLE student_transfers DROP CONSTRAINT student_transfers_status_check;
-- ALTER TABLE student_transfers ADD CONSTRAINT student_transfers_status_check
--   CHECK (status IN ('pending_release', 'released', 'approved', 'rejected'));
