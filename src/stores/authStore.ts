import { create } from 'zustand';
import { AuthUser, UserRole } from '@/lib/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const demoUsers: Record<UserRole, AuthUser> = {
  student: { id: 'STU001', email: 'student@demo.com', full_name: 'Alice Johnson', role: 'student', profile_photo: '', department: 'Computer Science' },
  instructor: { id: 'INS001', email: 'instructor@demo.com', full_name: 'Dr. Sarah Mitchell', role: 'instructor', profile_photo: '', department: 'Computer Science' },
  admin: { id: 'ADM001', email: 'admin@demo.com', full_name: 'Admin User', role: 'admin', profile_photo: '' },
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const role = email.includes('student') ? 'student' : email.includes('instructor') ? 'instructor' : 'admin';
    set({ user: demoUsers[role], isAuthenticated: true });
    return true;
  },
  loginAs: (role: UserRole) => {
    set({ user: demoUsers[role], isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
