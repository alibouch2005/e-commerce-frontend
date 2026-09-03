import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  ClipboardList,
  Layers,
  LayoutDashboard,
  MessageCircle,
  Package,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminSidebar({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  const navStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold"
        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
    }`;

  const handleNavigate = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-50 p-6">
        <Link to="/admin" className="group flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600 p-1.5 transition-transform group-hover:rotate-12">
            <Package size={20} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-gray-800">
            AliShop <span className="text-indigo-600">Admin</span>
          </span>
        </Link>
      </div>

      <nav className="mt-2 flex-1 space-y-2 p-4">
        <p className="mb-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t("mainMenu")}</p>

        <NavLink to="/admin/dashboard" className={navStyle} onClick={handleNavigate}>
          <LayoutDashboard size={20} />
          <span>{t("dashboard")}</span>
        </NavLink>

        <NavLink to="/admin/categories" className={navStyle} onClick={handleNavigate}>
          <Layers size={20} />
          <span>{t("categories")}</span>
        </NavLink>

        <NavLink to="/admin/products" className={navStyle} onClick={handleNavigate}>
          <Package size={20} />
          <span>{t("products")}</span>
        </NavLink>

        <NavLink to="/admin/wini-products" className={navStyle} onClick={handleNavigate}>
          <TrendingUp size={20} />
          <span>Wini product</span>
        </NavLink>

        {user?.role === "admin" && (
          <NavLink to="/admin/orders" className={navStyle} onClick={handleNavigate}>
            <ClipboardList size={20} />
            <span>{t("orders")}</span>
          </NavLink>
        )}

        <NavLink to="/admin/users" className={navStyle} onClick={handleNavigate}>
          <Users size={20} />
          <span>{t("users")}</span>
        </NavLink>

        <NavLink to="/admin/coupons" className={navStyle} onClick={handleNavigate}>
          <Tag size={20} />
          <span>{t("promos")}</span>
        </NavLink>

        <NavLink to="/admin/support" className={navStyle} onClick={handleNavigate}>
          <MessageCircle size={20} />
          <span>{t("support")}</span>
        </NavLink>
      </nav>
    </aside>
  );
}
