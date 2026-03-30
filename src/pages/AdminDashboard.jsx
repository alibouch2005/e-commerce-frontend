import { useEffect, useState } from "react";
import api from "../Api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => console.log("Erreur stats"));
  }, []);

  if (!stats) return <p className="text-center mt-10">Chargement...</p>;

  // 🔥 GRAPH STATUT
  const chartData = [
    { name: "En attente", value: stats.status.pending, color: "#facc15" },
    { name: "Préparation", value: stats.status.preparing, color: "#60a5fa" },
    { name: "Livraison", value: stats.status.shipping, color: "#a78bfa" },
    { name: "Livré", value: stats.status.delivered, color: "#34d399" },
  ];

  // 🔥 GRAPH JOUR
  const ordersPerDay = stats.orders_per_day.map(d => ({
    date: d.date,
    total: d.total
  }));

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">📊 Dashboard Admin</h1>

      {/* 🔥 CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total commandes</h2>
          <p className="text-3xl font-bold text-indigo-600">
            {stats.total_orders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Revenus total</h2>
          <p className="text-3xl font-bold text-green-600">
            {stats.total_revenue} DH
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Commandes livrées</h2>
          <p className="text-3xl font-bold text-green-500">
            {stats.delivered_orders}
          </p>
        </div>

      </div>

      {/* 🔥 GRAPH STATUT */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="mb-4 font-semibold">📦 Commandes par statut</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 GRAPH JOUR */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="mb-4 font-semibold">📈 Commandes par jour</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ordersPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}