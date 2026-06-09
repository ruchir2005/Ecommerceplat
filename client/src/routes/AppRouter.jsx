import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";

// Admin pages
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminUsers from "../pages/admin/AdminUsers";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      {
        path: "/profile",
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: "/cart",
        element: <ProtectedRoute><CartPage /></ProtectedRoute>,
      },
      {
        path: "/checkout",
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
      },
      {
        path: "/orders",
        element: <ProtectedRoute><OrdersPage /></ProtectedRoute>,
      },
      {
        path: "/orders/:id",
        element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute>,
      },
      // Admin
      {
        path: "/admin",
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <AdminProducts /> },
          { path: "orders", element: <AdminOrders /> },
          { path: "users", element: <AdminUsers /> },
        ],
      },
      // 404
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;