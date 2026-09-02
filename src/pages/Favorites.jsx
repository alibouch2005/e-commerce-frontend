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
        <div className="mb-8">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{t("favoriteSelection")}</p>
          <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">{t("favoriteProducts")}</h1>
        </div>
        {loading ? <ProductSkeletonGrid /> : products.length ? <ProductGrid products={products} favoriteByDefault /> : <div className="rounded-2xl border border-gray-100 bg-white p-8 text-gray-500 sm:p-10">{t("noFavorites")}</div>}
      </div>
    </div>
  );
}
