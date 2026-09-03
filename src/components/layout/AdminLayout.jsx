import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import AdminSidebar from "../Admin/AdminSidebar";
import AdminDropdown from "../Admin/AdminDropdown";

const pageTitles = [
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
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="hidden shrink-0 lg:block">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fermer le menu admin"
            className="absolute inset-0 bg-gray-950/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[86vw] bg-white shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 rounded-xl bg-gray-100 p-2 text-gray-500"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 lg:hidden"
              aria-label="Ouvrir le menu admin"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">AliShop Admin</p>
              <h2 className="truncate text-base font-black text-gray-950 sm:text-lg">{title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative rounded-xl p-2 text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600">
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <AdminDropdown />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
