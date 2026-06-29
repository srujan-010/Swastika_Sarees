import express from 'express';
import { PopupSetting } from '../db/models.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET popup settings (Public - for customer storefront)
router.get('/', async (req, res) => {
  try {
    let setting = await PopupSetting.findOne();
    if (!setting) {
      setting = await PopupSetting.create({
        benefits: [
          { icon: 'Heart', title: 'Save Wishlist', isEnabled: true },
          { icon: 'Package', title: 'Track Orders', isEnabled: true },
          { icon: 'Zap', title: 'Fast Checkout', isEnabled: true },
          { icon: 'Gift', title: 'Exclusive Offers', isEnabled: true }
        ]
      });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all settings (Admin)
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    let setting = await PopupSetting.findOne();
    if (!setting) {
      setting = await PopupSetting.create({
        benefits: [
          { icon: 'Heart', title: 'Save Wishlist', isEnabled: true },
          { icon: 'Package', title: 'Track Orders', isEnabled: true },
          { icon: 'Zap', title: 'Fast Checkout', isEnabled: true },
          { icon: 'Gift', title: 'Exclusive Offers', isEnabled: true }
        ]
      });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update popup settings (Admin)
router.put('/', requireAdmin, async (req, res) => {
  try {
    let setting = await PopupSetting.findOne();
    
    if (!setting) {
      setting = await PopupSetting.create(req.body);
    } else {
      setting = await PopupSetting.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
