import { useEffect, useState } from "react";
import api from "../Api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);

  // 🔥 FETCH STATS
  useEffect(() => {
    api.get("/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => console.log("Erreur stats"));
  }, []);

  // 🔥 FETCH SALES
  useEffect(() => {
    api.get("/api/admin/stats/sales")
      .then(res => setSales(res.data))
      .catch(() => console.log("Erreur sales"));
  }, []);

  // 🔥 FORMAT SALES DATA
  const salesData = sales.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    total: item.total
  }));

  if (!stats) {
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Chargement du dashboard...
      </p>
    );
  }

  // 🔥 DATA STATUS
  const chartData = [
    { name: "En attente", value: stats.status?.pending || 0, color: "#facc15" },
    { name: "Préparation", value: stats.status?.preparing || 0, color: "#60a5fa" },
    { name: "En livraison", value: stats.status?.shipping || 0, color: "#a78bfa" },
    { name: "Livré", value: stats.status?.delivered || 0, color: "#34d399" },
  ];

  // 🔥 TOOLTIP CUSTOM
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow text-sm">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p>{payload[0].value} commandes</p>
        </div>
      );
    }
    return null;
  };

  const SalesTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow text-sm">
          <p>Date : {payload[0].payload.date}</p>
          <p className="text-indigo-600 font-semibold">
            {payload[0].value} DH
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">

      <h1 className="text-3xl font-bold mb-6">
        📊 Dashboard Admin
      </h1>

      {/* 🔥 CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-xl shadow">
          <h2 className="text-sm opacity-80">Total commandes</h2>
          <p className="text-3xl font-bold mt-2">
            {stats.total_orders}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow">
          <h2 className="text-sm opacity-80">Chiffre d'affaires</h2>
          <p className="text-3xl font-bold mt-2">
            {stats.total_revenue} DH
          </p>
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow">
          <h2 className="text-sm opacity-80">Commandes livrées</h2>
          <p className="text-3xl font-bold mt-2">
            {stats.delivered_orders}
          </p>
        </div>

      </div>

      {/* 🔥 BAR CHART */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">

        <h2 className="mb-4 font-semibold text-lg">
          📦 Commandes par statut
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* 🔥 LINE CHART */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="mb-4 font-semibold text-lg">
          📈 Évolution des ventes
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<SalesTooltip />} />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}