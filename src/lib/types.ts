export type UserRole = 'student' | 'instructor' | 'admin';
export type Status = 'active' | 'inactive';
export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';
export type GradeValue = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F' | 'W' | 'I' | 'P' | null;
export type CourseStatus = 'active' | 'inactive' | 'archived';
export type Semester = 'Fall 2025' | 'Spring 2025' | 'Summer 2025' | 'Fall 2024' | 'Spring 2024';
export type Department = 'Computer Science' | 'Mathematics' | 'Physics' | 'Chemistry' | 'Biology' | 'English' | 'Business' | 'Engineering';

export interface Student {
  student_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  department: Department;
  semester: Semester;
  registration_date: string;
  profile_photo: string;
  status: Status;
}

export interface Instructor {
  instructor_id: string;
  full_name: string;
  email: string;
  phone: string;
  department: Department;
  specialization: string;
  joining_date: string;
  profile_photo: string;
  status: Status;
}

export interface Admin {
  admin_id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
  status: Status;
}

export interface Course {
  course_id: string;
  course_code: string;
  title: string;
  description: string;
  credits: number;
  department: Department;
  semester: Semester;
  instructor_id: string;
  capacity: number;
  enrolled_count: number;
  status: CourseStatus;
}

export interface Enrollment {
  enrollment_id: string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  approval_status: EnrollmentStatus;
  grade: GradeValue;
  remarks: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  profile_photo: string;
  department?: Department;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  user_id: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user_name: string;
  user_role: UserRole;
  timestamp: string;
  entity_type: string;
  entity_id: string;
}
