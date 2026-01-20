/**
 * @fileoverview Mongoose schema for Cart (Shopping Cart) in the application
 * @module models/cartModel
 * @description Represents items added to a user's shopping cart with quantity,
 *              price tracking, and references to User and Product/Book
 */

const mongoose = require("mongoose");

/**
 * @schema cartSchema
 * @description Schema for Cart items with:
 * - Reference to user
 * - Reference to product/book
 * - Quantity & price tracking
 * - Automatic timestamps
 */
const cartSchema = new mongoose.Schema(
  {
    /**
     * The user who owns this cart item
     * @type {ObjectId}
     * @ref "User"
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true, // good for queries per user
    },

    /**
     * The product/book being added to cart
     * @type {ObjectId}
     * @ref "Product"  ← Change to "Book" if you still use separate Book model
     */
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // ← most recommended change
      required: [true, "Product is required"],
      index: true,
    },

    /**
     * Quantity of this product in cart
     * @type {number}
     */
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },

    /**
     * Unit price of the product at the time it was added to cart
     * @type {number}
     */
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },

    /**
     * Total price for this line item (quantity × unitPrice)
     * Usually updated automatically via pre-save middleware
     * @type {number}
     */
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },    
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// -----------------------------
// Virtual - Subtotal (just alias for totalPrice)
// -----------------------------
cartSchema.virtual("subtotal").get(function () {
  return this.totalPrice;
});

// -----------------------------
// Pre-save middleware - keep totalPrice in sync
// -----------------------------
cartSchema.pre("save", function (next) {
  if (this.isModified("quantity") || this.isModified("unitPrice")) {
    this.totalPrice = this.quantity * this.unitPrice;
  }
  next();
});

// -----------------------------
// Compound index - very useful for most common queries
// -----------------------------
cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

/**
 * Mongoose model for Cart
 * @type {import('mongoose').Model}
 */
module.exports = mongoose.model("Cart", cartSchema);
