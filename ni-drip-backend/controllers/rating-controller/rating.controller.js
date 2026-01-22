/**
 * @file Rating controller
 * @description Manages product ratings, ensuring calculations for average ratings are updated.
 * @module controllers/ratingController
 */

const Rating = require("../../models/rating-model/rating.model");
const Product = require("../../models/product-model/product.model");

/**
 * Add or Update a product rating
 * POST /api/rating/add-rating
 * Private access (Authenticated users)
 */
exports.addRating = async (req, res) => {
  try {
    const { productId, stars } = req.body;
    const userId = req.user.id;

    // 1. Basic Validation
    if (!productId || !stars) {
      return res.status(400).json({
        success: false,
        message: "Product ID and star rating (1-5) are required.",
      });
    }

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    // 3. Update existing rating or create new (Upsert)
    // This prevents a user from having multiple rating entries for one product
    const rating = await Rating.findOneAndUpdate(
      { user: userId, product: productId },
      { stars: stars },
      { new: true, upsert: true, runValidators: true },
    );

    const ratingData = { user: userId, stars: stars };

    // 4. Recalculate Average Rating for the Product
    // We fetch all ratings for this product to get the new average
    const allRatings = await Rating.find({ product: productId });
    const totalRatings = allRatings.length;
    const sumRatings = allRatings.reduce((acc, item) => item.stars + acc, 0);
    const averageRating = (sumRatings / totalRatings).toFixed(1);

    // 5. Update the Product document with new stats
    await Product.findByIdAndUpdate(productId, {
      averageRating: averageRating,
      totalRatings: totalRatings,
      $push: { ratings: ratingData },
    });

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      rating,
      stats: { averageRating, totalRatings },
    });
  } catch (error) {
    console.error("❌ Add Rating Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Get all ratings for a specific product
 * GET /api/rating/get-product-ratings/:productId
 */
exports.getAllRatings = async (req, res) => {
  try {
    const { productId } = req.params;

    const ratings = await Rating.find({ product: productId })
      .populate("user", "userName profileImage") // Show who rated it
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("❌ Fetch Ratings Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
