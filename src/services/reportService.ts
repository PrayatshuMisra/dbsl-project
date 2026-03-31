import { ActivityLog } from '@/lib/types';
import { mockActivities } from '@/data/mock/activities';

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const reportService = {
  getActivityLogs: async (): Promise<ActivityLog[]> => { await delay(); return [...mockActivities]; },
  getGradeDistribution: async () => {
    await delay();
    return [
      { grade: 'A+', count: 3 }, { grade: 'A', count: 5 }, { grade: 'A-', count: 4 },
      { grade: 'B+', count: 3 }, { grade: 'B', count: 2 }, { grade: 'B-', count: 1 },
      { grade: 'C+', count: 1 }, { grade: 'C', count: 0 }, { grade: 'D', count: 0 }, { grade: 'F', count: 0 },
    ];
  },
  getEnrollmentsByDepartment: async () => {
    await delay();
    return [
      { department: 'Computer Science', count: 12 }, { department: 'Mathematics', count: 8 },
      { department: 'Physics', count: 5 }, { department: 'Chemistry', count: 4 },
      { department: 'Biology', count: 3 }, { department: 'Engineering', count: 3 },
      { department: 'Business', count: 4 }, { department: 'English', count: 2 },
    ];
  },
  getEnrollmentTrends: async () => {
    await delay();
    return [
      { month: 'Jan', enrollments: 45 }, { month: 'Feb', enrollments: 52 },
      { month: 'Mar', enrollments: 38 }, { month: 'Apr', enrollments: 65 },
      { month: 'May', enrollments: 72 }, { month: 'Jun', enrollments: 30 },
      { month: 'Jul', enrollments: 25 }, { month: 'Aug', enrollments: 95 },
    ];
  },
  getInstructorWorkload: async () => {
    await delay();
    return [
      { name: 'Dr. Mitchell', courses: 4, students: 116 },
      { name: 'Prof. Harris', courses: 2, students: 77 },
      { name: 'Dr. Chang', courses: 1, students: 38 },
      { name: 'Prof. Brooks', courses: 1, students: 36 },
      { name: 'Dr. Torres', courses: 1, students: 42 },
      { name: 'Prof. Scott', courses: 1, students: 28 },
      { name: 'Dr. Adams', courses: 1, students: 55 },
    ];
  },
};
