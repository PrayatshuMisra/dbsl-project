

# Student Registration & Grade Management System — Frontend

## Overview
A polished, demo-ready academic management SaaS frontend with 3 role-based portals (Student, Instructor, Admin), complete CRUD workflows, mock data layer ready for Supabase swap, and premium UI design.

## Design System
- **Theme**: Deep indigo/slate/white academic palette with dark mode toggle
- **Style**: Glassmorphism cards, rounded-2xl, soft shadows, subtle Framer Motion animations
- **Layout**: Collapsible sidebar + topbar with breadcrumbs, search, notifications, profile dropdown

## Architecture
- **State**: Zustand stores for auth/role, UI state
- **Forms**: React Hook Form + Zod validation on all entity forms
- **Tables**: TanStack Table with search, sort, filter, pagination, bulk actions
- **Charts**: Recharts for all dashboard analytics
- **Services layer**: `/services/*.ts` with async mock functions (easily swappable to Supabase)
- **Types**: `/lib/types.ts` with full interfaces for Student, Instructor, Admin, Course, Enrollment
- **Mock data**: `/data/mock/` with realistic seed data and sample accounts

## Pages & Features

### Auth
- **Login page** — split-screen design, email/password, role selector for demo mode, remember me, forgot password UI
- **Register page** — mock account creation form

### Shared
- **Dashboard** — role-aware KPI cards, charts (enrollment trends, grade distribution, department stats, course occupancy), recent activity feed, quick actions
- **Notifications** — alerts list with filters (enrollment status, grades, announcements)
- **Profile** — editable personal info form, photo upload placeholder, account settings
- **Settings** — theme toggle, notification prefs, password change mock
- **Global command palette** (Cmd+K) — quick nav to any entity/page
- **404 page** — branded and polished

### Student Portal
- **Student Dashboard** — enrolled/pending/completed courses, GPA summary, recent grades, quick actions
- **Browse Courses** — card/table toggle, filters (dept, semester, credits, instructor), enroll button
- **Course Details** — full info, instructor preview, capacity progress, enroll CTA
- **My Enrollments** — status-filtered list with badges, withdraw action
- **Grades & Performance** — course grades table, GPA card, semester performance chart
- **Transcript** — printable styled transcript with download placeholder

### Instructor Portal
- **Instructor Dashboard** — assigned courses, student count, pending grades, avg performance
- **Assigned Courses** — table with roster/grade/performance actions
- **Course Roster** — enrolled students list with search, profile preview, export UI
- **Grade Management** — editable table with inline grade entry, remarks, bulk update, draft/publish, validation
- **Instructor Analytics** — course performance charts, pass/fail distribution

### Admin Portal
- **Admin Dashboard** — system-wide KPIs, pending approvals, recent activity
- **Student Management** — full CRUD table, add/edit modals, profile drawer, filters
- **Instructor Management** — full CRUD table, specialization/dept filters
- **Course Management** — full CRUD, instructor assignment, capacity, table + card views
- **Enrollment Management** — approve/reject workflow, bulk approval, status filters
- **User Role Management** — role assignment, activate/deactivate users
- **Academic Reports** — multi-tab reporting (student/course/dept/instructor), export buttons
- **Activity/Audit Log** — timeline of system actions

### UX Polish
- Animated page transitions (Framer Motion)
- Loading skeletons, empty states, error states, access denied state
- Status chips, grade badges, semester tags, progress bars
- Confirmation dialogs, toasts, drawer panels
- Fully responsive (desktop/tablet/mobile)

## Sample Accounts (Mock)
- **Student**: student@demo.com
- **Instructor**: instructor@demo.com  
- **Admin**: admin@demo.com
- All with password: "demo1234"

