import { useCallback, useEffect, useState } from "react";
import { Boxes, ChevronLeft, ChevronRight, PackageCheck, Search, ShoppingBag } from "lucide-react";
import api from "../Api/axios";

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "").replace(/\/api$/, "");
const assetUrl = (path) => (!path ? "/product-placeholder.svg" : path.startsWith("http") ? path : `${apiUrl}${path}`);

export default function AdminOrderedProducts() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/ordered-products", {
        params: { page, per_page: 20, search: search.trim() || undefined },
      });
      setProducts(data.data || []);
      setMeta(data);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProducts(), 250);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <header className="overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-indigo-600"><PackageCheck size={16} /> Analyse des ventes</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Produits commandés</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Pour chaque produit, consultez le nombre de commandes valides et le stock disponible maintenant.</p>
          </div>
          <Stat icon={<ShoppingBag size={17} />} value={meta.total || 0} label="Produits ayant des commandes" />
        </div>
      </header>

      <section className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <label className="relative block max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Rechercher un produit commandé…" className="min-h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
          </label>
        </div>

        {loading ? (
          <div role="status" className="grid min-h-72 place-items-center text-sm font-bold text-gray-400">Chargement des produits commandés…</div>
        ) : products.length ? (
          <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 p-3 transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-950/5">
                <img src={assetUrl(product.image)} alt="" className="h-20 w-20 shrink-0 rounded-2xl bg-white object-cover shadow-sm ring-1 ring-gray-100" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-black uppercase tracking-wider text-indigo-500">{product.category?.name || "Catalogue"}</p>
                  <h2 className="mt-1 line-clamp-2 font-black text-gray-950">{product.name}</h2>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <ProductMetric icon={<ShoppingBag size={14} />} value={product.orders_count} label={Number(product.orders_count) > 1 ? "Commandes" : "Commande"} tone="indigo" />
                    <ProductMetric icon={<Boxes size={14} />} value={product.stock} label="Stock actuel" tone={Number(product.stock) < 10 ? "amber" : "emerald"} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center p-8 text-center"><div><PackageCheck className="mx-auto text-indigo-200" size={42} /><b className="mt-4 block text-gray-800">Aucun produit commandé</b><p className="mt-1 text-sm text-gray-400">Les produits apparaîtront ici après une première commande valide.</p></div></div>
        )}

        {Number(meta.last_page || 1) > 1 && (
          <nav aria-label="Pagination des produits commandés" className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-3 sm:justify-end sm:gap-3">
            <button type="button" aria-label="Page précédente" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="grid h-11 w-11 place-items-center rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <b className="rounded-xl bg-white px-4 py-3 text-xs text-indigo-700 shadow-sm">Page {meta.current_page || page} / {meta.last_page}</b>
            <button type="button" aria-label="Page suivante" disabled={page >= Number(meta.last_page)} onClick={() => setPage((value) => value + 1)} className="grid h-11 w-11 place-items-center rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-30"><ChevronRight size={18} /></button>
          </nav>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, value, label }) {
  return <div className="min-w-32 rounded-2xl border border-white bg-white/80 p-3 shadow-sm"><span className="flex items-center gap-2 text-indigo-600">{icon}<b className="text-xl text-slate-950">{value}</b></span><p className="mt-1 text-[9px] font-black uppercase tracking-wide text-gray-400">{label}</p></div>;
}

function ProductMetric({ icon, value, label, tone }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return <div className={`rounded-xl px-2.5 py-2 ${tones[tone]}`}><span className="flex items-center gap-1.5"><span>{icon}</span><b className="text-lg leading-none">{Number(value || 0)}</b></span><span className="mt-1 block text-[9px] font-black uppercase tracking-wide">{label}</span></div>;
}
