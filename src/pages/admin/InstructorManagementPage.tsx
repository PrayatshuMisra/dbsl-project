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
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const departments: Department[] = ['Computer Science','Mathematics','Physics','Chemistry','Biology','Engineering','Business','English'];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-display">Instructor Management</h1><p className="text-muted-foreground">{instructors.length} instructors</p></div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if(!o) setEditing(null); }}>
          <DialogTrigger asChild><Button className="rounded-xl"><Plus className="h-4 w-4 mr-2"/>Add Instructor</Button></DialogTrigger>
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit' : 'Add'} Instructor</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Full Name</Label><Input name="full_name" defaultValue={editing?.full_name} required className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={editing?.email} required className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Phone</Label><Input name="phone" defaultValue={editing?.phone} className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Specialization</Label><Input name="specialization" defaultValue={editing?.specialization} className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Department</Label><select name="department" defaultValue={editing?.department||'Computer Science'} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">{departments.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="rounded-xl" onClick={()=>setDialogOpen(false)}>Cancel</Button><Button type="submit" className="rounded-xl">Save</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 rounded-xl"/></div>
        <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Department"/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{departments.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
      </div>
      <Card className="rounded-2xl"><CardContent className="p-0">
        <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="text-left p-4 font-medium">Instructor</th><th className="text-left p-4 font-medium">Department</th><th className="text-left p-4 font-medium">Specialization</th><th className="text-center p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Actions</th></tr></thead>
        <tbody>{filtered.map(i=>(
          <tr key={i.instructor_id} className="border-t hover:bg-muted/30"><td className="p-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{i.full_name.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback></Avatar><div><p className="font-medium">{i.full_name}</p><p className="text-xs text-muted-foreground">{i.email}</p></div></div></td>
          <td className="p-4">{i.department}</td><td className="p-4">{i.specialization}</td><td className="p-4 text-center"><ActiveBadge active={i.status==='active'}/></td>
          <td className="p-4 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={()=>{setEditing(i);setDialogOpen(true);}}><Pencil className="h-3.5 w-3.5"/></Button><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={()=>handleDelete(i.instructor_id)}><Trash2 className="h-3.5 w-3.5"/></Button></div></td></tr>
        ))}</tbody></table>
      </CardContent></Card>
    </div>
  );
}
