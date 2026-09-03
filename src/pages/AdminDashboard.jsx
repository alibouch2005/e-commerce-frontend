import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Api/axios";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Loader2,
  PackageSearch,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

const COLORS = ["#facc15", "#60a5fa", "#a78bfa", "#22c55e"];
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const assetUrl = (path) => (!path ? "" : path.startsWith("http") ? path : `${apiUrl}${path}`);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [deliverySettings, setDeliverySettings] = useState({ free_delivery_enabled: false, free_delivery_minimum: 0 });
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatMoney = (value) => new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStats, resSales, resOrders, resAnalytics, resSettings] = await Promise.allSettled([
          api.get("/api/admin/stats"),
          api.get("/api/admin/sales-by-day"),
          api.get("/api/admin/orders"),
          api.get("/api/admin/analytics"),
          api.get("/api/admin/settings"),
        ]);

        if (resStats.status === "fulfilled") {
          setStats(resStats.value.data);
          setLowStock(resStats.value.data.low_stock_products || []);
        }

        if (resSales.status === "fulfilled") setSales(resSales.value.data);
        if (resAnalytics.status === "fulfilled") setAnalytics(resAnalytics.value.data);
        if (resSettings.status === "fulfilled") {
          setDeliverySettings(resSettings.value.data.delivery || { free_delivery_enabled: false, free_delivery_minimum: 0 });
        }

        if (resOrders.status === "fulfilled") {
          const ordersData = resOrders.value.data.data || resOrders.value.data;
          setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
        }
      } catch (err) {
        console.error("Erreur de chargement des données admin", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const saveDeliverySettings = async () => {
    setSavingDelivery(true);
    try {
      const { data } = await api.put("/api/admin/settings/delivery", deliverySettings);
      setDeliverySettings(data.delivery);
      toast.success("Réglage livraison enregistré");
    } catch {
      toast.error("Impossible d'enregistrer la livraison");
    } finally {
      setSavingDelivery(false);
    }
  };

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
    <div className="min-h-screen space-y-8 bg-gray-50 p-4 sm:p-6 lg:space-y-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
        <KpiCard icon={<ShoppingBag />} color="indigo" label="Commandes" value={stats?.total_orders || 0} />
        <KpiCard icon={<Users />} color="amber" label="Clients acheteurs" value={`${stats?.customer_conversion?.rate || 0}%`} hint={`${stats?.customer_conversion?.buyers || 0} / ${stats?.customer_conversion?.registered_clients || 0}`} />
        <KpiCard icon={<DollarSign />} color="emerald" label="Revenus" value={formatMoney(stats?.total_revenue)} hint="Commandes livrées" wrap />
        <KpiCard icon={<CheckCircle />} color="purple" label="Livrées" value={stats?.delivered_orders || 0} />
      </div>

      <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-black text-gray-950"><AlertTriangle className="text-amber-500" /> Problèmes à traiter</h2>
            <p className="text-sm text-gray-500">Vue rapide pour gérer ce qui bloque la boutique aujourd'hui.</p>
          </div>
          <Link to="/admin/orders" className="w-fit rounded-xl bg-amber-500 px-4 py-2 text-sm font-black text-white hover:bg-amber-600">Voir commandes</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <AttentionCard label="Commandes en attente" value={stats?.admin_attention?.pending_orders || 0} to="/admin/orders" />
          <AttentionCard label="Support urgent" value={stats?.admin_attention?.urgent_support || 0} to="/admin/support" />
          <AttentionCard label="Rupture stock" value={stats?.admin_attention?.out_of_stock || 0} to="/admin/products" />
          <AttentionCard label="Stock faible" value={stats?.admin_attention?.low_stock || 0} to="/admin/products" />
          <AttentionCard label="Remboursements" value={stats?.admin_attention?.refunds || 0} to="/admin/orders" />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <MoneyBreakdown title="Revenus produits" value={formatMoney(stats?.revenue_breakdown?.delivered_products)} color="emerald" />
        <MoneyBreakdown title="Frais livraison encaissés" value={formatMoney(stats?.revenue_breakdown?.delivery_fees)} color="sky" />
        <MoneyBreakdown title="Revenus en cours" value={formatMoney(stats?.revenue_breakdown?.pending_revenue)} color="amber" />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
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

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-black text-gray-950">Réglage livraison globale</h2>
            <p className="text-sm text-gray-500">Option globale par minimum panier. Pour une livraison gratuite par produit, utilisez Admin &gt; Produits.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[auto_180px_auto] sm:items-center">
            <label className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={deliverySettings.free_delivery_enabled}
                onChange={(event) => setDeliverySettings((current) => ({ ...current, free_delivery_enabled: event.target.checked }))}
                className="h-5 w-5 accent-indigo-600"
              />
              Livraison gratuite
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={deliverySettings.free_delivery_minimum}
              onChange={(event) => setDeliverySettings((current) => ({ ...current, free_delivery_minimum: event.target.value }))}
              placeholder="Minimum DH"
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={saveDeliverySettings} disabled={savingDelivery} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white hover:bg-indigo-700 disabled:bg-gray-300">
              {savingDelivery ? "..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-6 font-bold text-gray-800">Revenus par jour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }} width={70} />
              <Tooltip formatter={(value) => [formatMoney(value), "Revenus"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)" }} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-6 font-bold text-gray-800">État des commandes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={8}>
                {pieData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} stroke="none" />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-50 p-5 sm:p-6">
            <h2 className="font-bold text-gray-800">Commandes récentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-400">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0 ? (
                  <tr><td colSpan="3" className="py-10 text-center text-gray-400">Aucune commande</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-indigo-600">#{order.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{formatMoney(order.computed_total ?? order.total_price)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase text-gray-600">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-6 flex items-center gap-2 font-bold text-red-500"><AlertTriangle size={20} /> Stock faible {"<"} 10</h2>
          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <CheckCircle className="mb-2 text-emerald-400" size={30} />
                <p className="text-sm text-gray-400">Stocks optimaux</p>
              </div>
            ) : lowStock.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="min-w-0">
                  <span className="block truncate text-sm font-bold text-gray-800">{product.name}</span>
                  <span className="text-[10px] font-bold uppercase text-red-400">Alerte critique</span>
                </div>
                <span className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-black text-white shadow-sm">{product.stock}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-bold">Clients les plus actifs</h2>
          {stats?.top_customers?.length ? stats.top_customers.map((client) => (
            <div key={client.id} className="flex justify-between gap-4 border-b py-3 last:border-0">
              <span className="min-w-0">
                <b className="block truncate">{client.name}</b>
                <small className="block text-gray-400">{client.orders_count} commandes</small>
              </span>
              <b className="shrink-0">{formatMoney(client.total_spent)}</b>
            </div>
          )) : <p className="text-gray-400">Aucune commande livrée.</p>}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-bold">Santé du stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-red-50 p-5 text-red-700"><p className="text-sm">Rupture</p><b className="text-3xl">{stats?.stock_summary?.out_of_stock || 0}</b></div>
            <div className="rounded-xl bg-amber-50 p-5 text-amber-700"><p className="text-sm">Critique (1-9)</p><b className="text-3xl">{stats?.stock_summary?.critical || 0}</b></div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-bold"><PackageSearch className="text-amber-500" /> Produits demandés à Casablanca</h2>
            <p className="text-sm text-gray-500">{stats?.open_product_requests || 0} demande(s) ouverte(s), {stats?.product_requests_count || 0} au total</p>
          </div>
          <span className="w-fit rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">Demandes clients uniquement</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats?.requested_products?.length ? stats.requested_products.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-amber-100 bg-amber-50">
              {item.requested_product_image && (
                <img src={assetUrl(item.requested_product_image)} alt={item.requested_product_name} className="h-32 w-full object-cover" />
              )}
              <div className="p-4">
                <p className="truncate font-black text-gray-950">{item.requested_product_name}</p>
                <p className="mt-1 text-sm font-bold text-amber-700">{item.name} · {item.requested_product_city || "Casablanca"}</p>
                <p className="mt-2 line-clamp-2 text-xs text-gray-600">{item.message}</p>
                <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-gray-600">{item.status}</span>
              </div>
            </article>
          )) : <p className="text-gray-400">Aucune demande produit pour le moment.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-black text-gray-950"><TrendingUp className="text-indigo-600" /> Recherche marché terrain — Casablanca</h2>
            <p className="text-sm text-gray-500">Liste tendances e-commerce Maroc uniquement, avec score dynamique selon la période.</p>
          </div>
          <Link to="/admin/wini-products" className="w-fit rounded-full bg-indigo-600 px-4 py-2 text-sm font-black text-white hover:bg-indigo-700">Ouvrir Wini product</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(stats?.market_suggestions || []).slice(0, 3).map((item) => (
            <article key={`${item.name}-${item.source}`} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-black text-gray-950">{item.name}</h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wide text-indigo-600">{item.category}</p>
                </div>
                <span className="rounded-xl bg-white px-3 py-2 text-sm font-black text-gray-800">{item.score}/100</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{item.reason}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{item.priority}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">{item.source}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">MAJ {item.updated_at}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        <AnalyticsCard title="Visiteurs 30j" value={analytics?.visitors || 0} />
        <AnalyticsCard title="Vues produits" value={analytics?.product_views || 0} hint={`${analytics?.rates?.product_view || 0}% des visiteurs`} />
        <AnalyticsCard title="Ajouts panier" value={analytics?.add_to_cart || 0} hint={`${analytics?.rates?.cart || 0}% des visiteurs`} />
        <AnalyticsCard title="Conversion achat" value={`${analytics?.rates?.purchase || 0}%`} hint={`${analytics?.purchases || 0} achats suivis`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-bold">Tunnel de conversion réel</h2>
          <div className="space-y-3">
            {(analytics?.funnel || []).map((step) => (
              <div key={step.name}>
                <div className="mb-1 flex justify-between text-sm"><span>{step.name}</span><b>{step.value}</b></div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full bg-indigo-600" style={{ width: `${analytics?.visitors ? Math.min((step.value / analytics.visitors) * 100, 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-4 font-bold">Produits les plus consultés</h2>
          <div className="space-y-3">
            {analytics?.top_products?.length ? analytics.top_products.map((product) => (
              <div key={product.id} className="flex justify-between gap-4 border-b border-gray-100 py-2 last:border-0">
                <span className="min-w-0 truncate font-medium">{product.name}</span>
                <b className="shrink-0">{product.views} vues</b>
              </div>
            )) : <p className="text-gray-400">Pas encore de vues produits.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({ icon, color, label, value, hint, wrap = false }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="flex items-center gap-5 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`rounded-xl p-4 ${colors[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h2 className={`${wrap ? "break-words text-xl leading-tight sm:text-2xl" : "text-2xl"} font-black text-gray-950`}>{value}</h2>
        {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}

function MoneyBreakdown({ title, value, color }) {
  const colors = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-800",
    sky: "border-sky-100 bg-sky-50 text-sky-800",
    amber: "border-amber-100 bg-amber-50 text-amber-800",
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-sm font-bold">{title}</p>
      <b className="mt-1 block break-words text-2xl">{value}</b>
    </div>
  );
}

function AttentionCard({ label, value, to }) {
  const hasIssue = Number(value || 0) > 0;

  return (
    <Link
      to={to}
      className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
        hasIssue ? "border-amber-100 bg-amber-50 text-amber-800" : "border-emerald-100 bg-emerald-50 text-emerald-800"
      }`}
    >
      <p className="text-xs font-black uppercase tracking-widest">{label}</p>
      <b className="mt-2 block text-3xl font-black">{value}</b>
      <span className="mt-1 block text-xs font-bold">{hasIssue ? "A traiter" : "OK"}</span>
    </Link>
  );
}

function RevenueTrendChart({ title, subtitle, data, formatMoney }) {
  const total = data.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const orders = data.reduce((sum, item) => sum + Number(item.orders_count || 0), 0);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-black text-gray-950">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right text-emerald-700">
          <p className="text-xs font-black uppercase tracking-widest">Total</p>
          <b className="block text-lg">{formatMoney(total)}</b>
          <span className="text-xs font-bold">{orders} commande(s)</span>
        </div>
      </div>

      {data.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)" }}
            />
            <Legend />
            <Bar dataKey="products_revenue" name="Produits" stackId="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="delivery_fees" name="Livraison" stackId="revenue" fill="#38bdf8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[300px] items-center justify-center rounded-2xl bg-gray-50 text-sm font-bold text-gray-400">
          Aucun revenu livré pour cette période.
        </div>
      )}
    </section>
  );
}

function AnalyticsCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
