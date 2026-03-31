import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '@/services/courseService';
import { enrollmentService } from '@/services/enrollmentService';
import { instructorService } from '@/services/instructorService';
import { useAuthStore } from '@/stores/authStore';
import { Course, Instructor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Users, Clock, Grid3X3, List, GraduationCap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { LoadingCards } from '@/components/shared/States';

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([courseService.getCourses(), instructorService.getInstructors()]).then(([c, i]) => {
      setCourses(c);
      setInstructors(i);
      setLoading(false);
    });
  }, []);

  const getInstructorName = (id: string) => instructors.find(i => i.instructor_id === id)?.full_name || 'TBA';

  const filtered = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.course_code.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || c.department === deptFilter;
    return matchesSearch && matchesDept && c.status === 'active';
  });

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    await enrollmentService.createEnrollment({
      student_id: user.id, course_id: courseId, enrollment_date: new Date().toISOString().split('T')[0],
      approval_status: 'pending', grade: null, remarks: '',
    });
    toast({ title: 'Enrollment Requested', description: 'Your enrollment request has been submitted for approval.' });
  };

  if (loading) return <LoadingCards count={8} />;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Browse Courses</h1><p className="text-muted-foreground">Explore and enroll in available courses</p></div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'English'].map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-xl p-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="rounded-lg h-8 w-8" onClick={() => setViewMode('grid')}><Grid3X3 className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="rounded-lg h-8 w-8" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
        {filtered.map((course, i) => (
          <motion.div key={course.course_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className={viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-5'}>
                <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="rounded-lg text-xs">{course.course_code}</Badge>
                    <Badge variant="outline" className="rounded-lg text-xs">{course.credits} credits</Badge>
                  </div>
                  <h3 className="font-semibold font-display">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{getInstructorName(course.instructor_id)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.semester}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>{course.enrolled_count}/{course.capacity} seats</span>
                      <span>{Math.round((course.enrolled_count / course.capacity) * 100)}%</span>
                    </div>
                    <Progress value={(course.enrolled_count / course.capacity) * 100} className="h-1.5" />
                  </div>
                </div>
                <div className={viewMode === 'list' ? 'flex gap-2' : 'flex gap-2 mt-4'}>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/courses/${course.course_id}`)}>Details</Button>
                  <Button size="sm" className="rounded-xl" onClick={() => handleEnroll(course.course_id)}>Enroll</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
