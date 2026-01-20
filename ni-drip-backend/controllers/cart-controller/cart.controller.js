/**
 * @file Cart Controller
 * @description Manages shopping cart operations with dual-storage logic:
 * 1. Synchronizes with an independent 'Cart' collection for high-performance indexing.
 * 2. Mirrors data within the 'User' document for fast profile-based retrieval.
 * * @module controllers/cartController
 */

const Cart = require("../../models/cart-model/cart.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");

/**
 * Helper: Synchronizes the User document's cart array with the Cart collection
 * @param {string} userId
 */
const syncUserCart = async (userId) => {
  const allCartItems = await Cart.find({ userId });
  await User.findByIdAndUpdate(userId, { cart: allCartItems });
};

/**
 * Add item to cart
 * POST /api/cart/add-to-cart
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.stock < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Product is out of stock" });
    }

    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId,
        productId,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
      });
      await cartItem.save();
    }

    await syncUserCart(userId);

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cartItem: await Cart.findById(cartItem._id).populate("productId"),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Decrease quantity or remove item if quantity is 1
 * POST /api/cart/remove-from-cart
 */
exports.decreaseCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user.userId;

    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    } else {
      await Cart.findByIdAndDelete(cartItem._id);
    }

    await syncUserCart(userId);

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error("Decrease cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Remove product from cart completely
 * DELETE /api/cart/remove-product-from-cart
 */
exports.removeProductFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user.userId;

    await Cart.deleteOne({ userId, productId });
    await syncUserCart(userId);

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart/clear-cart
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    await Cart.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { cart: [] });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get user's cart
 * GET /api/cart/get-cart
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const cartItems = await Cart.find({ userId })
      .populate({
        path: "productId",
        select: "title price productImages stock status",
      })
      .sort({ createdAt: -1 });

    const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      count: cartItems.length,
      cartTotal,
      items: cartItems,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
