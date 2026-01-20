/**
 * @fileoverview Mongoose schema for Favorites in the application
 * @module models/favoriteModel
 * @description Represents a user's bookmarked or favorite product
 */

const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent a user from favoriting the same product multiple times
favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
