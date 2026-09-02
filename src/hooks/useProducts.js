import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function useProducts(page, search, category, saleOnly = false, perPage = 12) {
  const [products, setProducts] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getProducts({
          page,
          search,
          category_id: category,
          on_sale: saleOnly ? 1 : undefined,
          per_page: perPage,
        });

        if (!active) return;

        setProducts(res.data.data ?? []);
        const nextMeta = res.data.meta ?? res.data;
        setMeta(nextMeta);
        setLastPage(nextMeta?.last_page ?? res.data.last_page ?? 1);
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      active = false;
    };
  }, [page, search, category, saleOnly, perPage]);

  return { products, lastPage, meta, loading, error };
}
