import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [loadingAssign, setLoadingAssign] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchOrders();
    fetchLivreurs();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/admin/orders");
      setOrders(res.data.data || []);
    } catch {
      toast.error("Erreur chargement commandes");
    }
  };

  const fetchLivreurs = async () => {
    try {
      const res = await api.get("/api/users?role=livreur");
      setLivreurs(res.data);
    } catch {
      toast.error("Erreur chargement livreurs");
    }
  };

  const assignDelivery = async (orderId, livreurId) => {
    if (!livreurId) return;

    try {
      setLoadingAssign(orderId);

      await api.post("/api/deliveries/assign", {
        order_id: orderId,
        livreur_id: livreurId,
      });

      toast.success("Livreur assigné 🚚");

      fetchOrders(); // 🔥 refresh UI
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Erreur assignation");
    } finally {
      setLoadingAssign(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">🧑‍💼 Gestion commandes</h1>

      <div className="space-y-4">
        {orders.length === 0 && (
          <p className="text-gray-500">Aucune commande</p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-xl shadow flex justify-between items-center"
          >
            {/* INFO */}
            <div>
              <p className="font-semibold">Commande #{order.id}</p>

              <p className="text-gray-500">
                {order.total_price ?? order.total ?? 0} DH
              </p>

              <p className="text-sm text-gray-400">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* ACTION */}
            <div className="flex items-center gap-3">
              {/* LOADING */}
              {loadingAssign === order.id && (
                <span className="text-sm text-gray-500">Assignation...</span>
              )}

              {/* SELECT */}
              <select
                disabled={loadingAssign === order.id}
                onChange={(e) => assignDelivery(order.id, e.target.value)}
                className="border p-2 rounded hover:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Choisir livreur</option>

                {livreurs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="bg-indigo-500 text-white px-3 py-1 rounded mt-2"
              >
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
