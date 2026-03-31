import { useState, useEffect } from 'react';
import { enrollmentService } from '@/services/enrollmentService';
import { courseService } from '@/services/courseService';
import { studentService } from '@/services/studentService';
import { Enrollment, Course, Student } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, GradeBadge } from '@/components/shared/Badges';
import { Search, Check, X, CheckCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function EnrollmentManagementPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => { Promise.all([enrollmentService.getEnrollments(), courseService.getCourses(), studentService.getStudents()]).then(([e,c,s])=>{setEnrollments(e);setCourses(c);setStudents(s);}); }, []);

  const getStudent = (id: string) => students.find(s => s.student_id === id);
  const getCourse = (id: string) => courses.find(c => c.course_id === id);

  const filtered = enrollments.filter(e => {
    const student = getStudent(e.student_id);
    const course = getCourse(e.course_id);
    const matchSearch = student?.full_name.toLowerCase().includes(search.toLowerCase()) || course?.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === 'all' || e.approval_status === statusFilter);
  });

  const handleApprove = async (id: string) => { await enrollmentService.updateEnrollmentStatus(id, 'approved'); setEnrollments(p => p.map(e => e.enrollment_id === id ? { ...e, approval_status: 'approved' } : e)); toast({ title: 'Approved' }); };
  const handleReject = async (id: string) => { await enrollmentService.updateEnrollmentStatus(id, 'rejected'); setEnrollments(p => p.map(e => e.enrollment_id === id ? { ...e, approval_status: 'rejected' } : e)); toast({ title: 'Rejected' }); };

  const bulkApprove = async () => {
    for (const id of selected) { await enrollmentService.updateEnrollmentStatus(id, 'approved'); }
    setEnrollments(p => p.map(e => selected.has(e.enrollment_id) ? { ...e, approval_status: 'approved' } : e));
    setSelected(new Set());
    toast({ title: `${selected.size} enrollments approved` });
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Enrollment Ledger</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Directing student registrations and departmental approvals</p>
        </div>
        {selected.size > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Button className="rounded-lg h-10 px-6 font-bold shadow-lg shadow-success/20 bg-success hover:bg-success/90 transition-all hover:translate-y-[-1px]" onClick={bulkApprove}>
              <CheckCheck className="h-4 w-4 mr-2 stroke-[3px]" />
              Bulk Approve ({selected.size})
            </Button>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student or course title..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-10 h-11 rounded-lg border-border/60 shadow-soft bg-background/50 backdrop-blur-sm" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap ml-2 mr-1">Status:</span>
          {['all','pending','approved','rejected','withdrawn'].map(s=>(
            <Button key={s} variant={statusFilter===s?'default':'outline'} size="sm" className={cn('rounded-lg h-8 px-4 font-bold text-[10px] uppercase tracking-wider transition-all', statusFilter===s ? 'shadow-md shadow-primary/20' : 'bg-background/50 border-border/60')} onClick={()=>setStatusFilter(s)}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      <Card className="rounded-xl shadow-card border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-border/60 text-primary focus:ring-primary/20 bg-background" onChange={e=>{if(e.target.checked){setSelected(new Set(filtered.filter(en=>en.approval_status==='pending').map(en=>en.enrollment_id)))}else{setSelected(new Set())}}}/>
                  </th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Student</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Academic Course</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Registration Date</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-center">Status</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-center">Score</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-right">Verification</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e=>{
                  const student = getStudent(e.student_id);
                  const course = getCourse(e.course_id);
                  return (
                    <tr key={e.enrollment_id} className="border-b border-border/30 hover:bg-muted/10 transition-colors group">
                      <td className="p-4 text-center">
                        <input type="checkbox" className="rounded border-border/60 text-primary focus:ring-primary/20 bg-background disabled:opacity-30" checked={selected.has(e.enrollment_id)} onChange={()=>toggleSelect(e.enrollment_id)} disabled={e.approval_status!=='pending'}/>
                      </td>
                      <td className="p-4 font-bold text-foreground">{student?.full_name}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">{course?.title}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">{course?.course_code}</p>
                        </div>
                      </td>
                      <td className="p-4 text-[11px] font-bold text-muted-foreground uppercase">{e.enrollment_date}</td>
                      <td className="p-4 text-center"><StatusBadge status={e.approval_status}/></td>
                      <td className="p-4 text-center font-bold text-muted-foreground"><GradeBadge grade={e.grade}/></td>
                      <td className="p-4 text-right">
                        {e.approval_status==='pending' && (
                          <div className="flex justify-end gap-2 px-2">
                            <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg border-success/30 text-success bg-success/5 hover:bg-success hover:text-white transition-all shadow-soft" onClick={()=>handleApprove(e.enrollment_id)}>
                              <Check className="h-4 w-4 stroke-[3px]" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-9 w-9 rounded-lg border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white transition-all shadow-soft" onClick={()=>handleReject(e.enrollment_id)}>
                              <X className="h-4 w-4 stroke-[3px]" />
                            </Button>
                          </div>
                        )}
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
