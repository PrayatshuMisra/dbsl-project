import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/shared/DashboardPage";
import NotificationsPage from "@/pages/shared/NotificationsPage";
import ProfilePage from "@/pages/shared/ProfilePage";
import SettingsPage from "@/pages/shared/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

import BrowseCoursesPage from "@/pages/student/BrowseCoursesPage";
import CourseDetailsPage from "@/pages/student/CourseDetailsPage";
import MyEnrollmentsPage from "@/pages/student/MyEnrollmentsPage";
import GradesPage from "@/pages/student/GradesPage";
import TranscriptPage from "@/pages/student/TranscriptPage";

import AssignedCoursesPage from "@/pages/instructor/AssignedCoursesPage";
import CourseRosterPage from "@/pages/instructor/CourseRosterPage";
import GradeManagementPage from "@/pages/instructor/GradeManagementPage";
import InstructorAnalyticsPage from "@/pages/instructor/InstructorAnalyticsPage";

import StudentManagementPage from "@/pages/admin/StudentManagementPage";
import InstructorManagementPage from "@/pages/admin/InstructorManagementPage";
import CourseManagementPage from "@/pages/admin/CourseManagementPage";
import EnrollmentManagementPage from "@/pages/admin/EnrollmentManagementPage";
import UserRolesPage from "@/pages/admin/UserRolesPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import ActivityLogPage from "@/pages/admin/ActivityLogPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import { UserRole } from "@/lib/types";

function DashboardRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  return (
    <ProtectedRoute>
      <DashboardLayout requiredRoles={roles}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Shared routes */}
          <Route path="/" element={<DashboardRoute><DashboardPage /></DashboardRoute>} />
          <Route path="/notifications" element={<DashboardRoute><NotificationsPage /></DashboardRoute>} />
          <Route path="/profile" element={<DashboardRoute><ProfilePage /></DashboardRoute>} />
          <Route path="/settings" element={<DashboardRoute><SettingsPage /></DashboardRoute>} />

          {/* Student routes */}
          <Route path="/courses" element={<DashboardRoute><BrowseCoursesPage /></DashboardRoute>} />
          <Route path="/courses/:id" element={<DashboardRoute><CourseDetailsPage /></DashboardRoute>} />
          <Route path="/enrollments" element={<DashboardRoute roles={['student']}><MyEnrollmentsPage /></DashboardRoute>} />
          <Route path="/grades" element={<DashboardRoute roles={['student']}><GradesPage /></DashboardRoute>} />
          <Route path="/transcript" element={<DashboardRoute roles={['student']}><TranscriptPage /></DashboardRoute>} />

          {/* Instructor routes */}
          <Route path="/assigned-courses" element={<DashboardRoute roles={['instructor']}><AssignedCoursesPage /></DashboardRoute>} />
          <Route path="/roster/:courseId" element={<DashboardRoute roles={['instructor']}><CourseRosterPage /></DashboardRoute>} />
          <Route path="/grade-management" element={<DashboardRoute roles={['instructor']}><GradeManagementPage /></DashboardRoute>} />
          <Route path="/analytics" element={<DashboardRoute roles={['instructor']}><InstructorAnalyticsPage /></DashboardRoute>} />

          {/* Admin routes */}
          <Route path="/students" element={<DashboardRoute roles={['admin']}><StudentManagementPage /></DashboardRoute>} />
          <Route path="/instructors" element={<DashboardRoute roles={['admin']}><InstructorManagementPage /></DashboardRoute>} />
          <Route path="/enrollment-management" element={<DashboardRoute roles={['admin']}><EnrollmentManagementPage /></DashboardRoute>} />
          <Route path="/user-roles" element={<DashboardRoute roles={['admin']}><UserRolesPage /></DashboardRoute>} />
          <Route path="/reports" element={<DashboardRoute roles={['admin']}><ReportsPage /></DashboardRoute>} />
          <Route path="/activity-log" element={<DashboardRoute roles={['admin']}><ActivityLogPage /></DashboardRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
