import api from "../Api/axios";

export const login = async (email, password) => {

  await api.get("/sanctum/csrf-cookie");

  return api.post("/api/login", {
    email,
    password
  });

};

export const logout = () => {
  return api.post("/api/logout");
};

export const getUser = () => {
  return api.get("/api/user");
};