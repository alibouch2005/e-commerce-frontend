import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";

export default function Deliveries() {

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchDeliveries = async () => {
    try {
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
      setUpdating(id);

      await api.put(`/api/deliveries/${id}/status`, {
        status
      });

      toast.success("Statut mis à jour ✅");

      fetchDeliveries();

    } catch (err) {
      console.log(err.response?.data);
      toast.error("Erreur update");
    } finally {
      setUpdating(null);
    }
  };

  // 🎨 COULEURS
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
        return "bg-gray-100";
    }
  };

  // 📝 LABELS
  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "En attente";
      case "preparing": return "Préparation";
      case "shipping": return "En livraison";
      case "delivered": return "Livré";
      default: return status;
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">
        🚚 Mes livraisons
      </h1>

      {deliveries.length === 0 && (
        <p className="text-gray-500">Aucune livraison</p>
      )}

      <div className="space-y-4">

        {deliveries.map(d => (

          <div key={d.id} className="bg-white p-5 rounded-xl shadow">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold">
                Commande #{d.order.id}
              </span>

              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(d.status)}`}>
                {getStatusLabel(d.status)}
              </span>
            </div>

            {/* INFOS */}
            <div className="text-sm text-gray-500 mb-3">
              <p>Client : {d.order.user?.name}</p>
              <p>Adresse : {d.order.adresse_livraison}</p>
              <p>Téléphone : {d.order.phone}</p>
            </div>

            {/* PRODUITS */}
            <div className="mb-3">
              {d.order.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{item.price} DH</span>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">

              {d.status === "preparing" && (
                <button
                  onClick={() => updateStatus(d.id, "shipping")}
                  disabled={updating === d.id}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  🚚 En livraison
                </button>
              )}

              {d.status === "shipping" && (
                <button
                  onClick={() => updateStatus(d.id, "delivered")}
                  disabled={updating === d.id}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  ✅ Livré
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}