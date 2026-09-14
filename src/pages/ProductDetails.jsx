import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Flame, Heart, Minus, Plus, ShoppingBag, Star, Video, Zap } from "lucide-react";
import api from "../Api/axios";
import { getProduct } from "../services/productService";
import PageMetadata from '../components/PageMetadata';
import ProductDetailsSkeleton from "../components/products/ProductDetailsSkeleton";
import ProductGrid from "../components/products/ProductGrid";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { trackEvent } from "../services/analyticsService";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [related, setRelated] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    setProduct(null);
    setRelated([]);
    setLoadFailed(false);
    getProduct(id, controller.signal).then(({ data }) => {
      if (controller.signal.aborted) return;
      const nextProduct = data.data ?? data;
      const defaults = defaultSelectedOptions(nextProduct);
      setProduct(nextProduct);
      setActiveImage(nextProduct.variant_media?.color?.[defaults.color] || nextProduct.image);
      setQuantity(1);
      setSelectedOptions(defaults);
      trackEvent("product_view", { product_id: Number(id) });
      if (nextProduct.category?.id) {
        api.get("/api/products", { params: { category_id: nextProduct.category.id, exclude: nextProduct.id, per_page: 4 } })
          .then((res) => { if (!controller.signal.aborted) setRelated(res.data.data || []); })
          .catch(() => {});
      }
    }).catch(() => { if (!controller.signal.aborted) setLoadFailed(true); });
    return () => controller.abort();
  }, [id, t]);

  useEffect(() => {
    api.get(`/api/products/${id}/reviews`).then(({ data }) => setReviews(data.data || [])).catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    if (user?.role !== "client") {
      setFavoriteProducts([]);
      return;
    }

    api.get("/api/user/favorites").then(({ data }) => {
      const favorites = data?.data || data || [];
      setIsFavorite(favorites.some((item) => item.id === Number(id)));
      setFavoriteProducts(favorites.filter((item) => item.id !== Number(id)).slice(0, 4));
    }).catch(() => setIsFavorite(false));
  }, [id, user]);

  if (loadFailed) return <div role="alert" className="mx-auto max-w-xl p-10 text-center">
    <h1 className="text-2xl font-bold">{t('productNotFound')}</h1>
    <button type="button" onClick={() => navigate('/products')} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-white">{t('backToProducts')}</button>
  </div>;
  if (!product) return <ProductDetailsSkeleton />;

  const fallbackImage = "/product-placeholder.svg";
  const gallery = [...new Set([product.image, ...(product.images || []).map((image) => image.url)].filter(Boolean))];
  const mainImage = activeImage || product.image || fallbackImage;
  const variantGroups = Object.entries(product.variant_options || {}).filter(([, values]) => Array.isArray(values) && values.length > 0);
  const hasVariantChoices = product.has_variants && variantGroups.length > 0;
  const variantMedia = product.variant_media || {};
  const selectedUnitPrice = getVariantPrice(product, selectedOptions);
  const selectedStock = getVariantStock(product, selectedOptions);
  const isOutOfStock = selectedStock <= 0;
  const maxQuantity = Math.max(1, selectedStock);
  const baseUnitPrice = Number(product.current_price ?? product.price ?? 0);
  const hasSelectedPrice = Math.abs(selectedUnitPrice - baseUnitPrice) > 0.009;

  const handleAddToCart = async (goCheckout = false) => {
    if (isOutOfStock) return toast.error(t("productUnavailable"));
    setBusy(true);
    try {
      await addItem(product.id, quantity, hasVariantChoices ? selectedOptions : {});
      toast.success(t("productAddedCart"));
      if (goCheckout) navigate("/checkout");
    } catch (error) {
      showApiError(error, "Impossible d'ajouter ce produit au panier");
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = async () => {
    if (user?.role !== "client") return toast.error(t("loginForFavorites"));
    try {
      if (isFavorite) await api.delete(`/api/user/favorites/${product.id}`);
      else await api.post(`/api/user/favorites/${product.id}`);
      setIsFavorite((value) => !value);
      toast.success(isFavorite ? t("removedFromFavorites") : t("addedToFavorites"));
    } catch {
      toast.error(t("favoriteUpdateError"));
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/api/products/${product.id}/reviews`, { rating, comment });
      setReviews((current) => [data, ...current.filter((item) => item.user_id !== data.user_id)]);
      setComment("");
      toast.success(t("thanksReview"));
    } catch (error) {
      showApiError(error, t("reviewSaveError"));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] pb-28 sm:pb-0">
      <PageMetadata product={product} />
      <div className="mx-auto max-w-7xl space-y-7 px-3 py-4 sm:space-y-10 sm:px-6 sm:py-10 lg:space-y-14">
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-black text-gray-700 shadow-sm transition hover:-translate-x-0.5 hover:border-indigo-100 hover:text-indigo-600 sm:px-4 sm:py-3"
        >
          <ArrowLeft size={18} />
          {t("backToProducts")}
        </button>

        <section className="grid gap-6 overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white p-3 shadow-[0_20px_60px_-38px_rgba(15,23,42,.35)] sm:gap-8 sm:p-6 md:p-10 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="relative flex aspect-square max-h-[460px] items-center justify-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-slate-50 to-indigo-50/60 p-4 sm:p-8">
              {product.is_on_sale && <span className="absolute left-5 top-5 rounded-full bg-amber-500 px-4 py-1 text-xs font-black text-white">{t("promos")}</span>}
              {isOutOfStock && <span className="absolute right-5 top-5 rounded-full bg-red-600 px-4 py-1 text-xs font-black text-white">{t("outOfStock")}</span>}
              {product.free_delivery && <span className="absolute bottom-5 left-5 rounded-full bg-emerald-500 px-4 py-1 text-xs font-black text-white">{t("freeDeliveryProduct")}</span>}
              <img
                src={mainImage}
                alt={product.name}
                loading="eager"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImage;
                }}
                className="max-h-full max-w-full object-contain drop-shadow-[0_18px_24px_rgba(15,23,42,.12)] transition duration-500 hover:scale-[1.03]"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2 sm:mt-4 sm:gap-3">
                {gallery.map((url) => (
                  <button key={url} onClick={() => setActiveImage(url)} className={`h-16 w-16 shrink-0 snap-start rounded-xl border-2 bg-white p-2 transition sm:h-20 sm:w-20 ${activeImage === url ? "border-indigo-600 shadow-md shadow-indigo-100" : "border-gray-100"}`}>
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
            {product.video && (
              <div className="mt-5 overflow-hidden rounded-3xl border border-violet-100 bg-violet-50 p-3">
                <p className="mb-3 flex items-center gap-2 text-sm font-black text-violet-700">
                  <Video size={18} />
                  {t("productVideo")}
                </p>
                <video src={product.video} className="max-h-[360px] w-full rounded-2xl bg-black object-contain" controls preload="metadata" />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{product.category?.name || t("product")}</p>
            <h1 className="mt-2 text-[1.75rem] font-black leading-tight text-gray-950 sm:mt-3 sm:text-4xl md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:mt-5 sm:text-base sm:leading-relaxed">{product.short_description || product.description || t("descriptionEmpty")}</p>
            <div className="mt-5 sm:mt-8">
              {product.is_on_sale && <span className="mr-3 text-xl text-gray-400 line-through">{formatPrice(product.price)} DH</span>}
              <span className="text-3xl font-black text-gray-950 sm:text-5xl">{formatPrice(selectedUnitPrice)}</span>
              <span className="ml-2 font-bold text-indigo-600">DH</span>
              {hasSelectedPrice && <p className="mt-2 text-sm font-bold text-indigo-600">{t("optionPriceAdapted")}</p>}
            </div>
            <p className={`mt-4 text-sm font-bold ${isOutOfStock ? "text-red-500" : selectedStock < 10 ? "text-amber-500" : "text-emerald-600"}`}>
              {isOutOfStock ? t("unavailable") : selectedStock < 10 ? t("lowStockCount", { count: selectedStock }) : t("inStockCount", { count: selectedStock })}
            </p>
            {product.free_delivery && (
              <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {t("freeDeliveryProduct")} — {t("freeDeliveryProductHint")}
              </p>
            )}
            {hasVariantChoices && (
              <div className="mt-5 space-y-5 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-3 sm:mt-7 sm:p-4">
                <div>
                  <h2 className="font-black text-gray-950">{t("chooseOptions")}</h2>
                  <p className="text-sm text-gray-600">{t("variantHelp")}</p>
                </div>
                {variantGroups.map(([key, values]) => (
                  <VariantOptionGroup
                    key={key}
                    optionKey={key}
                    values={values}
                    selectedValue={selectedOptions[key]}
                    productImage={mainImage}
                    variantMedia={variantMedia}
                    variantPrices={product.variant_prices || {}}
                    variantStocks={product.variant_stocks || {}}
                    onChange={(value) => {
                      setSelectedOptions((current) => ({ ...current, [key]: value }));
                      setQuantity(1);
                      if (key === "color" && variantMedia.color?.[value]) setActiveImage(variantMedia.color[value]);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-2xl border border-gray-200 bg-white p-1">
                <button type="button" disabled={quantity <= 1 || busy} onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="rounded-xl p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30">
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center text-lg font-black">{quantity}</span>
                <button type="button" disabled={quantity >= maxQuantity || busy || isOutOfStock} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} className="rounded-xl p-3 text-gray-600 hover:bg-gray-50 disabled:opacity-30">
                  <Plus size={18} />
                </button>
              </div>
              {!isOutOfStock && <p className="text-sm text-gray-500">{t("maxOrderQuantity", { count: selectedStock })}</p>}
            </div>

            <div className="mt-6 hidden flex-col gap-3 sm:flex sm:flex-row">
              <button onClick={() => handleAddToCart(false)} disabled={busy || isOutOfStock} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 font-black text-white hover:bg-indigo-700 disabled:bg-gray-300 sm:px-6">
                <ShoppingBag /> {t("addToCart")}
              </button>
              <button onClick={() => handleAddToCart(true)} disabled={busy || isOutOfStock} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-4 font-black text-white hover:bg-black disabled:bg-gray-300 sm:px-6">
                <Zap size={20} /> {t("orderNow")}
              </button>
              <button onClick={toggleFavorite} aria-label={isFavorite ? t("removedFromFavorites") : t("addedToFavorites")} className={`rounded-2xl border px-5 ${isFavorite ? "border-red-200 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:text-red-500"}`}>
                <Heart fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="mt-7 grid gap-3 text-sm sm:grid-cols-3">
              {[t("securePayment"), t("pickupOrDelivery"), t("afterOrderSupport")].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 font-bold text-gray-700">
                  <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-5">
              <h3 className="font-black text-gray-950">{t("purchaseInfo")}</h3>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <InfoTile label={t("category")} value={product.category?.name || t("product")} />
                <InfoTile label={t("availability")} value={isOutOfStock ? t("soonAvailable") : t("inStockCount", { count: product.stock })} />
                <InfoTile label={t("delivery")} value={product.free_delivery ? t("freeDeliveryProduct") : t("deliveryPickup")} />
              </div>
              {hasVariantChoices && (
                <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-indigo-700">
                  {t("selectedOptions")}: {Object.entries(selectedOptions).filter(([, value]) => value).map(([key, value]) => `${variantLabel(key)} ${value}`).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_50px_rgba(15,23,42,.14)] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-2">
            <button onClick={toggleFavorite} aria-label={isFavorite ? t("removedFromFavorites") : t("addedToFavorites")} className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${isFavorite ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 text-slate-500"}`}>
              <Heart fill={isFavorite ? "currentColor" : "none"} size={20} />
            </button>
            <button onClick={() => handleAddToCart(false)} disabled={busy || isOutOfStock} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-3 text-sm font-black text-white shadow-lg shadow-indigo-200 disabled:bg-gray-300">
              <ShoppingBag size={18} /> {t("addToCart")}
            </button>
            <button onClick={() => handleAddToCart(true)} disabled={busy || isOutOfStock} aria-label={t("orderNow")} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white disabled:bg-gray-300">
              <Zap size={20} />
            </button>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 md:col-span-2 md:p-8">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">{t("longDescription")}</p>
            <h2 className="text-2xl font-black text-gray-950">{t("detailsBeforeBuying")}</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-gray-600">
              {product.long_description || product.description || t("longDescriptionFallback")}
            </p>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">{t("quickGuide")}</p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>• {t("quickGuideOptions")}</li>
              <li>• {t("quickGuidePromos")}</li>
              <li>• {t("quickGuideDelivery")}</li>
            </ul>
          </div>
        </section>

        {favoriteProducts.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">Votre sélection</p>
            <h2 className="mb-6 text-3xl font-black text-gray-950">{t("yourFavorites")}</h2>
            <ProductGrid products={favoriteProducts} favoriteByDefault />
          </section>
        )}

        {related.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">{t("sameCategory")}</p>
            <h2 className="mb-6 text-3xl font-black text-gray-950">{t("similarProducts")}</h2>
            <ProductGrid products={related} />
          </section>
        )}

        <section className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8">
          <h2 className="mb-5 text-2xl font-black">{t("customerReviews")}</h2>
          {user?.role === "client" && (
            <form onSubmit={submitReview} className="mb-6 space-y-3 rounded-2xl bg-gray-50 p-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className="text-amber-400"><Star fill={value <= rating ? "currentColor" : "none"} size={22} /></button>)}
              </div>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength="1000" placeholder={t("shareExperience")} className="w-full rounded-xl border p-3" />
              <button className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white">{t("publishReview")}</button>
            </form>
          )}
          <div className="space-y-4">
            {reviews.length ? reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <strong>{review.user?.name || t("client")}</strong>
                  <span className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                </div>
                {review.comment && <p className="mt-2 text-gray-600">{review.comment}</p>}
              </article>
            )) : <p className="text-gray-500">{t("noReviews")}</p>}
          </div>
        </section>

      </div>
    </div>
  );
}

function ColorPreview({ value }) {
  const normalized = String(value || "").trim().toLowerCase();
  const colorMap = {
    noir: "#111827",
    black: "#111827",
    blanc: "#ffffff",
    white: "#ffffff",
    rouge: "#ef4444",
    red: "#ef4444",
    bleu: "#2563eb",
    blue: "#2563eb",
    vert: "#16a34a",
    green: "#16a34a",
    jaune: "#facc15",
    yellow: "#facc15",
    gris: "#9ca3af",
    gray: "#9ca3af",
    rose: "#fb7185",
    pink: "#fb7185",
    marron: "#92400e",
    brown: "#92400e",
  };
  const background = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized) ? normalized : colorMap[normalized];

  if (!background) return null;

  return <span className="h-4 w-4 rounded-full border border-black/10" style={{ background }} />;
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 font-black text-gray-950">{value}</p>
    </div>
  );
}

function VariantOptionGroup({ optionKey, values, selectedValue, productImage, variantMedia = {}, variantPrices = {}, variantStocks = {}, onChange }) {
  const isVisualChoice = ["color", "custom"].includes(optionKey);

  return (
    <fieldset className="space-y-3">
      <legend className="flex flex-wrap items-center gap-2 text-sm font-black text-gray-950">
        <span>{variantLabel(optionKey)}: {selectedValue || "Choisir"}</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
          Disponible
        </span>
      </legend>

      {isVisualChoice ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {values.map((value, index) => {
            const active = selectedValue === value;
            const optionImage = optionKey === "color" ? (variantMedia.color?.[value] || productImage) : productImage;
            const optionPrice = variantPrices?.[optionKey]?.[value];
            const optionStock = variantStocks?.[optionKey]?.[value];
            const unavailable = optionStock !== undefined && Number(optionStock) <= 0;

            return (
              <label
                key={value}
                title={`${variantLabel(optionKey)}: ${value}`}
                className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-2 transition ${unavailable ? "cursor-not-allowed border-gray-100 opacity-45" : "cursor-pointer hover:-translate-y-0.5 hover:border-gray-900"} ${active ? "border-gray-950 shadow-lg shadow-gray-200" : "border-gray-200 hover:shadow-md"}`}
              >
                <input
                  type="radio"
                  name={`variant-${optionKey}`}
                  checked={active}
                  disabled={unavailable}
                  onChange={() => onChange(value)}
                  className="sr-only"
                />
                {index < 2 && <Flame className="absolute -top-2 right-2 text-red-500" size={16} aria-label="Option populaire" />}
                <span className="flex aspect-square w-full items-center justify-center rounded-xl bg-gray-50 p-1">
                  <img src={optionImage} alt="" className="max-h-full max-w-full object-contain transition group-hover:scale-105" />
                </span>
                <span className="flex max-w-full items-center gap-1 truncate text-[11px] font-black text-gray-800">
                  {optionKey === "color" && <ColorPreview value={value} />}
                  <span className="truncate">{value}</span>
                </span>
                {optionPrice && <span className="text-[10px] font-black text-indigo-600">{formatPrice(optionPrice)} DH</span>}
                {optionStock !== undefined && <span className={`text-[10px] font-black ${unavailable ? "text-red-500" : "text-emerald-600"}`}>{unavailable ? "Indisponible" : `${optionStock} en stock`}</span>}
                {active && (
                  <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-950 text-white">
                    <CheckCircle2 size={14} />
                  </span>
                )}
              </label>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => {
            const active = selectedValue === value;
            const optionPrice = variantPrices?.[optionKey]?.[value];
            const optionStock = variantStocks?.[optionKey]?.[value];
            const unavailable = optionStock !== undefined && Number(optionStock) <= 0;

            return (
              <label
                key={value}
                className={`border-2 px-5 py-3 text-sm font-black transition ${unavailable ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 line-through" : "cursor-pointer"} ${active ? "border-gray-950 bg-white text-gray-950 shadow-md" : "border-gray-200 bg-white text-gray-700 hover:border-gray-900"}`}
              >
                <input
                  type="radio"
                  name={`variant-${optionKey}`}
                  checked={active}
                  disabled={unavailable}
                  onChange={() => onChange(value)}
                  className="sr-only"
                />
                <span>{value}</span>
                {optionPrice && <span className="ml-2 text-xs text-indigo-600">{formatPrice(optionPrice)} DH</span>}
                {optionStock !== undefined && <span className="ml-2 text-xs font-bold">({optionStock})</span>}
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function getVariantPrice(product, selectedOptions = {}) {
  const variantPrices = product?.variant_prices || {};
  const entries = Object.entries(selectedOptions || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (entries.length > 1 && variantPrices?._combinations) {
    const combinationKey = entries
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([group, value]) => `${group}=${value}`)
      .join("|");
    const price = variantPrices._combinations[combinationKey];

    if (price !== undefined && price !== null && price !== "" && Number.isFinite(Number(price))) {
      return Number(price);
    }
  }

  for (const [group, value] of Object.entries(selectedOptions || {})) {
    const price = variantPrices?.[group]?.[value];
    if (price !== undefined && price !== null && price !== "" && Number.isFinite(Number(price))) {
      return Number(price);
    }
  }

  return Number(product?.current_price ?? product?.price ?? 0);
}

function getVariantStock(product, selectedOptions = {}) {
  const values = Object.entries(selectedOptions || {})
    .map(([group, value]) => product?.variant_stocks?.[group]?.[value])
    .filter((stock) => stock !== undefined && stock !== null && Number.isFinite(Number(stock)))
    .map(Number);
  return Math.max(0, Math.min(Number(product?.stock || 0), ...(values.length ? values : [Number(product?.stock || 0)])));
}

function formatPrice(value) {
  const numericValue = Number(value || 0);
  const digits = Number.isInteger(numericValue) ? 0 : 2;
  return numericValue.toLocaleString("fr-MA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function defaultSelectedOptions(product) {
  return Object.fromEntries(
    Object.entries(product.variant_options || {})
      .filter(([, values]) => Array.isArray(values) && values.length > 0)
      .map(([key, values]) => [key, values.find((value) => Number(product?.variant_stocks?.[key]?.[value] ?? 1) > 0) || values[0]])
  );
}

function variantLabel(key) {
  return {
    color: "Couleur",
    size: "Taille / format",
    weight: "Poids / volume",
    custom: "Option",
  }[key] || key;
}
