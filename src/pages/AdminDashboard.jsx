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
      // Utilisation de Promise.allSettled pour que si une requête échoue (404), le reste s'affiche quand même
      const [resStats, resSales, resOrders, resProducts] = await Promise.allSettled([
        api.get("/api/admin/stats"),
        api.get("/api/admin/sales-by-day"),
        api.get("/api/admin/orders"),
        api.get("/api/admin/products"),
      ]);

      if (resStats.status === "fulfilled") setStats(resStats.value.data);
      if (resSales.status === "fulfilled") setSales(resSales.value.data);
      if (resOrders.status === "fulfilled") setOrders(resOrders.value.data.data?.slice(0, 5) || []);
      
      if (resProducts.status === "fulfilled") {
        const allProds = resProducts.value.data.products || resProducts.value.data.data || [];
        setLowStock(allProds.filter(p => p.stock < 10));
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

  // Sécurisation des données du PieChart
  const pieData = [
    { name: "En attente", value: stats?.status?.pending || 0 },
    { name: "Préparation", value: stats?.status?.preparing || 0 },
    { name: "Expédié", value: stats?.status?.shipping || 0 },
    { name: "Livré", value: stats?.status?.delivered || 0 },
  ];

  const COLORS = ["#facc15", "#60a5fa", "#a78bfa", "#22c55e"];

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      
      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><ShoppingBag /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Commandes</p>
            <h2 className="text-2xl font-bold">{stats?.total_orders || 0}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Revenus</p>
            <h2 className="text-2xl font-bold">{stats?.total_revenue || 0} DH</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><CheckCircle /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Livrées</p>
            <h2 className="text-2xl font-bold">{stats?.delivered_orders || 0}</h2>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* --- GRAPH REVENUS --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-6 flex items-center gap-2">📈 Revenus par jour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} dot={{r: 4}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* --- PIE STATUS --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-6">🥧 État des commandes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={5}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* --- TABLE DERNIÈRES COMMANDES --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">📋 Commandes récentes</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium italic text-indigo-600">#{order.id}</td>
                  <td className="px-6 py-4 font-bold">{order.total_price} DH</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- STOCK ALERT --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold mb-6 text-red-500 flex items-center gap-2">
            <AlertTriangle size={20} /> Stock faible
          </h2>
          <div className="space-y-4">
            {lowStock.length === 0 ? (
              <p className="text-gray-400 text-center py-10">Aucune alerte</p>
            ) : (
              lowStock.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700 truncate w-32">{p.name}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {p.stock} restants
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



      {/* 🔥 GRAPH STATUT */}
      // <div className="bg-white p-6 rounded-xl shadow mb-10">
      //   <h2 className="mb-4 font-semibold">📦 Commandes par statut</h2>

      //   <ResponsiveContainer width="100%" height={300}>
      //     <BarChart data={chartData}>
      //       <XAxis dataKey="name" />
      //       <YAxis />
      //       <Tooltip />
      //       <Bar dataKey="value">
      //         {chartData.map((entry, index) => (
      //           <Cell key={index} fill={entry.color} />
      //         ))}
      //       </Bar>
      //     </BarChart>
      //   </ResponsiveContainer>
      // </div>




//       import { useEffect, useState } from "react";
// import api from "../Api/axios";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
//   ResponsiveContainer, BarChart, Bar, Cell
// } from "recharts";

// export default function AdminDashboard() {
//   const [stats, setStats] = useState({
//     total_orders: 0,
//     total_revenue: 0,
//     delivered_orders: 0,
//     status: { pending: 0, preparing: 0, shipping: 0, delivered: 0 },
//     orders_per_day: [],
//   });

//   useEffect(() => {
//     api.get("/api/admin/stats")
//       .then(res => setStats(res.data))
//       .catch(err => console.error("Erreur stats:", err));
//   }, []);

//   // Préparation des données pour le BarChart (Statuts)
//   const statusData = [
//     { name: "En attente", value: stats.status.pending, color: "#facc15" },
//     { name: "Préparation", value: stats.status.preparing, color: "#60a5fa" },
//     { name: "Livraison", value: stats.status.shipping, color: "#a78bfa" },
//     { name: "Livré", value: stats.status.delivered, color: "#34d399" },
//   ];

//   return (
//     <div className="max-w-6xl mx-auto mt-10 p-6 space-y-10">
//       <h1 className="text-2xl font-bold">📊 Dashboard Admin</h1>

//       {/* CARDS */}
//       <div className="grid md:grid-cols-3 gap-6">
//         <Card title="Total Commandes" value={stats.total_orders} />
//         <Card title="Revenus Total" value={`${stats.total_revenue} DH`} />
//         <Card title="Commandes Livrées" value={stats.delivered_orders} />
//       </div>

//       <div className="grid lg:grid-cols-2 gap-8">
//         {/* GRAPH STATUT */}
//         <div className="bg-white p-6 rounded-xl shadow">
//           <h2 className="font-semibold mb-4 text-gray-700 text-center">📦 Par Statut</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={statusData}>
//               <XAxis dataKey="name" />
//               <YAxis allowDecimals={false} />
//               <Tooltip cursor={{ fill: 'transparent' }} />
//               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
//                 {statusData.map((entry, index) => (
//                   <Cell key={index} fill={entry.color} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* GRAPH ÉVOLUTION */}
//         <div className="bg-white p-6 rounded-xl shadow">
//           <h2 className="font-semibold mb-4 text-gray-700 text-center">📈 Commandes par jour</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={stats.orders_per_day}>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//               <XAxis dataKey="date" />
//               <YAxis allowDecimals={false} />
//               <Tooltip />
//               <Line 
//                 type="monotone" 
//                 dataKey="total" 
//                 stroke="#6366f1" 
//                 strokeWidth={3} 
//                 dot={{ r: 4 }} 
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

// function Card({ title, value }) {
//   return (
//     <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border border-gray-100">
//       <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
//       <p className="text-3xl font-bold text-indigo-600 mt-1">
//         {value || 0}
//       </p>
//     </div>
//   );
// }