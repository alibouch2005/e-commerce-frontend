import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
   // Definition des en-tetes HTTP envoyes avec chaque requete
  headers: {
    // Indique que les reponses attendues sont au format JSON
    Accept: "application/json",
  },
  // Permet l'envoi automatique des cookies
  withCredentials: true,
  // Ajout automatiquement le token CSRF dans les requetes protegees
  withXSRFToken: true,
  
});

export default api;