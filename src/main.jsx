import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import CartProvider from "./context/CartProvider";
import { NotificationProvider } from "./context/NotificationContext";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
      <NotificationProvider>
      <App />
      </NotificationProvider>
    </CartProvider>
  </AuthProvider>,
);
