import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellRing, CheckCheck, MessageCircle, PackageCheck, WalletCards } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";

const notificationIcon = (type) => {
  if (type?.startsWith("cash_")) return { Icon: WalletCards, style: "bg-emerald-50 text-emerald-600" };
  if (type?.startsWith("support")) return { Icon: MessageCircle, style: "bg-sky-50 text-sky-600" };
  return { Icon: PackageCheck, style: "bg-violet-50 text-violet-600" };
};

export default function AdminNotifications() {
  const { notifications, unreadCount, markAllRead, markRead } = useContext(NotificationContext);
  const { t, formatDate } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const closeOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    const closeEscape = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("touchstart", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("touchstart", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  const openNotification = async (notification) => {
    if (!notification.read_at) await markRead(notification.id);
    setOpen(false);
    if (notification.data?.support_message_id) return navigate("/admin/support");
    if (notification.data?.order_id) return navigate(`/admin/orders/${notification.data.order_id}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={t("notifications")} aria-expanded={open} className={`relative grid h-11 w-11 place-items-center rounded-2xl border transition hover:-translate-y-0.5 ${open ? "border-indigo-200 bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "border-gray-100 bg-white text-slate-500 shadow-sm hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"}`}>
        <Bell size={19} />
        {unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[9px] font-black text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>

      {open && (
        <div className="premium-popover fixed left-3 right-3 top-[4.75rem] z-50 overflow-hidden rounded-[1.6rem] border border-white/80 bg-slate-50/95 shadow-[0_30px_90px_rgba(15,23,42,.24)] backdrop-blur-2xl sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[390px]">
          <div className="relative overflow-hidden border-b border-indigo-100 bg-white p-5">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-indigo-200/45 blur-2xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><BellRing size={20} /></span><div className="min-w-0"><b className="block truncate text-sm text-gray-950">Centre de notifications</b><p className="mt-0.5 text-xs text-gray-500">{unreadCount ? `${unreadCount} notification(s) non lue(s)` : "Vous êtes à jour"}</p></div></div>
              {unreadCount > 0 && <button type="button" onClick={() => void markAllRead()} title="Tout marquer comme lu" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"><CheckCheck size={17} /></button>}
            </div>
          </div>
          <div className="admin-premium-scroll max-h-[min(60vh,460px)] space-y-2 overflow-y-auto p-3">
            {notifications.length ? notifications.map((notification) => {
              const { Icon, style } = notificationIcon(notification.type);
              return (
                <button key={notification.id} type="button" onClick={() => void openNotification(notification)} className={`group w-full rounded-2xl border bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${notification.read_at ? "border-gray-100 opacity-75" : "border-indigo-100 ring-1 ring-indigo-50"}`}>
                  <span className="flex items-start gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${style}`}><Icon size={18} /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><b className="block min-w-0 flex-1 truncate text-sm text-gray-900">{notification.title}</b>{!notification.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />}</span><span className="mt-1 line-clamp-2 block text-xs leading-5 text-gray-500">{notification.message}</span><span className="mt-2 block text-[9px] font-black uppercase tracking-wider text-gray-400">{formatDate(notification.created_at)}</span></span></span>
                </button>
              );
            }) : <div className="grid min-h-48 place-items-center p-6 text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-400"><Bell size={23} /></span><b className="mt-3 block text-sm text-gray-700">Aucune notification</b><p className="mt-1 text-xs text-gray-400">Les nouvelles activités apparaîtront ici.</p></div></div>}
          </div>
        </div>
      )}
    </div>
  );
}
