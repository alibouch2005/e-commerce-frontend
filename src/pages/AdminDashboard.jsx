import { useEffect, useState } from "react";
import api from "../Api/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {

  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => console.log("Erreur stats"));
  }, []);

  if (!stats) return <p className="text-center mt-10">Chargement...</p>;

  const chartData = [
    { name: "En attente", value: stats.status.pending },
    { name: "Preparation", value: stats.status.preparation },
    { name: "Expedie", value: stats.status.expedie },
    { name: "Livre", value: stats.status.livre },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">📊 Dashboard Admin</h1>

      {/* 🔥 CARDS */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total commandes</h2>
          <p className="text-2xl font-bold">{stats.total_orders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Chiffre d'affaires</h2>
          <p className="text-2xl font-bold text-green-600">
            {stats.total_revenue} DH
          </p>
        </div>

      </div>

      {/* 🔥 GRAPH */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="mb-4 font-semibold">Commandes par statut</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}