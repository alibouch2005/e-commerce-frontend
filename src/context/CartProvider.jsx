import { useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { addToCart, getCart, removeFromCart, updateQuantity } from "../services/cartService";
import { trackEvent } from "../services/analyticsService";

const normalizeCart = (cart) => ({
  total: 0,
  ...cart,
  items: cart?.items || [],
});

const itemUnitPrice = (item) => Number(item.price ?? item.product?.current_price ?? item.product?.price ?? 0);

const recalculateCart = (cart) => {
  const next = normalizeCart(cart);
  const items = next.items.map((item) => {
    const totalPrice = itemUnitPrice(item) * Number(item.quantity || 0);
    return { ...item, total_price: Number(totalPrice.toFixed(2)) };
  });

  const total = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0);
  return { ...next, items, total: Number(total.toFixed(2)) };
};

export default function CartProvider({ children }) {

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  
  // Charger le panier
  const loadCart = async () => {

    try {

      const res = await getCart();

      setCart(recalculateCart(res.data.data ?? { items: [] }));

    } catch (err) {

      console.error("Erreur chargement panier:", err);

    } finally {

      setLoading(false);

    }

  };

  // Ajouter produit
  const addItem = async (product_id, quantity = 1) => {

    try {

      await addToCart(product_id, quantity);
      trackEvent("add_to_cart", { product_id, metadata: { quantity } });

      await loadCart();

    } catch (err) {

      console.error("Erreur ajout panier:", err);
      throw err;

    }

  };

  const updateItemQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    const previousCart = cart;

    setCart((current) => recalculateCart({
      ...current,
      items: (current.items || []).map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, quantity } : currentItem
      ),
    }));

    try {
      await updateQuantity(item.id, quantity);
    } catch (err) {
      setCart(previousCart);
      throw err;
    }
  };

  const removeItem = async (item) => {
    const previousCart = cart;

    setCart((current) => recalculateCart({
      ...current,
      items: (current.items || []).filter((currentItem) => currentItem.id !== item.id),
    }));

    try {
      await removeFromCart(item.id);
    } catch (err) {
      setCart(previousCart);
      throw err;
    }
  };

  return (

    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateItemQuantity,
        removeItem,
        loading,
        reloadCart: loadCart
      }}
    >

      {children}

    </CartContext.Provider>

  );

}
