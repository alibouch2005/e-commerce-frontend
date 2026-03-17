import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { updateQuantity, removeFromCart } from "../services/cartService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, loading, reloadCart } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cart?.total || 0;
  const shipping = subtotal > 0 ? 30 : 0;
  const total = subtotal + shipping;

  if (loading) {
    return <p className="text-center mt-10">Chargement panier...</p>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold">Votre panier est vide 🛒</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Votre panier</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 🛍️ PRODUITS */}
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white shadow p-4 rounded-lg"
            >
              {/* Produit */}
              <div className="flex items-center gap-4">
                <img
                  src={`http://localhost:8000${item.product.image}`}
                  className="w-16 h-16 object-cover rounded"
                />

                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-500">{item.price} DH</p>
                </div>
              </div>

              {/* Quantité */}
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (item.quantity > 1) {
                      await updateQuantity(item.id, item.quantity - 1);
                      reloadCart();
                    }
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>

                <span className="font-semibold">{item.quantity}</span>

                <button
                  onClick={async () => {
                    await updateQuantity(item.id, item.quantity + 1);
                    reloadCart();
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              {/* Total */}
              <div className="font-bold">{item.total_price} DH</div>

              {/* Supprimer */}
              <button
                onClick={async () => {
                  await removeFromCart(item.id);
                  reloadCart();
                  toast.success("Produit supprimé");
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {/* 💳 RESUME */}
        <div className="bg-white shadow rounded-lg p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4">Résumé</h2>

          <div className="flex justify-between mb-2">
            <span>Sous-total</span>
            <span>{subtotal.toFixed(2)} DH</span>
          </div>

          <div className="flex justify-between mb-2">
            <span>Livraison</span>
            <span>{shipping} DH</span>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{total.toFixed(2)} DH</span>
          </div>

          {/* 🔥 CHECKOUT BUTTON */}
          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Passer la commande
          </button>
        </div>
      </div>
    </div>
  );
}