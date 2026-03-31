import { Enrollment, GradeValue } from '@/lib/types';
import { mockEnrollments } from '@/data/mock/enrollments';

const enrollments = [...mockEnrollments];
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const enrollmentService = {
  getEnrollments: async (): Promise<Enrollment[]> => { await delay(); return [...enrollments]; },
  getEnrollmentsByStudent: async (studentId: string): Promise<Enrollment[]> => { await delay(); return enrollments.filter(e => e.student_id === studentId); },
  getEnrollmentsByCourse: async (courseId: string): Promise<Enrollment[]> => { await delay(); return enrollments.filter(e => e.course_id === courseId); },
  createEnrollment: async (data: Omit<Enrollment, 'enrollment_id'>): Promise<Enrollment> => {
    await delay();
    const enrollment = { ...data, enrollment_id: `ENR${String(enrollments.length + 1).padStart(3, '0')}` };
    enrollments.push(enrollment);
    return enrollment;
  },
  updateEnrollmentStatus: async (id: string, status: Enrollment['approval_status']): Promise<Enrollment> => {
    await delay();
    const idx = enrollments.findIndex(e => e.enrollment_id === id);
    if (idx === -1) throw new Error('Enrollment not found');
    enrollments[idx] = { ...enrollments[idx], approval_status: status };
    return enrollments[idx];
  },
  assignGrade: async (id: string, grade: GradeValue, remarks?: string): Promise<Enrollment> => {
    await delay();
    const idx = enrollments.findIndex(e => e.enrollment_id === id);
    if (idx === -1) throw new Error('Enrollment not found');
    enrollments[idx] = { ...enrollments[idx], grade, remarks: remarks ?? enrollments[idx].remarks };
    return enrollments[idx];
  },
  withdrawEnrollment: async (id: string): Promise<void> => {
    await delay();
    const idx = enrollments.findIndex(e => e.enrollment_id === id);
    if (idx !== -1) enrollments[idx].approval_status = 'withdrawn';
  },
};
