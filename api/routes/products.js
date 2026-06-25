import express from 'express';
import { Product, Category } from '../db/models.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET featured, bestseller, new arrival collections (Storefront homepage)
router.get('/collections', async (req, res) => {
  try {
    const featured = await Product.find({ isActive: true, isFeatured: true }).populate('category').limit(8);
    const bestsellers = await Product.find({ isActive: true, isBestseller: true }).populate('category').limit(8);
    const newArrivals = await Product.find({ isActive: true, isNewArrival: true }).populate('category').limit(8);
    res.json({ featured, bestsellers, newArrivals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all products with filtering, sorting, and pagination (Storefront shop page)
router.get('/', async (req, res) => {
  try {
    const {
      category, // category slug
      minPrice, // in INR
      maxPrice, // in INR
      fabric, // comma separated
      color, // comma separated
      size, // comma separated
      rating, // 3, 4 etc (minimum rating)
      inStock, // true/false
      discount, // 10, 25, 50 (minimum discount)
      sort,
      search,
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };

    // 1. Category filter
    if (category) {
      const catArray = category.split(',');
      const categories = await Category.find({ slug: { $in: catArray } });
      const catIds = categories.map(c => c._id);
      query.category = { $in: catIds };
    }

    // 2. Price filter (converting from INR to paise)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice) * 100;
      if (maxPrice) query.price.$lte = parseFloat(maxPrice) * 100;
    }

    // 3. Fabric filter
    if (fabric) {
      const fabricArray = fabric.split(',').map(f => new RegExp(f.trim(), 'i'));
      query.fabric = { $in: fabricArray };
    }

    // 4. Color filter (checked against variants.colorName or variants.colorHex)
    if (color) {
      const colorArray = color.split(',').map(c => new RegExp(c.trim(), 'i'));
      query['variants.colorName'] = { $in: colorArray };
    }

    // 5. Size filter
    if (size) {
      const sizeArray = size.split(',');
      query['variants.size'] = { $in: sizeArray };
    }

    // 6. Rating filter
    if (rating) {
      query['ratings.average'] = { $gte: parseFloat(rating) };
    }

    // 7. Stock filter
    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // 8. Discount filter (originalPrice - price) / originalPrice >= discount%
    if (discount) {
      const minDiscountRatio = parseFloat(discount) / 100;
      query.$expr = {
        $and: [
          { $gt: ['$originalPrice', 0] },
          { $gte: [
            { $divide: [{ $subtract: ['$originalPrice', '$price'] }, '$originalPrice'] },
            minDiscountRatio
          ]}
        ]
      };
    }

    // 9. Search filter (text index search or regex search)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort configurations
    let sortObj = { createdAt: -1 }; // default newest
    if (sort === 'price_asc') {
      sortObj = { price: 1 };
    } else if (sort === 'price_desc') {
      sortObj = { price: -1 };
    } else if (sort === 'rating') {
      sortObj = { 'ratings.average': -1 };
    } else if (sort === 'popular') {
      sortObj = { 'ratings.count': -1 };
    }

    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category')
      .sort(sortObj)
      .skip(skipCount)
      .limit(parseInt(limit));

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all products list for Admin CMS (without filters except search/category)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { search, category, status, stock, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
    if (stock === 'low') {
      query.stock = { $lt: 5 };
    } else if (stock === 'out') {
      query.stock = 0;
    }

    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(parseInt(limit));

    res.json({
      total,
      products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create product (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name, slug, category, description, fabric, careInstructions,
      occasionTags, styleTags, price, originalPrice, stock, weightGrams,
      sku, isActive, isFeatured, isBestseller, isNewArrival, images,
      variants, seo
    } = req.body;

    if (!name || !slug || !category || !price) {
      return res.status(400).json({ error: 'Name, slug, category, and price are required.' });
    }

    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Product slug already exists' });
    }

    const product = await Product.create({
      name, slug, category, description, fabric, careInstructions,
      occasionTags, styleTags,
      price: Math.round(parseFloat(price) * 100), // convert to paise
      originalPrice: originalPrice ? Math.round(parseFloat(originalPrice) * 100) : undefined, // convert to paise
      stock: stock || 0,
      weightGrams: weightGrams || 500,
      sku,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      isBestseller: isBestseller || false,
      isNewArrival: isNewArrival || false,
      images: images || [],
      variants: variants || [],
      seo: seo || { metaTitle: name, metaDescription: description?.replace(/<[^>]*>/g, '').substring(0, 160) }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update product (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const prodId = req.params.id;
    console.log('[PUT /products/:id] body keys:', Object.keys(req.body));
    console.log('[PUT /products/:id] isQuickUpdate:', req.body.isQuickUpdate);

    // Check if this is a quick status update
    if (req.body.isQuickUpdate === true) {
      const { isActive, stock } = req.body;
      console.log('[Quick Update] isActive:', isActive, 'stock:', stock);

      const product = await Product.findByIdAndUpdate(
        prodId,
        { $set: { isActive: Boolean(isActive), stock: Number(stock) } },
        { new: true, runValidators: false }
      ).populate('category');

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      console.log('[Quick Update] Success. isActive now:', product.isActive, 'stock:', product.stock);
      return res.json(product);
    }

    const {
      name, slug, category, description, fabric, careInstructions,
      occasionTags, styleTags, price, originalPrice, stock, weightGrams,
      sku, isActive, isFeatured, isBestseller, isNewArrival, images,
      variants, seo
    } = req.body;

    const existing = await Product.findOne({ slug, _id: { $ne: prodId } });
    if (existing) {
      return res.status(400).json({ error: 'Product slug already exists' });
    }

    // Convert prices to paise
    const updatedData = {
      name, slug, category, description, fabric, careInstructions,
      occasionTags, styleTags,
      price: Math.round(parseFloat(price) * 100),
      originalPrice: originalPrice ? Math.round(parseFloat(originalPrice) * 100) : undefined,
      stock: stock || 0,
      weightGrams: weightGrams || 500,
      sku,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      isBestseller: isBestseller || false,
      isNewArrival: isNewArrival || false,
      images: images || [],
      variants: variants || [],
      seo: seo || { metaTitle: name, metaDescription: description?.replace(/<[^>]*>/g, '').substring(0, 160) }
    };

    const product = await Product.findByIdAndUpdate(prodId, updatedData, { new: true, runValidators: true }).populate('category');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('[PUT /products/:id] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE product (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
