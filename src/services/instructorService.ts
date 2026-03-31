import { Instructor } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { mapDepartmentToUI, mapDepartmentToDB } from '@/lib/mappings';
import { useAuthStore } from '@/stores/authStore';
import { mockInstructors } from '@/lib/mockData';

export const instructorService = {
  getInstructors: async (): Promise<Instructor[]> => {
    if (useAuthStore.getState().user?.isDemo) return mockInstructors;

    const { data, error } = await supabase.from('instructors').select('*').order('full_name');
    if (error) throw error;
    return (data || []).map(i => ({ ...i, department: mapDepartmentToUI(i.department) }));
  },

  getInstructorById: async (id: string): Promise<Instructor | undefined> => {
    if (useAuthStore.getState().user?.isDemo) return mockInstructors.find(i => i.instructor_id === id);

    const { data, error } = await supabase.from('instructors').select('*').eq('instructor_id', id).single();
    if (error) throw error;
    if (!data) return undefined;
    return { ...data, department: mapDepartmentToUI(data.department) };
  },

  createInstructor: async (data: Omit<Instructor, 'instructor_id' | 'joining_date'>): Promise<Instructor> => {
    if (useAuthStore.getState().user?.isDemo) {
        const newInstructor = { ...data, instructor_id: Math.random().toString(36).substr(2, 9), joining_date: new Date().toISOString().split('T')[0], status: 'active' as const };
        mockInstructors.push(newInstructor as Instructor);
        return newInstructor as Instructor;
    }

    const dbData = { ...data, department: mapDepartmentToDB(data.department) };
    const { data: instructor, error } = await supabase
      .from('instructors')
      .insert({ ...dbData, joining_date: new Date().toISOString().split('T')[0] })
      .select()
      .single();
    if (error) throw error;
    return { ...instructor, department: mapDepartmentToUI(instructor.department) };
  },

  updateInstructor: async (id: string, data: Partial<Instructor>): Promise<Instructor> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockInstructors.findIndex(i => i.instructor_id === id);
        if (index !== -1) mockInstructors[index] = { ...mockInstructors[index], ...data };
        return mockInstructors[index];
    }

    const dbData = { ...data };
    if (dbData.department) dbData.department = mapDepartmentToDB(dbData.department);

    const { data: instructor, error } = await supabase
      .from('instructors')
      .update(dbData)
      .eq('instructor_id', id)
      .select()
      .single();
    if (error) throw error;
    return { ...instructor, department: mapDepartmentToUI(instructor.department) };
  },

  deleteInstructor: async (id: string): Promise<void> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockInstructors.findIndex(i => i.instructor_id === id);
        if (index !== -1) mockInstructors.splice(index, 1);
        return;
    }

    const { error } = await supabase.from('instructors').delete().eq('instructor_id', id);
    if (error) throw error;
  },
};
