import { useEffect, useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../services/analyticsService";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { CreditCard, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { login, register } from "../services/authService";
import { mergeGuestCart } from "../services/cartService";
import { getApiErrorMessages, showApiError } from "../utils/showApiError";
import { getDeliveryQuote, STORE_LOCATION } from "../utils/deliveryPricing";

export default function Checkout() {
  const { cart, reloadCart } = useContext(CartContext);
  const { user, setUser } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    adresse_livraison: user?.address || "",
    phone: user?.phone || "",
    payment_method: "cash_on_delivery",
    fulfillment_method: "delivery",
    coupon_code: "",
    delivery_latitude: null,
    delivery_longitude: null,
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [apiErrors, setApiErrors] = useState([]);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const subtotal = Number(cart?.total || 0);
  const productFreeDelivery = Boolean(cart?.items?.length) && cart.items.every((item) => item.product?.free_delivery);
  const localDeliveryQuote = getDeliveryQuote({
    fulfillmentMethod: form.fulfillment_method,
    latitude: form.delivery_latitude,
    longitude: form.delivery_longitude,
    productFreeDelivery,
  });
  const [serverDeliveryQuote, setServerDeliveryQuote] = useState(null);
  const deliveryQuote = serverDeliveryQuote || localDeliveryQuote;
  const estimatedTotal = subtotal + deliveryQuote.fee;

  useEffect(() => {
    trackEvent("checkout_started", { metadata: { items: cart?.items?.length || 0 } });
  }, [cart?.items?.length]);

  useEffect(() => {
    if (retrySeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setRetrySeconds((seconds) => Math.max(seconds - 1, 0)), 1000);
    return () => window.clearTimeout(timer);
  }, [retrySeconds]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await api.post("/api/delivery/quote", {
          fulfillment_method: form.fulfillment_method,
          delivery_latitude: form.delivery_latitude,
          delivery_longitude: form.delivery_longitude,
          cart_subtotal: subtotal,
          product_free_delivery: productFreeDelivery,
        });

        if (!active) return;
        setServerDeliveryQuote({
          fee: Number(data.delivery_fee || 0),
          distanceKm: data.delivery_distance_km,
          estimated: Boolean(data.is_estimated),
          freeDelivery: Boolean(data.free_delivery),
          freeDeliveryReason: data.free_delivery_reason,
        });
      } catch {
        if (active) setServerDeliveryQuote(null);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form.fulfillment_method, form.delivery_latitude, form.delivery_longitude, subtotal, productFreeDelivery]);

  const changeFulfillmentMethod = (fulfillment_method) => {
    setForm((current) => ({
      ...current,
      fulfillment_method,
      adresse_livraison: fulfillment_method === "pickup" ? "" : current.adresse_livraison,
      delivery_latitude: fulfillment_method === "pickup" ? null : current.delivery_latitude,
      delivery_longitude: fulfillment_method === "pickup" ? null : current.delivery_longitude,
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error(t("geolocationUnsupported"));
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          delivery_latitude: coords.latitude,
          delivery_longitude: coords.longitude,
        }));
        setLocating(false);
        toast.success(t("savedLocation"));
      },
      () => {
        setLocating(false);
        toast.error(t("locationError"));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold">{t("emptyCart")}</h2>
        <button onClick={() => navigate("/products")} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">
          {t("seeProducts")}
        </button>
      </div>
    );
  }

  const submitCmiPayment = (payment) => {
    const formElement = document.createElement("form");
    formElement.method = payment.method || "POST";
    formElement.action = payment.gateway_url;
    formElement.style.display = "none";

    Object.entries(payment.fields || {}).forEach(([name, value]) => {
      if (value === null || value === undefined) return;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      formElement.appendChild(input);
    });

    document.body.appendChild(formElement);
    formElement.submit();
  };

  const authenticateInline = async () => {
    if (user?.role === "client") return true;
    if (user) {
      setApiErrors([t("customerOnlyCheckout")]);
      toast.error(t("customerOnlyCheckout"));
      return false;
    }

    if (!authForm.email || !authForm.password) {
      setApiErrors([t("authRequiredCheckout")]);
      toast.error(t("authRequiredCheckout"));
      return false;
    }

    if (authMode === "register") {
      if (!authForm.name) {
        const message = `${t("name")}: ${t("fieldRequired")}`;
        setApiErrors([message]);
        toast.error(message);
        return false;
      }
      if (authForm.password.length < 8) {
        setApiErrors([`${t("password")}: ${t("passwordTooShort")}`]);
        toast.error(t("passwordTooShort"));
        return false;
      }
      if (authForm.password !== authForm.password_confirmation) {
        setApiErrors([`${t("passwordConfirm")}: ${t("passwordMismatch")}`]);
        toast.error(t("passwordMismatch"));
        return false;
      }
    }

    const response = authMode === "login"
      ? await login(authForm.email, authForm.password)
      : await register({
        name: authForm.name,
        email: authForm.email,
        phone: form.phone,
        address: form.adresse_livraison,
        role: "client",
        password: authForm.password,
        password_confirmation: authForm.password_confirmation,
      });

    const connectedUser = response?.data?.user;
    if (connectedUser?.role !== "client") {
      setApiErrors([t("customerOnlyCheckout")]);
      toast.error(t("customerOnlyCheckout"));
      return false;
    }

    setUser(connectedUser);
    localStorage.setItem("user", JSON.stringify(connectedUser));
    await mergeGuestCart();
    await reloadCart();
    toast.success(authMode === "login" ? t("loginSuccess") : t("accountCreated"));
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (retrySeconds > 0) return;
    setApiErrors([]);

    if (form.fulfillment_method === "delivery" && !form.adresse_livraison) {
      const message = `${t("deliveryAddress")}: ${t("addressRequired")}`;
      setApiErrors([message]);
      return toast.error(message);
    }

    if (!form.phone) {
      const message = `${t("phone")}: ${t("phoneRequired")}`;
      setApiErrors([message]);
      return toast.error(message);
    }

    if (form.fulfillment_method === "delivery" && !form.delivery_latitude) {
      toast(t("deliveryFeeEstimated"), { icon: "🚚" });
    }

    try {
      setLoading(true);
      const authenticated = await authenticateInline();
      if (!authenticated) return;

      const response = await api.post("/api/checkout", form);
      trackEvent("purchase", {
        order_id: response.data?.data?.id,
        metadata: { total: response.data?.data?.total_price },
      });
      await reloadCart();

      if (response.data?.payment) {
        toast.success(t("cmiRedirecting"));
        submitCmiPayment(response.data.payment);
        return;
      }

      toast.success(t("orderConfirmed"));
      navigate("/orders");
    } catch (err) {
      const messages = getApiErrorMessages(err, t("checkoutError"));
      setApiErrors(messages);
      if (err.response?.status === 429) {
        setRetrySeconds(Number(err.response.headers?.["retry-after"] || 60));
      }
      showApiError(err, t("checkoutError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-3xl font-black text-gray-950">{t("checkout")}</h1>
      {apiErrors.length > 0 && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-black">{t("errorTitle")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {apiErrors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          {!user && (
            <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-indigo-950">
                  {authMode === "login" ? <LogIn size={19} /> : <UserPlus size={19} />}
                  {t("checkoutAccountTitle")}
                </h2>
                <p className="mt-1 text-sm text-indigo-700">{t("checkoutAccountText")}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`rounded-lg px-3 py-2 text-sm font-bold ${authMode === "login" ? "bg-indigo-600 text-white" : "text-gray-500"}`}
                >
                  {t("continueAsLogin")}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={`rounded-lg px-3 py-2 text-sm font-bold ${authMode === "register" ? "bg-indigo-600 text-white" : "text-gray-500"}`}
                >
                  {t("continueAsRegister")}
                </button>
              </div>

              {authMode === "register" && (
                <input
                  placeholder={t("name")}
                  className="w-full rounded-xl border border-indigo-100 bg-white p-3 text-base focus:ring-2 focus:ring-indigo-500"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
              )}
              <input
                type="email"
                placeholder={t("email")}
                className="w-full rounded-xl border border-indigo-100 bg-white p-3 text-base focus:ring-2 focus:ring-indigo-500"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
              <input
                type="password"
                placeholder={t("password")}
                className="w-full rounded-xl border border-indigo-100 bg-white p-3 text-base focus:ring-2 focus:ring-indigo-500"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
              {authMode === "register" && (
                <input
                  type="password"
                  placeholder={t("passwordConfirm")}
                  className="w-full rounded-xl border border-indigo-100 bg-white p-3 text-base focus:ring-2 focus:ring-indigo-500"
                  value={authForm.password_confirmation}
                  onChange={(e) => setAuthForm({ ...authForm, password_confirmation: e.target.value })}
                />
              )}
            </div>
          )}

          <select value={form.fulfillment_method} onChange={(e) => changeFulfillmentMethod(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-base focus:ring-2 focus:ring-indigo-500">
            <option value="delivery">{t("homeDelivery")}</option>
            <option value="pickup">{t("pickup")}</option>
          </select>

          {form.fulfillment_method === "delivery" && (
            <>
              <input
                placeholder={t("deliveryAddress")}
                className="w-full rounded-xl border border-gray-200 p-3 text-base focus:ring-2 focus:ring-indigo-500"
                value={form.adresse_livraison}
                onChange={(e) => setForm({ ...form, adresse_livraison: e.target.value })}
              />
              <button type="button" onClick={useCurrentLocation} disabled={locating} className="w-full rounded-xl border border-indigo-200 px-4 py-3 font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-60">
                {locating ? t("loading") : form.delivery_latitude ? t("savedLocation") : t("useMyLocation")}
              </button>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-black">{t("deliveryFee")}: {deliveryQuote.fee.toFixed(2)} DH</p>
                <p className="mt-1">
                  {deliveryQuote.estimated
                    ? t("deliveryFeeEstimated")
                    : deliveryQuote.freeDelivery
                      ? t("freeDeliveryApplied")
                      : t("deliveryDistancePrice", { distance: deliveryQuote.distanceKm, fee: deliveryQuote.fee.toFixed(2) })}
                </p>
              </div>
            </>
          )}

          {form.fulfillment_method === "pickup" && (
            <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
              <p className="font-bold">{t("pickup")}</p>
              <p>{STORE_LOCATION.address}</p>
              <p className="font-black text-emerald-700">{t("pickupFree")}</p>
              <DeliveryMap latitude={STORE_LOCATION.latitude} longitude={STORE_LOCATION.longitude} address={STORE_LOCATION.address} />
            </div>
          )}

          <input
            placeholder={t("phone")}
            className="w-full rounded-xl border border-gray-200 p-3 text-base focus:ring-2 focus:ring-indigo-500"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <select
            className="w-full rounded-xl border border-gray-200 p-3 text-base focus:ring-2 focus:ring-indigo-500"
            value={form.payment_method}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          >
            <option value="cash_on_delivery">{t("cashPayment")}</option>
            <option value="card">{t("cardPayment")}</option>
          </select>
          {form.payment_method === "card" && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-bold">
                <CreditCard size={18} />
                {t("cmiSecure")}
              </div>
              <p className="mt-2 flex items-start gap-2">
                <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                {t("cmiRedirect")}
              </p>
            </div>
          )}

          <input
            placeholder={t("coupon")}
            className="w-full rounded-xl border border-gray-200 p-3 text-base focus:ring-2 focus:ring-indigo-500"
            value={form.coupon_code}
            onChange={(e) => setForm({ ...form, coupon_code: e.target.value.toUpperCase() })}
          />

          <button className="w-full rounded-xl bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700 disabled:bg-gray-400" disabled={loading || retrySeconds > 0}>
            {retrySeconds > 0 ? t("retryIn", { seconds: retrySeconds }) : loading ? t("loading") : !user ? (authMode === "login" ? t("authAndOrder") : t("registerAndOrder")) : t("confirmOrder")}
          </button>
        </form>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-bold mb-4">{t("summary")}</h2>
          {cart.items.map((item) => (
            <div key={item.id} className="mb-3 flex justify-between gap-4 text-sm">
              <span className="min-w-0">{item.product.name} x{item.quantity}</span>
              <span className="shrink-0 font-bold">{item.total_price} DH</span>
            </div>
          ))}
          <hr className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("subtotal")}</span><span>{subtotal.toFixed(2)} DH</span></div>
            <div className="flex justify-between"><span>{t("deliveryFee")}</span><span>{deliveryQuote.fee.toFixed(2)} DH</span></div>
          </div>
          <div className="mt-4 font-bold text-right text-lg">{t("total")} : {estimatedTotal.toFixed(2)} DH</div>
        </div>
      </div>
    </div>
  );
}
