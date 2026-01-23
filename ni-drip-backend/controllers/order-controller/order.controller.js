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
  sendOrderCancellationToAdmin,
  sendOrderCancellationToUser,
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
        return res.status(400).json({
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
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getAllOrders
 * @description Fetches every order in the database. Accessible only by Admins.
 * @access Private (Admin/SuperAdmin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    // 1. SuperAdmin check
    const isSuperAdmin = req.user.role === "SUPERADMIN";
    if (!isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. SuperAdmin privileges required.",
      });
    }

    // 2. Fetch all orders without filtering or pagination
    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone")
      .sort({ createdAt: -1 }); // Newest orders first

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      allOrders: orders,
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @async
 * @function getOrderById
 * @description Fetches details of a specific order. Accessible by Admin or the order owner.
 * @access Private (Owner/Admin)
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isSuperAdmin = req.user.role === "SUPERADMIN";

    const order = await Order.findById(orderId)
      .populate({
        path: "items.product",
        select: "title productImages price stock",
      })
      .populate("user", "userName email phone address");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 3. Authorization check: Must be the person who placed it OR an Admin
    if (order.user._id.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @async
 * @function getUserOrders
 * @description Fetches all orders belonging to the authenticated user.
 * @access Private (Authenticated User)
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    // 4. Fetch all orders for this specific user only
    const orders = await Order.find({ user: userId })
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      count: orders.length,
      myOrders: orders,
    });
  } catch (error) {
    console.error("❌ Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @async
 * @function cancelOrder
 * @description Allows a user to cancel their own order.
 * Reverts product stock and updates status in both Order and User collections.
 * Sends cancellation confirmation emails to the user and notification to admin.
 * @access Private (Order Owner)
 * @body {string} reasonForCancel - The reason provided by the user for cancelling.
 * @param {import('express').Request} req - Express request object containing orderId in params.
 * @param {import('express').Response} res - Express response object.
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reasonForCancel } = req.body;
    const userId = req.user.id;

    // 1. Validation: Check if reason is provided
    if (!reasonForCancel || reasonForCancel.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message:
          "A valid reason for cancellation (min 5 characters) is required.",
      });
    }

    // 2. Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // 3. Authorization: Only the owner can cancel
    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order.",
      });
    }

    // 4. Status Check: Can only cancel if PENDING
    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. It is already ${order.status}.`,
      });
    }

    // 5. Revert Product Stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    // 6. Update Order Document
    order.status = "CANCELLED";
    order.paymentStatus = "CANCELLED"; // Since it's COD and not paid yet
    order.reasonForCancel = reasonForCancel.trim(); // Save reason (add this field to Order schema if not exists)
    order.cancelledAt = new Date(); // Optional: track cancellation time
    await order.save();

    // 7. Synchronize User Order History
    await User.updateOne(
      { _id: userId, "orders.orderId": orderId },
      {
        $set: {
          "orders.$.status": "CANCELLED",
          "orders.$.paymentStatus": "CANCELLED",
        },
      },
    );

    // 8. Populate order for email content
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone");

    // 9. Send Cancellation Emails
    await sendOrderCancellationToUser(populatedOrder, reasonForCancel.trim());
    await sendOrderCancellationToAdmin(populatedOrder, reasonForCancel.trim());

    res.status(200).json({
      success: true,
      message:
        "Order cancelled successfully. Confirmation emails have been sent.",
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
