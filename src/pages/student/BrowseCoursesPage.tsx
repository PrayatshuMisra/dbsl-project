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
import { cn } from '@/lib/utils';

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Course Catalog</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Discover and register for upcoming academic sessions</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/40 shadow-soft self-start md:self-center">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-md transition-all" onClick={() => setViewMode('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-md transition-all" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search catalog by code or title..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-lg border-border/60 shadow-soft bg-background/50 backdrop-blur-sm" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap ml-2 mr-1">Faculty:</span>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full md:w-[220px] h-11 rounded-lg border-border/60 bg-background/50 backdrop-blur-sm shadow-soft">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-premium">
              <SelectItem value="all" className="text-xs font-bold uppercase tracking-wider">All Departments</SelectItem>
              {['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'English'].map(d => (
                <SelectItem key={d} value={d} className="text-xs font-bold uppercase tracking-wider">{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
        {filtered.map((course, i) => (
          <motion.div key={course.course_id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn(
              "group rounded-xl border-border/50 transition-all duration-300 hover:shadow-premium hover:translate-y-[-2px] bg-card/50 backdrop-blur-sm overflow-hidden",
              viewMode === 'list' ? 'flex flex-row items-center border-l-4 border-l-primary' : 'flex flex-col border-t-4 border-t-primary'
            )}>
              <CardContent className={cn("relative z-10", viewMode === 'list' ? 'flex flex-1 items-center gap-8 p-6' : 'p-6 space-y-5')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">{course.course_code}</Badge>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <Clock className="h-3 w-3" />
                      {course.credits} Units • {course.semester}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold font-display tracking-tight text-foreground group-hover:text-primary transition-colors leading-snug">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed font-medium opacity-80">{course.description}</p>
                  
                  <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center">
                        <GraduationCap className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">{getInstructorName(course.instructor_id)}</span>
                    </div>
                  </div>
                </div>

                <div className={cn("space-y-4", viewMode === 'list' ? 'w-64 border-l border-border/40 pl-8' : 'pt-2')}>
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="text-foreground">{course.enrolled_count} / {course.capacity}</span>
                    </div>
                    <Progress value={(course.enrolled_count / course.capacity) * 100} className="h-2 bg-muted/50 border border-border/30 overflow-hidden" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9 font-bold bg-background/50 hover:bg-background border-border/60 transition-all" onClick={() => navigate(`/courses/${course.course_id}`)}>
                      Overview
                    </Button>
                    <Button size="sm" className="flex-1 rounded-lg h-9 font-bold shadow-soft shadow-primary/20 transition-all hover:translate-y-[-1px]" onClick={() => handleEnroll(course.course_id)}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
