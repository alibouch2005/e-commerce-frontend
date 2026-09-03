import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import toast from "react-hot-toast";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Package, 
  Tag, 
  Loader2,
  Calendar,
  Download
} from "lucide-react";

const toNumber = (value) => Number(value || 0);
const itemLineTotal = (item) => {
  const explicitTotal = toNumber(item?.total_price);
  if (explicitTotal > 0) return explicitTotal;
  return toNumber(item?.price || item?.product?.current_price || item?.product?.price) * toNumber(item?.quantity || 1);
};
const orderSubtotal = (order) => {
  const apiSubtotal = toNumber(order?.items_subtotal);
  if (apiSubtotal > 0) return apiSubtotal;
  return (order?.items || []).reduce((sum, item) => sum + itemLineTotal(item), 0);
};
const orderDiscount = (order) => toNumber(order?.discount_amount);
const orderDeliveryFee = (order) => toNumber(order?.delivery_fee);
const orderGrandTotal = (order) => {
  const apiComputedTotal = toNumber(order?.computed_total);
  if (apiComputedTotal > 0) return apiComputedTotal;

  const subtotal = orderSubtotal(order);
  if (subtotal > 0) return Math.max(0, subtotal - orderDiscount(order)) + orderDeliveryFee(order);

  return toNumber(order?.total_price);
};
const slotLabel = (slot) => ({
  "08_12": "08:00 - 12:00",
  "12_18": "12:00 - 18:00",
  "18_21": "18:00 - 21:00",
}[slot] || "Non precise");

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Dictionnaire de traduction pour les statuts
  const statusTranslations = {
    pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
    preparing: { label: "En préparation", color: "bg-blue-100 text-blue-700" },
    shipping: { label: "En cours de livraison", color: "bg-purple-100 text-purple-700" },
    delivered: { label: "Livré", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Annulé", color: "bg-red-100 text-red-700" },
    refunded: { label: "Remboursee", color: "bg-slate-100 text-slate-700" },
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

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      let reason = "";
      if (["cancelled", "refunded"].includes(status)) {
        reason = window.prompt(status === "refunded" ? "Raison du remboursement ?" : "Raison de l'annulation ?") || "";
      }
      const { data } = await api.put(`/api/admin/orders/${id}/status`, { status, reason });
      setOrder(data.data || data);
      toast.success("Statut mis a jour");
    }
    catch (error) { toast.error(error.response?.data?.message || "Mise à jour impossible"); }
    finally { setUpdating(false); }
  };

  const downloadReceipt = async () => {
    try {
      const response = await api.get(`/api/admin/orders/${id}/receipt`, { responseType: "blob" });
      const file = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-order-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de telecharger le recu");
    }
  };

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

        <div className="flex gap-2">
          <button
            onClick={downloadReceipt}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Download size={18} /> Recu PDF
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Retour
          </button>
        </div>
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
              {order.fulfillment_method === "delivery" && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Disponibilite client</p>
                  <p className="font-medium text-gray-900">{slotLabel(order.delivery_time_slot)}</p>
                </div>
              )}
              {order.cancellation_reason && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-black">Raison annulation</p>
                  <p>{order.cancellation_reason}</p>
                </div>
              )}
              {order.refund_reason && (
                <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                  <p className="font-black">Raison remboursement</p>
                  <p>{order.refund_reason}</p>
                </div>
              )}
              <div className="pt-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${statusTranslations[order.status]?.color || "bg-gray-100"}`}>
                  {statusTranslations[order.status]?.label || order.status}
                </span>
              </div>
              <select disabled={updating} value={order.status} onChange={(e) => changeStatus(e.target.value)} className="w-full border rounded-lg p-2 font-medium">
                <option value="pending">En attente</option><option value="preparing">Préparation</option><option value="shipping">En livraison</option><option value="delivered">Livrée</option><option value="cancelled">Annulée</option><option value="refunded">Remboursee</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUITS */}
        <div className="md:col-span-2 space-y-6">
          {order.fulfillment_method === "delivery" && <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><h2 className="font-bold mb-3">Carte de livraison</h2><DeliveryMap latitude={order.delivery_latitude} longitude={order.delivery_longitude} address={order.adresse_livraison} /></div>}
          {order.fulfillment_method === "pickup" && <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl font-medium">Commande à retirer localement par le client.</div>}
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
          <div className="bg-indigo-600 p-6 rounded-xl shadow-lg text-white flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <div className="space-y-1 text-sm opacity-90">
              <p>Sous-total produits : {orderSubtotal(order).toFixed(2)} DH</p>
              {orderDiscount(order) > 0 && <p>Remise : -{orderDiscount(order).toFixed(2)} DH</p>}
              <p>Livraison : {orderDeliveryFee(order).toFixed(2)} DH</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-medium opacity-90">Total de la commande</span>
              <p className="text-3xl font-black">{orderGrandTotal(order).toFixed(2)} DH</p>
              <p className="text-xs opacity-75">TVA incluse / Paiement à la livraison</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
