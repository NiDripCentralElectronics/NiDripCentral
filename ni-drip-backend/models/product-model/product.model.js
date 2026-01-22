/**
 * @fileoverview Mongoose schema for Product management within the NIDRIP application.
 * @module models/productModel
 * @description Represents a product entry including pricing, categorization, stock tracking, and attribution to the creating Super Admin.
 */

const mongoose = require("mongoose");

/**
 * Sub-schema for product ratings
 */
const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Customer model
      required: true,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { _id: false },
);

/**
 * Sub-schema for product review
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Customer model
      required: true,
    },

    /**
     * text review/message from the user
     */
    reviewText: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

/**
 * @schema ProductSchema
 * @description Schema representing a Product with:
 * - Visual assets (Image)
 * - Basic metadata (Title, Description)
 * - Financial data (Price)
 * - Inventory management (Stock)
 * - Categorization
 * - Admin attribution (addedBy)
 */
const productSchema = new mongoose.Schema(
  {
    /**
     * URL of the product image (stored in Cloudinary)
     * @type {string|null}
     */
    productImages: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 5,
        message: "You can upload a maximum of 5 images per product",
      },
    },

    /**
     * Display title of the product
     * @type {string}
     */
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },

    /**
     * Detailed description of the product features/specs
     * @type {string}
     */
    description: {
      type: String,
      required: [true, "Product description is required"],
    },

    /**
     * Unit price of the product
     * @type {number}
     */
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    /**
     * List of categories the product belongs to
     * @type {string[]}
     */
    category: {
      type: [String],
      required: [true, "At least one category is required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Product must have at least one category.",
      },
    },

    /**
     * Current inventory count
     * @type {number}
     */
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    /**
     * Status of the product (ACTIVE/INACTIVE)
     * @type {string}
     */
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    /**
     * Ratings Section
     */
    ratings: [ratingSchema],

    averageRating: {
      type: Number,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    /**
     * Review Section
     */
    reviews: [reviewSchema],

    averageReview: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    /**
     * Reference to the SuperAdmin who created/added this product
     * @type {mongoose.Schema.Types.ObjectId}
     * @ref "SuperAdmin"
     */
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: [true, "Product must be attributed to a Super Admin"],
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
 * Mongoose model for Product
 * @type {import('mongoose').Model}
 */
module.exports = mongoose.model("Product", productSchema);
