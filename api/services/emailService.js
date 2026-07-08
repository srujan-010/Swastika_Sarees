import { Resend } from 'resend';
import dotenv from 'dotenv';
import { User } from '../db/models.js';

dotenv.config();


const apiKey = process.env.RESEND_API_KEY || 're_em2kEbZW_4Ar7jESGUHZqKbea6kPU4c4L';
const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const adminEmail = process.env.ADMIN_EMAIL || 'sareesswastika@gmail.com';
const appUrl = process.env.APP_URL || 'http://localhost:3005';
const companyName = process.env.COMPANY_NAME || 'Swastika Sarees';

// ─── TEST MODE CONFIGURATION ────────────────────────────────────────────────
// When TEST_MODE=true ALL emails are redirected to TEST_EMAIL_OVERRIDE.
// This prevents accidental real-customer emails during development.
// Set TEST_MODE=false and configure a verified Resend domain for production.
const TEST_MODE = process.env.TEST_MODE !== 'false'; // defaults to true
const TEST_EMAIL_OVERRIDE = process.env.TEST_EMAIL_OVERRIDE || adminEmail;

if (TEST_MODE) {
  console.log(`[Email Service] ⚠️  TEST MODE ENABLED — All emails redirected to: ${TEST_EMAIL_OVERRIDE}`);
} else {
  console.log(`[Email Service] ✅ PRODUCTION MODE — Emails will be sent to real recipients.`);
}
// ─────────────────────────────────────────────────────────────────────────────

const resend = new Resend(apiKey);

// Helper to inject a test mode banner at the top of the email body
function getTestBanner(originalRecipient) {
  if (!TEST_MODE) return '';
  return `
    <div style="background: #fef9c3; border: 2px dashed #d97706; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #92400e;">
      <strong>⚠️ TEST MODE EMAIL</strong><br>
      This email was redirected from: <strong>${originalRecipient}</strong><br>
      In production, it would be sent to the actual customer/admin.<br>
      Set <code>TEST_MODE=false</code> in <code>.env</code> to send real emails.
    </div>
  `;
}

// Helper to wrap all HTML templates in standard Vogue brand layout
function getLayout(contentHtml, title) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcf9f5; color: #2d2323; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e8dfd5; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03); }
          .header { background-color: #8b1a1a; padding: 28px; text-align: center; border-bottom: 3px solid #D4AF37; }
          .logo { font-size: 26px; font-weight: bold; color: #fcf9f5; text-transform: uppercase; letter-spacing: 0.12em; margin: 0; }
          .tagline { font-size: 11px; color: #e8d5c4; letter-spacing: 0.05em; margin: 4px 0 0 0; font-style: italic; }
          .body { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
          .button { display: inline-block; background-color: #8b1a1a; color: #fcf9f5 !important; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 18px 0; border: 1px solid #D4AF37; text-align: center; }
          .footer { background-color: #fffaf5; padding: 24px; text-align: center; font-size: 11px; color: #887878; border-top: 1px solid #f0e6da; }
          .footer a { color: #8b1a1a; text-decoration: none; font-weight: bold; }
          .divider { height: 1px; bg-color: #f0e6da; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">${companyName}</h1>
            <p class="tagline">Premium Ethnic Luxury Wear</p>
          </div>
          <div class="body">
            ${contentHtml}
          </div>
          <div class="footer">
            <p>Thank you for choosing Swastika Sarees!</p>
            <p>Secunderabad, Telangana | GSTIN: 36AAAAA0000A1Z5</p>
            <p>For support, consult via WhatsApp at <a href="https://wa.me/919999999999">919999999999</a> or email support@swastikasarees.com</p>
            <div style="margin-top: 12px; font-size: 10px;">
              <a href="${appUrl}">Website</a> | <a href="https://instagram.com/swastikasarees_">Instagram</a> | <a href="${appUrl}/account">My Account</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// In-memory email queue with 150ms stagger to respect Resend's 10 req/s limit
const emailQueue = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (emailQueue.length > 0) {
    const job = emailQueue.shift();
    try {
      const response = await resend.emails.send({
        from: job.from,
        to: job.to,
        subject: job.subject,
        html: job.html,
        text: job.text
      });

      if (response.error) {
        throw new Error(response.error.message || 'Resend API returned error');
      }
      console.log(`[Email Log]${TEST_MODE ? ' [TEST→' + job.originalRecipient + ']' : ''} Type: ${job.type} | Recipient: ${job.to.join(', ')} | Status: success | ID: ${response.data?.id} | TS: ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[Email Log]${TEST_MODE ? ' [TEST→' + job.originalRecipient + ']' : ''} Type: ${job.type} | Recipient: ${job.to.join(', ')} | Status: failed | Error: ${err.message} | TS: ${new Date().toISOString()}`);
    }

    // 150ms pause between sends (= ~6 emails/sec, stays under 10 req/s limit)
    if (emailQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  isProcessingQueue = false;
}

// Master Asynchronous Send Trigger (Does not block Express responses)
function sendAsync({ to, subject, html, text, type }) {
  const originalRecipient = Array.isArray(to) ? to.join(', ') : to;

  // In TEST_MODE: override recipient & inject test banner into the HTML body
  const finalTo = TEST_MODE
    ? [TEST_EMAIL_OVERRIDE]
    : (Array.isArray(to) ? to : [to]);

  const finalSubject = TEST_MODE
    ? `[TEST] ${companyName} | ${subject}`
    : `${companyName} | ${subject}`;

  // Inject test banner right after <div class="body">
  const finalHtml = TEST_MODE
    ? html.replace('<div class="body">', `<div class="body">${getTestBanner(originalRecipient)}`)
    : html;

  emailQueue.push({
    from: fromEmail,
    to: finalTo,
    subject: finalSubject,
    html: finalHtml,
    text: text || finalHtml.replace(/<[^>]*>/g, ''),
    type,
    originalRecipient
  });

  // Kick off the queue processing in the background (non-blocking)
  setImmediate(() => processQueue());
}


// ----------------------------------------------------------------------
// CUSTOMER TRANSACTIONAL EMAIL TEMPLATES
// ----------------------------------------------------------------------

export function sendWelcomeEmail(user) {
  const name = user.fullName || 'Customer';
  const html = getLayout(`
    <h2>Welcome to ${companyName}, ${name}!</h2>
    <p>We are delighted to welcome you to our family. Swastika Sarees brings you curated handpicked Banarasi silks, floral print georgettes, cotton Kurtis, and dress materials crafted by master artisans.</p>
    <p>Explore our premium collections tailored to celebrate every festive spark, wedding elegance, and daily charm.</p>
    <div style="text-align: center;">
      <a href="${appUrl}/shop" class="button">Start Shopping Now</a>
    </div>
    <p>For custom consultations, customized sizing, and video showings, consult directly with our boutique styling team on WhatsApp!</p>
  `, 'Welcome to Swastika Sarees');

  sendAsync({
    to: user.email,
    subject: 'Welcome to Swastika Sarees!',
    html,
    type: 'welcome'
  });
}

export async function sendOrderConfirmationEmail(order) {
  const name = order.shippingAddress.name || 'Customer';
  const deliveryEstimation = new Date();
  deliveryEstimation.setDate(deliveryEstimation.getDate() + 4);
  const formattedDate = deliveryEstimation.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const itemsRows = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #f0e6da;">
        <strong>${item.name}</strong><br>
        <span style="font-size: 11px; color: #887878;">Color: ${item.color || 'N/A'}, Size: ${item.size || 'N/A'}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #f0e6da; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f0e6da; text-align: right;">₹${(item.price / 100).toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #f0e6da; text-align: right;">₹${((item.price * item.quantity) / 100).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = getLayout(`
    <h2>Thank you for your purchase!</h2>
    <p>Your order <strong>${order.orderId}</strong> has been successfully placed. Here are your order details:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
      <thead>
        <tr style="background-color: #fff8f0; color: #8b1a1a; text-align: left;">
          <th style="padding: 10px; border-bottom: 2px solid #e8dfd5;">Item Description</th>
          <th style="padding: 10px; border-bottom: 2px solid #e8dfd5; text-align: center;">Qty</th>
          <th style="padding: 10px; border-bottom: 2px solid #e8dfd5; text-align: right;">Unit Price</th>
          <th style="padding: 10px; border-bottom: 2px solid #e8dfd5; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div style="float: right; width: 260px; margin-top: 15px; font-size: 12px;">
      <div style="display: flex; justify-content: space-between; padding: 4px 0;">
        <span>Subtotal:</span>
        <span>₹${(order.pricing.subtotal / 100).toFixed(2)}</span>
      </div>
      ${order.pricing.couponDiscount > 0 ? `
      <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #15803d;">
        <span>Coupon Discount:</span>
        <span>-₹${(order.pricing.couponDiscount / 100).toFixed(2)}</span>
      </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; padding: 4px 0;">
        <span>Shipping:</span>
        <span>${order.pricing.shippingCharge > 0 ? `₹${(order.pricing.shippingCharge / 100).toFixed(2)}` : 'FREE'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 2px solid #8b1a1a; font-weight: bold; color: #8b1a1a; font-size: 14px; margin-top: 6px;">
        <span>Grand Total:</span>
        <span>₹${(order.pricing.total / 100).toFixed(2)}</span>
      </div>
    </div>
    
    <div style="clear: both; margin-top: 30px; font-size: 13px;">
      <h3 style="color: #8b1a1a; margin-bottom: 5px;">Shipping Address</h3>
      <div><strong>${order.shippingAddress.name}</strong></div>
      <div>${order.shippingAddress.line1}</div>
      ${order.shippingAddress.line2 ? `<div>${order.shippingAddress.line2}</div>` : ''}
      <div>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</div>
      <div>Phone: ${order.shippingAddress.phone}</div>
      
      <p style="margin-top: 20px;"><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()} (${order.payment.status.toUpperCase()})</p>
      <p><strong>Expected Delivery:</strong> On or before ${formattedDate}</p>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <a href="${appUrl}/account?tab=orders" class="button">Track Order Status</a>
    </div>
  `, 'Order Confirmation');

  let customerEmail = order.shippingAddress?.email;
  if (!customerEmail && order.user !== 'guest') {
    try {
      const userDoc = await User.findOne({ id: order.user });
      if (userDoc) customerEmail = userDoc.email;
    } catch(e) {}
  }
  
  if (customerEmail) {
    sendAsync({
      to: customerEmail,
      subject: `Order Confirmation - ${order.orderId}`,
      html,
      type: 'order_confirmation'
    });
  } else {
    // If order was submitted by logged-in user, fetch email from MongoDB
    User.findOne({ id: order.user }).then(u => {
      if (u && u.email) {
        sendAsync({
          to: u.email,
          subject: `Order Confirmation - ${order.orderId}`,
          html,
          type: 'order_confirmation'
        });
      }
    }).catch(() => {});
  }
}

export async function sendPaymentSuccessfulEmail(order) {
  const html = getLayout(`
    <h2>Payment Captured Successfully</h2>
    <p>We have successfully verified your payment for order <strong>${order.orderId}</strong>.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #D4AF37; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Transaction ID:</strong> ${order.payment.transactionId}</div>
      <div><strong>Amount Verified:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
      <div><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}</div>
      <div><strong>Payment Status:</strong> PAID</div>
    </div>
    <div style="text-align: center;">
      <a href="${appUrl}/api/orders/${order.orderId}/invoice" class="button">Download Invoice Receipt</a>
    </div>
  `, 'Payment Successful');

  const resolveRecipientAndSend = (to) => {
    sendAsync({
      to,
      subject: `Payment Successful - ${order.orderId}`,
      html,
      type: 'payment_successful'
    });
  };

  const directEmail = order.shippingAddress?.email;
  if (directEmail) {
    resolveRecipientAndSend(directEmail);
  } else {
    User.findOne({ id: order.user }).then(u => {
      if (u && u.email) resolveRecipientAndSend(u.email);
    }).catch(() => {});
  }
}

export function sendOrderStatusEmail(order, status) {
  let statusTitle = '';
  let statusDesc = '';
  let ctaText = 'View Order Details';
  let ctaLink = `${appUrl}/account?tab=orders`;

  const cleanStatus = (status || '').toLowerCase();

  if (cleanStatus === 'confirmed') {
    statusTitle = 'Your Order Has Been Confirmed!';
    statusDesc = 'Our boutique has verified your order. Items are queued for packaging and tailor check.';
  } else if (cleanStatus === 'processing') {
    statusTitle = 'Your Order is Now Processing';
    statusDesc = 'We are curating and preparing your ethnic wear designs. Each saree is individually checked for stitching details.';
  } else if (cleanStatus === 'packed') {
    statusTitle = 'Order Packed and Sealed';
    statusDesc = 'Your items have been safely packed in our boutique boxes and are ready to be dispatched.';
  } else if (cleanStatus === 'shipped') {
    const courier = order.tracking?.courierName || 'Delhivery';
    const trackingNo = order.tracking?.trackingNumber || 'N/A';
    statusTitle = 'Order Dispatched & Shipped!';
    statusDesc = `Your Swastika Sarees parcel has been handed over to courier partner: <strong>${courier}</strong>. Tracking Number: <strong>${trackingNo}</strong>.`;
    ctaText = 'Track Shipment Link';
    ctaLink = order.tracking?.trackingUrl || `https://www.delhivery.com/track/package/${trackingNo}`;
  } else if (cleanStatus === 'out_for_delivery' || cleanStatus === 'out for delivery') {
    statusTitle = 'Order Out For Delivery';
    statusDesc = 'Our delivery courier partner is in your area and will contact you shortly to deliver your premium box.';
  } else if (cleanStatus === 'delivered') {
    statusTitle = 'Order Delivered! Enjoy Your Sparkle';
    statusDesc = 'Your Swastika Sarees box was successfully delivered. We hope you love the handcrafted designs!';
    ctaText = 'Rate & Review Products';
    ctaLink = `${appUrl}/account?tab=reviews`;
  } else {
    // General fallback
    statusTitle = `Order Status: ${status.toUpperCase()}`;
    statusDesc = `Your Swastika Sarees order status was updated to ${status}.`;
  }

  const html = getLayout(`
    <h2>${statusTitle}</h2>
    <p>Dear ${order.shippingAddress.name},</p>
    <p>${statusDesc}</p>
    <div style="background-color: #fff8f0; border: 1px dashed #e8dfd5; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Order ID:</strong> ${order.orderId}</div>
      <div><strong>Current Status:</strong> <span style="color: #8b1a1a; font-weight: bold; text-transform: uppercase;">${cleanStatus}</span></div>
      ${order.tracking?.trackingNumber ? `<div><strong>Tracking Number:</strong> ${order.tracking.trackingNumber}</div>` : ''}
    </div>
    <div style="text-align: center;">
      <a href="${ctaLink}" class="button">${ctaText}</a>
    </div>
  `, `Order Status Update: ${cleanStatus}`);

  const recipient = order.shippingAddress?.email;
  if (recipient) {
    sendAsync({
      to: recipient,
      subject: `Order Update - ${order.orderId} [${cleanStatus.toUpperCase()}]`,
      html,
      type: `status_${cleanStatus}`
    });
  } else {
    User.findOne({ id: order.user }).then(u => {
      if (u && u.email) {
        sendAsync({
          to: u.email,
          subject: `Order Update - ${order.orderId} [${cleanStatus.toUpperCase()}]`,
          html,
          type: `status_${cleanStatus}`
        });
      }
    }).catch(() => {});
  }
}

export function sendOrderCancelledEmail(order, reason = 'Cancelled by customer') {
  const html = getLayout(`
    <h2>Order Cancelled</h2>
    <p>Your order <strong>${order.orderId}</strong> has been cancelled.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #8b1a1a; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Cancellation Reason:</strong> ${reason}</div>
      <div><strong>Refund Status:</strong> ${order.payment.status === 'paid' ? 'Refund Initiated' : 'No Payment Deducted'}</div>
      <div><strong>Amount:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
    </div>
    <p>If payment was already completed, the refund will be credited back to your original source of payment or wallet within 2-3 business days.</p>
  `, 'Order Cancelled');

  const directEmail = order.shippingAddress?.email;
  if (directEmail) {
    sendAsync({ to: directEmail, subject: `Order Cancelled - ${order.orderId}`, html, type: 'order_cancelled' });
  } else {
    User.findOne({ id: order.user }).then(u => {
      if (u && u.email) sendAsync({ to: u.email, subject: `Order Cancelled - ${order.orderId}`, html, type: 'order_cancelled' });
    }).catch(() => {});
  }
}

export function sendRefundInitiatedEmail(order) {
  const html = getLayout(`
    <h2>Refund Initiated</h2>
    <p>A refund has been initiated for your order <strong>${order.orderId}</strong>.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #D4AF37; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Refunded Amount:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
      <div><strong>Transaction Reference:</strong> ${order.payment.transactionId || 'N/A'}</div>
      <div><strong>Estimated Credits:</strong> 2-3 Business Days</div>
    </div>
    <p>Your refund is being processed and will be credited to your original payment source or boutique wallet shortly.</p>
  `, 'Refund Initiated');

  const directEmail = order.shippingAddress?.email;
  if (directEmail) {
    sendAsync({ to: directEmail, subject: `Refund Processed - ${order.orderId}`, html, type: 'refund_initiated' });
  } else {
    User.findOne({ id: order.user }).then(u => {
      if (u && u.email) sendAsync({ to: u.email, subject: `Refund Processed - ${order.orderId}`, html, type: 'refund_initiated' });
    }).catch(() => {});
  }
}

export function sendRefundCompletedEmail(order) {
  const html = getLayout(`
    <h2>Refund Completed Successfully</h2>
    <p>The refund for your order <strong>${order.orderId}</strong> has been successfully credited.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #15803d; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Refunded Amount:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
      <div><strong>Status:</strong> COMPLETED & CREDITED</div>
    </div>
    <p>Please check your wallet details or bank statement for validation.</p>
  `, 'Refund Completed');

  const directEmail = order.shippingAddress?.email;
  if (directEmail) {
    sendAsync({ to: directEmail, subject: `Refund Completed - ${order.orderId}`, html, type: 'refund_completed' });
  } else {
    User.findOne({ id: order.user }).then(u => {
      if (u && u.email) sendAsync({ to: u.email, subject: `Refund Completed - ${order.orderId}`, html, type: 'refund_completed' });
    }).catch(() => {});
  }
}

export function sendPasswordResetEmail(email, resetLink) {
  const html = getLayout(`
    <h2>Forgot Password Request</h2>
    <p>A password reset request was initiated for your account. Click the button below to update your password:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${resetLink}" class="button">Reset My Password</a>
    </div>
    <p style="font-size: 11px; color: #887878;">If you did not make this request, you can safely ignore this email. The link will expire shortly.</p>
  `, 'Password Reset Request');

  sendAsync({
    to: email,
    subject: 'Password Reset Instructions',
    html,
    type: 'password_reset'
  });
}

export function sendEmailVerificationEmail(email, verifyLink) {
  const html = getLayout(`
    <h2>Verify Your Email</h2>
    <p>Thank you for signing up at Swastika Sarees. Click the button below to confirm your email address and activate your profile account:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${verifyLink}" class="button">Verify Email Address</a>
    </div>
  `, 'Email Verification');

  sendAsync({
    to: email,
    subject: 'Activate Your Account',
    html,
    type: 'email_verification'
  });
}

export function sendOtpEmail(email, otpCode) {
  const html = getLayout(`
    <h2>Verification Code</h2>
    <p>Please enter the following verification One-Time Password (OTP) to complete your transaction or login request:</p>
    <div style="text-align: center; background-color: #fff8f0; border: 1px dashed #D4AF37; padding: 20px; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.25em; color: #8b1a1a; font-family: monospace;">${otpCode}</span>
    </div>
    <p style="font-size: 11px; color: #887878;">This code is valid for 10 minutes. Do not share this OTP with anyone.</p>
  `, 'Your Verification Code');

  sendAsync({
    to: email,
    subject: `Your OTP Code: ${otpCode}`,
    html,
    type: 'otp_email'
  });
}

// ----------------------------------------------------------------------
// ADMIN NOTIFICATION TEMPLATES
// ----------------------------------------------------------------------

export function sendAdminNewOrder(order) {
  const html = getLayout(`
    <h2 style="color: #b91c1c;">New Storefront Order Received!</h2>
    <p>Order <strong>${order.orderId}</strong> was placed by customer.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #8b1a1a; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Customer Name:</strong> ${order.shippingAddress.name}</div>
      <div><strong>Contact Number:</strong> ${order.shippingAddress.phone}</div>
      <div><strong>Grand Total:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
      <div><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}</div>
    </div>
    <div style="text-align: center;">
      <a href="${appUrl}/admin" class="button">Open Admin Dashboard</a>
    </div>
  `, 'New Storefront Order');

  sendAsync({ to: adminEmail, subject: `ALERT: New Order ${order.orderId}`, html, type: 'admin_new_order' });
}

export function sendAdminNewCustomer(user) {
  const html = getLayout(`
    <h2 style="color: #b91c1c;">New Customer Signed Up!</h2>
    <p>A new customer has created an account on the storefront.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #8b1a1a; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Customer Name:</strong> ${user.fullName || 'Valued User'}</div>
      <div><strong>Email:</strong> ${user.email}</div>
      <div><strong>Phone:</strong> ${user.phone || 'N/A'}</div>
      <div><strong>Registered At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
    </div>
  `, 'New Customer Registered');

  sendAsync({ to: adminEmail, subject: `ALERT: New Customer - ${user.email}`, html, type: 'admin_new_customer' });
}

export function sendAdminLargeOrder(order) {
  const html = getLayout(`
    <h2 style="color: #b91c1c;">⚠️ ATTENTION REQUIRED: Large Order Received</h2>
    <p>Order <strong>${order.orderId}</strong> contains a high transaction value exceeding ₹20,000.</p>
    <div style="background-color: #fff8f0; border: 2px solid #b91c1c; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Customer Name:</strong> ${order.shippingAddress.name}</div>
      <div><strong>Order Total Value:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
      <div><strong>Address:</strong> ${order.shippingAddress.line1}, ${order.shippingAddress.city}</div>
      <div><strong>Phone:</strong> ${order.shippingAddress.phone}</div>
    </div>
    <p>We recommend verifying shipping coordinates or consulting directly via WhatsApp call before shipping high-value Banarasi silk orders.</p>
  `, 'Large Order Received');

  sendAsync({ to: adminEmail, subject: `URGENT: High Value Order ${order.orderId}`, html, type: 'admin_large_order' });
}

export function sendAdminPaymentFailure(order, errDetails) {
  const html = getLayout(`
    <h2 style="color: #b91c1c;">⚠️ ALERT: Order Payment Attempt Failed</h2>
    <p>An attempt to pay for order <strong>${order.orderId}</strong> failed signature checkout validation.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #b91c1c; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Customer:</strong> ${order.shippingAddress.name}</div>
      <div><strong>Payment Error Details:</strong> ${errDetails || 'Signature mismatch or user abort'}</div>
      <div><strong>Deducted Attempt:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
    </div>
  `, 'Payment Failed Alert');

  sendAsync({ to: adminEmail, subject: `ALERT: Payment Failure - ${order.orderId}`, html, type: 'admin_payment_failure' });
}

export function sendAdminRefundRequest(order, refundDetails = 'Return requested') {
  const html = getLayout(`
    <h2 style="color: #b91c1c;">⚠️ Refund Request Received</h2>
    <p>Customer has requested a return/refund for order <strong>${order.orderId}</strong>.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #8b1a1a; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Customer Name:</strong> ${order.shippingAddress.name}</div>
      <div><strong>Order Value:</strong> ₹${(order.pricing.total / 100).toFixed(2)}</div>
      <div><strong>Return notes:</strong> ${refundDetails}</div>
    </div>
  `, 'Refund Request Received');

  sendAsync({ to: adminEmail, subject: `ALERT: Return Request - ${order.orderId}`, html, type: 'admin_refund_request' });
}

export function sendAdminLowStock(product, variantInfo = 'Main product') {
  const html = getLayout(`
    <h2 style="color: #b91c1c;">⚠️ Stock Alert: Low Inventory</h2>
    <p>Product stock levels have fallen below thresholds.</p>
    <div style="background-color: #fff8f0; border-left: 4px solid #8b1a1a; padding: 16px; margin: 20px 0; font-size: 13px;">
      <div><strong>Product Name:</strong> ${product.name}</div>
      <div><strong>Variant/Size Info:</strong> ${variantInfo}</div>
      <div><strong>Stock Remaining:</strong> ${product.stock}</div>
    </div>
  `, 'Low Stock Alert');

  sendAsync({ to: adminEmail, subject: `ALERT: Low Stock - ${product.name}`, html, type: 'admin_low_stock' });
}

// ----------------------------------------------------------------------
// MARKETING & CAMPAIGN TEMPLATES (REUSABLE LAYOUT PARAMETERS)
// ----------------------------------------------------------------------

export function sendMarketingEmail(campaignType, toEmail) {
  let title = '';
  let headline = '';
  let content = '';
  let btnText = 'Shop the Collection';
  let btnLink = `${appUrl}/shop`;

  const campaign = (campaignType || '').toLowerCase();

  if (campaign === 'festival') {
    title = 'Celebrate Festive Season';
    headline = '🌟 Festive Silk Sarees Festival - Up to 40% OFF!';
    content = 'Celebrate the upcoming festivities with our exclusive Banarasi handwoven silk sarees. Intricate gold zari borders, vibrant color themes, and luxury boutique finishes.';
    btnText = 'Shop Festive Silk';
  } else if (campaign === 'flash') {
    title = 'Flash Sale Alert';
    headline = '⚡ FLASH SALE: Next 24 Hours Only!';
    content = 'Get flat 15% off on our entire Georgette Kurti and Dress materials catalogs. Use promo code <strong>FLASH15</strong> during checkout.';
    btnText = 'Claim 15% Discount';
  } else if (campaign === 'new_collection') {
    title = 'New Weaves Arrived';
    headline = '🌿 Unveiling the Bridal Banarasi Silk Collection';
    content = 'Witness heritage patterns woven by master weavers. New collection arrivals feature delicate gold threads and soft royal borders.';
    btnText = 'Explore Bridal Weaves';
  } else if (campaign === 'abandoned_cart') {
    title = 'Forgot items in bag?';
    headline = '🛒 We saved the items in your shopping bag!';
    content = 'You forgot some gorgeous handpicked ethnic designs in your shopping bag. Complete your purchase now and enjoy free shipping across India.';
    btnText = 'Checkout My Bag';
    btnLink = `${appUrl}/cart`;
  } else if (campaign === 'wishlist_reminder') {
    title = 'Wishlist items available';
    headline = '❤️ Price Drop Alert: Your Wishlist Items!';
    content = 'Great news! Handpicked designs in your wishlist have received a temporary markdown. Log in and buy before stock runs out.';
    btnText = 'Open My Wishlist';
    btnLink = `${appUrl}/account?tab=wishlist`;
  } else if (campaign === 'birthday') {
    title = 'Happy Birthday Offer';
    headline = '🎂 Happy Birthday from Swastika Sarees!';
    content = 'Celebrate your birthday in style! As a token of appreciation, enjoy flat 10% cashback directly to your wallet using voucher code <strong>BDAYVIBE</strong>.';
    btnText = 'Claim Birthday Cash';
  } else {
    // General Newsletter Fallback
    title = 'Boutique Newsletter Update';
    headline = '📰 Latest Weaving Highlights & Stylist Tips';
    content = 'Read our weekly curation detailing how to preserve Banarasi silk weaves, style chiffon drapes, and choose lightweight cotton kurtis for summer elegance.';
    btnText = 'Read Our Boutique Blog';
  }

  const html = getLayout(`
    <h2>${headline}</h2>
    <p>${content}</p>
    <div style="text-align: center;">
      <a href="${btnLink}" class="button">${btnText}</a>
    </div>
    <p style="font-size: 11px; color: #887878; text-align: center;">You are receiving this email because you subscribed to marketing updates at Swastika Sarees. You can unsubscribe at any time.</p>
  `, title);

  sendAsync({
    to: toEmail,
    subject: title,
    html,
    type: `marketing_${campaign}`
  });
}
