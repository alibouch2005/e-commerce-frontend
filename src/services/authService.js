import api from "../Api/axios";

export const login = async (email, password) => {

  await api.get("/sanctum/csrf-cookie");

  return api.post("/api/login", {
    email,
    password
  });

};

export const register = async (data) => {

  await api.get("/sanctum/csrf-cookie");

  return api.post("/api/register", data);

};

export const logout = () => {
  return api.post("/api/logout");
};

export const forgotPassword = async (email) => {

  return api.post("/api/forgot-password", { email });

};

export const resetPassword = (data) => {
  return api.post("/api/reset-password", data);
};

export const getUser = () => {
  return api.get("/api/user");
};