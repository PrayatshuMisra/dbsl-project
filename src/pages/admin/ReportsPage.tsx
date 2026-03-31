import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

const gradeData = [{ grade: 'A+', count: 3 },{ grade: 'A', count: 5 },{ grade: 'A-', count: 4 },{ grade: 'B+', count: 3 },{ grade: 'B', count: 2 },{ grade: 'B-', count: 1 },{ grade: 'C+', count: 1 }];
const deptData = [{ name: 'CS', students: 4, courses: 4 },{ name: 'Math', students: 2, courses: 2 },{ name: 'Physics', students: 1, courses: 1 },{ name: 'Chem', students: 1, courses: 1 },{ name: 'Bio', students: 1, courses: 1 },{ name: 'Eng', students: 1, courses: 1 },{ name: 'Bus', students: 1, courses: 1 },{ name: 'Eng Lit', students: 1, courses: 1 }];
const workloadData = [{ name: 'Dr. Mitchell', courses: 4, students: 116 },{ name: 'Prof. Harris', courses: 2, students: 77 },{ name: 'Dr. Chang', courses: 1, students: 38 },{ name: 'Prof. Brooks', courses: 1, students: 36 },{ name: 'Dr. Torres', courses: 1, students: 42 }];
const COLORS = ['hsl(234,89%,58%)','hsl(280,65%,60%)','hsl(199,89%,48%)','hsl(142,76%,36%)','hsl(38,92%,50%)','hsl(0,84%,60%)','hsl(220,9%,46%)','hsl(170,60%,50%)'];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-display">Academic Reports</h1><p className="text-muted-foreground">Comprehensive analytics and reporting</p></div>
        <Button variant="outline" className="rounded-xl"><Download className="h-4 w-4 mr-2"/>Export All</Button>
      </div>
      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList className="rounded-xl"><TabsTrigger value="grades" className="rounded-lg">Grades</TabsTrigger><TabsTrigger value="departments" className="rounded-lg">Departments</TabsTrigger><TabsTrigger value="workload" className="rounded-lg">Instructor Workload</TabsTrigger></TabsList>
        <TabsContent value="grades">
          <Card className="rounded-2xl"><CardHeader><CardTitle className="font-display">Grade Distribution</CardTitle></CardHeader><CardContent>
            <ResponsiveContainer width="100%" height={350}><BarChart data={gradeData}><CartesianGrid strokeDasharray="3 3" className="stroke-border"/><XAxis dataKey="grade"/><YAxis/><Tooltip contentStyle={{borderRadius:'12px'}}/><Bar dataKey="count" fill="hsl(234,89%,58%)" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="departments">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl"><CardHeader><CardTitle className="font-display">Students by Department</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="students" label={({name})=>name}>{deptData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip contentStyle={{borderRadius:'12px'}}/></PieChart></ResponsiveContainer>
            </CardContent></Card>
            <Card className="rounded-2xl"><CardHeader><CardTitle className="font-display">Courses by Department</CardTitle></CardHeader><CardContent>
              <ResponsiveContainer width="100%" height={300}><BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" className="stroke-border"/><XAxis dataKey="name"/><YAxis/><Tooltip contentStyle={{borderRadius:'12px'}}/><Bar dataKey="courses" fill="hsl(280,65%,60%)" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="workload">
          <Card className="rounded-2xl"><CardHeader><CardTitle className="font-display">Instructor Workload</CardTitle></CardHeader><CardContent>
            <ResponsiveContainer width="100%" height={350}><BarChart data={workloadData}><CartesianGrid strokeDasharray="3 3" className="stroke-border"/><XAxis dataKey="name"/><YAxis/><Tooltip contentStyle={{borderRadius:'12px'}}/><Bar dataKey="courses" fill="hsl(234,89%,58%)" radius={[6,6,0,0]} name="Courses"/><Bar dataKey="students" fill="hsl(199,89%,48%)" radius={[6,6,0,0]} name="Students"/></BarChart></ResponsiveContainer>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
