import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { studentService } from '@/services/studentService';
import { Enrollment, Course, Student } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge, GradeBadge } from '@/components/shared/Badges';
import { ArrowLeft, Search, Download, Users } from 'lucide-react';

export default function CourseRosterPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (courseId) {
      Promise.all([
        courseService.getCourseById(courseId),
        enrollmentService.getEnrollmentsByCourse(courseId),
        studentService.getStudents(),
      ]).then(([c, e, s]) => {
        setCourse(c || null);
        setEnrollments(e.filter(en => en.approval_status === 'approved'));
        setStudents(s);
      });
    }
  }, [courseId]);

  const getStudent = (id: string) => students.find(s => s.student_id === id);
  const filtered = enrollments.filter(e => {
    const student = getStudent(e.student_id);
    return student?.full_name.toLowerCase().includes(search.toLowerCase()) || student?.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="rounded-xl" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold font-display">Course Roster</h1>
          <p className="text-muted-foreground">{course?.course_code} — {course?.title}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <Button variant="outline" className="rounded-xl"><Download className="h-4 w-4 mr-2" />Export</Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2"><Users className="h-5 w-5" />Enrolled Students ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map(e => {
              const student = getStudent(e.student_id);
              if (!student) return null;
              const initials = student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2);
              return (
                <div key={e.enrollment_id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{student.full_name}</p>
                    <p className="text-xs text-muted-foreground">{student.email} • {student.department}</p>
                  </div>
                  <GradeBadge grade={e.grade} />
                  <StatusBadge status={e.approval_status} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
