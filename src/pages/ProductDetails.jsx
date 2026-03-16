import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import ProductDetailsSkeleton from "../components/products/ProductDetailsSkeleton";
//import { addToCart } from "../services/cartService";
import { CartContext } from "../context/CartContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useContext(CartContext);

  useEffect(() => {
    getProduct(id)
      .then((res) => {
        setProduct(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  if (!product) {
    return <ProductDetailsSkeleton />;
  }

  const imageUrl = product.image
    ? `http://localhost:8000${product.image}`
    : "https://dummyimage.com/600x400/e5e7eb/6b7280&text=Produit";

  const handleAddToCart = async () => {
    try {
       flyToCart();
      await addItem(product.id, 1);

      toast.success("Produit ajouté au panier 🛒");
      setAdded(true);
 shakeCart();
      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };
  const flyToCart = () => {

  const product = document.getElementById("product-image");
  const cart = document.getElementById("cart-icon");

  if (!product || !cart) return;

  const productRect = product.getBoundingClientRect();
  const cartRect = cart.getBoundingClientRect();

  const clone = product.cloneNode(true);

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
      { transform: "scale(1)" }
    ],
    {
      duration: 300,
      easing: "ease-out"
    }
  );

};
const shakeCart = () => {

  const cart = document.getElementById("cart-icon");

  if (!cart) return;

  cart.animate(
    [
      { transform: "translateX(0px)" },
      { transform: "translateX(-3px)" },
      { transform: "translateX(3px)" },
      { transform: "translateX(0px)" }
    ],
    {
      duration: 200
    }
  );

};

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
          <motion.img
           id="product-image"
            src={imageUrl}
            alt={product.name}
            className="max-h-full object-contain"
            whileTap={{ scale: 0.9 }}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-gray-500 mb-4">{product.category?.name}</p>

          <p className="text-lg mb-6 text-gray-700">
            {product.description || "Aucune description disponible"}
          </p>

          <p className="text-2xl font-bold text-indigo-600 mb-4">
            {product.price} DH
          </p>

          <p className="mb-6">Stock : {product.stock}</p>

          <motion.button
            onClick={handleAddToCart}
            whileTap={{ scale: 0.09 }}
            className={`px-6 py-3 rounded-lg text-white transition
  ${added ? "bg-green-500" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {added ? "✔ Ajouté" : "Ajouter au panier"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
