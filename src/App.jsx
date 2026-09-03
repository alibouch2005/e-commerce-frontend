import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { Toaster } from "react-hot-toast";
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
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import Favorites from "./pages/Favorites";
import Support from "./pages/Support";
import PaymentResult from "./pages/PaymentResult";
import GuestGuard from "./guards/GuestRoute";
import AdminGuard from "./guards/AdminGuard";
import AdminLayout from "./components/layout/AdminLayout";
import Footer from "./components/layout/Footer";
import AdminOrderDetails from "./pages/AdminOrderDetails";
import AnalyticsTracker from "./components/analytics/AnalyticsTracker";
import CookieConsentBanner from "./components/analytics/CookieConsentBanner";

const Deliveries = lazy(() => import("./pages/Deliveries"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCategories = lazy(() => import("./pages/AdminCategories"));
const AdminProducts = lazy(() => import("./pages/AdminProducts"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const AdminWiniProducts = lazy(() => import("./pages/AdminWiniProducts"));

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const showFooter = ["/", "/products", "/support"].some((path) => (
    location.pathname === path || location.pathname.startsWith("/products/")
  ));

  return (
    <>
      <AnalyticsTracker />
      <Navbar key={location.pathname} />
      <Toaster
        position="top-right"
        toastOptions={{
          className: "app-toast",
          duration: 3500,
          error: { duration: 4500 },
        }}
      />
      <CookieConsentBanner />

      <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center text-gray-500">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/support" element={<Support />} />
          <Route path="/cart" element={<Cart />} />

          <Route element={<GuestGuard />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/payment/success" element={<PaymentResult success />} />
          <Route path="/payment/failure" element={<PaymentResult />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/favorites" element={user ? <Favorites /> : <Navigate to="/login" />} />
          <Route path="/change-password" element={user ? <ChangePassword /> : <Navigate to="/login" />} />
          <Route path="/deliveries" element={user?.role === "livreur" ? <Deliveries /> : <Navigate to="/" />} />

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
            <Route path="users" element={<AdminUsers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="wini-products" element={<AdminWiniProducts />} />
          </Route>
        </Routes>
      </Suspense>

      {showFooter && <Footer />}
    </>
  );
}

export default App;
