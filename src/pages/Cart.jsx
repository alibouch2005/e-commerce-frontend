import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, CircleAlert, Minus, Plus, RefreshCw, ShieldCheck, ShoppingBag, Sparkles, Trash2, Truck } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";
import { formatAmount } from "../utils/money";

export default function Cart() {
  const { cart, loading, cartError, reloadCart, updateItemQuantity, removeItem } = useContext(CartContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const subtotal = Number(cart?.total || 0);
  const fallbackImage = "/product-placeholder.svg";

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const changeQty = async (item, quantity) => {
    if (quantity < 1) return;
    setUpdatingId(item.id);
    try {
      await updateItemQuantity(item, quantity);
    } catch (error) {
      showApiError(error, t("quantityError"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (item) => {
    setUpdatingId(item.id);
    try {
      await removeItem(item);
      toast.success(t("productRemoved"));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return (
    <div className="grid min-h-[60vh] place-items-center px-4" role="status" aria-live="polite">
      <div className="premium-surface flex items-center gap-3 rounded-2xl px-5 py-4 font-bold text-indigo-700">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" aria-hidden="true" />
        {t("loading")}
      </div>
    </div>
  );
  if (cartError) {
    return (
      <main className="grid min-h-[calc(100vh-5rem)] place-items-center px-4 py-12">
        <section className="premium-surface w-full max-w-xl rounded-[2rem] p-7 text-center sm:p-10" role="alert">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300">
            <CircleAlert size={30} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{t("cartLoadError")}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{t("cartLoadErrorHelp")}</p>
          <button type="button" onClick={reloadCart} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 dark:shadow-none">
            <RefreshCw size={18} aria-hidden="true" />
            {t("retry")}
          </button>
        </section>
      </main>
    );
  }
  if (!cart?.items?.length) {
    return (
      <main className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
        <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-700/20" />
        <section className="premium-surface mx-auto max-w-3xl overflow-hidden rounded-[2rem] text-center sm:rounded-[2.5rem]">
          <div className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-6 py-10 text-white sm:px-12 sm:py-14">
            <Sparkles className="absolute right-6 top-6 text-violet-300/70" size={24} aria-hidden="true" />
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.6rem] border border-white/15 bg-white/10 shadow-2xl shadow-indigo-950/50 backdrop-blur sm:h-24 sm:w-24">
              <ShoppingBag size={38} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-indigo-200">AliShop Casablanca</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{t("emptyCart")}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">{t("emptyCartDescription")}</p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-black text-indigo-700 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              {t("seeProducts")}
              <ArrowRight className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-3 p-5 text-left sm:grid-cols-3 sm:p-7 rtl:text-right">
            <EmptyCartBenefit icon={<ShieldCheck size={19} aria-hidden="true" />} label={t("securePayment")} />
            <EmptyCartBenefit icon={<Truck size={19} aria-hidden="true" />} label={t("deliveryPickup")} />
            <EmptyCartBenefit icon={<Sparkles size={19} aria-hidden="true" />} label={t("cartBenefitChoice")} />
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-[0_24px_70px_-28px_rgba(79,70,229,.8)] sm:mb-8 sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-200">AliShop checkout</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{t("cart")}</h1></div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className={`premium-surface premium-lift flex flex-col justify-between gap-4 rounded-3xl p-4 md:flex-row md:items-center ${updatingId === item.id ? "opacity-80" : ""}`}>
                <div className="flex items-center gap-4">
                  <img
                    src={item.product?.image || fallbackImage}
                    className="w-20 h-20 object-cover rounded-2xl bg-gray-50"
                    alt={item.product?.name}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div>
                    <h3 className="font-black">{item.product.name}</h3>
                    <OptionPills options={item.selected_options} />
                    <div className="text-sm">
                      {item.product?.is_on_sale && <span className="mr-2 text-gray-400 line-through">{formatAmount(item.product.price)} DH</span>}
                      <span className="font-bold text-indigo-600">{formatAmount(item.price)} DH</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center rounded-xl border bg-white">
                    <button disabled={updatingId === item.id || item.quantity <= 1} onClick={() => changeQty(item, item.quantity - 1)} className="p-3 transition hover:bg-gray-50 disabled:opacity-30"><Minus size={16} /></button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button disabled={updatingId === item.id || item.quantity >= Number(item.available_stock ?? item.product?.stock ?? 0)} onClick={() => changeQty(item, item.quantity + 1)} className="p-3 transition hover:bg-gray-50 disabled:opacity-30"><Plus size={16} /></button>
                  </div>
                  <div className="min-w-24 text-right font-black">{formatAmount(item.total_price)} DH</div>
                  <button disabled={updatingId === item.id} onClick={() => handleRemoveItem(item)} className="rounded-xl bg-red-50 p-3 text-red-500 hover:bg-red-100"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="premium-surface h-fit rounded-3xl p-5 md:sticky md:top-24 sm:p-6">
            <h2 className="text-xl font-black mb-4">{t("summary")}</h2>
            <div className="flex justify-between mb-2"><span>{t("subtotal")}</span><span>{formatAmount(subtotal)} DH</span></div>
            <div className="mb-2 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">{t("deliveryCalculatedCheckout")}</div>
            <hr className="my-4" />
            <div className="flex justify-between font-black text-lg"><span>{t("total")}</span><span>{formatAmount(subtotal)} DH</span></div>
            <button onClick={handleCheckout} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 font-black text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5">{t("placeOrder")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCartBenefit({ icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-indigo-100/80 bg-white/70 p-3.5 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
}

function OptionPills({ options }) {
  const entries = Object.entries(options || {}).filter(([, value]) => value);
  if (!entries.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {entries.map(([key, value]) => (
        <span key={key} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700">
          {variantLabel(key)}: {value}
        </span>
      ))}
    </div>
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
