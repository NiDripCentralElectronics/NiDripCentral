/**
 * @fileoverview Express routes for Favorites
 * @module routes/favoriteRoutes
 * @description Provides endpoints for:
 * - Adding items to favorites
 * - Removing items from favorites
 * - Fetching user's favorites
 */

const express = require("express");
const router = express.Router();
const favoriteController = require("../../controllers/favorite-controller/favorite.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @desc Add To Favorites
 */
router.post(
  "/add-to-favorite",
  encryptedAuthMiddleware,
  favoriteController.addToFavorites,
);

/**
 * @desc Remove from Favorites
 */
router.post(
  "/remove-from-favorite",
  encryptedAuthMiddleware,
  favoriteController.removeFromFavorites,
);

/**
 * @desc Get Favorites
 */
router.get(
  "/get-favorites",
  encryptedAuthMiddleware,
  favoriteController.getFavorites,
);

module.exports = router;
