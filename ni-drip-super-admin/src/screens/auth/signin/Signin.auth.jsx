/**
 * @file Signin.auth.jsx
 * @module Screens/Auth/Signin
 * @description 
 * The primary Sign-in screen for Super Admins.
 * * **Logic Features:**
 * - **Form State Management:** Real-time validation for email and password fields.
 * - **Redux Integration:** Dispatches the `login` thunk to verify credentials and update the global store.
 * - **Security Feedback:** Handles specific HTTP status codes (e.g., 423 Locked) to inform users about too many failed attempts or account locks.
 * - **Persistence:** On success, redirects the user to the Admin Dashboard.
 * * @component
 * @requires react-redux
 * @requires react-router-dom
 * @requires react-hot-toast
 * * @returns {React.JSX.Element} The rendered Signin screen with its responsive grid and orbital animations.
 */

/**
 * @function handleSignin
 * @async
 * @description 
 * Orchestrates the login workflow.
 * 1. Prevents default form reload.
 * 2. Runs bulk validation using `validateFields`.
 * 3. Dispatches `login` and calculates "Remaining Attempts" from backend metadata if the request fails.
 * 4. Triggers success toast and navigates to the dashboard after a 2-second delay.
 * @param {React.FormEvent} event - The form submission event.
 */

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./Signin.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateEmail,
  validatePassword,
  validateFields,
} from "../../../utilities/Validations/Validation.utility";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/slices/auth.slice";

const Signin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
  }, [emailError, passwordError, email, password]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleSignin = async (event) => {
    event.preventDefault();

    const fields = { email, password };
    const errors = validateFields(fields);
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      toast.error(errors[firstErrorKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const loginData = { email, password };
      const resultAction = await dispatch(login(loginData));

      if (login.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload.message || "Login successful";
        toast.success(successMessage);

        setTimeout(() => {
          navigate("/super-admin/dashboard");
        }, 2000);

        setEmail("");
        setPassword("");
      } else if (login.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;

        let errorMessage = "Login failed. Please try again.";

        if (errorPayload) {
          errorMessage = errorPayload.message || errorMessage;

          if (
            errorPayload.status === 423 &&
            errorPayload.message?.includes("Account locked")
          ) {
            toast.error(errorPayload.message, { autoClose: 5000 });
            return;
          }

          if (
            errorPayload.status === 423 &&
            errorPayload.message?.includes("Too many failed")
          ) {
            toast.error(errorPayload.message, { autoClose: 6000 });
            return;
          }

          if (errorPayload.attempts !== undefined) {
            const remainingAttempts = 3 - errorPayload.attempts;
            if (remainingAttempts > 0) {
              toast.error(
                `${errorMessage} (${remainingAttempts} attempts remaining)`,
              );
              return;
            }
          }
        }

        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("An unexpected error occurred during login:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signin-screen">
      <div className="signin-grid">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-content">
            <div className="logo-container">
              <img src={Logo} alt="Logo" className="logo" />
            </div>

            <form className="form-container" onSubmit={handleSignin}>
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

              <div className="input-group">
                <InputField
                  label="Password"
                  type="password"
                  secureTextEntry={true}
                  editable={true}
                  value={password}
                  onChange={handlePasswordChange}
                  icon={<i className="fas fa-lock"></i>}
                  width={350}
                />
              </div>

              <div className="forgot-password-container">
                <NavLink to="/auth/forgot-password" className="forgot-link">
                  Forgot password?
                </NavLink>
              </div>

              <div className="btn-container">
                <Button
                  title="Sign in"
                  width={"100%"}
                  onPress={handleSignin}
                  loading={loading}
                  icon={<i className="fas fa-sign-in-alt"></i>}
                />
              </div>

              <div className="signup-container">
                <span className="signup-text">Don't have an account?</span>
                <NavLink to="/auth/signup" className="signup-link">
                  Sign up
                </NavLink>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Decorative orbiting elements (now 10 balls) */}
        <div className="right-side">
          <div className="orbit-system">
            <div className="orbit orbit-1">
              <div className="ball ball-1"></div>
            </div>
            <div className="orbit orbit-2">
              <div className="ball ball-2"></div>
            </div>
            <div className="orbit orbit-3">
              <div className="ball ball-3"></div>
            </div>
            <div className="orbit orbit-4">
              <div className="ball ball-4"></div>
            </div>
            <div className="orbit orbit-5">
              <div className="ball ball-5"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
