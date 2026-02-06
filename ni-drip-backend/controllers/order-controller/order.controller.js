/**
 * @fileoverview Order controller – handles checkout and order management
 * @module controllers/orderController
 * @description Supports cart-based checkout, direct buy-now, stock validation,
 *              order history sync, and email notifications.
 */

const Order = require("../../models/order-model/order.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  sendOrderCancellationToUser,
  sendOrderCancellationToAdmin,
  sendOrderStatusUpdateEmail,
} = require("../../helpers/email-helper/email.helper");

/**
 * Create new order (cart-based or direct buy)
 * @body {string} [shippingAddress]     – optional override (highest priority)
 * @body {number} [shippingCost=0]
 * @body {string} [productId]           – required for direct buy
 * @body {number} [quantity=1]          – required for direct buy
 * @access Private
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

    // Fetch user with necessary fields
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ────────────────────────────────────────────────────────
    // Determine final shipping address (priority order)
    // 1. Override from request body (user explicitly provided)
    // 2. Last known geolocation address (automatic update)
    // 3. Saved profile address (fallback)
    // ────────────────────────────────────────────────────────
    let finalShippingAddress = overrideAddress?.trim();

    // Prefer geolocation if no override was given
    if (!finalShippingAddress && user.lastKnownLocation?.address?.trim()) {
      finalShippingAddress = user.lastKnownLocation.address.trim();
    }

    // Ultimate fallback to saved profile address
    if (!finalShippingAddress && user.address?.trim()) {
      finalShippingAddress = user.address.trim();
    }

    // If still no valid address → reject order
    if (!finalShippingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address is required. Please update your profile or enable location services.",
      });
    }

    let orderItems = [];
    let subtotal = 0;
    let isCartBased = false;

    // ────────────────────────────────────────────────────────
    // MODE 1: Cart-based Checkout
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
    // MODE 2: Direct Buy / Buy Now (single product)
    // ────────────────────────────────────────────────────────
    else if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
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

    const totalAmount = subtotal + Number(shippingCost);

    // Create the order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: finalShippingAddress,
      shippingCost: Number(shippingCost),
      status: "PENDING",
      paymentMethod: "STRIPE",
      paymentStatus: "PENDING",
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "usd", // Change as needed
      metadata: {
        orderId: order._id.toString(),
        userId: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save PaymentIntent ID to order
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    // Update user's order history
    user.orders.push({
      orderId: order._id,
      userId: userId,
      status: "PENDING",
      paymentStatus: "PENDING",
      placedAt: new Date(),
    });

    await user.save();

    // Populate order for response (emails will be sent after payment via webhook)
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone");

    // Note: Email notifications are now sent after successful payment via Stripe webhook

    res.status(201).json({
      success: true,
      message: "Order placed successfully! Complete payment to confirm your order.",
      order: populatedOrder,
      clientSecret: paymentIntent.client_secret,
      summary: {
        subtotal,
        shippingCost: Number(shippingCost),
        totalAmount,
        itemsCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        mode: isCartBased ? "Cart-based" : "Direct Buy",
        usedShippingAddress: finalShippingAddress,
        addressSource: overrideAddress
          ? "manual_override"
          : user.lastKnownLocation?.address
            ? "geolocation"
            : "profile_saved",
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
 * Get all orders (admin only)
 * @access Private (SuperAdmin)
 */
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const orders = await Order.find()
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      count: orders.length,
      allOrders: orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get single order by ID
 * @access Private (owner or admin)
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "SUPERADMIN";

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

    if (order.user.toString() !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Get all orders for current user
 * @access Private
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

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
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * Cancel user's own order (PENDING only)
 * @body {string} reasonForCancel
 * @access Private (order owner)
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reasonForCancel } = req.body;
    const userId = req.user.id;

    if (!reasonForCancel || reasonForCancel.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason required (min 5 characters)",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own orders",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel – order is ${order.status}`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "CANCELLED";
    order.paymentStatus = "CANCELLED";
    order.reasonForCancel = reasonForCancel.trim();
    order.cancelledAt = new Date();
    await order.save();

    // Sync user order history
    await User.updateOne(
      { _id: userId, "orders.orderId": orderId },
      {
        $set: {
          "orders.$.status": "CANCELLED",
          "orders.$.paymentStatus": "CANCELLED",
        },
      },
    );

    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone");

    await sendOrderCancellationToUser(populatedOrder, reasonForCancel.trim());
    await sendOrderCancellationToAdmin(populatedOrder, reasonForCancel.trim());

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully!",
      orderStatus: order.status,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Update order status and/or payment status (SuperAdmin only)
 * @param {string} orderId
 * @body {string} [status]           – e.g. "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"
 * @body {string} [paymentStatus]    – e.g. "PENDING", "PAID"
 * @access Private (SuperAdmin)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    // Only SuperAdmin can update order status
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required",
      });
    }

    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    // At least one field must be provided
    if (!status && !paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field: status or paymentStatus",
      });
    }

    // Validate status if provided
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    // Validate paymentStatus if provided
    const validPaymentStatuses = ["PENDING", "PAID"];
    if (
      paymentStatus &&
      !validPaymentStatuses.includes(paymentStatus.toUpperCase())
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid paymentStatus. Allowed: ${validPaymentStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(orderId).populate(
      "user",
      "userName email",
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Optional: Prevent changing status after DELIVERED or CANCELLED
    if (["DELIVERED", "CANCELLED"].includes(order.status) && status) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of a ${order.status} order`,
      });
    }

    // Apply updates
    if (status) {
      order.status = status.toUpperCase();
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus.toUpperCase();
    }

    // Optional: track who updated and when
    order.updatedBy = req.user.id;
    order.updatedAt = new Date();

    await order.save();

    // Sync to user's order history
    await User.updateOne(
      { _id: order.user, "orders.orderId": orderId },
      {
        $set: {
          "orders.$.status": order.status,
          "orders.$.paymentStatus": order.paymentStatus,
        },
      },
    );

    // Send email notification to user if status changed
    if (status) {
      await sendOrderStatusUpdateEmail?.(
        order.user.email,
        order.user.userName,
        order._id,
        order.status,
        order.subject || "Your Order Status Update",
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone");

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      updatedOrderStatus: populatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Delete an order permanently (SuperAdmin only)
 * @description Removes the order record and cleans up the reference in the User's order history.
 * @access Private (SuperAdmin)
 */
exports.deleteOrder = async (req, res) => {
  try {
    // 1. Authorization Check
    if (req.user.role !== "SUPERADMIN") {
      return res.status(403).json({
        success: false,
        message: "SuperAdmin access required to delete orders",
      });
    }

    const { orderId } = req.params;

    // 2. Find the order first to get the associated User ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const userId = order.user;

    // 3. Remove the order reference from the User's order history array
    await User.findByIdAndUpdate(userId, {
      $pull: { orders: { orderId: orderId } },
    });

    // 4. Delete the order from the database
    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
