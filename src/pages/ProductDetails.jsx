import { useEffect, useState ,useContext} from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/productService";
import ProductDetailsSkeleton from "../components/products/ProductDetailsSkeleton";
import { addToCart } from "../services/cartService";
import { CartContext } from "../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
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
    : "https://via.placeholder.com/600x400?text=Produit";

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, 1);

      alert("Produit ajouté au panier");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-full object-contain"
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

          <button
            onClick={handleAddToCart}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}
