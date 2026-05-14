import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const GuestGuard = () => {
  const { user, loading } = useContext(AuthContext);// récupère l'utilisateur et le loading du contexte

  if (loading) return <p>Loading...</p>;// affiche un message de chargement pendant que le contexte charge l'utilisateur

  if (user) {
    return <Navigate to="/" replace />;// si connecté, redirige vers home
  }

  return <Outlet />;// si pas connecté, affiche le contenu de la route
};

export default GuestGuard;