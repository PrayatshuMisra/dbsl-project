import { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { ActivityLog } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Activity, Users, BookOpen, GraduationCap, ClipboardList } from 'lucide-react';

const actionIcons: Record<string, React.ElementType> = { enrollment_approved: ClipboardList, enrollment_rejected: ClipboardList, grade_updated: GraduationCap, grade_published: GraduationCap, course_created: BookOpen, course_updated: BookOpen, student_registered: Users, student_deactivated: Users, instructor_added: Users };

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  useEffect(() => { reportService.getActivityLogs().then(setActivities); }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold font-display">Activity Log</h1><p className="text-muted-foreground">System audit trail</p></div>
      <div className="space-y-3">
        {activities.map((a, i) => {
          const Icon = actionIcons[a.action] || Activity;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="rounded-2xl">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-xl bg-primary/10 p-2.5"><Icon className="h-4 w-4 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{a.user_name}</span>
                      <Badge variant="outline" className="rounded-lg text-[10px] capitalize">{a.user_role}</Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
