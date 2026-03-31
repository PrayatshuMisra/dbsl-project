export type UserRole = 'student' | 'instructor' | 'admin';
export type Status = 'active' | 'inactive' | 'suspended' | 'on_leave';
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export type GradeValue = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F' | null;
export type CourseStatus = 'active' | 'inactive' | 'archived';
export type Semester = number; // 1 to 8
export type Department = 'CSE' | 'ECE' | 'IT' | 'ME' | 'EEE' | string;

export interface Student {
  student_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  department: string;
  semester: number;
  registration_date: string;
  profile_photo?: string | null;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Instructor {
  instructor_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  specialization?: string;
  joining_date: string;
  profile_photo?: string | null;
  status: 'active' | 'inactive' | 'on_leave';
}

export interface Admin {
  admin_id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  status: 'active' | 'inactive';
}

export interface Course {
  course_id: string;
  course_code: string;
  title: string;
  description?: string;
  credits: number;
  department: string;
  semester: number;
  instructor_id?: string | null;
  capacity: number;
  enrolled_count?: number;
  status: CourseStatus;
}

export interface Enrollment {
  enrollment_id: string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  approval_status: EnrollmentStatus;
  grade?: GradeValue;
  remarks?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  profile_photo?: string | null;
  department?: string;
  isDemo?: boolean;
}

export interface Notification {
  notification_id: string;
  user_role: UserRole;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  log_id: string;
  actor_role: 'student' | 'instructor' | 'admin' | 'system';
  actor_id?: string | null;
  action: string;
  target_table?: string;
  target_id?: string;
  description?: string;
  created_at: string;
}
