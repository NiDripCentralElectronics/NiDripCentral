/**
 * @fileoverview Express routes for Cart
 * @module routes/cartRoutes
 * @description Provides endpoints for:
 * - Adding items to cart
 * - Removing items from cart
 * - Clearing entire cart
 * - Fetching user's cart
 */

const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/cart-controller/cart.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @desc Add To Cart
 */
router.post("/add-to-cart", encryptedAuthMiddleware, cartController.addToCart);

/**
 * @desc Remove from Cart
 */
router.post(
  "/remove-from-cart",
  encryptedAuthMiddleware,
  cartController.decreaseCartItem,
);

/**
 * @desc Remove Whole Product Cart
 */
router.delete(
  "/remove-product-from-cart",
  encryptedAuthMiddleware,
  cartController.removeProductFromCart,
);

/**
 * @desc Clear Entire Cart
 */
router.delete("/clear-cart", encryptedAuthMiddleware, cartController.clearCart);

/**
 * @desc Get Cart
 */
router.get("/get-cart", encryptedAuthMiddleware, cartController.getCart);

module.exports = router;
