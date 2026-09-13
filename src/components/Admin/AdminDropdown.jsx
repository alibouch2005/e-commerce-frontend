import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChevronDown, Key, LogOut, ShieldCheck, User } from "lucide-react";
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
    document.addEventListener("touchstart", handleClickOutside);
    const handleEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex h-11 cursor-pointer items-center gap-2 rounded-2xl border px-1.5 pr-2 transition hover:-translate-y-0.5 sm:gap-3 sm:pr-3 ${open ? "border-indigo-200 bg-indigo-50 shadow-lg shadow-indigo-100" : "border-gray-100 bg-white shadow-sm hover:border-indigo-100 hover:bg-indigo-50"}`}
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-md shadow-indigo-200">
          {user?.name?.charAt(0) || "A"}
        </div>
        <span className="hidden min-w-0 text-left sm:block"><b className="block max-w-28 truncate text-xs text-gray-800">{user?.name || "Admin"}</b><small className="block text-[9px] font-black uppercase tracking-wider text-indigo-500">Administrateur</small></span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="premium-popover fixed left-3 right-3 top-[4.75rem] z-50 overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,.24)] backdrop-blur-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-72">
          <div className="relative overflow-hidden border-b border-indigo-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-5 text-white">
            <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-400/20 blur-2xl" />
            <div className="relative flex items-center gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-lg font-black">{user?.name?.charAt(0) || "A"}</span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{user?.name || "Admin"}</b><span className="mt-0.5 block truncate text-[11px] text-indigo-200">{user?.email}</span></span><ShieldCheck size={18} className="shrink-0 text-emerald-300" /></div>
          </div>
          <div className="space-y-1 p-2.5">
            <Link role="menuitem" to="/profile" onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-50 text-gray-500 group-hover:bg-white group-hover:text-indigo-600"><User size={17} /></span><span className="flex-1">{t("profile")}</span><ChevronDown size={14} className="-rotate-90 opacity-40" /></Link>
            <Link role="menuitem" to="/change-password" onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-gray-600 transition hover:bg-indigo-50 hover:text-indigo-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-50 text-gray-500 group-hover:bg-white group-hover:text-indigo-600"><Key size={17} /></span><span className="flex-1">{t("password")}</span><ChevronDown size={14} className="-rotate-90 opacity-40" /></Link>
            <div className="my-2 h-px bg-gray-100" />
            <button role="menuitem" type="button" onClick={handleLogout} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-50"><span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 group-hover:bg-white"><LogOut size={17} /></span>{t("logout")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
