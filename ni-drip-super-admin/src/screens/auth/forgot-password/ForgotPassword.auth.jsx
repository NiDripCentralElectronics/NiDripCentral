/**
 * @file ForgotPassword.auth.jsx
 * @module Screens/Auth/ForgotPassword
 * @description
 * Password recovery screen for the Super Admin.
 * * **Core Functionality:**
 * - Captures user email with real-time validation.
 * - Dispatches recovery requests to the backend via Redux Thunks.
 * - Handles success/error feedback using `react-hot-toast`.
 * - Features a high-fidelity CSS "Orbit" animation for the background hero.
 * * @requires react-redux
 * @requires react-router-dom
 * @requires react-hot-toast
 */

import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./ForgotPassword.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateEmail,
  validateFields,
} from "../../../utilities/Validations/Validation.utility";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../../../redux/slices/auth.slice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  /**
   * Handle email input change
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    const fields = { email };
    const errors = validateFields(fields);
    if (Object.keys(errors).length > 0) {
      toast.error(errors.email || "Invalid email");
      return;
    }

    setLoading(true);

    try {
      const resultAction = await dispatch(
        forgotPassword({ email, role: "SUPERADMIN" }),
      );

      if (forgotPassword.fulfilled.match(resultAction)) {
        toast.success(
          resultAction.payload.message || "Password reset email sent",
        );
        setTimeout(() => navigate("/"), 2000);
        setEmail("");
      } else if (forgotPassword.rejected.match(resultAction)) {
        toast.error(resultAction.payload?.message || "Request failed");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="forgot-password-screen">
      <div className="signin-grid">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-content">
            <div className="logo-container">
              <img src={Logo} alt="Logo" className="logo" />
            </div>

            <div className="text-header">
              <h2>Forgot your password?</h2>
              <p>Enter your username and we’ll help you reset your password.</p>
            </div>

            <form className="form-container" onSubmit={handleForgotPassword}>
              <div className="input-group">
                <InputField
                  label="Email"
                  type="text"
                  editable={true}
                  value={email}
                  onChange={handleEmailChange}
                  icon={<i className="fas fa-envelope"></i>}
                  width={350}
                />
              </div>

              <div className="btn-container">
                <Button
                  title="Reset password"
                  width={"100%"}
                  onPress={handleForgotPassword}
                  loading={loading}
                  icon={<i className="fas fa-paper-plane"></i>}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Decorative orbiting elements */}
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

export default ForgotPassword;
