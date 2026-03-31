import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const typeIcons = { info: Info, success: CheckCircle, warning: AlertTriangle, error: XCircle };
const typeColors = { info: 'text-info', success: 'text-success', warning: 'text-warning', error: 'text-destructive' };

export default function NotificationsPage() {
  const user = useAuthStore(s => s.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user?.role && user?.id) {
      notificationService.getNotifications(user.role, user.id).then(setNotifications);
    }
  }, [user]);

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    if (user?.role && user?.id) {
      await notificationService.markAllAsRead(user.role, user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold font-display">Notifications</h1><p className="text-muted-foreground">Stay updated with academic alerts</p></div>
        <Button variant="outline" className="rounded-xl" onClick={markAllAsRead}><CheckCheck className="h-4 w-4 mr-2" />Mark all read</Button>
      </div>
      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setFilter('all')}>All</Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setFilter('unread')}>Unread</Button>
      </div>
      <div className="space-y-3">
        {filtered.map((n, i) => {
          const Icon = typeIcons[n.type];
          return (
            <motion.div key={n.notification_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={cn('rounded-2xl transition-colors cursor-pointer', !n.is_read && 'border-primary/30 bg-primary/5')} onClick={() => markAsRead(n.notification_id)}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={cn('mt-0.5 rounded-xl p-2', `bg-${n.type}/10`)}><Icon className={cn('h-4 w-4', typeColors[n.type])} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
