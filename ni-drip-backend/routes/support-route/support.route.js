/**
 * @fileoverview Express routes for Product Reviewing
 * @module routes/reviewRoutes
 * @description Provides endpoints for:
 * - Add or Update Product Review (Authenticated users)
 * - Fetch Product Reviews
 */

const express = require("express");
const router = express.Router();
const supportController = require("../../controllers/support-controller/support.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @desc Create ticket
 */
router.post(
  "/create-ticket",
  encryptedAuthMiddleware,
  supportController.createTicket,
);

/**
 * @desc Retrieve all tickets created by the authenticated user
 */
router.get(
  "/get-my-tickets/:userId",
  encryptedAuthMiddleware,
  supportController.getMyTickets,
);

/**
 * @desc Retrieve ticket by id
 */
router.get(
  "/get-ticket-by-id/:ticketId",
  encryptedAuthMiddleware,
  supportController.getTicketById,
);

/**
 * @desc Retrieve all tickets
 */
router.get(
  "/get-all-tickets",
  encryptedAuthMiddleware,
  supportController.getAllTickets,
);

/**
 * @desc Delete ticket
 */
router.delete(
  "/delete-ticket/:ticketId",
  encryptedAuthMiddleware,
  supportController.deleteTicket,
);

module.exports = router;
