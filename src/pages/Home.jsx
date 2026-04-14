import { useEffect, useState, useContext } from "react"; // Ajout de useContext
import api from "../Api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import du contexte

// Import des composants modulaires
import ProductGrid from "../components/products/ProductGrid";
import ProductSkeletonGrid from "../components/products/ProductSkeletonGrid";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Utilisation de l'utilisateur du contexte

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gestion des redirections basée sur le rôle
    if (user?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    if (user?.role === "livreur") {
      navigate("/deliveries", { replace: true });
      return;
    }

    // On ne charge les données que si l'utilisateur n'est pas un admin ou livreur
    fetchData();
  }, [user, navigate]); // On surveille 'user' pour réagir aux changements de connexion

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProducts, resCategories] = await Promise.all([
        api.get("/api/products"),
        api.get("/api/categories"),
      ]);

      setProducts(resProducts.data.data || resProducts.data);
      setCategories(resCategories.data);
    } catch (err) {
      console.error("Erreur fetch Home:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage local par catégorie
  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p) => p.category_id === activeCategory);

  return (
    <div className="bg-[#F8F9FD] min-h-screen pb-20">
      
      {/* HERO SECTION PREMIUM */}
      <div className="bg-white border-b p-12 mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
          Bienvenue sur <span className="text-indigo-600">AliShop</span>
        </h1>
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">
          Premium E-commerce Experience
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* FILTRE DE CATÉGORIES */}
        <div className="flex gap-3 overflow-x-auto pb-8 justify-center">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeCategory === "all" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                : "bg-white text-gray-400 border border-gray-100 hover:border-indigo-200"
            }`}
          >
            Tous
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeCategory === cat.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "bg-white text-gray-400 border border-gray-100 hover:border-indigo-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* GRILLE DE PRODUITS */}
        <main>
          {loading ? (
            <ProductSkeletonGrid />
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </main>
      </div>
    </div>
  );
}