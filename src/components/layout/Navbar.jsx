import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { NotificationContext } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { Bell, BellRing, ChevronDown, Heart, Home, Key, LogOut, Menu, MessageCircle, Package, PackageCheck, ShoppingBag, User, WalletCards, X } from "lucide-react";

function NotificationIcon({ type }) {
  const styles = {
    support: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
    cash_settlement: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
    cash_ledger_initialized: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
    delivery: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
  };
  const style = type?.startsWith('cash_')
    ? styles.cash_settlement
    : type?.startsWith('delivery') || type?.startsWith('order')
      ? styles.delivery
      : type?.startsWith('support')
        ? styles.support
        : null;
  const Icon = type?.startsWith('cash_') ? WalletCards : type?.startsWith('delivery') || type?.startsWith('order') ? PackageCheck : type?.startsWith('support') ? MessageCircle : BellRing;

  return <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style || 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'}`}><Icon size={19} /></span>;
}

export default function Navbar() {
  const { user, logoutUser } = useContext(AuthContext);
  const { notifications, unreadCount, markAllRead, markRead } = useContext(NotificationContext);
  const { locale, languages, setLocale, t, formatDate } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef();
  const notificationRef = useRef();
  const mobileMenuRef = useRef();
  const mobileToggleRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const isLivreur = user?.role === "livreur";
  const isClient = user?.role === "client";
  const isAdmin = user?.role === "admin";
  const isAdminPage = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationsOpen(false);
      if (
        mobileMenuRef.current
        && !mobileMenuRef.current.contains(event.target)
        && !mobileToggleRef.current?.contains(event.target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
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
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,.05)] backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex justify-between items-center gap-2 sm:gap-3">
        <Link to={isAdmin ? "/admin/dashboard" : "/"} className="flex shrink-0 items-center gap-1.5 text-lg sm:gap-2 sm:text-2xl font-black tracking-tight text-indigo-600 hover:opacity-80">
          <ShoppingBag className="shrink-0" size={24} />
          <span className="leading-none">AliShop</span>
          {isAdmin && <span className="text-xs bg-red-100 px-2 py-0.5 rounded-md text-red-600">ADMIN</span>}
        </Link>

        <div className="hidden lg:flex items-center gap-7 font-semibold text-gray-600 dark:text-gray-300">
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <select value={locale} onChange={(event) => setLocale(event.target.value)} title={t("language")} className="h-10 w-[62px] rounded-2xl border border-gray-100 bg-gray-50 px-2 text-xs font-black text-gray-700 outline-none transition hover:bg-indigo-50 hover:text-indigo-600 sm:h-11 sm:w-auto sm:px-3 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
            {Object.entries(languages).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          {!isAdmin && !isLivreur && (
            <Link to="/cart" id="cart-icon" title={t("cart")} className="relative hidden h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-600 sm:flex sm:h-11 sm:w-11 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800">
              <ShoppingBag size={20} />
            </Link>
          )}

          {!user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-indigo-600 dark:text-gray-200">{t("login")}</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">{t("register")}</Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setNotificationsOpen((value) => !value)} aria-label={t("notifications")} aria-expanded={notificationsOpen} title={t("notifications")} className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:-translate-y-0.5 sm:h-11 sm:w-11 ${notificationsOpen ? 'border-indigo-200 bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border-gray-100 bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                {notificationsOpen && (
                  <div className="premium-popover fixed left-3 right-3 top-16 z-50 max-h-[78vh] overflow-hidden rounded-[1.75rem] border border-white/80 bg-slate-50/95 shadow-[0_30px_90px_rgba(15,23,42,.24)] backdrop-blur-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[400px] dark:border-gray-700 dark:bg-gray-950/95">
                    <div className="relative overflow-hidden border-b border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-indigo-200/50 blur-2xl dark:bg-indigo-800/20" />
                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"><BellRing size={20} /></span><div className="min-w-0"><b className="block truncate text-gray-950 dark:text-white">{t("notificationCenter")}</b><p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{unreadCount > 0 ? t('unreadNotifications', { count: unreadCount }) : t('notificationSubtitle')}</p></div></div>
                        {unreadCount > 0 && <button onClick={markAllRead} className="shrink-0 rounded-xl bg-indigo-50 px-3 py-2 text-[11px] font-black text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-200">{t("markAllRead")}</button>}
                      </div>
                    </div>
                    <div className="max-h-[60vh] space-y-2 overflow-y-auto p-3">
                      {notifications.length ? notifications.map((notification) => (
                        <article key={notification.id} className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-gray-900 ${notification.read_at ? 'border-gray-100 opacity-80 dark:border-gray-800' : 'border-indigo-100 ring-1 ring-indigo-50 dark:border-indigo-900 dark:ring-indigo-950'}`}>
                          <button onClick={() => openNotification(notification)} className="w-full p-3.5 pe-10 text-start">
                            <div className="flex items-start gap-3">
                              <NotificationIcon type={notification.type} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2"><p className="truncate text-sm font-black text-gray-900 dark:text-gray-100">{notification.title}</p>{!notification.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,.12)]" />}</div>
                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-300">{notification.message}</p>
                                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">{formatDate(notification.created_at)}</p>
                              </div>
                            </div>
                          </button>
                          {!notification.read_at && <button type="button" onClick={() => markRead(notification.id)} aria-label={t('dismissNotification')} title={t('dismissNotification')} className="absolute right-2 top-2 rounded-full p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"><X size={14} /></button>}
                        </article>
                      )) : <div className="p-8 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400 dark:bg-indigo-950"><Bell size={23} /></span><p className="mt-3 text-sm font-bold text-gray-500">{t("noNotifications")}</p></div>}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button onClick={() => setOpen(!open)} className="flex h-10 items-center gap-2 rounded-2xl border border-gray-100 bg-white p-1.5 pr-1.5 transition hover:-translate-y-0.5 hover:bg-indigo-50 sm:h-11 sm:pr-3 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">{user.name.charAt(0).toUpperCase()}</div>
                  <span className="hidden max-w-28 truncate text-sm font-bold text-gray-700 sm:inline">{user.name}</span>
                  <ChevronDown size={14} className={`hidden text-gray-400 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="premium-popover absolute right-0 z-50 mt-3 w-60 rounded-2xl border border-white/80 bg-white/95 py-2 shadow-[0_24px_70px_rgba(15,23,42,.18)] backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/95">
                    <div className="mb-1 border-b border-gray-50 px-4 py-3 dark:border-gray-800"><p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Mon compte</p><p className="truncate text-sm font-bold text-gray-800 dark:text-white">{user.email}</p></div>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800"><User size={16} /> {t("profile")}</Link>
                    <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800"><Key size={16} /> {t("password")}</Link>
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
            ref={mobileToggleRef}
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-700 shadow-sm lg:hidden"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation" ref={mobileMenuRef} className="lg:hidden border-t border-gray-100 bg-white px-4 pb-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
          <div className="grid gap-2 py-3 font-semibold text-gray-700 dark:text-gray-200">
            {(isClient || !user) && (
              <>
                <Link onClick={closeMobile} to="/" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"><Home size={18} /> {t("home")}</Link>
                <Link onClick={closeMobile} to="/products" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"><ShoppingBag size={18} /> {t("products")}</Link>
                <Link onClick={closeMobile} to="/cart" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-900"><ShoppingBag size={18} /> {t("cart")}</Link>
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
                <Link onClick={closeMobile} to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"><User size={18} /> {t('profile')}</Link>
                {isClient && <Link onClick={closeMobile} to="/orders" className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-50"><Package size={18} /> {t('orders')}</Link>}
                <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-bold text-red-500 hover:bg-red-50"><LogOut size={18} /> {t('logout')}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
