-- Add state to districts so teachers can distinguish districts (e.g. Jefferson School District, CA vs TX).
ALTER TABLE districts ADD COLUMN IF NOT EXISTS state VARCHAR(100);
UPDATE districts SET state = 'California' WHERE id = 'a0000000-0000-0000-0000-000000000001' AND (state IS NULL OR state = '');
UPDATE districts SET state = 'Nevada' WHERE id = 'a0000000-0000-0000-0000-000000000002' AND (state IS NULL OR state = '');
UPDATE districts SET state = 'Unknown' WHERE state IS NULL OR state = '';
ALTER TABLE districts ALTER COLUMN state SET NOT NULL;
