import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';
import { instructorService } from '@/services/instructorService';
import { Course, Instructor, Department } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Pencil, Trash2, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const departments: Department[] = ['Computer Science','Mathematics','Physics','Chemistry','Biology','Engineering','Business','English'];

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const { toast } = useToast();

  useEffect(() => { Promise.all([courseService.getCourses(), instructorService.getInstructors()]).then(([c,i])=>{setCourses(c);setInstructors(i);}); }, []);

  const filtered = courses.filter(c => {
    const m = c.title.toLowerCase().includes(search.toLowerCase()) || c.course_code.toLowerCase().includes(search.toLowerCase());
    return m && (deptFilter === 'all' || c.department === deptFilter);
  });

  const getInstructor = (id: string) => instructors.find(i => i.instructor_id === id)?.full_name || 'TBA';

  const handleDelete = async (id: string) => { await courseService.deleteCourse(id); setCourses(p => p.filter(c => c.course_id !== id)); toast({ title: 'Course deleted' }); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = { course_code: f.get('code') as string, title: f.get('title') as string, description: f.get('description') as string || '', credits: Number(f.get('credits')), department: f.get('department') as Department, semester: 'Fall 2025' as const, instructor_id: f.get('instructor') as string, capacity: Number(f.get('capacity')), enrolled_count: editing?.enrolled_count || 0, status: 'active' as const };
    if (editing) { const u = await courseService.updateCourse(editing.course_id, data); setCourses(p => p.map(c => c.course_id === u.course_id ? u : c)); toast({ title: 'Updated' }); }
    else { const c = await courseService.createCourse(data); setCourses(p => [...p, c]); toast({ title: 'Created' }); }
    setDialogOpen(false); setEditing(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Course Catalog</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Foundational and advanced curriculum oversight</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o=>{setDialogOpen(o);if(!o)setEditing(null);}}>
          <DialogTrigger asChild>
            <Button className="rounded-lg h-10 px-4 font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
              <Plus className="h-4 w-4 mr-2 stroke-[3px]" />
              Initialize Course
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl max-w-2xl p-0 overflow-hidden border-none shadow-premium">
            <DialogHeader className="p-6 bg-slate-900 text-white">
              <DialogTitle className="font-display text-xl font-bold">{editing?'Update Course Syllabus':'Add New Academic Course'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="p-6 space-y-6 bg-card">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Course Code</Label>
                  <Input name="code" defaultValue={editing?.course_code} required className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Academic Title</Label>
                  <Input name="title" defaultValue={editing?.title} required className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Credit Weight</Label>
                  <Input name="credits" type="number" defaultValue={editing?.credits||3} className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Student Capacity</Label>
                  <Input name="capacity" type="number" defaultValue={editing?.capacity||40} className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Host Department</Label>
                  <select name="department" defaultValue={editing?.department||'Computer Science'} className="flex h-11 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                    {departments.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Assigned Instructor</Label>
                  <select name="instructor" defaultValue={editing?.instructor_id} className="flex h-11 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                    {instructors.map(i=><option key={i.instructor_id} value={i.instructor_id}>{i.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Course Description & Objectives</Label>
                <Input name="description" defaultValue={editing?.description} className="rounded-lg h-11 border-border/60" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" className="rounded-lg font-bold" onClick={()=>setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="rounded-lg px-8 font-bold shadow-lg shadow-primary/20">Publish Course</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search catalog by title or code..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-10 h-11 rounded-lg border-border/60 shadow-soft bg-background/50 backdrop-blur-sm" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap ml-2">Filter By:</span>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full md:w-[220px] h-11 rounded-lg border-border/60 bg-background/50 backdrop-blur-sm shadow-soft">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-premium">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-xl shadow-card border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Academic Course</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Faculty Advisor</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-center">Credit Unit</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-center">Enrollment Density</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.course_id} className="border-b border-border/30 hover:bg-muted/10 transition-colors group">
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">{c.course_code}</Badge>
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{c.title}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5">{c.department} • {c.semester}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-xs text-foreground uppercase tracking-tight">{getInstructor(c.instructor_id)}</p>
                    </td>
                    <td className="p-4 text-center font-bold text-muted-foreground">
                      {c.credits}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 min-w-[120px] items-center">
                        <div className="flex justify-between w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span>Progress</span>
                          <span>{c.enrolled_count}/{c.capacity}</span>
                        </div>
                        <Progress value={(c.enrolled_count/c.capacity)*100} className="h-1.5 w-full bg-muted border border-border/40" />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 px-2">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all" onClick={()=>{setEditing(c);setDialogOpen(true);}}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all" onClick={()=>handleDelete(c.course_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
