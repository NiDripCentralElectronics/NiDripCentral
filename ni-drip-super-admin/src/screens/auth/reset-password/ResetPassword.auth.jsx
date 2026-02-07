/**
 * @file ResetPassword.auth.jsx
 * @module Screens/Auth/ResetPassword
 * @description
 * Final stage of the account recovery workflow for Super Admins.
 * * **Core Responsibilities:**
 * - **Token Extraction:** Retrieves the unique recovery token from the URL search parameters.
 * - **Guard Logic:** Automatically redirects to 'Forgot Password' if the recovery token is missing.
 * - **Password Integrity:** Enforces complexity rules via real-time validation before submission.
 * - **State Sync:** Communicates with the Redux `resetPassword` thunk to update backend credentials.
 * * @component
 * @requires react-redux
 * @requires react-router-dom (useSearchParams)
 * @requires react-hot-toast
 * * @returns {React.JSX.Element} The Reset Password UI with token validation and secure input handling.
 */

/**
 * @function handlePasswordChange
 * @description Syncs input state and performs real-time security complexity checks.
 * @param {React.ChangeEvent<HTMLInputElement>} e - Input event.
 */

/**
 * @function handleResetPassword
 * @async
 * @description
 * Orchestrates the submission of the new password.
 * 1. Prevents default form behavior.
 * 2. Verifies token presence and password field validity.
 * 3. Dispatches thunk and handles result matching (fulfilled vs. rejected).
 * 4. Provides haptic-style feedback via toasts and triggers navigation.
 * @param {React.FormEvent} event - Submission event.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useSearchParams } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./ResetPassword.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/input-field/InputField.utility";
import Button from "../../../utilities/button/Button.utility";
import {
  validatePassword,
  validateFields,
} from "../../../utilities/validations/Validation.utility";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../../redux/slices/auth.slice";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      setTimeout(() => navigate("/forgot-password"), 1500);
    }
  }, [token, navigate]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    // Logic to determine role dynamically
    // Example: if the URL is /superadmin/reset-password, role is 'SUPERADMIN'
    const currentRole = window.location.pathname.includes("superadmin")
      ? "SUPERADMIN"
      : "USER";

    const fields = { password };
    const errors = validateFields(fields);

    if (Object.keys(errors).length > 0 || passwordError) {
      toast.error(
        passwordError || errors.password || "Please enter a valid password",
      );
      return;
    }

    setLoading(true);

    try {
      // Pass the 'role' into the dispatch call
      const resultAction = await dispatch(
        resetPassword({
          newPassword: password,
          token,
          role: currentRole,
        }),
      );

      if (resetPassword.fulfilled.match(resultAction)) {
        toast.success(
          resultAction.payload.message || "Password reset successfully!",
        );
        setPassword("");

        // Navigate to the appropriate login page based on role
        const redirectPath =
          currentRole === "SUPERADMIN" ? "/" : "/";
        setTimeout(() => navigate(redirectPath), 2000);
      } else if (resetPassword.rejected.match(resultAction)) {
        toast.error(
          resultAction.payload?.message ||
            "Password reset failed. Please try again.",
        );
      }
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reset-password-screen">
      <div className="signin-grid">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-content">
            <div className="logo-container">
              <img src={Logo} alt="Logo" className="logo" />
            </div>

            <div className="text-header">
              <h2>Reset your password</h2>
              <p>Enter a new secure password for your account.</p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <InputField
                  label="New Password"
                  type="password"
                  editable={true}
                  value={password}
                  onChange={handlePasswordChange}
                  icon={<i className="fas fa-lock"></i>}
                  error={passwordError}
                  width={350}
                />
                {passwordError && (
                  <span className="error-text">{passwordError}</span>
                )}
              </div>

              <div className="btn-container">
                <Button
                  title="Reset Password"
                  width="100%"
                  onPress={handleResetPassword}
                  loading={loading}
                  icon={<i className="fas fa-key"></i>}
                />
              </div>

              <div className="back-to-signin">
                <NavLink to="/" className="signin-link">
                  Back to Sign In
                </NavLink>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Decorative orbiting elements (consistent with Signin & Forgot Password) */}
        <div className="right-side">
          <div className="orbit-system">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className={`orbit orbit-${num}`}>
                <div className={`ball ball-${num}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
