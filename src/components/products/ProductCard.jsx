import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  const imageUrl = product.image
    ? `http://localhost:8000${product.image}`
    : "https://dummyimage.com/400x400/f3f4f6/6b7280&text=Produit";

  return (
    <div className="group relative bg-white rounded-[2.5rem] border border-gray-100/80 shadow-sm hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col h-[520px] overflow-hidden">
      
      {/* 1. Zone Image Premium (Flèche supprimée) */}
      <div className="relative h-[320px] w-full pt-10 px-8 pb-6 bg-white flex items-center justify-center border-b border-gray-50/50">
        
        {/* Le lien couvre toute la zone de l'image pour la navigation */}
        <Link 
          to={`/products/${product.id}`} 
          className="absolute inset-0 z-10"
        />

        <img
          src={imageUrl}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out z-0"
        />
      </div>

      {/* 2. Zone Informations */}
      <div className="p-7 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-6 bg-indigo-600 rounded-full"></div>
          <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.25em]">
            {product.category?.name || "Premium"}
          </span>
        </div>

        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-xl leading-tight mb-auto h-14 line-clamp-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* 3. Footer avec Prix et Bouton */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Total TTC</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-gray-950 tracking-tighter">
                {product.price}
              </span>
              <span className="text-sm font-bold text-indigo-600 uppercase">DH</span>
            </div>
          </div>

          <Link 
            to={`/products/${product.id}`}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:shadow-indigo-300 active:scale-95"
          >
            Voir <ShoppingCart size={14} strokeWidth={3} />
          </Link>
        </div>
      </div>
    </div>
  );
}