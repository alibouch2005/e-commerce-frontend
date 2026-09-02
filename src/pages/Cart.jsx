import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartContext } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function Cart() {
  const { cart, loading, updateItemQuantity, removeItem } = useContext(CartContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const subtotal = Number(cart?.total || 0);
  const fallbackImage = "/product-placeholder.svg";

  const handleCheckout = () => {
    navigate("/checkout");
  };

  const changeQty = async (item, quantity) => {
    if (quantity < 1) return;
    setUpdatingId(item.id);
    try {
      await updateItemQuantity(item, quantity);
    } catch (error) {
      showApiError(error, t("quantityError"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (item) => {
    setUpdatingId(item.id);
    try {
      await removeItem(item);
      toast.success(t("productRemoved"));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="text-center mt-10">{t("loading")}</p>;
  if (!cart?.items?.length) {
    return <div className="text-center mt-20"><h2 className="text-2xl font-black">{t("emptyCart")}</h2><button onClick={() => navigate("/products")} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg">{t("seeProducts")}</button></div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-6 text-3xl font-black sm:mb-8 sm:text-4xl">{t("cart")}</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className={`flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition md:flex-row md:items-center ${updatingId === item.id ? "opacity-80" : ""}`}>
                <div className="flex items-center gap-4">
                  <img
                    src={item.product?.image || fallbackImage}
                    className="w-20 h-20 object-cover rounded-2xl bg-gray-50"
                    alt={item.product?.name}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div>
                    <h3 className="font-black">{item.product.name}</h3>
                    <div className="text-sm">
                      {item.product?.is_on_sale && <span className="mr-2 text-gray-400 line-through">{item.product.price} DH</span>}
                      <span className="font-bold text-indigo-600">{item.price} DH</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center rounded-xl border bg-white">
                    <button disabled={updatingId === item.id || item.quantity <= 1} onClick={() => changeQty(item, item.quantity - 1)} className="p-3 transition hover:bg-gray-50 disabled:opacity-30"><Minus size={16} /></button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button disabled={updatingId === item.id || (item.product?.stock && item.quantity >= item.product.stock)} onClick={() => changeQty(item, item.quantity + 1)} className="p-3 transition hover:bg-gray-50 disabled:opacity-30"><Plus size={16} /></button>
                  </div>
                  <div className="min-w-24 text-right font-black">{Number(item.total_price).toFixed(2)} DH</div>
                  <button disabled={updatingId === item.id} onClick={() => handleRemoveItem(item)} className="rounded-xl bg-red-50 p-3 text-red-500 hover:bg-red-100"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:sticky md:top-24 sm:p-6">
            <h2 className="text-xl font-black mb-4">{t("summary")}</h2>
            <div className="flex justify-between mb-2"><span>{t("subtotal")}</span><span>{subtotal.toFixed(2)} DH</span></div>
            <div className="mb-2 rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">{t("deliveryCalculatedCheckout")}</div>
            <hr className="my-4" />
            <div className="flex justify-between font-black text-lg"><span>{t("total")}</span><span>{subtotal.toFixed(2)} DH</span></div>
            <button onClick={handleCheckout} className="w-full mt-5 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700">{t("placeOrder")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
