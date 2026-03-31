import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const { toast } = useToast();
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold font-display">Profile</h1><p className="text-muted-foreground">Manage your personal information</p></div>
      
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow"><Camera className="h-3.5 w-3.5" /></button>
            </div>
            <div>
              <h2 className="text-xl font-bold font-display">{user?.full_name}</h2>
              <p className="text-muted-foreground capitalize">{user?.role}</p>
              {user?.department && <p className="text-sm text-muted-foreground">{user.department}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg font-display">Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Full Name</Label><Input defaultValue={user?.full_name} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input defaultValue="(555) 123-4567" className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Department</Label><Input defaultValue={user?.department || 'N/A'} className="rounded-xl" /></div>
          </div>
          <div className="space-y-2"><Label>Address</Label><Textarea defaultValue="123 Campus Dr, Suite 4A" className="rounded-xl" /></div>
          <Button className="rounded-xl" onClick={() => toast({ title: 'Profile updated', description: 'Your changes have been saved.' })}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
