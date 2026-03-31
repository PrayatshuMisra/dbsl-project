import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Users, BookOpen, GraduationCap, LayoutDashboard, Settings, Bell, User, ClipboardList, BarChart3, FileText } from 'lucide-react';

const allRoutes = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['student', 'instructor', 'admin'] as const },
  { label: 'Browse Courses', path: '/courses', icon: BookOpen, roles: ['student'] as const },
  { label: 'My Enrollments', path: '/enrollments', icon: ClipboardList, roles: ['student'] as const },
  { label: 'My Grades', path: '/grades', icon: GraduationCap, roles: ['student'] as const },
  { label: 'Transcript', path: '/transcript', icon: FileText, roles: ['student'] as const },
  { label: 'Assigned Courses', path: '/assigned-courses', icon: BookOpen, roles: ['instructor'] as const },
  { label: 'Grade Management', path: '/grade-management', icon: GraduationCap, roles: ['instructor'] as const },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['instructor'] as const },
  { label: 'Student Management', path: '/students', icon: Users, roles: ['admin'] as const },
  { label: 'Instructor Management', path: '/instructors', icon: Users, roles: ['admin'] as const },
  { label: 'Course Management', path: '/courses', icon: BookOpen, roles: ['admin'] as const },
  { label: 'Enrollment Management', path: '/enrollment-management', icon: ClipboardList, roles: ['admin'] as const },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin'] as const },
  { label: 'Activity Log', path: '/activity-log', icon: FileText, roles: ['admin'] as const },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['student', 'instructor', 'admin'] as const },
  { label: 'Profile', path: '/profile', icon: User, roles: ['student', 'instructor', 'admin'] as const },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['student', 'instructor', 'admin'] as const },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUIStore();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandOpen, setCommandOpen]);

  const filteredRoutes = allRoutes.filter(r => user && (r.roles as readonly string[]).includes(user.role));

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {filteredRoutes.map((route) => (
            <CommandItem key={route.path + route.label} onSelect={() => { navigate(route.path); setCommandOpen(false); }}>
              <route.icon className="mr-2 h-4 w-4" />
              {route.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
