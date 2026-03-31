import { Notification } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { mockNotifications } from '@/lib/mockData';

export const notificationService = {
  getNotifications: async (userRole: string, userId: string): Promise<Notification[]> => {
    if (!userId) return [];
    if (useAuthStore.getState().user?.isDemo) return mockNotifications.filter(n => n.user_id === userId);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_role', userRole)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  markAsRead: async (id: string): Promise<void> => {
    if (useAuthStore.getState().user?.isDemo) {
        const index = mockNotifications.findIndex(n => n.notification_id === id);
        if (index !== -1) mockNotifications[index].is_read = true;
        return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('notification_id', id);
    if (error) throw error;
  },

  markAllAsRead: async (userRole: string, userId: string): Promise<void> => {
    if (useAuthStore.getState().user?.isDemo) {
        mockNotifications
            .filter(n => n.user_role === userRole && n.user_id === userId)
            .forEach(n => n.is_read = true);
        return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_role', userRole)
      .eq('user_id', userId);
    if (error) throw error;
  },
};
