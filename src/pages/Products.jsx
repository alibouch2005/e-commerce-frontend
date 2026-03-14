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
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nos Produits</h1>

      <ProductSearch setSearch={setSearch} />
      <CategoryFilter category={category} setCategory={setCategory} />

      {loading ? <ProductSkeletonGrid /> : <ProductGrid products={products} />}

      <ProductPagination page={page} lastPage={lastPage} setPage={setPage} />
    </div>
  );
}
