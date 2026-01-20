/**
 * @file Favorite Controller
 * @description Manages user wishlists with dual-storage logic:
 * 1. Synchronizes with an independent 'Favorite' collection.
 * 2. Mirrors data within the 'User' document favorites array.
 */

const Favorite = require("../../models/favorite-model/favorite.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");

/**
 * Helper: Synchronizes User document favorites array with the Favorite collection
 */
const syncUserFavorites = async (userId) => {
  const allFavorites = await Favorite.find({ userId });
  // Map to match the sub-document structure in your User Schema
  const favoriteData = allFavorites.map((fav) => ({
    productId: fav.productId,
    addedAt: fav.addedAt,
  }));
  await User.findByIdAndUpdate(userId, { favorites: favoriteData });
};

/**
 * Add product to favorites (Toggle-like behavior can be implemented, but this is a standard Add)
 * POST /api/favorite/add-to-favorite
 */
exports.addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // 2. Check if already favorited
    const existingFavorite = await Favorite.findOne({ userId, productId });
    if (existingFavorite) {
      return res
        .status(400)
        .json({ success: false, message: "Product is already in favorites" });
    }

    // 3. Save to Separate Collection
    const favorite = new Favorite({ userId, productId });
    await favorite.save();

    // 4. Sync to User Model
    await syncUserFavorites(userId);

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      favorite,
    });
  } catch (error) {
    console.error("Add Favorite Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Remove product from favorites
 * POST /api/favorite/remove-from-favorite
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user.userId;

    const result = await Favorite.deleteOne({ userId, productId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Favorite not found" });
    }

    // Sync to User Model
    await syncUserFavorites(userId);

    res.status(200).json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove Favorite Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get all favorites for a user
 * GET /api/favorite/get-all-favorites
 */
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const favorites = await Favorite.find({ userId })
      .populate({
        path: "productId",
        select: "title price productImages status averageRating",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Favorites fetched successfully",
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error("Get Favorites Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
