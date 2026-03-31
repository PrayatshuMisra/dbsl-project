import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { Enrollment, Course } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, GradeBadge } from '@/components/shared/Badges';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MyEnrollmentsPage() {
  const user = useAuthStore(s => s.user);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      Promise.all([enrollmentService.getEnrollmentsByStudent(user.id), courseService.getCourses()]).then(([e, c]) => {
        setEnrollments(e);
        setCourses(c);
      });
    }
  }, [user]);

  const getCourse = (id: string) => courses.find(c => c.course_id === id);
  const filtered = statusFilter === 'all' ? enrollments : enrollments.filter(e => e.approval_status === statusFilter);

  const handleWithdraw = async (id: string) => {
    await enrollmentService.withdrawEnrollment(id);
    setEnrollments(prev => prev.map(e => e.enrollment_id === id ? { ...e, approval_status: 'withdrawn' } : e));
    toast({ title: 'Enrollment withdrawn' });
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">My Enrollments</h1><p className="text-muted-foreground">Track your course enrollments</p></div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'approved', 'pending', 'rejected', 'withdrawn'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" className="rounded-xl capitalize" onClick={() => setStatusFilter(s)}>{s}</Button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((enrollment, i) => {
          const course = getCourse(enrollment.course_id);
          if (!course) return null;
          return (
            <motion.div key={enrollment.enrollment_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="rounded-2xl">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-xl bg-primary/10 p-3"><BookOpen className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{course.title}</h3>
                      <Badge variant="secondary" className="rounded-lg text-xs">{course.course_code}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{course.department}</span>
                      <span>•</span>
                      <span>{enrollment.enrollment_date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={enrollment.grade} />
                    <StatusBadge status={enrollment.approval_status} />
                    {enrollment.approval_status === 'approved' && (
                      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => navigate(`/courses/${course.course_id}`)}>View</Button>
                    )}
                    {(enrollment.approval_status === 'pending' || enrollment.approval_status === 'approved') && (
                      <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={() => handleWithdraw(enrollment.enrollment_id)}><X className="h-4 w-4" /></Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
