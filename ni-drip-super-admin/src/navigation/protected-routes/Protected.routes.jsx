/**
 * @file ProtectedRoutes.jsx
 * @module Navigation/Guards
 * @description
 * A Higher-Order Component (HOC) designed to protect sensitive application routes.
 * * **Security Logic:**
 * - Checks for the presence of an `authToken` in LocalStorage.
 * - Redirects unauthorized users back to the landing/login page.
 * - Prevents access to internal dashboards without a valid session.
 * * @requires react-router-dom
 */

import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoutes;
