/**
 * @file Review controller
 * @description Controller module for managing the NIDRIP Review product.
 * Supports:
 * - Creating reviews for products by users
 * - Managing review status (PENDING, APPROVED, REJECTED)
 * @module controllers/reviewController
 */

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    reviewText: {
      type: String,
      required: [true, "Review text cannot be empty"],
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Review", reviewSchema);
