import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { getUser, logout } from "../services/authService";

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getUser()
      .then(res => {
        setUser(res.data.user); 
      })
      .catch(err => {

        if (err.response?.status === 401) {
          setUser(null);
        } else {
          console.error(err);
        }

      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  // 🚪 LOGOUT
  const logoutUser = async () => {

    try {
      await logout(); // call backend
    } catch (err) {
      console.error("Logout error:", err);
    }

    setUser(null); // clear frontend
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        setUser,
        logoutUser,
        loading
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}