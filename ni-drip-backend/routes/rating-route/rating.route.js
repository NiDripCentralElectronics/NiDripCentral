/**
 * @fileoverview Express routes for Product Rating
 * @module routes/ratingRoutes
 * @description Provides endpoints for:
 * - Add or Update Product Rating (Authenticated users)
 * - Fetch Product Ratings
 */

const express = require("express");
const router = express.Router();
const ratingController = require("../../controllers/rating-controller/rating.controller");
const {
  encryptedAuthMiddleware,
} = require("../../middlewares/auth-middleware/auth.middleware");

/**
 * @desc Create rating
 */
router.post(
  "/add-rating",
  encryptedAuthMiddleware,
  ratingController.addRating,
);

/**
 * @desc Retrieve all ratings (Public access for Users)
 */
router.get("/get-all-ratings/:productId", ratingController.getAllRatings);


module.exports = router;
