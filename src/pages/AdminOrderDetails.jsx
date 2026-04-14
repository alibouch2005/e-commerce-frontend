import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Package, 
  Tag, 
  Loader2,
  Calendar
} from "lucide-react";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dictionnaire de traduction pour les statuts
  const statusTranslations = {
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
    preparing: { label: "En préparation", color: "bg-blue-100 text-blue-700" },
    shipping: { label: "En cours de livraison", color: "bg-purple-100 text-purple-700" },
    delivered: { label: "Livré", color: "bg-green-100 text-green-700" },
    canceled: { label: "Annulé", color: "bg-red-100 text-red-700" },
  };

  useEffect(() => {
    api.get(`/api/admin/orders/${id}`)
      .then(res => {
        setOrder(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="mt-4 text-gray-500">Chargement des détails...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-500 font-bold">Commande introuvable.</p>
        <button onClick={() => navigate("/admin/orders")} className="mt-4 text-indigo-600 underline">
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-indigo-600" /> Commande #{order.id}
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Calendar size={14} /> 
            Passée le {order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "Date inconnue"}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <ArrowLeft size={18} /> Retour
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CLIENT INFO */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-600" /> Client
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Nom</p>
                <p className="font-medium text-gray-900">{order.user?.name || "Client Invité"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                  <Phone size={12} /> Téléphone
                </p>
                <p className="font-medium text-gray-900">{order.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                  <MapPin size={12} /> Adresse
                </p>
                <p className="font-medium text-gray-900 leading-relaxed">
                  {order.adresse_livraison}
                </p>
              </div>
              <div className="pt-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${statusTranslations[order.status]?.color || "bg-gray-100"}`}>
                  {statusTranslations[order.status]?.label || order.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUITS */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
              <Tag size={18} className="text-indigo-600" /> Articles
            </h2>
            <div className="divide-y">
              {order.items.map((item) => {
                // Calcul sécurisé pour éviter le NaN
                const unitPrice = Number(item.price || item.product?.price || 0);
                const quantity = Number(item.quantity || 0);
                const totalPrice = (unitPrice * quantity).toFixed(2);
                 
                return (
                  <div key={item.id} className="py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-100 shadow-sm"
                        />
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                          {quantity}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.product?.category?.name || "Catégorie inconnue"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-medium">
                          Prix Unitaire: {unitPrice} DH
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {totalPrice} DH
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOTAL FINAL */}
          <div className="bg-indigo-600 p-6 rounded-xl shadow-lg text-white flex justify-between items-center">
            <span className="text-lg font-medium opacity-90">Total de la commande</span>
            <div className="text-right">
              <p className="text-3xl font-black">{Number(order.total_price).toFixed(2)} DH</p>
              <p className="text-xs opacity-75">TVA incluse / Paiement à la livraison</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}