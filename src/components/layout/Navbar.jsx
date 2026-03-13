import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { logout } from "../../services/authService";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();

    setUser(null);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex gap-6">
          <Link to="/" className="font-bold">
            Home
          </Link>

          <Link to="/products">Products</Link>
        </div>

        <div className="flex gap-4 items-center">
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {user && (
            <>
              <span className="font-medium">Bonjour {user.name}</span>

              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
