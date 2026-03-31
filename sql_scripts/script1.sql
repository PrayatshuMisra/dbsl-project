-- ============================================================
-- STUDENT REGISTRATION AND GRADE MANAGEMENT SYSTEM
-- COMPLETE SUPABASE SQL SCRIPT
-- ============================================================

-- ------------------------------------------------------------
-- 0. EXTENSIONS
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. DROP OLD OBJECTS (OPTIONAL RESET)
-- ------------------------------------------------------------
drop view if exists student_transcript_view cascade;
drop view if exists instructor_course_summary_view cascade;
drop view if exists admin_dashboard_summary_view cascade;

drop function if exists update_updated_at_column() cascade;
drop function if exists calculate_student_gpa(uuid) cascade;
drop function if exists validate_grade() cascade;
drop function if exists check_course_capacity() cascade;

drop table if exists activity_logs cascade;
drop table if exists notifications cascade;
drop table if exists enrollments cascade;
drop table if exists courses cascade;
drop table if exists admins cascade;
drop table if exists instructors cascade;
drop table if exists students cascade;

-- ------------------------------------------------------------
-- 2. TABLE: STUDENTS
-- ------------------------------------------------------------
create table students (
    student_id uuid primary key default gen_random_uuid(),
    full_name varchar(100) not null,
    email varchar(150) unique not null,
    phone varchar(20),
    address text,
    date_of_birth date,
    department varchar(100) not null,
    semester int not null check (semester between 1 and 8),
    registration_date date not null default current_date,
    profile_photo text,
    status varchar(20) not null default 'active'
        check (status in ('active', 'inactive', 'suspended')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. TABLE: INSTRUCTORS
-- ------------------------------------------------------------
create table instructors (
    instructor_id uuid primary key default gen_random_uuid(),
    full_name varchar(100) not null,
    email varchar(150) unique not null,
    phone varchar(20),
    department varchar(100) not null,
    specialization varchar(150),
    joining_date date not null default current_date,
    profile_photo text,
    status varchar(20) not null default 'active'
        check (status in ('active', 'inactive', 'on_leave')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. TABLE: ADMINS
-- ------------------------------------------------------------
create table admins (
    admin_id uuid primary key default gen_random_uuid(),
    full_name varchar(100) not null,
    email varchar(150) unique not null,
    role varchar(50) not null default 'Administrator',
    phone varchar(20),
    status varchar(20) not null default 'active'
        check (status in ('active', 'inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. TABLE: COURSES
-- ------------------------------------------------------------
create table courses (
    course_id uuid primary key default gen_random_uuid(),
    course_code varchar(20) unique not null,
    title varchar(200) not null,
    description text,
    credits int not null check (credits between 1 and 6),
    department varchar(100) not null,
    semester int not null check (semester between 1 and 8),
    instructor_id uuid references instructors(instructor_id)
        on update cascade
        on delete set null,
    capacity int not null check (capacity > 0),
    status varchar(20) not null default 'active'
        check (status in ('active', 'inactive', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 6. TABLE: ENROLLMENTS
-- ------------------------------------------------------------
create table enrollments (
    enrollment_id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(student_id)
        on update cascade
        on delete cascade,
    course_id uuid not null references courses(course_id)
        on update cascade
        on delete cascade,
    enrollment_date date not null default current_date,
    approval_status varchar(20) not null default 'pending'
        check (approval_status in ('pending', 'approved', 'rejected', 'withdrawn')),
    grade varchar(2)
        check (grade in ('A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F') or grade is null),
    remarks text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint unique_student_course unique (student_id, course_id)
);

-- ------------------------------------------------------------
-- 7. TABLE: NOTIFICATIONS
-- ------------------------------------------------------------
create table notifications (
    notification_id uuid primary key default gen_random_uuid(),
    user_role varchar(20) not null
        check (user_role in ('student', 'instructor', 'admin')),
    user_id uuid not null,
    title varchar(200) not null,
    message text not null,
    type varchar(50) not null
        check (type in ('info', 'success', 'warning', 'error', 'announcement')),
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 8. TABLE: ACTIVITY LOGS
-- ------------------------------------------------------------
create table activity_logs (
    log_id uuid primary key default gen_random_uuid(),
    actor_role varchar(20) not null
        check (actor_role in ('student', 'instructor', 'admin', 'system')),
    actor_id uuid,
    action varchar(200) not null,
    target_table varchar(100),
    target_id uuid,
    description text,
    created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 9. INDEXES
-- ------------------------------------------------------------
create index idx_students_department on students(department);
create index idx_students_semester on students(semester);
create index idx_students_status on students(status);

create index idx_instructors_department on instructors(department);
create index idx_instructors_status on instructors(status);

create index idx_courses_department on courses(department);
create index idx_courses_semester on courses(semester);
create index idx_courses_status on courses(status);
create index idx_courses_instructor on courses(instructor_id);

create index idx_enrollments_student on enrollments(student_id);
create index idx_enrollments_course on enrollments(course_id);
create index idx_enrollments_status on enrollments(approval_status);

create index idx_notifications_user on notifications(user_role, user_id);
create index idx_notifications_read on notifications(is_read);

create index idx_activity_logs_actor on activity_logs(actor_role, actor_id);
create index idx_activity_logs_target on activity_logs(target_table, target_id);

-- ------------------------------------------------------------
-- 10. UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_students_updated_at
before update on students
for each row
execute function update_updated_at_column();

create trigger trg_instructors_updated_at
before update on instructors
for each row
execute function update_updated_at_column();

create trigger trg_admins_updated_at
before update on admins
for each row
execute function update_updated_at_column();

create trigger trg_courses_updated_at
before update on courses
for each row
execute function update_updated_at_column();

create trigger trg_enrollments_updated_at
before update on enrollments
for each row
execute function update_updated_at_column();

-- ------------------------------------------------------------
-- 11. GRADE VALIDATION TRIGGER
-- ------------------------------------------------------------
create or replace function validate_grade()
returns trigger as $$
begin
    if new.grade is not null and new.approval_status <> 'approved' then
        raise exception 'Grades can only be assigned to approved enrollments.';
    end if;
    return new;
end;
$$ language plpgsql;

create trigger trg_validate_grade
before insert or update on enrollments
for each row
execute function validate_grade();

-- ------------------------------------------------------------
-- 12. COURSE CAPACITY CHECK TRIGGER
-- ------------------------------------------------------------
create or replace function check_course_capacity()
returns trigger as $$
declare
    approved_count int;
    max_capacity int;
begin
    if new.approval_status = 'approved' then
        select capacity into max_capacity
        from courses
        where course_id = new.course_id;

        select count(*) into approved_count
        from enrollments
        where course_id = new.course_id
          and approval_status = 'approved'
          and enrollment_id <> coalesce(new.enrollment_id, '00000000-0000-0000-0000-000000000000'::uuid);

        if approved_count >= max_capacity then
            raise exception 'Course capacity exceeded. Cannot approve more students.';
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

create trigger trg_check_course_capacity
before insert or update on enrollments
for each row
execute function check_course_capacity();

-- ------------------------------------------------------------
-- 13. SAMPLE DATA: STUDENTS (10)
-- ------------------------------------------------------------
insert into students (student_id, full_name, email, phone, address, date_of_birth, department, semester, registration_date, profile_photo, status) values
('11111111-1111-1111-1111-111111111101', 'Aarav Sharma', 'aarav.sharma@univ.edu', '9876500001', 'Mumbai, Maharashtra', '2003-02-14', 'CSE', 4, '2024-07-01', null, 'active'),
('11111111-1111-1111-1111-111111111102', 'Ishita Verma', 'ishita.verma@univ.edu', '9876500002', 'Delhi, India', '2004-05-22', 'CSE', 2, '2025-01-10', null, 'active'),
('11111111-1111-1111-1111-111111111103', 'Rohan Nair', 'rohan.nair@univ.edu', '9876500003', 'Bengaluru, Karnataka', '2002-11-08', 'ECE', 6, '2023-07-15', null, 'active'),
('11111111-1111-1111-1111-111111111104', 'Sneha Patil', 'sneha.patil@univ.edu', '9876500004', 'Pune, Maharashtra', '2003-07-19', 'IT', 4, '2024-07-02', null, 'active'),
('11111111-1111-1111-1111-111111111105', 'Aditya Rao', 'aditya.rao@univ.edu', '9876500005', 'Hyderabad, Telangana', '2003-01-30', 'CSE', 4, '2024-07-03', null, 'active'),
('11111111-1111-1111-1111-111111111106', 'Meera Iyer', 'meera.iyer@univ.edu', '9876500006', 'Chennai, Tamil Nadu', '2004-03-12', 'ECE', 2, '2025-01-09', null, 'active'),
('11111111-1111-1111-1111-111111111107', 'Kabir Malhotra', 'kabir.malhotra@univ.edu', '9876500007', 'Jaipur, Rajasthan', '2002-09-01', 'ME', 6, '2023-07-14', null, 'inactive'),
('11111111-1111-1111-1111-111111111108', 'Priya Desai', 'priya.desai@univ.edu', '9876500008', 'Ahmedabad, Gujarat', '2003-12-03', 'IT', 4, '2024-07-05', null, 'active'),
('11111111-1111-1111-1111-111111111109', 'Yash Kulkarni', 'yash.kulkarni@univ.edu', '9876500009', 'Nagpur, Maharashtra', '2004-08-17', 'CSE', 2, '2025-01-12', null, 'active'),
('11111111-1111-1111-1111-111111111110', 'Ananya Gupta', 'ananya.gupta@univ.edu', '9876500010', 'Lucknow, Uttar Pradesh', '2002-06-25', 'EEE', 6, '2023-07-16', null, 'active');

-- ------------------------------------------------------------
-- 14. SAMPLE DATA: INSTRUCTORS (10)
-- ------------------------------------------------------------
insert into instructors (instructor_id, full_name, email, phone, department, specialization, joining_date, profile_photo, status) values
('22222222-2222-2222-2222-222222222201', 'Dr. Rajesh Menon', 'rajesh.menon@univ.edu', '9876600001', 'CSE', 'Database Systems', '2018-06-15', null, 'active'),
('22222222-2222-2222-2222-222222222202', 'Dr. Kavita Sinha', 'kavita.sinha@univ.edu', '9876600002', 'CSE', 'Web Technologies', '2019-07-20', null, 'active'),
('22222222-2222-2222-2222-222222222203', 'Prof. Arvind Rao', 'arvind.rao@univ.edu', '9876600003', 'ECE', 'Digital Systems', '2017-08-11', null, 'active'),
('22222222-2222-2222-2222-222222222204', 'Dr. Neha Kapoor', 'neha.kapoor@univ.edu', '9876600004', 'IT', 'Software Engineering', '2020-01-09', null, 'active'),
('22222222-2222-2222-2222-222222222205', 'Prof. Sameer Joshi', 'sameer.joshi@univ.edu', '9876600005', 'ME', 'Thermodynamics', '2016-04-17', null, 'active'),
('22222222-2222-2222-2222-222222222206', 'Dr. Pooja Nair', 'pooja.nair@univ.edu', '9876600006', 'EEE', 'Electrical Machines', '2021-03-14', null, 'active'),
('22222222-2222-2222-2222-222222222207', 'Dr. Aman Khurana', 'aman.khurana@univ.edu', '9876600007', 'CSE', 'Artificial Intelligence', '2022-06-01', null, 'active'),
('22222222-2222-2222-2222-222222222208', 'Prof. Ritika Shah', 'ritika.shah@univ.edu', '9876600008', 'IT', 'Cloud Computing', '2018-11-25', null, 'active'),
('22222222-2222-2222-2222-222222222209', 'Dr. Vivek Das', 'vivek.das@univ.edu', '9876600009', 'ECE', 'Microprocessors', '2015-09-18', null, 'on_leave'),
('22222222-2222-2222-2222-222222222210', 'Prof. Shalini Roy', 'shalini.roy@univ.edu', '9876600010', 'CSE', 'Operating Systems', '2020-02-28', null, 'active');

-- ------------------------------------------------------------
-- 15. SAMPLE DATA: ADMINS (10)
-- ------------------------------------------------------------
insert into admins (admin_id, full_name, email, role, phone, status) values
('33333333-3333-3333-3333-333333333301', 'Admin One', 'admin1@univ.edu', 'Super Admin', '9876700001', 'active'),
('33333333-3333-3333-3333-333333333302', 'Admin Two', 'admin2@univ.edu', 'Academic Admin', '9876700002', 'active'),
('33333333-3333-3333-3333-333333333303', 'Admin Three', 'admin3@univ.edu', 'Registrar Admin', '9876700003', 'active'),
('33333333-3333-3333-3333-333333333304', 'Admin Four', 'admin4@univ.edu', 'Exam Admin', '9876700004', 'active'),
('33333333-3333-3333-3333-333333333305', 'Admin Five', 'admin5@univ.edu', 'Department Admin', '9876700005', 'inactive'),
('33333333-3333-3333-3333-333333333306', 'Admin Six', 'admin6@univ.edu', 'Academic Admin', '9876700006', 'active'),
('33333333-3333-3333-3333-333333333307', 'Admin Seven', 'admin7@univ.edu', 'Exam Admin', '9876700007', 'active'),
('33333333-3333-3333-3333-333333333308', 'Admin Eight', 'admin8@univ.edu', 'Support Admin', '9876700008', 'active'),
('33333333-3333-3333-3333-333333333309', 'Admin Nine', 'admin9@univ.edu', 'Department Admin', '9876700009', 'active'),
('33333333-3333-3333-3333-333333333310', 'Admin Ten', 'admin10@univ.edu', 'Academic Admin', '9876700010', 'active');

-- ------------------------------------------------------------
-- 16. SAMPLE DATA: COURSES (10)
-- ------------------------------------------------------------
insert into courses (course_id, course_code, title, description, credits, department, semester, instructor_id, capacity, status) values
('44444444-4444-4444-4444-444444444401', 'CSE201', 'Database Management Systems', 'Introduction to relational databases, SQL, normalization, and transactions.', 4, 'CSE', 4, '22222222-2222-2222-2222-222222222201', 60, 'active'),
('44444444-4444-4444-4444-444444444402', 'CSE202', 'Web Development', 'Frontend and backend fundamentals for web applications.', 4, 'CSE', 4, '22222222-2222-2222-2222-222222222202', 55, 'active'),
('44444444-4444-4444-4444-444444444403', 'ECE301', 'Digital Electronics', 'Combinational and sequential logic design.', 3, 'ECE', 6, '22222222-2222-2222-2222-222222222203', 50, 'active'),
('44444444-4444-4444-4444-444444444404', 'IT205', 'Software Engineering', 'Software lifecycle, UML, and agile methodologies.', 4, 'IT', 4, '22222222-2222-2222-2222-222222222204', 65, 'active'),
('44444444-4444-4444-4444-444444444405', 'ME302', 'Thermodynamics', 'Energy systems and thermodynamic processes.', 3, 'ME', 6, '22222222-2222-2222-2222-222222222205', 40, 'active'),
('44444444-4444-4444-4444-444444444406', 'EEE303', 'Electrical Machines', 'Transformers, motors, and generators.', 4, 'EEE', 6, '22222222-2222-2222-2222-222222222206', 45, 'active'),
('44444444-4444-4444-4444-444444444407', 'CSE304', 'Artificial Intelligence', 'Search, reasoning, machine learning basics.', 4, 'CSE', 6, '22222222-2222-2222-2222-222222222207', 50, 'active'),
('44444444-4444-4444-4444-444444444408', 'IT306', 'Cloud Computing', 'Cloud architecture, deployment, and services.', 4, 'IT', 6, '22222222-2222-2222-2222-222222222208', 50, 'active'),
('44444444-4444-4444-4444-444444444409', 'ECE204', 'Microprocessors', 'Architecture and interfacing of microprocessors.', 4, 'ECE', 4, '22222222-2222-2222-2222-222222222209', 45, 'inactive'),
('44444444-4444-4444-4444-444444444410', 'CSE203', 'Operating Systems', 'Processes, memory, scheduling, file systems.', 4, 'CSE', 4, '22222222-2222-2222-2222-222222222210', 60, 'active');

-- ------------------------------------------------------------
-- 17. SAMPLE DATA: ENROLLMENTS (10)
-- ------------------------------------------------------------
insert into enrollments (enrollment_id, student_id, course_id, enrollment_date, approval_status, grade, remarks) values
('55555555-5555-5555-5555-555555555501', '11111111-1111-1111-1111-111111111101', '44444444-4444-4444-4444-444444444401', '2025-01-15', 'approved', 'A', 'Excellent performance'),
('55555555-5555-5555-5555-555555555502', '11111111-1111-1111-1111-111111111102', '44444444-4444-4444-4444-444444444401', '2025-01-16', 'approved', 'B+', 'Good understanding'),
('55555555-5555-5555-5555-555555555503', '11111111-1111-1111-1111-111111111103', '44444444-4444-4444-4444-444444444403', '2025-01-17', 'approved', 'A+', 'Outstanding work'),
('55555555-5555-5555-5555-555555555504', '11111111-1111-1111-1111-111111111104', '44444444-4444-4444-4444-444444444404', '2025-01-18', 'approved', 'A', 'Consistent performance'),
('55555555-5555-5555-5555-555555555505', '11111111-1111-1111-1111-111111111105', '44444444-4444-4444-4444-444444444402', '2025-01-19', 'pending', null, 'Awaiting admin approval'),
('55555555-5555-5555-5555-555555555506', '11111111-1111-1111-1111-111111111106', '44444444-4444-4444-4444-444444444403', '2025-01-20', 'approved', 'B', 'Needs more practice'),
('55555555-5555-5555-5555-555555555507', '11111111-1111-1111-1111-111111111107', '44444444-4444-4444-4444-444444444405', '2025-01-21', 'rejected', null, 'Student inactive'),
('55555555-5555-5555-5555-555555555508', '11111111-1111-1111-1111-111111111108', '44444444-4444-4444-4444-444444444404', '2025-01-22', 'approved', 'A', 'Very good project work'),
('55555555-5555-5555-5555-555555555509', '11111111-1111-1111-1111-111111111109', '44444444-4444-4444-4444-444444444410', '2025-01-23', 'approved', 'C+', 'Average performance'),
('55555555-5555-5555-5555-555555555510', '11111111-1111-1111-1111-111111111110', '44444444-4444-4444-4444-444444444406', '2025-01-24', 'approved', 'B+', 'Good lab performance');

-- ------------------------------------------------------------
-- 18. SAMPLE DATA: NOTIFICATIONS (10)
-- ------------------------------------------------------------
insert into notifications (notification_id, user_role, user_id, title, message, type, is_read) values
('66666666-6666-6666-6666-666666666601', 'student', '11111111-1111-1111-1111-111111111101', 'Enrollment Approved', 'Your enrollment in DBMS has been approved.', 'success', false),
('66666666-6666-6666-6666-666666666602', 'student', '11111111-1111-1111-1111-111111111105', 'Enrollment Pending', 'Your enrollment request is under review.', 'info', false),
('66666666-6666-6666-6666-666666666603', 'student', '11111111-1111-1111-1111-111111111107', 'Enrollment Rejected', 'Your enrollment request was rejected.', 'warning', true),
('66666666-6666-6666-6666-666666666604', 'instructor', '22222222-2222-2222-2222-222222222201', 'New Student Added', 'A new student has enrolled in your DBMS course.', 'info', false),
('66666666-6666-6666-6666-666666666605', 'instructor', '22222222-2222-2222-2222-222222222204', 'Grades Published', 'You have successfully published grades.', 'success', true),
('66666666-6666-6666-6666-666666666606', 'admin', '33333333-3333-3333-3333-333333333301', 'System Alert', '5 new enrollment requests are pending approval.', 'warning', false),
('66666666-6666-6666-6666-666666666607', 'admin', '33333333-3333-3333-3333-333333333302', 'Course Created', 'A new course has been added to the catalog.', 'success', true),
('66666666-6666-6666-6666-666666666608', 'student', '11111111-1111-1111-1111-111111111108', 'Grade Published', 'Your grade for Software Engineering is now available.', 'success', false),
('66666666-6666-6666-6666-666666666609', 'instructor', '22222222-2222-2222-2222-222222222210', 'Course Assignment', 'You have been assigned to Operating Systems.', 'info', false),
('66666666-6666-6666-6666-666666666610', 'admin', '33333333-3333-3333-3333-333333333304', 'Semester Update', 'Semester reporting has been generated successfully.', 'announcement', false);

-- ------------------------------------------------------------
-- 19. SAMPLE DATA: ACTIVITY LOGS (10)
-- ------------------------------------------------------------
insert into activity_logs (log_id, actor_role, actor_id, action, target_table, target_id, description) values
('77777777-7777-7777-7777-777777777701', 'student', '11111111-1111-1111-1111-111111111101', 'ENROLL_REQUEST', 'enrollments', '55555555-5555-5555-5555-555555555501', 'Student requested enrollment in DBMS'),
('77777777-7777-7777-7777-777777777702', 'admin', '33333333-3333-3333-3333-333333333301', 'APPROVE_ENROLLMENT', 'enrollments', '55555555-5555-5555-5555-555555555501', 'Admin approved enrollment'),
('77777777-7777-7777-7777-777777777703', 'instructor', '22222222-2222-2222-2222-222222222201', 'ASSIGN_GRADE', 'enrollments', '55555555-5555-5555-5555-555555555501', 'Grade A assigned to Aarav Sharma'),
('77777777-7777-7777-7777-777777777704', 'admin', '33333333-3333-3333-3333-333333333302', 'CREATE_COURSE', 'courses', '44444444-4444-4444-4444-444444444410', 'Operating Systems course created'),
('77777777-7777-7777-7777-777777777705', 'admin', '33333333-3333-3333-3333-333333333303', 'CREATE_STUDENT', 'students', '11111111-1111-1111-1111-111111111109', 'New student profile created'),
('77777777-7777-7777-7777-777777777706', 'instructor', '22222222-2222-2222-2222-222222222204', 'UPDATE_GRADE', 'enrollments', '55555555-5555-5555-5555-555555555504', 'Updated grade for Sneha Patil'),
('77777777-7777-7777-7777-777777777707', 'student', '11111111-1111-1111-1111-111111111108', 'VIEW_TRANSCRIPT', 'students', '11111111-1111-1111-1111-111111111108', 'Student viewed transcript'),
('77777777-7777-7777-7777-777777777708', 'admin', '33333333-3333-3333-3333-333333333304', 'GENERATE_REPORT', 'courses', '44444444-4444-4444-4444-444444444401', 'Generated course performance report'),
('77777777-7777-7777-7777-777777777709', 'system', null, 'AUTO_NOTIFICATION', 'notifications', '66666666-6666-6666-6666-666666666608', 'System sent grade published notification'),
('77777777-7777-7777-7777-777777777710', 'student', '11111111-1111-1111-1111-111111111102', 'UPDATE_PROFILE', 'students', '11111111-1111-1111-1111-111111111102', 'Student updated profile information');

-- ------------------------------------------------------------
-- 20. FUNCTION: CALCULATE STUDENT GPA
-- ------------------------------------------------------------
create or replace function calculate_student_gpa(p_student_id uuid)
returns numeric(3,2) as $$
declare
    gpa numeric(3,2);
begin
    select round(avg(
        case grade
            when 'A+' then 10
            when 'A'  then 9
            when 'B+' then 8
            when 'B'  then 7
            when 'C+' then 6
            when 'C'  then 5
            when 'D'  then 4
            when 'F'  then 0
            else null
        end
    ), 2)
    into gpa
    from enrollments
    where student_id = p_student_id
      and approval_status = 'approved'
      and grade is not null;

    return coalesce(gpa, 0);
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- 21. VIEW: STUDENT TRANSCRIPT
-- ------------------------------------------------------------
create or replace view student_transcript_view as
select
    s.student_id,
    s.full_name as student_name,
    s.department as student_department,
    s.semester as student_semester,
    c.course_id,
    c.course_code,
    c.title as course_title,
    c.credits,
    c.department as course_department,
    c.semester as course_semester,
    e.enrollment_id,
    e.enrollment_date,
    e.approval_status,
    e.grade,
    e.remarks,
    i.full_name as instructor_name
from students s
join enrollments e on s.student_id = e.student_id
join courses c on e.course_id = c.course_id
left join instructors i on c.instructor_id = i.instructor_id;

-- ------------------------------------------------------------
-- 22. VIEW: INSTRUCTOR COURSE SUMMARY
-- ------------------------------------------------------------
create or replace view instructor_course_summary_view as
select
    i.instructor_id,
    i.full_name as instructor_name,
    c.course_id,
    c.course_code,
    c.title as course_title,
    c.department,
    c.semester,
    c.capacity,
    count(e.enrollment_id) filter (where e.approval_status = 'approved') as approved_students,
    count(e.enrollment_id) filter (where e.approval_status = 'pending') as pending_students,
    count(e.enrollment_id) as total_enrollments
from instructors i
join courses c on i.instructor_id = c.instructor_id
left join enrollments e on c.course_id = e.course_id
group by i.instructor_id, i.full_name, c.course_id, c.course_code, c.title, c.department, c.semester, c.capacity;

-- ------------------------------------------------------------
-- 23. VIEW: ADMIN DASHBOARD SUMMARY
-- ------------------------------------------------------------
create or replace view admin_dashboard_summary_view as
select
    (select count(*) from students) as total_students,
    (select count(*) from instructors) as total_instructors,
    (select count(*) from admins where status = 'active') as active_admins,
    (select count(*) from courses where status = 'active') as active_courses,
    (select count(*) from enrollments where approval_status = 'approved') as approved_enrollments,
    (select count(*) from enrollments where approval_status = 'pending') as pending_enrollments,
    (select count(*) from notifications where is_read = false) as unread_notifications;

-- ------------------------------------------------------------
-- 24. USEFUL TEST QUERIES
-- ------------------------------------------------------------

-- View all students
-- select * from students;

-- View all instructors
-- select * from instructors;

-- View all courses with instructor names
-- select c.*, i.full_name as instructor_name
-- from courses c
-- left join instructors i on c.instructor_id = i.instructor_id;

-- View all enrollments with student and course
-- select
--     e.enrollment_id,
--     s.full_name as student_name,
--     c.title as course_title,
--     e.approval_status,
--     e.grade
-- from enrollments e
-- join students s on e.student_id = s.student_id
-- join courses c on e.course_id = c.course_id;

-- View transcript
-- select * from student_transcript_view;

-- Calculate GPA for one student
-- select calculate_student_gpa('11111111-1111-1111-1111-111111111101');

-- View instructor summary
-- select * from instructor_course_summary_view;

-- View admin dashboard summary
-- select * from admin_dashboard_summary_view;