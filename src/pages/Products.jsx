import { useState, useEffect } from "react";
import useProducts from "../hooks/useProducts";
import ProductGrid from "../components/products/ProductGrid";
import ProductPagination from "../components/products/ProductPagination";
import ProductSearch from "../components/products/ProductSearch";
import ProductSkeletonGrid from "../components/products/ProductSkeletonGrid";

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { products, lastPage, loading } = useProducts(page, search);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Nos Produits</h1>

      <ProductSearch setSearch={setSearch} />

      {loading ? <ProductSkeletonGrid /> : <ProductGrid products={products} />}

      <ProductPagination page={page} lastPage={lastPage} setPage={setPage} />
    </div>
  );
}
