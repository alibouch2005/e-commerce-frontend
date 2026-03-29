import { Link, useNavigate } from "react-router-dom";
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

  const isLivreur = user?.role === "livreur";
  const isClient = user?.role === "client";
  const isAdmin = user?.role === "admin";

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
    setOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          🛒 AliShop
        </Link>

        {/* MENU */}
        <div className="flex items-center gap-6">

          {/* CLIENT */}
          {!isLivreur && (
            <>
              <Link to="/products" className="hover:text-indigo-600">
                Produits
              </Link>

              <Link
                to="/cart"
                className="relative hover:text-indigo-600"
              >
                🛍️ Panier
                {cart?.item_count > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {cart.item_count}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* LIVREUR */}
          {isLivreur && (
            <Link to="/deliveries" className="hover:text-indigo-600">
              🚚 Livraisons
            </Link>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" className="hover:text-indigo-600">
                📊 Dashboard
              </Link>

              <Link to="/admin/orders" className="hover:text-indigo-600">
                📦 Commandes
              </Link>
            </>
          )}
        </div>

        {/* AUTH */}
        <div className="flex items-center gap-4">

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">

              {/* 🔔 NOTIFICATIONS */}
              <div className="relative cursor-pointer">
                🔔
                {notifications?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>

              {/* USER DROPDOWN */}
              <div className="relative" ref={dropdownRef}>

                <button
                  onClick={() => setOpen(!open)}
                  className="bg-gray-100 px-3 py-2 rounded-lg"
                >
                  👤 {user.name}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg overflow-hidden">

                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      👤 Profil
                    </Link>

                    <Link
                      to="/change-password"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      🔐 Mot de passe
                    </Link>

                    {isClient && (
                      <Link
                        to="/orders"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        📦 Commandes
                      </Link>
                    )}

                    {isLivreur && (
                      <Link
                        to="/deliveries"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        🚚 Livraisons
                      </Link>
                    )}

                    <div className="border-t"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100"
                    >
                      🚪 Déconnexion
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