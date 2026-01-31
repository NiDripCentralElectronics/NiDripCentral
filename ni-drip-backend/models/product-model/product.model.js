/**
 * @fileoverview Mongoose schema for products in the NIDRIP application
 * @module models/productModel
 */

const mongoose = require("mongoose");

/**
 * Sub-schema for individual rating
 * @typedef {Object} Rating
 * @property {ObjectId} user  - User who gave the rating
 * @property {number}   stars - Rating value (1–5)
 */
const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
 * Sub-schema for individual review
 * @typedef {Object} Review
 * @property {ObjectId} user       - User who wrote the review
 * @property {string}   reviewText - Review text content
 */
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviewText: {
    type: String,
    trim: true,
    default: "",
  },
});

/**
 * Schema for products
 * @typedef {Object} Product
 * @property {string[]}   productImages   - Array of image URLs (max 5)
 * @property {string}     title           - Product title
 * @property {string}     description     - Detailed product description
 * @property {number}     price           - Unit price
 * @property {string[]}   category        - List of categories
 * @property {number}     stock           - Available stock quantity
 * @property {string}     status          - ACTIVE or INACTIVE
 * @property {Rating[]}   ratings         - Array of user ratings
 * @property {number}     averageRating   - Calculated average rating
 * @property {number}     totalRatings    - Total number of ratings
 * @property {Review[]}   reviews         - Array of user reviews
 * @property {number}     averageReview   - (Currently unused – possibly for future text-based scoring)
 * @property {number}     totalReviews    - Total number of reviews
 * @property {ObjectId}   addedBy         - SuperAdmin who created the product
 * @property {Array<{section: string, items: Array<{name: string, value: string}>}>} specifications - Product specifications organized into sections (e.g., "General Features", "Technical Specifications")
 * @property {Date}       createdAt
 * @property {Date}       updatedAt
 */
const productSchema = new mongoose.Schema(
  {
    productImages: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 5,
        message: "You can upload a maximum of 5 images per product",
      },
    },

    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

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

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    ratings: [ratingSchema],

    averageRating: {
      type: Number,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    reviews: [reviewSchema],

    averageReview: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: [true, "Product must be attributed to a Super Admin"],
    },

    // New field: Specifications organized into sections for flexibility
    // Example usage:
    // specifications: [
    //   {
    //     section: "General Features",
    //     items: [
    //       { name: "Noise Cancellation", value: "ENC" },
    //       { name: "Water Resistant", value: "IPX4" },
    //       { name: "Charging Interface", value: "Type-C" },
    //       ...
    //     ]
    //   },
    //   {
    //     section: "Technical Specifications",
    //     items: [ ... ]
    //   }
    // ]
    specifications: {
      type: [
        {
          section: {
            type: String,
            required: true,
            trim: true,
          },
          items: {
            type: [
              {
                name: {
                  type: String,
                  required: true,
                  trim: true,
                },
                value: {
                  type: String,
                  required: true,
                  trim: true,
                },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
