-- Add unique constraint to email column in student_details table
-- This ensures each email can only be used once across the entire system

-- First, check for any duplicate emails and handle them
-- (In a real system, you'd want to review these manually)
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count duplicate emails
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT email, COUNT(*) as email_count
        FROM student_details 
        WHERE email IS NOT NULL AND email != ''
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    -- If duplicates exist, log them (you might want to handle this differently)
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % duplicate email addresses. Please review manually.', duplicate_count;
        
        -- Optionally, you can see the duplicates:
        -- SELECT email, COUNT(*) as count FROM student_details GROUP BY email HAVING COUNT(*) > 1;
    END IF;
END $$;

-- Add unique constraint to email column
-- This will prevent future duplicate email registrations
ALTER TABLE student_details ADD CONSTRAINT unique_student_email UNIQUE (email);

-- Create index for better performance on email lookups
CREATE INDEX IF NOT EXISTS idx_student_details_email ON student_details(email);

-- Update the saveStudentDetails function to handle email uniqueness
-- (This will be handled in the application code, but we can add a database function for checking)
CREATE OR REPLACE FUNCTION check_email_availability(check_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    email_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM student_details 
        WHERE LOWER(email) = LOWER(check_email)
    ) INTO email_exists;
    
    RETURN NOT email_exists;
END;
$$ LANGUAGE plpgsql;
