import toast from "react-hot-toast";

const fallbackLabels = {
  name: "Nom",
  email: "Email",
  phone: "Telephone",
  address: "Adresse",
  adresse_livraison: "Adresse livraison",
  password: "Mot de passe",
  password_confirmation: "Confirmation mot de passe",
  current_password: "Mot de passe actuel",
  new_password: "Nouveau mot de passe",
  new_password_confirmation: "Confirmation mot de passe",
  category_id: "Categorie",
  price: "Prix",
  sale_price: "Prix promo",
  stock: "Stock",
  image: "Image",
  images: "Images",
  coupon_code: "Code promo",
  payment_method: "Paiement",
  fulfillment_method: "Mode de reception",
  recipient_name: "Receptionnaire",
  proof_image: "Photo preuve",
  admin_reply: "Reponse admin",
};

const statusLabels = {
  400: "Requete invalide",
  401: "Connexion requise",
  403: "Acces refuse",
  404: "Element introuvable",
  419: "Session expiree",
  422: "Erreur de validation",
  429: "Trop de tentatives",
  500: "Erreur serveur",
  503: "Service indisponible",
};

const labelFor = (field) => fallbackLabels[field] || field.replaceAll("_", " ");

export function getApiErrorMessages(error, fallback = "Une erreur est survenue") {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const title = statusLabels[status] || `Erreur ${status || "reseau"}`;
  const retryAfter = Number(error?.response?.headers?.["retry-after"] || 0);

  if (!error?.response) {
    return ["Connexion impossible. Verifiez internet ou le serveur API."];
  }

  if (data?.errors && typeof data.errors === "object") {
    return Object.entries(data.errors).flatMap(([field, messages]) => {
      const values = Array.isArray(messages) ? messages : [messages];
      return values.map((message) => `${labelFor(field)}: ${message}`);
    });
  }

  if (status === 429) {
    const waitText = retryAfter > 0 ? ` Attendez ${retryAfter} seconde(s) avant de reessayer.` : " Patientez un instant avant de reessayer.";
    return [`${title}.${waitText}`];
  }

  if (status === 401 && data?.message) {
    return [data.message];
  }

  if (data?.message) {
    return [`${title}: ${data.message}`];
  }

  return [`${title}: ${fallback}`];
}

export function showApiError(error, fallback, options = {}) {
  if (error?.__shownToUser) return;

  const messages = getApiErrorMessages(error, fallback);
  const limit = options.limit || 4;
  const toastOptions = { duration: 6000, ...options };
  delete toastOptions.limit;

  messages.slice(0, limit).forEach((message) => {
    toast.error(message, toastOptions);
  });

  if (messages.length > limit) {
    toast.error(`+${messages.length - limit} autre(s) erreur(s). Corrigez les champs marques.`, toastOptions);
  }

  if (import.meta.env.DEV) {
    console.error("API error details:", {
      status: error?.response?.status,
      url: error?.config?.url,
      method: error?.config?.method,
      data: error?.response?.data,
    });
  }
}
