import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgePercent, PackageSearch, SlidersHorizontal, Sparkles } from "lucide-react";
import useProducts from "../hooks/useProducts";
import ProductGrid from "../components/products/ProductGrid";
import ProductPagination from "../components/products/ProductPagination";
import ProductSearch from "../components/products/ProductSearch";
import ProductSkeletonGrid from "../components/products/ProductSkeletonGrid";
import CategoryFilter from "../components/categories/CategoryFilter";
import { useLanguage } from "../context/LanguageContext";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPageState] = useState(Math.max(Number(searchParams.get("page") || 1), 1));
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category_id") || null);
  const [saleOnly, setSaleOnly] = useState(searchParams.get("sale") === "1");
  const [perPage, setPerPageState] = useState([12, 24, 48].includes(Number(searchParams.get("per_page"))) ? Number(searchParams.get("per_page")) : 12);
  const { t } = useLanguage();
  const { products, lastPage, meta, loading } = useProducts(page, search, category, saleOnly, perPage);

  const syncQuery = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === false) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const setPage = (nextPage) => {
    const resolvedPage = typeof nextPage === "function" ? nextPage(page) : nextPage;
    const safePage = Math.max(Number(resolvedPage || 1), 1);
    setPageState(safePage);
    syncQuery({ page: safePage > 1 ? safePage : null });
  };

  const setPerPage = (nextPerPage) => {
    setPerPageState(nextPerPage);
    setPageState(1);
    syncQuery({ per_page: nextPerPage, page: null });
  };

  const handleSearchChange = (nextValue) => {
    setSearch(nextValue);
    setPageState(1);
    syncQuery({ search: nextValue, page: null });
  };

  const handleCategoryChange = (nextValue) => {
    setCategory(nextValue);
    setPageState(1);
    syncQuery({ category_id: nextValue, page: null });
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] pb-16 sm:pb-20">
      <section className="relative overflow-hidden bg-gray-950 text-white">
        <img
          src="/store-hero-pro.png"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/88 to-gray-950/55" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white">
            <PackageSearch size={15} /> {t("catalog")} AliShop
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{t("catalogTitle")}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-200 sm:text-base">
                {t("catalogSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button onClick={() => { setSaleOnly(true); setPageState(1); syncQuery({ sale: 1, page: null }); }} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white ${saleOnly ? "bg-amber-500" : "bg-white/10 hover:bg-white/20"}`}>
                <BadgePercent size={17} /> {t("promos")}
              </button>
              <button onClick={() => { setSaleOnly(false); setPageState(1); syncQuery({ sale: null, page: null }); }} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white ${!saleOnly ? "bg-indigo-600" : "bg-white/10 hover:bg-white/20"}`}>
                <Sparkles size={17} /> {t("newProducts")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-5 max-w-7xl px-4 sm:px-6">
        <div className="relative z-10 mb-8 space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg shadow-gray-200/50 sm:mb-10 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
                <SlidersHorizontal size={15} /> {t("filters")}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {loading ? t("loading") : t("catalogCount", { count: meta?.total ?? products.length })}
              </p>
            </div>
          </div>
          <ProductSearch setSearch={handleSearchChange} initialValue={search} />
          <CategoryFilter category={category} setCategory={handleCategoryChange} />
          {saleOnly && (
            <button onClick={() => { setSaleOnly(false); setPageState(1); syncQuery({ sale: null, page: null }); }} className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100">
              {t("removePromoFilter")}
            </button>
          )}
        </div>

        {loading ? (
          <ProductSkeletonGrid />
        ) : (
          <>
            <ProductGrid products={products} />
            {products.length > 0 && (
              <div className="mt-10 flex justify-center sm:mt-12">
                <ProductPagination page={page} lastPage={lastPage} setPage={setPage} meta={meta} perPage={perPage} setPerPage={setPerPage} t={t} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
