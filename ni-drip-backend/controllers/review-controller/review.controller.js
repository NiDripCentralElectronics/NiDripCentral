/**
 * @fileoverview Review controller – manages product reviews
 * @module controllers/reviewController
 * @description Handles review CRUD with sync to Product.embedded reviews array.
 */

const Review = require("../../models/review-model/review.model");
const Product = require("../../models/product-model/product.model");

/**
 * Add new review
 * @body {string} productId
 * @body {string} reviewText
 * @access Private
 */
exports.addReview = async (req, res) => {
  try {
    const { productId, reviewText, stars } = req.body;
    const userId = req.user.id;

    if (!productId || !reviewText?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    let review = await Review.create({
      user: userId,
      product: productId,
      reviewText: reviewText.trim(),
    });

    review = await review.populate([
      { path: "user", select: "userName email profilePicture" },
      {
        path: "product",
        select: "title productImages averageRating totalRatings",
      },
    ]);

    await Product.findByIdAndUpdate(productId, {
      $inc: { totalReviews: 1 },
      $push: {
        reviews: {
          _id: review._id,
          user: userId,
          reviewText: reviewText.trim(),
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      newReview: review,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

/**
 * Update existing review
 * @param {string} reviewId
 * @body {string} reviewText
 * @access Private (author)
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reviewText } = req.body;
    const userId = req.user.id;

    if (!reviewText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review text required",
      });
    }

    const updated = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { reviewText: reviewText.trim() },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Review not found or not authorized",
      });
    }

    await Product.updateOne(
      { _id: updated.product, "reviews.user": userId },
      { $set: { "reviews.$.reviewText": reviewText.trim() } },
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      updatedReview: updated,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Delete review
 * @param {string} reviewId
 * @access Private (author or SuperAdmin)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.product;

    await review.deleteOne();

    await Product.findByIdAndUpdate(productId, {
      $inc: { totalReviews: -1 },
      $pull: { reviews: { user: review.user } },
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get all reviews
 * @access Public
 */
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "profilePicture userName email")
      .populate("product", "productImage title description")
      .sort({ createdAt: -1 });

    if (!reviews.length) {
      return res.status(404).json({
        success: false,
        message: "No review found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      count: reviews.length,
      allReviews: reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
