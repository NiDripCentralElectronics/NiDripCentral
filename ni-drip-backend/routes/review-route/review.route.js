/**
 * @fileoverview Express routes for Product Reviewing
 * @module routes/reviewRoutes
 * @description Provides endpoints for:
 * - Add or Update Product Review (Authenticated users)
 * - Fetch Product Reviews
 */

const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/review-controller/review.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @desc Create rating
 */
router.post("/add-review", encryptedAuthMiddleware, reviewController.addReview);

/**
 * @desc Retrieve all reviews (Public access for Users)
 */
router.get("/get-all-reviews/:productId", reviewController.getAllReviews);

/**
 * @desc Update a review (Private access - Authenticated users)
 */
router.patch(
  "/update-review/:reviewId",
  encryptedAuthMiddleware,
  reviewController.updateReview,
);

/**
 * @desc Delete a review (Private access - Authenticated users)
 */
router.delete(
  "/delete-review/:reviewId",
  encryptedAuthMiddleware,
  reviewController.deleteReview,
);

module.exports = router;
