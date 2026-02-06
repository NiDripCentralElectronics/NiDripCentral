/**
 * @fileoverview Mongoose schema for orders / completed purchases
 * @module models/orderModel
 */

const mongoose = require("mongoose");

/**
 * Schema for orders
 * @typedef {Object} Order
 * @property {ObjectId} user           - Reference to the customer
 * @property {Array}    items          - List of purchased products
 * @property {ObjectId} items.product  - Reference to Product
 * @property {number}   items.quantity - Quantity purchased
 * @property {number}   items.priceAtPurchase - Price at time of checkout
 * @property {number}   totalAmount    - Final total (items + shipping)
 * @property {string}   shippingAddress - Full delivery address
 * @property {number}   shippingCost   - Shipping fee
 * @property {string}   status         - Order fulfillment status
 * @property {string}   paymentMethod  - Payment method used
 * @property {string}   paymentStatus  - Payment completion status
 * @property {Date}     createdAt
 * @property {Date}     updatedAt
 */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
      index: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      type: String,
      required: [true, "Shipping address is required for delivery"],
    },

    shippingCost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: ["PAY_ON_DELIVERY", "STRIPE"],
      default: "PAY_ON_DELIVERY",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "PENDING",
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
