/**
 * @file Rating controller
 * @description Controller module for managing the NIDRIP Rating product.
 * Supports:
 * - Creating ratings for products by users
 * - Ensuring unique ratings per user-product pair
 * @module controllers/ratingController
 */

const mongoose = require("mongoose");


const ratingSchema = new mongoose.Schema(
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
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true, // Tracks when the rating was given/updated
  },
);

// Prevent a user from rating the same product multiple times
ratingSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
