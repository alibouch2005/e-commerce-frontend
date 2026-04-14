import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { NotificationContext } from "../../context/NotificationContext";
import { User, LogOut, Key, ShoppingBag, Bell, ChevronDown, Package } from "lucide-react";

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { notifications } = useContext(NotificationContext);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const isLivreur = user?.role === "livreur";
  const isClient = user?.role === "client";
  const isAdmin = user?.role === "admin";
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // On ne rend pas cette Navbar sur les pages Admin (car elles ont leur propre Header)
  if (isAdminPage) return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* LOGO */}
        <Link
          to={isAdmin ? "/admin/dashboard" : "/"}
          className="flex items-center gap-2 text-2xl font-black tracking-tighter transition hover:opacity-80"
        >
          <span className={isAdmin ? "text-red-600" : "text-indigo-600"}>
            🛒 AliShop {isAdmin && <span className="text-sm bg-red-100 px-2 py-0.5 rounded-md ml-1 text-red-600">ADMIN</span>}
          </span>
        </Link>

        {/* LIENS DE NAVIGATION CENTRAUX */}
        <div className="hidden md:flex items-center gap-8 font-medium text-gray-600">
          {/* Affiche Produits UNIQUEMENT pour Clients ou Visiteurs non connectés */}
          {(isClient || !user) && (
            <Link to="/products" className="hover:text-indigo-600 transition">
              Produits
            </Link>
          )}

          {/* Affiche Livraisons UNIQUEMENT pour le Livreur */}
          {isLivreur && (
            <Link to="/deliveries" className="flex items-center gap-2 text-indigo-600 font-bold transition">
              <Package size={18} /> Livraisons
            </Link>
          )}
        </div>

        {/* ACTIONS & USER */}
        <div className="flex items-center gap-5">
          
          {/* PANIER (Uniquement Client/Visiteur - Masqué pour Admin et Livreur) */}
          {!isAdmin && !isLivreur && (
            <Link to="/cart" className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition">
              <ShoppingBag size={22} />
              {cart?.item_count > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cart.item_count}
                </span>
              )}
            </Link>
          )}

          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600">Connexion</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
                S'inscrire
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              
              {/* NOTIFICATIONS */}
              <div className="relative p-2 text-gray-400 hover:text-indigo-600 cursor-pointer transition">
                <Bell size={22} />
                {notifications?.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                )}
              </div>

              {/* DROPDOWN USER */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 bg-gray-50 p-1.5 pr-3 rounded-full hover:bg-gray-100 transition border border-gray-100"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-gray-700 hidden sm:inline">{user.name}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Mon Compte</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                    </div>

                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition">
                      <User size={16} /> Mon Profil
                    </Link>

                    <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition">
                      <Key size={16} /> Mot de passe
                    </Link>

                    {isClient && (
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition">
                        <Package size={16} /> Mes Commandes
                      </Link>
                    )}

                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-bold"
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}