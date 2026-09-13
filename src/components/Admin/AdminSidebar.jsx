import { createElement, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Banknote,
  ChevronRight,
  ClipboardList,
  Layers,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminSidebar({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  const menuGroups = [
    { label: "Pilotage", items: [{ to: "/admin/dashboard", label: t("dashboard"), icon: LayoutDashboard }] },
    {
      label: "Catalogue",
      items: [
        { to: "/admin/categories", label: t("categories"), icon: Layers },
        { to: "/admin/products", label: t("products"), icon: Package },
        { to: "/admin/wini-products", label: "Wini product", icon: TrendingUp },
      ],
    },
    {
      label: "Opérations",
      items: [
        ...(user?.role === "admin" ? [{ to: "/admin/orders", label: t("orders"), icon: ClipboardList }] : []),
        { to: "/admin/courier-cash", label: t("cashTitle"), icon: Banknote },
        { to: "/admin/users", label: t("users"), icon: Users },
        { to: "/admin/coupons", label: t("promos"), icon: Tag },
        { to: "/admin/support", label: t("support"), icon: MessageCircle },
        { to: "/admin/issues", label: "Problèmes", icon: ShieldAlert },
      ],
    },
  ];

  const handleNavigate = () => onNavigate?.();

  return (
    <aside className="relative flex h-full w-72 flex-col overflow-hidden border-r border-indigo-100/70 bg-white shadow-[18px_0_55px_-38px_rgba(49,46,129,.4)]">
      <div className="pointer-events-none absolute -left-20 top-24 h-56 w-56 rounded-full bg-indigo-200/25 blur-3xl" />

      <div className="relative p-4 pb-2">
        <Link to="/admin/dashboard" onClick={handleNavigate} className="group flex items-center gap-3 overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-4 text-white shadow-xl shadow-indigo-950/20">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-inner backdrop-blur transition duration-300 group-hover:rotate-6 group-hover:scale-105"><Package size={22} className="text-violet-200" /></span>
          <span className="min-w-0 flex-1"><span className="block truncate text-lg font-black tracking-tight">AliShop</span><span className="block text-[9px] font-black uppercase tracking-[.2em] text-indigo-200">Administration</span></span>
          <Sparkles size={16} className="shrink-0 text-amber-300 opacity-80" />
        </Link>
      </div>

      <nav className="admin-premium-scroll relative flex-1 space-y-5 overflow-y-auto px-4 py-4" aria-label={t("mainMenu")}>
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[.2em] text-gray-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={handleNavigate} className={({ isActive }) => `group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-2xl px-2.5 py-2 transition-all duration-200 ${isActive ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200" : "text-slate-600 hover:translate-x-0.5 hover:bg-indigo-50 hover:text-indigo-700"}`}>
                  {({ isActive }) => (
                    <>
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${isActive ? "bg-white/15 text-white shadow-inner" : "bg-gray-50 text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm"}`}>{createElement(Icon, { size: 17, strokeWidth: 2.1 })}</span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{label}</span>
                      <ChevronRight size={15} className={`shrink-0 transition ${isActive ? "translate-x-0 opacity-90" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"}`} />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-200"><ShieldCheck size={18} /></span>
          <span className="min-w-0 flex-1"><b className="block truncate text-xs text-emerald-900">Espace sécurisé</b><span className="block text-[10px] font-semibold text-emerald-600">Session administrateur</span></span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" />
        </div>
      </div>
    </aside>
  );
}
