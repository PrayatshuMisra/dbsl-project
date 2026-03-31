import { Enrollment, GradeValue } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { mockEnrollments, mockCourses, mockStudents, mockNotifications } from '@/lib/mockData';

export const enrollmentService = {
  getEnrollments: async (): Promise<Enrollment[]> => {
    if (useAuthStore.getState().user?.isDemo) {
        return mockEnrollments.map(e => ({
            ...e,
            courses: mockCourses.find(c => c.course_id === e.course_id),
            students: mockStudents.find(s => s.student_id === e.student_id)
        }));
    }

    const { data, error } = await supabase.from('enrollments').select('*, courses(*)').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getEnrollmentsByStudent: async (studentId: string): Promise<Enrollment[]> => {
    if (!studentId) return [];
    if (useAuthStore.getState().user?.isDemo) {
        return mockEnrollments
            .filter(e => e.student_id === studentId)
            .map(e => ({ ...e, courses: mockCourses.find(c => c.course_id === e.course_id) }));
    }

    const { data, error } = await supabase.from('enrollments').select('*, courses(*)').eq('student_id', studentId);
    if (error) throw error;
    return data || [];
  },

  getEnrollmentsByCourse: async (courseId: string): Promise<Enrollment[]> => {
    if (!courseId) return [];
    if (useAuthStore.getState().user?.isDemo) {
        return mockEnrollments
            .filter(e => e.course_id === courseId)
            .map(e => ({ ...e, students: mockStudents.find(s => s.student_id === e.student_id) }));
    }

    const { data, error } = await supabase.from('enrollments').select('*, students(*)').eq('course_id', courseId);
    if (error) throw error;
    return data || [];
  },

  createEnrollment: async (data: Omit<Enrollment, 'enrollment_id' | 'created_at' | 'updated_at' | 'enrollment_date'>): Promise<Enrollment> => {
    if (useAuthStore.getState().user?.isDemo) {
        const newEnrollment = { 
            ...data, 
            enrollment_id: Math.random().toString(36).substr(2, 9), 
            enrollment_date: new Date().toISOString().split('T')[0],
            approval_status: 'pending' as const
        };
        mockEnrollments.push(newEnrollment as Enrollment);

        // Add Mock Notification for Instructor
        const course = mockCourses.find(c => c.course_id === data.course_id);
        const student = mockStudents.find(s => s.student_id === data.student_id);
        if (course && course.instructor_id) {
            mockNotifications.push({
                notification_id: Math.random().toString(36).substr(2, 9),
                user_role: 'instructor' as const,
                user_id: course.instructor_id,
                title: 'New Enrollment Request',
                message: `${student?.full_name || 'A student'} has requested to enroll in: ${course.title}`,
                type: 'info' as const,
                is_read: false,
                created_at: new Date().toISOString()
            });
        }
        return newEnrollment as Enrollment;
    }

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({ ...data, enrollment_date: new Date().toISOString().split('T')[0] })
      .select()
      .single();
    if (error) throw error;
    return enrollment;
  },

  updateEnrollmentStatus: async (id: string, status: Enrollment['approval_status']): Promise<Enrollment> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockEnrollments.findIndex(e => e.enrollment_id === id);
        if (index !== -1) {
            mockEnrollments[index].approval_status = status;

            // Add Mock Notification for Student
            const enrollment = mockEnrollments[index];
            const course = mockCourses.find(c => c.course_id === enrollment.course_id);
            mockNotifications.push({
                notification_id: Math.random().toString(36).substr(2, 9),
                user_role: 'student' as const,
                user_id: enrollment.student_id,
                title: `Enrollment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: `Your enrollment in ${course?.title || 'a course'} has been ${status}.`,
                type: status === 'approved' ? 'success' : 'warning' as any,
                is_read: false,
                created_at: new Date().toISOString()
            });
        }
        return mockEnrollments[index];
    }

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .update({ approval_status: status })
      .eq('enrollment_id', id)
      .select()
      .single();
    if (error) throw error;
    return enrollment;
  },

  assignGrade: async (id: string, grade: GradeValue, remarks?: string): Promise<Enrollment> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockEnrollments.findIndex(e => e.enrollment_id === id);
        if (index !== -1) {
            mockEnrollments[index].grade = grade;
            mockEnrollments[index].remarks = remarks;
        }
        return mockEnrollments[index];
    }

    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .update({ grade, remarks })
      .eq('enrollment_id', id)
      .select()
      .single();
    if (error) throw error;
    return enrollment;
  },

  withdrawEnrollment: async (id: string): Promise<void> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockEnrollments.findIndex(e => e.enrollment_id === id);
        if (index !== -1) mockEnrollments[index].approval_status = 'withdrawn';
        return;
    }

    const { error } = await supabase
      .from('enrollments')
      .update({ approval_status: 'withdrawn' })
      .eq('enrollment_id', id);
    if (error) throw error;
  },
};
