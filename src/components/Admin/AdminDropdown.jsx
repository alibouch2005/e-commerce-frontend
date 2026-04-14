// src/components/admin/AdminDropdown.jsx
import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { User, LogOut, Key, ChevronDown } from "lucide-react";

export default function AdminDropdown() {
  const { user, logoutUser } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition cursor-pointer"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
          {user?.name?.charAt(0) || "A"}
        </div>
        <span className="font-bold text-gray-700">{user?.name || "Admin"}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-gray-50 mb-1">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Compte Administrateur</p>
            <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
          </div>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition">
            <User size={16} /> Mon Profil
          </Link>
          <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition">
            <Key size={16} /> Mot de passe
          </Link>
          <div className="h-px bg-gray-100 my-1 mx-2"></div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-bold">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}