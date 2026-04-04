import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import ProductDetailsSkeleton from "../components/products/ProductDetailsSkeleton";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useContext(CartContext);
  const imgRef = useRef(null);

  useEffect(() => {
    getProduct(id)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  if (!product) return <ProductDetailsSkeleton />;

  // Calcul de l'état du stock
  const isOutOfStock = product.stock <= 0;

  const imageUrl = product.image
    ? `http://localhost:8000${product.image}`
    : "https://dummyimage.com/600x400/e5e7eb/6b7280&text=Produit";

  // 🎬 ANIMATION PRODUIT → PANIER
  const flyToCart = () => {
    const productEl = imgRef.current;
    const cart = document.getElementById("cart-icon");

    if (!productEl || !cart) return;

    const productRect = productEl.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();
    const clone = productEl.cloneNode(true);

    clone.style.position = "fixed";
    clone.style.left = productRect.left + "px";
    clone.style.top = productRect.top + "px";
    clone.style.width = productRect.width + "px";
    clone.style.height = productRect.height + "px";
    clone.style.transition = "all 0.8s cubic-bezier(.25,.8,.25,1)";
    clone.style.zIndex = "1000";

    document.body.appendChild(clone);

    setTimeout(() => {
      clone.style.left = cartRect.left + "px";
      clone.style.top = cartRect.top + "px";
      clone.style.width = "30px";
      clone.style.height = "30px";
      clone.style.opacity = "0.4";
      clone.style.transform = "rotate(20deg)";
    }, 50);

    setTimeout(() => {
      clone.remove();
      bounceCart();
    }, 800);
  };

  const bounceCart = () => {
    const cart = document.getElementById("cart-icon");
    if (!cart) return;
    cart.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.3)" },
        { transform: "scale(1)" },
      ],
      { duration: 300, easing: "ease-out" },
    );
  };

  const shakeCart = () => {
    const cart = document.getElementById("cart-icon");
    if (!cart) return;
    cart.animate(
      [
        { transform: "translateX(0px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(0px)" },
      ],
      { duration: 250 },
    );
  };

  // 🛒 Ajouter au panier
  const handleAddToCart = async () => {
    if (isOutOfStock) return; // Sécurité si le stock est à 0

    try {
      flyToCart();
      await addItem(product.id, 1);
      toast.success("Produit ajouté au panier 🛒");
      setAdded(true);
      shakeCart();
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* IMAGE AVEC ÉTAT DE STOCK */}
        <div className="relative bg-gray-100 h-80 rounded-xl flex items-center justify-center overflow-hidden">
          {isOutOfStock && (
            <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
              Rupture de stock
            </div>
          )}
          <motion.img
            ref={imgRef}
            src={imageUrl}
            alt={product.name}
            className={`max-h-full object-contain ${isOutOfStock ? "grayscale opacity-50" : ""}`}
            whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
            whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
          />
        </div>

        {/* INFOS */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.category?.name}</p>
          <p className="text-lg mb-6 text-gray-700">
            {product.description || "Aucune description disponible"}
          </p>
          <p className="text-2xl font-bold text-indigo-600 mb-4">
            {product.price} DH
          </p>

          {/* AFFICHAGE DU STOCK */}
          <div className="mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold ${isOutOfStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
            >
              {isOutOfStock ? "🚫 Épuisé" : `📦 En stock : ${product.stock}`}
            </span>
          </div>

          {/* BOUTON DYNAMIQUE */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
            className={`px-8 py-3 rounded-lg text-white font-bold transition-all duration-300 shadow-md
              ${
                isOutOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : added
                    ? "bg-green-500 scale-105"
                    : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {isOutOfStock
              ? "Indisponible"
              : added
                ? "✔ Ajouté !"
                : "Ajouter au panier"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
