import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {

  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;// si pas connecté, redirige vers login

  if (user.role !== "admin") {
    return <Navigate to="/" />;// si connecté mais pas admin, redirige vers home
  }

  return children;
}