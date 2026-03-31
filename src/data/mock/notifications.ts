import { Notification } from '@/lib/types';

export const mockNotifications: Notification[] = [
  { id: 'NOT001', title: 'Enrollment Approved', message: 'Your enrollment in CS101 - Introduction to Computer Science has been approved.', type: 'success', read: false, created_at: '2025-08-20T10:30:00Z', user_id: 'STU001' },
  { id: 'NOT002', title: 'Grade Published', message: 'Your grade for MATH101 - Calculus I has been published. Check your grades page.', type: 'info', read: false, created_at: '2025-08-19T14:00:00Z', user_id: 'STU001' },
  { id: 'NOT003', title: 'Enrollment Pending', message: 'Your enrollment request for CS401 - Machine Learning is pending approval.', type: 'warning', read: true, created_at: '2025-08-18T09:15:00Z', user_id: 'STU001' },
  { id: 'NOT004', title: 'New Course Available', message: 'A new course CS301 - Database Systems has been added for Spring 2025.', type: 'info', read: true, created_at: '2025-08-17T11:00:00Z', user_id: 'STU001' },
  { id: 'NOT005', title: 'System Maintenance', message: 'The system will undergo maintenance on Aug 25, 2025 from 2:00 AM to 6:00 AM.', type: 'warning', read: false, created_at: '2025-08-16T08:00:00Z', user_id: 'ALL' },
  { id: 'NOT006', title: 'Grade Submission Reminder', message: 'Please submit grades for CS201 - Data Structures & Algorithms by Aug 30.', type: 'warning', read: false, created_at: '2025-08-20T09:00:00Z', user_id: 'INS001' },
  { id: 'NOT007', title: 'New Enrollment Requests', message: '3 new enrollment requests pending your review.', type: 'info', read: false, created_at: '2025-08-20T11:00:00Z', user_id: 'ADM001' },
  { id: 'NOT008', title: 'Academic Report Ready', message: 'The Fall 2025 enrollment report has been generated.', type: 'success', read: true, created_at: '2025-08-15T16:00:00Z', user_id: 'ADM001' },
];
