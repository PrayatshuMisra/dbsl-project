import { Instructor } from '@/lib/types';
import { mockInstructors } from '@/data/mock/instructors';

let instructors = [...mockInstructors];
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const instructorService = {
  getInstructors: async (): Promise<Instructor[]> => { await delay(); return [...instructors]; },
  getInstructorById: async (id: string): Promise<Instructor | undefined> => { await delay(); return instructors.find(i => i.instructor_id === id); },
  createInstructor: async (data: Omit<Instructor, 'instructor_id'>): Promise<Instructor> => {
    await delay();
    const instructor = { ...data, instructor_id: `INS${String(instructors.length + 1).padStart(3, '0')}` };
    instructors.push(instructor);
    return instructor;
  },
  updateInstructor: async (id: string, data: Partial<Instructor>): Promise<Instructor> => {
    await delay();
    const idx = instructors.findIndex(i => i.instructor_id === id);
    if (idx === -1) throw new Error('Instructor not found');
    instructors[idx] = { ...instructors[idx], ...data };
    return instructors[idx];
  },
  deleteInstructor: async (id: string): Promise<void> => {
    await delay();
    instructors = instructors.filter(i => i.instructor_id !== id);
  },
};
