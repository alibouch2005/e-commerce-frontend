import { useState } from "react";
import api from "../Api/axios";

export default function Home() {

  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    const res = await api.get("/api/products");
    setProducts(res.data.data);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 text-center">

      <h1 className="text-3xl font-bold mb-6">
        Bienvenue sur mon e-commerce 🛒
      </h1>

      <button
        onClick={loadProducts}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg mb-6"
      >
        Charger produits (Seeder)
      </button>

      <div className="grid md:grid-cols-3 gap-4">

        {products.map(p => (
          <div key={p.id} className="bg-white p-4 shadow rounded">
            <img src={p.image} className="h-32 mx-auto" />
            <h2>{p.name}</h2>
            <p>{p.price} DH</p>
          </div>
        ))}

      </div>

    </div>
  );
}