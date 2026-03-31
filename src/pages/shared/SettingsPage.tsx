import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Save, Bell, Lock, Eye } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();
  const { toast } = useToast();

  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-2xl font-bold font-display">Settings</h1><p className="text-muted-foreground">Manage your preferences</p></div>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><Eye className="h-5 w-5" />Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div><p className="font-medium">Dark Mode</p><p className="text-sm text-muted-foreground">Toggle dark theme</p></div>
            <Button variant="outline" size="icon" className="rounded-xl" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {['Email notifications', 'Enrollment updates', 'Grade publications', 'System announcements'].map(label => (
            <div key={label} className="flex items-center justify-between">
              <Label>{label}</Label><Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><Lock className="h-5 w-5" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Current Password</Label><Input type="password" className="rounded-xl" /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" className="rounded-xl" /></div>
          <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" className="rounded-xl" /></div>
          <Button className="rounded-xl" onClick={() => toast({ title: 'Password updated' })}><Save className="h-4 w-4 mr-2" />Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
