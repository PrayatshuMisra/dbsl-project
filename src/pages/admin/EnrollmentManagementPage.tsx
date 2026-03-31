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
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-display">Enrollment Management</h1><p className="text-muted-foreground">{enrollments.length} enrollments</p></div>
        {selected.size > 0 && <Button className="rounded-xl" onClick={bulkApprove}><CheckCheck className="h-4 w-4 mr-2"/>Approve ({selected.size})</Button>}
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 rounded-xl"/></div>
        <div className="flex gap-2">
          {['all','pending','approved','rejected','withdrawn'].map(s=>(
            <Button key={s} variant={statusFilter===s?'default':'outline'} size="sm" className="rounded-xl capitalize" onClick={()=>setStatusFilter(s)}>{s}</Button>
          ))}
        </div>
      </div>
      <Card className="rounded-2xl"><CardContent className="p-0">
        <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-4 w-10"><input type="checkbox" className="rounded" onChange={e=>{if(e.target.checked){setSelected(new Set(filtered.filter(en=>en.approval_status==='pending').map(en=>en.enrollment_id)))}else{setSelected(new Set())}}}/></th><th className="text-left p-4 font-medium">Student</th><th className="text-left p-4 font-medium">Course</th><th className="text-left p-4 font-medium">Date</th><th className="text-center p-4 font-medium">Status</th><th className="text-center p-4 font-medium">Grade</th><th className="text-right p-4 font-medium">Actions</th></tr></thead>
        <tbody>{filtered.map(e=>{
          const student = getStudent(e.student_id);
          const course = getCourse(e.course_id);
          return (
            <tr key={e.enrollment_id} className="border-t hover:bg-muted/30">
              <td className="p-4"><input type="checkbox" className="rounded" checked={selected.has(e.enrollment_id)} onChange={()=>toggleSelect(e.enrollment_id)} disabled={e.approval_status!=='pending'}/></td>
              <td className="p-4 font-medium">{student?.full_name}</td>
              <td className="p-4"><div><p className="font-medium">{course?.title}</p><p className="text-xs text-muted-foreground">{course?.course_code}</p></div></td>
              <td className="p-4 text-muted-foreground">{e.enrollment_date}</td>
              <td className="p-4 text-center"><StatusBadge status={e.approval_status}/></td>
              <td className="p-4 text-center"><GradeBadge grade={e.grade}/></td>
              <td className="p-4 text-right">{e.approval_status==='pending'&&<div className="flex justify-end gap-1"><Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-success" onClick={()=>handleApprove(e.enrollment_id)}><Check className="h-4 w-4"/></Button><Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive" onClick={()=>handleReject(e.enrollment_id)}><X className="h-4 w-4"/></Button></div>}</td>
            </tr>);
        })}</tbody></table>
      </CardContent></Card>
    </div>
  );
}
