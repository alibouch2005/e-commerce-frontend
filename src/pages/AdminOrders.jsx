import { useEffect, useState, useCallback } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Eye,
  UserPlus,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAssign, setLoadingAssign] = useState(null);
  const navigate = useNavigate();

  const statusConfig = {
    pending: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: <Clock size={14} />,
    },
    preparing: {
      label: "Préparation",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <Package size={14} />,
    },
    shipping: {
      label: "Livraison",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <Truck size={14} />,
    },
    delivered: {
      label: "Livré",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: <CheckCircle size={14} />,
    },
    canceled: {
      label: "Annulé",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: <AlertCircle size={14} />,
    },
  };

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, livreursRes] = await Promise.all([
        api.get("/api/admin/orders"),
        api.get("/api/admin/livreurs"),
      ]);
      setOrders(ordersRes.data.data || ordersRes.data || []);
      setLivreurs(livreursRes.data || []);
    } catch (err) {
      console.error("Erreur de chargement:", err);
      toast.error("Impossible de récupérer les données");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CORRECTION : Route d'assignation mise à jour selon ton api.php
  const handleAssign = async (orderId, livreurId) => {
    if (!livreurId) return;
    setLoadingAssign(orderId);
    try {
      await api.post(`/api/admin/orders/${orderId}/assign`, {
        livreur_id: livreurId,
      });
      toast.success("Livreur assigné avec succès 🚚");
      fetchData();
    } catch (err) {
      console.error("Erreur d'assignation:", err);
      toast.error("Erreur lors de l'assignation");
    } finally {
      setLoadingAssign(null);
    }
  };

  // CORRECTION : Route de statut avec préfixe /admin/
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, {
        status: newStatus,
      });
      toast.success("Statut mis à jour ✅");
      fetchData();
    } catch (err) {
      console.error("Erreur de mise à jour:", err);
      toast.error("Erreur de mise à jour");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="mt-4 text-gray-500 font-medium">Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-indigo-600" size={28} />
            Gestion des Commandes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Suivi et assignation AliShop</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm font-semibold text-gray-600">Total: {orders.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">Aucune commande pour le moment.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-800">#{order.id}</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[order.status]?.color || "bg-gray-100 text-gray-600"}`}>
                    {statusConfig[order.status]?.icon || <Clock size={14} />}
                    {(statusConfig[order.status]?.label || order.status).toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="text-indigo-600 font-bold text-base">
                    {order.total_price ?? order.total ?? 0} DH
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={14} />
                    {order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "Date N/A"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                {/* Sélecteur Livreur */}
                <div className="relative min-w-[200px]">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    {loadingAssign === order.id ? (
                      <Loader2 size={16} className="animate-spin text-indigo-500" />
                    ) : (
                      <UserPlus size={16} />
                    )}
                  </div>
                  <select
                    disabled={loadingAssign === order.id}
                    value={order.livreur_id || ""}
                    onChange={(e) => handleAssign(order.id, e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">{order.livreur_id ? "Changer le livreur" : "Assigner un livreur"}</option>
                    {livreurs.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sélecteur Statut */}
                <div className="min-w-[160px]">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                  >
                    {Object.keys(statusConfig).map((key) => (
                      <option key={key} value={key}>
                        {statusConfig[key].label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Eye size={18} />
                  Détails
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}