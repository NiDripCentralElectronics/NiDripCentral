/**
 * @fileoverview Email service utilities for NIDRIP application
 * @module services/emailService
 * @description Nodemailer-based email sender with branded HTML templates
 *              Supports password resets, support tickets, and order notifications
 */

const nodemailer = require("nodemailer");

// Validate required environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error(
    "Missing required environment variables: EMAIL_USER and EMAIL_PASS",
  );
}

/**
 * Configured Nodemailer transporter (Gmail SMTP)
 * @type {import('nodemailer').Transporter}
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/**
 * Send plain email with HTML content
 * @async
 * @param {Object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html    - HTML body content
 * @returns {Promise<boolean>} Success status
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: "NIDRIP <no-reply@nidrip.com>",
      to: to.trim(),
      subject,
      html,
      text: html.replace(/<[^>]+>/g, " ").substring(0, 200) + "...",
    });

    console.log(`Email sent to ${to} | MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return false;
  }
};

/**
 * Wrap content in branded NIDRIP HTML email template
 * @param {string} content - Main email body HTML
 * @param {string} [title="NIDRIP Notification"] - Document title
 * @returns {string} Complete HTML email
 */
const getEmailTemplate = (content, title = "NIDRIP Notification") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  <style>
    body { margin:0; padding:0; background:#f4f4f9; font-family:"Inter",system-ui,sans-serif; line-height:1.6; color:#333; }
    a { color:#E32264; text-decoration:none; }
    .container { max-width:640px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 10px 40px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#E32264 0%,#A3268E 100%); padding:48px 32px; text-align:center; position:relative; }
    .header::before { content:''; position:absolute; top:0; left:0; right:0; height:6px; background:linear-gradient(90deg,#ffffff33,transparent); }
    .logo { width:160px; height:auto; margin-bottom:16px; }
    .brand-title { color:#fff; font-size:36px; font-weight:800; margin:0; letter-spacing:-1.2px; }
    .main-content { padding:56px 48px; background:#fff; color:#2d2d2d; }
    .btn-primary { display:inline-block; background:linear-gradient(135deg,#E32264 0%,#A3268E 100%); color:#fff !important; font-weight:700; font-size:17px; padding:18px 44px; border-radius:12px; text-decoration:none; box-shadow:0 8px 25px rgba(227,34,100,0.3); transition:all 0.3s ease; }
    .btn-primary:hover { transform:translateY(-3px); box-shadow:0 14px 35px rgba(227,34,100,0.4); }
    .info-box { background:#f8f9fa; border-left:5px solid #E32264; padding:28px; border-radius:12px; margin:36px 0; font-size:16px; line-height:1.7; }
    .info-box strong { color:#1a1a1a; display:inline-block; min-width:140px; }
    .items-list { list-style:none; padding:0; margin:24px 0; }
    .items-list li { padding:16px 0; border-bottom:1px solid #eee; }
    .items-list li:last-child { border-bottom:none; }
    .total-box { background:#f0f0f0; padding:28px; border-radius:12px; margin:36px 0; text-align:right; font-size:17px; }
    .total-box strong { font-size:22px; color:#E32264; }
    .footer { background:#0f0f1a; padding:48px 40px; text-align:center; color:#888; }
    .footer-title { color:#E32264; font-size:20px; font-weight:700; margin:0 0 12px; }
    .footer-copy { font-size:14px; margin:16px 0; }
    .footer-note { font-size:13px; color:#666; line-height:1.6; margin-top:24px; }
    @media (max-width:600px) { .main-content { padding:40px 32px; } .header { padding:40px 24px; } .info-box { padding:20px; } }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f9;padding:40px 20px;">
    <tr><td align="center">
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1769081264/NiDrip/logo/logo_ny2do0.png" alt="NIDRIP" class="logo" />
        </div>
        <div class="main-content">
          ${content}
        </div>
        <div class="footer">
          <p class="footer-title">NIDRIP</p>
          <p class="footer-copy">© ${new Date().getFullYear()} <strong style="color:#E32264;">NIDRIP</strong>. All rights reserved.</p>
          <p class="footer-note">
            This is an automated message from NIDRIP.<br>
            If you didn't initiate this action, please ignore this email or contact support.
          </p>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>
`;

/**
 * Shorten MongoDB ID to last 6 chars with # prefix
 * @param {string} id - ObjectId or string
 * @returns {string} e.g. #ABC123
 */
const shortenId = (id) => {
  if (!id) return "#------";
  const str = id.toString();
  return "#" + str.slice(-6).toUpperCase();
};

/**
 * Format date as "23 January 2026"
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

/**
 * Get frontend base URL based on user role
 * @param {string} role - User role
 * @returns {string} Frontend base URL
 */
function getFrontendUrl(role) {
  switch (role) {
    case "SUPERADMIN":
      if (!process.env.FRONTEND_URL) {
        throw new Error("FRONTEND_URL is not defined");
      }
      return process.env.FRONTEND_URL.replace(/\/+$/, "");

      case "USER":
      if (!process.env.FRONTEND_URL) {
        throw new Error("FRONTEND_URL is not defined");
      }
      return process.env.FRONTEND_URL.replace(/\/+$/, "");

    default:
      throw new Error(`No frontend URL configured for role: ${role}`);
  }
}

/**
 * Send password reset email
 * @async
 * @param {string} toEmail    - Recipient email
 * @param {string} resetToken - Reset token
 * @param {string} role       - User role
 * @returns {Promise<boolean>}
 */
const sendPasswordResetEmail = async (toEmail, resetToken, role) => {
  const frontendUrl = getFrontendUrl(role);
  const resetLink = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}`;

  const content = `
    <div style="text-align:center;max-width:520px;margin:0 auto;">
      <h2 style="color:#1a1a1a;font-size:32px;margin-bottom:24px;font-weight:800;">
        Reset Your Password
      </h2>
      <p style="color:#444444;line-height:1.8;margin-bottom:40px;font-size:17px;">
        We received a request to reset the password for your NIDRIP account.<br>
        Please click the button below to create a new password.
      </p>
      <div style="margin:50px 0;">
        <a href="${resetLink}" class="btn-primary">Reset Password Now</a>
      </div>
      <p style="color:#666666;font-size:15px;line-height:1.7;margin-top:40px;">
        This link will expire in <strong style="color:#E32264;">1 hour</strong> for security reasons.<br><br>
        If you did not request this password reset, please disregard this email.
      </p>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "NIDRIP • Reset Your Password",
    html: getEmailTemplate(content, "Password Reset - NIDRIP"),
  });
};

/* ────────────────────────────────────────────────
   Support Ticket Emails
───────────────────────────────────────────────── */

const sendTicketConfirmationToUser = async (userEmail, userName, ticket) => {
  const shortTicketId = shortenId(ticket._id);

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Hello ${userName},</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Thank you for reaching out to NIDRIP Support. We have successfully received your ticket.
    </p>
    <div class="info-box">
      <strong>Ticket ID:</strong> ${shortTicketId}<br><br>
      <strong>Subject:</strong> ${ticket.subject}<br><br>
      <strong>Priority:</strong> <span style="color:#E32264;font-weight:700;">${ticket.priority}</span><br><br>
      <strong>Submitted on:</strong> ${formatDate(ticket.createdAt)}
    </div>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Our team will review your request shortly. You can track progress in <strong>My Tickets</strong>.
    </p>
    <p style="font-size:16px;color:#444444;">
      Best regards,<br><strong>NIDRIP Support Team</strong>
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Support: Ticket Received ${shortTicketId}`,
    html: getEmailTemplate(content, "Support Ticket Confirmation"),
  });
};

const sendNewTicketNotificationToAdmin = async (ticket) => {
  const adminEmail = process.env.EMAIL_USER || "support@nidrip.com";
  const shortTicketId = shortenId(ticket._id);

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">New Support Ticket</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      A new ticket has been submitted and requires attention.
    </p>
    <div class="info-box">
      <strong>Ticket ID:</strong> ${shortTicketId}<br><br>
      <strong>Customer:</strong> ${ticket.user.userName} (${ticket.user.email})<br><br>
      <strong>Subject:</strong> ${ticket.subject}<br><br>
      <strong>Priority:</strong> <span style="color:#E32264;font-weight:700;">${ticket.priority}</span><br><br>
      <strong>Submitted:</strong> ${formatDate(ticket.createdAt)}
    </div>
    <div style="text-align:center;margin:40px 0;">
      <a href="${process.env.FRONTEND_URL}/super-admin/tickets/${ticket._id}" class="btn-primary">
        View Ticket
      </a>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Ticket ${shortTicketId} - ${ticket.priority}`,
    html: getEmailTemplate(content, "New Support Ticket"),
  });
};

const sendTicketStatusUpdateEmail = async (
  userEmail,
  userName,
  ticketId,
  newStatus,
  subject,
) => {
  const shortTicketId = shortenId(ticketId);

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Ticket Status Updated</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:20px;">Hello ${userName},</p>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Your support ticket status has been updated to:
    </p>
    <div class="info-box">
      <strong>Ticket ID:</strong> ${shortTicketId}<br><br>
      <strong>Subject:</strong> ${subject}<br><br>
      <strong>New Status:</strong> <span style="color:#E32264;font-weight:700;font-size:20px;">${newStatus}</span><br><br>
      <strong>Updated:</strong> ${formatDate(new Date())}
    </div>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Check full details in <strong>My Tickets</strong>.
    </p>
    <p style="font-size:16px;color:#444444;">
      Best regards,<br><strong>NIDRIP Support Team</strong>
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Support: Ticket ${shortTicketId} → ${newStatus}`,
    html: getEmailTemplate(content, "Ticket Status Update"),
  });
};

/* ────────────────────────────────────────────────
   Order Emails – Now using $ (USD) instead of Rs.
───────────────────────────────────────────────── */

const sendOrderConfirmationToUser = async (order) => {
  const shortOrderId = shortenId(order._id);

  const itemsList = order.items
    .map(
      (item) => `
        <li class="items-list-li">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div><strong>${item.product.title}</strong> × ${item.quantity}</div>
            <div style="text-align:right;color:#666;">$${item.priceAtPurchase.toLocaleString()}</div>
          </div>
        </li>
      `,
    )
    .join("");

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Order Confirmed! 🎉</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:20px;">Hello ${order.user.userName},</p>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Thank you for your purchase! Your order is now being processed.
    </p>
    <div class="info-box">
      <strong>Order ID:</strong> ${shortOrderId}<br><br>
      <strong>Order Date:</strong> ${formatDate(order.createdAt)}<br><br>
      <strong>Payment Method:</strong> ${order.paymentMethod}<br><br>
      <strong>Shipping Address:</strong><br>
      <div style="margin-top:8px;">${order.shippingAddress.replace(/\n/g, "<br>")}</div>
    </div>
    <h3 style="margin:36px 0 16px;color:#E32264;font-size:22px;">Order Summary</h3>
    <ul class="items-list">${itemsList}</ul>
    <div class="total-box">
      <div><strong>Subtotal:</strong> $${(order.totalAmount - order.shippingCost).toLocaleString()}</div>
      <div><strong>Shipping:</strong> $${order.shippingCost.toLocaleString()}</div>
      <div style="margin-top:16px;"><strong>Total:</strong> $${order.totalAmount.toLocaleString()}</div>
    </div>
    <p style="font-size:16px;color:#444444;">
      We'll notify you when your order ships.<br><br>
      Thank you for shopping with NIDRIP!
    </p>
  `;

  await sendEmail({
    to: order.user.email,
    subject: `NIDRIP Order Confirmed ${shortOrderId}`,
    html: getEmailTemplate(content, "Order Confirmation"),
  });
};

const sendNewOrderNotificationToAdmin = async (order) => {
  const adminEmail = process.env.EMAIL_USER || "support@nidrip.com";
  const shortOrderId = shortenId(order._id);

  const itemsList = order.items
    .map(
      (item) => `
        <li class="items-list-li">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div><strong>${item.product.title}</strong> × ${item.quantity}</div>
          </div>
        </li>
      `,
    )
    .join("");

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">New Order Received</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      A new order has been placed and requires processing.
    </p>
    <div class="info-box">
      <strong>Order ID:</strong> ${shortOrderId}<br><br>
      <strong>Customer:</strong> ${order.user.userName} (${order.user.email})<br><br>
      <strong>Phone:</strong> ${order.user.phone || "Not provided"}<br><br>
      <strong>Payment Method:</strong> ${order.paymentMethod}<br><br>
      <strong>Order Date:</strong> ${formatDate(order.createdAt)}
    </div>
    <h3 style="margin:36px 0 16px;color:#E32264;font-size:22px;">Items</h3>
    <ul class="items-list">${itemsList}</ul>
    <div style="text-align:center;margin:40px 0;">
      <a href="${process.env.ADMIN_DASHBOARD_URL}/orders/${order._id}" class="btn-primary">
        View Order
      </a>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Order ${shortOrderId}`,
    html: getEmailTemplate(content, "New Order Notification"),
  });
};

const sendOrderCancellationToUser = async (order, reasonForCancel) => {
  const shortOrderId = shortenId(order._id);

  const itemsList = order.items
    .map(
      (item) => `
        <li style="margin:12px 0;">
          <strong>${item.product.title}</strong> × ${item.quantity}<br>
          <span style="color:#666;">Price: $${item.priceAtPurchase.toLocaleString()}</span>
        </li>
      `,
    )
    .join("");

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Order Cancelled</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:20px;">Hello ${order.user.userName},</p>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Your order has been cancelled successfully. No charges were applied (Cash on Delivery).
    </p>
    <div class="info-box">
      <strong>Order ID:</strong> ${shortOrderId}<br><br>
      <strong>Reason:</strong> ${reasonForCancel}<br><br>
      <strong>Cancelled:</strong> ${formatDate(new Date())}<br><br>
      <strong>Placed on:</strong> ${formatDate(order.createdAt)}
    </div>
    <h3 style="margin:32px 0 16px;color:#E32264;">Items Cancelled</h3>
    <ul style="padding-left:20px;">${itemsList}</ul>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Items have been returned to stock.
    </p>
    <p style="font-size:16px;color:#444444;">
      Contact support if you need assistance.<br><br>
      Thank you,<br><strong>NIDRIP Team</strong>
    </p>
  `;

  await sendEmail({
    to: order.user.email,
    subject: `NIDRIP Order Cancelled ${shortOrderId}`,
    html: getEmailTemplate(content, "Order Cancellation"),
  });
};

const sendOrderCancellationToAdmin = async (order, reasonForCancel) => {
  const adminEmail = process.env.EMAIL_USER || "support@nidrip.com";
  const shortOrderId = shortenId(order._id);

  const itemsList = order.items
    .map(
      (item) => `
        <li style="margin:12px 0;">
          <strong>${item.product.title}</strong> × ${item.quantity}<br>
          <span style="color:#666;">Price: $${item.priceAtPurchase.toLocaleString()}</span>
        </li>
      `,
    )
    .join("");

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Order Cancelled by Customer</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Customer has cancelled an order.
    </p>
    <div class="info-box">
      <strong>Order ID:</strong> ${shortOrderId}<br><br>
      <strong>Customer:</strong> ${order.user.userName} (${order.user.email})<br><br>
      <strong>Phone:</strong> ${order.user.phone || "Not provided"}<br><br>
      <strong>Reason:</strong> ${reasonForCancel}<br><br>
      <strong>Cancelled:</strong> ${formatDate(new Date())}
    </div>
    <h3 style="margin:32px 0 16px;color:#E32264;">Items</h3>
    <ul style="padding-left:20px;">${itemsList}</ul>
    <div style="text-align:center;margin:40px 0;">
      <a href="${process.env.ADMIN_DASHBOARD_URL}/orders/${order._id}" class="btn-primary">
        View Order
      </a>
    </div>
    <p style="font-size:16px;color:#666666;">
      Stock has been restored.
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `Order Cancelled ${shortOrderId}`,
    html: getEmailTemplate(content, "Order Cancellation Alert"),
  });
};

/**
 * Notify user when order status changes (e.g. SHIPPED, DELIVERED)
 * @param {string} userEmail
 * @param {string} userName
 * @param {string} orderId
 * @param {string} newStatus
 * @param {string} [subject="Your Order Status Update"]
 */
const sendOrderStatusUpdateEmail = async (
  userEmail,
  userName,
  orderId,
  newStatus,
  subject = "Your Order Status Update",
) => {
  const shortOrderId = shortenId(orderId);

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Order Status Updated</h2>
    <p style="font-size:17px;color:#444444;margin-bottom:20px;">Hello ${userName},</p>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Your order status has been updated to:
    </p>
    <div class="info-box">
      <strong>Order ID:</strong> ${shortOrderId}<br><br>
      <strong>New Status:</strong> <span style="color:#E32264;font-weight:700;font-size:20px;">${newStatus}</span><br><br>
      <strong>Updated on:</strong> ${formatDate(new Date())}
    </div>
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      You can view full details in <strong>My Orders</strong>.
    </p>
    <p style="font-size:16px;color:#444444;">
      Thank you for shopping with NIDRIP!<br><br>
      Best regards,<br><strong>NIDRIP Team</strong>
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Order ${shortOrderId} – ${newStatus}`,
    html: getEmailTemplate(content, "Order Status Update"),
  });
};

/**
 * Send 6-digit OTP for email verification
 * @async
 * @param {string} toEmail      - User's email address
 * @param {string} userName     - User's display name
 * @param {string} otp          - 6-digit plain OTP code
 * @returns {Promise<boolean>}  Success status
 */
const sendEmailVerificationOtp = async (toEmail, userName, otp) => {
  const content = `
    <div style="text-align:center;max-width:520px;margin:0 auto;">
      <h2 style="color:#1a1a1a;font-size:32px;margin-bottom:24px;font-weight:800;">
        Verify Your Email – NIDRIP
      </h2>
      <p style="color:#444444;line-height:1.8;margin-bottom:40px;font-size:17px;">
        Hello ${userName || "there"},<br><br>
        Thank you for joining NIDRIP! Use the verification code below to confirm your email address:
      </p>
      
      <div style="margin:40px 0; padding:24px; background:#f8f9fa; border-radius:12px; border:2px dashed #E32264;">
        <h1 style="font-size:48px; letter-spacing:12px; color:#E32264; margin:0; font-weight:900;">
          ${otp}
        </h1>
      </div>

      <p style="color:#666666;font-size:15px;line-height:1.7;margin:30px 0;">
        This code is valid for <strong style="color:#E32264;">10 minutes</strong>.<br>
        If you didn't request this verification, please ignore this email or contact support.
      </p>

      <p style="color:#444444;font-size:16px;margin-top:40px;">
        Best regards,<br>
        <strong>NIDRIP Team</strong>
      </p>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "NIDRIP – Verify Your Email Address",
    html: getEmailTemplate(content, "Email Verification - NIDRIP"),
  });
};

module.exports = {
  sendEmail,
  getEmailTemplate,
  sendPasswordResetEmail,
  sendTicketConfirmationToUser,
  sendNewTicketNotificationToAdmin,
  sendTicketStatusUpdateEmail,
  sendOrderConfirmationToUser,
  sendNewOrderNotificationToAdmin,
  sendOrderCancellationToUser,
  sendOrderCancellationToAdmin,
  sendOrderStatusUpdateEmail,
  sendEmailVerificationOtp,
};
