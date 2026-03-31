export const departmentMap: Record<string, string> = {
  'CSE': 'Computer Science',
  'ECE': 'Engineering',
  'IT': 'Information Technology',
  'ME': 'Mechanical Engineering',
  'EEE': 'Electrical & Electronics',
  'Civil': 'Civil Engineering',
  'Business': 'Business',
  'English': 'English',
  'Mathematics': 'Mathematics',
  'Physics': 'Physics',
  'Chemistry': 'Chemistry',
  'Biology': 'Biology',
};

export const reverseDepartmentMap: Record<string, string> = Object.fromEntries(
  Object.entries(departmentMap).map(([k, v]) => [v, k])
);

export const semesterMap: Record<number, string> = {
  1: 'Semester 1',
  2: 'Semester 2',
  3: 'Semester 3',
  4: 'Semester 4',
  5: 'Semester 5',
  6: 'Semester 6',
  7: 'Semester 7',
  8: 'Semester 8',
};

// Map database acronyms to UI labels
export const mapDepartmentToUI = (dept: string) => departmentMap[dept] || dept;
// Map UI labels to database acronyms
export const mapDepartmentToDB = (dept: string) => reverseDepartmentMap[dept] || dept;

// Map database semester number to UI label
export const mapSemesterToUI = (sem: number) => semesterMap[sem] || `Semester ${sem}`;
