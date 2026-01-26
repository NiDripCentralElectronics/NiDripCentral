/**
 * @file AppNavigator.jsx
 * @module Navigation/Router
 * @description
 * Central routing engine for the application using React Router v6.
 * * **Routing Architecture:**
 * - **Public Access:** Handles entry-level authentication flows (Login, Signup).
 * - **Account Recovery:** Manages the password reset lifecycle (Forgot/Reset).
 * - **Error Handling:** Provides a catch-all fallback for undefined paths.
 * * @requires react-router-dom
 */

import { Routes, Route } from "react-router-dom";

// Outlet
import DashboardLayout from "./outlet/Outlet.outlet";
import ProtectedRoute from "./protected-routes/Protected.routes";

// Authentication
import Signin from "../screens/auth/Signin/Signin.auth";
import Signup from "../screens/auth/Signup/Signup.auth";
import ForgotPassword from "../screens/auth/forgot-password/ForgotPassword.auth";
import ResetPassword from "../screens/auth/reset-password/ResetPassword.auth";

// Dashboard
import Dashboard from "../screens/dashboard/Main.dashboard";

// Orders Management
import Orders from "../screens/manage-orders/orders/Orders";
import OrderDetails from "../screens/manage-orders/order-details/OrderDetails";

// Users Management
import Users from "../screens/manage-users/users/Users";
import UserDetails from "../screens/manage-users/user-details/UserDetails";

// Products Management
import AddProduct from "../screens/manage-products/add-product/AddProduct";
import Products from "../screens/manage-products/products/Products";
import ProductDetails from "../screens/manage-products/product-details/ProductDetails";
import UpdateProduct from "../screens/manage-products/update-product/UpdateProduct";

// Inventory Management
import Inventory from "../screens/manage-inventory/Inventory";

// Reviews Management
import Reviews from "../screens/manage-reviews/Reviews";

// Support Tickets Management
import SupportTickets from "../screens/manage-support-tickets/SupportTickets";

// Not Found
import NotFound from "../screens/not-found/Not-Found";

/**
 * Application routing configuration.
 *
 * @returns {JSX.Element} The route definitions for the app.
 */
const AppNavigator = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Signin />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Make dashboard the index route for /super-admin */}
        <Route index element={<Dashboard />} />

        {/* Dashboard Routes */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Orders Management */}
        <Route path="orders/manage-orders" element={<Orders />} />
        <Route
          path="orders/manage-orders/order-details/:orderId"
          element={<OrderDetails />}
        />

        {/* Users Management */}
        <Route path="users/manage-users" element={<Users />} />
        <Route
          path="users/manage-users/user-details/:userId"
          element={<UserDetails />}
        />

        {/* Products Management */}
        <Route
          path="products/manage-products/add-product"
          element={<AddProduct />}
        />
        <Route path="products/manage-products" element={<Products />} />
        <Route
          path="products/manage-products/product-details/:productId"
          element={<ProductDetails />}
        />
        <Route
          path="products/manage-products/update-product/:productId"
          element={<UpdateProduct />}
        />

        {/* Inventory Management */}
        <Route path="inventory/manage-inventory" element={<Inventory />} />

        {/* Reviews Management */}
        <Route path="reviews/manage-reviews" element={<Reviews />} />

        {/* Support Tickets Management */}
        <Route
          path="support/manage-support-tickets"
          element={<SupportTickets />}
        />
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
