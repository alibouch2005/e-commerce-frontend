import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Activity, Menu, X } from "lucide-react";
import AdminSidebar from "../Admin/AdminSidebar";
import AdminDropdown from "../Admin/AdminDropdown";
import AdminNotifications from "../Admin/AdminNotifications";

const pageTitles = [
  { match: "/admin/ordered-products", title: "Produits commandés" },
  { match: "/admin/issues", title: "Centre des problèmes" },
  { match: "/admin/courier-cash", title: "Caisse des livreurs" },
  { match: "/admin/wini-products", title: "Wini product" },
  { match: "/admin/categories", title: "Catégories" },
  { match: "/admin/products", title: "Produits" },
  { match: "/admin/orders", title: "Commandes" },
  { match: "/admin/users", title: "Utilisateurs" },
  { match: "/admin/coupons", title: "Promotions" },
  { match: "/admin/support", title: "Support" },
  { match: "/admin/dashboard", title: "Tableau de bord" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = useMemo(() => (
    pageTitles.find((item) => location.pathname.startsWith(item.match))?.title || "Tableau de bord"
  ), [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_5%,rgba(99,102,241,.12),transparent_28rem),#f7f8fc] dark:bg-gray-950">
      <div className="hidden shrink-0 lg:block">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fermer le menu admin"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[88vw] animate-[slideIn_.2s_ease-out] bg-white shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-xl border border-white/15 bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b border-indigo-100/70 bg-white/85 px-4 py-3 shadow-[0_12px_40px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-2xl border border-gray-100 bg-white p-2.5 text-gray-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 lg:hidden"
              aria-label="Ouvrir le menu admin"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 border-l-2 border-indigo-500 pl-3">
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-indigo-500">AliShop Administration</p>
              <h2 className="truncate text-base font-black tracking-tight text-gray-950 sm:text-lg">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="mr-1 hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-700 xl:inline-flex"><Activity size={13} /> Activité en direct</span>
            <AdminNotifications />
            <AdminDropdown />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
