import express from 'express';
import cors from 'cors';
import { connectDB } from './db/db.js';
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import couponsRouter from './routes/coupons.js';
import reviewsRouter from './routes/reviews.js';
import bannersRouter from './routes/banners.js';
import settingsRouter from './routes/settings.js';
import aiRouter from './routes/ai.js';
import ordersRouter from './routes/orders.js';
import uploadRouter from './routes/upload.js';
import { requireAuth } from './middleware/auth.js';
import { User, Order, Product, Lead } from './db/models.js';

const app = express();

app.use(cors());
app.use(express.json());

let isSeeded = false;

// Initialize DB connection middleware for all routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!isSeeded) {
      isSeeded = true;
      const { autoSeedDB } = await import('./db/seed.js');
      autoSeedDB().catch(err => console.error('Database auto seed failed:', err));
    }
    next();
  } catch (error) {
    console.error('Database pre-connect failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});


// Profile endpoints
app.get('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findOneAndUpdate(
      { id: req.user.id },
      { fullName, phone },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manage Addresses
app.post('/api/users/addresses', requireAuth, async (req, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push({ name, phone, line1, line2, city, state, pincode, isDefault });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ error: 'Address not found' });

    address.name = name || address.name;
    address.phone = phone || address.phone;
    address.line1 = line1 || address.line1;
    address.line2 = line2 || address.line2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/addresses/:addressId', requireAuth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User profile not found' });

    user.addresses.pull({ _id: addressId });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Analytics Dashboard
app.get('/api/admin/analytics', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Admin privileges required' });
  }
  try {
    // 1. KPI Stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } });
    
    // Total Revenue (paise to INR)
    const revenueStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total / 100 : 0;

    const newCustomersCount = await User.countDocuments({ role: 'customer' });
    const lowStockItemsCount = await Product.countDocuments({ stock: { $lt: 5 } });

    // 2. Revenue over time (daily stats)
    const chartStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    const dailyRevenue = chartStats.map(c => ({
      date: c._id,
      revenue: c.revenue / 100,
      orders: c.orders
    }));

    // 3. Category revenue distribution
    const categoryStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]);

    const categoryRevenue = categoryStats.map(cat => ({
      name: cat._id,
      value: cat.revenue / 100
    }));

    // 4. Top 5 selling products
    const topProductsStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    const topProducts = topProductsStats.map(p => ({
      name: p._id,
      unitsSold: p.unitsSold,
      revenue: p.revenue / 100
    }));

    res.json({
      kpis: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        newCustomersCount,
        lowStockItemsCount
      },
      dailyRevenue,
      categoryRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Customers list
app.get('/api/admin/customers', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied' });
  }
  try {
    const { search } = req.query;
    const query = { role: 'customer' };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 });

    const customersWithStats = await Promise.all(
      customers.map(async (cust) => {
        const orders = await Order.find({ user: cust.id });
        const ordersCount = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.pricing.total / 100), 0);
        return {
          ...cust.toObject(),
          ordersCount,
          totalSpent
        };
      })
    );

    res.json(customersWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/customers/:id/role', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied' });
  }
  try {
    const { role } = req.body;
    const user = await User.findOneAndUpdate({ id: req.params.id }, { role }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leads endpoints for marketing popup
app.post('/api/leads', async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }
    const lead = await Lead.create({ email, phone });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/leads', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied: Admin privileges required' });
  }
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mount child routers
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);

// Start Express server locally in development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}
export default app;
