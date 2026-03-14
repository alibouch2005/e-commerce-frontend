import { Link } from "react-router-dom";

export default function ProductCard({ product }) {

  const imageUrl = product.image
    ? `http://localhost:8000${product.image}`
    : "https://via.placeholder.com/300x200?text=Produit";

  return (

    <Link to={`/products/${product.id}`}>

      <div className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition duration-300 p-4 cursor-pointer">

        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />

        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-gray-500 text-sm mb-2">
          {product.category?.name}
        </p>

        <div className="flex items-center justify-between">

          <span className="text-indigo-600 font-bold text-lg">
            {product.price} DH
          </span>

          <span className="text-sm text-indigo-600 hover:underline">
            Voir
          </span>

        </div>

      </div>

    </Link>

  );

}