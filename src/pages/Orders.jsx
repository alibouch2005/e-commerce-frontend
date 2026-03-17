import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import OrdersSkeleton from "../components/orders/OrdersSkeleton";

export default function Orders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = () => {
    setLoading(true);

    api.get(`/api/orders?page=${page}&status=${status}`)
      .then(res => {
        setOrders(res.data.data || res.data);
      })
      .catch(() => {
        toast.error("Erreur chargement commandes");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">📦 Mes commandes</h1>

      {/* 🔍 filtre */}
      <select
        className="mb-4 border p-2 rounded"
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Tous</option>
        <option value="pending">En attente</option>
        <option value="completed">Livré</option>
      </select>

      {/* Orders */}
      <div className="space-y-4">

        {orders.length === 0 && (
          <p className="text-gray-500">Aucune commande</p>
        )}

        {orders.map(order => (

          <div key={order.id} className="bg-white p-5 rounded-xl shadow">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">
                Commande #{order.id}
              </span>

              <span className={`px-3 py-1 rounded-full text-sm 
                ${order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"}
              `}>
                {order.status}
              </span>
            </div>

            {/* Infos */}
            <div className="text-sm text-gray-500 mb-2">
              <p>Paiement : {order.payment_method || "cash 💰"}</p>
              <p>Date : {new Date(order.created_at).toLocaleDateString()}</p>
            </div>

            {/* Total */}
            <div className="text-right font-bold text-lg">
              {order.total} DH
            </div>

          </div>

        ))}

      </div>

      {/* 📄 pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          ←
        </button>

        <span>Page {page}</span>

        <button
          onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          →
        </button>
      </div>

    </div>
  );
}