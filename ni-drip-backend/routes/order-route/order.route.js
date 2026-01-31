/**
 * @fileoverview Express routes for order management
 * @module routes/orderRoutes
 */

const express = require("express");
const router = express.Router();

const orderController = require("../../controllers/order-controller/order.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @description Place a new order
 * @route POST /api/order/place-order
 * @access Protected
 */
router.post(
  "/place-order",
  encryptedAuthMiddleware,
  orderController.placeOrder,
);

/**
 * @description Get all orders
 * @route GET /api/order/get-all-orders
 * @access Protected
 */
router.get(
  "/get-all-orders",
  encryptedAuthMiddleware,
  orderController.getAllOrders,
);

/**
 * @description Get details of a specific order by ID
 * @route GET /api/order/get-order-by-id/:orderId
 * @access Protected
 */
router.get(
  "/get-order-by-id/:orderId",
  encryptedAuthMiddleware,
  orderController.getOrderById,
);

/**
 * @description Get all orders belonging to the authenticated user
 * @route GET /api/order/get-my-orders
 * @access Protected
 */
router.get(
  "/get-my-orders",
  encryptedAuthMiddleware,
  orderController.getUserOrders,
);

/**
 * @description Cancel an order (user-initiated, subject to status/policy checks)
 * @route PUT /api/order/cancel-order/:orderId
 * @access Protected
 */
router.put(
  "/action/cancel-order/:orderId",
  encryptedAuthMiddleware,
  orderController.cancelOrder,
);

/**
 * @description Update the status of an order (admin-initiated)
 * @route PUT /api/order/updated-order-status/:orderId
 * @access Protected
 */
router.put(
  "/action/update-order-status/:orderId",
  encryptedAuthMiddleware,
  orderController.updateOrderStatus,
);

/**
 * @description Delete an order
 * @route DELETE /api/order/delete-order/:orderId
 * @access Protected
 */
router.delete(
  "/delete-order/:orderId",
  encryptedAuthMiddleware,
  orderController.deleteOrder,
);

module.exports = router;
