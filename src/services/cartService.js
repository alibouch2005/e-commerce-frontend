import api from "../Api/axios";

// Service pour gérer les opérations liées au panier, appelé depuis les pages de cart et checkout
export const getCart = () => {
  return api.get("/api/cart");
};
// Endpoint pour ajouter un produit au panier, appelé depuis la page de product details
export const addToCart = (product_id, quantity = 1) => {
  return api.post("/api/cart/add", {
    product_id,
    quantity
  });
};
// Endpoint pour mettre à jour la quantité d'un produit dans le panier, appelé depuis la page de cart
export const updateQuantity = (id, quantity) => {
  return api.put(`/api/cart/update-quantity/${id}`, {
    quantity
  });
};
// Endpoint pour supprimer un produit du panier, appelé depuis la page de cart
export const removeFromCart = (id) => {
  return api.delete(`/api/cart/remove/${id}`);
};

// Endpoint pour vider le panier, appelé depuis la page de cart
export const clearCart = () => {
  return api.delete("/api/cart/clear");
};
// Endpoint pour procéder au checkout, appelé depuis la page de checkout
export const checkout = () => {
  return api.post("/api/checkout");
};