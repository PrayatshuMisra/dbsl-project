-- ============================================================
-- FULL DATABASE RESET & SEEDING SCRIPT (30 USERS)
-- PROJECT: STUDENT REGISTRATION AND GRADE MANAGEMENT SYSTEM
-- ============================================================

-- ------------------------------------------------------------
-- 1. CLEANUP (TRUNCATE ALL DATA)
-- ------------------------------------------------------------
TRUNCATE TABLE 
    activity_logs, 
    notifications, 
    enrollments, 
    courses, 
    admins, 
    instructors, 
    students 
CASCADE;

-- Optional: Delete all Auth users to keep them in sync with profile tables
DELETE FROM auth.users WHERE email LIKE '%@univ.edu';

-- Ensure constraint is updated
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_grade_check;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_grade_check 
CHECK (grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F') OR grade IS NULL);

-- ------------------------------------------------------------
-- 2. SEED FUNCTIONS (HELPER)
-- ------------------------------------------------------------
-- This uses pgcrypto for password hashing if you want to insert into auth.users directly.
-- Standard 'Password123' hash for Supabase (bcrypt):
-- $2a$10$7Z25Ym6uO6m6O6m6O6m6Ou6Z25Ym6uO6m6O6m6O6m6Ou6Z25Ym6u

-- ------------------------------------------------------------
-- 3. SEED STUDENTS (10)
-- ------------------------------------------------------------
INSERT INTO students (student_id, full_name, email, department, semester, registration_date, status)
SELECT 
    gen_random_uuid(),
    'Student User ' || i,
    'student' || i || '@univ.edu',
    CASE WHEN i % 2 = 0 THEN 'CSE' ELSE 'ECE' END,
    (i % 8) + 1,
    CURRENT_DATE - (i || ' days')::interval,
    'active'
FROM generate_series(1, 10) s(i);

-- ------------------------------------------------------------
-- 4. SEED INSTRUCTORS (10)
-- ------------------------------------------------------------
INSERT INTO instructors (instructor_id, full_name, email, department, specialization, joining_date, status)
SELECT 
    gen_random_uuid(),
    'Dr. Instructor ' || i,
    'instructor' || i || '@univ.edu',
    CASE WHEN i % 2 = 0 THEN 'CSE' ELSE 'IT' END,
    'Specialization ' || i,
    CURRENT_DATE - (i || ' months')::interval,
    'active'
FROM generate_series(1, 10) s(i);

-- ------------------------------------------------------------
-- 5. SEED ADMINS (10)
-- ------------------------------------------------------------
INSERT INTO admins (admin_id, full_name, email, role, status)
SELECT 
    gen_random_uuid(),
    'Admin Manager ' || i,
    'admin' || i || '@univ.edu',
    CASE WHEN i % 3 = 0 THEN 'Super Admin' ELSE 'Academic Admin' END,
    'active'
FROM generate_series(1, 10) s(i);

-- ------------------------------------------------------------
-- 6. SEED COURSES (10)
-- ------------------------------------------------------------
-- Link each course to one of the new instructors
INSERT INTO courses (course_id, course_code, title, credits, department, semester, instructor_id, capacity, status)
SELECT 
    gen_random_uuid(),
    'CS' || (200 + i),
    'Advanced ' || CASE WHEN i % 2 = 0 THEN 'Computing ' ELSE 'Electronics ' END || i,
    (i % 4) + 1,
    CASE WHEN i % 2 = 0 THEN 'CSE' ELSE 'ECE' END,
    (i % 8) + 1,
    (SELECT instructor_id FROM instructors OFFSET (i - 1) LIMIT 1),
    40 + (i * 2),
    'active'
FROM generate_series(1, 10) s(i);

-- ------------------------------------------------------------
-- 7. SEED ENROLLMENTS (20)
-- ------------------------------------------------------------
-- Link students to random courses
DO $$
DECLARE
    s_id uuid;
    c_id uuid;
    v_status varchar(20);
BEGIN
    FOR i IN 1..20 LOOP
        SELECT student_id INTO s_id FROM students ORDER BY random() LIMIT 1;
        SELECT course_id INTO c_id FROM courses ORDER BY random() LIMIT 1;
        
        -- Determine status first
        v_status := CASE WHEN i % 4 = 0 THEN 'pending' ELSE 'approved' END;
        
        -- Avoid duplicate enrollments
        IF NOT EXISTS (SELECT 1 FROM enrollments WHERE student_id = s_id AND course_id = c_id) THEN
            INSERT INTO enrollments (student_id, course_id, approval_status, grade, enrollment_date)
            VALUES (s_id, c_id, 
                    v_status,
                    CASE WHEN v_status = 'approved' THEN 
                        CASE WHEN i % 5 = 0 THEN 'A' WHEN i % 7 = 0 THEN 'B+' ELSE NULL END
                    ELSE NULL END,
                    CURRENT_DATE - (i || ' days')::interval);
        END IF;
    END LOOP;
END $$;

-- ------------------------------------------------------------
-- 8. SEED NOTIFICATIONS & LOGS
-- ------------------------------------------------------------
-- Add some activity for the dashboards
INSERT INTO notifications (user_role, user_id, title, message, type, is_read)
SELECT 
    'student',
    student_id,
    'Welcome!',
    'Your account has been successfully set up.',
    'info',
    false
FROM students;

INSERT INTO activity_logs (actor_role, actor_id, action, target_table, description)
SELECT 
    'system',
    NULL,
    'SEED_DATA',
    'all',
    'Massive database reset and seeding completed successfully.'
FROM generate_series(1, 1) s(i);

-- ------------------------------------------------------------
-- 9. AUTH USER CREATION (CRITICAL)
-- ------------------------------------------------------------
-- All passwords will be: Password123
-- Using pgcrypto's crypt function directly in the loop for maximum compatibility.

DO $$
DECLARE
    rec RECORD;
    v_id uuid;
BEGIN
    -- 1. SEED STUDENTS
    FOR rec IN SELECT student_id, email FROM students LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = rec.email) THEN
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, 
                email_confirmed_at, recovery_sent_at, last_sign_in_at, 
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
                confirmation_token, email_change, email_change_token_new, recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', rec.student_id, 'authenticated', 'authenticated', rec.email, 
                crypt('Password123', gen_salt('bf', 10)), 
                now(), now(), now(),
                '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), 
                '', '', '', ''
            );
        END IF;
    END LOOP;

    -- 2. SEED INSTRUCTORS
    FOR rec IN SELECT instructor_id, email FROM instructors LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = rec.email) THEN
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, 
                email_confirmed_at, recovery_sent_at, last_sign_in_at, 
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
                confirmation_token, email_change, email_change_token_new, recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', rec.instructor_id, 'authenticated', 'authenticated', rec.email, 
                crypt('Password123', gen_salt('bf', 10)), 
                now(), now(), now(),
                '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), 
                '', '', '', ''
            );
        END IF;
    END LOOP;

    -- 3. SEED ADMINS
    FOR rec IN SELECT admin_id, email FROM admins LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = rec.email) THEN
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, 
                email_confirmed_at, recovery_sent_at, last_sign_in_at, 
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
                confirmation_token, email_change, email_change_token_new, recovery_token
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', rec.admin_id, 'authenticated', 'authenticated', rec.email, 
                crypt('Password123', gen_salt('bf', 10)), 
                now(), now(), now(),
                '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), 
                '', '', '', ''
            );
        END IF;
    END LOOP;
END $$;
