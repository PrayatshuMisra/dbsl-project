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
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-display">Course Management</h1><p className="text-muted-foreground">{courses.length} courses</p></div>
        <Dialog open={dialogOpen} onOpenChange={o=>{setDialogOpen(o);if(!o)setEditing(null);}}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="h-4 w-4 mr-2"/>Add Course</Button></DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader><DialogTitle className="font-display">{editing?'Edit':'Add'} Course</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Course Code</Label><Input name="code" defaultValue={editing?.course_code} required className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Title</Label><Input name="title" defaultValue={editing?.title} required className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Credits</Label><Input name="credits" type="number" defaultValue={editing?.credits||3} className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Capacity</Label><Input name="capacity" type="number" defaultValue={editing?.capacity||40} className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Department</Label><select name="department" defaultValue={editing?.department||'Computer Science'} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">{departments.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                <div className="space-y-2"><Label>Instructor</Label><select name="instructor" defaultValue={editing?.instructor_id} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">{instructors.map(i=><option key={i.instructor_id} value={i.instructor_id}>{i.full_name}</option>)}</select></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Input name="description" defaultValue={editing?.description} className="rounded-xl"/></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="rounded-xl" onClick={()=>setDialogOpen(false)}>Cancel</Button><Button type="submit" className="rounded-xl">Save</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Search courses..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 rounded-xl"/></div>
        <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Department"/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{departments.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
      </div>
      <Card className="rounded-2xl"><CardContent className="p-0">
        <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="text-left p-4 font-medium">Course</th><th className="text-left p-4 font-medium">Instructor</th><th className="text-center p-4 font-medium">Credits</th><th className="text-center p-4 font-medium">Capacity</th><th className="text-right p-4 font-medium">Actions</th></tr></thead>
        <tbody>{filtered.map(c=>(
          <tr key={c.course_id} className="border-t hover:bg-muted/30"><td className="p-4"><div><div className="flex items-center gap-2"><p className="font-medium">{c.title}</p><Badge variant="secondary" className="rounded-lg text-xs">{c.course_code}</Badge></div><p className="text-xs text-muted-foreground mt-1">{c.department} • {c.semester}</p></div></td>
          <td className="p-4 text-sm">{getInstructor(c.instructor_id)}</td><td className="p-4 text-center">{c.credits}</td>
          <td className="p-4"><div className="flex items-center gap-2 justify-center"><span className="text-xs">{c.enrolled_count}/{c.capacity}</span><Progress value={(c.enrolled_count/c.capacity)*100} className="h-1.5 w-16"/></div></td>
          <td className="p-4 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={()=>{setEditing(c);setDialogOpen(true);}}><Pencil className="h-3.5 w-3.5"/></Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={()=>handleDelete(c.course_id)}><Trash2 className="h-3.5 w-3.5"/></Button></div></td></tr>
        ))}</tbody></table>
      </CardContent></Card>
    </div>
  );
}
