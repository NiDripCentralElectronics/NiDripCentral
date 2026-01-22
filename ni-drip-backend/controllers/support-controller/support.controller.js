/**
 * @file Support Controller
 * @description Controller module for managing user support tickets / complaints.
 * Supports:
 * - Creating a new support ticket
 * - Getting all tickets of the authenticated user
 * - Getting a single ticket by ID (only if owned by user or admin)
 * - Updating ticket status & priority (admin only)
 * - Adding admin response / notes to a ticket
 * - Deleting/closing a ticket (user can close their own, admin can delete)
 *
 * @module controllers/supportController
 */

const Support = require("../../models/support-model/support.model");
const {
  sendTicketConfirmationToUser,
  sendNewTicketNotificationToAdmin,
} = require("../../helpers/email-helper/email.helper");

/**
 * Create a new support ticket / complaint
 * POST /api/support/create-ticket
 * Private access (authenticated user)
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority } = req.body;
    const userId = req.user.id;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }  

    const ticket = await Support.create({
      user: userId,
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || "MEDIUM",
    });

    // ────────────────────────────────────────────────
    //   IMPORTANT: Populate user for email (email + name)
    // ────────────────────────────────────────────────
    const populatedTicket = await Support.findById(ticket._id).populate(
      "user",
      "userName email",
    );

    const user = populatedTicket.user;

    // 1. Send confirmation to the user who created the ticket
    await sendTicketConfirmationToUser(user.email, user.userName, ticket);

    // 2. Send notification to Super Admin(s)
    await sendNewTicketNotificationToAdmin(populatedTicket);

    res.status(201).json({
      success: true,
      message:
        "Ticket generated successfully. You will receive a confirmation email shortly.",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server error ",
      error: error.message,
    });
  }
};

/**
 * Get all support tickets created by the authenticated user
 * GET /api/support/get-my-tickets
 * Private access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getMyTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    const tickets = await Support.find({ user: userId })
      .sort({ createdAt: -1 }) // newest first
      .select("-__v");

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get my tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get all support tickets (Admin/SuperAdmin only)
 * GET /api/support/all-tickets
 * Private access - Admin only
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getAllTickets = async (req, res) => {
  try {
    // Optional query filters (you can expand these later)
    const { status, priority, userId, page = 1, limit = 20 } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    if (userId) {
      filter.user = userId;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const pageLimit = Number(limit);

    // Fetch tickets with user info populated
    const tickets = await Support.find(filter)
      .populate("user", "userName email phone") // show basic user info
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(pageLimit)
      .select("-__v");

    res.status(200).json({
      success: true,
      message: "Tickets fetched successfully",
      tickets,
    });
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get a single support ticket by ID
 * GET /api/support/:ticketId
 * Private access (must be owner or admin)
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "SUPERADMIN" || req.user.role === "USER";

    const ticket = await Support.findById(ticketId).populate(
      "user",
      "userName email",
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Only allow owner or admin to view
    if (ticket.user.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this ticket",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Close / delete own ticket (user) or delete any ticket (admin)
 * DELETE /api/support/:ticketId
 * Private access
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "SUPERADMIN" || req.user.role === "USER";

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (ticket.user.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own tickets",
      });
    }

    await Support.findByIdAndDelete(ticketId);

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
