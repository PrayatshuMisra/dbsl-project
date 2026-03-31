-- ============================================================
-- FIX: EXPAND GRADE CHECK CONSTRAINT
-- ============================================================

-- 1. Drop the existing constraint
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_grade_check;

-- 2. Re-add the constraint with expanded grade values
ALTER TABLE enrollments ADD CONSTRAINT enrollments_grade_check 
CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F') OR grade IS NULL);

-- 3. Update sample records if needed (demo safety)
UPDATE enrollments SET grade = 'B' WHERE grade = 'B-'; -- Fallback for existing records if they were somehow inserted but failed constraint
