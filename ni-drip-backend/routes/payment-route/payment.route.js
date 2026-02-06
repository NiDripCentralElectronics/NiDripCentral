/**
 * @fileoverview Express routes for Stripe webhook
 * @module routes/paymentRoutes
 */

const express = require("express");
const router = express.Router();

const paymentController = require("../../controllers/payment-controller/payment.controller");

/**
 * @description Stripe webhook endpoint
 * @route POST /api/payment/webhook
 * @access Public (Stripe)
 * @note Raw body is required for signature verification - configured in app.js
 */
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
