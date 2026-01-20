/**
 * @fileoverview Express routes for regular User authentication and profile management.
 * @module routes/userRoutes
 * @description Provides endpoints for registration, login, profile retrieval,
 * profile updates, and account deletion.
 */

const express = require("express");
const router = express.Router();
const userController = require("../../controllers/user-controller/user.controller");
const {
  encryptedAuthMiddleware,
  authLimiter,
} = require("../../middlewares/auth-middleware/auth.middleware");
const cloudinaryUtility = require("../../utilities/cloudinary-utilitity/cloudinary.utility");

/**
 * @desc Register a new regular user with optional profile picture
 */
router.post(
  "/signup-user",
  cloudinaryUtility.upload,
  userController.registerUser,
);

/**
 * @desc Login user and return JWT token with session tracking
 */
router.post("/signin-user", authLimiter, userController.loginUser);

/**
 * @desc Get authenticated user's profile details
 */
router.get(
  "/get-user-by-id/:userId",
  encryptedAuthMiddleware,
  userController.getUserById,
);

/**
 * @desc Update authenticated user's profile (name, phone, address, picture)
 */
router.patch(
  "/update-user/:userId",
  encryptedAuthMiddleware,
  cloudinaryUtility.upload,
  userController.updateProfile,
);

/**
 * @desc Permanently delete authenticated user's account and cleanup data
 */
router.delete(
  "/delete-user/:userId",
  encryptedAuthMiddleware,
  userController.deleteAccount,
);

/**
 * @desc Logout user and invalidate session
 */
router.post("/logout-user", encryptedAuthMiddleware, userController.logoutUser);

module.exports = router;
