import { useState, useEffect } from "react";
import useProducts from "../hooks/useProducts";
import ProductGrid from "../components/products/ProductGrid";
import ProductPagination from "../components/products/ProductPagination";
import ProductSearch from "../components/products/ProductSearch";
import ProductSkeletonGrid from "../components/products/ProductSkeletonGrid";
import CategoryFilter from "../components/categories/CategoryFilter";

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(null);

  const { products, lastPage, loading } = useProducts(page, search, category);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  return (
    <div className="bg-[#F8F9FD] min-h-screen pb-20">
      {/* HEADER SIMPLE */}
      <div className="bg-white border-b px-8 py-10 mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Catalogue</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Découvrez nos produits premium</p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* FILTERS */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-10 space-y-6">
          <ProductSearch setSearch={setSearch} />
          <CategoryFilter category={category} setCategory={setCategory} />
        </div>

        {/* CONTENT */}
        {loading ? (
          <ProductSkeletonGrid />
        ) : (
          <>
            <ProductGrid products={products} />
            {products.length > 0 && (
              <div className="mt-12 flex justify-center">
                <ProductPagination page={page} lastPage={lastPage} setPage={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}