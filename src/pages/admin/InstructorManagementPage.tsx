import { useState, useEffect } from 'react';
import { instructorService } from '@/services/instructorService';
import { Instructor, Department } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ActiveBadge } from '@/components/shared/Badges';
import { Search, Plus, Pencil, Trash2, Badge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const departments: Department[] = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'English'];

export default function InstructorManagementPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);
  const { toast } = useToast();

  useEffect(() => { instructorService.getInstructors().then(setInstructors); }, []);

  const filtered = instructors.filter(i => {
    const m = i.full_name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase());
    return m && (deptFilter === 'all' || i.department === deptFilter);
  });

  const handleDelete = async (id: string) => { await instructorService.deleteInstructor(id); setInstructors(p => p.filter(i => i.instructor_id !== id)); toast({ title: 'Instructor deleted' }); };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = { full_name: f.get('full_name') as string, email: f.get('email') as string, phone: f.get('phone') as string, department: f.get('department') as Department, specialization: f.get('specialization') as string, joining_date: new Date().toISOString().split('T')[0], profile_photo: '', status: 'active' as const };
    if (editing) { const u = await instructorService.updateInstructor(editing.instructor_id, data); setInstructors(p => p.map(i => i.instructor_id === u.instructor_id ? u : i)); toast({ title: 'Updated' }); }
    else { const c = await instructorService.createInstructor(data); setInstructors(p => [...p, c]); toast({ title: 'Created' }); }
    setDialogOpen(false); setEditing(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Faculty Directory</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">Managing {instructors.length} active faculty members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-lg h-10 px-4 font-bold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
              <Plus className="h-4 w-4 mr-2 stroke-[3px]" />
              Appoint Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl max-w-2xl p-0 overflow-hidden border-none shadow-premium">
            <DialogHeader className="p-6 bg-slate-900 text-white">
              <DialogTitle className="font-display text-xl font-bold">{editing ? 'Update Faculty Record' : 'New Faculty Appointment'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="p-6 space-y-6 bg-card">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <Input name="full_name" defaultValue={editing?.full_name} required className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Official Email</Label>
                  <Input name="email" type="email" defaultValue={editing?.email} required className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Phone</Label>
                  <Input name="phone" defaultValue={editing?.phone} className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Academic Specialization</Label>
                  <Input name="specialization" defaultValue={editing?.specialization} className="rounded-lg h-11 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Assigned Department</Label>
                  <select name="department" defaultValue={editing?.department || 'Computer Science'} className="flex h-11 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="ghost" className="rounded-lg font-bold" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="rounded-lg px-8 font-bold shadow-lg shadow-primary/20">Save Appointment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search faculty by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-11 rounded-lg border-border/60 shadow-soft bg-background/50 backdrop-blur-sm" />
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
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Instructor Profile</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Department</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80">Specialization</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-center">Status</th>
                  <th className="p-4 font-bold font-display uppercase tracking-widest text-[10px] text-muted-foreground/80 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.instructor_id} className="border-b border-border/30 hover:bg-muted/10 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-soft ring-1 ring-border/20">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold leading-none">{i.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">{i.full_name}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1">{i.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-xs uppercase tracking-tight text-foreground">{i.department}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="rounded-md font-bold text-[10px] uppercase tracking-wider bg-secondary/50 text-secondary-foreground border-border/40">
                        {i.specialization}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <ActiveBadge active={i.status === 'active'} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 px-2">
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all" onClick={() => { setEditing(i); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all" onClick={() => handleDelete(i.instructor_id)}>
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
