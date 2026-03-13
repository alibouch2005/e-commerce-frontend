import api from "../Api/axios";

export const getProducts = (params = {}) => {
  return api.get("/api/products", { params });


};

export const getProduct = (id) => {

  return api.get(`/api/products/${id}`);

};