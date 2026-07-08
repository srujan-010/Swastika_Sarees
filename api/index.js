import express from 'express';
import cors from 'cors';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
import popupRouter from './routes/popup.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';
import emailTestRouter from './routes/emailTest.js';
import { User, Order, Product, Lead } from './db/models.js';
import { initializeCronJobs } from './cron/dailyReport.js';

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


// Public Auth Endpoints
app.use('/api/auth', authRouter);

// Profile endpoints
app.get('/api/users/profile', requireAuth, async (req, res) => {
  try {
    let user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, phone, dob, gender, profilePhoto, newsletterPref, whatsappPref, walletBalance, savedCart, savedPayments, transactions } = req.body;
    
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (newsletterPref !== undefined) updateData.newsletterPref = newsletterPref;
    if (whatsappPref !== undefined) updateData.whatsappPref = whatsappPref;
    if (walletBalance !== undefined) updateData.walletBalance = walletBalance;
    if (savedCart !== undefined) updateData.savedCart = savedCart;
    if (savedPayments !== undefined) updateData.savedPayments = savedPayments;
    if (transactions !== undefined) updateData.transactions = transactions;

    const user = await User.findOneAndUpdate(
      { id: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/profile', requireAuth, async (req, res) => {
  try {
    await User.findOneAndDelete({ id: req.user.id });
    res.json({ message: 'Account deleted successfully' });
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
    const range = req.query.range || '30d';
    let dateLimit = new Date();
    if (range === 'today') dateLimit.setHours(0, 0, 0, 0);
    else if (range === '7d') dateLimit.setDate(dateLimit.getDate() - 7);
    else if (range === '12m') dateLimit.setMonth(dateLimit.getMonth() - 12);
    else dateLimit.setDate(dateLimit.getDate() - 30); // 30d default

    const prevDateLimit = new Date(dateLimit);
    if (range === 'today') prevDateLimit.setDate(prevDateLimit.getDate() - 1);
    else if (range === '7d') prevDateLimit.setDate(prevDateLimit.getDate() - 7);
    else if (range === '12m') prevDateLimit.setMonth(prevDateLimit.getMonth() - 12);
    else prevDateLimit.setDate(prevDateLimit.getDate() - 30);
    
    // 1. KPI Stats
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } });
    
    const revenueStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total / 100 : 0;

    const newCustomersCount = await User.countDocuments({ role: 'customer' });
    const totalProductsCount = await Product.countDocuments();
    const lowStockItemsCount = await Product.countDocuments({ stock: { $lt: 5 } });

    // Trends (vs previous period)
    const currentPeriodOrders = await Order.countDocuments({ createdAt: { $gte: dateLimit } });
    const prevPeriodOrders = await Order.countDocuments({ createdAt: { $gte: prevDateLimit, $lt: dateLimit } });
    
    const currRev = await Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: dateLimit } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const prevRev = await Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: prevDateLimit, $lt: dateLimit } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const currentRevenue = currRev.length ? currRev[0].total / 100 : 0;
    const previousRevenue = prevRev.length ? prevRev[0].total / 100 : 0;

    // 2. Revenue over time (daily stats)
    let groupFormat = "%Y-%m-%d";
    if (range === 'today') groupFormat = "%H:00";
    else if (range === '12m') groupFormat = "%Y-%m";
    
    const chartStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt", timezone: "Asia/Kolkata" } },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
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
    const categoryRevenue = categoryStats.map(cat => ({ name: cat._id, value: cat.revenue / 100 }));

    // 4. Top 5 selling products
    const topProductsStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);
    const topProducts = topProductsStats.map(p => ({
      name: p.name,
      image: p.image,
      unitsSold: p.unitsSold,
      revenue: p.revenue / 100
    }));

    // 5. Recent Orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName email').lean();

    // 6. Low Stock Products
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name images stock').limit(5).lean();

    // 7. Sales Heatmap (by Day of Week)
    const heatmapStats = await Order.aggregate([
      { $match: { 'payment.status': 'paid' } },
      {
        $group: {
          _id: { $dayOfWeek: { date: "$createdAt", timezone: "Asia/Kolkata" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$pricing.total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const daysMap = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const heatmap = heatmapStats.map(h => ({
      day: daysMap[h._id],
      orders: h.orders,
      revenue: h.revenue / 100
    }));

    // 8. Activity Feed (merge latest orders, products, users)
    const [latestOrders, latestProducts, latestUsers] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'firstName lastName').lean(),
      Product.find().sort({ createdAt: -1 }).limit(5).lean(),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).lean()
    ]);
    
    let activityFeed = [];
    latestOrders.forEach(o => activityFeed.push({ type: 'order', title: 'Order Placed', desc: `₹${(o.pricing.total/100).toLocaleString('en-IN')} by ${o.user?.firstName || 'Customer'}`, time: o.createdAt }));
    latestProducts.forEach(p => activityFeed.push({ type: 'product', title: 'Product Added', desc: p.name, time: p.createdAt }));
    latestUsers.forEach(u => activityFeed.push({ type: 'user', title: 'Customer Registered', desc: `${u.firstName} ${u.lastName}`, time: u.createdAt }));
    activityFeed.sort((a, b) => new Date(b.time) - new Date(a.time));
    activityFeed = activityFeed.slice(0, 10);

    // 9. Quick Insights
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const bestSellingCat = categoryRevenue.length > 0 ? categoryRevenue.sort((a,b)=>b.value-a.value)[0].name : 'N/A';
    
    const todaysRevStat = await Order.aggregate([
      { $match: { 'payment.status': 'paid', createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const todaysRevenue = todaysRevStat.length ? todaysRevStat[0].total / 100 : 0;

    const pendingPayStats = await Order.aggregate([
      { $match: { 'payment.status': 'pending' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    const pendingPayments = pendingPayStats.length ? pendingPayStats[0].total / 100 : 0;

    res.json({
      kpis: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        newCustomersCount,
        lowStockItemsCount,
        totalProductsCount,
        trends: {
          ordersCurrent: currentPeriodOrders,
          ordersPrev: prevPeriodOrders,
          revCurrent: currentRevenue,
          revPrev: previousRevenue
        }
      },
      dailyRevenue,
      categoryRevenue,
      topProducts,
      recentOrders,
      lowStockProducts,
      heatmap,
      activityFeed,
      insights: {
        aov,
        bestSellingCat,
        todaysRevenue,
        pendingPayments
      }
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
app.use('/api/popup', popupRouter);
app.use('/api/email-test', emailTestRouter);

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Initialize scheduled cron jobs
initializeCronJobs();

// Start Express server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
