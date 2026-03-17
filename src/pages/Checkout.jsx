import { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Checkout() {

  const { cart, reloadCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    adresse_livraison: user?.address || "",
    phone: user?.phone || "",
    payment_method: "cash",
  });

  const [loading, setLoading] = useState(false);

  // 🔥 PANIER VIDE
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-semibold">
          🛒 Votre panier est vide
        </h2>

        <button
          onClick={() => navigate("/products")}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Voir produits
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.adresse_livraison) {
      return toast.error("Adresse obligatoire");
    }

    if (!form.phone) {
      return toast.error("Téléphone obligatoire");
    }

    try {
      setLoading(true);

      await api.post("/api/checkout", form);

      toast.success("Commande confirmée 🚚");

      reloadCart();

      navigate("/orders");

    } catch (err) {
      console.log(err.response?.data);

      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msg) => {
          toast.error(msg[0]);
        });
      } else {
        toast.error(err.response?.data?.message || "Erreur checkout");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">
        🧾 Checkout
      </h1>

      <div className="grid md:grid-cols-2 gap-8">

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

          <input
            placeholder="Adresse livraison"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
            value={form.adresse_livraison}
            onChange={(e) =>
              setForm({ ...form, adresse_livraison: e.target.value })
            }
          />

          <input
            placeholder="Téléphone"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <select
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500"
            value={form.payment_method}
            onChange={(e) =>
              setForm({ ...form, payment_method: e.target.value })
            }
          >
            <option value="cash">Paiement à la livraison</option>
          </select>

          <button
            className="bg-green-600 text-white px-6 py-3 rounded-lg w-full hover:bg-green-700 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Traitement..." : "Confirmer commande"}
          </button>

        </form>

        {/* RESUME */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-bold mb-4">Résumé</h2>

          {cart.items.map(item => (
            <div key={item.id} className="flex justify-between mb-2 text-sm">
              <span>{item.product.name} x{item.quantity}</span>
              <span>{item.total_price} DH</span>
            </div>
          ))}

          <hr className="my-3" />

          <div className="mt-4 font-bold text-right text-lg">
            Total : {cart.total} DH
          </div>
        </div>

      </div>

    </div>
  );
}