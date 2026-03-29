import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import OrdersSkeleton from "../components/orders/OrdersSkeleton";


export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
 

  const fetchOrders = () => {
    setLoading(true);

    api
      .get(`/api/orders?page=${page}`)
      .then((res) => {
        let data = res.data.data || res.data;

        if (status) {
          data = data.filter((o) => o.status === status);
        }

        setOrders(data);
      })
      .catch(() => {
        toast.error("Erreur chargement commandes");
      })
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return isNaN(d) ? "—" : d.toLocaleDateString();
  };

  // 🎨 STYLE + ICON
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "preparing":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "shipping":
        return "bg-purple-100 text-purple-700 border border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "🕒 En attente";
      case "preparing":
        return "⚙️ Préparation";
      case "shipping":
        return "🚚 En livraison";
      case "delivered":
        return "✅ Livré";
      default:
        return status;
    }
  };

  // 🚚 TRACKING
  const DeliveryTracking = ({ status }) => {
    const steps = [
      { key: "pending", label: "Commande reçue" },
      { key: "preparing", label: "Préparation" },
      { key: "shipping", label: "En livraison" },
      { key: "delivered", label: "Livré" },
    ];

    const currentIndex = steps.findIndex((s) => s.key === status);

    return (
      <div className="mt-6">
        <h3 className="font-semibold mb-3">🚚 Suivi de livraison</h3>

        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex-1 text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white transition
                ${index <= currentIndex ? "bg-green-500 scale-110" : "bg-gray-300"}`}
              >
                {index < currentIndex ? "✓" : index + 1}
              </div>

              <p className="text-xs mt-2">{step.label}</p>

              {index < steps.length - 1 && (
                <div
                  className={`h-1 mt-2 
                  ${index < currentIndex ? "bg-green-500" : "bg-gray-300"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">📦 Mes commandes</h1>

      {/* 🔍 FILTRE */}
      <select
        value={status}
        className="mb-4 border p-2 rounded focus:ring-2 focus:ring-indigo-400"
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Tous</option>
        <option value="pending">En attente</option>
        <option value="preparing">Préparation</option>
        <option value="shipping">En livraison</option>
        <option value="delivered">Livré</option>
      </select>

      {/* LISTE */}
      <div className="space-y-4">
        {orders.length === 0 && (
          <p className="text-gray-500">Aucune commande</p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className="bg-white p-5 rounded-xl shadow cursor-pointer hover:shadow-xl hover:scale-[1.01] transition"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Commande #{order.id}</span>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-2">
              <p>Paiement : {order.payment_method || "cash 💰"}</p>
              <p>Date : {formatDate(order.created_at)}</p>
            </div>

            <div className="text-right font-bold text-lg text-indigo-600">
              {order.total_price || order.total || 0} DH
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[450px] animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">
              Commande #{selectedOrder.id}
            </h2>

            {selectedOrder.items?.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>
                  {item.product.name} x{item.quantity}
                </span>
                <span>{(item.total_price || item.price).toFixed(2)} DH</span>
              </div>
            ))}

            <div className="mt-4 font-bold text-right">
              Total : {selectedOrder.total_price} DH
            </div>

            <DeliveryTracking status={selectedOrder.status} />

            

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {/* PAGINATION */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ←
        </button>

        <span>Page {page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          →
        </button>
      </div>
    </div>
  );
}
