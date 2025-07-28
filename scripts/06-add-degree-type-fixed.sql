-- Add degree_type column to student_details table
ALTER TABLE student_details ADD COLUMN IF NOT EXISTS degree_type VARCHAR(10);

-- Add constraint to ensure only BTech or HND values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_degree_type' 
        AND table_name = 'student_details'
    ) THEN
        ALTER TABLE student_details ADD CONSTRAINT check_degree_type CHECK (degree_type IN ('BTech', 'HND'));
    END IF;
END $$;

-- Update existing records with default value (you can change this as needed)
UPDATE student_details SET degree_type = 'BTech' WHERE degree_type IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE student_details ALTER COLUMN degree_type SET NOT NULL;

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_programme_voting_stats();
DROP FUNCTION IF EXISTS get_level_voting_stats();
DROP FUNCTION IF EXISTS get_programme_level_breakdown();

-- Recreate the programme voting stats function with degree type
CREATE OR REPLACE FUNCTION get_programme_voting_stats()
RETURNS TABLE (
  programme VARCHAR,
  degree_type VARCHAR,
  total_students BIGINT,
  voted_students BIGINT,
  turnout_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.programme,
    sd.degree_type,
    COUNT(DISTINCT s.student_id) as total_students,
    COUNT(DISTINCT CASE WHEN s.has_voted THEN s.student_id END) as voted_students,
    ROUND(
      (COUNT(DISTINCT CASE WHEN s.has_voted THEN s.student_id END)::NUMERIC / 
       NULLIF(COUNT(DISTINCT s.student_id), 0)) * 100, 1
    ) as turnout_percentage
  FROM students s
  LEFT JOIN student_details sd ON s.student_id = sd.student_id
  WHERE sd.programme IS NOT NULL AND sd.degree_type IS NOT NULL
  GROUP BY sd.programme, sd.degree_type
  ORDER BY sd.programme, sd.degree_type;
END;
$$ LANGUAGE plpgsql;

-- Recreate level stats function with degree type
CREATE OR REPLACE FUNCTION get_level_voting_stats()
RETURNS TABLE (
  level INTEGER,
  degree_type VARCHAR,
  total_students BIGINT,
  voted_students BIGINT,
  turnout_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.level,
    sd.degree_type,
    COUNT(DISTINCT s.student_id) as total_students,
    COUNT(DISTINCT CASE WHEN s.has_voted THEN s.student_id END) as voted_students,
    ROUND(
      (COUNT(DISTINCT CASE WHEN s.has_voted THEN s.student_id END)::NUMERIC / 
       NULLIF(COUNT(DISTINCT s.student_id), 0)) * 100, 1
    ) as turnout_percentage
  FROM students s
  LEFT JOIN student_details sd ON s.student_id = sd.student_id
  WHERE sd.level IS NOT NULL AND sd.degree_type IS NOT NULL
  GROUP BY sd.level, sd.degree_type
  ORDER BY sd.level, sd.degree_type;
END;
$$ LANGUAGE plpgsql;

-- Create comprehensive programme-level-degree breakdown
CREATE OR REPLACE FUNCTION get_programme_level_degree_breakdown()
RETURNS TABLE (
  programme VARCHAR,
  level INTEGER,
  degree_type VARCHAR,
  total_students BIGINT,
  voted_students BIGINT,
  turnout_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.programme,
    sd.level,
    sd.degree_type,
    COUNT(DISTINCT s.student_id) as total_students,
    COUNT(DISTINCT CASE WHEN s.has_voted THEN s.student_id END) as voted_students,
    ROUND(
      (COUNT(DISTINCT CASE WHEN s.has_voted THEN s.student_id END)::NUMERIC / 
       NULLIF(COUNT(DISTINCT s.student_id), 0)) * 100, 1
    ) as turnout_percentage
  FROM students s
  LEFT JOIN student_details sd ON s.student_id = sd.student_id
  WHERE sd.programme IS NOT NULL AND sd.level IS NOT NULL AND sd.degree_type IS NOT NULL
  GROUP BY sd.programme, sd.level, sd.degree_type
  ORDER BY sd.programme, sd.level, sd.degree_type;
END;
$$ LANGUAGE plpgsql;

-- Update the student_voting_details view to include degree_type
DROP VIEW IF EXISTS student_voting_details;
CREATE OR REPLACE VIEW student_voting_details AS
SELECT 
  s.student_id,
  sd.name as student_name,
  sd.phone,
  sd.email,
  sd.programme,
  sd.level,
  sd.degree_type,
  vc.name as category_name,
  c.name as candidate_name,
  v.created_at as vote_time
FROM students s
LEFT JOIN student_details sd ON s.student_id = sd.student_id
LEFT JOIN votes v ON s.student_id = v.student_id
LEFT JOIN candidates c ON v.candidate_id = c.id
LEFT JOIN voting_categories vc ON v.category_id = vc.id
WHERE s.has_voted = true
ORDER BY s.student_id, vc.display_order;

-- Update the transformed student data function to include degree_type
DROP FUNCTION IF EXISTS get_student_votes_transformed();
CREATE OR REPLACE FUNCTION get_student_votes_transformed()
RETURNS TABLE (
  student_id VARCHAR,
  student_name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  programme VARCHAR,
  level INTEGER,
  degree_type VARCHAR,
  presidential VARCHAR,
  vice_president VARCHAR,
  financial_secretary VARCHAR,
  general_secretary VARCHAR,
  general_organizers VARCHAR,
  wocom VARCHAR,
  pro VARCHAR,
  part_time_representative VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.student_id,
    sd.name as student_name,
    sd.phone,
    sd.email,
    sd.programme,
    sd.level,
    sd.degree_type,
    MAX(CASE WHEN vc.name = 'Presidential' THEN c.name END) as presidential,
    MAX(CASE WHEN vc.name = 'Vice President' THEN c.name END) as vice_president,
    MAX(CASE WHEN vc.name = 'Financial Secretary' THEN c.name END) as financial_secretary,
    MAX(CASE WHEN vc.name = 'General Secretary' THEN c.name END) as general_secretary,
    MAX(CASE WHEN vc.name = 'General Organizers' THEN c.name END) as general_organizers,
    MAX(CASE WHEN vc.name = 'WOCOM' THEN c.name END) as wocom,
    MAX(CASE WHEN vc.name = 'PRO' THEN c.name END) as pro,
    MAX(CASE WHEN vc.name = 'Part-time Representative' THEN c.name END) as part_time_representative
  FROM students s
  LEFT JOIN student_details sd ON s.student_id = sd.student_id
  LEFT JOIN votes v ON s.student_id = v.student_id
  LEFT JOIN candidates c ON v.candidate_id = c.id
  LEFT JOIN voting_categories vc ON v.category_id = vc.id
  WHERE s.has_voted = true
  GROUP BY s.student_id, sd.name, sd.phone, sd.email, sd.programme, sd.level, sd.degree_type
  ORDER BY s.student_id;
END;
$$ LANGUAGE plpgsql;
