import express from 'express';
import { Category, Product } from '../db/models.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all active categories (Storefront)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all categories (Admin)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    
    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          productsCount: count
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create category (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, imageUrl, displayOrder, isActive } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Category slug already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      imageUrl,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update category (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, imageUrl, displayOrder, isActive } = req.body;
    const catId = req.params.id;

    const existing = await Category.findOne({ slug, _id: { $ne: catId } });
    if (existing) {
      return res.status(400).json({ error: 'Category slug already exists' });
    }

    const category = await Category.findByIdAndUpdate(
      catId,
      { name, slug, description, imageUrl, displayOrder, isActive },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const catId = req.params.id;

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: catId });
    if (productsCount > 0) {
      return res.status(400).json({ error: `Cannot delete category. It is assigned to ${productsCount} products.` });
    }

    const category = await Category.findByIdAndDelete(catId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
