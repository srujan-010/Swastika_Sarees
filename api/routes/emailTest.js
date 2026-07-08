import express from 'express';
import * as emailService from '../services/emailService.js';

const router = express.Router();

// 1. Auth Simulation Endpoints
router.post('/verification-email', async (req, res) => {
  const { email, link } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  emailService.sendEmailVerificationEmail(email, link || `${req.protocol}://${req.get('host')}/verify-email?token=test`);
  res.json({ message: 'Verification email triggered verification link asynchronously' });
});

router.post('/reset-email', async (req, res) => {
  const { email, link } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  emailService.sendPasswordResetEmail(email, link || `${req.protocol}://${req.get('host')}/reset-password?token=test`);
  res.json({ message: 'Password reset instructions triggered reset link asynchronously' });
});

router.post('/otp-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  emailService.sendOtpEmail(email, code || '582914');
  res.json({ message: 'OTP verification code email triggered code asynchronously' });
});

// Alias paths matching the requirements exactly
// POST /api/auth/send-verification
// POST /api/auth/send-reset
// POST /api/auth/send-otp
router.post('/send-verification', async (req, res) => {
  const { email, link } = req.body;
  emailService.sendEmailVerificationEmail(email || 'sareesswastika@gmail.com', link || 'http://localhost:3005/verify-email?token=test');
  res.json({ message: 'Verification email triggered asynchronously' });
});

router.post('/send-reset', async (req, res) => {
  const { email, link } = req.body;
  emailService.sendPasswordResetEmail(email || 'sareesswastika@gmail.com', link || 'http://localhost:3005/reset-password?token=test');
  res.json({ message: 'Password reset email triggered asynchronously' });
});

router.post('/send-otp', async (req, res) => {
  const { email, code } = req.body;
  emailService.sendOtpEmail(email || 'sareesswastika@gmail.com', code || '942051');
  res.json({ message: 'OTP email triggered asynchronously' });
});

// 2. Trigger All Endpoints with Mock Data
router.post('/trigger-all', async (req, res) => {
  const { email } = req.body;
  const targetEmail = email || 'sareesswastika@gmail.com';

  const mockUser = {
    email: targetEmail,
    fullName: 'Aditi Rao Hydari',
    phone: '918888888888'
  };

  const mockProduct = {
    name: 'Royal Banarasi Silk Saree',
    stock: 2
  };

  const mockOrder = {
    orderId: 'SS-10492',
    user: 'mock-user-123',
    items: [
      {
        product: 'prod_123',
        name: 'Royal Banarasi Silk Saree',
        quantity: 1,
        price: 850000, // ₹8,500 in paise
        color: 'Royal Crimson',
        size: 'N/A',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200'
      },
      {
        product: 'prod_456',
        name: 'Summer Chiffon Georgette Saree',
        quantity: 2,
        price: 450000, // ₹4,500 in paise
        color: 'Saffron Yellow',
        size: 'N/A',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=200'
      }
    ],
    shippingAddress: {
      name: 'Aditi Rao Hydari',
      email: targetEmail,
      phone: '918888888888',
      line1: 'Bungalow 4, Road 12, Jubilee Hills',
      line2: 'Near Lotus Pond',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033'
    },
    pricing: {
      subtotal: 1750000, // ₹17,500 in paise
      discount: 150000,  // ₹1,500 markdown
      couponDiscount: 100000, // ₹1,000 coupon
      shippingCharge: 0,
      total: 1500000 // ₹15,000 in paise
    },
    couponApplied: 'FESTIVE10',
    payment: {
      method: 'razorpay',
      transactionId: 'pay_Nz82lP91aBcsdK',
      status: 'paid'
    },
    status: 'pending',
    tracking: {
      courierName: 'Delhivery',
      trackingNumber: 'DEL194827103',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL194827103'
    }
  };

  // Run all triggers
  emailService.sendWelcomeEmail(mockUser);
  emailService.sendOrderPlacedEmail(mockOrder);
  emailService.sendPaymentSuccessfulEmail(mockOrder);
  emailService.sendOrderStatusEmail(mockOrder, 'confirmed');
  emailService.sendOrderStatusEmail(mockOrder, 'processing');
  emailService.sendOrderStatusEmail(mockOrder, 'packed');
  emailService.sendOrderStatusEmail(mockOrder, 'shipped');
  emailService.sendOrderStatusEmail(mockOrder, 'out_for_delivery');
  emailService.sendOrderStatusEmail(mockOrder, 'delivered');
  emailService.sendOrderCancelledEmail(mockOrder, 'Customer duplicate order placement');
  emailService.sendRefundInitiatedEmail(mockOrder);
  emailService.sendRefundCompletedEmail(mockOrder);
  emailService.sendPasswordResetEmail(targetEmail, 'http://localhost:3005/reset-password?token=test');
  emailService.sendEmailVerificationEmail(targetEmail, 'http://localhost:3005/verify-email?token=test');
  emailService.sendOtpEmail(targetEmail, '832951');

  // Admin Alerts
  emailService.sendAdminNewOrder(mockOrder);
  emailService.sendAdminNewCustomer(mockUser);
  emailService.sendAdminLargeOrder({ ...mockOrder, pricing: { ...mockOrder.pricing, total: 2500000 } });
  emailService.sendAdminPaymentFailure(mockOrder, 'Signature check failure: generated hash mismatch.');
  emailService.sendAdminRefundRequest(mockOrder, '[Return Request: refund] Reason: Color variance from image display.');
  emailService.sendAdminLowStockAlert(mockProduct, 'Main product (Royal Banarasi Silk Saree)', 4);

  // Marketing
  emailService.sendMarketingEmail('festival', targetEmail);
  emailService.sendMarketingEmail('flash', targetEmail);
  emailService.sendMarketingEmail('new_collection', targetEmail);
  emailService.sendMarketingEmail('abandoned_cart', targetEmail);
  emailService.sendMarketingEmail('wishlist_reminder', targetEmail);
  emailService.sendMarketingEmail('birthday', targetEmail);
  emailService.sendMarketingEmail('newsletter', targetEmail);

  res.json({ message: 'All 28 email templates triggered successfully' });
});

export default router;
