-- Drop last_follow_up_date column from admission_enquiries table

USE smart_schoolapp;

-- Check if column exists before dropping
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'admission_enquiries' 
AND COLUMN_NAME = 'last_follow_up_date';

-- Drop the column
ALTER TABLE admission_enquiries DROP COLUMN IF EXISTS last_follow_up_date;

-- Verify the column is gone
SELECT 'Column dropped successfully!' AS Status;
SHOW COLUMNS FROM admission_enquiries;
