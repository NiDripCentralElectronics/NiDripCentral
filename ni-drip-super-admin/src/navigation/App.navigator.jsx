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
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppNavigator;
