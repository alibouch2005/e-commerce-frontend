import { useCallback, useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import OrdersSkeleton from "../components/orders/OrdersSkeleton";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { useLanguage } from "../context/LanguageContext";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const assetUrl = (path) => (!path ? "" : path.startsWith("http") ? path : `${apiUrl}${path}`);
const STORE = { address: "Rue 177, 20202 Casablanca", latitude: 33.55244, longitude: -7.67712 };

function DeliveryTracking({ status }) {
  const { t } = useLanguage();
  const steps = [
    { key: "pending", label: t("received") },
    { key: "preparing", label: t("preparing") },
    { key: "shipping", label: t("delivery") },
    { key: "delivered", label: t("delivered") },
  ];
  const currentIndex = Math.max(0, steps.findIndex((step) => step.key === status));

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-bold">{t("deliveryTracking")}</h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex-1 text-center">
            <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white ${index <= currentIndex ? "bg-indigo-600" : "bg-gray-300"}`}>
              {index < currentIndex ? "✓" : index + 1}
            </div>
            <p className="mt-2 text-xs">{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Orders() {
  const { t, formatDate } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const formatMoney = (value) => new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 2 }).format(Number(value || 0));

  const loadOrders = useCallback(async (active = { current: true }) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders?page=${page}`);
      if (!active.current) return;
      let data = res.data.data || res.data;
      if (status) data = data.filter((order) => order.status === status);
      setOrders(data);
      setMeta(res.data.meta || {});
    } catch {
      if (active.current) toast.error(t("loadOrdersError"));
    } finally {
      if (active.current) setLoading(false);
    }
  }, [page, status, t]);

  useEffect(() => {
    const active = { current: true };
    void loadOrders(active);
    return () => {
      active.current = false;
    };
  }, [loadOrders]);

  const downloadReceipt = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/receipt`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-order-${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("receiptError"));
    }
  };

  if (loading) return <OrdersSkeleton />;

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{t("orderTracking")}</p>
            <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">{t("orders")}</h1>
          </div>
          <select value={status} className="rounded-xl border bg-white p-3 text-base" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">{t("all")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="preparing">{t("preparing")}</option>
            <option value="shipping">{t("shipping")}</option>
            <option value="delivered">{t("delivered")}</option>
          </select>
        </div>

        <div className="space-y-4">
          {orders.length === 0 && <div className="rounded-2xl bg-white p-8 text-gray-500">{t("noOrders")}</div>}
          {orders.map((order) => (
            <button key={order.id} onClick={() => setSelectedOrder(order)} className="w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:shadow-md sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <b>{t("orderNumber", { id: order.id })}</b>
                  <p className="text-sm text-gray-500">{order.fulfillment_method === "pickup" ? t("storePickup") : t("delivery")} · {formatDate(order.created_at, { dateStyle: "medium" })}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-indigo-600">{formatMoney(order.total_price)}</p>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{t(order.status)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-4 sm:rounded-3xl sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">{t("orderNumber", { id: selectedOrder.id })}</h2>
                  <p className="text-sm text-gray-500">{selectedOrder.fulfillment_method === "pickup" ? t("storePickup") : t("homeDelivery")}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="rounded-full bg-gray-100 px-3 py-1">{t("close")}</button>
              </div>

              <div className="mt-6 space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 border-b pb-2">
                    <span className="min-w-0">{item.product.name} x{item.quantity}</span>
                    <b className="shrink-0">{formatMoney(item.total_price || item.price)}</b>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 rounded-2xl bg-gray-50 p-4 text-sm">
                <div className="flex justify-between"><span>{t("deliveryFee")}</span><b>{formatMoney(selectedOrder.delivery_fee)}</b></div>
                {selectedOrder.delivery_distance_km && (
                  <div className="flex justify-between"><span>{t("deliveryDistance")}</span><b>{Number(selectedOrder.delivery_distance_km).toFixed(2)} km</b></div>
                )}
                <div className="flex justify-between text-xl font-black text-indigo-600"><span>{t("total")}</span><span>{formatMoney(selectedOrder.total_price)}</span></div>
              </div>
              <button onClick={() => downloadReceipt(selectedOrder.id)} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700">{t("downloadReceipt")}</button>

              {selectedOrder.fulfillment_method === "pickup" ? (
                <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-indigo-800">
                  <p className="mb-2 font-bold">{t("pickupInStore")}</p>
                  <p className="mb-3 text-sm">{STORE.address}</p>
                  <DeliveryMap latitude={STORE.latitude} longitude={STORE.longitude} address={STORE.address} />
                </div>
              ) : (
                <DeliveryTracking status={selectedOrder.status} />
              )}

              {selectedOrder.delivery?.proof_image && (
                <div className="mt-5 border-t pt-4">
                  <p className="text-sm font-semibold">{t("deliveryProof")}</p>
                  <p className="text-sm text-gray-500">{t("receivedBy", { name: selectedOrder.delivery.recipient_name })}</p>
                  <img src={assetUrl(selectedOrder.delivery.proof_image)} alt={t("deliveryProof")} className="mt-2 h-24 w-36 rounded-lg border object-cover" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="rounded-xl border bg-white px-4 py-3 disabled:opacity-40">{t("previous")}</button>
          <span className="px-3 py-3 sm:px-4">{t("page", { page })}</span>
          <button disabled={meta.last_page && page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="rounded-xl border bg-white px-4 py-3 disabled:opacity-40">{t("next")}</button>
        </div>
      </div>
    </div>
  );
}
