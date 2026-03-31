import { ActivityLog } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { mapDepartmentToUI } from '@/lib/mappings';
import { useAuthStore } from '@/stores/authStore';
import { mockActivityLogs, mockEnrollments, mockCourses, mockStudents, mockInstructors, mockNotifications } from '@/lib/mockData';

export const reportService = {
  getActivityLogs: async (): Promise<ActivityLog[]> => {
    if (useAuthStore.getState().user?.isDemo) return mockActivityLogs;

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getGradeDistribution: async () => {
    const enrolls = useAuthStore.getState().user?.isDemo ? mockEnrollments : null;
    let data;

    if (enrolls) {
        data = enrolls;
    } else {
        const { data: dbData, error } = await supabase
          .from('enrollments')
          .select('grade')
          .not('grade', 'is', null);
        if (error) throw error;
        data = dbData;
    }

    const counts: Record<string, number> = {};
    data?.forEach(e => {
        if (e.grade) counts[e.grade] = (counts[e.grade] || 0) + 1;
    });

    const grades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
    return grades.map(g => ({ grade: g, count: counts[g] || 0 }));
  },

  getEnrollmentsByDepartment: async () => {
    if (useAuthStore.getState().user?.isDemo) {
        const deptCounts: Record<string, number> = {};
        mockCourses.forEach(c => {
            deptCounts[c.department] = (deptCounts[c.department] || 0) + (c.enrolled_count || 0);
        });
        return Object.entries(deptCounts).map(([department, count]) => ({ department, count }));
    }

    const { data, error } = await supabase
      .from('courses')
      .select(`
        department,
        enrollments (enrollment_id)
      `);
    if (error) throw error;

    const deptCounts: Record<string, number> = {};
    data?.forEach((c: any) => {
        const uiDept = mapDepartmentToUI(c.department);
        deptCounts[uiDept] = (deptCounts[uiDept] || 0) + (c.enrollments?.length || 0);
    });

    return Object.entries(deptCounts).map(([department, count]) => ({ department, count }));
  },

  getEnrollmentTrends: async () => {
    const enrolls = useAuthStore.getState().user?.isDemo ? mockEnrollments : null;
    let data;

    if (enrolls) {
        data = enrolls;
    } else {
        const { data: dbData, error } = await supabase
          .from('enrollments')
          .select('enrollment_date');
        if (error) throw error;
        data = dbData;
    }

    const monthlyCounts: Record<string, number> = {};
    data?.forEach(e => {
        const month = new Date(e.enrollment_date || '').toLocaleString('default', { month: 'short' });
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    return months.slice(Math.max(0, currentMonth - 7), currentMonth + 1).map(m => ({
        month: m,
        enrollments: monthlyCounts[m] || 0
    }));
  },

  getInstructorWorkload: async () => {
    if (useAuthStore.getState().user?.isDemo) {
        return mockInstructors.map(i => ({
            name: i.full_name,
            courses: mockCourses.filter(c => c.instructor_id === i.instructor_id).length,
            students: mockCourses.filter(c => c.instructor_id === i.instructor_id).reduce((acc, c) => acc + (c.enrolled_count || 0), 0)
        }));
    }

    const { data, error } = await supabase
      .from('instructor_course_summary_view')
      .select('*');
    if (error) throw error;

    return data?.map(i => ({
        name: i.instructor_name,
        courses: i.total_enrollments > 0 ? 1 : 0, 
        students: i.approved_students
    })) || [];
  },

  getAdminDashboardSummary: async () => {
    if (useAuthStore.getState().user?.isDemo) {
        return {
            total_students: mockStudents.length,
            total_instructors: mockInstructors.length,
            active_admins: 1,
            active_courses: mockCourses.length,
            approved_enrollments: mockEnrollments.filter(e => e.approval_status === 'approved').length,
            pending_enrollments: mockEnrollments.filter(e => e.approval_status === 'pending').length,
            unread_notifications: mockNotifications.filter(n => !n.is_read).length
        };
    }

    const { data, error } = await supabase
      .from('admin_dashboard_summary_view')
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
};
