import { Course } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { mapDepartmentToUI } from '@/lib/mappings';
import { useAuthStore } from '@/stores/authStore';
import { mockCourses } from '@/lib/mockData';

export const courseService = {
  getCourses: async (): Promise<Course[]> => {
    if (useAuthStore.getState().user?.isDemo) return mockCourses;

    // Selection including a join to enrollments for count
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*, enrollments(enrollment_id)');
    
    if (error) throw error;

    return (courses || []).map(c => ({
      ...c,
      department: mapDepartmentToUI(c.department),
      enrolled_count: c.enrollments?.length || 0,
    }));
  },

  getCourseById: async (id: string): Promise<Course | undefined> => {
    if (useAuthStore.getState().user?.isDemo) return mockCourses.find(c => c.course_id === id);

    const { data: course, error } = await supabase
      .from('courses')
      .select('*, enrollments(enrollment_id)')
      .eq('course_id', id)
      .single();
    
    if (error) throw error;
    if (!course) return undefined;

    return {
      ...course,
      department: mapDepartmentToUI(course.department),
      enrolled_count: course.enrollments?.length || 0,
    };
  },

  createCourse: async (data: Omit<Course, 'course_id'>): Promise<Course> => {
    if (useAuthStore.getState().user?.isDemo) {
        const newCourse = { ...data, course_id: Math.random().toString(36).substr(2, 9) };
        mockCourses.push(newCourse as Course);
        return newCourse as Course;
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return course;
  },

  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockCourses.findIndex(c => c.course_id === id);
        if (index !== -1) mockCourses[index] = { ...mockCourses[index], ...data };
        return mockCourses[index];
    }

    const { data: course, error } = await supabase
      .from('courses')
      .update(data)
      .eq('course_id', id)
      .select()
      .single();
    if (error) throw error;
    return course;
  },

  deleteCourse: async (id: string): Promise<void> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockCourses.findIndex(c => c.course_id === id);
        if (index !== -1) mockCourses.splice(index, 1);
        return;
    }

    const { error } = await supabase.from('courses').delete().eq('course_id', id);
    if (error) throw error;
  },
};

