import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function useProducts(page, search, category, saleOnly = false, perPage = 12, onPageResolved) {
  const [products, setProducts] = useState([]);
  const [lastPage, setLastPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page,
          search,
          category_id: category,
          on_sale: saleOnly ? 1 : undefined,
          per_page: perPage,
        };

        let res = await getProducts(params, controller.signal);

        if (!active) return;

        let nextMeta = res.data.meta ?? res.data;
        const resolvedLastPage = Math.max(Number(nextMeta?.last_page ?? res.data.last_page ?? 1), 1);

        if (Number(page) > resolvedLastPage) {
          res = await getProducts({ ...params, page: resolvedLastPage }, controller.signal);
          if (!active) return;
          nextMeta = res.data.meta ?? res.data;
          onPageResolved?.(resolvedLastPage);
        }

        setProducts(res.data.data ?? []);
        setMeta(nextMeta);
        setLastPage(Number(nextMeta?.last_page ?? res.data.last_page ?? 1));
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
      controller.abort();
    };
  }, [page, search, category, saleOnly, perPage, onPageResolved, attempt]);

  return { products, lastPage, meta, loading, error, retry: () => setAttempt((value) => value + 1) };
}
