import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Filter,
  Lightbulb,
  Loader2,
  PackagePlus,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import api from "../Api/axios";
import toast from "react-hot-toast";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const assetUrl = (path) => (!path ? "" : path.startsWith("http") ? path : `${apiUrl}${path}`);

const priorityStyles = {
  Haute: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Moyenne: "bg-amber-50 text-amber-700 border-amber-100",
  Faible: "bg-gray-50 text-gray-600 border-gray-100",
};

export default function AdminWiniProducts() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/admin/stats");
        setStats(data);
      } catch (error) {
        console.error(error);
        toast.error("Impossible de charger Wini product");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const suggestions = useMemo(() => stats?.market_suggestions || [], [stats]);
  const requests = useMemo(() => stats?.requested_products || [], [stats]);

  const categories = useMemo(() => (
    ["all", ...new Set(suggestions.map((item) => item.category).filter(Boolean))]
  ), [suggestions]);

  const filteredSuggestions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return suggestions.filter((item) => {
      const matchesSearch = !needle || [item.name, item.category, item.reason, item.source]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      const matchesCategory = category === "all" || item.category === category;
      const matchesPriority = priority === "all" || item.priority === priority;
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [category, priority, search, suggestions]);

  const topScore = suggestions[0]?.score || 0;
  const highPriorityCount = suggestions.filter((item) => item.priority === "Haute").length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-indigo-600">
        <Loader2 className="animate-spin" size={38} />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-3xl bg-gray-950 text-white shadow-xl">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-100">
              <Sparkles size={16} /> Wini product
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
              Produits tendance à tester pour AliShop.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
              Une page admin dédiée pour décider quoi ajouter au catalogue : tendances e-commerce Maroc,
              demandes réelles des clients, score priorité, marge et prix de test.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <HeroMetric label="Meilleur score" value={`${topScore}/100`} />
              <HeroMetric label="Priorité haute" value={highPriorityCount} />
              <HeroMetric label="Demandes clients" value={stats?.product_requests_count || 0} />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <p className="flex items-center gap-2 text-sm font-black text-indigo-100">
              <Lightbulb size={18} /> Méthode recommandée
            </p>
            <ol className="mt-4 space-y-3 text-sm text-gray-200">
              <li>1. Ajouter 3 à 5 produits score 85+ seulement.</li>
              <li>2. Commander petit stock test, pas gros stock au début.</li>
              <li>3. Mettre photos propres + promotion lancement.</li>
              <li>4. Garder ceux qui reçoivent panier, favoris et commandes.</li>
            </ol>
            <Link
              to="/admin/products"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-gray-950 transition hover:bg-indigo-50"
            >
              <PackagePlus size={19} /> Ajouter au catalogue
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Recherche marché</p>
            <h2 className="text-2xl font-black text-gray-950">Liste des produits tendance</h2>
            <p className="mt-1 text-sm text-gray-500">Filtre les produits selon catégorie, priorité ou mot-clé.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_190px_170px] lg:w-[720px]">
            <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Chercher écouteurs, cuisine, beauté..."
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none">
              {categories.map((item) => <option key={item} value={item}>{item === "all" ? "Toutes catégories" : item}</option>)}
            </select>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none">
              <option value="all">Toutes priorités</option>
              <option value="Haute">Haute</option>
              <option value="Moyenne">Moyenne</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSuggestions.map((item, index) => (
            <article key={`${item.name}-${item.score}`} className="group rounded-3xl border border-gray-100 bg-gray-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-600">#{index + 1} · {item.category}</p>
                  <h3 className="mt-2 text-xl font-black text-gray-950">{item.name}</h3>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <b className="block text-lg text-gray-950">{item.score}</b>
                  <span className="text-[10px] font-black text-gray-400">/100</span>
                </div>
              </div>

              <p className="mt-4 min-h-16 text-sm leading-6 text-gray-600">{item.reason}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoPill label="Prix test" value={item.test_price || "À définir"} />
                <InfoPill label="Marge" value={item.margin_level || "Moyenne"} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${priorityStyles[item.priority] || priorityStyles.Faible}`}>
                  {item.priority}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                  Saison: {item.season || "normal"}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                  MAJ {item.updated_at}
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Link to="/admin/products" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700">
                  Ajouter <ArrowUpRight size={16} />
                </Link>
                <button
                  onClick={() => navigator.clipboard?.writeText(item.name).then(() => toast.success("Nom copié"))}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 hover:border-indigo-200 hover:text-indigo-600"
                >
                  Copier nom
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
            <Filter className="mx-auto mb-3 text-gray-300" size={38} />
            Aucun produit trouvé avec ces filtres.
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-600">Demandes réelles</p>
            <h2 className="text-2xl font-black text-gray-950">Produits demandés par les clients</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ici on affiche seulement les demandes envoyées par les clients, avec photo si disponible.
            </p>
          </div>
          <span className="w-fit rounded-full bg-amber-50 px-4 py-2 text-sm font-black text-amber-700">
            {stats?.open_product_requests || 0} ouverte(s)
          </span>
        </div>

        {requests.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {requests.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-amber-100 bg-amber-50">
                {item.requested_product_image ? (
                  <img src={assetUrl(item.requested_product_image)} alt={item.requested_product_name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-white/70 text-amber-500">
                    <Camera size={34} />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="truncate font-black text-gray-950">{item.requested_product_name}</h3>
                  <p className="mt-1 text-sm font-bold text-amber-700">{item.name} · {item.requested_product_city || "Casablanca"}</p>
                  <p className="mt-3 line-clamp-3 text-xs leading-5 text-gray-600">{item.message}</p>
                  <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-gray-600">
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
            <CheckCircle2 className="mx-auto mb-3 text-emerald-400" size={40} />
            Aucun client n’a encore demandé un produit manquant.
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard title="Stock test" text="Commence par 5 à 10 unités max pour chaque nouveau produit." />
        <ActionCard title="Photos" text="Ajoute 3 photos minimum: produit seul, utilisation réelle, détail qualité." />
        <ActionCard title="Prix lancement" text="Mets une promo courte pour mesurer clics, paniers, favoris et commandes." />
      </section>
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-gray-300">{label}</p>
      <b className="mt-2 block text-2xl font-black">{value}</b>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <b className="mt-1 block text-sm text-gray-900">{value}</b>
    </div>
  );
}

function ActionCard({ title, text }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 font-black text-gray-950">
        <TrendingUp className="text-indigo-600" size={19} /> {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
    </div>
  );
}
