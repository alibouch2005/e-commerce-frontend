import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChevronDown, Key, LogOut, User } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminDropdown() {
  const { user, logoutUser } = useContext(AuthContext);
  const { t } = useLanguage();
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
        className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-gray-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-100">
          {user?.name?.charAt(0) || "A"}
        </div>
        <span className="font-bold text-gray-700">{user?.name || "Admin"}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl">
          <div className="mb-1 border-b border-gray-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{t("adminAccount")}</p>
            <p className="truncate text-sm font-bold text-gray-800">{user?.email}</p>
          </div>
          <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600">
            <User size={16} /> {t("profile")}
          </Link>
          <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-600">
            <Key size={16} /> {t("password")}
          </Link>
          <div className="mx-2 my-1 h-px bg-gray-100" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50">
            <LogOut size={16} /> {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
