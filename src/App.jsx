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
import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import AdminProducts from "./pages/AdminProducts";

import GuestGuard from "./guards/GuestRoute";
import AdminGuard from "./guards/AdminGuard";
import AdminLayout from "./components/layout/AdminLayout";
import Footer from "./components/layout/Footer";
import AdminOrderDetails from "./pages/AdminOrderDetails";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Navbar key={window.location.pathname} />
      <Toaster position="top-right" />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* AUTH */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* CART */}
        <Route path="/cart" element={<Cart />} />

        {/* 🔒 USER */}
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
            user?.role === "livreur" ? <Deliveries /> : <Navigate to="/" />
          }
        />

        {/* 🧑‍💼 ADMIN (CLEAN VERSION) */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
        </Route>
      </Routes>
      {/* <Footer/> */}
    </BrowserRouter>
  );
}

export default App;
