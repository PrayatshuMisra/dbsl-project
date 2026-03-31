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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Student Directory</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Managing {students.length} currently enrolled students</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingStudent(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-lg h-10 px-4 font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
              <Plus className="h-4 w-4 mr-2 stroke-[3px]" />
              Register New Student
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl max-w-2xl p-0 overflow-hidden border-none shadow-premium">
            <DialogHeader className="p-6 bg-slate-900 text-white">
              <DialogTitle className="font-display text-xl font-bold">{editingStudent ? 'Update Profile' : 'New Admission'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="p-6 space-y-6 bg-card">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Legal Full Name</Label>
                  <Input name="full_name" defaultValue={editingStudent?.full_name} required className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Institutional Email</Label>
                  <Input name="email" type="email" defaultValue={editingStudent?.email} required className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Primary Phone</Label>
                  <Input name="phone" defaultValue={editingStudent?.phone} className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Date of Birth</Label>
                  <Input name="dob" type="date" defaultValue={editingStudent?.date_of_birth} className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Primary Department</Label>
                  <select name="department" defaultValue={editingStudent?.department || 'Computer Science'} className="flex h-11 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Residential Address</Label>
                  <Input name="address" defaultValue={editingStudent?.address} className="rounded-lg h-11 border-border/60" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" className="rounded-lg font-bold" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="rounded-lg px-8 font-bold shadow-lg shadow-primary/20">Save Records</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-lg border-border/60 shadow-soft bg-background/50 backdrop-blur-sm" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap ml-2">Filter By:</span>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full md:w-[220px] h-11 rounded-lg border-border/60 bg-background/50 backdrop-blur-sm shadow-soft">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-premium">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Student Profile</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Academic Track</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-center">Status</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.student_id} className="border-b border-border/30 hover:bg-muted/10 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-soft ring-1 ring-border/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold leading-none">{s.full_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">{s.full_name}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-xs uppercase tracking-tight text-foreground">{s.department}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">{s.semester}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <ActiveBadge active={s.status === 'active'} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 px-2">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all" onClick={() => { setEditingStudent(s); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all" onClick={() => handleDelete(s.student_id)}>
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
