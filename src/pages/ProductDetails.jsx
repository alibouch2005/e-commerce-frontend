import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Heart, ShoppingBag, Star } from "lucide-react";
import api from "../Api/axios";
import { getProduct } from "../services/productService";
import ProductDetailsSkeleton from "../components/products/ProductDetailsSkeleton";
import ProductGrid from "../components/products/ProductGrid";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { trackEvent } from "../services/analyticsService";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function ProductDetails() {
  const { id } = useParams();
  const { addItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProduct(null);
    getProduct(id).then(({ data }) => {
      const nextProduct = data.data ?? data;
      setProduct(nextProduct);
      setActiveImage(nextProduct.image);
      trackEvent("product_view", { product_id: Number(id) });
      if (nextProduct.category?.id) {
        api.get("/api/products", { params: { category_id: nextProduct.category.id, exclude: nextProduct.id, per_page: 4 } })
          .then((res) => setRelated(res.data.data || []));
      }
    }).catch(() => toast.error(t("productNotFound")));
  }, [id, t]);

  useEffect(() => {
    api.get(`/api/products/${id}/reviews`).then(({ data }) => setReviews(data.data || [])).catch(() => setReviews([]));
  }, [id]);

  useEffect(() => {
    if (user?.role !== "client") return;
    api.get("/api/user/favorites").then(({ data }) => {
      const favorites = data?.data || data || [];
      setIsFavorite(favorites.some((item) => item.id === Number(id)));
    }).catch(() => setIsFavorite(false));
  }, [id, user]);

  if (!product) return <ProductDetailsSkeleton />;

  const isOutOfStock = product.stock <= 0;
  const fallbackImage = "/product-placeholder.svg";
  const gallery = [product.image, ...(product.images || []).map((image) => image.url)].filter(Boolean);
  const mainImage = activeImage || product.image || fallbackImage;

  const handleAddToCart = async () => {
    if (isOutOfStock) return toast.error(t("productUnavailable"));
    setBusy(true);
    try {
      await addItem(product.id, 1);
      toast.success(t("productAddedCart"));
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
    <div className="min-h-screen bg-[#f7f8fc]">
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6 sm:py-10 lg:space-y-14">
        <section className="grid gap-8 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 md:p-10 lg:grid-cols-2 lg:gap-10">
          <div>
            <div className="relative flex aspect-square max-h-[460px] items-center justify-center rounded-2xl bg-gray-50 p-4 sm:p-8">
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
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {gallery.map((url) => (
                  <button key={url} onClick={() => setActiveImage(url)} className={`h-16 w-16 shrink-0 rounded-xl border bg-white p-2 sm:h-20 sm:w-20 ${activeImage === url ? "border-indigo-600" : "border-gray-100"}`}>
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
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{product.category?.name || t("product")}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-gray-950 sm:text-4xl md:text-5xl">{product.name}</h1>
            <p className="mt-5 leading-relaxed text-gray-600">{product.description || t("descriptionEmpty")}</p>
            <div className="mt-8">
              {product.is_on_sale && <span className="mr-3 text-xl text-gray-400 line-through">{product.price} DH</span>}
              <span className="text-4xl font-black text-gray-950 sm:text-5xl">{product.current_price ?? product.price}</span>
              <span className="ml-2 font-bold text-indigo-600">DH</span>
            </div>
            <p className={`mt-4 text-sm font-bold ${isOutOfStock ? "text-red-500" : product.stock < 5 ? "text-amber-500" : "text-emerald-600"}`}>
              {isOutOfStock ? t("unavailable") : product.stock < 5 ? t("lowStockCount", { count: product.stock }) : t("inStockCount", { count: product.stock })}
            </p>
            {product.free_delivery && (
              <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                {t("freeDeliveryProduct")} — {t("freeDeliveryProductHint")}
              </p>
            )}
            <div className="mt-8 flex gap-3">
              <button onClick={handleAddToCart} disabled={busy || isOutOfStock} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 font-black text-white hover:bg-indigo-700 disabled:bg-gray-300 sm:px-6">
                <ShoppingBag /> {t("addToCart")}
              </button>
              <button onClick={toggleFavorite} className={`rounded-2xl border px-5 ${isFavorite ? "border-red-200 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:text-red-500"}`}>
                <Heart fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </section>

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

        {related.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600">{t("sameCategory")}</p>
            <h2 className="mb-6 text-3xl font-black text-gray-950">{t("similarProducts")}</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
