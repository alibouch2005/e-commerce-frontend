// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../Admin/AdminSidebar";

import { Bell } from "lucide-react";
import AdminDropdown from "../Admin/AdminDropdown";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center relative z-40">
          <h2 className="font-semibold text-lg">Tableau de Bord</h2>
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-indigo-600 transition relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {/* On appelle notre composant séparé ici */}
            <AdminDropdown />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}