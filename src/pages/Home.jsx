import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgePercent, Heart, MapPin, PackageSearch, Search, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import api from "../Api/axios";
import { AuthContext } from "../context/AuthContext";
import ProductGrid from "../components/products/ProductGrid";
import ProductSkeletonGrid from "../components/products/ProductSkeletonGrid";
import { useLanguage } from "../context/LanguageContext";
import ShoppingGuide from "../components/ShoppingGuide";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [newProducts, setNewProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState("/store-hero-pro.png");
  const [heroReady, setHeroReady] = useState(true);
  const [quickSearch, setQuickSearch] = useState("");
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const requests = [
        api.get("/api/products?per_page=8"),
        api.get("/api/products?featured=1&per_page=8"),
        api.get("/api/products?on_sale=1&per_page=8"),
      ];
      if (user?.role === "client") requests.push(api.get("/api/user/favorites"));
      const [newRes, featuredRes, saleRes, favoriteRes] = await Promise.allSettled(requests);
      setNewProducts(newRes.value?.data?.data || []);
      setFeaturedProducts(featuredRes.value?.data?.data || []);
      setSaleProducts(saleRes.value?.data?.data || []);
      setFavoriteProducts(favoriteRes?.value?.data?.data || []);
      setError(newRes.status === 'rejected' || featuredRes.status === 'rejected' || saleRes.status === 'rejected');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "admin") return navigate("/admin/dashboard", { replace: true });
    if (user?.role === "livreur") return navigate("/deliveries", { replace: true });
    fetchData();
  }, [user, navigate, fetchData]);

  const submitQuickSearch = (event) => {
    event.preventDefault();
    const query = quickSearch.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-950">
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-indigo-50 text-gray-950 sm:min-h-[640px]">
        {heroReady && (
          <img
            src={heroImage}
            onError={() => {
              setHeroReady(false);
              setHeroImage("");
            }}
            alt="AliShop"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover brightness-[1.08] saturate-[1.12]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/96 via-indigo-50/82 to-sky-100/20" />
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute right-[18%] top-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#f6f7fb] to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 pb-16 pt-12 sm:min-h-[640px] sm:px-6 sm:pb-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 shadow-sm backdrop-blur sm:px-4 sm:text-xs">
              <MapPin size={16} /> Casablanca · {t("deliveryPickup")}
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl md:leading-none">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg">
              {t("heroSubtitle")}
            </p>

            <form onSubmit={submitQuickSearch} className="mt-7 flex max-w-2xl flex-col gap-3 rounded-2xl border border-white/15 bg-white p-2 shadow-2xl sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 text-gray-500">
                <Search size={20} className="shrink-0" />
                <input
                  value={quickSearch}
                  onChange={(event) => setQuickSearch(event.target.value)}
                  placeholder={t("searchHero")}
                  aria-label={t("searchProducts")}
                  className="min-h-12 w-full bg-transparent text-base text-gray-950 outline-none"
                />
              </div>
              <button className="rounded-xl bg-indigo-600 px-6 py-3 font-black text-white hover:bg-indigo-700">
                {t("searchProducts")}
              </button>
            </form>

            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link to="/products" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700">
                {t("exploreProducts")} <ArrowRight size={18} />
              </Link>
              <Link to="/support" className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white/80 px-6 py-3 font-bold text-indigo-700 shadow-sm backdrop-blur hover:bg-white">
                {t("needHelp")}
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              <HeroStat value="24h" label={t("fastProcessing")} />
              <HeroStat value="CMI" label={t("cardPayment")} />
              <HeroStat value={t("twoModes")} label={t("deliveryPickup")} />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 sm:py-12 lg:space-y-14">
        <div className="grid gap-4 md:grid-cols-3">
          <FeatureCard icon={<PackageSearch className="text-indigo-600" />} title={t("organizedCatalog")} text={t("organizedCatalogText")} />
          <FeatureCard icon={<Truck className="text-emerald-600" />} title={t("deliveryPickupTitle")} text={t("deliveryPickupText")} />
          <FeatureCard icon={<ShieldCheck className="text-amber-600" />} title={t("cmiSecure")} text={`${t("cashPayment")} / ${t("cardPayment")}`} />
        </div>

        {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-5 text-gray-900">
          <p>{t('catalogLoadError')}</p>
          <button type="button" onClick={fetchData} className="mt-3 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">{t('retry')}</button>
        </div>}
        {loading ? <ProductSkeletonGrid /> : (
          <>
            {featuredProducts.length > 0 && <ProductSection title={t("featuredProducts")} subtitle={t("featuredProductsSubtitle")} products={featuredProducts} icon={<Star size={18} />} t={t} />}
            <ProductSection title={t("latestProducts")} subtitle={t("latestProductsSubtitle")} products={newProducts} icon={<Sparkles size={18} />} t={t} />
            <ProductSection title={t("promoProducts")} subtitle={t("promoProductsSubtitle")} products={saleProducts} icon={<BadgePercent size={18} />} empty={t("noActivePromos")} t={t} to="/products?sale=1" />
            {user?.role === "client" && <ProductSection title={t("yourFavorites")} subtitle={t("yourFavoritesSubtitle")} products={favoriteProducts.slice(0, 8)} icon={<Heart size={18} />} empty={t("noFavoriteHome")} favoriteByDefault t={t} to="/favorites" />}
          </>
        )}
        <ShoppingGuide />
      </div>
    </div>
  );
}

function HeroStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-white bg-white/75 p-3 text-center shadow-sm backdrop-blur">
      <p className="text-lg font-black text-indigo-700 sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50">{icon}</div>
      <div>
        <b>{title}</b>
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}

function ProductSection({ title, subtitle, products, icon, t, empty, favoriteByDefault = false, to = '/products' }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">{icon}{title}</p>
          <h2 className="mt-1 text-2xl font-black text-gray-950 sm:text-3xl">{subtitle}</h2>
        </div>
        <Link to={to} className="shrink-0 rounded-lg px-2 py-3 text-sm font-bold text-indigo-600 hover:text-indigo-800">{t("viewAll")}</Link>
      </div>
      {products.length ? <ProductGrid products={products} favoriteByDefault={favoriteByDefault} /> : <div className="rounded-2xl border border-gray-100 bg-white p-8 text-gray-400">{empty || t("noProductAvailable")}</div>}
    </section>
  );
}
