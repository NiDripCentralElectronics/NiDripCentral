/**
 * @file User Controller
 * @description Controller module for managing regular user authentication and profile operations.
 * Supports:
 * - Registration with strong password validation and secure Cloudinary upload
 * - Login with JWT (can be upgraded to encrypted/session-based in future)
 * - Profile retrieval and update (including picture replacement)
 * - Password reset
 * - Account deletion with cleanup (profile picture + related orders)
 * - Basic login attempt tracking (optional future lockout)
 *
 * Most endpoints are private (require authentication) except register & login.
 *
 * @module controllers/userController
 */

const bcrypt = require("bcrypt");
const User = require("../../models/user-model/user.model");
const Cart = require("../../models/cart-model/cart.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary-utilitity/cloudinary.utility");
const {
  passwordRegex,
  hashPassword,
} = require("../../helpers/password-helper/password.helper");
const {
  generateSecureToken,
} = require("../../helpers/token-helper/token.helper");
const {
  generateEncryptedToken,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * Register a new regular user
 * POST /api/user/signup-user
 * Public access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.registerUser = async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const { userName, email, password, phone, address } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      role: "USER",
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    let profilePictureUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture",
      );
      profilePictureUrl = uploadResult.url;
      uploadedFileUrl = uploadResult.url;
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      profilePicture: profilePictureUrl,
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
      role: "USER",
      isActive: true,
      lastLogin: null,
      loginAttempts: 0,
      lockUntil: null,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    if (uploadedFileUrl) {
      try {
        await deleteFromCloudinary(uploadedFileUrl);
      } catch (cloudErr) {
        console.error("Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Login user
 * POST /api/user/signin-user
 * Public access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes.`,
      });
    }

    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 3) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
      }
      await user.save();

      const message =
        user.lockUntil && user.lockUntil > Date.now()
          ? "Too many failed login attempts. Account locked for 30 minutes."
          : "Invalid credentials";

      return res.status(401).json({
        success: false,
        message,
        attempts: user.loginAttempts,
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();
    user.sessionId = generateSecureToken();
    await user.save();

    const payload = {
      role: "USER",
      user: { id: user._id.toString(), email: user.email },
      sessionId: user.sessionId,
    };

    const encryptedToken = generateEncryptedToken(payload);

    res.cookie("accessToken", encryptedToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User login successfully!",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      token: encryptedToken,
      expiresIn: 24 * 60 * 60,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get user by id
 * GET /api/user/get-user-by-id/:userId
 * Private access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Fetch User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Update user profile (name, phone, address, profile picture)
 * PUT /api/user/update-profile/:userId
 * Private access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.updateProfile = async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.body.userName) user.userName = req.body.userName;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.address) user.address = req.body.address;

    if (req.files?.profilePicture) {
      if (user.profilePicture) {
        try {
          const publicId = user.profilePicture.split("/").pop().split(".")[0];
          await deleteFromCloudinary(user.profilePicture);
        } catch (err) {
          console.error("Failed to delete old profile picture:", err);
        }
      }

      const result = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture",
      );
      user.profilePicture = result.url;
      uploadedFileUrl = result.url;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUser: user,
    });
  } catch (error) {
    if (uploadedFileUrl) {
      try {
        await deleteFromCloudinary(uploadedFileUrl);
      } catch (cloudErr) {
        console.error("Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Delete user account and associated data
 * DELETE /api/user/delete-user/:userId
 * Private access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid reason for deleting your account (min 5 characters).",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(`User ${user.email} deleted their account. Reason: ${reason}`);

    if (user.profilePicture) {
      try {
        await deleteFromCloudinary(user.profilePicture);
      } catch (err) {
        console.error(
          "Failed to delete profile picture during account deletion:",
          err,
        );
      }
    }

    await User.findByIdAndDelete(userId);
    await Cart.findByIdAndDelete(userId);

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message:
        "Your account has been deleted successfully. We're sorry to see you go!",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Logout User
 * POST /api/user/logout-user
 * Private access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.logoutUser = async (req, res) => {
  try {
    if (req.user?.userId) {
      await User.findByIdAndUpdate(req.user.userId, {
        sessionId: null,
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("User Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
