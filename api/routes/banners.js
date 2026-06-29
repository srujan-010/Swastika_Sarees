import express from 'express';
import { Banner } from '../db/models.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET active banners (Storefront carousel)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .populate('productId')
      .sort({ displayOrder: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all banners (Admin panel)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const banners = await Banner.find()
      .populate('productId')
      .sort({ displayOrder: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add banner (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { 
      type, productId, selectedImage, layout, background, 
      overrideTitle, overrideSubtitle, secondaryButtonText, secondaryButtonLink, badge,
      title, subtitle, ctaText, ctaLink, imageUrl, displayOrder, isActive 
    } = req.body;

    if (type === 'custom' && !imageUrl) {
      return res.status(400).json({ error: 'Image URL is required for custom banners' });
    }
    if (type === 'product' && !productId) {
      return res.status(400).json({ error: 'Product ID is required for product banners' });
    }

    const banner = await Banner.create({
      type: type || 'custom',
      productId: productId || null,
      selectedImage,
      layout,
      background,
      overrideTitle,
      overrideSubtitle,
      secondaryButtonText,
      secondaryButtonLink,
      badge,
      title,
      subtitle,
      ctaText,
      ctaLink,
      imageUrl,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update banner (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      type, productId, selectedImage, layout, background, 
      overrideTitle, overrideSubtitle, secondaryButtonText, secondaryButtonLink, badge,
      title, subtitle, ctaText, ctaLink, imageUrl, displayOrder, isActive 
    } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      id,
      { 
        type: type || 'custom', 
        productId: productId || null, 
        selectedImage, 
        layout, 
        background, 
        overrideTitle, 
        overrideSubtitle, 
        secondaryButtonText, 
        secondaryButtonLink, 
        badge,
        title, 
        subtitle, 
        ctaText, 
        ctaLink, 
        imageUrl, 
        displayOrder, 
        isActive 
      },
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE banner (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
