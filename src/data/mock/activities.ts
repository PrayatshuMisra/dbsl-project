import { ActivityLog } from '@/lib/types';

export const mockActivities: ActivityLog[] = [
  { id: 'ACT001', action: 'enrollment_approved', description: 'Approved enrollment for Alice Johnson in CS101', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-20T10:30:00Z', entity_type: 'enrollment', entity_id: 'ENR001' },
  { id: 'ACT002', action: 'grade_updated', description: 'Updated grade for Bob Martinez in MATH101 to A+', user_name: 'Prof. Robert Harris', user_role: 'instructor', timestamp: '2025-08-19T14:00:00Z', entity_type: 'enrollment', entity_id: 'ENR005' },
  { id: 'ACT003', action: 'course_created', description: 'Created new course CS401 - Machine Learning', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-18T09:15:00Z', entity_type: 'course', entity_id: 'CRS012' },
  { id: 'ACT004', action: 'student_registered', description: 'New student James Taylor registered', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-17T11:00:00Z', entity_type: 'student', entity_id: 'STU010' },
  { id: 'ACT005', action: 'enrollment_rejected', description: 'Rejected enrollment for Emma Davis in CHEM101', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-16T15:30:00Z', entity_type: 'enrollment', entity_id: 'ENR014' },
  { id: 'ACT006', action: 'instructor_added', description: 'Added new instructor Dr. Jennifer Adams', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-15T10:00:00Z', entity_type: 'instructor', entity_id: 'INS007' },
  { id: 'ACT007', action: 'course_updated', description: 'Updated capacity for CS201 from 30 to 35', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-14T13:45:00Z', entity_type: 'course', entity_id: 'CRS002' },
  { id: 'ACT008', action: 'grade_published', description: 'Published grades for PHY101 - Physics I', user_name: 'Dr. Lisa Chang', user_role: 'instructor', timestamp: '2025-08-13T16:00:00Z', entity_type: 'course', entity_id: 'CRS005' },
  { id: 'ACT009', action: 'student_deactivated', description: 'Deactivated student Henry Wilson', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-12T09:00:00Z', entity_type: 'student', entity_id: 'STU008' },
  { id: 'ACT010', action: 'enrollment_approved', description: 'Approved enrollment for Frank Lee in ENG201', user_name: 'Admin User', user_role: 'admin', timestamp: '2025-08-11T11:30:00Z', entity_type: 'enrollment', entity_id: 'ENR015' },
];
