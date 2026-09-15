import { useEffect, useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../services/analyticsService";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { Check, CreditCard, LogIn, Store, Truck, UserPlus } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { login, register } from "../services/authService";
import { mergeGuestCart } from "../services/cartService";
import { getApiErrorMessages, showApiError } from "../utils/showApiError";
import { getDeliveryQuote, STORE_LOCATION } from "../utils/deliveryPricing";
import { formatAmount } from "../utils/money";

const deliverySlots = [
  { value: "08_12", labelKey: "slotMorning", helpKey: "slotMorningHelp" },
  { value: "12_18", labelKey: "slotAfternoon", helpKey: "slotAfternoonHelp" },
  { value: "18_21", labelKey: "slotEvening", helpKey: "slotEveningHelp" },
];

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
    delivery_time_slot: "12_18",
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
  const productDeliveryPrices = (cart?.items || []).map((item) => item.product?.delivery_price).filter((price) => price !== null && price !== undefined && price !== "").map(Number);
  const productDeliveryPrice = productDeliveryPrices.length ? Math.max(...productDeliveryPrices) : null;
  const localDeliveryQuote = getDeliveryQuote({
    fulfillmentMethod: form.fulfillment_method,
    latitude: form.delivery_latitude,
    longitude: form.delivery_longitude,
    productFreeDelivery,
    productDeliveryPrice,
  });
  const [serverDeliveryQuote, setServerDeliveryQuote] = useState(null);
  const deliveryQuote = serverDeliveryQuote || localDeliveryQuote;
  const freeDeliveryMessage = deliveryQuote.freeDeliveryReason === "loyalty_5th_order"
    ? t("deliveryFreeLoyalty")
    : deliveryQuote.freeDeliveryReason === "product"
      ? t("deliveryFreeProduct")
      : deliveryQuote.freeDeliveryReason === "coupon"
        ? t("deliveryFreeCoupon")
        : t("deliveryFreeGlobal");
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
          coupon_code: form.coupon_code || null,
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
  }, [form.fulfillment_method, form.delivery_latitude, form.delivery_longitude, form.coupon_code, subtotal, productFreeDelivery, user?.id]);

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
      async ({ coords }) => {
        let resolvedAddress = "";
        try {
          const { data } = await api.get("/api/delivery/address", {
            params: { latitude: coords.latitude, longitude: coords.longitude },
          });
          resolvedAddress = data.address || "";
        } catch {
          // Les coordonnées restent enregistrées et l'adresse peut être précisée manuellement.
        }
        setForm((current) => ({
          ...current,
          delivery_latitude: coords.latitude,
          delivery_longitude: coords.longitude,
          adresse_livraison: resolvedAddress || current.adresse_livraison,
        }));
        setLocating(false);
        toast.success(resolvedAddress ? "Position et adresse détaillée enregistrées" : t("savedLocation"));
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

    if (form.payment_method === "card") {
      setApiErrors([t("cardComingSoonHelp")]);
      return toast(t("cardComingSoon"), { icon: "💳" });
    }

    if (form.fulfillment_method === "delivery" && !form.adresse_livraison) {
      const message = `${t("deliveryAddress")}: ${t("addressRequired")}`;
      setApiErrors([message]);
      return toast.error(message);
    }

    if (form.fulfillment_method === "delivery" && !/casa|casablanca/i.test(form.adresse_livraison || "") && !form.delivery_latitude) {
      const message = t("casaOnlyDelivery");
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
      (response.data?.warnings || []).forEach((message) => toast(message, { icon: "⚠️" }));
      trackEvent("purchase", {
        order_id: response.data?.data?.id,
        metadata: { total: response.data?.data?.total_price },
      });
      await reloadCart();

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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-[0_24px_70px_-28px_rgba(79,70,229,.8)] sm:p-8"><div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" /><p className="relative text-xs font-black uppercase tracking-[.18em] text-indigo-200">AliShop secure checkout</p><h1 className="relative mt-2 text-3xl font-black sm:text-4xl">{t("checkout")}</h1></div>
      {apiErrors.length > 0 && (
        <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-black">{t("errorTitle")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {apiErrors.map((message) => <li key={message}>{message}</li>)}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <form onSubmit={handleSubmit} className="premium-surface space-y-4 rounded-3xl p-4 sm:p-6">
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

          <fieldset>
            <legend className="mb-3 text-sm font-black text-gray-950">{t("fulfillmentMode")}</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { value: "delivery", label: t("homeDelivery"), detail: t("delivery"), icon: Truck },
                { value: "pickup", label: t("pickup"), detail: t("pickupFree"), icon: Store },
              ].map(({ value, label, detail, icon }) => {
                const selected = form.fulfillment_method === value;
                const FulfillmentIcon = icon;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => changeFulfillmentMethod(value)}
                    className={`relative min-h-24 overflow-hidden rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${selected ? "border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200" : "border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-indigo-50"}`}
                  >
                    <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${selected ? "bg-white/15" : "bg-indigo-50 text-indigo-600"}`}><FulfillmentIcon size={18} /></span>
                    <strong className="block text-sm leading-tight">{label}</strong>
                    <small className={`mt-1 block text-[11px] font-semibold ${selected ? "text-indigo-100" : "text-gray-500"}`}>{detail}</small>
                    {selected && <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-white text-indigo-600"><Check size={14} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
          </fieldset>

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
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                <p className="font-black text-indigo-950">{t("deliveryTimeSlot")}</p>
                <p className="mt-1 text-sm text-indigo-700">{t("deliveryTimeSlotHelp")}</p>
                <div className="mt-4 grid gap-3">
                  {deliverySlots.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setForm({ ...form, delivery_time_slot: slot.value })}
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.delivery_time_slot === slot.value
                          ? "border-indigo-600 bg-white shadow-sm"
                          : "border-indigo-100 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <span className="block font-black text-gray-950">{t(slot.labelKey)}</span>
                      <span className="mt-1 block text-sm text-gray-500">{t(slot.helpKey)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-black">{deliveryQuote.estimated ? t("estimatedDeliveryFee") : t("deliveryFee")}: {formatAmount(deliveryQuote.fee)} DH</p>
                <p className="mt-1">
                  {deliveryQuote.estimated
                    ? t("deliveryFeeEstimated")
                    : deliveryQuote.freeDelivery
                      ? freeDeliveryMessage
                      : t("deliveryFeeConfirmed", { fee: formatAmount(deliveryQuote.fee) })}
                </p>
              </div>
            </>
          )}

          {form.fulfillment_method === "pickup" && (
            <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
              <p className="font-black">{t("pickup")}</p>
              <p>{STORE_LOCATION.address}</p>
              <p className="font-black text-emerald-700">{t("pickupFree")}</p>
              <ol className="grid gap-2 rounded-xl bg-white/80 p-3 text-xs font-semibold text-indigo-950 sm:grid-cols-3">
                <li>1. Commande confirmée</li>
                <li>2. Préparation par le magasin</li>
                <li>3. Retrait après notification</li>
              </ol>
              <p className="text-xs font-semibold">Présentez votre numéro de commande au magasin. Aucun livreur ne sera affecté.</p>
              <DeliveryMap latitude={STORE_LOCATION.latitude} longitude={STORE_LOCATION.longitude} address={STORE_LOCATION.address} />
            </div>
          )}

          <input
            placeholder={t("phone")}
            className="w-full rounded-xl border border-gray-200 p-3 text-base focus:ring-2 focus:ring-indigo-500"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <fieldset>
            <legend className="mb-3 text-sm font-black text-gray-950">{t('choosePayment')}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${form.payment_method === 'cash_on_delivery' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' : 'border-gray-200 bg-white'}`}>
                <input type="radio" name="payment_method_choice" value="cash_on_delivery" checked={form.payment_method === 'cash_on_delivery'} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="mt-1 h-5 w-5 shrink-0 accent-indigo-600" />
                <span><strong className="block text-sm text-gray-950">{t('cashPayment')}</strong><small className="mt-1 block leading-relaxed text-gray-500">{t('cashPaymentHelp')}</small></span>
              </label>
              <label className="relative flex cursor-not-allowed items-start gap-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-4 opacity-75">
                <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-black uppercase text-amber-700">Bientôt</span>
                <input type="radio" name="payment_method_choice" value="card" disabled aria-describedby="card-payment-help" className="mt-1 h-5 w-5 shrink-0 accent-amber-500" />
                <span className="pr-12"><strong className="flex items-center gap-2 text-sm text-gray-950"><CreditCard size={17} />{t('cardPayment')}</strong><small id="card-payment-help" className="mt-1 block leading-relaxed text-gray-500">{t('cardComingSoonHelp')}</small></span>
              </label>
            </div>
          </fieldset>
          {form.payment_method === "card" && (
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm text-amber-900"><p className="font-black">{t("cardComingSoon")}</p><p className="mt-1 leading-6">{t("cardComingSoonHelp")}</p></div>
          )}

          <input
            placeholder={t("coupon")}
            className="w-full rounded-xl border border-gray-200 p-3 text-base focus:ring-2 focus:ring-indigo-500"
            value={form.coupon_code}
            onChange={(e) => setForm({ ...form, coupon_code: e.target.value.toUpperCase() })}
          />

          <button className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-4 font-black text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-none disabled:bg-gray-400" disabled={loading || retrySeconds > 0}>
            {retrySeconds > 0 ? t("retryIn", { seconds: retrySeconds }) : loading ? t("loading") : !user ? (authMode === "login" ? t("authAndOrder") : t("registerAndOrder")) : t("confirmOrder")}
          </button>
        </form>

        <div className="premium-surface h-fit rounded-3xl p-4 sm:sticky sm:top-24 sm:p-6">
          <h2 className="font-bold mb-4">{t("summary")}</h2>
          {cart.items.map((item) => (
            <div key={item.id} className="mb-3 flex justify-between gap-4 text-sm">
              <span className="min-w-0">
                <span className="block">{item.product.name} x{item.quantity}</span>
                <OptionLine options={item.selected_options} />
              </span>
              <span className="shrink-0 font-bold">{formatAmount(item.total_price)} DH</span>
            </div>
          ))}
          <hr className="my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("subtotal")}</span><span>{formatAmount(subtotal)} DH</span></div>
            <div className="flex justify-between"><span>{deliveryQuote.estimated ? t("estimatedDeliveryFee") : t("deliveryFee")}</span><span>{formatAmount(deliveryQuote.fee)} DH</span></div>
          </div>
          <div className="mt-4 font-bold text-right text-lg">{t("total")} : {formatAmount(estimatedTotal)} DH</div>
        </div>
      </div>
    </div>
  );
}

function OptionLine({ options }) {
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
