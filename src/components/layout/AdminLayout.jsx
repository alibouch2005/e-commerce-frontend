import { NavLink, Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col">

        {/* LOGO */}
        <Link
          to="/admin"
          className="p-6 text-xl font-bold text-indigo-600 border-b"
        >
          🛒 AliShop Admin
        </Link>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2">

          <NavLink to="/admin/dashboard" className={navStyle}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/categories" className={navStyle}>
            📂 Catégories
          </NavLink>

          <NavLink to="/admin/products" className={navStyle}>
            📦 Produits
          </NavLink>

          <NavLink to="/admin/orders" className={navStyle}>
            🧾 Commandes
          </NavLink>

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <Link
            to="/"
            className="block text-center bg-gray-200 hover:bg-indigo-500 hover:text-white transition px-4 py-2 rounded-lg"
          >
            ⬅ Retour au site
          </Link>
        </div>

      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">

          <h2 className="font-semibold text-lg">
            Dashboard Admin
          </h2>

          <div className="flex items-center gap-4">
            🔔
            👤 Admin
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

// STYLE
const navStyle = ({ isActive }) =>
  `block px-4 py-2 rounded-lg transition ${
    isActive
      ? "bg-indigo-100 text-indigo-600 font-semibold"
      : "hover:bg-gray-100"
  }`;