import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActiveBadge } from '@/components/shared/Badges';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockUsers = [
  { id: 'STU001', name: 'Alice Johnson', email: 'alice.johnson@university.edu', role: 'student', active: true },
  { id: 'STU002', name: 'Bob Martinez', email: 'bob.martinez@university.edu', role: 'student', active: true },
  { id: 'INS001', name: 'Dr. Sarah Mitchell', email: 'sarah.mitchell@university.edu', role: 'instructor', active: true },
  { id: 'INS002', name: 'Prof. Robert Harris', email: 'robert.harris@university.edu', role: 'instructor', active: true },
  { id: 'ADM001', name: 'Admin User', email: 'admin@demo.com', role: 'admin', active: true },
];

export default function UserRolesPage() {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">User Role Management</h1><p className="text-muted-foreground">Manage user roles and access</p></div>
      <Card className="rounded-2xl"><CardContent className="p-0">
        <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="text-left p-4 font-medium">User</th><th className="text-left p-4 font-medium">Current Role</th><th className="text-center p-4 font-medium">Change Role</th><th className="text-center p-4 font-medium">Status</th><th className="text-right p-4 font-medium">Actions</th></tr></thead>
        <tbody>{mockUsers.map(u=>(
          <tr key={u.id} className="border-t hover:bg-muted/30"><td className="p-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback></Avatar><div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div></td>
          <td className="p-4"><Badge variant="secondary" className="rounded-lg capitalize">{u.role}</Badge></td>
          <td className="p-4 text-center"><Select defaultValue={u.role} onValueChange={()=>toast({title:'Role updated'})}><SelectTrigger className="w-32 mx-auto rounded-xl h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="instructor">Instructor</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select></td>
          <td className="p-4 text-center"><ActiveBadge active={u.active}/></td>
          <td className="p-4 text-right"><Button variant="outline" size="sm" className="rounded-xl" onClick={()=>toast({title: u.active?'Deactivated':'Activated'})}>{u.active?'Deactivate':'Activate'}</Button></td>
          </tr>))}</tbody></table>
      </CardContent></Card>
    </div>
  );
}
