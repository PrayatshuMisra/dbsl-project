import { create } from 'zustand';
import { AuthUser, UserRole } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { mapDepartmentToUI, mapDepartmentToDB } from '@/lib/mappings';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, role: UserRole, fullName: string, department: string) => Promise<boolean>;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  fetchProfile: (email: string) => Promise<AuthUser | null>;
}

const demoUsers: Record<UserRole, AuthUser> = {
  student: { id: 'STU001', email: 'student@demo.com', full_name: 'Alice Johnson', role: 'student', profile_photo: '', department: 'Computer Science' },
  instructor: { id: 'INS001', email: 'instructor@demo.com', full_name: 'Dr. Sarah Mitchell', role: 'instructor', profile_photo: '', department: 'Computer Science' },
  admin: { id: 'ADM001', email: 'admin@demo.com', full_name: 'Admin User', role: 'admin', profile_photo: '' },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  fetchProfile: async (email: string): Promise<AuthUser | null> => {
    // Check Students
    const { data: student } = await supabase.from('students').select('*').eq('email', email).maybeSingle();
    if (student) {
      return { id: student.student_id, email: student.email, full_name: student.full_name, role: 'student', department: mapDepartmentToUI(student.department), profile_photo: student.profile_photo };
    }

    // Check Instructors
    const { data: instructor } = await supabase.from('instructors').select('*').eq('email', email).maybeSingle();
    if (instructor) {
      return { id: instructor.instructor_id, email: instructor.email, full_name: instructor.full_name, role: 'instructor', department: mapDepartmentToUI(instructor.department), profile_photo: instructor.profile_photo };
    }

    // Check Admins
    const { data: admin } = await supabase.from('admins').select('*').eq('email', email).maybeSingle();
    if (admin) {
      return { id: admin.admin_id, email: admin.email, full_name: admin.full_name, role: 'admin', profile_photo: null };
    }

    return null;
  },

  login: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await get().fetchProfile(email);
    if (!profile) throw new Error('User profile not found in database.');

    set({ user: { ...profile, isDemo: false }, isAuthenticated: true });
    return true;
  },

  signUp: async (email: string, password: string, role: UserRole, fullName: string, department: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up failed');

    const dbDept = mapDepartmentToDB(department);

    // Create entry in corresponding table
    if (role === 'student') {
      const { error: pErr } = await supabase.from('students').insert({
          email,
          full_name: fullName,
          department: dbDept,
          semester: 1, // Default to 1st semester
          status: 'active'
      });
      if (pErr) throw pErr;
    } else if (role === 'instructor') {
      const { error: pErr } = await supabase.from('instructors').insert({
          email,
          full_name: fullName,
          department: dbDept,
          status: 'active'
      });
      if (pErr) throw pErr;
    } else if (role === 'admin') {
      const { error: pErr } = await supabase.from('admins').insert({
          email,
          full_name: fullName,
          status: 'active'
      });
      if (pErr) throw pErr;
    }

    const profile = await get().fetchProfile(email);
    set({ user: { ...profile, isDemo: false } as AuthUser, isAuthenticated: true });
    return true;
  },

  loginAs: (role: UserRole) => {
    set({ user: { ...demoUsers[role], isDemo: true }, isAuthenticated: true });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
}));
