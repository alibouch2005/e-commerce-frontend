import { useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { getCart, addToCart } from "../services/cartService";

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

      // important : récupérer data.data
      setCart(res.data.data ?? { items: [] });

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

      // recharger panier
      await loadCart();

    } catch (err) {

      console.error("Erreur ajout panier:", err);

    }

  };

  return (

    <CartContext.Provider
      value={{
        cart,
        addItem,
        loading,
        reloadCart: loadCart
      }}
    >

      {children}

    </CartContext.Provider>

  );

}