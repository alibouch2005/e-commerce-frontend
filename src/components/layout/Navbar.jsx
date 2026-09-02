import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { NotificationContext } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { Bell, ChevronDown, Heart, Home, Key, LogOut, Menu, MessageCircle, Moon, Package, ShoppingBag, Sun, User, X } from "lucide-react";

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { notifications, unreadCount, markAllRead, markRead } = useContext(NotificationContext);
  const { locale, languages, setLocale, t, formatDate } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const isLivreur = user?.role === "livreur";
  const isClient = user?.role === "client";
  const isAdmin = user?.role === "admin";
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setMobileOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const openNotification = async (notification) => {
    await markRead(notification.id);
    const orderId = notification.data?.order_id;
    if (orderId && isClient) navigate("/orders");
    if (notification.data?.support_message_id) navigate(isAdmin ? "/admin/support" : "/support");
    setNotificationsOpen(false);
  };

  if (isAdminPage) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center gap-3">
        <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex min-w-0 items-center gap-2 text-xl sm:text-2xl font-black tracking-tight text-indigo-600 hover:opacity-80">
          <ShoppingBag size={26} /> AliShop
          {isAdmin && <span className="text-xs bg-red-100 px-2 py-0.5 rounded-md text-red-600">ADMIN</span>}
        </Link>

        <div className="hidden md:flex items-center gap-7 font-semibold text-gray-600 dark:text-gray-300">
          {(isClient || !user) && (
            <>
              <Link to="/" className="flex items-center gap-2 hover:text-indigo-600"><Home size={16} /> {t("home")}</Link>
              <Link to="/products" className="hover:text-indigo-600">{t("products")}</Link>
              {isClient && <Link to="/favorites" className="flex items-center gap-2 hover:text-indigo-600"><Heart size={16} /> {t("favorites")}</Link>}
              <Link to="/support" className="flex items-center gap-2 hover:text-indigo-600"><MessageCircle size={16} /> {t("support")}</Link>
            </>
          )}
          {isLivreur && <Link to="/deliveries" className="flex items-center gap-2 text-indigo-600 font-bold"><Package size={18} /> {t("deliveries")}</Link>}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={toggleTheme} title={t("theme")} className="rounded-2xl border border-gray-100 bg-gray-50 p-2 text-gray-500 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <select value={locale} onChange={(event) => setLocale(event.target.value)} title={t("language")} className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-black text-gray-700 outline-none transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            {Object.entries(languages).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          {!isAdmin && !isLivreur && (
            <Link to="/cart" id="cart-icon" className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full dark:text-gray-300 dark:hover:bg-gray-900">
              <ShoppingBag size={22} />
              {cart?.item_count > 0 && <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.item_count}</span>}
            </Link>
          )}

          {!user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 dark:text-gray-200">{t("login")}</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">{t("register")}</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setNotificationsOpen((value) => !value)} title={t("notifications")} className="relative p-2 text-gray-400 hover:text-indigo-600 dark:text-gray-300">
                  <Bell size={22} />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white" />}
                </button>
                {notificationsOpen && (
                  <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80 max-h-[75vh] sm:max-h-96 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 dark:border-gray-800 dark:bg-gray-900">
                    <div className="p-4 border-b flex justify-between items-center dark:border-gray-800"><b className="dark:text-white">{t("notifications")}</b>{unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-indigo-600 font-bold">{t("markAllRead")}</button>}</div>
                    {notifications.length ? notifications.map((notification) => (
                      <button key={notification.id} onClick={() => openNotification(notification)} className={`w-full border-b p-4 text-left transition last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${notification.read_at ? "" : "bg-indigo-50/70 dark:bg-indigo-950/30"}`}>
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read_at ? "bg-gray-300" : "bg-red-500"}`} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-gray-800 dark:text-gray-100">{notification.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-300">{notification.message}</p>
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">{formatDate(notification.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    )) : <p className="p-6 text-sm text-gray-400 text-center">{t("noNotifications")}</p>}
                  </div>
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-gray-50 p-1.5 pr-3 rounded-full hover:bg-gray-100 border border-gray-100">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="text-sm font-bold text-gray-700 hidden sm:inline">{user.name}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1"><p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Mon compte</p><p className="text-sm font-bold text-gray-800 truncate">{user.email}</p></div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"><User size={16} /> {t("profile")}</Link>
                    <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"><Key size={16} /> {t("password")}</Link>
                    {isClient && (
                      <>
                        <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"><Package size={16} /> {t("orders")}</Link>
                        <Link to="/favorites" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"><Heart size={16} /> {t("favorites")}</Link>
                        <Link to="/support" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"><MessageCircle size={16} /> {t("support")}</Link>
                      </>
                    )}
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-bold"><LogOut size={16} /> {t("logout")}</button>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="md:hidden rounded-xl border border-gray-100 bg-gray-50 p-2 text-gray-700"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
          <div className="grid gap-2 py-3 font-semibold text-gray-700 dark:text-gray-200">
            {(isClient || !user) && (
              <>
                <Link onClick={closeMobile} to="/" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"><Home size={18} /> {t("home")}</Link>
                <Link onClick={closeMobile} to="/products" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"><ShoppingBag size={18} /> {t("products")}</Link>
                {isClient && <Link onClick={closeMobile} to="/favorites" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"><Heart size={18} /> {t("favorites")}</Link>}
                <Link onClick={closeMobile} to="/support" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"><MessageCircle size={18} /> {t("support")}</Link>
              </>
            )}
            {isLivreur && <Link onClick={closeMobile} to="/deliveries" className="flex items-center gap-3 rounded-xl px-3 py-3 text-indigo-600"><Package size={18} /> {t("deliveries")}</Link>}
            {!user ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link onClick={closeMobile} to="/login" className="rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-bold dark:border-gray-800">{t("login")}</Link>
                <Link onClick={closeMobile} to="/register" className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white">{t("register")}</Link>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-3">
                <Link onClick={closeMobile} to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"><User size={18} /> Mon profil</Link>
                {isClient && <Link onClick={closeMobile} to="/orders" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"><Package size={18} /> Mes commandes</Link>}
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-bold text-red-500 hover:bg-red-50"><LogOut size={18} /> Deconnexion</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
