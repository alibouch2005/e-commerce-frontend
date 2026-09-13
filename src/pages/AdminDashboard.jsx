import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Api/axios";
import { formatMoney } from "../utils/money";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle,
  Crown,
  DollarSign,
  Eye,
  Loader2,
  MapPin,
  MessageSquareText,
  MousePointerClick,
  PackageX,
  PackageSearch,
  ShoppingBag,
  ShoppingCart,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

const COLORS = ["#facc15", "#60a5fa", "#a78bfa", "#22c55e"];
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const assetUrl = (path) => (!path ? "" : path.startsWith("http") ? path : `${apiUrl}${path}`);
const orderStatus = {
  pending: { label: "En attente", className: "bg-amber-50 text-amber-700" },
  preparing: { label: "En préparation", className: "bg-blue-50 text-blue-700" },
  shipping: { label: "En livraison", className: "bg-violet-50 text-violet-700" },
  delivered: { label: "Livrée", className: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Annulée", className: "bg-red-50 text-red-700" },
  refunded: { label: "Remboursée", className: "bg-slate-100 text-slate-700" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStats, resSales, resOrders, resAnalytics] = await Promise.allSettled([
          api.get("/api/admin/stats"),
          api.get("/api/admin/sales-by-day"),
          api.get("/api/admin/orders"),
          api.get("/api/admin/analytics"),
        ]);

        if (resStats.status === "fulfilled") {
          setStats(resStats.value.data);
          setLowStock(resStats.value.data.low_stock_products || []);
        }

        if (resSales.status === "fulfilled") setSales(resSales.value.data);
        if (resAnalytics.status === "fulfilled") setAnalytics(resAnalytics.value.data);
        if (resOrders.status === "fulfilled") {
          const ordersData = resOrders.value.data.data || resOrders.value.data;
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        }
      } catch (err) {
        console.error("Erreur de chargement des données admin", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  const pieData = [
    { name: "En attente", value: stats?.status?.pending || 0 },
    { name: "Préparation", value: stats?.status?.preparing || 0 },
    { name: "Livraison", value: stats?.status?.shipping || 0 },
    { name: "Livrée", value: stats?.status?.delivered || 0 },
  ];
  const monthlyRevenue = stats?.revenue_trends?.monthly || [];
  const yearlyRevenue = stats?.revenue_trends?.yearly || [];

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] space-y-7 bg-gray-50 p-4 sm:p-6 lg:space-y-9">
      <header className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-[0_30px_80px_-35px_rgba(79,70,229,.8)] sm:p-8">
        <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" /><div className="absolute bottom-0 right-1/3 -z-10 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-indigo-200"><Activity size={15} /> Pilotage AliShop</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Tableau de bord</h1><p className="mt-2 max-w-2xl text-sm text-indigo-100">Les performances, alertes et décisions importantes de votre boutique dans une seule vue.</p></div>
        <Link to="/admin/orders" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-indigo-50"><ShoppingBag size={19} /> Mes commandes <ArrowUpRight size={17} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link></div>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <KpiCard icon={<ShoppingBag />} color="indigo" label="Commandes" value={stats?.total_orders || 0} />
        <KpiCard icon={<Users />} color="amber" label="Clients acheteurs" value={`${stats?.customer_conversion?.rate || 0}%`} hint={`${stats?.customer_conversion?.buyers || 0} / ${stats?.customer_conversion?.registered_clients || 0}`} />
        <KpiCard icon={<DollarSign />} color="emerald" label="Revenus" value={formatMoney(stats?.total_revenue)} hint="Commandes livrées" wrap />
        <KpiCard icon={<CheckCircle />} color="purple" label="Livrées" value={stats?.delivered_orders || 0} />
      </div>

      <section className="overflow-hidden rounded-[1.75rem] border border-amber-100 bg-white shadow-[0_22px_60px_-35px_rgba(245,158,11,.45)]">
        <div className="flex flex-col gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="flex items-center gap-2 font-black text-gray-950"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200"><AlertTriangle size={19} /></span> Centre d’attention</h2>
            <p className="mt-1 text-xs text-gray-500">Les éléments qui nécessitent une action de votre équipe aujourd’hui.</p>
          </div>
          <Link to="/admin/issues" className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black">Voir le détail <ArrowUpRight size={16} /></Link>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-5">
          <AttentionCard label="Commandes en attente" value={stats?.admin_attention?.pending_orders || 0} to="/admin/orders" />
          <AttentionCard label="Support urgent" value={stats?.admin_attention?.urgent_support || 0} to="/admin/support" />
          <AttentionCard label="Rupture stock" value={stats?.admin_attention?.out_of_stock || 0} to="/admin/products" />
          <AttentionCard label="Stock faible" value={stats?.admin_attention?.low_stock || 0} to="/admin/products" />
          <AttentionCard label="Remboursements" value={stats?.admin_attention?.refunds || 0} to="/admin/orders" />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <MoneyBreakdown title="Revenus produits" value={formatMoney(stats?.revenue_breakdown?.delivered_products)} color="emerald" />
        <MoneyBreakdown title="Frais livraison encaissés" value={formatMoney(stats?.revenue_breakdown?.delivery_fees)} color="sky" />
        <MoneyBreakdown title="Revenus en cours" value={formatMoney(stats?.revenue_breakdown?.pending_revenue)} color="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueTrendChart
          title="Revenus par mois"
          subtitle="Commandes livrées sur les 12 derniers mois"
          data={monthlyRevenue}
          formatMoney={formatMoney}
        />
        <RevenueTrendChart
          title="Revenus par année"
          subtitle="Vue annuelle des revenus encaissés"
          data={yearlyRevenue}
          formatMoney={formatMoney}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DailyRevenueChart data={sales} />
        <OrderStatusPanel data={pieData} total={stats?.total_orders || 0} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <RecentOrdersPanel orders={orders} />
        <LowStockPanel products={lowStock} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TopCustomersPanel customers={stats?.top_customers || []} />
        <StockHealthPanel summary={stats?.stock_summary || {}} />
      </div>

      <RequestedProductsPanel stats={stats} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MarketingMetric icon={<Activity />} tone="indigo" label="Visiteurs uniques" value={analytics?.visitors || 0} hint={`Sur ${analytics?.days || 30} jours`} />
        <MarketingMetric icon={<Eye />} tone="sky" label="Vues produits" value={analytics?.product_views || 0} hint={`${analytics?.rates?.product_view || 0}% des visiteurs`} />
        <MarketingMetric icon={<ShoppingCart />} tone="amber" label="Ajouts au panier" value={analytics?.add_to_cart || 0} hint={`${analytics?.rates?.cart || 0}% des visiteurs`} />
        <MarketingMetric icon={<Target />} tone="emerald" label="Conversion achat" value={`${analytics?.rates?.purchase || 0}%`} hint={`${analytics?.purchases || 0} achats suivis`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ConversionPanel analytics={analytics} />
        <TopViewedPanel products={analytics?.top_products || []} />
      </div>
    </div>
  );
}

function RequestedProductsPanel({ stats }) {
  const requests = stats?.requested_products || [];
  const open = Number(stats?.open_product_requests || 0);
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-amber-100 bg-white shadow-[0_22px_60px_-35px_rgba(245,158,11,.4)]">
      <div className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white p-5 sm:p-6">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200"><PackageSearch size={22} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-black text-gray-950">Produits demandés à Casablanca</h2>{open > 0 && <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black text-white">{open} à traiter</span>}</div><p className="mt-1 text-xs text-gray-500">Demandes réelles envoyées par vos clients, avec leur photo si disponible.</p></div></div>
          <Link to="/admin/support" className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black">Gérer les demandes <ArrowUpRight size={16} /></Link>
        </div>
      </div>
      <div className="admin-premium-scroll grid max-h-[560px] gap-3 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
        {requests.length ? requests.map((item) => {
          const openRequest = ["open", "in_progress"].includes(item.status);
          return (
            <Link to="/admin/support" key={item.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-950/10">
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-amber-50">
                {item.requested_product_image ? <img src={assetUrl(item.requested_product_image)} alt={item.requested_product_name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <MessageSquareText size={34} className="text-amber-300" />}
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase shadow-sm ${openRequest ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}>{openRequest ? "À traiter" : "Traitée"}</span>
              </div>
              <div className="p-4"><h3 className="truncate font-black text-gray-950">{item.requested_product_name}</h3><div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-700"><MapPin size={13} /> {item.requested_product_city || "Casablanca"}</div><p className="mt-2 line-clamp-2 min-h-9 text-xs leading-5 text-gray-500">{item.message || "Aucune précision supplémentaire."}</p><div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3"><span className="truncate text-xs font-black text-gray-700">{item.name || "Client"}</span><span className="shrink-0 text-[10px] text-gray-400">{formatShortDate(item.created_at)}</span></div></div>
            </Link>
          );
        }) : <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4"><PremiumEmpty icon={<PackageSearch size={26} />} text="Aucune demande produit pour le moment" success /></div>}
      </div>
    </section>
  );
}

function MarketingMetric({ icon, tone, label, value, hint }) {
  const tones = {
    indigo: "from-indigo-600 to-violet-600 shadow-indigo-200",
    sky: "from-sky-500 to-cyan-500 shadow-sky-200",
    amber: "from-amber-500 to-orange-500 shadow-amber-200",
    emerald: "from-emerald-500 to-teal-500 shadow-emerald-200",
  };
  return (
    <article className="group relative overflow-hidden rounded-[1.6rem] border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-5">
      <div className="flex items-center gap-4"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tones[tone]}`}>{icon}</span><div className="min-w-0"><p className="truncate text-xs font-black uppercase tracking-wider text-gray-400">{label}</p><b className="mt-0.5 block text-2xl font-black text-gray-950">{value}</b><p className="truncate text-[11px] font-semibold text-gray-500">{hint}</p></div></div>
    </article>
  );
}

function ConversionPanel({ analytics }) {
  const steps = analytics?.funnel || [];
  const visitors = Math.max(Number(analytics?.visitors || 0), 1);
  const colors = ["from-indigo-500 to-violet-500", "from-sky-500 to-cyan-400", "from-amber-500 to-orange-400", "from-fuchsia-500 to-violet-500", "from-emerald-500 to-teal-400"];
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-white shadow-[0_22px_60px_-35px_rgba(79,70,229,.4)]">
      <div className="flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><MousePointerClick size={21} /></span><div><h2 className="font-black text-gray-950">Tunnel de conversion réel</h2><p className="text-xs text-gray-500">Du premier passage jusqu’à l’achat</p></div></div><span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{analytics?.rates?.purchase || 0}% final</span></div>
      <div className="admin-premium-scroll max-h-[390px] space-y-3 overflow-y-auto p-4 sm:p-5">
        {steps.length ? steps.map((step, index) => {
          const percent = Math.min(100, Math.round((Number(step.value || 0) / visitors) * 100));
          return <div key={step.name} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5"><div className="mb-2 flex items-center gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-black text-white ${colors[index] || colors[0]}`}>{index + 1}</span><b className="min-w-0 flex-1 truncate text-sm text-gray-800">{step.name}</b><span className="text-right"><b className="block text-sm text-gray-950">{step.value}</b><small className="text-[10px] font-bold text-gray-400">{percent}%</small></span></div><div className="h-2 overflow-hidden rounded-full bg-white shadow-inner"><div className={`h-full rounded-full bg-gradient-to-r ${colors[index] || colors[0]}`} style={{ width: `${percent}%` }} /></div></div>;
        }) : <PremiumEmpty icon={<MousePointerClick size={25} />} text="Les données de conversion apparaîtront ici" />}
      </div>
    </section>
  );
}

function TopViewedPanel({ products }) {
  const maximum = Math.max(...products.map((product) => Number(product.views || 0)), 1);
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white shadow-[0_22px_60px_-35px_rgba(14,165,233,.4)]">
      <div className="flex items-center justify-between border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-200"><Eye size={21} /></span><div><h2 className="font-black text-gray-950">Produits les plus consultés</h2><p className="text-xs text-gray-500">Produits qui attirent le plus l’attention</p></div></div><Link to="/admin/products" className="rounded-xl bg-white p-2.5 text-sky-600 shadow-sm ring-1 ring-sky-100"><ArrowUpRight size={18} /></Link></div>
      <div className="admin-premium-scroll max-h-[390px] space-y-2 overflow-y-auto p-3 sm:p-4">
        {products.length ? products.map((product, index) => (
          <div key={product.id} className="group rounded-2xl bg-gray-50/70 p-3 transition hover:bg-white hover:shadow-md"><div className="flex items-center gap-3"><span className="w-5 shrink-0 text-center text-xs font-black text-gray-400">{index + 1}</span><img src={assetUrl(product.image) || "/product-placeholder.svg"} alt="" className="h-11 w-11 shrink-0 rounded-xl bg-white object-cover shadow-sm" /><div className="min-w-0 flex-1"><b className="block truncate text-sm text-gray-950">{product.name}</b><p className="truncate text-[10px] font-bold uppercase tracking-wide text-gray-400">{product.category || "Catalogue"} · stock {product.stock ?? 0}</p></div><span className="shrink-0 rounded-xl bg-sky-50 px-3 py-2 text-xs font-black text-sky-700">{product.views} vues</span></div><div className="ml-8 mt-2 h-1 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" style={{ width: `${Math.max(5, (Number(product.views || 0) / maximum) * 100)}%` }} /></div></div>
        )) : <PremiumEmpty icon={<Eye size={25} />} text="Pas encore de vues produits" />}
      </div>
    </section>
  );
}

function RecentOrdersPanel({ orders }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-indigo-100/80 bg-white shadow-[0_22px_60px_-35px_rgba(79,70,229,.45)] xl:col-span-2">
      <div className="relative overflow-hidden border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 sm:p-6">
        <div className="absolute -right-10 -top-16 h-36 w-36 rounded-full bg-violet-200/40 blur-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200"><ShoppingBag size={20} /></span>
            <div><h2 className="font-black text-gray-950">Commandes récentes</h2><p className="mt-0.5 text-xs text-gray-500">Activité commerciale en temps réel</p></div>
          </div>
          <Link to="/admin/orders" className="group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-black text-indigo-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            Voir toutes <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
      <div className="admin-premium-scroll max-h-[430px] space-y-2 overflow-y-auto p-3 sm:p-4">
        {orders.length === 0 ? <PremiumEmpty icon={<ShoppingBag size={25} />} text="Aucune commande pour le moment" /> : orders.map((order) => {
          const status = orderStatus[order.status] || { label: order.status, className: "bg-gray-100 text-gray-700" };
          return (
            <Link key={order.id} to={`/admin/orders/${order.id}`} className="group grid gap-3 rounded-2xl border border-transparent bg-gray-50/70 p-3.5 transition hover:border-indigo-100 hover:bg-white hover:shadow-lg hover:shadow-indigo-950/5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white font-black text-indigo-600 shadow-sm ring-1 ring-gray-100">{order.id}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><b className="truncate text-sm text-gray-950">Commande {order.id}</b><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${status.className}`}>{status.label}</span></div>
                  <p className="mt-1 truncate text-xs text-gray-500">{order.user?.name || "Client"} · {formatShortDate(order.created_at)} · {order.fulfillment_method === "pickup" ? "Retrait" : "Livraison"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 pl-14 sm:justify-end sm:pl-0"><b className="text-sm text-gray-950">{formatMoney(order.computed_total ?? order.total_price)}</b><ArrowUpRight size={17} className="text-gray-300 transition group-hover:text-indigo-600" /></div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function LowStockPanel({ products }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-rose-100 bg-white shadow-[0_22px_60px_-35px_rgba(244,63,94,.35)]">
      <div className="border-b border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200"><PackageX size={20} /></span><div><h2 className="font-black text-gray-950">Stock à surveiller</h2><p className="text-xs text-gray-500">Moins de 10 unités disponibles</p></div></div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-rose-600 shadow-sm">{products.length}</span>
        </div>
      </div>
      <div className="admin-premium-scroll max-h-[430px] space-y-2 overflow-y-auto p-3 sm:p-4">
        {products.length === 0 ? <PremiumEmpty icon={<CheckCircle size={26} />} text="Tous les stocks sont suffisants" success /> : products.map((product) => {
          const empty = Number(product.stock) <= 0;
          return (
            <Link to="/admin/products" key={product.id} className="group flex items-center gap-3 rounded-2xl border border-transparent bg-gray-50/70 p-3 transition hover:border-rose-100 hover:bg-white hover:shadow-lg hover:shadow-rose-950/5">
              <img src={assetUrl(product.image) || "/product-placeholder.svg"} alt="" className="h-12 w-12 shrink-0 rounded-2xl bg-white object-cover shadow-sm ring-1 ring-gray-100" />
              <div className="min-w-0 flex-1"><b className="block truncate text-sm text-gray-950">{product.name}</b><p className="mt-0.5 truncate text-[11px] font-semibold text-gray-400">{product.category?.name || "Catalogue"}</p></div>
              <div className="text-right"><span className={`inline-flex min-w-9 justify-center rounded-xl px-2.5 py-2 text-xs font-black text-white shadow-sm ${empty ? "bg-rose-600" : "bg-amber-500"}`}>{product.stock}</span><p className={`mt-1 text-[9px] font-black uppercase ${empty ? "text-rose-600" : "text-amber-600"}`}>{empty ? "Rupture" : "Critique"}</p></div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function TopCustomersPanel({ customers }) {
  const maximum = Math.max(...customers.map((customer) => Number(customer.total_spent || 0)), 1);
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-amber-100 bg-white shadow-[0_22px_60px_-35px_rgba(245,158,11,.35)]">
      <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-white p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-200"><Crown size={20} /></span><div><h2 className="font-black text-gray-950">Meilleurs clients</h2><p className="text-xs text-gray-500">Classement selon les commandes livrées</p></div></div>
        <Link to="/admin/users" className="rounded-xl bg-white p-2.5 text-amber-600 shadow-sm ring-1 ring-amber-100 transition hover:-translate-y-0.5"><ArrowUpRight size={18} /></Link>
      </div>
      <div className="admin-premium-scroll max-h-[380px] space-y-2 overflow-y-auto p-3 sm:p-4">
        {customers.length ? customers.map((client, index) => (
          <div key={client.id} className="rounded-2xl bg-gray-50/70 p-3.5 transition hover:bg-white hover:shadow-md">
            <div className="flex items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl font-black ${index === 0 ? "bg-amber-500 text-white" : "bg-white text-gray-500 shadow-sm"}`}>{index === 0 ? <Crown size={18} /> : index + 1}</span><div className="min-w-0 flex-1"><b className="block truncate text-sm text-gray-950">{client.name}</b><p className="truncate text-[11px] text-gray-400">{client.email || `${client.orders_count} commandes`}</p></div><div className="text-right"><b className="text-sm text-gray-950">{formatMoney(client.total_spent)}</b><p className="text-[10px] font-bold text-indigo-500">{client.orders_count} commande(s)</p></div></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.max(6, (Number(client.total_spent || 0) / maximum) * 100)}%` }} /></div>
          </div>
        )) : <PremiumEmpty icon={<UserRound size={25} />} text="Aucune commande livrée" />}
      </div>
    </section>
  );
}

function StockHealthPanel({ summary }) {
  const total = Number(summary.total || 0);
  const healthy = Number(summary.healthy || 0);
  const critical = Number(summary.critical || 0);
  const unavailable = Number(summary.out_of_stock || 0);
  const healthRate = total ? Math.round((healthy / total) * 100) : 100;
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-5 text-white shadow-[0_25px_70px_-35px_rgba(5,150,105,.7)] sm:p-6">
      <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/10 text-emerald-300"><Boxes size={21} /></span><div><h2 className="font-black">Santé du stock</h2><p className="text-xs text-emerald-100/70">Vue globale du catalogue</p></div></div><span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black">{total} produits</span></div>
      <div className="relative mt-7 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.15em] text-emerald-300">Disponibilité</p><b className="mt-1 block text-5xl font-black">{healthRate}%</b></div><TrendingUp className="text-emerald-300" size={34} /></div>
      <div className="relative mt-5 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${healthRate}%` }} /></div>
      <div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3"><StockMetric label="Disponible" value={healthy} color="text-emerald-300" /><StockMetric label="Critique" value={critical} color="text-amber-300" /><StockMetric label="Rupture" value={unavailable} color="text-rose-300" /></div>
    </section>
  );
}

function StockMetric({ label, value, color }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.07] p-3 sm:p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-white/55">{label}</p><b className={`mt-1 block text-2xl font-black ${color}`}>{value}</b></div>;
}

function PremiumEmpty({ icon, text, success = false }) {
  return <div className={`grid min-h-48 place-items-center rounded-2xl border border-dashed p-6 text-center ${success ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-gray-50 text-gray-400"}`}><div><span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm">{icon}</span><p className="text-sm font-bold">{text}</p></div></div>;
}

function formatShortDate(value) {
  if (!value) return "Aujourd’hui";
  return new Intl.DateTimeFormat("fr-MA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function KpiCard({ icon, color, label, value, hint, wrap = false }) {
  const colors = {
    indigo: { icon: "from-indigo-600 to-violet-600 shadow-indigo-200", glow: "bg-indigo-300/20", accent: "text-indigo-600" },
    amber: { icon: "from-amber-500 to-orange-500 shadow-amber-200", glow: "bg-amber-300/20", accent: "text-amber-600" },
    emerald: { icon: "from-emerald-500 to-teal-500 shadow-emerald-200", glow: "bg-emerald-300/20", accent: "text-emerald-600" },
    purple: { icon: "from-violet-600 to-fuchsia-500 shadow-violet-200", glow: "bg-violet-300/20", accent: "text-violet-600" },
  };
  const tone = colors[color] || colors.indigo;

  return (
    <article className="group relative isolate min-h-32 overflow-hidden rounded-[1.6rem] border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute -right-8 -top-10 -z-10 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-125 ${tone.glow}`} />
      <div className="flex h-full items-center gap-4">
        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${tone.icon}`}>{icon}</span>
        <div className="min-w-0 flex-1"><p className="text-[11px] font-black uppercase tracking-[.14em] text-gray-400">{label}</p><h2 className={`${wrap ? "break-words text-xl leading-tight sm:text-2xl" : "text-3xl"} mt-1 font-black text-gray-950`}>{value}</h2>{hint && <p className="mt-1 truncate text-[11px] font-semibold text-gray-500">{hint}</p>}</div>
        <TrendingUp size={17} className={`self-start opacity-50 ${tone.accent}`} />
      </div>
    </article>
  );
}

function MoneyBreakdown({ title, value, color }) {
  const colors = {
    emerald: { card: "border-emerald-100 from-emerald-50 to-white", icon: "bg-emerald-500 shadow-emerald-200", text: "text-emerald-700", iconNode: <DollarSign size={19} /> },
    sky: { card: "border-sky-100 from-sky-50 to-white", icon: "bg-sky-500 shadow-sky-200", text: "text-sky-700", iconNode: <ShoppingBag size={19} /> },
    amber: { card: "border-amber-100 from-amber-50 to-white", icon: "bg-amber-500 shadow-amber-200", text: "text-amber-700", iconNode: <Activity size={19} /> },
  };
  const tone = colors[color] || colors.emerald;

  return (
    <article className={`group flex items-center gap-4 rounded-[1.5rem] border bg-gradient-to-r p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5 ${tone.card}`}><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-lg ${tone.icon}`}>{tone.iconNode}</span><div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-wider text-gray-500">{title}</p><b className={`mt-1 block break-words text-xl font-black sm:text-2xl ${tone.text}`}>{value}</b></div></article>
  );
}

function AttentionCard({ label, value, to }) {
  const hasIssue = Number(value || 0) > 0;

  return (
    <Link to={to} className={`group relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-1 hover:shadow-lg ${hasIssue ? "border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900" : "border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900"}`}>
      <div className="flex items-start justify-between gap-2"><span className={`grid h-8 w-8 place-items-center rounded-xl ${hasIssue ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"}`}>{hasIssue ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}</span><ArrowUpRight size={15} className="opacity-40 transition group-hover:opacity-100" /></div>
      <b className="mt-4 block text-3xl font-black">{value}</b><p className="mt-1 truncate text-[10px] font-black uppercase tracking-wider">{label}</p><span className="mt-2 block text-[10px] font-bold opacity-60">{hasIssue ? "Action requise" : "Aucun problème"}</span>
    </Link>
  );
}

function RevenueTrendChart({ title, subtitle, data, formatMoney }) {
  const total = data.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const orders = data.reduce((sum, item) => sum + Number(item.orders_count || 0), 0);
  const gradientId = title.includes("mois") ? "monthlyProductsRevenue" : "yearlyProductsRevenue";

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-white shadow-[0_22px_60px_-35px_rgba(16,185,129,.4)]">
      <div className="flex flex-col gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 font-black text-gray-950"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white"><DollarSign size={17} /></span>{title}</h2>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-right text-emerald-700 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest">Total</p>
          <b className="block text-lg">{formatMoney(total)}</b>
          <span className="text-xs font-bold">{orders} commande(s)</span>
        </div>
      </div>

      {data.length ? (
        <div className="p-3 sm:p-5"><ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient></defs>
            <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} width={70} />
            <Tooltip
              formatter={(value, name) => {
                const labels = {
                  total: "Revenu total",
                  products_revenue: "Produits",
                  delivery_fees: "Livraison",
                };

                return [formatMoney(value), labels[name] || name];
              }}
              labelFormatter={(label) => `Période : ${label}`}
              contentStyle={{ borderRadius: "16px", border: "1px solid #d1fae5", boxShadow: "0 16px 40px rgb(15 23 42 / 0.12)" }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="products_revenue" name="Produits" stackId="revenue" fill={`url(#${gradientId})`} radius={[7, 7, 0, 0]} maxBarSize={72} />
            <Bar dataKey="delivery_fees" name="Livraison" stackId="revenue" fill="#38bdf8" radius={[7, 7, 0, 0]} maxBarSize={72} />
          </BarChart>
        </ResponsiveContainer></div>
      ) : (
        <div className="m-5 flex h-[260px] items-center justify-center rounded-2xl bg-gray-50 text-sm font-bold text-gray-400">
          Aucun revenu livré pour cette période.
        </div>
      )}
    </section>
  );
}

function DailyRevenueChart({ data }) {
  const total = data.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const latest = data.length ? data[data.length - 1] : null;

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-indigo-100 bg-white shadow-[0_22px_60px_-35px_rgba(79,70,229,.45)]">
      <div className="flex flex-col gap-3 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200"><TrendingUp size={21} /></span>
          <div><h2 className="font-black text-gray-950">Revenus quotidiens</h2><p className="text-xs text-gray-500">Évolution récente des commandes livrées</p></div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2 text-right shadow-sm"><p className="text-[9px] font-black uppercase tracking-wider text-gray-400">Période</p><b className="text-sm text-indigo-700">{formatMoney(total)}</b></div>
          {latest && <div className="rounded-xl bg-indigo-600 px-3 py-2 text-right text-white shadow-lg shadow-indigo-200"><p className="text-[9px] font-black uppercase tracking-wider text-indigo-100">Dernier jour</p><b className="text-sm">{formatMoney(latest.total)}</b></div>}
        </div>
      </div>
      {data.length ? (
        <div className="p-3 sm:p-5"><ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs><linearGradient id="dailyRevenueGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.38} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={25} tick={{ fill: "#9ca3af", fontSize: 10 }} tickFormatter={(value) => formatShortChartDate(value)} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10 }} width={65} />
            <Tooltip formatter={(value) => [formatMoney(value), "Revenu"]} labelFormatter={(value) => `Date : ${formatShortChartDate(value)}`} contentStyle={{ borderRadius: "16px", border: "1px solid #e0e7ff", boxShadow: "0 16px 40px rgb(15 23 42 / 0.12)" }} />
            <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fill="url(#dailyRevenueGradient)" activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 3 }} />
          </AreaChart>
        </ResponsiveContainer></div>
      ) : <div className="m-5 flex h-[260px] items-center justify-center rounded-2xl bg-gray-50 text-sm font-bold text-gray-400">Les revenus quotidiens apparaîtront ici.</div>}
    </section>
  );
}

function OrderStatusPanel({ data, total }) {
  const activeData = data.filter((item) => Number(item.value || 0) > 0);
  const trackedTotal = activeData.reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white shadow-[0_22px_60px_-35px_rgba(124,58,237,.42)]">
      <div className="flex items-center justify-between gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200"><Activity size={21} /></span><div><h2 className="font-black text-gray-950">État des commandes</h2><p className="text-xs text-gray-500">Répartition opérationnelle actuelle</p></div></div>
        <div className="rounded-xl bg-gray-950 px-3 py-2 text-center text-white shadow-lg"><b className="block text-lg leading-none">{total}</b><span className="text-[9px] font-black uppercase tracking-wider text-gray-300">Total</span></div>
      </div>
      {activeData.length ? (
        <div className="grid items-center gap-2 p-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(180px,.85fr)] sm:p-5">
          <div className="relative min-h-[270px]">
            <ResponsiveContainer width="100%" height={270}>
              <PieChart><Pie data={activeData} cx="50%" cy="50%" innerRadius={68} outerRadius={98} paddingAngle={4} dataKey="value" stroke="none">{activeData.map((entry) => <Cell key={entry.name} fill={COLORS[data.findIndex((item) => item.name === entry.name)] || "#6366f1"} />)}</Pie><Tooltip formatter={(value) => [`${value} commande(s)`, "Volume"]} contentStyle={{ borderRadius: "16px", border: "1px solid #ede9fe", boxShadow: "0 16px 40px rgb(15 23 42 / 0.12)" }} /></PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><b className="block text-3xl font-black text-gray-950">{trackedTotal}</b><span className="text-[10px] font-black uppercase tracking-wider text-gray-400">suivies</span></div></div>
          </div>
          <div className="space-y-2">{data.map((item, index) => {
            const percent = trackedTotal ? Math.round((Number(item.value || 0) / trackedTotal) * 100) : 0;
            return <div key={item.name} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3"><span className="h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index] }} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-black text-gray-700">{item.name}</p><p className="text-[10px] font-semibold text-gray-400">{percent}% du suivi</p></div><b className="text-lg text-gray-950">{item.value}</b></div>;
          })}</div>
        </div>
      ) : <div className="m-5 flex h-[260px] items-center justify-center rounded-2xl bg-emerald-50 text-sm font-bold text-emerald-600">Aucune commande active pour le moment.</div>}
    </section>
  );
}

function formatShortChartDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("fr-MA", { day: "2-digit", month: "short" }).format(date);
}
