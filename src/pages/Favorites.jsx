import { useEffect, useState } from "react";
import api from "../Api/axios";
import ProductGrid from "../components/products/ProductGrid";
import ProductSkeletonGrid from "../components/products/ProductSkeletonGrid";
import { useLanguage } from "../context/LanguageContext";

export default function Favorites() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/user/favorites")
      .then(({ data }) => setProducts(data?.data || data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-indigo-50 to-fuchsia-50 p-6 shadow-[0_22px_65px_-30px_rgba(79,70,229,.45)] sm:p-8 dark:from-gray-900 dark:via-indigo-950 dark:to-gray-900">
          <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-fuchsia-300/30 blur-3xl" />
          <p className="relative text-xs font-black uppercase tracking-widest text-indigo-600">{t("favoriteSelection")}</p>
          <h1 className="premium-heading relative mt-1 text-3xl font-black sm:text-4xl">{t("favoriteProducts")}</h1>
        </div>
        {loading ? <ProductSkeletonGrid /> : products.length ? <ProductGrid products={products} favoriteByDefault /> : <div className="premium-surface rounded-3xl p-8 text-center text-gray-500 sm:p-12">{t("noFavorites")}</div>}
      </div>
    </div>
  );
}
