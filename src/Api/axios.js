import axios from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessages } from "../utils/showApiError";

const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const apiUrl = configuredApiUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
  withXSRFToken: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hasValidationErrors = Boolean(error.response?.data?.errors);

    if (!hasValidationErrors && [419, 429, 500, 503].includes(status)) {
      toast.error(getApiErrorMessages(error)[0], { duration: 6000 });
      error.__shownToUser = true;
    }

    return Promise.reject(error);
  },
);

export default api;
