import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Breadcrumbs } from './Breadcrumbs';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Search, LogOut, User, Settings, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function Topbar() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const { setCommandOpen } = useUIStore();
  const navigate = useNavigate();

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center gap-4 glass-nav px-4 lg:px-6 shadow-soft no-print">
      <SidebarTrigger className="lg:hidden" />
      <div className="flex-1 flex items-center">
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        <img src="/maheLogo.png" alt="MAHE Logo Banner" className="h-12 w-auto object-contain" />
      </div>
        <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-border/40">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md relative hover:bg-background hover:shadow-soft transition-all" onClick={() => navigate('/notifications')}>
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 rounded-lg px-2 py-1.5 h-10 hover:bg-muted/50 transition-colors">
              <Avatar className="h-8 w-8 border border-border/50">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold leading-none">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold font-display leading-tight">{user?.full_name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{user?.role}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-xl shadow-premium border-border/50">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg cursor-pointer" onClick={() => navigate('/settings')}><Settings className="mr-2 h-4 w-4" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => { logout(); navigate('/login'); }}><LogOut className="mr-2 h-4 w-4" />Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
