import { useCallback, useEffect, useMemo, useState } from "react";
import { Camera, CheckCircle2, Handshake, Navigation, PackageCheck, Phone, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../Api/axios";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100 text-blue-700",
  shipping: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-700",
};

const toNumber = (value) => Number(value || 0);
const itemLineTotal = (item) => {
  const explicitTotal = toNumber(item?.total_price);
  if (explicitTotal > 0) return explicitTotal;
  return toNumber(item?.price || item?.product?.current_price || item?.product?.price) * toNumber(item?.quantity || 1);
};
const displayTotal = (order) => Number(order?.computed_total ?? order?.total_price ?? 0).toFixed(2);
const slotLabel = (slot) => ({
  "08_12": "08:00 - 12:00",
  "12_18": "12:00 - 18:00",
  "18_21": "18:00 - 21:00",
}[slot] || "Non precise");

export default function Deliveries() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [orders, setOrders] = useState([]);
  const [proofs, setProofs] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/api/livreur/orders");
      const ordersData = res.data.data || res.data;
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch {
      toast.error(t("deliveryLoadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const activeCount = useMemo(() => orders.filter((order) => order.status !== "delivered").length, [orders]);

  const updateProof = (orderId, key, value) => {
    setProofs((current) => ({
      ...current,
      [orderId]: { ...current[orderId], [key]: value },
    }));
  };

  const handlePhotoChange = (orderId, file) => {
    if (!file) return;
    updateProof(orderId, "proof_image", file);
    updateProof(orderId, "preview", URL.createObjectURL(file));
  };

  const handleUpdateStatus = async (id) => {
    const proof = proofs[id] || {};

    if (!proof.recipient_name || !proof.proof_image) {
      return toast.error(t("proofRequired"));
    }

    try {
      setUpdating(id);
      const payload = new FormData();
      payload.append("status", "delivered");
      payload.append("recipient_name", proof.recipient_name);
      payload.append("proof_image", proof.proof_image);
      if (proof.delivery_note) payload.append("delivery_note", proof.delivery_note);

      await api.post(`/api/livreur/orders/${id}/status?_method=PUT`, payload);
      toast.success(t("deliveryConfirmed"));
      await fetchOrders();
    } catch (err) {
      showApiError(err, t("updateError"));
    } finally {
      setUpdating(null);
    }
  };

  const acceptDelivery = async (id) => {
    try {
      setUpdating(id);
      await api.post(`/api/livreur/orders/${id}/accept`);
      toast.success(t("deliveryAccepted"));
      await fetchOrders();
    } catch (err) {
      showApiError(err, t("deliveryUnavailable"));
      await fetchOrders();
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-gray-500">
        {t("loadingDeliveries")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-gray-950 p-5 text-white sm:p-7">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-200">
            <Truck size={16} /> {t("deliverySpace")}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">{t("myDeliveries")}</h1>
              <p className="mt-2 text-sm text-gray-300">{t("activeDeliveries", { count: activeCount })}</p>
            </div>
            <button onClick={fetchOrders} className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/20">
              {t("refresh")}
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
            {t("noAssignedOrders")}
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const proof = proofs[order.id] || {};
              const isAvailable = !order.livreur_id;
              const mapsUrl = order.delivery_latitude && order.delivery_longitude
                ? `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.adresse_livraison || "")}`;

              return (
                <article key={order.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{t("orderNumber", { id: order.id })}</p>
                      <h2 className="mt-1 text-xl font-black text-gray-950">{order.user?.name || t("client")}</h2>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${isAvailable ? "bg-amber-100 text-amber-700" : statusColor[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {isAvailable ? t("available") : t(order.status) || order.status}
                    </span>
                  </div>

                  <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-4">
                      <div className="grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t("contact")}</p>
                          <a href={order.phone ? `tel:${order.phone}` : undefined} className="mt-2 inline-flex items-center gap-2 font-bold text-indigo-600">
                            <Phone size={17} /> {order.phone || t("phoneUnavailable")}
                          </a>
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t("address")}</p>
                          <p className="mt-2 text-sm text-gray-700">{order.adresse_livraison}</p>
                          <p className="mt-2 text-xs font-black text-indigo-600">{t("deliveryTimeSlot")}: {slotLabel(order.delivery_time_slot)}</p>
                        </div>
                      </div>

                      <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 sm:w-auto">
                        <Navigation size={18} /> {t("openRoute")}
                      </a>

                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">{t("packageContent")}</p>
                        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
                          {order.items?.map((item) => (
                            <div key={item.id} className="flex justify-between gap-4 p-3 text-sm">
                              <span className="min-w-0 text-gray-700">{item.product?.name} x{item.quantity}</span>
                              <span className="shrink-0 font-bold">{itemLineTotal(item).toFixed(2)} DH</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xl font-black text-indigo-600">{t("total")}: {displayTotal(order)} DH</div>
                    </div>

                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-2xl border border-gray-100">
                        <DeliveryMap latitude={order.delivery_latitude} longitude={order.delivery_longitude} address={order.adresse_livraison} />
                      </div>

                      {isAvailable ? (
                        <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                          <p className="text-sm font-bold text-amber-800">
                            {t("missionAvailable")}
                          </p>
                          <button
                            onClick={() => acceptDelivery(order.id)}
                            disabled={updating === order.id}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-4 font-black text-white hover:bg-amber-600 disabled:bg-gray-300"
                          >
                            {updating === order.id ? t("accepting") : <><Handshake size={19} /> {t("acceptDelivery")}</>}
                          </button>
                        </div>
                      ) : order.status !== "delivered" ? (
                        <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <input
                            value={proof.recipient_name || ""}
                            onChange={(event) => updateProof(order.id, "recipient_name", event.target.value)}
                            placeholder={t("receiverName")}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-white p-4 text-center text-indigo-700">
                            <Camera size={24} />
                            <span className="mt-2 text-sm font-black">{t("photoOnSite")}</span>
                            <span className="mt-1 text-xs text-gray-500">{t("cameraOrGallery")}</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={(event) => handlePhotoChange(order.id, event.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                          {proof.preview && <img src={proof.preview} alt="Preuve" className="h-36 w-full rounded-xl object-cover" />}
                          <textarea
                            value={proof.delivery_note || ""}
                            onChange={(event) => updateProof(order.id, "delivery_note", event.target.value)}
                            placeholder={t("deliveryNote")}
                            rows="2"
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleUpdateStatus(order.id)}
                            disabled={updating === order.id}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 font-black text-white hover:bg-emerald-700 disabled:bg-gray-300"
                          >
                            {updating === order.id ? t("processing") : <><PackageCheck size={19} /> {t("confirmDelivery")}</>}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700">
                          <CheckCircle2 size={20} /> {t("deliveryDone")}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
