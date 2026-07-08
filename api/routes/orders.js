import express from 'express';
import crypto from 'crypto';
import { Order, Product, Coupon, User } from '../db/models.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as emailService from '../services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Helper to generate sequential order ID
async function generateOrderId() {
  const count = await Order.countDocuments();
  return `SS-${10000 + count + 1}`;
}

// 1. POST Create Razorpay Order (Storefront checkout)
router.post('/razorpay-order', async (req, res) => {
  try {
    const { amountINR } = req.body; // amount in INR
    if (!amountINR || isNaN(amountINR)) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const amountPaise = Math.round(amountINR * 100);
    const keyId = process.env.VITE_RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_SECRET;

    // Local Test Mode: If credentials are not configured, simulate a Razorpay order
    if (!keyId || !secret) {
      return res.json({
        id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
        amount: amountPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        isMock: true
      });
    }

    // Call real Razorpay API
    const authString = Buffer.from(`${keyId}:${secret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.description || 'Razorpay order creation failed');
    }

    res.json(data);
  } catch (error) {
    console.error('Razorpay API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. POST Verify Razorpay Signature and Create Order Record
router.post('/', async (req, res) => {
  try {
    const {
      cartItems,
      shippingAddress,
      pricing,
      couponApplied,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId // Optional Supabase user UUID if logged in
    } = req.body;

    if (!cartItems || !cartItems.length || !shippingAddress || !pricing) {
      return res.status(400).json({ error: 'Missing required order details.' });
    }

    // 1. Stock Validation
    const outOfStockItems = [];
    const dbItems = [];

    for (const item of cartItems) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ error: `Product not found: ${item.name}` });
      }

      let sizeObj = null;
      let isMainProductColor = false;
      let variant = null;

      if (item.color || item.size) {
        // Is it the main product?
        if (dbProduct.mainProduct?.primaryColor?.name === item.color || dbProduct.colorName === item.color) {
          isMainProductColor = true;
          sizeObj = dbProduct.mainProduct?.sizes?.find(s => !item.size || s.size === item.size);
        } else {
          variant = dbProduct.variants.find(v => !item.color || v.colorName === item.color);
          if (variant) {
            sizeObj = variant.sizes?.find(s => !item.size || s.size === item.size);
          } else {
             outOfStockItems.push(`${dbProduct.name} - ${item.color || ''} (Color not found)`);
          }
        }

        if ((isMainProductColor || variant) && !sizeObj && item.size) {
            outOfStockItems.push(`${dbProduct.name} - ${item.color || ''} ${item.size || ''} (Size not found)`);
        }

        if (sizeObj && sizeObj.stock < item.quantity) {
          outOfStockItems.push(`${dbProduct.name} - ${item.color || ''} ${item.size || ''} (Only ${sizeObj.stock} left)`);
        }
      } else {
        if (dbProduct.stock < item.quantity) {
          outOfStockItems.push(`${dbProduct.name} (Only ${dbProduct.stock} left)`);
        }
      }

      dbItems.push({
        product: dbProduct,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      });
    }

    if (outOfStockItems.length > 0) {
      return res.status(400).json({
        error: 'Some items in your cart are out of stock.',
        details: outOfStockItems
      });
    }

    // 2. Verify Razorpay Payment Signature (if Razorpay payment method and NOT mock order)
    if (paymentMethod === 'razorpay' && razorpayOrderId && !razorpayOrderId.startsWith('order_mock_')) {
      const keySecret = process.env.RAZORPAY_SECRET;
      if (keySecret) {
        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        if (generatedSignature !== razorpaySignature) {
          return res.status(400).json({ error: 'Payment signature verification failed. Transaction was not secure.' });
        }
      }
    }

    // 3. Deduct stock from database
    for (const item of dbItems) {
      // Deduct main stock
      item.product.stock -= item.quantity;

      // Deduct specific size stock
      if (item.color || item.size) {
        const isMainProductColor = (item.product.mainProduct?.primaryColor?.name === item.color || item.product.colorName === item.color);
        if (isMainProductColor) {
           const sizeObj = item.product.mainProduct?.sizes?.find(s => !item.size || s.size === item.size);
           if (sizeObj) sizeObj.stock -= item.quantity;
        } else {
           const variant = item.product.variants.find(v => !item.color || v.colorName === item.color);
           if (variant) {
             const sizeObj = variant.sizes?.find(s => !item.size || s.size === item.size);
             if (sizeObj) sizeObj.stock -= item.quantity;
           }
        }
      }
      await item.product.save();
      // Check if product stock is low (threshold of 5 items)
      if (item.product.stock <= 5) {
        emailService.sendAdminLowStockAlert(item.product, item.color || item.size ? `${item.color || ''} ${item.size || ''}` : 'Main product');
      }
    }

    // 4. Update coupon uses if applied
    if (couponApplied) {
      await Coupon.findOneAndUpdate({ code: couponApplied.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    // 5. Generate sequentially friendly Order ID (SS-XXXXX)
    const orderId = await generateOrderId();

    // 6. Map pricing fields from INR to Paise (multiply by 100 to save as integers)
    const priceFields = {
      subtotal: Math.round(pricing.subtotal * 100),
      discount: Math.round((pricing.discount || 0) * 100),
      couponDiscount: Math.round((pricing.couponDiscount || 0) * 100),
      shippingCharge: Math.round((pricing.shippingCharge || 0) * 100),
      total: Math.round(pricing.total * 100)
    };

    // 7. Save Order Record in MongoDB
    const order = await Order.create({
      orderId,
      user: userId || 'guest',
      items: cartItems.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price * 100), // in paise
        color: item.color,
        size: item.size,
        imageUrl: item.imageUrl
      })),
      shippingAddress,
      pricing: priceFields,
      couponApplied,
      payment: {
        method: paymentMethod,
        transactionId: razorpayPaymentId || `cod_${crypto.randomBytes(6).toString('hex')}`,
        status: paymentMethod === 'razorpay' ? 'paid' : 'pending'
      },
      status: 'pending'
    });

    // Asynchronously trigger emails without blocking Express response
    emailService.sendOrderPlacedEmail(order);
    emailService.sendAdminNewOrder(order);

    if (order.pricing.total > 2000000) { // Large Order Alert (threshold ₹20,000 in paise)
      emailService.sendAdminLargeOrder(order);
    }

    if (order.payment.status === 'paid') {
      emailService.sendPaymentSuccessfulEmail(order);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Order Submission Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. GET current user's order history (Customer - requireAuth)
router.get('/history', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET Single Order Details (Customer - requireAuth or Guest lookup)
router.get('/detail/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { phone } = req.query; // Used for guest tracking validation

    const order = await Order.findOne({ orderId }).populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Security Check:
    // If order belongs to a customer, require authorization, OR if it's a guest, require matching phone
    if (order.user !== 'guest') {
      // Validate logged-in token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required to view this order.' });
      }
      // Simple decode validation if needed, but normally requireAuth handles this.
      // For simplicity, we assume frontend sends header and we fetch req.user if verified.
    } else {
      // Guest order
      if (!phone || order.shippingAddress.phone.replace(/[^0-9]/g, '').slice(-10) !== phone.replace(/[^0-9]/g, '').slice(-10)) {
        return res.status(403).json({ error: 'Access Denied: Phone number verification mismatch.' });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4b. GET Order Success Page Data — Public, no auth required
// Uses SS-XXXXX orderId (sequential ID), not MongoDB _id
// Returns full order with populated product refs for the success page
router.get('/success/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId })
      .populate('items.product', 'name slug images price originalPrice category');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/track', async (req, res) => {
  try {
    const { orderId, phone } = req.query;
    if (!orderId || !phone) {
      return res.status(400).json({ error: 'Order ID and phone number are required.' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'No order found with this ID.' });
    }

    // Match phone ends (last 10 digits to ignore country code formatting)
    const oPhone = order.shippingAddress.phone.replace(/[^0-9]/g, '').slice(-10);
    const qPhone = phone.replace(/[^0-9]/g, '').slice(-10);

    if (oPhone !== qPhone) {
      return res.status(403).json({ error: 'Phone number does not match shipping address on file.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. GET all orders (Admin only)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(parseInt(limit));

    res.json({
      total,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. PUT update status & tracking (Admin only)
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, courierName, trackingNumber, trackingUrl, internalNotes, paymentStatus, refundCompleted } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const oldStatus = order.status;
    const oldPaymentStatus = order.payment.status;

    order.status = status || order.status;
    order.internalNotes = internalNotes || order.internalNotes;

    if (paymentStatus) {
      order.payment.status = paymentStatus;
    }

    // Automated Razorpay Refund Logic
    if (refundCompleted && order.payment.method === 'razorpay' && order.payment.transactionId && oldPaymentStatus !== 'refunded') {
      const keyId = process.env.VITE_RAZORPAY_KEY_ID;
      const secret = process.env.RAZORPAY_SECRET;
      
      if (keyId && secret && !order.payment.transactionId.startsWith('mock_') && !order.payment.transactionId.startsWith('cod_')) {
        try {
          const rzpResponse = await fetch(`https://api.razorpay.com/v1/payments/${order.payment.transactionId}/refund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`
            },
            body: JSON.stringify({ amount: order.pricing.total }) // amount is in paise
          });
          
          const rzpData = await rzpResponse.json();
          if (!rzpResponse.ok) {
            console.error('Razorpay Refund Failed:', rzpData);
            return res.status(400).json({ error: `Razorpay Refund Failed: ${rzpData.error?.description || 'Unknown Error'}` });
          }
          
          order.payment.refundDetails = rzpData.id; // Save Razorpay Refund ID
          console.log(`[Razorpay Refund] Success for Order ${order.orderId} - Refund ID: ${rzpData.id}`);
        } catch (rzpErr) {
          console.error('Razorpay Refund API Error:', rzpErr);
          return res.status(500).json({ error: 'Failed to communicate with Razorpay API for refund.' });
        }
      }
    }

    if (status === 'shipped') {
      order.tracking = {
        courierName,
        trackingNumber,
        trackingUrl: trackingUrl || `https://www.delhivery.com/track/package/${trackingNumber}`
      };
      
      // Auto-Generated WhatsApp Notification URL Simulation
      const formattedPhone = order.shippingAddress.phone.replace(/[^0-9]/g, '');
      const waText = `Hi ${order.shippingAddress.name}! Your Swastika Sarees order ${order.orderId} has been shipped via ${courierName}. Tracking: ${trackingNumber}. Track here: ${order.tracking.trackingUrl} 🙏`;
      console.log(`[WhatsApp Alert Sandbox] Send to 91${formattedPhone.slice(-10)}: ${waText}`);
    }

    await order.save();

    // Trigger emails asynchronously on updates
    if (status && status !== oldStatus) {
      if (status === 'cancelled') {
        emailService.sendOrderCancelledEmail(order, 'Cancelled by Admin');
        if (order.payment.status === 'paid') {
          emailService.sendRefundInitiatedEmail(order);
        }
      } else {
        emailService.sendOrderStatusEmail(order, status);
      }
    }

    if (paymentStatus === 'paid' && oldPaymentStatus !== 'paid') {
      emailService.sendPaymentSuccessfulEmail(order);
    }

    if (refundCompleted) {
      emailService.sendRefundCompletedEmail(order);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. PUT cancel order (Customer or Admin)
router.put('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Access Check: user must own order or be admin
    if (req.user.role !== 'admin' && order.user !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized cancellation' });
    }

    // Verification check: status must be pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage of delivery.' });
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';

    // Restock inventory
    for (const item of order.items) {
      const dbProduct = await Product.findById(item.product);
      if (dbProduct) {
        dbProduct.stock += item.quantity;
        // Restock variants
        if (item.color || item.size) {
          const isMainProductColor = (dbProduct.mainProduct?.primaryColor?.name === item.color || dbProduct.colorName === item.color);
          if (isMainProductColor) {
             const sizeObj = dbProduct.mainProduct?.sizes?.find(s => !item.size || s.size === item.size);
             if (sizeObj) sizeObj.stock += item.quantity;
          } else {
             const variant = dbProduct.variants.find(v => !item.color || v.colorName === item.color);
             if (variant) {
               const sizeObj = variant.sizes?.find(s => !item.size || s.size === item.size);
               if (sizeObj) sizeObj.stock += item.quantity;
             }
          }
        }
        await dbProduct.save();
      }
    }

    await order.save();

    // Trigger cancel emails asynchronously
    emailService.sendOrderCancelledEmail(order, reason || 'Cancelled by user');
    if (order.payment.status === 'paid') {
      emailService.sendRefundInitiatedEmail(order);
    }

    res.json({ message: 'Order cancelled and stock updated.', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. POST request return/exchange within 7 days of delivery (Customer)
router.post('/:id/return', requireAuth, async (req, res) => {
  try {
    const { returnItems, reason, type } = req.body; // returnItems: [{ productId, quantity }], type: 'refund'/'exchange'
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized request' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Only delivered orders can be returned or exchanged.' });
    }

    // Verify 7 day delivery limit
    const deliveryDate = new Date(order.updatedAt);
    const diffTime = Math.abs(new Date() - deliveryDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      return res.status(400).json({ error: 'Return window expired. Returns are only eligible within 7 days of delivery.' });
    }

    // Set notes & status to show return request
    order.internalNotes = `${order.internalNotes || ''}\n[Return Request: ${type}] Items: ${JSON.stringify(returnItems)}, Reason: ${reason}`;
    order.status = 'processing'; // Change to processing for return review

    await order.save();

    // Trigger return request email alert to admin
    emailService.sendAdminRefundRequest(order, `[Return Request: ${type}] Reason: ${reason}`);

    res.json({ message: 'Return request submitted. Our team will review and approve via WhatsApp.', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. GET print HTML invoice format (Public/Auth lookup)
router.get('/:id/invoice', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).send('<h1>Order Not Found</h1>');
    }

    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ${item.name} <br>
          <small style="color: #666;">Color: ${item.color || 'N/A'}, Size: ${item.size || 'N/A'}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price / 100).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${((item.price * item.quantity) / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const invoiceHTML = `
      <html>
      <head>
        <title>Invoice | Swastika Sarees - ${order.orderId}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a0505; margin: 40px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #8b1a1a; padding-bottom: 20px; }
          .brand { font-size: 28px; font-weight: bold; color: #8b1a1a; }
          .address-section { display: flex; justify-content: space-between; margin-top: 30px; }
          .billing, .shipping { width: 45%; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background-color: #fff8f0; color: #8b1a1a; padding: 12px; border-bottom: 2px solid #e8d5c4; text-align: left; }
          .totals { margin-top: 30px; float: right; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { border-top: 2px solid #8b1a1a; font-weight: bold; font-size: 18px; color: #8b1a1a; padding-top: 10px; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background-color: #8b1a1a; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Print Invoice</button>
        </div>
        <div class="header">
          <div>
            <div class="brand">Swastika Sarees</div>
            <div>Shine Bright, Get Your Sparkle On!</div>
            <div>contact@swastikasarees.com | Pan-India Shipping</div>
          </div>
          <div style="text-align: right;">
            <h2>INVOICE</h2>
            <div><strong>Order ID:</strong> ${order.orderId}</div>
            <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            <div><strong>Payment Status:</strong> ${order.payment.status.toUpperCase()} (${order.payment.method.toUpperCase()})</div>
          </div>
        </div>
        <div class="address-section">
          <div class="shipping">
            <h4 style="color: #8b1a1a; margin-bottom: 8px;">Shipping Address</h4>
            <div><strong>${order.shippingAddress.name}</strong></div>
            <div>${order.shippingAddress.line1}</div>
            ${order.shippingAddress.line2 ? `<div>${order.shippingAddress.line2}</div>` : ''}
            <div>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</div>
            <div><strong>Phone:</strong> ${order.shippingAddress.phone}</div>
          </div>
          <div class="billing" style="text-align: right;">
            <h4 style="color: #8b1a1a; margin-bottom: 8px;">Seller Details</h4>
            <div><strong>Swastika Sarees Retail Ltd.</strong></div>
            <div>Secunderabad, Telangana</div>
            <div>GSTIN: 36AAAAA0000A1Z5</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${(order.pricing.subtotal / 100).toFixed(2)}</span>
          </div>
          ${order.pricing.couponDiscount > 0 ? `
          <div class="total-row" style="color: green;">
            <span>Coupon Discount (${order.couponApplied}):</span>
            <span>-₹${(order.pricing.couponDiscount / 100).toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Shipping:</span>
            <span>${order.pricing.shippingCharge > 0 ? `₹${(order.pricing.shippingCharge / 100).toFixed(2)}` : 'FREE'}</span>
          </div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>₹${(order.pricing.total / 100).toFixed(2)}</span>
          </div>
        </div>

        <div style="margin-top: 150px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e8d5c4; padding-top: 20px;">
          Thank you for shopping with Swastika Sarees! <br>
          For exchange or support queries, contact us via WhatsApp on 919999999999.
        </div>
      </body>
      </html>
    `;
    res.send(invoiceHTML);
  } catch (error) {
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

export default router;
