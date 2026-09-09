import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import api from "../Api/axios";
import OrdersSkeleton from "../components/orders/OrdersSkeleton";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const assetUrl = (path) => (!path ? "" : path.startsWith("http") ? path : `${apiUrl}${path}`);
const STORE = { address: "Rue 177, 20202 Casablanca", latitude: 33.55244, longitude: -7.67712 };

const statusStyles = {
  pending: { icon: Clock, color: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  preparing: { icon: Package, color: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  shipping: { icon: Truck, color: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
  delivered: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { icon: AlertCircle, color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  refunded: { icon: CheckCircle2, color: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
};

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
}[slot] || "Non précisé");

function DeliveryTracking({ status, t }) {
  const steps = [
    { key: "pending", label: t("received") },
    { key: "preparing", label: t("preparing") },
    { key: "shipping", label: t("delivery") },
    { key: "delivered", label: t("delivered") },
  ];
  const currentIndex = Math.max(0, steps.findIndex((step) => step.key === status));

  return (
    <div className="mt-6 rounded-2xl bg-gray-50 p-4">
      <h3 className="mb-3 font-black text-gray-950">{t("deliveryTracking")}</h3>
      <div className="flex items-start justify-between">
        {steps.map((step, index) => (
          <div key={step.key} className="flex-1 text-center">
            <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white ${index <= currentIndex ? "bg-indigo-600" : "bg-gray-300"}`}>
              {index < currentIndex ? "✓" : index + 1}
            </div>
            <p className="mt-2 text-[11px] font-bold text-gray-500 sm:text-xs">{step.label}</p>
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
  const closeModalRef = useRef(null);
  const formatMoney = (value) => new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
  const orderTitle = (order) => `Commande ${order?.id ?? ""}`;

  const loadOrders = useCallback(async (active = { current: true }) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/orders?page=${page}`);
      if (!active.current) return;
      let data = res.data.data || res.data;
      if (status) data = data.filter((order) => order.status === status);
      setOrders(data);
      setMeta(res.data.meta || {});
    } catch (error) {
      if (active.current) showApiError(error, t("loadOrdersError"));
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

  useEffect(() => {
    if (!selectedOrder) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedOrder(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    window.requestAnimationFrame(() => closeModalRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedOrder]);

  const downloadReceipt = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/receipt`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt-order-${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showApiError(error, t("receiptError"));
    }
  };

  const cancelOrder = async (orderId) => {
    const reason = window.prompt(`${t("cancelOrder")} — ${t("cancelOnlyPending60")}`);
    if (reason === null) return;
    try {
      const { data } = await api.patch(`/api/orders/${orderId}/cancel`, { reason });
      const updatedOrder = data.data || data;
      setOrders((current) => current.map((order) => (order.id === orderId ? updatedOrder : order)));
      setSelectedOrder(updatedOrder);
      toast.success(t("orderCancelled"));
    } catch (error) {
      showApiError(error, t("checkoutError"));
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
          <select value={status} className="rounded-2xl border border-gray-100 bg-white p-3 text-base font-bold shadow-sm" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">{t("all")}</option>
            <option value="pending">{t("pending")}</option>
            <option value="preparing">{t("preparing")}</option>
            <option value="shipping">{t("shipping")}</option>
            <option value="delivered">{t("delivered")}</option>
            <option value="cancelled">{t("cancelled")}</option>
          </select>
        </div>

        <div className="space-y-4">
          {orders.length === 0 && <div className="rounded-3xl bg-white p-8 text-gray-500 shadow-sm">{t("noOrders")}</div>}
          {orders.map((order) => {
            const config = statusStyles[order.status] || statusStyles.pending;
            const Icon = order.fulfillment_method === "pickup" ? ShoppingBag : config.icon;

            return (
              <button key={order.id} onClick={() => setSelectedOrder(order)} className="group w-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-xl sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon size={24} />
                    <span className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white ${config.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <b className="truncate text-lg text-gray-950">{orderTitle(order)}</b>
                      <ChevronRight className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" size={20} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-500">
                      <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {formatDate(order.created_at, { dateStyle: "medium" })}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={14} /> {order.fulfillment_method === "pickup" ? t("storePickup") : t("delivery")}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${config.color}`}>{t(order.status)}</span>
                      <p className="text-lg font-black text-indigo-600">{formatMoney(orderGrandTotal(order))}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedOrder && (
          <div
            className="premium-popover fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedOrder(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="order-dialog-title"
              className="max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-3xl border border-white/70 bg-white p-4 shadow-[0_32px_100px_rgba(15,23,42,.35)] sm:max-h-[calc(100dvh-2.5rem)] sm:p-6 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="order-dialog-title" className="text-2xl font-black">{orderTitle(selectedOrder)}</h2>
                  <p className="text-sm text-gray-500">{selectedOrder.fulfillment_method === "pickup" ? t("storePickup") : t("homeDelivery")}</p>
                  {selectedOrder.delivery_time_slot && (
                    <p className="mt-1 text-sm font-bold text-indigo-600">{t("deliveryTimeSlot")}: {slotLabel(selectedOrder.delivery_time_slot)}</p>
                  )}
                </div>
                <button ref={closeModalRef} onClick={() => setSelectedOrder(null)} aria-label={t("close")} className="rounded-full bg-gray-100 p-2 text-gray-600 transition hover:rotate-90 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 border-b pb-2">
                    <span className="min-w-0">
                      <span className="block">{item.product?.name || item.product_name || t("product")} x{item.quantity}</span>
                      <OrderOptionLine options={item.selected_options} />
                    </span>
                    <b className="shrink-0">{formatMoney(itemLineTotal(item))}</b>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 rounded-2xl bg-gray-50 p-4 text-sm">
                <div className="flex justify-between"><span>{t("subtotal")}</span><b>{formatMoney(orderSubtotal(selectedOrder))}</b></div>
                {orderDiscount(selectedOrder) > 0 && (
                  <div className="flex justify-between text-emerald-700"><span>{t("coupon")}</span><b>-{formatMoney(orderDiscount(selectedOrder))}</b></div>
                )}
                <div className="flex justify-between"><span>{t("deliveryFee")}</span><b>{formatMoney(orderDeliveryFee(selectedOrder))}</b></div>
                {selectedOrder.delivery_distance_km && (
                  <div className="flex justify-between"><span>{t("deliveryDistance")}</span><b>{Number(selectedOrder.delivery_distance_km).toFixed(2)} km</b></div>
                )}
                <div className="flex justify-between text-xl font-black text-indigo-600"><span>{t("total")}</span><span>{formatMoney(orderGrandTotal(selectedOrder))}</span></div>
              </div>

              {selectedOrder.cancellation_reason && (
                <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                  <p className="font-black">{t("cancelled")}</p>
                  <p className="mt-1">{selectedOrder.cancellation_reason}</p>
                </div>
              )}
              {selectedOrder.refund_reason && (
                <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                  <p className="font-black">{t("refunded")}</p>
                  <p className="mt-1">{selectedOrder.refund_reason}</p>
                </div>
              )}

              <button onClick={() => downloadReceipt(selectedOrder.id)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700">
                <Download size={18} /> {t("downloadReceipt")}
              </button>
              {selectedOrder.can_client_cancel && (
                <button onClick={() => cancelOrder(selectedOrder.id)} className="mt-3 w-full rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 hover:bg-red-100">{t("cancelOrder")}</button>
              )}

              {selectedOrder.fulfillment_method === "pickup" ? (
                <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-indigo-800">
                  <p className="mb-2 font-bold">{t("pickupInStore")}</p>
                  <p className="mb-3 text-sm">{STORE.address}</p>
                  <DeliveryMap latitude={STORE.latitude} longitude={STORE.longitude} address={STORE.address} />
                </div>
              ) : (
                <DeliveryTracking status={selectedOrder.status} t={t} />
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

function OrderOptionLine({ options }) {
  const entries = Object.entries(options || {}).filter(([, value]) => value);
  if (!entries.length) return null;

  return (
    <span className="mt-1 block text-xs font-semibold text-indigo-600">
      {entries.map(([key, value]) => `${variantLabel(key)}: ${value}`).join(" · ")}
    </span>
  );
}

function variantLabel(key) {
  return {
    color: "Couleur",
    size: "Taille",
    weight: "Poids",
    custom: "Option",
  }[key] || key;
}
