import { useEffect, useState } from "react";
import api from "../Api/axios";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, Star, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resProducts, resCategories] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/categories")
      ]);
      setProducts(resProducts.data.data || resProducts.data);
      setCategories(resCategories.data);
    } catch (err) {
      console.error("Erreur chargement Home", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category_id === activeCategory);

  return (
    <div className="bg-white min-h-screen">
      
      {/* --- HERO SECTION (Image modifiée pour style Marjane) --- */}
      <section className="relative bg-indigo-950 h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          {/* 🔥 Nouvelle image : Rayons de supermarché modernes */}
          <img 
            src="https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&q=80" 
            alt="Rayons supermarché" 
            className="w-full h-full object-cover object-center" 
          />
          {/* Overlay dégradé pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/80 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="bg-indigo-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Offres de la semaine</span>
            <h1 className="text-5xl md:text-7xl font-extrabold mt-4 mb-6 leading-tight">
              Tout pour la maison, <br /> <span className="text-indigo-400">à prix réduit.</span>
            </h1>
            <p className="text-lg text-indigo-100 max-w-xl mb-8">
              Alimentation, Électroménager, High-Tech : profitez de nos exclusivités web avec livraison partout au Maroc.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-indigo-950 px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
                Découvrir les rayons <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- REASSURANCE --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-50">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Truck /></div>
            <div><h4 className="font-bold">Livraison Nationale</h4><p className="text-sm text-gray-500">Rapide et sécurisée</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-50">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck /></div>
            <div><h4 className="font-bold">Paiement 100% Sécurisé</h4><p className="text-sm text-gray-500">Carte ou Espèces</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-50">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Star /></div>
            <div><h4 className="font-bold">Garantie Qualité</h4><p className="text-sm text-gray-500">Produits certifiés</p></div>
          </div>
        </div>
      </div>

      {/* --- FILTRES CATÉGORIES --- */}
      <main className="max-w-7xl mx-auto p-6 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 italic uppercase">Arrivages du jour</h2>
            <div className="h-1.5 w-20 bg-indigo-600 mt-2 rounded-full"></div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            <button 
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Tous les rayons
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRID PRODUITS --- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(n => <div key={n} className="h-96 bg-gray-100 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map(p => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={p.id} 
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 relative"
              >
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden bg-white p-4">
                  <img 
                    src={p.image ? `http://localhost:8000${p.image}` : "https://dummyimage.com/400x500"} 
                    className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ${p.stock <= 0 ? 'grayscale opacity-50' : ''}`} 
                    alt={p.name}
                  />
                  {p.stock <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg font-black text-xs text-red-600 shadow-xl">ÉPUISÉ</span>
                    </div>
                  )}
                  {/* Lien invisible sur toute l'image */}
                  <Link 
                    to={`/product/${p.id}`} 
                    className="absolute inset-0 z-10"
                  />
                </div>

                {/* Content */}
                <div className="p-6 pt-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{p.category?.name || 'Général'}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-base leading-snug truncate-2-lines mb-4 h-12">{p.name}</h3>
                  
                  <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                    <div>
                      <p className="text-sm text-gray-400">Prix unitaire</p>
                      <p className="text-3xl font-black text-gray-900">{p.price} <span className="text-base font-medium">DH</span></p>
                    </div>
                    <Link 
                      to={`/product/${p.id}`}
                      className={`p-4 rounded-2xl transition-all ${p.stock <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95'}`}
                    >
                      <ShoppingCart size={22} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 text-xl font-medium">Aucun produit trouvé dans ce rayon. 🔍</p>
          </div>
        )}
      </main>

      {/* --- FOOTER SIMPLE --- */}
      <footer className="bg-gray-50 border-t border-gray-100 mt-20 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2026 Alishop - Groupe Ali Bouchouar. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}