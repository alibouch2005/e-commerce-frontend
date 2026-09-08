import api from "../Api/axios";

export const getProducts = (params = {}, signal) => {
  return api.get("/api/products", { params, signal, timeout: 15000 });
};

export const getProduct = (id, signal) => {
  return api.get(`/api/products/${id}`, { signal, timeout: 15000 });
};
