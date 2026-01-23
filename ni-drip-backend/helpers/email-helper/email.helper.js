/**
 * @file Email service utility for NIDRIP application
 * @module services/emailService
 * @description Comprehensive email service using Nodemailer with Gmail SMTP.
 * Supports sending generic emails, password reset emails with secure links, and HTML templates.
 * @version 1.0.0
 * @requires nodemailer
 */

const nodemailer = require("nodemailer");

// === Environment Validation ===
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error(
    "Missing required environment variables: EMAIL_USER and EMAIL_PASS",
  );
}

/**
 * Nodemailer transporter configured for Gmail SMTP
 * @type {import('nodemailer').Transporter}
 * @constant
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
 * Send email using configured transporter
 * @async
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of email
 * @returns {Promise<boolean>} True if sent successfully
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

    console.log(
      `Email sent successfully to ${to} | MessageId: ${info.messageId}`,
    );
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return false;
  }
};

/**
 * Generates a premium, professional NIDRIP-branded HTML email template
 * @param {string} content - HTML body content
 * @param {string} [title="NIDRIP Notification"] - Page title
 * @returns {string} Complete HTML email document
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
    body {
      margin: 0;
      padding: 0;
      background: #f4f4f9;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
    }
    a { color: #E32264; text-decoration: none; }
    .container {
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #E32264 0%, #A3268E 100%);
      padding: 48px 32px;
      text-align: center;
      position: relative;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #ffffff33, transparent);
    }
    .logo { width: 160px; height: auto; margin-bottom: 16px; }
    .brand-title {
      color: #ffffff;
      font-size: 36px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -1.2px;
    }
    .main-content {
      padding: 56px 48px;
      background: #ffffff;
      color: #2d2d2d;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #E32264 0%, #A3268E 100%);
      color: #ffffff !important;
      font-weight: 700;
      font-size: 17px;
      padding: 18px 44px;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 8px 25px rgba(227, 34, 100, 0.3);
      transition: all 0.3s ease;
    }
    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 35px rgba(227, 34, 100, 0.4);
    }
    .info-box {
      background: #f8f9fa;
      border-left: 5px solid #E32264;
      padding: 28px;
      border-radius: 12px;
      margin: 36px 0;
      font-size: 16px;
      line-height: 1.7;
    }
    .info-box strong {
      color: #1a1a1a;
      display: inline-block;
      min-width: 140px;
    }
    .items-list {
      list-style: none;
      padding: 0;
      margin: 24px 0;
    }
    .items-list li {
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }
    .items-list li:last-child {
      border-bottom: none;
    }
    .total-box {
      background: #f0f0f0;
      padding: 28px;
      border-radius: 12px;
      margin: 36px 0;
      text-align: right;
      font-size: 17px;
    }
    .total-box strong {
      font-size: 22px;
      color: #E32264;
    }
    .footer {
      background: #0f0f1a;
      padding: 48px 40px;
      text-align: center;
      color: #888888;
    }
    .footer-title {
      color: #E32264;
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 12px 0;
    }
    .footer-copy {
      font-size: 14px;
      margin: 16px 0;
    }
    .footer-note {
      font-size: 13px;
      color: #666666;
      line-height: 1.6;
      margin-top: 24px;
    }
    @media (max-width: 600px) {
      .main-content { padding: 40px 32px; }
      .header { padding: 40px 24px; }
      .info-box { padding: 20px; }
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <img 
              src="https://res.cloudinary.com/dd524q9vc/image/upload/v1769081264/NiDrip/logo/logo_ny2do0.png" 
              alt="NIDRIP" 
              class="logo"
            />
            <h1 class="brand-title">NIDRIP</h1>
          </div>

          <!-- Main Content -->
          <div class="main-content">
            ${content}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-title">NIDRIP</p>
            <p class="footer-copy">
              © ${new Date().getFullYear()} <strong style="color:#E32264;">NIDRIP</strong>. All rights reserved.
            </p>
            <p class="footer-note">
              This is an automated message from NIDRIP.<br>
              If you didn't initiate this action, please ignore this email or contact support.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Helper to shorten ID to last 6 characters with # prefix
 * @param {string} id - MongoDB ObjectId or string
 * @returns {string} e.g. #ABC123
 */
const shortenId = (id) => {
  if (!id) return "#------";
  const str = id.toString();
  return "#" + str.slice(-6);
};

/**
 * Format date as "23 January 2026" (date only, no time)
 */
const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

/**
 * Get frontend URL for a specific user role
 * @param {string} role - User role
 * @returns {string} Base frontend URL
 * @throws {Error} If role URL is not configured
 */
function getFrontendUrl(role) {
  switch (role) {
    case "SUPERADMIN":
      if (!process.env.FRONTEND_URL) {
        throw new Error("URL is not defined");
      }
      return process.env.FRONTEND_URL.replace(/\/+$/, "");
    default:
      throw new Error(`No frontend URL configured for role: ${role}`);
  }
}

/**
 * Send a password reset email with premium NIDRIP styling
 * @async
 * @param {string} toEmail - Recipient email
 * @param {string} resetToken - Reset token
 * @param {string} role - User role
 * @returns {Promise<boolean>} True if email sent successfully
 */
const sendPasswordResetEmail = async (toEmail, resetToken, role) => {
  const frontendUrl = getFrontendUrl(role);
  const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

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
        <a href="${resetLink}" class="btn-primary">
          Reset Password Now
        </a>
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

// ────────────────────────────────────────────────────────────────
//   Support Ticket Email Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Send confirmation email to the user who created the ticket
 */
const sendTicketConfirmationToUser = async (userEmail, userName, ticket) => {
  const shortTicketId = shortenId(ticket._id);

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Hello ${userName},</h2>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Thank you for reaching out to NIDRIP Support. We have successfully received your ticket and it is now in our system.
    </p>
    
    <div class="info-box">
      <strong>Ticket ID:</strong> ${shortTicketId}<br><br>
      <strong>Subject:</strong> ${ticket.subject}<br><br>
      <strong>Priority:</strong> <span style="color:#E32264;font-weight:700;">${ticket.priority}</span><br><br>
      <strong>Submitted on:</strong> ${formatDate(ticket.createdAt)}
    </div>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Our dedicated support team will review your request and respond as quickly as possible. 
      You can track the status of your ticket anytime in the <strong>My Tickets</strong> section of your account.
    </p>
    
    <p style="font-size:16px;color:#444444;">
      We appreciate your patience and are here to help.<br><br>
      Best regards,<br>
      <strong>NIDRIP Support Team</strong>
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Support: Ticket Received ${shortTicketId}`,
    html: getEmailTemplate(content, "Support Ticket Confirmation"),
  });
};

/**
 * Send notification to Super Admin when a new ticket is created
 */
const sendNewTicketNotificationToAdmin = async (ticket) => {
  const adminEmail = process.env.EMAIL_USER || "support@nidrip.com";
  const shortTicketId = shortenId(ticket._id);

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">New Support Ticket Received</h2>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      A customer has submitted a new support ticket that requires attention.
    </p>
    
    <div class="info-box">
      <strong>Ticket ID:</strong> ${shortTicketId}<br><br>
      <strong>Customer:</strong> ${ticket.user.userName} (${ticket.user.email})<br><br>
      <strong>Subject:</strong> ${ticket.subject}<br><br>
      <strong>Priority:</strong> <span style="color:#E32264;font-weight:700;">${ticket.priority}</span><br><br>
      <strong>Submitted on:</strong> ${formatDate(ticket.createdAt)}
    </div>
    
    <div style="text-align:center;margin:40px 0;">
      <a href="${process.env.FRONTEND_URL}/super-admin/tickets/${ticket._id}"
         class="btn-primary">
        View & Respond to Ticket
      </a>
    </div>
    
    <p style="font-size:16px;color:#666666;">
      Please review and respond to this ticket at your earliest convenience.
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Support Ticket ${shortTicketId} - ${ticket.priority} Priority`,
    html: getEmailTemplate(content, "New Support Ticket Notification"),
  });
};

/**
 * Send email notification to user when ticket status is updated
 */
const sendTicketStatusUpdateEmail = async (
  userEmail,
  userName,
  ticketId,
  newStatus,
  subject,
) => {
  const shortTicketId = shortenId(ticketId);

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Ticket Status Update</h2>
    
    <p style="font-size:17px;color:#444444;margin-bottom:20px;">
      Hello ${userName},
    </p>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      We have an update on your support ticket. The status has been changed to:
    </p>
    
    <div class="info-box">
      <strong>Ticket ID:</strong> ${shortTicketId}<br><br>
      <strong>Subject:</strong> ${subject}<br><br>
      <strong>New Status:</strong> <span style="color:#E32264;font-weight:700;font-size:20px;">${newStatus}</span><br><br>
      <strong>Updated on:</strong> ${formatDate(new Date())}
    </div>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      You can view the full conversation and latest updates in the <strong>My Tickets</strong> section of your account.
    </p>
    
    <p style="font-size:16px;color:#444444;">
      Thank you for your patience.<br><br>
      Best regards,<br>
      <strong>NIDRIP Support Team</strong>
    </p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Support: Ticket ${shortTicketId} Updated to ${newStatus}`,
    html: getEmailTemplate(content, "Ticket Status Update"),
  });
};

// ────────────────────────────────────────────────────────────────
//   Order Email Helpers
// ────────────────────────────────────────────────────────────────

/**
 * Send order confirmation email to the customer
 */
const sendOrderConfirmationToUser = async (order) => {
  const shortOrderId = shortenId(order._id);

  const itemsList = order.items
    .map(
      (item) => `
        <li class="items-list-li">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <strong>${item.product.title}</strong> × ${item.quantity}
            </div>
            <div style="text-align:right;color:#666;">
              Rs. ${item.priceAtPurchase.toLocaleString()}
            </div>
          </div>
        </li>
      `,
    )
    .join("");

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">Order Confirmed! 🎉</h2>
    
    <p style="font-size:17px;color:#444444;margin-bottom:20px;">
      Hello ${order.user.userName},
    </p>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      Thank you for your purchase! Your order has been successfully placed and is now being processed.
      We will keep you updated on its progress.
    </p>
    
    <div class="info-box">
      <strong>Order ID:</strong> ${shortOrderId}<br><br>
      <strong>Order Date:</strong> ${formatDate(order.createdAt)}<br><br>
      <strong>Payment Method:</strong> Cash on Delivery<br><br>
      <strong>Shipping Address:</strong><br>
      <div style="margin-top:8px;">${order.shippingAddress.replace(/\n/g, "<br>")}</div>
    </div>
    
    <h3 style="margin:36px 0 16px;color:#E32264;font-size:22px;">Order Summary</h3>
    <ul class="items-list">
      ${itemsList}
    </ul>
    
    <div class="total-box">
      <div><strong>Subtotal:</strong> Rs. ${(order.totalAmount - order.shippingCost).toLocaleString()}</div>
      <div><strong>Shipping:</strong> Rs. ${order.shippingCost.toLocaleString()}</div>
      <div style="margin-top:16px;"><strong>Total Amount:</strong> Rs. ${order.totalAmount.toLocaleString()}</div>
    </div>
    
    <p style="font-size:16px;color:#444444;">
      We will notify you when your order is shipped and provide tracking information.<br><br>
      Thank you for choosing NIDRIP!<br><br>
      <strong>NIDRIP Team</strong>
    </p>
  `;

  await sendEmail({
    to: order.user.email,
    subject: `NIDRIP Order Confirmed ${shortOrderId}`,
    html: getEmailTemplate(content, "Order Confirmation"),
  });
};

/**
 * Send new order notification to Admin (no amount in subject or visible total)
 */
const sendNewOrderNotificationToAdmin = async (order) => {
  const adminEmail = process.env.EMAIL_USER || "support@nidrip.com";
  const shortOrderId = shortenId(order._id);

  const itemsList = order.items
    .map(
      (item) => `
        <li class="items-list-li">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <strong>${item.product.title}</strong> × ${item.quantity}
            </div>
          </div>
        </li>
      `,
    )
    .join("");

  const content = `
    <h2 style="color:#E32264;font-size:30px;margin-bottom:20px;">New Order Received</h2>
    
    <p style="font-size:17px;color:#444444;margin-bottom:32px;">
      A new order has been placed and is awaiting processing.
    </p>
    
    <div class="info-box">
      <strong>Order ID:</strong> ${shortOrderId}<br><br>
      <strong>Customer:</strong> ${order.user.userName} (${order.user.email})<br><br>
      <strong>Phone:</strong> ${order.user.phone || "Not provided"}<br><br>
      <strong>Payment Method:</strong> Cash on Delivery<br><br>
      <strong>Order Date:</strong> ${formatDate(order.createdAt)}
    </div>
    
    <h3 style="margin:36px 0 16px;color:#E32264;font-size:22px;">Items Ordered</h3>
    <ul class="items-list">
      ${itemsList}
    </ul>
    
    <div style="text-align:center;margin:40px 0;">
      <a href="${process.env.ADMIN_DASHBOARD_URL}/orders/${order._id}"
         class="btn-primary">
        View Order Details
      </a>
    </div>
    
    <p style="font-size:16px;color:#666666;">
      Please review and process this order promptly in the admin panel.
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Order Received ${shortOrderId}`,
    html: getEmailTemplate(content, "New Order Alert"),
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
};
