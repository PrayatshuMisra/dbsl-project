import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { Course, Enrollment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const gradePoints: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0 };
const COLORS = ['hsl(142,76%,36%)', 'hsl(234,89%,58%)', 'hsl(199,89%,48%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)'];

export default function InstructorAnalyticsPage() {
  const user = useAuthStore(s => s.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    Promise.all([courseService.getCourses(), enrollmentService.getEnrollments()]).then(([c, e]) => {
      setCourses(c.filter(course => course.instructor_id === user?.id));
      setEnrollments(e);
    });
  }, [user]);

  const coursePerformance = courses.map(c => {
    const courseEnrollments = enrollments.filter(e => e.course_id === c.course_id && e.grade);
    const avg = courseEnrollments.length > 0
      ? courseEnrollments.reduce((sum, e) => sum + (gradePoints[e.grade!] || 0), 0) / courseEnrollments.length
      : 0;
    return { course: c.course_code, avg: Number(avg.toFixed(2)), students: courseEnrollments.length };
  });

  const allGrades = enrollments.filter(e => courses.some(c => c.course_id === e.course_id) && e.grade);
  const passCount = allGrades.filter(e => gradePoints[e.grade!] >= 2.0).length;
  const failCount = allGrades.filter(e => gradePoints[e.grade!] < 2.0 && e.grade !== 'W' && e.grade !== 'I').length;
  const passFailData = [{ name: 'Pass', value: passCount }, { name: 'Fail', value: failCount }];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Analytics</h1><p className="text-muted-foreground">Course performance insights</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Average GPA by Course</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="course" className="text-xs" />
                <YAxis domain={[0, 4]} className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="avg" fill="hsl(234,89%,58%)" radius={[6, 6, 0, 0]} name="Avg GPA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Pass/Fail Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={passFailData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {passFailData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg font-display">Course Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {coursePerformance.map(cp => (
              <div key={cp.course} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div><p className="font-medium">{cp.course}</p><p className="text-xs text-muted-foreground">{cp.students} graded students</p></div>
                <div className="text-right"><p className="font-semibold">{cp.avg.toFixed(2)}</p><p className="text-xs text-muted-foreground">Avg GPA</p></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
