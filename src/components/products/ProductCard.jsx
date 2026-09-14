import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../Api/axios";
import { useLanguage } from "../../context/LanguageContext";
import { showApiError } from "../../utils/showApiError";
import { formatAmount } from "../../utils/money";

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
    if (product.has_variants) {
      toast(t('chooseOptions'));
      navigate(`/products/${product.id}`);
      return;
    }

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
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/60 sm:rounded-3xl dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-900">
      <div className="absolute left-2 top-2 z-20 flex max-w-[68%] flex-col items-start gap-1 sm:left-4 sm:top-4 sm:gap-2">
        {product.is_on_sale && <span className="max-w-full truncate rounded-full bg-amber-500 px-2 py-1 text-[8px] font-black text-white sm:px-3 sm:text-xs">{t("promos")}</span>}
        {product.free_delivery && <span className="max-w-full truncate rounded-full bg-emerald-500 px-2 py-1 text-[8px] font-black text-white sm:px-3 sm:text-xs">{t("freeDeliveryProduct")}</span>}
      </div>
      <button onClick={toggleFavorite} className={`absolute right-2 top-2 z-20 rounded-full bg-white/95 p-1.5 shadow-sm transition hover:scale-105 sm:right-4 sm:top-4 sm:p-2 dark:bg-gray-950 ${favorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}`} title={t("favorites")}>
        <Heart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill={favorite ? "currentColor" : "none"} />
      </button>

      <Link to={`/products/${product.id}`} className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-indigo-50/40 p-2.5 sm:p-8 dark:from-gray-800 dark:to-gray-900">
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

      <div className="flex flex-1 flex-col p-3 sm:p-6">
        <p className="truncate text-[8px] font-black uppercase tracking-wider text-indigo-500 sm:text-[10px] sm:tracking-widest">{product.category?.name || t("product")}</p>
        <Link to={`/products/${product.id}`} className="mt-1.5 sm:mt-2">
          <h3 className="line-clamp-2 text-sm font-black leading-tight text-gray-950 hover:text-indigo-600 sm:text-lg title-product">{product.name}</h3>
        </Link>
        {(product.short_description || product.description) && (
          <p className="mt-1.5 hidden line-clamp-2 text-sm leading-6 text-gray-500 sm:block">
            {product.short_description || product.description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-3 sm:gap-3 sm:pt-5">
          <div className="min-w-0">
            {product.is_on_sale && <p className="truncate text-[10px] text-gray-400 line-through sm:text-sm">{formatAmount(product.price)} DH</p>}
            <p className="truncate text-base font-black text-gray-950 sm:text-2xl">{formatAmount(product.current_price ?? product.price)} <span className="text-[10px] text-indigo-600 sm:text-sm">DH</span></p>
            <p className={`truncate text-[9px] font-bold sm:text-xs ${isOutOfStock ? "text-indigo-500" : product.stock < 10 ? "text-amber-500" : "text-emerald-500"}`}>
              {isOutOfStock ? t("soonAvailable") : product.stock < 10 ? t("lowStockCount", { count: product.stock }) : t("inStock")}
            </p>
          </div>
          <button disabled={busy || isOutOfStock} onClick={addToCart} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:translate-y-0 disabled:bg-gray-300 disabled:shadow-none sm:h-12 sm:w-12 sm:rounded-2xl" title={t("addToCart")}>
            <ShoppingBag className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
