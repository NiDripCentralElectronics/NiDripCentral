/**
 * @fileoverview Payment controller – handles Stripe webhook processing
 * @module controllers/paymentController
 * @description Handles Stripe webhook events for payment confirmation
 */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../../models/order-model/order.model");
const User = require("../../models/user-model/user.model");
const Product = require("../../models/product-model/product.model");
const {
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToAdmin,
} = require("../../helpers/email-helper/email.helper");

/**
 * Handle Stripe webhook events
 * @description Processes payment_intent.succeeded and payment_intent.payment_failed events
 * @access Public (Stripe webhook)
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${err.message}`,
    });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

/**
 * Handle successful payment
 * @param {Object} paymentIntent - Stripe PaymentIntent object
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { orderId, userId } = paymentIntent.metadata;

    if (!orderId) {
      console.error("No orderId in payment intent metadata");
      return;
    }

    // Find and update the order
    const order = await Order.findById(orderId);

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Update order status
    order.status = "PROCESSING";
    order.paymentStatus = "PAID";
    await order.save();

    // Sync to user's order history
    await User.updateOne(
      { _id: order.user, "orders.orderId": orderId },
      {
        $set: {
          "orders.$.status": "PROCESSING",
          "orders.$.paymentStatus": "PAID",
        },
      }
    );

    // Populate order for emails
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: "items.product",
        select: "title productImages price",
      })
      .populate("user", "userName email phone");

    // Send confirmation emails
    await sendOrderConfirmationToUser(populatedOrder);
    await sendNewOrderNotificationToAdmin(populatedOrder);

    console.log(`Payment succeeded for order: ${orderId}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

/**
 * Handle failed payment
 * @param {Object} paymentIntent - Stripe PaymentIntent object
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    const { orderId } = paymentIntent.metadata;

    if (!orderId) {
      console.error("No orderId in payment intent metadata");
      return;
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Update payment status to failed
    order.paymentStatus = "FAILED";
    await order.save();

    // Sync to user's order history
    await User.updateOne(
      { _id: order.user, "orders.orderId": orderId },
      {
        $set: {
          "orders.$.paymentStatus": "FAILED",
        },
      }
    );

    // Restore stock for failed payments
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    console.log(`Payment failed for order: ${orderId}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}
