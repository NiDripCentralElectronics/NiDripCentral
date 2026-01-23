/**
 * @file Order Controller
 * @description Controller module for managing customer orders in the e-commerce application.
 * Supports:
 * - Placing a new order from the user's cart (Cart-based checkout)
 * - Placing a direct "Buy Now" order for a single product (Direct Buy)
 * - Stock validation and deduction
 * - Order creation with item snapshots
 * - Updating user's order history
 * - Clearing the cart after cart-based checkout
 * - Email confirmation to user & admin notification
 *
 * @module controllers/orderController
 */

const Order = require("../../models/order-model/order.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");
const {
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToAdmin,
} = require("../../helpers/email-helper/email.helper");

/**
 * Place a new order (supports both Cart-based and Direct Buy modes)
 * POST /api/order/place-order
 * Private access (authenticated user)
 *
 * @body {Object} [req.body]
 * @body {string} [shippingAddress] - Optional override address
 * @body {number} [shippingCost=0] - Optional shipping cost
 * @body {string} [productId] - Required for Direct Buy mode (single product)
 * @body {number} [quantity=1] - Required for Direct Buy mode
 *
 * @async
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress: overrideAddress,
      shippingCost = 0,
      productId,
      quantity = 1,
    } = req.body;

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let orderItems = [];
    let subtotal = 0;
    let isCartBased = false;

    // ────────────────────────────────────────────────────────
    //   MODE 1: Cart-based Checkout (preferred if cart has items)
    // ────────────────────────────────────────────────────────
    if (user.cart && user.cart.length > 0) {
      isCartBased = true;

      for (const cartItem of user.cart) {
        const product = await Product.findById(cartItem.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${cartItem.productId} not found`,
          });
        }

        if (product.stock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.title} (only ${product.stock} available)`,
          });
        }

        const itemTotal = cartItem.quantity * product.price;
        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          quantity: cartItem.quantity,
          priceAtPurchase: product.price,
        });

        // Deduct stock
        product.stock -= cartItem.quantity;
        await product.save();
      }

      // Clear cart after successful cart-based order
      user.cart = [];
    }

    // ────────────────────────────────────────────────────────
    //   MODE 2: Direct Buy / Buy Now (single product)
    // ────────────────────────────────────────────────────────
    else if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      const qty = Number(quantity);
      if (isNaN(qty) || qty < 1) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Valid quantity (>=1) required for direct buy",
          });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title} (only ${product.stock} available)`,
        });
      }

      const itemTotal = qty * product.price;
      subtotal = itemTotal;

      orderItems.push({
        product: product._id,
        quantity: qty,
        priceAtPurchase: product.price,
      });

      // Deduct stock
      product.stock -= qty;
      await product.save();
    }

    // If neither cart nor productId → error
    else {
      return res.status(400).json({
        success: false,
        message:
          "Either cart must not be empty or provide productId & quantity for direct buy",
      });
    }

    // Use user's saved address or override from body
    const shippingAddress = overrideAddress?.trim() || user.address;
    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required. Update profile or provide one.",
      });
    }

    const totalAmount = subtotal + Number(shippingCost);

    // Create the order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      shippingCost: Number(shippingCost),
      status: "PENDING",
      paymentMethod: "PAY_ON_DELIVERY",
      paymentStatus: "PENDING",
    });

    // Update user's order history
    user.orders.push({
      orderId: order._id,
      userId: userId,
      status: "PENDING",
      paymentStatus: "PENDING",
      placedAt: new Date(),
    });

    await user.save();

    // Populate order for email and response
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone");

    // ────────────────────────────────────────────────────────
    //  Send Order Confirmation Email to User
    // ────────────────────────────────────────────────────────
    await sendOrderConfirmationToUser(populatedOrder);

    // ────────────────────────────────────────────────────────
    //  Send New Order Notification to Admin
    // ────────────────────────────────────────────────────────
    await sendNewOrderNotificationToAdmin(populatedOrder);

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Confirmation email sent.",
      order: populatedOrder,
      summary: {
        subtotal,
        shippingCost: Number(shippingCost),
        totalAmount,
        itemsCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        mode: isCartBased ? "Cart-based" : "Direct Buy",
      },
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order",
      error: error.message,
    });
  }
};
