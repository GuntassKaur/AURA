import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'thinking' | 'progress' | 'reminder' | 'error';
  title: string;
  message: string;
  progress?: number; // for upload progress (0-100)
  duration?: number; // auto-dismiss milliseconds
}

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id'>) => string;
  removeNotification: (id: string) => void;
  updateNotificationProgress: (id: string, progress: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    
    // Auto-dismiss logic if duration is set (and not 'thinking' or 'progress' type which require manual dismiss)
    if (notification.duration && notification.type !== 'thinking' && notification.type !== 'progress') {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration);
    }
    
    return id;
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  updateNotificationProgress: (id, progress) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, progress } : n
      ),
    })),
}));
