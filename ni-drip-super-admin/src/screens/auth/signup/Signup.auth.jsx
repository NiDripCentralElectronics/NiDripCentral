/**
 * @file Signup.auth.jsx
 * @module Screens/Auth/Signup
 * @description
 * Registration screen for new Super Admins.
 * * **Core Functionality:**
 * - **Media Handling:** Manages profile picture selection and preview using `FileReader` and `useRef`.
 * - **Multipart Form Data:** Processes registration as `FormData` to support simultaneous text and binary (file) uploads.
 * - **Real-time Validation:** Enforces rules for Full Name, Email, and Password through utility functions.
 * - **State Management:** Dispatches the `register` thunk and provides timed navigation to the login screen on success.
 * * @component
 * @requires react-redux
 * @requires react-router-dom
 * @requires react-hot-toast
 * * @returns {React.JSX.Element} The Signup view with profile upload, form inputs, and animated background.
 */

/**
 * @function handleImageSelect
 * @description Converts the selected file into a Base64 string for immediate UI preview.
 * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
 */

/**
 * @function handleSignup
 * @async
 * @description
 * Validates inputs and prepares the `FormData` payload for the API.
 * 1. Validates text fields using `validateFields`.
 * 2. Appends text and the optional profile picture to a `FormData` instance.
 * 3. Dispatches the registration action and handles success/error toast notifications.
 * @param {React.FormEvent} event - Submission event.
 */

import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./Signup.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateEmail,
  validatePassword,
  validateFields,
  validateFullName,
} from "../../../utilities/Validations/Validation.utility";
import imgPlaceholder from "../../../assets/placeHolder/placeholder.png";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { register } from "../../../redux/slices/auth.slice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const hasErrors =
      fullNameError ||
      emailError ||
      passwordError ||
      !fullName ||
      !email ||
      !password;
  }, [fullNameError, emailError, passwordError, fullName, email, password]);

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    setFullNameError(validateFullName(e.target.value));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    const fields = { fullName, email, password };
    const errors = validateFields(fields);
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      toast.error(errors[errorKeys[0]]);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("userName", fullName);
    formData.append("email", email);
    formData.append("password", password);

    if (fileInputRef.current?.files[0]) {
      formData.append("profilePicture", fileInputRef.current.files[0]);
    }

    try {
      const resultAction = await dispatch(register(formData));

      if (register.fulfilled.match(resultAction)) {
        const { message } = resultAction.payload;
        toast.success(message);

        setTimeout(() => {
          navigate("/");
        }, 2000);
        return;
      }

      if (register.rejected.match(resultAction)) {
        const errorMessage =
          resultAction.payload?.message || "Registration failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signup-screen">
      <div className="signup-grid">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-content">
            <div className="logo-container">
              <img src={Logo} alt="Logo" className="logo" />
            </div>

            <div className="profile-upload-container">
              <div className="profile-pic-wrapper" onClick={handleImageClick}>
                <img
                  src={selectedImage || imgPlaceholder}
                  alt="Profile"
                  className="profile-pic"
                />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageSelect}
              />
            </div>

            <form className="form-container" onSubmit={handleSignup}>
              <div className="input-group">
                <InputField
                  label="Name"
                  type="text"
                  editable={true}
                  value={fullName}
                  onChange={handleFullNameChange}
                  icon={<i className="fas fa-user"></i>}
                  width={350}
                />
              </div>

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

              <div className="btn-container">
                <Button
                  title="Sign up"
                  width={"100%"}
                  onPress={handleSignup}
                  loading={loading}
                />
              </div>

              <div className="signin-container">
                <span className="signin-text">Already have an account?</span>
                <NavLink to="/" className="signin-link">
                  Sign in
                </NavLink>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Decorative orbiting elements (5 balls to match provided signin) */}
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

export default Signup;
