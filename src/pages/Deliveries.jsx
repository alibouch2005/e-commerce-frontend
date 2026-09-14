import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Banknote, CalendarClock, ChevronLeft, ChevronRight, MapPin, Navigation, PackageOpen, RefreshCw, Route, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../Api/axios";
import { useLanguage } from "../context/LanguageContext";
import { formatAmount } from "../utils/money";

const slotLabel = (slot) => ({ "08_12": "08:00 – 12:00", "12_18": "12:00 – 18:00", "18_21": "18:00 – 21:00" }[slot] || "Créneau non précisé");
const statusLabel = (status) => ({ pending: "Disponible", preparing: "Disponible", shipping: "En cours", delivered: "Livrée" }[status] || status);
const missionDay = (createdAt) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const daysAgo = Math.round((today - date) / 86400000);
  if (daysAgo === 0) return { label: "Aujourd’hui", urgent: false };
  if (daysAgo === 1) return { label: "Commande d’hier", urgent: true };
  if (daysAgo > 1) return { label: `En attente depuis ${daysAgo} jours`, urgent: true };
  return { label: "À venir", urgent: false };
};

export default function Deliveries() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/livreur/orders", { params: { page } });
      setOrders(Array.isArray(data.data) ? data.data : []);
      setMeta(data.meta || {});
    } catch {
      toast.error(t("deliveryLoadError"));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);
  const filtered = useMemo(() => orders.filter((order) => filter === "available" ? !order.livreur_id : filter === "mine" ? Boolean(order.livreur_id) : true), [filter, orders]);
  const availableCount = orders.filter((order) => !order.livreur_id).length;
  const mineCount = orders.filter((order) => order.livreur_id).length;
  const delayedCount = orders.filter((order) => missionDay(order.created_at)?.urgent).length;

  return <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,.13),transparent_28rem),#f7f8fc] px-3 py-5 sm:px-6 sm:py-9"><div className="mx-auto max-w-6xl space-y-5">
    <header className="relative isolate overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-5 text-white shadow-[0_28px_75px_-32px_rgba(79,70,229,.8)] sm:p-7"><div className="absolute -right-14 -top-20 -z-10 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" /><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-indigo-200"><Truck size={15} /> Espace livreur</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Commandes disponibles</h1><p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">Consultez toutes les missions, vérifiez le trajet puis acceptez librement celle qui vous convient.</p></div><div className="flex gap-2"><Link to="/deliveries/cash" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white shadow-lg hover:bg-emerald-400"><Banknote size={17} /> Ma caisse</Link><button type="button" onClick={() => void fetchOrders()} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10 hover:bg-white/20" aria-label={t("refresh")}><RefreshCw size={18} /></button></div></div></header>
    <section className="grid grid-cols-3 gap-2 sm:gap-3"><Metric label={delayedCount ? `${delayedCount} d’hier / en retard` : "Toutes à jour"} value={orders.length} color="indigo" /><Metric label="Disponibles" value={availableCount} color="amber" /><Metric label="Mes missions" value={mineCount} color="emerald" /></section>
    <div className="flex gap-2 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">{[["all", "Toutes"], ["available", "À accepter"], ["mine", "Mes livraisons"]].map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-10 shrink-0 rounded-xl px-4 text-xs font-black transition ${filter === value ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"}`}>{label}</button>)}</div>
    {loading ? <div role="status" className="grid min-h-64 place-items-center rounded-3xl bg-white text-sm font-bold text-gray-400">Chargement des missions…</div> : filtered.length ? <div className="grid gap-3 md:grid-cols-2">{filtered.map((order) => { const available = !order.livreur_id; return <Link key={order.id} to={`/deliveries/${order.id}`} className="group overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-950/10"><div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-white to-indigo-50/60 p-4"><div className="flex min-w-0 gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${available ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}><PackageOpen size={20} /></span><span className="min-w-0"><b className="block truncate text-sm text-gray-950">Commande {order.id}</b><span className="mt-1 block truncate text-xs text-gray-500">{order.user?.name || "Client"}</span></span></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${available ? "bg-amber-100 text-amber-700" : order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>{statusLabel(order.status)}</span></div><div className="space-y-3 p-4"><div className="flex items-start gap-2 text-sm text-gray-700"><MapPin size={17} className="mt-0.5 shrink-0 text-indigo-500" /><b className="line-clamp-2">{order.adresse_livraison || "Adresse à confirmer"}</b></div><div className="flex flex-wrap gap-2 text-[10px] font-black"><span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 text-gray-600"><CalendarClock size={13} /> {slotLabel(order.delivery_time_slot)}</span>{available && order.route_score != null && <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-2 text-emerald-700"><Route size={13} /> Trajet conseillé</span>}</div><div className="flex items-center justify-between border-t border-gray-100 pt-3"><b className="text-lg text-indigo-700">{formatAmount(order.computed_total ?? order.total_price)} DH</b><span className="inline-flex items-center gap-1 text-xs font-black text-indigo-600">Voir les détails <Navigation size={14} /></span></div></div></Link>; })}</div> : <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-indigo-200 bg-white p-8 text-center"><div><PackageOpen className="mx-auto text-indigo-300" size={38} /><b className="mt-3 block text-gray-800">Aucune mission dans cette liste</b><p className="mt-1 text-sm text-gray-400">Actualisez dans quelques instants.</p></div></div>}
    {Number(meta.last_page || 1) > 1 && <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-3 shadow-sm"><button aria-label="Page précédente" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border p-3 disabled:opacity-30"><ChevronLeft size={18} /></button><b className="px-3 text-sm text-indigo-700">{meta.current_page || page} / {meta.last_page}</b><button aria-label="Page suivante" disabled={page >= Number(meta.last_page)} onClick={() => setPage((value) => value + 1)} className="rounded-xl border p-3 disabled:opacity-30"><ChevronRight size={18} /></button></div>}
  </div></div>;
}

function Metric({ label, value, color }) { const tones = { indigo: "bg-indigo-50 text-indigo-700", amber: "bg-amber-50 text-amber-700", emerald: "bg-emerald-50 text-emerald-700" }; return <div className={`rounded-2xl p-3 text-center sm:p-4 ${tones[color]}`}><b className="block text-2xl font-black">{value}</b><span className="text-[9px] font-black uppercase tracking-wide sm:text-[10px]">{label}</span></div>; }
