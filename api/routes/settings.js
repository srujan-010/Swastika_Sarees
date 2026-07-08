import express from 'express';
import { Setting } from '../db/models.js';
import { requireAdmin } from '../middleware/auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// GET settings (Public - masks payment secrets)
router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      // Create defaults if not exists
      setting = await Setting.create({});
    }

    const cleanSettings = setting.toObject();
    // NEVER expose secrets to storefront
    delete cleanSettings.razorpaySecret;
    
    // Fallback to environment variable if not set in database settings
    cleanSettings.razorpayKeyId = cleanSettings.razorpayKeyId || process.env.VITE_RAZORPAY_KEY_ID || '';
    
    res.json(cleanSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all settings (Admin - includes secrets)
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    const adminSettings = setting.toObject();
    // Fallback to environment variables if not set in database settings
    adminSettings.razorpayKeyId = adminSettings.razorpayKeyId || process.env.VITE_RAZORPAY_KEY_ID || '';
    adminSettings.razorpaySecret = adminSettings.razorpaySecret || process.env.RAZORPAY_SECRET || '';
    res.json(adminSettings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update settings (Admin)
router.put('/', requireAdmin, async (req, res) => {
  try {
    let setting = await Setting.findOne();
    
    // Process tags or list formatting if needed
    if (req.body.nonServiceablePincodes && typeof req.body.nonServiceablePincodes === 'string') {
      req.body.nonServiceablePincodes = req.body.nonServiceablePincodes
        .split(',')
        .map(p => p.trim())
        .filter(Boolean);
    }

    // Convert INR charges to paise if fields were entered in INR in the admin view
    const data = { ...req.body };
    if (data.freeShippingThreshold !== undefined) {
      data.freeShippingThreshold = Math.round(parseFloat(data.freeShippingThreshold) * 100);
    }
    if (data.flatShippingRate !== undefined) {
      data.flatShippingRate = Math.round(parseFloat(data.flatShippingRate) * 100);
    }
    if (data.codExtraCharge !== undefined) {
      data.codExtraCharge = Math.round(parseFloat(data.codExtraCharge) * 100);
    }

    if (!setting) {
      setting = await Setting.create(data);
    } else {
      setting = await Setting.findOneAndUpdate({}, data, { new: true, runValidators: true });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
