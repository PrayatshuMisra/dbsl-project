import { Student } from '@/lib/types';
import { mockStudents } from '@/data/mock/students';

let students = [...mockStudents];

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const studentService = {
  getStudents: async (): Promise<Student[]> => { await delay(); return [...students]; },
  getStudentById: async (id: string): Promise<Student | undefined> => { await delay(); return students.find(s => s.student_id === id); },
  createStudent: async (data: Omit<Student, 'student_id'>): Promise<Student> => {
    await delay();
    const student = { ...data, student_id: `STU${String(students.length + 1).padStart(3, '0')}` };
    students.push(student);
    return student;
  },
  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => {
    await delay();
    const idx = students.findIndex(s => s.student_id === id);
    if (idx === -1) throw new Error('Student not found');
    students[idx] = { ...students[idx], ...data };
    return students[idx];
  },
  deleteStudent: async (id: string): Promise<void> => {
    await delay();
    students = students.filter(s => s.student_id !== id);
  },
};
