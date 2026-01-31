/**
 * @fileoverview Rating controller – manages product ratings
 * @module controllers/ratingController
 * @description Handles rating submission (upsert) and average recalculation.
 */

const Rating = require("../../models/rating-model/rating.model");
const Product = require("../../models/product-model/product.model");

/**
 * Add or update rating for a product
 * @body {string} productId
 * @body {number} stars (1–5)
 * @access Private
 */
exports.addRating = async (req, res) => {
  try {
    const { productId, stars } = req.body;
    const userId = req.user.id;

    if (!productId || !stars || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID and rating (1–5) required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already rated
    const existingRating = product.ratings.find(
      (r) => r.user.toString() === userId,
    );

    if (existingRating) {
      // Update stars
      existingRating.stars = Number(stars);
    } else {
      // Push new rating
      product.ratings.push({
        user: userId,
        stars: Number(stars),
      });
    }

    // Recalculate stats
    const total = product.ratings.length;
    const avg =
      total > 0
        ? product.ratings.reduce((sum, r) => sum + r.stars, 0) / total
        : 0;

    product.averageRating = Number(avg.toFixed(1));
    product.totalRatings = total;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted",
      stats: {
        averageRating: product.averageRating,
        totalRatings: total,
      },
    });
  } catch (error) {
    console.error("Add rating error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get all ratings for a product
 * @param {string} productId
 * @access Public
 */
exports.getAllRatings = async (req, res) => {
  try {
    const { productId } = req.params;

    const ratings = await Rating.find({ product: productId })
      .populate("user", "userName profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Ratings fetched successfully",
      count: ratings.length,
      allRatings: ratings,
    });
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
