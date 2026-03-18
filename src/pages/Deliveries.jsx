import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";

export default function Deliveries() {

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/deliveries");

      setDeliveries(res.data.data || res.data);

    } catch {
      toast.error("Erreur chargement livraisons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/deliveries/${id}/status`, { status });

      toast.success("Statut mis à jour 🚚");

      fetchDeliveries();

    } catch {
      toast.error("Erreur mise à jour");
    }
  };

  const statusLabels = {
    pending: "En attente",
    preparing: "Préparation",
    shipping: "En livraison",
    delivered: "Livrée",
  };

  const statusColors = {
    pending: "bg-gray-100 text-gray-700",
    preparing: "bg-yellow-100 text-yellow-700",
    shipping: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
  };

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">
        🚚 Mes livraisons
      </h1>

      <div className="space-y-4">

        {deliveries.length === 0 && (
          <p className="text-gray-500">Aucune livraison</p>
        )}

        {deliveries.map(delivery => (

          <div key={delivery.id} className="bg-white p-5 rounded-xl shadow">

            {/* HEADER */}
            <div className="flex justify-between items-center">

              <span className="font-semibold">
                Commande #{delivery.order_id}
              </span>

              <span className={`px-3 py-1 rounded-full text-sm ${statusColors[delivery.status]}`}>
                {statusLabels[delivery.status]}
              </span>

            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-2 flex-wrap">

              {delivery.status === "preparing" && (
                <button
                  onClick={() => updateStatus(delivery.id, "shipping")}
                  className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
                >
                  🚚 En livraison
                </button>
              )}

              {delivery.status === "shipping" && (
                <button
                  onClick={() => updateStatus(delivery.id, "delivered")}
                  className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700"
                >
                  ✅ Livrée
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}