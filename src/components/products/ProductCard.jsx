import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../Api/axios";
import { useLanguage } from "../../context/LanguageContext";
import { showApiError } from "../../utils/showApiError";

export default function ProductCard({ product, favoriteByDefault = false }) {
  const { addItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [favorite, setFavorite] = useState(favoriteByDefault);
  const fallbackImage = "/product-placeholder.svg";
  const imageUrl = product.image || fallbackImage;
  const isOutOfStock = product.stock <= 0;

  const addToCart = async () => {
    if (isOutOfStock) return toast.error(t("outOfStock"));
    setBusy(true);
    try {
      await addItem(product.id, 1);
      toast.success(t("productAddedCart"));
    } catch (error) {
      showApiError(error, t("quantityError"));
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = async () => {
    if (user?.role !== "client") return navigate("/login");
    try {
      if (favorite) await api.delete(`/api/user/favorites/${product.id}`);
      else await api.post(`/api/user/favorites/${product.id}`);
      setFavorite((value) => !value);
      toast.success(favorite ? t("removedFromFavorites") : t("addedToFavorites"));
    } catch (error) {
      showApiError(error, t("favoriteUpdateError"));
    }
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/60 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-900">
      <div className="absolute left-3 top-3 z-20 flex flex-col gap-2 sm:left-4 sm:top-4">
        {product.is_on_sale && <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black text-white sm:text-xs">{t("promos")}</span>}
        {product.free_delivery && <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white sm:text-xs">{t("freeDeliveryProduct")}</span>}
      </div>
      <button onClick={toggleFavorite} className={`absolute right-3 top-3 z-20 rounded-full bg-white/95 p-2 shadow-sm transition hover:scale-105 sm:right-4 sm:top-4 dark:bg-gray-950 ${favorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}`} title={t("favorites")}>
        <Heart size={18} fill={favorite ? "currentColor" : "none"} />
      </button>

      <Link to={`/products/${product.id}`} className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50/40 p-5 sm:p-8 dark:from-gray-800 dark:to-gray-900">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <span className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-gray-950/80 px-4 py-2 text-xs font-black text-white opacity-0 backdrop-blur transition group-hover:opacity-100 sm:inline-flex">
          <Eye size={14} /> {t("viewDetails")}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{product.category?.name || t("product")}</p>
        <Link to={`/products/${product.id}`} className="mt-2">
          <h3 className="font-black text-gray-950 text-lg leading-tight line-clamp-2 hover:text-indigo-600">{product.name}</h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {product.is_on_sale && <p className="text-sm text-gray-400 line-through">{product.price} DH</p>}
            <p className="text-xl font-black text-gray-950 sm:text-2xl">{product.current_price ?? product.price} <span className="text-sm text-indigo-600">DH</span></p>
            <p className={`text-xs font-bold ${isOutOfStock ? "text-indigo-500" : product.stock < 10 ? "text-amber-500" : "text-emerald-500"}`}>
              {isOutOfStock ? t("soonAvailable") : product.stock < 10 ? t("lowStockCount", { count: product.stock }) : t("inStock")}
            </p>
          </div>
          <button disabled={busy || isOutOfStock} onClick={addToCart} className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0 disabled:bg-gray-300 disabled:shadow-none sm:p-4" title={t("addToCart")}>
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
