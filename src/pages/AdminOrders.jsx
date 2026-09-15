import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Loader2,
  Package,
  Search,
  Truck,
  UserPlus,
} from "lucide-react";
import api from "../Api/axios";
import { showApiError } from "../utils/showApiError";
import { formatMoney } from "../utils/money";

const statusConfig = {
  pending: { label: "En attente", color: "bg-amber-50 text-amber-700 border-amber-100", icon: Clock },
  preparing: { label: "Préparation", color: "bg-blue-50 text-blue-700 border-blue-100", icon: Package },
  shipping: { label: "Livraison", color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: Truck },
  delivered: { label: "Livrée", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-50 text-red-700 border-red-100", icon: AlertCircle },
  refunded: { label: "Remboursée", color: "bg-slate-100 text-slate-700 border-slate-200", icon: CheckCircle },
};

const displayTotal = (order) => formatMoney(order?.computed_total ?? order?.total_price ?? order?.total);
const deliveryLabel = (order) => order.fulfillment_method === "pickup" ? "Retrait magasin" : "Livraison";
const slotLabel = (slot) => ({
  "08_12": "08:00 - 12:00",
  "12_18": "12:00 - 18:00",
  "18_21": "18:00 - 21:00",
}[slot] || "Non précisé");

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, livreursRes] = await Promise.all([
        api.get("/api/admin/orders", {
          params: {
            page,
            per_page: 20,
            status: status || undefined,
            search: search.trim() || undefined,
          },
        }),
        api.get("/api/admin/livreurs"),
      ]);
      setOrders(ordersRes.data.data || []);
      setMeta(ordersRes.data.meta || {});
      setLivreurs(livreursRes.data || []);
    } catch (error) {
      showApiError(error, "Impossible de récupérer les commandes");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => void loadOrders(), 250);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  const summary = useMemo(() => ({
    total: meta.total || orders.length,
    waiting: orders.filter((order) => order.status === "pending").length,
    delivery: orders.filter((order) => order.status === "shipping").length,
    revenue: orders.reduce((sum, order) => sum + Number(order.computed_total ?? order.total_price ?? 0), 0),
  }), [meta.total, orders]);

  const handleAssign = async (orderId, livreurId) => {
    if (!livreurId) return;
    setLoadingAssign(orderId);
    try {
      await api.post(`/api/admin/orders/${orderId}/assign`, { livreur_id: livreurId });
      toast.success("Livreur assigné avec succès");
      await loadOrders();
    } catch (error) {
      showApiError(error, "Erreur lors de l'assignation");
    } finally {
      setLoadingAssign(null);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    let reason = "";
    if (["cancelled", "refunded"].includes(newStatus)) {
      reason = window.prompt(newStatus === "refunded" ? "Raison du remboursement ?" : "Raison de l'annulation ?") || "";
    }

    setUpdatingStatus(orderId);
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus, reason });
      toast.success("Statut mis à jour");
      await loadOrders();
    } catch (error) {
      showApiError(error, "Erreur de mise à jour");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const exportPDF = async () => {
    try {
      toast.loading("Génération du PDF...", { id: "pdf" });
      const res = await api.get(`/api/admin/orders/export/pdf?date=${selectedDate}`, { responseType: "blob" });
      const file = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-${selectedDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF téléchargé", { id: "pdf" });
    } catch (error) {
      showApiError(error, "Erreur export PDF");
      toast.dismiss("pdf");
    }
  };

  const goToPage = (nextPage) => {
    const lastPage = Math.max(Number(meta.last_page || 1), 1);
    setPage(Math.min(Math.max(Number(nextPage || 1), 1), lastPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest">
              <Package size={16} /> Administration commandes
            </p>
            <h1 className="mt-5 text-3xl font-black sm:text-5xl">Gestion des commandes</h1>
            <p className="mt-3 max-w-2xl text-sm text-indigo-50">
              Suivez les commandes, assignez un livreur, changez le statut et exportez les reçus du jour.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Total" value={summary.total} />
            <Metric label="Attente" value={summary.waiting} />
            <Metric label="Livraison" value={summary.delivery} />
            <Metric label="Page" value={formatMoney(summary.revenue)} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_170px_auto]">
        <label className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Chercher ID, client, téléphone, adresse..."
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </label>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none">
          <option value="">Tous les statuts</option>
          {Object.entries(statusConfig).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>
        <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none" />
        <button onClick={exportPDF} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
          <Download size={18} /> Export PDF
        </button>
      </section>

      {isLoading ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl bg-white text-gray-500">
          <Loader2 className="mb-4 animate-spin text-indigo-600" size={40} />
          Chargement des commandes...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <AlertCircle className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="font-medium text-gray-500">Aucune commande trouvée.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => <OrderCard key={order.id} order={order} livreurs={livreurs} statusConfig={statusConfig} loadingAssign={loadingAssign} updatingStatus={updatingStatus} onAssign={handleAssign} onStatusUpdate={handleStatusUpdate} onDetails={() => navigate(`/admin/orders/${order.id}`)} />)}
        </div>
      )}

      {Number(meta.last_page || 1) > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <button disabled={Number(meta.current_page || page) <= 1} onClick={() => goToPage(1)} className="rounded-xl px-3 py-2 font-black text-gray-500 disabled:opacity-30">«</button>
          <button disabled={Number(meta.current_page || page) <= 1} onClick={() => goToPage(page - 1)} className="rounded-xl border border-gray-200 px-4 py-2 font-bold disabled:opacity-30">Précédent</button>
          <span className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-black text-indigo-700">
            Page {meta.current_page || page} / {meta.last_page || 1}
          </span>
          <button disabled={Number(meta.current_page || page) >= Number(meta.last_page || 1)} onClick={() => goToPage(page + 1)} className="rounded-xl border border-gray-200 px-4 py-2 font-bold disabled:opacity-30">Suivant</button>
          <button disabled={Number(meta.current_page || page) >= Number(meta.last_page || 1)} onClick={() => goToPage(meta.last_page)} className="rounded-xl px-3 py-2 font-black text-gray-500 disabled:opacity-30">»</button>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, livreurs, statusConfig, loadingAssign, updatingStatus, onAssign, onStatusUpdate, onDetails }) {
  const config = statusConfig[order.status] || statusConfig.pending;
  const Icon = config.icon;
  const rankedLivreurs = [...livreurs].sort((first, second) => routeDistance(first, order) - routeDistance(second, order) || Number(first.active_deliveries_count || 0) - Number(second.active_deliveries_count || 0));

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Icon size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-gray-950">Commande #{order.id}</h2>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black ${config.color}`}>
                <Icon size={14} /> {config.label}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>{order.user?.name || "Client"}</span>
              <span>{deliveryLabel(order)}</span>
              <span><Calendar className="mr-1 inline" size={14} />{order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "Date N/A"}</span>
              {order.delivery_time_slot && <span>{slotLabel(order.delivery_time_slot)}</span>}
            </div>
            <p className="mt-2 text-sm text-gray-500">{order.adresse_livraison || "Retrait magasin"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[560px] lg:flex-row lg:items-center lg:justify-end">
          <div className="text-left lg:text-right">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Total</p>
            <p className="text-xl font-black text-indigo-600">{displayTotal(order)}</p>
          </div>

          {order.fulfillment_method === "delivery" && <div className="relative min-w-[190px]">
            <UserPlus className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              disabled={loadingAssign === order.id}
              value={order.livreur_id || ""}
              onChange={(event) => onAssign(order.id, event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">{order.livreur_id ? "Changer livreur" : "Assigner livreur"}</option>
              {rankedLivreurs.map((livreur, index) => <option key={livreur.id} value={livreur.id}>{index === 0 && !order.livreur_id ? "★ Recommandé · " : ""}{livreur.name} · {livreur.active_deliveries_count || 0} active(s){Number.isFinite(routeDistance(livreur, order)) ? ` · ${routeDistance(livreur, order).toFixed(1)} km du trajet` : ""}</option>)}
            </select>
          </div>}

          <select
            disabled={updatingStatus === order.id}
            value={order.status}
            onChange={(event) => onStatusUpdate(order.id, event.target.value)}
            className="min-w-[160px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {Object.entries(statusConfig).filter(([key]) => order.fulfillment_method === "delivery" || key !== "shipping").map(([key, item]) => <option key={key} value={key}>{key === "delivered" && order.fulfillment_method === "pickup" ? "Retirée par le client" : item.label}</option>)}
          </select>

          <button onClick={onDetails} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700">
            <Eye size={18} /> Détails
          </button>
        </div>
      </div>
    </article>
  );
}

function routeDistance(livreur, order) {
  const lat1 = Number(livreur.active_route_latitude);
  const lon1 = Number(livreur.active_route_longitude);
  const lat2 = Number(order.delivery_latitude);
  const lon2 = Number(order.delivery_longitude);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite) || !lat1 || !lat2) return Number.POSITIVE_INFINITY;
  const toRadians = (value) => value * Math.PI / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">
      <p className="truncate text-xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">{label}</p>
    </div>
  );
}
