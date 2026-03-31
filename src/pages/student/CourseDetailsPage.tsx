import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '@/services/courseService';
import { instructorService } from '@/services/instructorService';
import { enrollmentService } from '@/services/enrollmentService';
import { useAuthStore } from '@/stores/authStore';
import { Course, Instructor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, BookOpen, Clock, Users, GraduationCap, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [instructor, setInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    if (id) {
      courseService.getCourseById(id).then(c => {
        if (c) {
          setCourse(c);
          instructorService.getInstructorById(c.instructor_id).then(i => setInstructor(i || null));
        }
      });
    }
  }, [id]);

  if (!course) return null;

  const handleEnroll = async () => {
    if (!user) return;
    await enrollmentService.createEnrollment({
      student_id: user.id, course_id: course.course_id, enrollment_date: new Date().toISOString().split('T')[0],
      approval_status: 'pending', grade: null, remarks: '',
    });
    toast({ title: 'Enrollment Requested!', description: 'Your request is pending approval.' });
  };

  const ins = instructor;
  const initials = ins?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" className="rounded-xl" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="rounded-lg">{course.course_code}</Badge>
              <Badge variant="outline" className="rounded-lg">{course.credits} credits</Badge>
              <Badge className="rounded-lg capitalize">{course.status}</Badge>
            </div>
            <h1 className="text-3xl font-bold font-display">{course.title}</h1>
            <p className="text-muted-foreground mt-2">{course.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Building, label: 'Department', value: course.department },
              { icon: Clock, label: 'Semester', value: course.semester },
              { icon: BookOpen, label: 'Credits', value: course.credits },
              { icon: Users, label: 'Capacity', value: `${course.enrolled_count}/${course.capacity}` },
            ].map(item => (
              <Card key={item.label} className="rounded-2xl">
                <CardContent className="p-4 text-center">
                  <item.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-sm">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-lg font-display">Enrollment Capacity</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2"><span>{course.enrolled_count} enrolled</span><span>{course.capacity - course.enrolled_count} seats left</span></div>
              <Progress value={(course.enrolled_count / course.capacity) * 100} className="h-3" />
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-80 space-y-4">
          {ins && (
            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-sm font-display">Instructor</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar><AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback></Avatar>
                <div><p className="font-medium text-sm">{ins.full_name}</p><p className="text-xs text-muted-foreground">{ins.specialization}</p><p className="text-xs text-muted-foreground">{ins.department}</p></div>
              </CardContent>
            </Card>
          )}
          {user?.role === 'student' && (
            <Button className="w-full rounded-xl" size="lg" onClick={handleEnroll}><GraduationCap className="h-4 w-4 mr-2" />Enroll in Course</Button>
          )}
        </div>
      </div>
    </div>
  );
}
