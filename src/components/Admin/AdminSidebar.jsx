// src/components/admin/AdminSidebar.jsx
import { NavLink, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Layers, 
  Package, 
  ClipboardList, 
} from "lucide-react";

export default function AdminSidebar() {
  const { user } = useContext(AuthContext);

  // Style dynamique pour les liens actifs
  const navStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-bold" 
        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full">
      
      {/* LOGO SECTION */}
      <div className="p-6 border-b border-gray-50">
        <Link to="/admin" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <Package size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tighter">
            AliShop <span className="text-indigo-600">Admin</span>
          </span>
        </Link>
      </div>

      {/* NAVIGATION PRINCIPALE */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Menu Principal</p>
        
        <NavLink to="/admin/dashboard" className={navStyle}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/categories" className={navStyle}>
          <Layers size={20} />
          <span>Catégories</span>
        </NavLink>

        <NavLink to="/admin/products" className={navStyle}>
          <Package size={20} />
          <span>Produits</span>
        </NavLink>

        {/* Uniquement pour le rôle admin */}
        {user?.role === 'admin' && (
          <NavLink to="/admin/orders" className={navStyle}>
            <ClipboardList size={20} />
            <span>Commandes</span>
          </NavLink>
        )}
      </nav>

      
    </aside>
  );
}