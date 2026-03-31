import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { studentService } from '@/services/studentService';
import { Course, Enrollment, Student, GradeValue } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GradeBadge } from '@/components/shared/Badges';
import { Save, CheckCircle, GraduationCap, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const gradeOptions: GradeValue[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'W', 'I', 'P'];

export default function GradeManagementPage() {
  const user = useAuthStore(s => s.user);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, { grade: GradeValue; remarks: string }>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([courseService.getCourses(), studentService.getStudents()]).then(([c, s]) => {
      const myCourses = c.filter(course => course.instructor_id === user?.id);
      setCourses(myCourses);
      setStudents(s);
      const courseParam = searchParams.get('course');
      if (courseParam && myCourses.find(mc => mc.course_id === courseParam)) {
        setSelectedCourse(courseParam);
      } else if (myCourses.length > 0) {
        setSelectedCourse(myCourses[0].course_id);
      }
    });
  }, [user, searchParams]);

  useEffect(() => {
    if (selectedCourse) {
      enrollmentService.getEnrollmentsByCourse(selectedCourse).then(e => {
        const approved = e.filter(en => en.approval_status === 'approved');
        setEnrollments(approved);
        const g: Record<string, { grade: GradeValue; remarks: string }> = {};
        approved.forEach(en => { g[en.enrollment_id] = { grade: en.grade, remarks: en.remarks }; });
        setGrades(g);
      });
    }
  }, [selectedCourse]);

  const getStudent = (id: string) => students.find(s => s.student_id === id);

  const updateGrade = (enrollmentId: string, grade: GradeValue) => {
    setGrades(prev => ({ ...prev, [enrollmentId]: { ...prev[enrollmentId], grade } }));
  };

  const updateRemarks = (enrollmentId: string, remarks: string) => {
    setGrades(prev => ({ ...prev, [enrollmentId]: { ...prev[enrollmentId], remarks } }));
  };

  const saveGrades = async () => {
    for (const [enrollmentId, { grade, remarks }] of Object.entries(grades)) {
      await enrollmentService.assignGrade(enrollmentId, grade, remarks);
    }
    toast({ title: 'Grades saved', description: 'All grades have been updated successfully.' });
  };

  const publishGrades = async () => {
    await saveGrades();
    toast({ title: 'Grades published', description: 'Grades have been published and are now visible to students.' });
  };

  const filteredEnrollments = enrollments.filter(e => {
    const student = getStudent(e.student_id);
    return student?.full_name.toLowerCase().includes(search.toLowerCase());
  });

  const pendingCount = Object.values(grades).filter(g => !g.grade).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-display">Grade Management</h1><p className="text-muted-foreground">Enter and manage student grades</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={saveGrades}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
          <Button className="rounded-xl" onClick={publishGrades}><CheckCircle className="h-4 w-4 mr-2" />Publish Grades</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[300px] rounded-xl"><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.course_id} value={c.course_id}>{c.course_code} — {c.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 text-warning text-sm">
          <GraduationCap className="h-4 w-4" />{pendingCount} students still need grades
        </div>
      )}

      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Student</th>
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-center p-4 font-medium">Current Grade</th>
                  <th className="text-center p-4 font-medium">New Grade</th>
                  <th className="text-left p-4 font-medium">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map(e => {
                  const student = getStudent(e.student_id);
                  if (!student) return null;
                  return (
                    <tr key={e.enrollment_id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{student.full_name}</td>
                      <td className="p-4 text-muted-foreground">{student.student_id}</td>
                      <td className="p-4 text-center"><GradeBadge grade={e.grade} /></td>
                      <td className="p-4 text-center">
                        <Select value={grades[e.enrollment_id]?.grade || ''} onValueChange={(v) => updateGrade(e.enrollment_id, v as GradeValue)}>
                          <SelectTrigger className="w-24 mx-auto rounded-lg h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            {gradeOptions.map(g => g && <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <Input
                          value={grades[e.enrollment_id]?.remarks || ''}
                          onChange={ev => updateRemarks(e.enrollment_id, ev.target.value)}
                          placeholder="Add remarks..."
                          className="rounded-lg h-8 text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
