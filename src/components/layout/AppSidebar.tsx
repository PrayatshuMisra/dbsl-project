import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, BookOpen, GraduationCap, ClipboardList, FileText, Users,
  BarChart3, Bell, User, Settings, LogOut, ShieldCheck, Activity, UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const studentNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Browse Courses', url: '/courses', icon: BookOpen },
  { title: 'My Enrollments', url: '/enrollments', icon: ClipboardList },
  { title: 'My Grades', url: '/grades', icon: GraduationCap },
  { title: 'Transcript', url: '/transcript', icon: FileText },
];

const instructorNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Assigned Courses', url: '/assigned-courses', icon: BookOpen },
  { title: 'Grade Management', url: '/grade-management', icon: GraduationCap },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
];

const adminNav = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Students', url: '/students', icon: Users },
  { title: 'Instructors', url: '/instructors', icon: Users },
  { title: 'Courses', url: '/courses', icon: BookOpen },
  { title: 'Enrollments', url: '/enrollment-management', icon: ClipboardList },
  { title: 'User Roles', url: '/user-roles', icon: UserCog },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Activity Log', url: '/activity-log', icon: Activity },
];

const commonNav = [
  { title: 'Notifications', url: '/notifications', icon: Bell },
  { title: 'Profile', url: '/profile', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const roleNav = user?.role === 'student' ? studentNav : user?.role === 'instructor' ? instructorNav : adminNav;
  const roleLabel = user?.role === 'student' ? 'Student Portal' : user?.role === 'instructor' ? 'Instructor Portal' : 'Administration';
  const isActive = (path: string) => location.pathname === path;

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U';

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 glass-panel shadow-premium">
      <SidebarHeader className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-white/20">
            <img src="/mit-symb.jpg" alt="MIT Manipal Emblem" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h2 className="text-base font-extrabold font-display tracking-tight text-white leading-none">MIT MANIPAL</h2>
              <p className="text-[9px] text-white/70 font-bold uppercase tracking-[0.2em] mt-1.5 leading-none">{roleLabel}</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {roleNav.map((item) => (
                <SidebarMenuItem key={item.url + item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={cn(
                      'rounded-lg transition-all duration-200 h-10 px-3',
                      isActive(item.url) 
                        ? 'bg-primary/10 text-primary font-semibold shadow-soft' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    tooltip={item.title}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive(item.url) ? "text-primary" : "text-muted-foreground")} />
                    {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonNav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    className={cn(
                      'rounded-lg transition-all duration-200 h-10 px-3',
                      isActive(item.url) 
                        ? 'bg-primary/10 text-primary font-semibold shadow-soft' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    )}
                    tooltip={item.title}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive(item.url) ? "text-primary" : "text-muted-foreground")} />
                    {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/40">
        <SidebarMenuButton
          onClick={() => { logout(); navigate('/login'); }}
          className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors h-10 px-3"
          tooltip="Log out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-3 text-sm font-medium">Log out</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
