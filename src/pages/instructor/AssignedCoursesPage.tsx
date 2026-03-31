import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { Course, Enrollment } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, GraduationCap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AssignedCoursesPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    Promise.all([courseService.getCourses(), enrollmentService.getEnrollments()]).then(([c, e]) => {
      setCourses(c.filter(course => course.instructor_id === user?.id));
      setEnrollments(e);
    });
  }, [user]);

  const getEnrolledCount = (courseId: string) => enrollments.filter(e => e.course_id === courseId && e.approval_status === 'approved').length;
  const getPendingGrades = (courseId: string) => enrollments.filter(e => e.course_id === courseId && e.approval_status === 'approved' && !e.grade).length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Assigned Courses</h1><p className="text-muted-foreground">Manage your courses and students</p></div>
      <div className="space-y-4">
        {courses.map((course, i) => (
          <motion.div key={course.course_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                <div className="rounded-xl bg-primary/10 p-3 w-fit"><BookOpen className="h-6 w-6 text-primary" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold font-display">{course.title}</h3>
                    <Badge variant="secondary" className="rounded-lg text-xs">{course.course_code}</Badge>
                    <Badge variant="outline" className="rounded-lg text-xs">{course.credits} credits</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{getEnrolledCount(course.course_id)} students</span>
                    <span>{course.semester}</span>
                    <span>{course.department}</span>
                  </div>
                  {getPendingGrades(course.course_id) > 0 && (
                    <p className="text-xs text-warning mt-1">{getPendingGrades(course.course_id)} grades pending</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/roster/${course.course_id}`)}><Users className="h-4 w-4 mr-1" />Roster</Button>
                  <Button size="sm" className="rounded-xl" onClick={() => navigate(`/grade-management?course=${course.course_id}`)}><GraduationCap className="h-4 w-4 mr-1" />Grades</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
