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
      from: "NIDRIP",
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
 * Generates a premium, NIDRIP-branded HTML email template
 * @param {string} content - HTML body content
 * @param {string} [title=""] - Page title
 * @returns {string} Complete HTML email document
 */
const getEmailTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    .btn-primary { 
      background: linear-gradient(135deg, #E32264 0%, #A3268E 100%);
      color: #000000 !important;
      font-weight: 700;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      display: inline-block;
      font-size: 17px;
      box-shadow: 0 8px 25px rgba(233, 33, 91, 1);
      transition: all 0.3s ease;
    }
    .btn-primary:hover { 
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(30, 54, 231, 1);
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Inter',Arial,sans-serif;background:#171725;color:#FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#171725;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" style="max-width:640px;background:#FFFFFF;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header with Gold Accent -->
          <tr>
            <td style="background:#000000;padding:40px 30px;text-align:center;position:relative;">
              <div style="position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg, #E32264, #A3268E);"></div>
              <img 
                src="https://res.cloudinary.com/dd524q9vc/image/upload/v1763400321/Oloha/logo/logo_xazy6j.png" 
                alt="NIDRIP" 
                style="width:140px;height:auto;margin-bottom:16px;" 
              />
              <h1 style="color:#E32264;font-size:32px;font-weight:800;margin:0;letter-spacing:-1px;">NIDRIP</h1>              
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:48px 40px;background:#FFFFFF;color:#171725;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#171725;padding:40px 40px;text-align:center;">
              <p style="margin:0 0 12px 0;color:#E32264;font-size:18px;font-weight:600;">
                NIDRIP
              </p>
              <p style="margin:0;color:#888888;font-size:14px;line-height:1.7;">
                &copy; ${new Date().getFullYear()} <strong style="color:#E32264;">NIDRIP</strong>. All rights reserved.
              </p>
              <p style="margin:20px 0 0;color:#666666;font-size:13px;line-height:1.6;">
                This is an automated message from NIDRIP.<br>
                If you didn't initiate this action, please ignore this email.
              </p>             
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
      <h2 style="color:#000000;font-size:30px;margin-bottom:20px;font-weight:800;letter-spacing:-0.8px;line-height:1.2;">
        Reset Your Password
      </h2>
      <p style="color:#444444;line-height:1.8;margin-bottom:36px;font-size:17px;">
        We received a request to reset your NIDRIP account password. 
        Click the button below to create a new one.
      </p>
      
      <div style="margin:45px 0;">
        <a href="${resetLink}" class="btn-primary">
          Reset Password Now
        </a>
      </div>

      <p style="color:#666666;font-size:15px;line-height:1.7;margin-top:40px;">
        This link will expire in <strong style="color:#E32264;">1 hour</strong> for security.<br><br>
        If you didn't request this, please ignore this email.
      </p>
      ${resetToken}
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "NIDRIP • Reset Your Password",
    html: getEmailTemplate(content, "Password Reset - NIDRIP"),
  });
};

// ────────────────────────────────────────────────────────────────
//   Email Helpers (can be moved to a separate file later)
// ────────────────────────────────────────────────────────────────

/**
 * Send confirmation email to the user who created the ticket
 */
const sendTicketConfirmationToUser = async (userEmail, userName, ticket) => {
  const content = `
    <h2 style="color:#E32264;">Hello ${userName},</h2>
    <p>Thank you for reaching out to NIDRIP Support.</p>
    <p>Your ticket has been received successfully.</p>
    
    <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin:20px 0;">
      <strong>Ticket ID:</strong> ${ticket._id}<br>
      <strong>Subject:</strong> ${ticket.subject}<br>
      <strong>Priority:</strong> ${ticket.priority}<br>
      <strong>Submitted on:</strong> ${new Date(ticket.createdAt).toLocaleString()}
    </div>
    
    <p>Our team will review your request as soon as possible and get back to you.</p>
    <p style="color:#666; font-size:14px;">
      You can check the status anytime in your <strong>My Tickets</strong> section.
    </p>
    
    <p style="margin-top:30px;">Thank you,<br>
      <strong>NIDRIP Support Team</strong></p>
  `;

  await sendEmail({
    to: userEmail,
    subject: `NIDRIP Support: Ticket Received [#${ticket._id}]`,
    html: getEmailTemplate(content, "Support Ticket Confirmation"),
  });
};

/**
 * Send notification to Super Admin when a new ticket is created
 */
const sendNewTicketNotificationToAdmin = async (ticket) => {
  const adminEmail = process.env.EMAIL_USER || "Null";

  const content = `
    <h2 style="color:#E32264;">New Support Ticket Created</h2>
    
    <p>A user has submitted a new support request.</p>
    
    <div style="background:#f8f9fa; padding:20px; border-radius:8px; margin:20px 0;">
      <strong>Ticket ID:</strong> ${ticket._id}<br>
      <strong>User:</strong> ${ticket.user.userName} (${ticket.user.email})<br>
      <strong>Subject:</strong> ${ticket.subject}<br>
      <strong>Priority:</strong> ${ticket.priority}<br>
      <strong>Submitted:</strong> ${new Date(ticket.createdAt).toLocaleString()}
    </div>
    
    <p style="margin:20px 0;">
      <a href="${process.env.FRONTEND_URL}/super-admin/tickets/${ticket._id}"
         class="btn-primary" style="color:#000 !important;">
        View & Respond to Ticket
      </a>
    </p>
    
    <p style="color:#666; font-size:14px;">
      Please review this ticket at your earliest convenience.
    </p>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Support Ticket [#${ticket._id}] - ${ticket.priority} Priority`,
    html: getEmailTemplate(content, "New Support Ticket Notification"),
  });
};

module.exports = {
  sendEmail,
  getEmailTemplate,
  sendPasswordResetEmail,
  sendTicketConfirmationToUser,
  sendNewTicketNotificationToAdmin,
};
