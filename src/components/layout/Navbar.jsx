import { Link } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // 🔥 Fermer dropdown si clic dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-600 hover:scale-105 transition"
        >
          🛒 AliShop
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-6">

          <Link
            to="/products"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Produits
          </Link>

          {/* 🛍️ Panier avec badge */}
          <Link
           id="cart-icon"
            to="/cart"
            className="relative text-gray-700 hover:text-indigo-600 transition"
          >
            🛍️ Panier

            {cart?.item_count > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                {cart.item_count}
              </span>
            )}
          </Link>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-4">

          {!user && (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <div className="relative" ref={dropdownRef}>

              {/* Bouton user */}
              <button
                onClick={() => setOpen(!open)}
                className="bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                👤 {user.name}
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 ${
                  open
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                >
                  👤 Mon Profil
                </Link>

                <Link
                  to="/change-password"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                >
                  🔐 Mot de passe
                </Link>

                <Link
                  to="/orders"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                >
                  📦 Mes commandes
                </Link>

                <div className="border-t"></div>

                <button
                  onClick={logoutUser}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 transition"
                >
                  🚪 Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}