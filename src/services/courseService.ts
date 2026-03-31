import { Course } from '@/lib/types';
import { mockCourses } from '@/data/mock/courses';

let courses = [...mockCourses];
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const courseService = {
  getCourses: async (): Promise<Course[]> => { await delay(); return [...courses]; },
  getCourseById: async (id: string): Promise<Course | undefined> => { await delay(); return courses.find(c => c.course_id === id); },
  createCourse: async (data: Omit<Course, 'course_id'>): Promise<Course> => {
    await delay();
    const course = { ...data, course_id: `CRS${String(courses.length + 1).padStart(3, '0')}` };
    courses.push(course);
    return course;
  },
  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    await delay();
    const idx = courses.findIndex(c => c.course_id === id);
    if (idx === -1) throw new Error('Course not found');
    courses[idx] = { ...courses[idx], ...data };
    return courses[idx];
  },
  deleteCourse: async (id: string): Promise<void> => {
    await delay();
    courses = courses.filter(c => c.course_id !== id);
  },
};
