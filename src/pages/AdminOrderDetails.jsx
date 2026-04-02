import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function AdminOrderDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/api/admin/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(err => console.error(err));
  }, []);

  if (!order) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          📦 Commande #{order.id}
        </h1>

        <button
          onClick={() => navigate("/admin/orders")}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          ⬅ Retour
        </button>
      </div>

      {/* CLIENT INFO */}
      <div className="bg-white p-6 rounded-xl shadow space-y-2">
        <h2 className="font-semibold text-lg mb-2">👤 Informations client</h2>

        <p><strong>Nom :</strong> {order.user?.name || "N/A"}</p>
        <p><strong>Téléphone :</strong> {order.phone}</p>
        <p><strong>Adresse :</strong> {order.adresse_livraison}</p>

        <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
          {order.status}
        </span>
      </div>

      {/* PRODUITS */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-semibold text-lg mb-4">
          🛒 Produits commandés
        </h2>

        <div className="space-y-4">

          {order.items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-3"
            >

              {/* LEFT */}
              <div className="flex items-center gap-4">

                <img
                  src={item.product.image || "https://dummyimage.com/100"}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg"
                />

                <div>
                  <p className="font-semibold">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.product.category?.name}
                  </p>
                </div>

              </div>

              {/* RIGHT */}
              <div className="text-right">
                <p>x{item.quantity}</p>
                <p className="font-bold">
                  {item.price * item.quantity} DH
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>

      {/* TOTAL */}
      <div className="bg-white p-6 rounded-xl shadow text-right">

        <p className="text-lg">
          Sous-total : {order.total_price} DH
        </p>

        <p className="text-2xl font-bold text-indigo-600 mt-2">
          Total : {order.total_price} DH
        </p>

      </div>

    </div>
  );
}