import express from 'express';
import { Product, Category, Setting } from '../db/models.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// --- Image Normalization Utility ---
const sortImages = (images) => {
  if (!images || !Array.isArray(images)) return images;
  return [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    const orderA = a.displayOrder !== undefined ? a.displayOrder : 9999;
    const orderB = b.displayOrder !== undefined ? b.displayOrder : 9999;
    return orderA - orderB;
  });
};

const normalizeProductImages = (product) => {
  if (!product) return product;
  const p = product.toObject ? product.toObject() : product;
  
  if (p.images) p.images = sortImages(p.images);
  if (p.mainProduct?.images) p.mainProduct.images = sortImages(p.mainProduct.images);
  
  if (p.variants && Array.isArray(p.variants)) {
    p.variants = p.variants.map(v => ({
      ...v,
      images: sortImages(v.images)
    }));
  }
  return p;
};

// GET featured, bestseller, new arrival collections (Storefront homepage)
router.get('/collections', async (req, res) => {
  try {
    let featuredQuery = { isActive: true, isFeatured: true };
    
    // Check if a specific category is configured as the featured collection
    const settings = await Setting.findOne();
    if (settings && settings.homeFeaturedCategory) {
      featuredQuery = { isActive: true, category: settings.homeFeaturedCategory };
    }

    const featured = await Product.find(featuredQuery).populate('category').limit(8);
    const bestsellers = await Product.find({ isActive: true, isBestseller: true }).populate('category').limit(8);
    const newArrivals = await Product.find({ isActive: true, isNewArrival: true }).populate('category').limit(8);
    res.json({ 
      featured: featured.map(normalizeProductImages), 
      bestsellers: bestsellers.map(normalizeProductImages), 
      newArrivals: newArrivals.map(normalizeProductImages) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all products with filtering, sorting, and pagination (Storefront shop page)
router.get('/', async (req, res) => {
  try {
    const {
      category, subcategory, minPrice, maxPrice, fabric, color, size, rating, inStock, discount, sort, search, page = 1, limit = 12
    } = req.query;

    const query = { isActive: true };
    const andClauses = [];

    if (subcategory) {
      query.subCategory = subcategory;
    }

    if (category) {
      const catArray = category.split(',');
      const categories = await Category.find({ slug: { $in: catArray } });
      const catIds = categories.map(c => c._id);
      query.category = { $in: catIds };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice) * 100;
      if (maxPrice) query.price.$lte = parseFloat(maxPrice) * 100;
    }

    if (fabric) {
      const fabricArray = fabric.split(',').map(f => new RegExp(f.trim(), 'i'));
      query.fabric = { $in: fabricArray };
    }

    if (color) {
      const colorArray = color.split(',').map(c => new RegExp(c.trim(), 'i'));
      andClauses.push({
        $or: [
          { 'variants.colorName': { $in: colorArray } },
          { 'mainProduct.primaryColor.name': { $in: colorArray } },
          { 'colorName': { $in: colorArray } }
        ]
      });
    }

    if (size) {
      const sizeArray = size.split(',');
      query['variants.sizes.size'] = { $in: sizeArray };
    }

    if (rating) {
      query['ratings.average'] = { $gte: parseFloat(rating) };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

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

    if (search) {
      const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      const matchingCategories = await Category.find({ name: searchRegex });
      const matchingCatIds = matchingCategories.map(c => c._id);

      andClauses.push({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { fabric: searchRegex },
          { occasionTags: searchRegex },
          { styleTags: searchRegex },
          { category: { $in: matchingCatIds } }
        ]
      });
    }

    if (andClauses.length > 0) {
      query.$and = andClauses;
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { 'ratings.average': -1 };
    else if (sort === 'popular') sortObj = { 'ratings.count': -1 };

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
      products: products.map(normalizeProductImages)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET available filters based on current search context
router.get('/filters', async (req, res) => {
  try {
    const {
      category, subcategory, minPrice, maxPrice, fabric, color, size, rating, inStock, discount, search
    } = req.query;

    const buildQuery = async (excludeDimension = null) => {
      const query = { isActive: true };
      const andClauses = [];

      if (subcategory && excludeDimension !== 'subcategory') {
        query.subCategory = subcategory;
      }

      if (category && excludeDimension !== 'category') {
        const catArray = category.split(',');
        const categories = await Category.find({ slug: { $in: catArray } });
        const catIds = categories.map(c => c._id);
        query.category = { $in: catIds };
      }

      if ((minPrice || maxPrice) && excludeDimension !== 'price') {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice) * 100;
        if (maxPrice) query.price.$lte = parseFloat(maxPrice) * 100;
      }

      if (fabric && excludeDimension !== 'fabric') {
        const fabricArray = fabric.split(',').map(f => new RegExp(f.trim(), 'i'));
        query.fabric = { $in: fabricArray };
      }

      if (color && excludeDimension !== 'color') {
        const colorArray = color.split(',').map(c => new RegExp(c.trim(), 'i'));
        andClauses.push({
          $or: [
            { 'variants.colorName': { $in: colorArray } },
            { 'mainProduct.primaryColor.name': { $in: colorArray } },
            { 'colorName': { $in: colorArray } }
          ]
        });
      }

      if (size && excludeDimension !== 'size') {
        const sizeArray = size.split(',');
        query['variants.size'] = { $in: sizeArray };
      }

      if (rating && excludeDimension !== 'rating') {
        query['ratings.average'] = { $gte: parseFloat(rating) };
      }

      if (inStock === 'true' && excludeDimension !== 'inStock') {
        query.stock = { $gt: 0 };
      }

      if (discount && excludeDimension !== 'discount') {
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

      if (search && excludeDimension !== 'search') {
        const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const searchRegex = new RegExp(escapedSearch, 'i');
        const matchingCategories = await Category.find({ name: searchRegex });
        const matchingCatIds = matchingCategories.map(c => c._id);

        andClauses.push({
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { fabric: searchRegex },
            { occasionTags: searchRegex },
            { styleTags: searchRegex },
            { category: { $in: matchingCatIds } }
          ]
        });
      }

      if (andClauses.length > 0) {
        query.$and = andClauses;
      }

      return query;
    };

    const categoryQuery = await buildQuery('category');
    const categoryIds = await Product.distinct('category', categoryQuery);
    const availableCategories = await Category.find({ _id: { $in: categoryIds } });

    const subcatQuery = await buildQuery('subcategory');
    const availableTypes = await Product.distinct('subCategory', subcatQuery);

    const fabricQuery = await buildQuery('fabric');
    const availableFabrics = await Product.distinct('fabric', fabricQuery);

    const sizeQuery = await buildQuery('size');
    const availableSizes = await Product.distinct('variants.size', sizeQuery);

    const colorQuery = await buildQuery('color');
    const colorAgg = await Product.aggregate([
      { $match: colorQuery },
      {
        $project: {
          colors: {
            $concatArrays: [
              [{ name: "$mainProduct.primaryColor.name", hex: "$mainProduct.primaryColor.hex" }],
              [{ name: "$colorName", hex: "$colorHex" }],
              { $ifNull: [ { $map: { input: "$variants", as: "v", in: { name: "$$v.colorName", hex: "$$v.colorHex" } } }, [] ] }
            ]
          }
        }
      },
      { $unwind: "$colors" },
      { $match: { "colors.name": { $nin: [null, ""] } } },
      {
        $group: {
          _id: { $toLower: "$colors.name" },
          name: { $first: "$colors.name" },
          hex: { $first: "$colors.hex" }
        }
      },
      { $project: { _id: 0, name: 1, hex: 1 } }
    ]);

    const availableColors = colorAgg.filter(c => c.name);

    res.json({
      categories: availableCategories,
      types: availableTypes.filter(Boolean),
      fabrics: availableFabrics.filter(Boolean),
      sizes: availableSizes.filter(Boolean),
      colors: availableColors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all products list for Admin CMS (without filters except search/category)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { search, category, subcategory, status, stock, page = 1, limit = 10 } = req.query;
    const query = {};

    if (subcategory) {
      query.subCategory = subcategory;
    }

    if (search) {
      const escapedSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      
      // Find matching categories to support searching by category name
      const matchingCategories = await Category.find({ name: searchRegex });
      const matchingCatIds = matchingCategories.map(c => c._id);

      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { fabric: searchRegex },
        { occasionTags: searchRegex },
        { styleTags: searchRegex },
        { category: { $in: matchingCatIds } }
      ];
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
      products: products.map(normalizeProductImages)
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
    res.json(normalizeProductImages(product));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new product (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    console.log('[DEBUG] POST /api/products req.body:', JSON.stringify(req.body, null, 2));
    
    const {
      name, slug, category, subCategory, brand, description, fabric, careInstructions,
      occasionTags, styleTags, price, originalPrice, stock, weightGrams,
      sku, isActive, isFeatured, isBestseller, isNewArrival, images,
      variants, seo, productVideo, productHighlights, availability, dispatchTime,
      colorName, colorHex, mainProduct, specifications
    } = req.body;

    if (!name || !slug || !category || !price) {
      return res.status(400).json({ error: 'Name, slug, category, and price are required.' });
    }

    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Product slug already exists' });
    }

    if (variants && variants.length > 0) {
      for (const v of variants) {
        if (v.availability === "") {
          delete v.availability;
        }
      }
    }

    const productData = {
      name, slug, category, subCategory, description, fabric, careInstructions,
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
      images: images || [], // Legacy fallback
      mainProduct: mainProduct || {
        primaryColor: { name: colorName || '', hex: colorHex || '' },
        images: images || [],
        primaryImage: images?.[0]?.url || '',
        video: productVideo || ''
      },
      variants: variants || [],
      seo: seo || { metaTitle: name, metaDescription: description?.replace(/<[^>]*>/g, '').substring(0, 160) },
      brand, productVideo, productHighlights, dispatchTime,
      colorName, colorHex, specifications: specifications || {}
    };

    if (availability !== "") {
      productData.availability = availability;
    }

    const product = await Product.create(productData);

    console.log('[DEBUG] POST /api/products savedProduct:', JSON.stringify(product, null, 2));

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update product (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const prodId = req.params.id;
    console.log(`[DEBUG] PUT /api/products/${prodId} req.body:`, JSON.stringify(req.body, null, 2));
    
    // Quick stock/status update
    if (req.body.isQuickUpdate) {
      const updated = await Product.findByIdAndUpdate(
        prodId,
        { isActive: req.body.isActive, stock: req.body.stock },
        { new: true }
      );
      return res.json(normalizeProductImages(updated));
    }

    const {
      name, slug, category, subCategory, brand, description, fabric, careInstructions,
      occasionTags, styleTags, price, originalPrice, stock, weightGrams,
      sku, isActive, isFeatured, isBestseller, isNewArrival, images,
      variants, seo, productVideo, productHighlights, availability, dispatchTime,
      colorName, colorHex, mainProduct, specifications
    } = req.body;

    const existing = await Product.findOne({ slug, _id: { $ne: prodId } });
    if (existing) {
      return res.status(400).json({ error: 'Product slug already exists' });
    }

    if (variants && variants.length > 0) {
      for (const v of variants) {
        // Remove empty enum values to prevent Mongoose validation errors
        if (v.availability === "") {
          delete v.availability;
        }
      }
    }

    // Convert prices to paise
    const updatedData = {
      name, slug, category, subCategory, description, fabric, careInstructions,
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
      mainProduct: mainProduct || {
        primaryColor: { name: colorName || '', hex: colorHex || '' },
        images: images || [],
        primaryImage: images?.[0]?.url || '',
        video: productVideo || ''
      },
      variants: variants || [],
      seo: seo || { metaTitle: name, metaDescription: description?.replace(/<[^>]*>/g, '').substring(0, 160) },
      brand, productVideo, productHighlights, dispatchTime,
      colorName, colorHex, specifications: specifications || {}
    };

    if (availability !== "") {
      updatedData.availability = availability;
    }

    const product = await Product.findByIdAndUpdate(prodId, updatedData, { new: true, runValidators: true }).populate('category');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`[DEBUG] PUT /api/products/${prodId} updatedProduct:`, JSON.stringify(product, null, 2));

    res.json(normalizeProductImages(product));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  console.log('[DELETE /products/:id] Request received for ID:', req.params.id);
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log('[DELETE /products/:id] Product not found:', req.params.id);
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('[DELETE /products/:id] Product deleted successfully:', req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('[DELETE /products/:id] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
