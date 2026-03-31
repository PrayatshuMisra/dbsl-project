import { Student, Instructor, Admin, Course, Enrollment, Notification, ActivityLog } from './types';

export const mockStudents: Student[] = [
  { student_id: '1', full_name: 'Aarav Sharma', email: 'aarav@demo.com', department: 'Computer Science', semester: 4, registration_date: '2024-07-01', status: 'active' },
  { student_id: '2', full_name: 'Ishita Verma', email: 'ishita@demo.com', department: 'Computer Science', semester: 2, registration_date: '2025-01-10', status: 'active' },
  { student_id: '3', full_name: 'Rohan Nair', email: 'rohan@demo.com', department: 'Engineering', semester: 6, registration_date: '2023-07-15', status: 'active' },
];

export const mockInstructors: Instructor[] = [
  { instructor_id: '1', full_name: 'Dr. Rajesh Menon', email: 'rajesh@demo.com', department: 'Computer Science', specialization: 'Database Systems', joining_date: '2018-06-15', status: 'active' },
  { instructor_id: '2', full_name: 'Dr. Kavita Sinha', email: 'kavita@demo.com', department: 'Computer Science', specialization: 'Web Technologies', joining_date: '2019-07-20', status: 'active' },
];

export const mockAdmins: Admin[] = [
  { admin_id: '1', full_name: 'Admin One', email: 'admin@demo.com', role: 'Super Admin', status: 'active' },
];

export const mockCourses: Course[] = [
  { course_id: '1', course_code: 'CSE201', title: 'Database Management Systems', credits: 4, department: 'Computer Science', semester: 4, instructor_id: '1', capacity: 60, status: 'active', enrolled_count: 42 },
  { course_id: '2', course_code: 'CSE202', title: 'Web Development', credits: 4, department: 'Computer Science', semester: 4, instructor_id: '2', capacity: 55, status: 'active', enrolled_count: 38 },
  { course_id: '3', course_code: 'ECE301', title: 'Digital Electronics', credits: 3, department: 'Engineering', semester: 6, instructor_id: null, capacity: 50, status: 'active', enrolled_count: 15 },
];

export const mockEnrollments: Enrollment[] = [
  { enrollment_id: '1', student_id: '1', course_id: '1', enrollment_date: '2025-01-15', approval_status: 'approved', grade: 'A', remarks: 'Excellent performance' },
  { enrollment_id: '2', student_id: '1', course_id: '2', enrollment_date: '2025-01-16', approval_status: 'pending', remarks: 'Awaiting admin approval' },
];

export const mockNotifications: Notification[] = [
  { notification_id: '1', user_role: 'student', user_id: '1', title: 'Enrollment Approved', message: 'Your enrollment in DBMS has been approved.', type: 'success', is_read: false, created_at: new Date().toISOString() },
];

export const mockActivityLogs: ActivityLog[] = [
  { log_id: '1', actor_role: 'admin', actor_id: '1', action: 'APPROVE_ENROLLMENT', target_table: 'enrollments', target_id: '1', description: 'Admin approved enrollment for Aarav Sharma', created_at: new Date().toISOString() },
];
