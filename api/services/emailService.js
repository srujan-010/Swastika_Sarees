import { Resend } from 'resend';
import dotenv from 'dotenv';
import { User } from '../db/models.js';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY || 're_em2kEbZW_4Ar7jESGUHZqKbea6kPU4c4L';
const fromEmail = 'Swastika Sarees <noreply@swastikasarees.com>';
const replyTo = 'sareesswastika@gmail.com';
const adminEmail = process.env.ADMIN_EMAIL || 'sareesswastika@gmail.com';
const appUrl = process.env.APP_URL || 'http://localhost:3005';
const companyName = process.env.COMPANY_NAME || 'Swastika Sarees';

// ─── TEST MODE CONFIGURATION ────────────────────────────────────────────────
const TEST_MODE = process.env.TEST_MODE !== 'false';
const TEST_EMAIL_OVERRIDE = process.env.TEST_EMAIL_OVERRIDE || adminEmail;

if (TEST_MODE) {
  console.log(`[Email Service] ⚠️  TEST MODE ENABLED — All emails redirected to: ${TEST_EMAIL_OVERRIDE}`);
} else {
  console.log(`[Email Service] ✅ PRODUCTION MODE — Emails will be sent to real recipients.`);
}
// ─────────────────────────────────────────────────────────────────────────────

const resend = new Resend(apiKey);

// Helper to inject a test mode banner
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

// ─── PREMIUM BRAND LAYOUT ──────────────────────────────────────────────────
function getLayout(contentHtml, title) {
  const brandCrimson = '#8B1A1A';
  const brandGold = '#C8832A';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcf9f5; color: #1a0505; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e8dfd5; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(139, 26, 26, 0.04); }
          .header { background-color: ${brandCrimson}; padding: 32px 24px; text-align: center; border-bottom: 4px solid ${brandGold}; }
          .logo { font-size: 28px; font-weight: bold; color: #ffffff; text-transform: uppercase; letter-spacing: 0.15em; margin: 0; font-family: 'Georgia', serif; }
          .tagline { font-size: 12px; color: #fcf9f5; letter-spacing: 0.08em; margin: 8px 0 0 0; font-style: italic; opacity: 0.9; }
          .body { padding: 40px 32px; line-height: 1.6; font-size: 15px; color: #333333; }
          .button { display: inline-block; background-color: ${brandCrimson}; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin: 24px 10px 24px 0; border: 1px solid ${brandGold}; text-align: center; transition: all 0.3s ease; }
          .button-secondary { background-color: #ffffff; color: ${brandCrimson} !important; border: 1px solid ${brandCrimson}; }
          .footer { background-color: #f8f5f0; padding: 32px 24px; text-align: center; font-size: 12px; color: #666666; border-top: 1px solid #e8dfd5; }
          .footer a { color: ${brandCrimson}; text-decoration: none; font-weight: 600; }
          .social-links { margin: 20px 0; }
          .social-links a { margin: 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: ${brandGold}; }
          .divider { height: 1px; background-color: #e8dfd5; margin: 24px 0; }
          h2 { color: ${brandCrimson}; font-size: 22px; margin-top: 0; margin-bottom: 16px; font-weight: 600; }
          
          /* Shared Element Styles */
          .order-table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 24px; font-size: 14px; }
          .order-table th { background-color: #fcf9f5; color: ${brandCrimson}; text-align: left; padding: 12px; border-bottom: 2px solid #e8dfd5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
          .order-table td { padding: 16px 12px; border-bottom: 1px solid #f0e6da; vertical-align: top; }
          .product-img { width: 60px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #e8dfd5; }
          .summary-box { background-color: #fcf9f5; border: 1px solid #e8dfd5; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
          .summary-total { border-top: 2px solid ${brandCrimson}; margin-top: 12px; padding-top: 12px; font-weight: bold; font-size: 16px; color: ${brandCrimson}; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: #e8dfd5; color: ${brandCrimson}; margin-top: 4px; }
          .text-center { text-align: center; }
          
          @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; border: none; box-shadow: none; }
            .body { padding: 24px 20px; }
            .product-img { width: 50px; height: 66px; }
            .button { display: block; margin: 16px 0; width: 100%; box-sizing: border-box; }
          }
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
            <p>Thank you for choosing Swastika Sarees.</p>
            <p>Need help? Reply to this email or contact us anytime.</p>
            <p>For instant support, consult via WhatsApp at <a href="https://wa.me/919999999999">+91 99999 99999</a></p>
            
            <div class="social-links">
              <a href="${appUrl}">Website</a> | 
              <a href="https://instagram.com/swastikasarees_">Instagram</a> | 
              <a href="https://facebook.com/swastikasarees">Facebook</a>
            </div>
            
            <p style="margin-top: 24px; font-size: 10px; color: #999;">
              Secunderabad, Telangana | GSTIN: 36AAAAA0000A1Z5<br>
              © ${new Date().getFullYear()} ${companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── ASYNC QUEUE & RETRY LOGIC ───────────────────────────────────────────────
const emailQueue = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (emailQueue.length > 0) {
    const job = emailQueue.shift();
    
    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    
    while(attempts < maxAttempts && !success) {
        attempts++;
        try {
          const response = await resend.emails.send({
            from: job.from,
            to: job.to,
            reply_to: replyTo,
            subject: job.subject,
            html: job.html,
            text: job.text
          });

          if (response.error) {
            throw new Error(response.error.message || 'Resend API returned error');
          }
          console.log(`[Email Log]${TEST_MODE ? ' [TEST→' + job.originalRecipient + ']' : ''} Type: ${job.type} | Recipient: ${job.to.join(', ')} | Status: success | ID: ${response.data?.id} | TS: ${new Date().toISOString()}`);
          success = true;
        } catch (err) {
          if (attempts === maxAttempts) {
             console.error(`[Email Log]${TEST_MODE ? ' [TEST→' + job.originalRecipient + ']' : ''} Type: ${job.type} | Recipient: ${job.to.join(', ')} | Status: failed | Error: ${err.message} | TS: ${new Date().toISOString()}`);
          } else {
             await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Backoff 1s, 2s
          }
        }
    }

    // 150ms pause between successful sends
    if (emailQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  isProcessingQueue = false;
}

function sendAsync({ to, subject, html, text, type }) {
  const originalRecipient = Array.isArray(to) ? to.join(', ') : to;

  const finalTo = TEST_MODE
    ? [TEST_EMAIL_OVERRIDE]
    : (Array.isArray(to) ? to : [to]);

  const finalSubject = TEST_MODE
    ? `[TEST] ${subject}`
    : subject;

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

  setImmediate(() => processQueue());
}
// ─────────────────────────────────────────────────────────────────────────────

// Helper to safely get user email
async function resolveCustomerEmail(order) {
  let email = order.shippingAddress?.email;
  if (!email && order.user && order.user !== 'guest') {
    try {
      const u = await User.findOne({ id: order.user });
      if (u) email = u.email;
    } catch(e) {}
  }
  return email;
}

const formatCurrency = (amountInPaise) => `₹${(amountInPaise / 100).toFixed(2)}`;
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── 1. Welcome Email (User Registration) ────────────────────────────────────
export function sendWelcomeEmail(user) {
  const name = user.fullName || 'Customer';
  const html = getLayout(`
    <h2>Welcome to Swastika Sarees ✨</h2>
    <p>Dear ${name},</p>
    <p>Thank you for joining the Swastika Sarees family! We are delighted to welcome you to our exclusive world of premium ethnic luxury wear.</p>
    
    <div class="summary-box">
      <h3 style="margin-top:0; color: #8B1A1A;">Your Exclusive Benefits:</h3>
      <ul style="padding-left: 20px; margin-bottom: 0;">
        <li style="margin-bottom: 8px;">✨ <strong>Exclusive Offers:</strong> Access to members-only sales.</li>
        <li style="margin-bottom: 8px;">🚀 <strong>Faster Checkout:</strong> Save your details for seamless shopping.</li>
        <li style="margin-bottom: 8px;">📦 <strong>Order Tracking:</strong> Live updates on your premium boxes.</li>
        <li style="margin-bottom: 8px;">❤️ <strong>Wishlist:</strong> Save your favorite handcrafted designs.</li>
        <li>👗 <strong>Premium Collections:</strong> Early access to new bridal and festive weaves.</li>
      </ul>
    </div>
    
    <div class="text-center">
      <a href="${appUrl}/shop" class="button">Start Shopping</a>
    </div>
  `, 'Welcome to Swastika Sarees');

  sendAsync({ to: user.email, subject: 'Welcome to Swastika Sarees ✨', html, type: 'welcome' });
}

// ─── 2. Order Placed Email ───────────────────────────────────────────────────
export async function sendOrderPlacedEmail(order) {
  const name = order.shippingAddress?.name || 'Customer';
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="width: 70px;">
        <img src="${item.imageUrl || 'https://via.placeholder.com/60x80'}" class="product-img" alt="${item.name}">
      </td>
      <td>
        <strong style="display:block; margin-bottom: 4px;">${item.name}</strong>
        <span style="font-size: 11px; color: #666; display: block;">Color: ${item.color || 'N/A'} | Size: ${item.size || 'N/A'}</span>
        <span style="font-size: 11px; color: #666; display: block;">Qty: ${item.quantity} × ${formatCurrency(item.price)}</span>
      </td>
      <td style="text-align: right; font-weight: 600;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const html = getLayout(`
    <h2>Your Order has been Placed Successfully 🎉</h2>
    <p>Dear ${name},</p>
    <p>Thank you for your purchase! We've received your order and are currently processing it.</p>
    
    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">
      <div style="flex: 1; min-width: 200px;">
        <strong>Order ID:</strong> ${order.orderId}<br>
        <strong>Order Date:</strong> ${formatDate(order.createdAt || new Date())}
      </div>
      <div style="flex: 1; min-width: 200px; text-align: right;">
        <strong>Payment Method:</strong> ${order.payment?.method?.toUpperCase() || 'N/A'}<br>
        <strong>Payment Status:</strong> <span class="badge">${order.payment?.status || 'Pending'}</span>
      </div>
    </div>

    <table class="order-table">
      <thead>
        <tr>
          <th colspan="2">Ordered Products</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="summary-box" style="margin-left: auto; width: 250px;">
      <div class="summary-row"><span>Subtotal:</span> <span>${formatCurrency(order.pricing?.subtotal || 0)}</span></div>
      ${order.pricing?.couponDiscount > 0 ? `<div class="summary-row" style="color: #15803d;"><span>Discount:</span> <span>-${formatCurrency(order.pricing.couponDiscount)}</span></div>` : ''}
      <div class="summary-row"><span>Shipping:</span> <span>${order.pricing?.shippingCharge > 0 ? formatCurrency(order.pricing.shippingCharge) : 'FREE'}</span></div>
      <div class="summary-row summary-total"><span>Grand Total:</span> <span>${formatCurrency(order.pricing?.total || 0)}</span></div>
    </div>
    
    <div style="clear: both; margin-top: 30px;">
      <h3 style="color: #8b1a1a; margin-bottom: 8px;">Shipping Address</h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555;">
        <strong>${order.shippingAddress?.name || ''}</strong><br>
        ${order.shippingAddress?.line1 || ''}<br>
        ${order.shippingAddress?.line2 ? `${order.shippingAddress.line2}<br>` : ''}
        ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br>
        Phone: ${order.shippingAddress?.phone || ''}
      </p>
    </div>
    
    <div class="text-center" style="margin-top: 30px;">
      <a href="${appUrl}/account?tab=orders" class="button">Track Order</a>
      <a href="${appUrl}/shop" class="button button-secondary">Continue Shopping</a>
    </div>
  `, 'Order Placed Successfully');

  sendAsync({ to: email, subject: 'Your Order has been Placed Successfully 🎉', html, type: 'order_placed' });
}

// ─── 3. Order Confirmed Email ────────────────────────────────────────────────
export async function sendOrderConfirmedEmail(order) {
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const dispatchDate = new Date();
  dispatchDate.setDate(dispatchDate.getDate() + 2);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const html = getLayout(`
    <h2>Your Order is Confirmed ✅</h2>
    <p>Hello ${order.shippingAddress?.name || 'Customer'},</p>
    <p>Great news! Your order <strong>${order.orderId}</strong> has been confirmed and our boutique team has started preparing it.</p>
    <p>We'll notify you again once it has been packed and shipped.</p>
    
    <div class="summary-box">
      <strong>Estimated Dispatch Date:</strong> ${formatDate(dispatchDate)}<br><br>
      <strong>Estimated Delivery Date:</strong> ${formatDate(deliveryDate)}
    </div>
    
    <div class="text-center">
      <a href="${appUrl}/account?tab=orders" class="button">Track My Order</a>
    </div>
  `, 'Order Confirmed');

  sendAsync({ to: email, subject: 'Your Order is Confirmed ✅', html, type: 'order_confirmed' });
}

// ─── 4. Order Packed / Ready to Dispatch Email ───────────────────────────────
export async function sendOrderPackedEmail(order) {
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const html = getLayout(`
    <h2>Your Order is Packed 📦</h2>
    <p>Dear ${order.shippingAddress?.name || 'Customer'},</p>
    <p>Your order <strong>${order.orderId}</strong> has been carefully packed and is ready for dispatch.</p>
    <p>Our logistics partner will pick it up shortly.</p>
    
    <div class="summary-box">
      <strong>Order Summary:</strong> ${(order.items || []).length} item(s) - ${formatCurrency(order.pricing?.total || 0)}<br><br>
      <strong>Estimated Dispatch Time:</strong> Within 24 hours
    </div>
    
    <div class="text-center">
      <a href="${appUrl}/account?tab=orders" class="button">Track Order</a>
    </div>
  `, 'Order Packed');

  sendAsync({ to: email, subject: 'Your Order is Packed 📦', html, type: 'order_packed' });
}

// ─── 5. Order Shipped Email ──────────────────────────────────────────────────
export async function sendOrderShippedEmail(order) {
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const courier = order.tracking?.courierName || 'Our Delivery Partner';
  const trackingNo = order.tracking?.trackingNumber || 'Awaiting Tracking ID';
  const trackingUrl = order.tracking?.trackingUrl || `https://www.google.com/search?q=${trackingNo}`;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  const html = getLayout(`
    <h2>Your Order has been Shipped 🚚</h2>
    <p>Dear ${order.shippingAddress?.name || 'Customer'},</p>
    <p>Good news! Your order <strong>${order.orderId}</strong> is on its way.</p>
    
    <div class="summary-box">
      <p style="margin: 0 0 10px 0;"><strong>Courier Name:</strong> ${courier}</p>
      <p style="margin: 0 0 10px 0;"><strong>Tracking Number:</strong> ${trackingNo}</p>
      <p style="margin: 0;"><strong>Expected Delivery Date:</strong> ${formatDate(deliveryDate)}</p>
    </div>
    
    <div class="text-center">
      <a href="${trackingUrl}" class="button">Track Shipment</a>
      <a href="${appUrl}/account?tab=orders" class="button button-secondary">View Order</a>
    </div>
  `, 'Order Shipped');

  sendAsync({ to: email, subject: 'Your Order has been Shipped 🚚', html, type: 'order_shipped' });
}

// ─── 6. Out For Delivery Email ───────────────────────────────────────────────
export async function sendOutForDeliveryEmail(order) {
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const courier = order.tracking?.courierName || 'Our Delivery Partner';
  const trackingNo = order.tracking?.trackingNumber || 'N/A';

  const html = getLayout(`
    <h2>Your Order is Out for Delivery 🚀</h2>
    <p>Dear ${order.shippingAddress?.name || 'Customer'},</p>
    <p>Your package is arriving today. Please keep your phone available as our delivery executive might call you.</p>
    
    <div class="summary-box">
      <p style="margin: 0 0 10px 0;"><strong>Courier:</strong> ${courier}</p>
      <p style="margin: 0 0 10px 0;"><strong>Tracking Number:</strong> ${trackingNo}</p>
      <hr style="border: 0; border-top: 1px solid #e8dfd5; margin: 15px 0;">
      <p style="margin: 0 0 5px 0;"><strong>Delivery Address:</strong></p>
      <p style="margin: 0; font-size: 13px; color: #555;">
        ${order.shippingAddress?.line1 || ''}, ${order.shippingAddress?.city || ''}<br>
        ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}
      </p>
    </div>
    
    <div class="text-center">
      <a href="${order.tracking?.trackingUrl || appUrl}" class="button">Track Live</a>
    </div>
  `, 'Out For Delivery');

  sendAsync({ to: email, subject: 'Your Order is Out for Delivery 🚀', html, type: 'out_for_delivery' });
}

// ─── 7. Order Delivered Email ────────────────────────────────────────────────
export async function sendOrderDeliveredEmail(order) {
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const html = getLayout(`
    <h2>Your Order has been Delivered ❤️</h2>
    <p>Dear ${order.shippingAddress?.name || 'Customer'},</p>
    <p>Thank you so much for shopping with Swastika Sarees. We hope you love your purchase as much as we loved crafting it for you.</p>
    <p>Your feedback means the world to us and helps other shoppers make great choices. We would love to hear your thoughts!</p>
    
    <div class="text-center">
      <a href="${appUrl}/account?tab=orders" class="button">Write Review</a>
      <a href="${appUrl}/shop" class="button button-secondary">Shop Again</a>
    </div>
  `, 'Order Delivered');

  sendAsync({ to: email, subject: 'Your Order has been Delivered ❤️', html, type: 'order_delivered' });
}

// ─── 8. Order Cancelled Email ────────────────────────────────────────────────
export async function sendOrderCancelledEmail(order, reason = 'Customer request') {
  const email = await resolveCustomerEmail(order);
  if (!email) return;
  
  const isPaid = order.payment?.status === 'paid' || order.payment?.status === 'refund_pending' || order.payment?.status === 'refunded';

  const html = getLayout(`
    <h2>Your Order has been Cancelled</h2>
    <p>Dear ${order.shippingAddress?.name || 'Customer'},</p>
    <p>Your order <strong>${order.orderId}</strong> has been cancelled.</p>
    
    <div class="summary-box">
      <p style="margin: 0 0 10px 0;"><strong>Reason:</strong> ${reason}</p>
      <p style="margin: 0 0 10px 0;"><strong>Refund Status:</strong> <span class="badge">${isPaid ? 'Refund Initiated' : 'No Payment Deducted'}</span></p>
      ${isPaid ? '<p style="margin: 0;"><strong>Expected Refund Time:</strong> 5-7 Business Days</p>' : ''}
    </div>
    
    <div class="text-center">
      <a href="${appUrl}/contact" class="button">Contact Support</a>
    </div>
  `, 'Order Cancelled');

  sendAsync({ to: email, subject: 'Your Order has been Cancelled', html, type: 'order_cancelled' });
}

// ─── 9. Refund Initiated Email ───────────────────────────────────────────────
export async function sendRefundInitiatedEmail(order) {
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const html = getLayout(`
    <h2>Refund Initiated 💳</h2>
    <p>Dear ${order.shippingAddress?.name || 'Customer'},</p>
    <p>A refund has been initiated for your order <strong>${order.orderId}</strong>.</p>
    
    <div class="summary-box">
      <p style="margin: 0 0 10px 0;"><strong>Refund Amount:</strong> ${formatCurrency(order.pricing?.total || 0)}</p>
      <p style="margin: 0 0 10px 0;"><strong>Refund ID / Reference:</strong> ${order.payment?.transactionId || 'Processing'}</p>
      <p style="margin: 0;"><strong>Estimated Credit Time:</strong> 5-7 Business Days to original payment source</p>
    </div>
  `, 'Refund Initiated');

  sendAsync({ to: email, subject: 'Refund Initiated 💳', html, type: 'refund_initiated' });
}

// ─── 10. Refund Completed Email ──────────────────────────────────────────────
export async function sendRefundCompletedEmail(order) {
  const email = await resolveCustomerEmail(order);
  if (!email) return;

  const html = getLayout(`
    <h2>Refund Completed Successfully</h2>
    <p>Dear ${order.shippingAddress?.name || 'Customer'},</p>
    <p>We are writing to inform you that your refund has been completely processed and credited successfully.</p>
    
    <div class="summary-box">
      <p style="margin: 0 0 10px 0;"><strong>Refund Amount:</strong> <span style="color: #15803d; font-weight: bold;">${formatCurrency(order.pricing?.total || 0)}</span></p>
      <p style="margin: 0 0 10px 0;"><strong>Credited To:</strong> Original Payment Source</p>
      <p style="margin: 0;"><strong>Transaction ID:</strong> ${order.payment?.transactionId || order.orderId}</p>
    </div>
    <p>Please check your bank statement. If you do not see the credit within 24 hours, please contact your bank with the Transaction ID.</p>
  `, 'Refund Completed');

  sendAsync({ to: email, subject: 'Refund Completed Successfully', html, type: 'refund_completed' });
}

// ─── 11. Password Reset Email ────────────────────────────────────────────────
export function sendPasswordResetEmail(email, resetLink) {
  const html = getLayout(`
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password for your Swastika Sarees account.</p>
    <p>Click the button below to choose a new password. This link will expire in <strong>15 Minutes</strong>.</p>
    
    <div class="text-center">
      <a href="${resetLink}" class="button">Reset Password</a>
    </div>
    
    <p style="font-size: 13px; color: #666; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
  `, 'Reset Password');

  sendAsync({ to: email, subject: 'Reset Your Password', html, type: 'password_reset' });
}

// ─── 12. Email Verification ──────────────────────────────────────────────────
export function sendEmailVerificationEmail(email, verifyLink) {
  const html = getLayout(`
    <h2>Verify Your Email Address</h2>
    <p>Welcome to Swastika Sarees!</p>
    <p>To complete your registration and secure your account, please verify your email address by clicking the button below.</p>
    
    <div class="text-center">
      <a href="${verifyLink}" class="button">Verify Email</a>
    </div>
  `, 'Verify Email');

  sendAsync({ to: email, subject: 'Verify Your Email Address', html, type: 'email_verification' });
}

// ─── 13. Admin New Order Email ───────────────────────────────────────────────
export function sendAdminNewOrder(order) {
  const itemsHtml = (order.items || []).map(item => `
    <li>${item.quantity}x ${item.name} (${item.color || ''} ${item.size || ''})</li>
  `).join('');

  const html = getLayout(`
    <h2>New Order Received - #${order.orderId}</h2>
    <p>A new order has been placed on the storefront.</p>
    
    <div class="summary-box">
      <strong>Customer:</strong> ${order.shippingAddress?.name || 'N/A'}<br>
      <strong>Email:</strong> ${order.shippingAddress?.email || 'N/A'}<br>
      <strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}<br>
      <strong>Address:</strong> ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br><br>
      
      <strong>Items:</strong>
      <ul style="margin-top: 5px; margin-bottom: 10px;">${itemsHtml}</ul>
      
      <strong>Grand Total:</strong> ${formatCurrency(order.pricing?.total || 0)}<br>
      <strong>Payment Method:</strong> ${order.payment?.method?.toUpperCase() || 'N/A'}<br>
      <strong>Payment Status:</strong> <span class="badge">${order.payment?.status || 'N/A'}</span>
    </div>
    
    <div class="text-center">
      <a href="${appUrl}/admin" class="button">Open Admin Dashboard</a>
      <a href="${appUrl}/api/orders/${order.orderId}/invoice" class="button button-secondary">Print Invoice</a>
    </div>
  `, `New Order #${order.orderId}`);

  sendAsync({ to: adminEmail, subject: `New Order Received - #${order.orderId}`, html, type: 'admin_new_order' });
}

// ─── 14. Low Stock Alert ─────────────────────────────────────────────────────
export function sendAdminLowStockAlert(product, variantInfo = 'Main Product', remainingStock = 0) {
  const html = getLayout(`
    <h2 style="color: #b91c1c;">Low Stock Alert ⚠️</h2>
    <p>Action required: A product's inventory has fallen below the minimum threshold (5 units).</p>
    
    <div class="summary-box">
      <strong>Product:</strong> ${product?.name || 'Unknown'}<br>
      <strong>Variant:</strong> ${variantInfo}<br>
      <strong>Remaining Stock:</strong> <span style="color: #b91c1c; font-weight: bold; font-size: 18px;">${remainingStock}</span>
    </div>
    
    <div class="text-center">
      <a href="${appUrl}/admin/products" class="button">Manage Inventory</a>
    </div>
  `, 'Low Stock Alert');

  sendAsync({ to: adminEmail, subject: 'Low Stock Alert', html, type: 'admin_low_stock' });
}

// ─── 15. Daily Sales Report ──────────────────────────────────────────────────
export function sendDailySalesReport(reportData) {
  const topProductsHtml = (reportData.topProducts || []).map(p => `<li>${p.name} - ${p.sales} sold</li>`).join('');
  const lowStockHtml = (reportData.lowStockProducts || []).map(p => `<li>${p.name} (${p.stock} left)</li>`).join('');

  const html = getLayout(`
    <h2>Daily Sales Report 📊</h2>
    <p>Here is the summary of today's business performance (Midnight to 11:59 PM).</p>
    
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <div class="summary-box" style="flex: 1; text-align: center; padding: 15px; margin: 0;">
        <div style="font-size: 12px; color: #666; text-transform: uppercase;">Revenue</div>
        <div style="font-size: 24px; font-weight: bold; color: #8B1A1A;">${formatCurrency(reportData.revenue || 0)}</div>
      </div>
      <div class="summary-box" style="flex: 1; text-align: center; padding: 15px; margin: 0;">
        <div style="font-size: 12px; color: #666; text-transform: uppercase;">Orders</div>
        <div style="font-size: 24px; font-weight: bold; color: #8B1A1A;">${reportData.totalOrders || 0}</div>
      </div>
    </div>
    
    <div class="summary-box">
      <h3 style="margin-top: 0;">Order Breakdown</h3>
      <p style="margin: 5px 0;"><strong>Online Payments:</strong> ${reportData.onlineOrders || 0}</p>
      <p style="margin: 5px 0;"><strong>Cash on Delivery:</strong> ${reportData.codOrders || 0}</p>
      <p style="margin: 5px 0; color: #b91c1c;"><strong>Cancelled Orders:</strong> ${reportData.cancelledOrders || 0}</p>
      <p style="margin: 5px 0; color: #C8832A;"><strong>Pending Dispatch:</strong> ${reportData.pendingOrders || 0}</p>
    </div>
    
    ${topProductsHtml ? `
    <div class="summary-box">
      <h3 style="margin-top: 0;">Top Selling Products</h3>
      <ul style="margin: 0; padding-left: 20px;">${topProductsHtml}</ul>
    </div>` : ''}
    
    ${lowStockHtml ? `
    <div class="summary-box" style="border-left: 4px solid #b91c1c;">
      <h3 style="margin-top: 0; color: #b91c1c;">Action Needed: Low Stock</h3>
      <ul style="margin: 0; padding-left: 20px;">${lowStockHtml}</ul>
    </div>` : ''}
    
    <div class="text-center">
      <a href="${appUrl}/admin" class="button">View Dashboard</a>
    </div>
  `, 'Daily Sales Report');

  sendAsync({ to: adminEmail, subject: `Daily Sales Report - ${new Date().toLocaleDateString('en-IN')}`, html, type: 'daily_report' });
}

// ─── LEGACY EXPORTS (Kept for compatibility with other files) ────────────────
export function sendAdminNewCustomer(user) { sendWelcomeEmail(user); }
export function sendAdminLargeOrder(order) {}
export function sendAdminPaymentFailure(order, errDetails) {}
export function sendAdminRefundRequest(order, details) {}
export function sendOtpEmail(email, code) { sendEmailVerificationEmail(email, `${appUrl}/verify-email?code=${code}`); }
export function sendOrderStatusEmail(order, status) {
  if (status === 'confirmed') return sendOrderConfirmedEmail(order);
  if (status === 'packed') return sendOrderPackedEmail(order);
  if (status === 'shipped') return sendOrderShippedEmail(order);
  if (status === 'out_for_delivery') return sendOutForDeliveryEmail(order);
  if (status === 'delivered') return sendOrderDeliveredEmail(order);
}
export function sendPaymentSuccessfulEmail(order) { return sendOrderPlacedEmail(order); }
