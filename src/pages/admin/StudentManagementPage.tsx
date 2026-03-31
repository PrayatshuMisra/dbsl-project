import { useState, useEffect } from 'react';
import { studentService } from '@/services/studentService';
import { Student, Department, Semester } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ActiveBadge } from '@/components/shared/Badges';
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const departments: Department[] = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'English'];

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  useEffect(() => { studentService.getStudents().then(setStudents); }, []);

  const filtered = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id: string) => {
    await studentService.deleteStudent(id);
    setStudents(prev => prev.filter(s => s.student_id !== id));
    toast({ title: 'Student deleted' });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      full_name: form.get('full_name') as string, email: form.get('email') as string,
      phone: form.get('phone') as string, address: form.get('address') as string,
      date_of_birth: form.get('dob') as string, department: form.get('department') as Department,
      semester: 'Fall 2025' as Semester, registration_date: new Date().toISOString().split('T')[0],
      profile_photo: '', status: 'active' as const,
    };
    if (editingStudent) {
      const updated = await studentService.updateStudent(editingStudent.student_id, data);
      setStudents(prev => prev.map(s => s.student_id === updated.student_id ? updated : s));
      toast({ title: 'Student updated' });
    } else {
      const created = await studentService.createStudent(data);
      setStudents(prev => [...prev, created]);
      toast({ title: 'Student created' });
    }
    setDialogOpen(false);
    setEditingStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-display">Student Management</h1><p className="text-muted-foreground">{students.length} students</p></div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingStudent(null); }}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="h-4 w-4 mr-2" />Add Student</Button></DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader><DialogTitle className="font-display">{editingStudent ? 'Edit' : 'Add'} Student</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Full Name</Label><Input name="full_name" defaultValue={editingStudent?.full_name} required className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editingStudent?.email} required className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" defaultValue={editingStudent?.phone} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Date of Birth</Label><Input name="dob" type="date" defaultValue={editingStudent?.date_of_birth} className="rounded-xl" /></div>
                <div className="space-y-2"><Label>Department</Label>
                  <select name="department" defaultValue={editingStudent?.department || 'Computer Science'} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Address</Label><Input name="address" defaultValue={editingStudent?.address} className="rounded-xl" /></div>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" className="rounded-xl">Save</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" /></div>
        <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Department" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
      </div>
      <Card className="rounded-2xl">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-4 font-medium">Student</th><th className="text-left p-4 font-medium">Department</th><th className="text-left p-4 font-medium">Semester</th><th className="text-center p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.student_id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{s.full_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><div><p className="font-medium">{s.full_name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div></div></td>
                  <td className="p-4">{s.department}</td>
                  <td className="p-4">{s.semester}</td>
                  <td className="p-4 text-center"><ActiveBadge active={s.status === 'active'} /></td>
                  <td className="p-4 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => { setEditingStudent(s); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => handleDelete(s.student_id)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
