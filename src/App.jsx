import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Navbar from "./components/layout/Navbar";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import { Toaster } from "react-hot-toast";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import Deliveries from "./pages/Deliveries";
import AdminOrders from "./pages/AdminOrders";


function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" />

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* OPTIONAL (cart accessible) */}
        <Route path="/cart" element={<Cart />} />

        {/* 🔒 PROTECTED */}
        <Route
          path="/checkout"
          element={user ? <Checkout /> : <Navigate to="/login" />}
        />

        <Route
          path="/orders"
          element={user ? <Orders /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />

        <Route
          path="/change-password"
          element={user ? <ChangePassword /> : <Navigate to="/login" />}
        />

        {/* 🚚 LIVREUR */}
        <Route
          path="/deliveries"
          element={
            user?.role === "livreur"
              ? <Deliveries />
              : <Navigate to="/" />
          }
        />

        {/* 🧑‍💼 ADMIN */}
        <Route
          path="/admin"
          element={
            user?.role === "admin"
              ? <AdminOrders />
              : <Navigate to="/" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;