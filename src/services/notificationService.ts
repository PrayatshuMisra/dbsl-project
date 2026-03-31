import { Notification } from '@/lib/types';
import { mockNotifications } from '@/data/mock/notifications';

let notifications = [...mockNotifications];
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const notificationService = {
  getNotifications: async (userId?: string): Promise<Notification[]> => {
    await delay();
    if (!userId) return [...notifications];
    return notifications.filter(n => n.user_id === userId || n.user_id === 'ALL');
  },
  markAsRead: async (id: string): Promise<void> => {
    await delay();
    const n = notifications.find(n => n.id === id);
    if (n) n.read = true;
  },
  markAllAsRead: async (userId: string): Promise<void> => {
    await delay();
    notifications.forEach(n => { if (n.user_id === userId || n.user_id === 'ALL') n.read = true; });
  },
};
