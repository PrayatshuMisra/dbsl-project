-- ============================================================
-- AUTOMATIC ENROLLMENT NOTIFICATIONS (INSTRUCTOR & STUDENT)
-- ============================================================

-- 1. Function to handle enrollment notifications
create or replace function fn_handle_enrollment_notification()
returns trigger as $$
declare
    v_instructor_id uuid;
    v_student_name varchar(100);
    v_course_title varchar(200);
begin
    -- Get related names
    select full_name into v_student_name from students where student_id = new.student_id;
    select title, instructor_id into v_course_title, v_instructor_id from courses where course_id = new.course_id;

    -- Case A: NEW ENROLLMENT (Notify Instructor)
    if (TG_OP = 'INSERT') then
        insert into notifications (user_role, user_id, title, message, type)
        values (
            'instructor', 
            v_instructor_id, 
            'New Enrollment Request', 
            v_student_name || ' has requested to enroll in your course: ' || v_course_title,
            'info'
        );
    
    -- Case B: STATUS CHANGE (Notify Student)
    elsif (TG_OP = 'UPDATE' and old.approval_status <> new.approval_status) then
        insert into notifications (user_role, user_id, title, message, type)
        values (
            'student', 
            new.student_id, 
            'Enrollment ' || initcap(new.approval_status), 
            'Your enrollment in ' || v_course_title || ' has been ' || new.approval_status || '.',
            case when new.approval_status = 'approved' then 'success' 
                 when new.approval_status = 'rejected' then 'warning'
                 else 'info' end
        );
    end if;

    return new;
end;
$$ language plpgsql;

-- 2. Create the Trigger
drop trigger if exists trg_enrollment_notification on enrollments;
create trigger trg_enrollment_notification
after insert or update on enrollments
for each row
execute function fn_handle_enrollment_notification();
