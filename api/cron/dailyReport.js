import cron from 'node-cron';
import { Order, Product } from '../db/models.js';
import { sendDailySalesReport } from '../services/emailService.js';

export function initializeCronJobs() {
  // Run every night at 11:59 PM (59 23 * * *)
  cron.schedule('59 23 * * *', async () => {
    try {
      console.log('[Cron] Starting Daily Sales Report job...');
      
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const todayOrders = await Order.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      const revenue = todayOrders.reduce((sum, order) => {
        if (order.payment?.status === 'paid' || order.payment?.method === 'cod') {
          return sum + (order.pricing?.total || 0);
        }
        return sum;
      }, 0);
      
      const onlineOrders = todayOrders.filter(o => o.payment?.method !== 'cod').length;
      const codOrders = todayOrders.filter(o => o.payment?.method === 'cod').length;
      const cancelledOrders = todayOrders.filter(o => o.status === 'cancelled').length;
      
      // Calculate pending orders (not just today, all unresolved)
      const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'processing', 'confirmed', 'packed'] } });
      
      // Calculate top selling products today
      const productSales = {};
      todayOrders.forEach(order => {
        if (order.status !== 'cancelled') {
          order.items?.forEach(item => {
            if (!productSales[item.product]) {
              productSales[item.product] = { name: item.name, sales: 0 };
            }
            productSales[item.product].sales += item.quantity;
          });
        }
      });
      
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
        
      // Low stock products
      const lowStockProductsDb = await Product.find({ 'inventory.stock': { $lt: 5 } }).limit(5);
      const lowStockProducts = lowStockProductsDb.map(p => ({
        name: p.name,
        stock: p.inventory?.stock || 0
      }));
      
      const reportData = {
        revenue,
        totalOrders: todayOrders.length,
        onlineOrders,
        codOrders,
        cancelledOrders,
        pendingOrders,
        topProducts,
        lowStockProducts
      };
      
      sendDailySalesReport(reportData);
      console.log('[Cron] Daily Sales Report sent successfully.');
    } catch (error) {
      console.error('[Cron] Error generating daily sales report:', error);
    }
  });
  
  console.log('[Cron] Initialized scheduled jobs (Daily Sales Report at 11:59 PM)');
}
