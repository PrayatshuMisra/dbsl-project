import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { Enrollment, Course } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradeBadge } from '@/components/shared/Badges';
import { StatCard } from '@/components/shared/StatCard';
import { GraduationCap, TrendingUp, Award, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const gradePoints: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0 };

export default function GradesPage() {
  const user = useAuthStore(s => s.user);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (user) {
      Promise.all([enrollmentService.getEnrollmentsByStudent(user.id), courseService.getCourses()]).then(([e, c]) => {
        setEnrollments(e.filter(en => en.approval_status === 'approved'));
        setCourses(c);
      });
    }
  }, [user]);

  const getCourse = (id: string) => courses.find(c => c.course_id === id);
  const gradedEnrollments = enrollments.filter(e => e.grade);
  const gpa = gradedEnrollments.length > 0
    ? (gradedEnrollments.reduce((sum, e) => sum + (gradePoints[e.grade!] || 0), 0) / gradedEnrollments.length).toFixed(2)
    : 'N/A';

  const chartData = gradedEnrollments.map(e => {
    const course = getCourse(e.course_id);
    return { course: course?.course_code || '', gpa: gradePoints[e.grade!] || 0 };
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Grades & Performance</h1><p className="text-muted-foreground">Track your academic performance</p></div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Current GPA" value={gpa} icon={GraduationCap} gradient />
        <StatCard title="Courses Graded" value={gradedEnrollments.length} icon={BookOpen} />
        <StatCard title="Highest Grade" value={gradedEnrollments.length > 0 ? gradedEnrollments.reduce((best, e) => (gradePoints[e.grade!] || 0) > (gradePoints[best.grade!] || 0) ? e : best).grade || 'N/A' : 'N/A'} icon={Award} />
        <StatCard title="Total Credits" value={gradedEnrollments.reduce((sum, e) => sum + (getCourse(e.course_id)?.credits || 0), 0)} icon={TrendingUp} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Performance by Course</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="course" className="text-xs" />
                <YAxis domain={[0, 4]} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="gpa" fill="hsl(234,89%,58%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Course Grades</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollments.map(e => {
                const course = getCourse(e.course_id);
                return (
                  <div key={e.enrollment_id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{course?.title}</p>
                      <p className="text-xs text-muted-foreground">{course?.course_code} • {course?.credits} credits</p>
                    </div>
                    <GradeBadge grade={e.grade} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
