import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { NotificationItem } from '../types';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  retry: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/notifications');
      setNotifications(response.data.notifications);
    } catch (loadError: any) {
      setError(loadError.response?.data?.error || 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { void load(); }, [load]);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item));
    } catch (markError: any) {
      throw new Error(markError.response?.data?.error || 'Unable to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((item) => !item.read);
    await Promise.all(unread.map((item) => markAsRead(item.id)));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read).length,
      loading,
      error,
      markAsRead,
      markAllAsRead,
      retry: load,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
