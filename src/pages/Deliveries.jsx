import { useEffect, useState, useCallback } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";

export default function Deliveries() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [orders, setOrders] = useState([]);

  // Récupération des commandes assignées
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/api/livreur/orders");
      console.log("Réponse API:", res.data);
      // IMPORTANT: Avec OrderResource, les données sont dans res.data.data
      const ordersData = res.data.data || res.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Erreur fetch:", err.response || err);
      toast.error("Erreur lors de la récupération des livraisons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id) => {
    try {
      setUpdating(id);
      await api.put(`/api/livreur/orders/${id}/deliver`);
      toast.success("Commande marquée comme livrée ! ✅");
      fetchOrders();
    } catch (err) {
      console.error("Erreur update:", err);
      const message = err.response?.data?.message || "Erreur de mise à jour";
      toast.error(message);
    } finally {
      setUpdating(null);
    }
  };

  // Traduction des statuts en Français
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "EN ATTENTE";
      case "preparing": return "PRÉPARATION";
      case "shipping": return "LIVRAISON EN COURS";
      case "delivered": return "LIVRÉ";
      default: return status?.toUpperCase();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "preparing":
        return "bg-blue-100 text-blue-700";
      case "shipping":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return <div className="text-center mt-10 font-medium">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>🚚</span> Mes livraisons
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">
            Aucune commande ne vous est assignée.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-800">
                  Commande #{order.id}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900 mb-1">
                    Client & Contact
                  </p>
                  <p className="text-gray-700">
                    {order.user?.name || "Client Invité"}
                  </p>
                  <p className="text-indigo-600 font-medium">
                    {order.phone || "Pas de téléphone"}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">
                    Adresse de livraison
                  </p>
                  <p className="text-gray-700">{order.adresse_livraison}</p>
                </div>
              </div>

              {/* SECTION ARTICLES */}
              <div className="mb-4 px-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Contenu du colis
                </p>
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-700">
                      {item.product?.name}{" "}
                      <span className="text-gray-400">x{item.quantity}</span>
                    </span>
                    <span className="font-medium">{item.price} DH</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <div className="text-lg font-bold text-indigo-600">
                  Total: {order.total_price} DH
                </div>

                {order.status !== "delivered" ? (
                  <button
                    onClick={() => handleUpdateStatus(order.id)}
                    disabled={updating === order.id}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-all active:scale-95 disabled:bg-gray-300 flex items-center gap-2"
                  >
                    {updating === order.id && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {updating === order.id
                      ? "Traitement..."
                      : "Confirmer la livraison ✅"}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg">
                    <span>✨</span> Livraison effectuée
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}