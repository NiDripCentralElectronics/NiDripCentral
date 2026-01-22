/**
 * @file Review controller
 * @description Manages product reviews across both the Review collection and the Product's embedded review array.
 * @module controllers/reviewController
 */

const Review = require("../../models/review-model/review.model");
const Product = require("../../models/product-model/product.model");

/**
 * @async
 * @function addReview
 * @description Creates a new review in the Review collection and pushes it to the Product's internal reviews array.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.addReview = async (req, res) => {
  try {
    const { productId, reviewText } = req.body;
    const userId = req.user.id;

    // 1. Create entry in the separate Review collection
    const newReview = await Review.create({
      user: userId,
      product: productId,
      reviewText,
    });

    // 2. Synchronize: Push to Product's embedded array and increment count
    await Product.findByIdAndUpdate(productId, {
      $inc: { totalReviews: 1 },
      $push: {
        reviews: {
          user: userId,
          reviewText: reviewText,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      newReview,
    });
  } catch (error) {
    console.error("❌ Add Review Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @async
 * @function updateReview
 * @description Updates an existing review text in both the Review collection and the Product's internal array.
 * @param {import('express').Request} req - Express request object containing reviewId in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reviewText } = req.body;
    const userId = req.user.id;

    // 1. Update in the Review collection
    const updatedReview = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { reviewText },
      { new: true, runValidators: true },
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or user unauthorized.",
      });
    }

    // 2. Synchronize: Update the matching element in the Product's reviews array
    // Uses the positional operator ($) to update the specific sub-document
    await Product.updateOne(
      { _id: updatedReview.product, "reviews.user": userId },
      { $set: { "reviews.$.reviewText": reviewText } },
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      updatedReview,
    });
  } catch (error) {
    console.error("❌ Update Review Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @async
 * @function deleteReview
 * @description Removes a review from the collection and pulls it from the Product's internal array.
 * @param {import('express').Request} req - Express request object containing reviewId in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found." });
    }

    // Authorization: Only author or SUPERADMIN can delete
    const isAuthor = review.user.toString() === req.user.id;
    const isAdmin = req.user.role === "SUPERADMIN";

    if (!isAuthor && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action." });
    }

    const productId = review.product;
    const reviewAuthorId = review.user;

    // 1. Delete from Review collection
    await review.deleteOne();

    // 2. Synchronize: Remove from Product array and decrement count
    await Product.findByIdAndUpdate(productId, {
      $inc: { totalReviews: -1 },
      $pull: { reviews: { user: reviewAuthorId } },
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Delete Review Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @async
 * @function getAllReviews
 * @description Fetches all reviews for a specific product from the Review collection.
 * @param {import('express').Request} req - Express request object containing productId in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getAllReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "userName profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("❌ Fetch Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
