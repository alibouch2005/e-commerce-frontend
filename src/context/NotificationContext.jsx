import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../Api/axios";
import { AuthContext } from "./AuthContext";

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext({ notifications: [], unreadCount: 0 });

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return setNotifications([]);
    try {
      const { data } = await api.get("/api/notifications");
      setNotifications(data.data ?? []);
    } catch (error) {
      if (error.response?.status !== 401) console.error("Notification loading failed", error);
    }
  }, [user]);

  useEffect(() => {
    const initialTimer = window.setTimeout(fetchNotifications, 0);
    if (!user) return () => window.clearTimeout(initialTimer);
    const timer = window.setInterval(fetchNotifications, 30000);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer); };
  }, [fetchNotifications, user]);

  const markAllRead = async () => {
    await api.patch("/api/notifications/read-all");
    setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
  };

  const markRead = async (id) => {
    await api.patch(`/api/notifications/${id}/read`);
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount: notifications.filter((item) => !item.read_at).length, refreshNotifications: fetchNotifications, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
