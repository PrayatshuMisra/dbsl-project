import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { Enrollment, Course } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradeBadge } from '@/components/shared/Badges';
import { GraduationCap, Download, Printer } from 'lucide-react';

const gradePoints: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0 };

export default function TranscriptPage() {
  const user = useAuthStore(s => s.user);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (user) {
      Promise.all([enrollmentService.getEnrollmentsByStudent(user.id), courseService.getCourses()]).then(([e, c]) => {
        setEnrollments(e.filter(en => en.approval_status === 'approved' && en.grade));
        setCourses(c);
      });
    }
  }, [user]);

  const getCourse = (id: string) => courses.find(c => c.course_id === id);
  const totalCredits = enrollments.reduce((sum, e) => sum + (getCourse(e.course_id)?.credits || 0), 0);
  const gpa = enrollments.length > 0
    ? (enrollments.reduce((sum, e) => {
        const course = getCourse(e.course_id);
        return sum + (gradePoints[e.grade!] || 0) * (course?.credits || 0);
      }, 0) / totalCredits).toFixed(2)
    : 'N/A';

  // Group by semester
  const bySemester = enrollments.reduce((acc, e) => {
    const course = getCourse(e.course_id);
    const sem = course?.semester || 'Unknown';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(e);
    return acc;
  }, {} as Record<string, Enrollment[]>);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between no-print">
        <div><h1 className="text-2xl font-bold font-display">Academic Transcript</h1><p className="text-muted-foreground">Official academic record</p></div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Print</Button>
          <Button className="rounded-xl"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between border-b pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl gradient-primary p-3"><GraduationCap className="h-8 w-8 text-primary-foreground" /></div>
              <div>
                <h2 className="text-2xl font-bold font-display">AcademIQ University</h2>
                <p className="text-sm text-muted-foreground">Official Academic Transcript</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-muted-foreground">ID: {user?.id}</p>
              <p className="text-muted-foreground">{user?.department}</p>
            </div>
          </div>

          {Object.entries(bySemester).map(([semester, semEnrollments]) => {
            const semCredits = semEnrollments.reduce((sum, e) => sum + (getCourse(e.course_id)?.credits || 0), 0);
            const semGPA = (semEnrollments.reduce((sum, e) => {
              const c = getCourse(e.course_id);
              return sum + (gradePoints[e.grade!] || 0) * (c?.credits || 0);
            }, 0) / semCredits).toFixed(2);

            return (
              <div key={semester} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold font-display">{semester}</h3>
                  <span className="text-sm text-muted-foreground">Semester GPA: <strong>{semGPA}</strong></span>
                </div>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr><th className="text-left p-3 font-medium">Course</th><th className="text-left p-3 font-medium">Title</th><th className="text-center p-3 font-medium">Credits</th><th className="text-center p-3 font-medium">Grade</th><th className="text-center p-3 font-medium">Points</th></tr>
                    </thead>
                    <tbody>
                      {semEnrollments.map(e => {
                        const course = getCourse(e.course_id);
                        return (
                          <tr key={e.enrollment_id} className="border-t">
                            <td className="p-3 font-medium">{course?.course_code}</td>
                            <td className="p-3">{course?.title}</td>
                            <td className="p-3 text-center">{course?.credits}</td>
                            <td className="p-3 text-center"><GradeBadge grade={e.grade} /></td>
                            <td className="p-3 text-center">{(gradePoints[e.grade!] || 0).toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <div className="border-t pt-6 flex items-center justify-between">
            <div className="text-sm"><span className="text-muted-foreground">Total Credits Earned:</span> <strong>{totalCredits}</strong></div>
            <div className="text-sm"><span className="text-muted-foreground">Cumulative GPA:</span> <strong className="text-lg">{gpa}</strong></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
