import { useAuthStore } from '@/stores/authStore';
import { GradeValue } from '@/lib/types';
import { StatCard } from '@/components/shared/StatCard';
import { Users, BookOpen, GraduationCap, ClipboardList, TrendingUp, Clock, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GradeBadge } from '@/components/shared/Badges';
import { useEffect, useState } from 'react';
import { reportService } from '@/services/reportService';
import { enrollmentService } from '@/services/enrollmentService';
import { Badge } from '@/components/ui/badge';

function StudentDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      enrollmentService.getEnrollmentsByStudent(user.id).then(setEnrollments);
    }
  }, [user]);

  const approved = enrollments.filter(e => e.approval_status === 'approved');
  const pending = enrollments.filter(e => e.approval_status === 'pending');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Student Overview</h1>
        <p className="text-sm font-medium text-muted-foreground">Welcome back to your academic portal, {user?.full_name}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Enrolled Courses" value={approved.length} icon={BookOpen} description="Active this semester" gradient />
        <StatCard title="Awaiting Approval" value={pending.length} icon={Clock} description="Pending enrollments" />
        <StatCard title="Credits Earned" value={approved.length * 4} icon={CheckCircle} description="Total progress" />
        <StatCard title="Current GPA" value="3.84" icon={GraduationCap} trend={{ value: 2.4, positive: true }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-xl shadow-card border-border/50 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Academic Performance</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary" onClick={() => navigate('/grades')}>View All</Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {approved.length > 0 ? approved.slice(0, 3).map((e: any) => (
                <div key={e.enrollment_id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-md bg-background border border-border/50 font-bold text-xs text-muted-foreground group-hover:border-primary/30 transition-colors">
                      {e.courses?.course_code || e.course_id.substring(0, 5).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{e.courses?.title || 'Course Record'}</p>
                      <p className="text-xs text-muted-foreground mt-1">Status: {e.approval_status}</p>
                    </div>
                  </div>
                  <GradeBadge grade={e.grade as GradeValue} />
                </div>
              )) : (
                 <div className="text-center py-8 text-muted-foreground font-medium">No graded courses found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card border-border/50">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-3">
            <Button variant="outline" className="justify-start rounded-lg h-12 px-4 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/courses')}>
              <BookOpen className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Course Catalog</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 px-4 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/enrollments')}>
              <ClipboardList className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Manage Enrollments</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 px-4 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/grades')}>
              <GraduationCap className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Grade Reports</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 px-4 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/transcript')}>
              <TrendingUp className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Academic Transcript</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InstructorDashboard() {
  const navigate = useNavigate();
  const [gradeDist, setGradeDist] = useState<any[]>([]);

  useEffect(() => {
    reportService.getGradeDistribution().then(setGradeDist);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Instructor Panel</h1>
        <p className="text-sm font-medium text-muted-foreground">Managing your assigned curriculum and student performance.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Courses" value={2} icon={BookOpen} description="Current semester" gradient />
        <StatCard title="Total Students" value={45} icon={Users} trend={{ value: 5, positive: true }} />
        <StatCard title="Pending Grades" value={3} icon={AlertCircle} description="Needs attention" />
        <StatCard title="System Alerts" value={1} icon={Bell} description="Important notices" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-xl shadow-card border-border/50 lg:col-span-2">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Grade Distribution Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gradeDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="grade" className="text-[10px] font-bold uppercase" axisLine={false} tickLine={false} dy={10} />
                <YAxis className="text-[10px] font-bold" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card border-border/50">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Faculty Tools</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-3">
            <Button variant="outline" className="justify-start rounded-lg h-12 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/assigned-courses')}>
              <BookOpen className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">My Courses</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/grade-management')}>
              <GraduationCap className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Grading Dashboard</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/analytics')}>
              <BarChart className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Performance Analytics</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    reportService.getEnrollmentTrends().then(setTrends);
    reportService.getAdminDashboardSummary().then(setStats);
    reportService.getActivityLogs().then(logs => setActivities(logs.slice(0, 5)));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-foreground">Administration Console</h1>
        <p className="text-sm font-medium text-muted-foreground">Comprehensive system oversight and management.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats?.total_students || 0} icon={Users} gradient />
        <StatCard title="Active Faculty" value={stats?.total_instructors || 0} icon={Users} description="Verified instructors" />
        <StatCard title="Active Courses" value={stats?.active_courses || 0} icon={BookOpen} description="Course catalog" />
        <StatCard title="Pending Review" value={stats?.pending_enrollments || 0} icon={AlertCircle} description="Action required" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-xl shadow-card border-border/50 lg:col-span-2">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">System Enrollment Velocity</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" className="text-[10px] font-bold uppercase" axisLine={false} tickLine={false} dy={10} />
                <YAxis className="text-[10px] font-bold" axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-card border-border/50">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Management</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid gap-3">
            <Button variant="outline" className="justify-start rounded-lg h-12 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/students')}>
              <Users className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Student Directory</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/instructors')}>
              <Users className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Faculty Management</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/courses')}>
              <BookOpen className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Catalog Oversight</span>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-12 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all group" onClick={() => navigate('/enrollment-management')}>
              <ClipboardList className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
              <span className="text-sm font-bold">Registration Flow</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl shadow-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent System Activity</CardTitle>
          <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase tracking-widest bg-muted/50 border-border/40">Live Log</Badge>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activities.length > 0 ? activities.map((a, i) => (
              <div key={a.log_id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/30 transition-all group">
                <div className="mt-1 h-2 w-2 rounded-full ring-4 ring-background shrink-0 bg-info shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-foreground whitespace-nowrap">{a.action.replace('_', ' ')}</p>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{a.description}</p>
                </div>
              </div>
            )) : (
               <div className="col-span-3 text-center py-4 text-muted-foreground font-medium">No recent activity logs.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'instructor') return <InstructorDashboard />;
  return <AdminDashboard />;
}
