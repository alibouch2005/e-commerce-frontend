import api from "../Api/axios";

// Endpoint pour se connecter, appelé depuis la page de login
export const login = async (email, password) => {

  await api.get("/sanctum/csrf-cookie");

  return api.post("/api/login", {
    email,
    password
  });

};

// Endpoint pour s'inscrire, appelé depuis la page de register
export const register = async (data) => {

  await api.get("/sanctum/csrf-cookie");

  return api.post("/api/register", data);

};
// pour se déconnecter, on envoie une requête POST à l'endpoint de logout
export const logout = () => {
  return api.post("/api/logout");
};

  // Endpoint pour demander une réinitialisation de mot de passe, appelé depuis la page de forgot
export const forgotPassword = async (email) => {

  return api.post("/api/forgot-password", { email });

};

// Endpoint pour réinitialiser le mot de passe, appelé depuis la page de reset avec le token
export const resetPassword = (data) => {
  return api.post("/api/reset-password", data);
};

// Récupérer les informations de l'utilisateur connecté
export const getUser = () => {
  return api.get("/api/user");
};

// CHANGE PASSWORD
export const changePassword = (data) => {
  return api.patch("/api/user/change-password", data);
};