import { Student } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { mapDepartmentToUI, mapDepartmentToDB } from '@/lib/mappings';
import { useAuthStore } from '@/stores/authStore';
import { mockStudents } from '@/lib/mockData';

export const studentService = {
  getStudents: async (): Promise<Student[]> => {
    if (useAuthStore.getState().user?.isDemo) return mockStudents;

    const { data, error } = await supabase.from('students').select('*').order('full_name');
    if (error) throw error;
    return (data || []).map(s => ({ ...s, department: mapDepartmentToUI(s.department) }));
  },

  getStudentById: async (id: string): Promise<Student | undefined> => {
    if (useAuthStore.getState().user?.isDemo) return mockStudents.find(s => s.student_id === id);

    const { data, error } = await supabase.from('students').select('*').eq('student_id', id).single();
    if (error) throw error;
    if (!data) return undefined;
    return { ...data, department: mapDepartmentToUI(data.department) };
  },

  createStudent: async (data: Omit<Student, 'student_id' | 'created_at' | 'updated_at' | 'registration_date'>): Promise<Student> => {
    if (useAuthStore.getState().user?.isDemo) {
        const newStudent = { ...data, student_id: Math.random().toString(36).substr(2, 9), registration_date: new Date().toISOString().split('T')[0], status: 'active' as const };
        mockStudents.push(newStudent as Student);
        return newStudent as Student;
    }

    const dbData = { ...data, department: mapDepartmentToDB(data.department) };
    const { data: student, error } = await supabase
      .from('students')
      .insert({ ...dbData, registration_date: new Date().toISOString().split('T')[0] })
      .select()
      .single();
    if (error) throw error;
    return { ...student, department: mapDepartmentToUI(student.department) };
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockStudents.findIndex(s => s.student_id === id);
        if (index !== -1) mockStudents[index] = { ...mockStudents[index], ...data };
        return mockStudents[index];
    }

    const dbData = { ...data };
    if (dbData.department) dbData.department = mapDepartmentToDB(dbData.department);
    
    const { data: student, error } = await supabase
      .from('students')
      .update(dbData)
      .eq('student_id', id)
      .select()
      .single();
    if (error) throw error;
    return { ...student, department: mapDepartmentToUI(student.department) };
  },

  deleteStudent: async (id: string): Promise<void> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockStudents.findIndex(s => s.student_id === id);
        if (index !== -1) mockStudents.splice(index, 1);
        return;
    }

    const { error } = await supabase.from('students').delete().eq('student_id', id);
    if (error) throw error;
  },
};
