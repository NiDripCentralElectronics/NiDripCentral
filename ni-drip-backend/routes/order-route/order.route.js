/**
 * @fileoverview Express routes for Order
 * @module routes/orderRoutes
 * @description Provides endpoints for:
 * - Placing an order (User Only)
 */

const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order-controller/order.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @desc Create a new order
 */
router.post(
  "/place-order",
  encryptedAuthMiddleware,
  orderController.placeOrder,
);

/**
 * @desc Get all orders
 */
router.get(
  "/get-all-orders",
  encryptedAuthMiddleware,
  orderController.getAllOrders,
);

/**
 * @desc Get order by ID
 */
router.get(
  "/get-order-by-id/:orderId",
  encryptedAuthMiddleware,
  orderController.getOrderById,
);

/**
 * @desc Get orders for logged-in user
 */
router.get(
  "/get-my-orders",
  encryptedAuthMiddleware,
  orderController.getUserOrders,
);

/**
 * @desc Cancel an order
 */
router.put(
  "/cancel-order/:orderId",
  encryptedAuthMiddleware,
  orderController.cancelOrder,
);

module.exports = router;
