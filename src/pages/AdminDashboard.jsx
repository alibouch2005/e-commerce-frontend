import { useEffect, useState } from "react";
import api from "../Api/axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";
import { ShoppingBag, DollarSign, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Utilisation de Promise.allSettled pour la robustesse
      const [resStats, resSales, resOrders] = await Promise.allSettled([
        api.get("/api/admin/stats"),
        api.get("/api/admin/sales-by-day"),
        api.get("/api/admin/orders"),
      ]);

      if (resStats.status === "fulfilled") {
        setStats(resStats.value.data);
        // Récupération directe des produits en stock faible depuis les stats
        setLowStock(resStats.value.data.low_stock_products || []);
      }
      
      if (resSales.status === "fulfilled") setSales(resSales.value.data);
      
      if (resOrders.status === "fulfilled") {
        // On prend les 5 dernières commandes
        const ordersData = resOrders.value.data.data || resOrders.value.data;
        setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);
      }

    } catch (err) {
      console.error("Erreur de chargement des données", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  const pieData = [
    { name: "En attente", value: stats?.status?.pending || 0 },
    { name: "Préparation", value: stats?.status?.preparing || 0 },
    { name: "Expédié", value: stats?.status?.shipping || 0 },
    { name: "Livré", value: stats?.status?.delivered || 0 },
  ];

  const COLORS = ["#facc15", "#60a5fa", "#a78bfa", "#22c55e"];

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      
      {/* --- SECTION KPI --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><ShoppingBag /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Commandes</p>
            <h2 className="text-2xl font-bold">{stats?.total_orders || 0}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Revenus</p>
            <h2 className="text-2xl font-bold">{stats?.total_revenue || 0} DH</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><CheckCircle /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Livrées</p>
            <h2 className="text-2xl font-bold">{stats?.delivered_orders || 0}</h2>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* --- GRAPHIQUE REVENUS --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">📈 Revenus par jour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} dot={{r: 4, fill: '#6366f1'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- ÉTAT DES COMMANDES --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-6">🥧 État des commandes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={8}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* --- TABLEAU COMMANDES RÉCENTES --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">📋 Commandes récentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-gray-400">Aucune commande</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-indigo-600">#{order.id}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{order.total_price} DH</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-600">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- ALERTES STOCK FAIBLE --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold mb-6 text-red-500 flex items-center gap-2">
          <AlertTriangle size={20} /> Stock faible {"<"} 5
          </h2>
          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                 <CheckCircle className="text-emerald-400 mb-2" size={30} />
                 <p className="text-gray-400 text-sm">Stocks optimaux</p>
              </div>
            ) : (
              lowStock.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800 truncate w-28">{p.name}</span>
                    <span className="text-[10px] text-red-400 font-bold uppercase">Alerte critique</span>
                  </div>
                  <span className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-sm">
                    {p.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}