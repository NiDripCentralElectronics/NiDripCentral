/**
 * @fileoverview Mongoose schema for Support/Complaint management within the NIDRIP application.
 * @module models/supportModel
 * @description Represents a support ticket/complaint submission by users with tracking, status, and priority management.
 */

const mongoose = require("mongoose");

/**
 * @schema Support Schema
 * @description Schema representing a support ticket/complaint with:
 * - User attribution
 * - Complaint details (subject, description)
 * - Status tracking
 * - Priority management
 * - Response tracking
 * - Timestamps for lifecycle management
 */
const supportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Support ticket must be associated with a user"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [50, "Subject cannot exceed 50 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [200, "Description must be at least 200 characters long"],
    },

    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      required: [true, "Priority is required"],
    },
  },
  {
    /**
     * Automatically include createdAt and updatedAt timestamps
     */
    timestamps: true,
  },
);

module.exports = mongoose.model("Support", supportSchema);
