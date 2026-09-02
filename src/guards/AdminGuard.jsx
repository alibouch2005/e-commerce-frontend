import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function AdminGuard({ children }) {
  const { user, loading } = useContext(AuthContext);
  const { t } = useLanguage();

  if (loading) return <p>{t("loading")}</p>;

  if (!user) return <Navigate to="/login" />;// si pas connecté, redirige vers login

  if (user.role !== "admin") {
    return <Navigate to="/" />;// si connecté mais pas admin, redirige vers home
  }

  return children;
}
