import { createContext, useEffect, useState, useContext, useRef } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {

  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const lastNotifRef = useRef(null); // 🔥 IMPORTANT

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");

      const newNotifs = res.data;

      // 🔥 éviter spam
      if (newNotifs.length > 0) {
        const last = newNotifs[newNotifs.length - 1];

        if (lastNotifRef.current !== last.message) {
          toast.success(last.message);
          lastNotifRef.current = last.message;
        }
      }

      setNotifications(newNotifs);

    } catch {
      console.log("Erreur notifications");
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};