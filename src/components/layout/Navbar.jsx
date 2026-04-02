import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { NotificationContext } from "../../context/NotificationContext";

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

  // ✅ hooks toujours AVANT
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

  // ✅ PAS DE RETURN ICI ❌
  return (
    <>
      {!isAdminPage && (
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

            {/* LOGO */}
            <Link
              to={isAdmin ? "/admin" : "/"}
              className={`text-2xl font-bold ${
                isAdmin ? "text-red-600" : "text-indigo-600"
              }`}
            >
              {isAdmin ? "🛒 AliShop Admin" : "🛒 AliShop"}
            </Link>

            {/* MENU */}
            <div className="flex items-center gap-6">

              {!isLivreur && !isAdmin && (
                <>
                  <Link to="/products">Produits</Link>

                  <Link to="/cart" className="relative">
                    🛍️ Panier
                    {cart?.item_count > 0 && (
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 rounded-full">
                        {cart.item_count}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {isLivreur && <Link to="/deliveries">🚚 Livraisons</Link>}

            </div>

            {/* USER */}
            <div className="flex items-center gap-4">

              {!user ? (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded">
                    Register
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">

                  {/* NOTIF */}
                  <div className="relative">
                    🔔
                    {notifications?.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </div>

                  {/* USER */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setOpen(!open)}
                      className="bg-gray-100 px-3 py-2 rounded"
                    >
                      👤 {user.name}
                    </button>

                    {open && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow">

                        <Link to="/profile" className="block px-4 py-2">
                          Profil
                        </Link>

                        <Link to="/change-password" className="block px-4 py-2">
                          Mot de passe
                        </Link>

                        {isClient && (
                          <Link to="/orders" className="block px-4 py-2">
                            Commandes
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-500"
                        >
                          Déconnexion
                        </button>

                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        </nav>
      )}
    </>
  );
}