import api from "../Api/axios";

export const getCategories = () => {
  return api.get("/api/categories");
};