import express from 'express';
import { Coupon } from '../db/models.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET all active coupons (Storefront)
router.get('/active', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, validUntil: { $gte: new Date() } });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET validate a coupon (Storefront)
router.get('/validate/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const orderValue = parseFloat(req.query.orderValue || 0) * 100; // in paise

    const coupon = await Coupon.findOne({ code, isActive: true });
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code or coupon is inactive.' });
    }

    // Check dates
    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({ error: 'This coupon is not active yet.' });
    }
    if (now > coupon.validUntil) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }

    // Check uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'This coupon usage limit has been reached.' });
    }

    // Check min order value
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value of ₹${(coupon.minOrderValue / 100).toFixed(2)} is required to use this coupon.`
      });
    }

    // Calculate discount amount (in paise)
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round(orderValue * (coupon.value / 100));
    } else {
      discountAmount = coupon.value; // flat amount
    }

    // Cap discount amount to order total
    discountAmount = Math.min(discountAmount, orderValue);

    res.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmountINR: discountAmount / 100, // send back in INR for client convenience
      discountAmountPaise: discountAmount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all coupons (Admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create coupon (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxUses, validFrom, validUntil, isActive } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ error: 'Code, type, and value are required.' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    // Validate type and values
    let numericValue = parseFloat(value);
    if (type === 'flat') {
      numericValue = Math.round(numericValue * 100); // convert to paise
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value: numericValue,
      minOrderValue: minOrderValue ? Math.round(parseFloat(minOrderValue) * 100) : 0,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update coupon (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, minOrderValue, maxUses, validFrom, validUntil, isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    let numericValue = value !== undefined ? parseFloat(value) : coupon.value;
    if (type === 'flat' && value !== undefined) {
      numericValue = Math.round(numericValue * 100);
    } else if (type === 'percentage' && value !== undefined) {
      numericValue = parseFloat(value);
    }

    coupon.type = type || coupon.type;
    coupon.value = numericValue;
    if (minOrderValue !== undefined) {
      coupon.minOrderValue = Math.round(parseFloat(minOrderValue) * 100);
    }
    coupon.maxUses = maxUses !== undefined ? (maxUses ? parseInt(maxUses) : undefined) : coupon.maxUses;
    coupon.validFrom = validFrom ? new Date(validFrom) : coupon.validFrom;
    coupon.validUntil = validUntil ? new Date(validUntil) : coupon.validUntil;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE coupon (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    if (coupon.usedCount > 0) {
      return res.status(400).json({ error: 'Cannot delete a coupon that has already been used by customers. Deactivate it instead.' });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
