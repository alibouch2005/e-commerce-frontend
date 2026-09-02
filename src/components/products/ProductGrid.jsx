import ProductCard from "./ProductCard";
import { useLanguage } from "../../context/LanguageContext";

export default function ProductGrid({ products, favoriteByDefault = false }) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="soft-card flex flex-col items-center justify-center rounded-3xl border-dashed px-4 py-14 text-center sm:py-20">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          {t("noProductAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 lg:gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} favoriteByDefault={favoriteByDefault} />
      ))}
    </div>
  );
}
