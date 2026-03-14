import api from "../Api/axios";

export const getCart = () => {
  return api.get("/api/cart");
};

export const addToCart = (product_id, quantity = 1) => {
  return api.post("/api/cart/add", {
    product_id,
    quantity
  });
};

export const updateQuantity = (id, quantity) => {
  return api.put(`/api/cart/update-quantity/${id}`, {
    quantity
  });
};

export const removeFromCart = (id) => {
  return api.delete(`/api/cart/remove/${id}`);
};

export const clearCart = () => {
  return api.delete("/api/cart/clear");
};