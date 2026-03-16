import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          AliShop
        </Link>

        {/* Menu */}
        <div className="flex items-center gap-6">
          <Link
            to="/products"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Produits
          </Link>

          <Link
            id="cart-icon"
            to="/cart"
            className="text-gray-700 hover:text-indigo-600 transition"
          >
            Panier ({cart?.item_count || 0})
          </Link>
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                Login
              </Link>

              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <span className="text-gray-600">Bonjour {user.name}</span>

              <button
                onClick={logoutUser}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
