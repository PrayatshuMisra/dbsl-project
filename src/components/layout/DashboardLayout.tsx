import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/lib/types';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

export function DashboardLayout({ children, requiredRoles }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (requiredRoles && !requiredRoles.includes(user.role)) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
