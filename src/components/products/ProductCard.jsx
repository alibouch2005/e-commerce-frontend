import { Link } from "react-router-dom";

export default function ProductCard({ product }) {

  return (

    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4">

      <img
        src={`http://localhost:8000${product.image}`}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-3"
      />

      <h3 className="font-semibold text-lg mb-1">
        {product.name}
      </h3>

      <p className="text-gray-500 text-sm mb-2">
        {product.category?.name}
      </p>

      <div className="flex items-center justify-between">

        <span className="text-indigo-600 font-bold">
          {product.price} DH
        </span>

        <Link
          to={`/products/${product.id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          Voir
        </Link>

      </div>

    </div>

  );

}