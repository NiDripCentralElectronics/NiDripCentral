/**
 * @fileoverview Mongoose schema for User management.
 * @module models/userModel
 * @description Represents a customer user with e-commerce features including cart, favorites,
 * order history, and product library. Includes security features like login tracking and account lockout.
 */

const mongoose = require("mongoose");

/**
 * @schema UserSchema
 * @description Schema representing a User with:
 * - Profile metadata & Contact info
 * - Authentication credentials
 * - Shopping Cart & Favorites management
 * - Order history & Digital Product Library
 * - Security tracking (Login attempts, Lockout, Session management)
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * Profile picture URL
     * @type {string|null}
     */
    profilePicture: {
      type: String,
      default: null,
    },

    /**
     * Display name of the User
     * @type {string}
     */
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Email address (used for login)
     * @type {string}
     */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /**
     * Hashed password
     * @type {string}
     */
    password: {
      type: String,
      required: true,
    },

    /**
     * Physical address for shipping/billing
     * @type {string}
     */
    address: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Contact phone number
     * @type {string}
     */
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * User role
     * @type {string}
     * @enum ["USER"]
     */

    role: {
      type: String,
      enum: ["USER"],
      default: "USER",
    },

    /**
     * Active status of the account
     * @type {boolean}
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Shopping cart items
     */
    cart: [
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
    ],

    /**
     * User's wishlisted/favorite products
     */
    favorites: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /**
     * Order history tracking
     */
    orders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        status: {
          type: String,
          enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
          default: "PENDING",
        },
        placedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /**
     * Security & Session Management
     */
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    /**
     * Automatically include createdAt and updatedAt timestamps
     */
    timestamps: true,
  },
);

/**
 * Mongoose model for User
 * @type {import('mongoose').Model}
 */
module.exports = mongoose.model("User", userSchema);
