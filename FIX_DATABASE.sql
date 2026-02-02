-- Final database fix for admission_enquiries table
-- This script removes the parent_name column that's causing insert errors

USE smart_schoolapp;

-- Show current table structure
SELECT 'Current table structure:' AS '';
SHOW COLUMNS FROM admission_enquiries;

-- Drop the parent_name column if it exists
ALTER TABLE admission_enquiries DROP COLUMN IF EXISTS parent_name;

-- Verify the column is gone
SELECT 'Updated table structure (parent_name should be gone):' AS '';
SHOW COLUMNS FROM admission_enquiries;

SELECT 'Database fix completed! Restart your application.' AS 'Status';
