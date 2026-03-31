import { useAuthStore } from '@/stores/authStore';
import { StatCard } from '@/components/shared/StatCard';
import { Users, BookOpen, GraduationCap, ClipboardList, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const gradeDistribution = [
  { grade: 'A+', count: 3 }, { grade: 'A', count: 5 }, { grade: 'A-', count: 4 },
  { grade: 'B+', count: 3 }, { grade: 'B', count: 2 }, { grade: 'B-', count: 1 },
  { grade: 'C+', count: 1 }, { grade: 'D', count: 0 }, { grade: 'F', count: 0 },
];

const departmentData = [
  { name: 'CS', value: 12 }, { name: 'Math', value: 8 }, { name: 'Physics', value: 5 },
  { name: 'Chem', value: 4 }, { name: 'Bio', value: 3 }, { name: 'Eng', value: 3 },
  { name: 'Bus', value: 4 }, { name: 'Eng Lit', value: 2 },
];

const trendData = [
  { month: 'Jan', enrollments: 45 }, { month: 'Feb', enrollments: 52 },
  { month: 'Mar', enrollments: 38 }, { month: 'Apr', enrollments: 65 },
  { month: 'May', enrollments: 72 }, { month: 'Jun', enrollments: 30 },
  { month: 'Jul', enrollments: 25 }, { month: 'Aug', enrollments: 95 },
];

const COLORS = ['hsl(234,89%,58%)', 'hsl(280,65%,60%)', 'hsl(199,89%,48%)', 'hsl(142,76%,36%)', 'hsl(38,92%,50%)', 'hsl(0,84%,60%)', 'hsl(220,9%,46%)', 'hsl(170,60%,50%)'];

const recentActivity = [
  { action: 'Enrolled', desc: 'Alice Johnson enrolled in CS401', time: '2 hours ago', type: 'info' },
  { action: 'Grade Published', desc: 'Grades posted for MATH101', time: '4 hours ago', type: 'success' },
  { action: 'Approved', desc: 'Enrollment approved for Frank Lee', time: '6 hours ago', type: 'success' },
  { action: 'New Student', desc: 'James Taylor registered', time: '1 day ago', type: 'info' },
  { action: 'Rejected', desc: 'Enrollment rejected for Emma Davis', time: '2 days ago', type: 'warning' },
];

function StudentDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Student Dashboard</h1><p className="text-muted-foreground">Welcome back, Alice!</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Enrolled Courses" value={3} icon={BookOpen} description="This semester" gradient />
        <StatCard title="Pending Enrollments" value={1} icon={Clock} description="Awaiting approval" />
        <StatCard title="Completed Courses" value={1} icon={CheckCircle} description="With grades" />
        <StatCard title="Current GPA" value="3.72" icon={GraduationCap} trend={{ value: 5, positive: true }} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Recent Grades</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[{ course: 'CS101', grade: 'A', title: 'Intro to CS' }, { course: 'CS201', grade: 'A-', title: 'Data Structures' }, { course: 'MATH101', grade: 'B+', title: 'Calculus I' }].map(g => (
                <div key={g.course} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div><p className="font-medium text-sm">{g.title}</p><p className="text-xs text-muted-foreground">{g.course}</p></div>
                  <span className="inline-flex items-center rounded-lg bg-success/15 text-success px-2.5 py-1 text-xs font-bold">{g.grade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/courses')}><BookOpen className="h-5 w-5" />Browse Courses</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/enrollments')}><ClipboardList className="h-5 w-5" />My Enrollments</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/grades')}><GraduationCap className="h-5 w-5" />View Grades</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/transcript')}><TrendingUp className="h-5 w-5" />Transcript</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InstructorDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Instructor Dashboard</h1><p className="text-muted-foreground">Welcome back, Dr. Mitchell!</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Courses" value={4} icon={BookOpen} description="This semester" gradient />
        <StatCard title="Total Students" value={116} icon={Users} trend={{ value: 12, positive: true }} />
        <StatCard title="Pending Grades" value={8} icon={AlertCircle} description="Need attention" />
        <StatCard title="Avg. Performance" value="B+" icon={GraduationCap} description="Across all courses" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Grade Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="grade" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(220,13%,91%)' }} />
                <Bar dataKey="count" fill="hsl(234,89%,58%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/assigned-courses')}><BookOpen className="h-5 w-5" />My Courses</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/grade-management')}><GraduationCap className="h-5 w-5" />Grade Students</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/analytics')}><BarChart className="h-5 w-5" />Analytics</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/profile')}><Users className="h-5 w-5" />Profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Admin Dashboard</h1><p className="text-muted-foreground">System overview</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={12} icon={Users} trend={{ value: 8, positive: true }} gradient />
        <StatCard title="Total Instructors" value={8} icon={Users} description="7 active" />
        <StatCard title="Total Courses" value={12} icon={BookOpen} description="All active" />
        <StatCard title="Pending Approvals" value={4} icon={AlertCircle} description="Needs review" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader><CardTitle className="text-lg font-display">Enrollment Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(220,13%,91%)' }} />
                <Line type="monotone" dataKey="enrollments" stroke="hsl(234,89%,58%)" strokeWidth={2.5} dot={{ fill: 'hsl(234,89%,58%)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">By Department</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={departmentData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name }) => name}>
                  {departmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${a.type === 'success' ? 'bg-success' : a.type === 'warning' ? 'bg-warning' : 'bg-info'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/students')}><Users className="h-5 w-5" />Add Student</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/instructors')}><Users className="h-5 w-5" />Add Instructor</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/courses')}><BookOpen className="h-5 w-5" />Create Course</Button>
            <Button variant="outline" className="rounded-xl h-auto py-4 flex-col gap-2" onClick={() => navigate('/enrollment-management')}><ClipboardList className="h-5 w-5" />Manage Enrollments</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'instructor') return <InstructorDashboard />;
  return <AdminDashboard />;
}
