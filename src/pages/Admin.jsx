import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FolderHeart, ListOrdered, Users, Ticket, Image,
  MessageSquare, BarChart3, Settings, ShieldAlert, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, Upload, X, Star, Mail, Sparkles, Bot, Loader2, RefreshCw, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, IndianRupee, Clock, Package, AlertTriangle, Bell, Search, Activity, Box, Download, Filter, Printer, Truck, Phone, MapPin, Calendar, CreditCard, FileText, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal, Layers, LogOut, Copy
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProductAI } from '../hooks/useProductAI';
import { detectVariantColor } from '../services/ai/colorDetection';
import { uploadFileWithProgress } from '../utils/uploadHelpers';
import AdminLayout from '../layouts/AdminLayout';
import ProductSizeEditor from '../components/ProductSizeEditor';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { useModalStore } from '../store/modalStore';
import AdminBannerForm from '../components/admin/AdminBannerForm';
import AdminPopupSettings from '../components/admin/AdminPopupSettings';
import OrdersDashboard from '../components/admin/OrdersDashboard';

export default function Admin() {
  const navigate = useNavigate();
  const { user, token, login, loginMock, fetchProfile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Admin Login States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  // Sync profile details on mount
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);

    try {
      // Check default sandbox credentials
      if (adminEmail === 'admin@swastikasarees.com' && adminPassword === 'admin123') {
        await loginMock('admin');
        setAdminLoginLoading(false);
        return;
      }

      // Try standard database login
      const success = await login(adminEmail, adminPassword);
      if (success) {
        // Fetch MongoDB user details
        await fetchProfile();
        // Access state directly to confirm updated user details
        const updatedUser = useAuthStore.getState().user;
        if (!updatedUser || updatedUser.role !== 'admin') {
          await logout();
          setAdminLoginError('Access Denied: This account does not have administrator privileges.');
        }
      } else {
        setAdminLoginError('Invalid administrative email or password.');
      }
    } catch (err) {
      setAdminLoginError('Failed to verify admin credentials.');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  // Render Admin Login Gate if not authenticated as Admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-brand-cream/45 flex items-center justify-center px-4 py-12 select-none font-sans text-xs">
        <div className="max-w-md w-full bg-brand-white border border-brand-border p-8 rounded-2xl shadow-lg space-y-6">
          <div className="text-center">
            <span className="font-display font-bold text-brand-dark text-xl sm:text-2xl block text-shimmer">Swastika Sarees</span>
            <span className="text-2xs uppercase tracking-wider font-sans text-brand-muted block mt-1">Administrator Access Control</span>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Admin Email Address *</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@swastikasarees.com"
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Admin Password *</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
                required
              />
            </div>

            {adminLoginError && (
              <div className="bg-red-50 border border-brand-crimson/20 p-3 rounded-lg text-brand-crimson font-semibold">
                {adminLoginError}
              </div>
            )}

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-3 rounded-lg font-semibold transition-colors border border-brand-gold/30 shadow-md text-xs sm:text-sm"
            >
              {adminLoginLoading ? 'Verifying Credentials...' : 'Authenticate Admin'}
            </button>
          </form>

          <div className="border-t border-brand-border/60 pt-4 text-center select-text">
            <span className="text-3xs text-brand-muted font-sans uppercase">
              Secure administrative gateway credentials required.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} user={user} logout={logout}>
        {/* Tab 0: Access Denied */}
        {activeTab === 'denied' && <DeniedView />}

        {/* Tab 1: Dashboard Analytics */}
        {activeTab === 'dashboard' && <DashboardView token={token} />}

        {/* Tab 2: Product Management */}
        {activeTab === 'products' && <ProductsView token={token} />}

        {/* Tab 3: Category Management */}
        {activeTab === 'categories' && <CategoriesView token={token} />}

        {/* Tab 4: Orders Management */}
        {activeTab === 'orders' && <OrdersDashboard token={token} />}

        {/* Tab 5: Customers List */}
        {activeTab === 'customers' && <CustomersView token={token} />}

        {/* Tab 6: Coupons Management */}
        {activeTab === 'coupons' && <CouponsView token={token} />}

        {/* Tab 7: Reviews Moderation */}
        {activeTab === 'reviews' && <ReviewsView token={token} />}

        {/* Tab 9: Homepage Custom Content */}
        {activeTab === 'homepage' && <HomepageView token={token} />}

        {/* Tab 8: Settings Management */}
        {activeTab === 'settings' && <SettingsView token={token} />}

        {/* Tab 10: Marketing Leads */}
        {activeTab === 'leads' && <LeadsView token={token} />}

        {/* Tab 11: Popup Settings */}
        {activeTab === 'popup' && <AdminPopupSettings token={token} />}
    </AdminLayout>
  );
}

// ---------------------------------------------------------
// INNER VIEWS FOR ADMIN DASHBOARD
// ---------------------------------------------------------

function DeniedView() {
  return (
    <div className="max-w-md mx-auto py-20 text-center select-none flex flex-col items-center">
      <ShieldAlert className="text-brand-crimson mb-4 animate-bounce" size={48} />
      <h2 className="font-display font-bold text-brand-dark text-xl sm:text-2xl mb-2">Access Denied</h2>
      <p className="text-xs text-brand-muted mb-6 leading-relaxed font-sans">
        You do not have administrative privileges to access the Swastika Sarees CMS backend dashboard. Please contact site owners for credential upgrades.
      </p>
      <Link to="/" className="bg-brand-crimson text-brand-cream text-2xs font-semibold px-6 py-2.5 rounded-lg border shadow-md font-sans">Back To Storefront</Link>
    </div>
  );
}

// -----------------------
// 1. DASHBOARD VIEW
// -----------------------
function DashboardView({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?range=${timeRange}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch analytics error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [token, timeRange]);

  if (loading && !data) return (
    <div className="flex items-center justify-center h-[70vh]">
      <Loader2 size={40} className="animate-spin text-brand-dark" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
      <AlertTriangle className="text-brand-crimson mb-2" size={32} />
      <h3 className="font-semibold text-brand-dark">Failed to load analytics</h3>
      <p className="text-xs text-brand-muted mt-1">{error}</p>
    </div>
  );

  const kpis = data?.kpis || {};
  const trends = kpis.trends || {};
  
  // Helpers
  const calcTrend = (curr, prev) => {
    if (!prev) return curr > 0 ? '+100%' : '0%';
    const diff = ((curr - prev) / prev) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };
  const isPositive = (curr, prev) => curr >= prev;

  const revTrend = calcTrend(trends.revCurrent, trends.revPrev);
  const ordTrend = calcTrend(trends.ordersCurrent, trends.ordersPrev);
  const revPos = isPositive(trends.revCurrent, trends.revPrev);
  const ordPos = isPositive(trends.ordersCurrent, trends.ordersPrev);

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  const COLORS = ['#8B1A1A', '#C8832A', '#2C3E50', '#E8A84C', '#6B3A3A'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs z-50 relative">
          <p className="font-bold text-gray-800 mb-1">{label}</p>
          {payload.map(p => (
            <p key={p.dataKey} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }}></span>
              <span className="text-gray-600 font-medium capitalize">{p.dataKey}:</span>
              <span className="font-bold text-gray-900">{p.dataKey === 'revenue' ? `₹${formatINR(p.value)}` : p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 text-left font-sans text-gray-900 max-w-[1600px] mx-auto pb-10">
      
      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between bg-white p-6 rounded-[18px] shadow-sm border border-gray-100 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-gray-900">Good Morning, Admin 👋</h2>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Clock size={14} /> Today: {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="bg-gray-50 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"><Search size={20} className="text-gray-600"/></div>
          <div className="bg-gray-50 p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors relative">
            <Bell size={20} className="text-gray-600"/>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-black text-white flex items-center justify-center font-bold shadow-md cursor-pointer">
            AD
          </div>
        </div>
      </div>

      {/* FIRST ROW - KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: 'Total Revenue', value: `₹${formatINR(kpis.totalRevenue)}`, trend: revTrend, pos: revPos, icon: <IndianRupee size={20} />, sub: 'vs last period' },
          { title: 'Total Orders', value: formatINR(kpis.totalOrders), trend: ordTrend, pos: ordPos, icon: <ShoppingBag size={20} />, sub: 'vs last period' },
          { title: 'Pending Orders', value: kpis.pendingOrders, trend: 'Needs Attention', pos: false, icon: <Clock size={20} />, warn: true },
          { title: 'New Customers', value: formatINR(kpis.newCustomersCount), trend: '+ Active', pos: true, icon: <Users size={20} /> },
          { title: 'Low Stock', value: kpis.lowStockItemsCount, trend: 'Products', pos: kpis.lowStockItemsCount === 0, icon: <AlertTriangle size={20} />, warn: kpis.lowStockItemsCount > 0 },
          { title: 'Total Products', value: formatINR(kpis.totalProductsCount), trend: 'Live', pos: true, icon: <Package size={20} /> }
        ].map((k, i) => (
          <div key={i} className="bg-white p-5 rounded-[18px] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50 z-0"></div>
            <div className="relative z-10 flex justify-between items-start mb-4">
              <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                {k.icon}
              </span>
              <div className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 ${k.warn ? 'bg-orange-100 text-orange-700' : k.pos ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {k.pos && !k.warn ? <TrendingUp size={12}/> : k.warn ? null : <TrendingDown size={12}/>}
                {k.trend}
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-sm font-semibold text-gray-500 mb-1">{k.title}</div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SECOND ROW - ANALYTICS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Revenue Analytics */}
        <div className="lg:col-span-2 bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
              <p className="text-xs font-medium text-gray-500 mt-1">Order and sales trends over time</p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-lg">
              {['today', '7d', '30d', '12m'].map(t => (
                <button 
                  key={t} onClick={() => setTimeRange(t)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${timeRange === t ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {t === 'today' ? 'Today' : t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '12 Months'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full h-[300px]">
            {data.dailyRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#111" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8832A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#C8832A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dx={-10} tickFormatter={(v) => `₹${v/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dx={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#111" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#C8832A" strokeWidth={2} fillOpacity={1} fill="url(#colorOrd)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <BarChart3 size={32} className="text-gray-300 mb-2" />
                <span className="text-sm font-medium text-gray-400">No chart data available</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h3>
          <p className="text-xs font-medium text-gray-500 mb-6">Manage your store efficiently</p>
          
          <div className="flex-1 grid grid-cols-1 gap-3">
            <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group bg-gradient-to-r from-gray-50 to-white text-left">
              <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center group-hover:scale-105 transition-transform"><Plus size={18}/></div>
              <div>
                <div className="text-sm font-bold text-gray-900">Add Product</div>
                <div className="text-[10px] text-gray-500 font-medium">Create a new listing</div>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:text-black transition-colors" />
            </button>
            <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group bg-gradient-to-r from-gray-50 to-white text-left">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-700 flex items-center justify-center group-hover:scale-105 transition-transform"><FolderHeart size={18}/></div>
              <div>
                <div className="text-sm font-bold text-gray-900">Add Category</div>
                <div className="text-[10px] text-gray-500 font-medium">Organize collections</div>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:text-black transition-colors" />
            </button>
            <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group bg-gradient-to-r from-gray-50 to-white text-left">
              <div className="w-10 h-10 rounded-lg bg-[#C8832A]/10 text-[#C8832A] flex items-center justify-center group-hover:scale-105 transition-transform"><Ticket size={18}/></div>
              <div>
                <div className="text-sm font-bold text-gray-900">Create Coupon</div>
                <div className="text-[10px] text-gray-500 font-medium">Generate promo codes</div>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:text-black transition-colors" />
            </button>
            <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group bg-gradient-to-r from-gray-50 to-white text-left">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform"><Image size={18}/></div>
              <div>
                <div className="text-sm font-bold text-gray-900">Homepage Banner</div>
                <div className="text-[10px] text-gray-500 font-medium">Update storefront</div>
              </div>
              <ArrowUpRight size={16} className="ml-auto text-gray-400 group-hover:text-black transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* THIRD ROW - ORDERS & LOW STOCK */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <p className="text-xs font-medium text-gray-500">Latest transactions</p>
            </div>
            <button className="text-sm font-bold text-gray-600 hover:text-black px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">View All</button>
          </div>
          
          {data.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                          {order.user?.firstName?.[0] || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{order.user?.firstName} {order.user?.lastName}</div>
                          <div className="text-[10px] text-gray-500">{order.user?.email || 'Guest'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-900">₹{formatINR(order.pricing?.total / 100)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="py-12 flex flex-col items-center justify-center text-gray-400">
               <Package size={32} className="mb-3 opacity-50" />
               <p className="text-sm font-medium">No recent orders found</p>
             </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Low Stock</h3>
              <p className="text-xs font-medium text-gray-500">Items needing attention</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">{data.lowStockProducts?.length || 0}</div>
          </div>

          <div className="flex-1 space-y-4">
            {data.lowStockProducts?.length > 0 ? (
              data.lowStockProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    <img src={prod.images?.[0] || 'https://via.placeholder.com/150'} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{prod.name}</div>
                    <div className="text-[10px] font-medium text-red-500 flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={10} /> {prod.stock} remaining
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 shadow-sm hover:scale-105">
                    Restock
                  </button>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                <CheckCircle2 size={32} className="mb-3 text-emerald-400 opacity-80" />
                <p className="text-sm font-medium">Inventory looks healthy</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FOURTH ROW - CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Categories Pie */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Top Categories</h3>
          <p className="text-xs font-medium text-gray-500 mb-6">Revenue breakdown</p>
          <div className="w-full h-[250px] flex items-center justify-center">
            {data.categoryRevenue?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryRevenue}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={5} dataKey="value"
                  >
                    {data.categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm italic font-medium">No category data</div>
            )}
          </div>
          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {data.categoryRevenue?.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{background: COLORS[idx % COLORS.length]}}></span>
                <span className="text-xs font-bold text-gray-700 capitalize">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products Bar */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
          <p className="text-xs font-medium text-gray-500 mb-6">By revenue generated</p>
          <div className="w-full h-[280px]">
            {data.topProducts?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#555', fontWeight: 600 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f9fafb'}} />
                  <Bar dataKey="revenue" fill="#111" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-medium">No product data</div>
            )}
          </div>
        </div>
      </div>

      {/* FIFTH ROW - HEATMAP & FEED & INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap & Insights (Left - 2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Insights Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg. Order Value', val: `₹${formatINR(data.insights?.aov)}` },
              { label: 'Best Category', val: data.insights?.bestSellingCat },
              { label: "Today's Revenue", val: `₹${formatINR(data.insights?.todaysRevenue)}` },
              { label: 'Pending Payments', val: `₹${formatINR(data.insights?.pendingPayments)}` }
            ].map((insight, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-colors">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{insight.label}</div>
                <div className="text-lg font-black text-gray-900 truncate capitalize">{insight.val}</div>
              </div>
            ))}
          </div>

          {/* Sales Heatmap */}
          <div className="bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Sales Heatmap</h3>
            <p className="text-xs font-medium text-gray-500 mb-6">Revenue density by Day of Week</p>
            <div className="grid grid-cols-7 gap-2">
              {data.heatmap?.length > 0 ? (
                data.heatmap.map((h, i) => {
                  const maxRev = Math.max(...data.heatmap.map(x => x.revenue));
                  const intensity = maxRev === 0 ? 0 : h.revenue / maxRev;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-full aspect-square rounded-lg transition-all duration-300 hover:scale-105 cursor-help" 
                           style={{ backgroundColor: `rgba(0, 0, 0, ${intensity * 0.8 + 0.05})` }}
                           title={`${h.day}: ₹${h.revenue} (${h.orders} orders)`}>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 mt-2">{h.day.slice(0,3)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-7 py-8 text-center text-sm font-medium text-gray-400 italic">Not enough data for heatmap</div>
              )}
            </div>
          </div>
          
        </div>

        {/* Activity Feed (Right - 1 Col) */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Latest Activity</h3>
          <p className="text-xs font-medium text-gray-500 mb-6">Live system events</p>
          
          <div className="relative pl-4 border-l border-gray-100 space-y-6">
            {data.activityFeed?.length > 0 ? (
              data.activityFeed.map((act, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 border-white ${
                    act.type === 'order' ? 'bg-green-500' :
                    act.type === 'product' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="text-xs font-bold text-gray-900">{act.title}</div>
                  <div className="text-[10px] font-medium text-gray-500 mt-0.5 truncate pr-2">{act.desc}</div>
                  <div className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{new Date(act.time).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-10 font-medium italic">No recent activity</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

const PremiumUploadCard = ({ state, onRetry }) => {
  if (!state) return null;
  const { isUploading, progress, currentIndex, totalFiles, error, success, aiStatus, aiMessage } = state;
  
  if (!isUploading && !error && !success && aiStatus !== 'loading') return null;

  return (
    <div className="absolute inset-0 bg-brand-cream bg-opacity-95 z-20 flex flex-col items-center justify-center p-4 rounded-xl border border-brand-border backdrop-blur-sm shadow-sm transition-all duration-300">
      {isUploading && (
         <div className="w-full max-w-[200px] flex flex-col items-center animate-fade-in">
            <div className="text-xs font-bold text-brand-dark mb-1 flex items-center space-x-1">
              <Upload size={12} className="animate-bounce" />
              <span>Uploading image {currentIndex} of {totalFiles}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1 mt-2 overflow-hidden shadow-inner">
               <div className="bg-brand-crimson h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-[10px] font-bold text-brand-gold">{progress}%</div>
         </div>
      )}
      
      {aiStatus === 'loading' && (
         <div className="flex flex-col items-center space-y-3 animate-fade-in">
            <div className="w-6 h-6 rounded-full border-2 border-brand-gold border-t-transparent animate-spin shadow-sm"></div>
            <div className="text-xs font-bold text-brand-dark text-center">{aiMessage || 'Processing...'}</div>
         </div>
      )}
      
      {success && aiStatus !== 'loading' && (
         <div className="flex flex-col items-center animate-fade-in-up">
            <CheckCircle2 size={24} className="text-emerald-500 mb-1 drop-shadow" />
            <div className="text-xs font-bold text-brand-dark">Images Uploaded Successfully</div>
            {aiMessage && <div className="text-[10px] mt-1 font-semibold text-brand-gold">{aiMessage}</div>}
         </div>
      )}

      {error && (
         <div className="flex flex-col items-center animate-fade-in-up">
            <XCircle size={24} className="text-red-500 mb-1" />
            <div className="text-xs font-bold text-red-600 mb-2 text-center">{error}</div>
            <button type="button" onClick={onRetry} className="bg-brand-dark text-brand-cream px-4 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase hover:bg-brand-muted transition-colors">
              Retry Upload
            </button>
         </div>
      )}
    </div>
  );
};

const CATEGORY_SPEC_CONFIG = {
  'saree': [
    { key: 'sareeLength', label: 'Saree Length', placeholder: 'e.g. 6.30 Meters', type: 'text' },
    { key: 'sareeWidth', label: 'Saree Width', placeholder: 'e.g. 48 Inches', type: 'text' },
    { key: 'sareeWeight', label: 'Saree Weight', placeholder: 'e.g. 480 Grams', type: 'text' },
    { key: 'blousePiece', label: 'Blouse Piece', type: 'select', options: ['Included', 'Not Included'] },
    { key: 'blouseType', label: 'Blouse Type', type: 'select', options: ['Running Blouse', 'Separate Blouse Piece', 'Designer Blouse', 'Plain Blouse', 'Not Applicable'] },
    { key: 'latkan', label: 'Latkan', type: 'select', options: ['Included', 'Not Included'] },
    { key: 'fabric', label: 'Fabric', placeholder: 'e.g. Pure Silk', type: 'text' }
  ],
  'kurti': [
    { key: 'kurtiMaterial', label: 'Kurti Material', placeholder: 'e.g. Premium Cotton', type: 'text' },
    { key: 'pantMaterial', label: 'Pant Material', placeholder: 'e.g. Premium Cotton', type: 'text' },
    { key: 'dupattaMaterial', label: 'Dupatta Material', placeholder: 'e.g. Malmal Cotton', type: 'text' },
    { key: 'kurtiLength', label: 'Kurti Length', placeholder: 'e.g. 46 inches', type: 'text' },
    { key: 'pantLength', label: 'Pant Length', placeholder: 'e.g. 38 inches', type: 'text' },
    { key: 'dupattaLength', label: 'Dupatta Length', placeholder: 'e.g. 2.2 mtr', type: 'text' },
    { key: 'sleeveType', label: 'Sleeve Type', placeholder: 'e.g. 3/4 Sleeves', type: 'text' },
    { key: 'neckType', label: 'Neck Type', placeholder: 'e.g. Round Neck', type: 'text' },
    { key: 'pattern', label: 'Pattern', placeholder: 'e.g. Floral Print', type: 'text' },
    { key: 'workType', label: 'Work Type', placeholder: 'e.g. Embroidery', type: 'text' },
    { key: 'pieces', label: 'Number of Pieces', type: 'select', options: ['1 Piece (Kurti Only)', '2 Piece Set', '3 Piece Set'] },
    { key: 'fit', label: 'Fit', type: 'select', options: ['Regular Fit', 'Slim Fit', 'Relaxed Fit', 'A-Line'] },
    { key: 'occasion', label: 'Occasion', placeholder: 'e.g. Casual Wear', type: 'text' }
  ],
  'dress material': [
    { key: 'topFabric', label: 'Top Fabric', placeholder: 'e.g. Pure Cotton', type: 'text' },
    { key: 'bottomFabric', label: 'Bottom Fabric', placeholder: 'e.g. Pure Cotton', type: 'text' },
    { key: 'dupattaFabric', label: 'Dupatta Fabric', placeholder: 'e.g. Chiffon', type: 'text' },
    { key: 'topLength', label: 'Top Length', placeholder: 'e.g. 2.5 Meters', type: 'text' },
    { key: 'bottomLength', label: 'Bottom Length', placeholder: 'e.g. 2.5 Meters', type: 'text' },
    { key: 'dupattaLength', label: 'Dupatta Length', placeholder: 'e.g. 2.25 Meters', type: 'text' },
    { key: 'pattern', label: 'Pattern', placeholder: 'e.g. Bandhani Print', type: 'text' },
    { key: 'workType', label: 'Work Type', placeholder: 'e.g. Zari Work', type: 'text' }
  ],
  'accessori': [
    { key: 'material', label: 'Material', placeholder: 'e.g. Alloy', type: 'text' },
    { key: 'finish', label: 'Finish', placeholder: 'e.g. Gold Plated', type: 'text' },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 50 Grams', type: 'text' },
    { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 2x2 Inches', type: 'text' },
    { key: 'suitableFor', label: 'Suitable For', placeholder: 'e.g. Weddings, Parties', type: 'text' }
  ]
};

// -----------------------
// 2. PRODUCTS CRUD VIEW
// -----------------------
function ProductsView({ token: tokenProp }) {
  // Always read the freshest token directly from the store to avoid stale prop issues
  const token = useAuthStore.getState().token || tokenProp;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStock, setFilterStock] = useState('');
  
  // Form display toggle
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    fabric: '',
    colorName: '',
    colorHex: '#C8832A',
    colorManuallyEdited: false,
    careInstructions: '',
    occasionTags: [],
    styleTags: [],
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isNewArrival: false,
    imageUrl: '', // kept for backward compat / URL fallback
    mainProductSizes: [], // array of sizes for primary product
    variants: [], // { colorName, colorHex, size, stock, extraPricePaise }
    subCategory: '',
    brand: '',
    sareeLength: '',
    sareeWidth: '',
    sareeWeight: '',
    blousePiece: '',
    blouseType: '',
    latkan: '',
    availability: '',
    dispatchTime: '',
    productVideo: '',
    productHighlights: [],
    showSizeChart: true,
    rating: '4.9',
    reviewsCount: '33',
    specifications: {}
  });
  const [mainUploadState, setMainUploadState] = useState({
    isUploading: false, progress: 0, currentIndex: 0, totalFiles: 0,
    error: null, success: false, aiStatus: '', aiMessage: '', stagedFiles: []
  });
  const [supplierText, setSupplierText] = useState('');
  const [manuallyEditedFields, setManuallyEditedFields] = useState(new Set());
  const [confidenceScores, setConfidenceScores] = useState({});
  const { generateDetails, loading: aiLoading, loadingStage, error: aiError, success: aiSuccess, clearState: clearAiState } = useProductAI();

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setManuallyEditedFields(prev => new Set([...prev, field]));
  };

  const handleSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [key]: value
      }
    }));
    setManuallyEditedFields(prev => new Set([...prev, `specifications.${key}`]));
  };

  const getFieldClass = (fieldName, baseClass) => {
    const isLowConfidence = confidenceScores[fieldName] !== undefined && confidenceScores[fieldName] < 80;
    return `${baseClass} ${isLowConfidence ? 'border-amber-400 ring-1 ring-amber-400/50 bg-amber-50/30' : 'border'}`;
  };

  const renderConfidenceBadge = (fieldName) => {
    if (confidenceScores[fieldName] !== undefined && confidenceScores[fieldName] < 80) {
      return <span className="text-3xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-200 ml-2 shadow-sm" title="AI confidence is low. Please review.">Verify</span>;
    }
    return null;
  };

  const handleGenerateAI = async (replaceExisting = false) => {
    if (!supplierText) return;
    
    const result = await generateDetails(supplierText);
    if (result && result.extracted) {
      setConfidenceScores(result.confidence || {});
      
      const newFormData = { ...formData };
      
      if (result.extracted.categoryName && categories.length > 0) {
        const catMatch = categories.find(c => c.name.toLowerCase() === result.extracted.categoryName.toLowerCase());
        if (catMatch) {
          result.extracted.category = catMatch._id;
          
          if (result.extracted.subCategoryName && catMatch.subCategories) {
            const subMatch = catMatch.subCategories.find(s => s.name.toLowerCase() === result.extracted.subCategoryName.toLowerCase());
            if (subMatch) {
              result.extracted.subCategory = subMatch.slug;
            }
          }
          
          // Auto-generate primary product sizes based on category
          const aiStock = parseInt(result.extracted.stock) || 10;
          if (catMatch.slug === 'sarees') {
            newFormData.mainProductSizes = [{ size: 'Free Size', stock: aiStock, extraPricePaise: 0, variantSku: '' }];
          } else if (catMatch.slug === 'kurti' || catMatch.slug === 'kurti-sets') {
            newFormData.mainProductSizes = ['M', 'L', 'XL', 'XXL', '3XL'].map(sz => ({ size: sz, stock: aiStock, extraPricePaise: 0, variantSku: '' }));
          } else {
            newFormData.mainProductSizes = [{ size: 'Free Size', stock: aiStock, extraPricePaise: 0, variantSku: '' }];
          }
        }
      }
      
      if (result.extracted.variants && Array.isArray(result.extracted.variants) && result.extracted.variants.length > 0) {
        newFormData.variants = result.extracted.variants.map((v, idx) => {
           // Attempt to retain existing images if matching variant index exists
           const existingVariant = formData.variants && formData.variants[idx] ? formData.variants[idx] : null;
           
           return {
             colorName: v.colorName || '',
             colorHex: v.colorHex || '#000000',
             sizes: (v.sizes && v.sizes.length > 0) ? v.sizes.map(s => ({
               size: s.size || 'Free Size',
               stock: s.stock !== undefined ? s.stock : 10,
               extraPricePaise: s.extraPrice ? s.extraPrice * 100 : 0, // AI returns rupees, we store paise in UI state before submit
               variantSku: s.variantSku || ''
             })) : [{ size: 'Free Size', stock: 10, extraPricePaise: 0, variantSku: '' }],
             images: existingVariant ? existingVariant.images : [],
             availability: '', video: '', colorManuallyEdited: false,
             uploadState: { isUploading: false, aiStatus: 'success', aiMessage: `Extracted ${v.colorName || 'Variant'}` }
           };
        });
      }

      Object.keys(result.extracted).forEach(key => {
        if (key === 'variants') return; // Handled above
        if (key === 'specifications') {
          newFormData.specifications = { ...newFormData.specifications };
          Object.keys(result.extracted.specifications || {}).forEach(specKey => {
            if (replaceExisting || !manuallyEditedFields.has(`specifications.${specKey}`)) {
              newFormData.specifications[specKey] = result.extracted.specifications[specKey];
            }
          });
        } else if (formData.hasOwnProperty(key)) {
          if (replaceExisting || !manuallyEditedFields.has(key)) {
            newFormData[key] = result.extracted[key];
          }
        }
      });
      
      setFormData(newFormData);
      if (replaceExisting) {
        setManuallyEditedFields(new Set());
      }
    }
  };

  // Multi-image uploader state
  const [uploadedImages, setUploadedImages] = useState([]); // [{ url, isPrimary, displayOrder }]
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageFilesSelected = async (files, isRetry = false) => {
    const fileArray = isRetry ? mainUploadState.stagedFiles : (files ? Array.from(files) : []);
    if (!fileArray || fileArray.length === 0) return;
    
    setImageUploading(true);
    setMainUploadState({
      isUploading: true, progress: 0, currentIndex: 1, totalFiles: fileArray.length,
      error: null, success: false, aiStatus: '', aiMessage: '', stagedFiles: fileArray
    });

    const freshToken = useAuthStore.getState().token;
    const newImageUrls = [];
    
    try {
      for (let i = 0; i < fileArray.length; i++) {
        setMainUploadState(p => ({ ...p, currentIndex: i + 1, progress: 0 }));
        const mainFolderPath = `products/${formData.slug || 'draft'}/main`;
        const data = await uploadFileWithProgress(fileArray[i], freshToken, (pct) => {
          setMainUploadState(p => ({ ...p, progress: pct }));
        }, mainFolderPath);
        
        console.log('[DEBUG] Cloudinary Upload Response:', data); // Added log
        newImageUrls.push(data.url);
        
        setUploadedImages(prev => {
          // If we already have images, none of the new ones should be forced primary
          // unless the previous length was 0.
          const isPrimary = prev.length === 0 && i === 0;
          const next = [...prev, {
            url: data.url,
            isPrimary: isPrimary,
            displayOrder: prev.length + i
          }];
          console.log('[DEBUG] Added to mainProduct uploadedImages state:', next);
          return next;
        });
      }
      
      setMainUploadState(p => ({ ...p, isUploading: false, success: true }));
      setImageUploading(false);
      
      triggerMainColorDetection(newImageUrls);
      
      setTimeout(() => {
        setMainUploadState(p => {
           if (p.aiStatus) return p;
           return { ...p, success: false };
        });
      }, 2500);

    } catch (e) {
      console.error(e);
      setMainUploadState(p => ({ ...p, isUploading: false, error: e.message || 'Upload failed' }));
      setImageUploading(false);
    }
  };

  const triggerMainColorDetection = async (imageUrls) => {
    if (formData.colorManuallyEdited) return;
    
    setMainUploadState(p => ({ ...p, aiStatus: 'loading', aiMessage: '🧠 Analyzing Saree Images...' }));
    
    const msgs = ['🧠 Analyzing Saree Images...', '🎨 Detecting Primary Color...', '🪡 Identifying Saree Fabric...', '🏷 Generating Color Name...'];
    let step = 0;
    const interval = setInterval(() => {
       step = (step + 1) % msgs.length;
       setMainUploadState(p => p.aiStatus === 'loading' ? { ...p, aiMessage: msgs[step] } : p);
    }, 1500);
    
    try {
      const result = await detectVariantColor(imageUrls);
      clearInterval(interval);
      
      setFormData(prev => {
         if (prev.colorManuallyEdited) {
            setMainUploadState(p => ({ ...p, aiStatus: 'warning', aiMessage: 'AI Skipped - Color Manually Edited' }));
            return prev;
         }
         return { ...prev, colorName: result.primaryColor, colorHex: result.hex };
      });
      
      if (!formData.colorManuallyEdited) {
        setMainUploadState(p => ({ 
          ...p, 
          aiStatus: 'success', 
          aiMessage: `🟣 AI Detected Color: ${result.primaryColor} (${result.confidence}%)` 
        }));
      }
      
      setTimeout(() => {
        setMainUploadState(p => ({ ...p, aiStatus: '', success: false }));
      }, 3000);
      
    } catch (e) {
      clearInterval(interval);
      console.error(e);
      setMainUploadState(p => ({ ...p, aiStatus: 'error', aiMessage: '❌ Color detection failed.' }));
      setTimeout(() => {
        setMainUploadState(p => ({ ...p, aiStatus: '', success: false }));
      }, 3000);
    }
  };

  const sortImages = (images) => {
    return [...images].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      const orderA = a.displayOrder !== undefined ? a.displayOrder : 9999;
      const orderB = b.displayOrder !== undefined ? b.displayOrder : 9999;
      return orderA - orderB;
    }).map((img, i) => ({ ...img, displayOrder: i }));
  };

  const setPrimaryImage = (idx) => {
    setUploadedImages(prev => {
      const updated = prev.map((img, i) => ({ ...img, isPrimary: i === idx }));
      return sortImages(updated);
    });
  };

  const removeUploadedImage = (idx) => {
    setUploadedImages(prev => {
      const next = prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, displayOrder: i }));
      // Ensure at least one primary
      if (next.length > 0 && !next.some(i => i.isPrimary)) next[0].isPrimary = true;
      return next;
    });
  };


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const freshToken = useAuthStore.getState().token;
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (filterCategory) queryParams.set('category', filterCategory);
      if (filterStatus) queryParams.set('status', filterStatus);
      if (filterStock) queryParams.set('stock', filterStock);
      queryParams.set('limit', '100');

      const response = await fetch(`/api/products/all?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${freshToken}` }
      });
      if (!response.ok) {
        let errorMsg = 'Failed to fetch products';
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error('Fetch products error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (prod, newStatus) => {
    try {
      const freshToken = useAuthStore.getState().token;
      const isAvailable = newStatus === 'available';
      const response = await fetch(`/api/products/${prod._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
        body: JSON.stringify({
          isQuickUpdate: true,
          isActive: true,
          stock: isAvailable ? (prod.stock > 0 ? prod.stock : 10) : 0
        })
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update product status.');
      }
    } catch (err) {
      console.error(err);
      useModalStore.getState().error('Error', 'Failed to update product status due to a network error.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, filterCategory, filterStatus, filterStock]);

  useEffect(() => {
    // Load categories for dropdown
    fetch('/api/categories/all', { headers: { 'Authorization': `Bearer ${useAuthStore.getState().token}` } })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(cats => setCategories(cats))
      .catch(err => console.error('Fetch categories dropdown error:', err));
  }, []);

  // Generate URL slug from product name input
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
    setManuallyEditedFields(prev => new Set([...prev, 'name', 'slug']));
  };


  // Variant row builders
  const addVariantRow = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { colorName: '', colorHex: '#C8832A', sizes: [{ size: 'Free Size', stock: 10, extraPricePaise: 0, variantSku: '' }], availability: '', video: '', images: [], colorManuallyEdited: false, aiColorStatus: '', aiColorMessage: '', uploadState: { isUploading: false, progress: 0, currentIndex: 0, totalFiles: 0, error: null, success: false, aiStatus: '', aiMessage: '', stagedFiles: [] } }]
    }));
  };

  const addVariantSizeRow = (vIdx) => {
    setFormData(prev => {
      const list = [...prev.variants];
      if (!list[vIdx]) return prev;
      const sizes = list[vIdx].sizes || [];
      list[vIdx].sizes = [...sizes, { size: 'M', stock: 10, extraPricePaise: 0, variantSku: '' }];
      return { ...prev, variants: list };
    });
  };

  const removeVariantSizeRow = (vIdx, sIdx) => {
    setFormData(prev => {
      const list = [...prev.variants];
      if (!list[vIdx]) return prev;
      const sizes = list[vIdx].sizes || [];
      list[vIdx].sizes = sizes.filter((_, i) => i !== sIdx);
      return { ...prev, variants: list };
    });
  };

  const handleVariantSizeChange = (vIdx, sIdx, field, value) => {
    setFormData(prev => {
      const list = [...prev.variants];
      if (!list[vIdx]) return prev;
      const sizes = [...(list[vIdx].sizes || [])];
      sizes[sIdx] = { ...sizes[sIdx], [field]: value };
      list[vIdx].sizes = sizes;
      return { ...prev, variants: list };
    });
  };

  const removeVariantRow = (idx) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const handleVariantChange = (idx, field, value) => {
    setFormData(prev => {
      const list = [...prev.variants];
      const variant = list[idx] || {};
      
      const updates = { [field]: value };
      if (field === 'colorName' || field === 'colorHex') {
        updates.colorManuallyEdited = true;
      }
      
      list[idx] = { ...variant, ...updates };
      return { ...prev, variants: list };
    });
  };

  const setVariantUploadState = (idx, updates) => {
    setFormData(prev => {
       const list = [...prev.variants];
       if (!list[idx]) return prev;
       list[idx].uploadState = { ...(list[idx].uploadState || {}), ...updates };
       return { ...prev, variants: list };
    });
  };

  const triggerVariantColorDetection = async (idx, imageUrls) => {
    if (formData.variants[idx]?.colorManuallyEdited) {
       return;
    }
    
    setVariantUploadState(idx, { aiStatus: 'loading', aiMessage: '🧠 Analyzing Saree Images...' });
    
    const msgs = ['🧠 Analyzing Saree Images...', '🎨 Detecting Primary Color...', '🪡 Identifying Saree Fabric...', '🏷 Generating Color Name...'];
    let step = 0;
    const interval = setInterval(() => {
       step = (step + 1) % msgs.length;
       setFormData(prev => {
          const list = [...prev.variants];
          if (list[idx] && list[idx].uploadState?.aiStatus === 'loading') {
            list[idx].uploadState.aiMessage = msgs[step];
          }
          return { ...prev, variants: list };
       });
    }, 1500);
    
    try {
       const result = await detectVariantColor(imageUrls);
       clearInterval(interval);
       
       setFormData(prev => {
          const list = [...prev.variants];
          const currentVariant = list[idx];
          if (!currentVariant) return prev;
          
          if (currentVariant.colorManuallyEdited) {
             currentVariant.uploadState.aiStatus = 'warning';
             currentVariant.uploadState.aiMessage = 'AI Skipped - Color Manually Edited';
             return { ...prev, variants: list };
          }
          
          currentVariant.colorName = result.primaryColor;
          currentVariant.colorHex = result.hex;
          currentVariant.uploadState.aiStatus = 'success';
          currentVariant.uploadState.aiMessage = `🟣 AI Detected Color: ${result.primaryColor} (${result.confidence}%)`;
          
          return { ...prev, variants: list };
       });
       
       setTimeout(() => {
          setVariantUploadState(idx, { aiStatus: '', success: false });
       }, 3000);
       
    } catch (error) {
       clearInterval(interval);
       console.error('Color detection failed:', error);
       setVariantUploadState(idx, { aiStatus: 'error', aiMessage: '❌ Color detection failed.' });
       setTimeout(() => {
          setVariantUploadState(idx, { aiStatus: '', success: false });
       }, 3000);
    }
  };

  const handleVariantImageUpload = async (idx, files, isRetry = false) => {
    const currentVariant = formData.variants[idx];
    const fileArray = isRetry ? currentVariant.uploadState?.stagedFiles : (files ? Array.from(files) : []);
    if (!fileArray || fileArray.length === 0) return;
    
    setVariantUploadState(idx, {
      isUploading: true, progress: 0, currentIndex: 1, totalFiles: fileArray.length,
      error: null, success: false, aiStatus: '', aiMessage: '', stagedFiles: fileArray
    });

    const freshToken = useAuthStore.getState().token;
    const newImageUrls = [];
    
    try {
      for (let i = 0; i < fileArray.length; i++) {
         setVariantUploadState(idx, { currentIndex: i + 1, progress: 0 });
         const variantColor = formData.variants[idx]?.colorName || `variant_${idx}`;
         const variantFolderPath = `products/${formData.slug || 'draft'}/variants/${variantColor}`;
         const data = await uploadFileWithProgress(fileArray[i], freshToken, (pct) => {
           setVariantUploadState(idx, { progress: pct });
         }, variantFolderPath);
         
         newImageUrls.push(data.url);
         
         setFormData(prev => {
            const list = [...prev.variants];
            const currentVariant = list[idx] || { images: [] };
            const existingImages = currentVariant.images || [];
            
            // Prevent duplicates
            if (existingImages.some(img => img.url === data.url)) {
               return prev;
            }
            
            const isPrimary = existingImages.length === 0 && i === 0;
            const newImageObj = {
               url: data.url,
               isPrimary: isPrimary,
               displayOrder: existingImages.length + i
            };

            list[idx] = {
               ...currentVariant,
               images: [...existingImages, newImageObj]
            };
            
            return { ...prev, variants: list };
         });
      }
      
      setVariantUploadState(idx, { isUploading: false, success: true });
      
      triggerVariantColorDetection(idx, newImageUrls);
      
      setTimeout(() => {
        setFormData(prev => {
           const list = [...prev.variants];
           if (list[idx] && !list[idx].uploadState?.aiStatus) {
              list[idx].uploadState.success = false;
           }
           return { ...prev, variants: list };
        });
      }, 2500);
      
    } catch (e) {
      console.error(e);
      setVariantUploadState(idx, { isUploading: false, error: e.message || 'Upload failed' });
    }
  };

  const setVariantPrimaryImage = (vIdx, imgIdx) => {
    setFormData(prev => {
      const list = [...prev.variants];
      if (list[vIdx] && list[vIdx].images) {
         const updated = list[vIdx].images.map((img, i) => ({ ...img, isPrimary: i === imgIdx }));
         list[vIdx] = {
           ...list[vIdx],
           images: sortImages(updated)
         };
      }
      return { ...prev, variants: list };
    });
  };

  const removeVariantImage = (vIdx, imgIdx) => {
    setFormData(prev => {
      const list = [...prev.variants];
      if (list[vIdx] && list[vIdx].images) {
        let newImages = list[vIdx].images.filter((_, i) => i !== imgIdx).map((img, i) => ({ ...img, displayOrder: i }));
        if (newImages.length > 0 && !newImages.some(i => i.isPrimary)) newImages[0].isPrimary = true;
        list[vIdx] = {
          ...list[vIdx],
          images: newImages
        };
      }
      return { ...prev, variants: list };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Build images array: prefer uploaded Cloudinary images, fall back to imageUrl
    let imagesPayload = [];
    if (uploadedImages.length > 0) {
      imagesPayload = uploadedImages.map((img, i) => ({
        url: img.url,
        isPrimary: img.isPrimary,
        displayOrder: i
      }));
    } else if (formData.imageUrl) {
      imagesPayload = [{ url: formData.imageUrl, isPrimary: true, displayOrder: 0 }];
    }
    
    if (imagesPayload.length === 0 && !editingProduct) {
      useModalStore.getState().info('Information', 'Please upload at least one product image.');
      return;
    }
    
    // Variants validation removed for colorName since Kurtis can have size-only variants without a specific color name.
    
    const body = {
      ...formData,
      stock: (formData.mainProductSizes || []).reduce((acc, s) => acc + (parseInt(s.stock) || 0), 0),
      images: imagesPayload, // Legacy fallback
      mainProduct: {
        primaryColor: { name: formData.colorName, hex: formData.colorHex },
        images: imagesPayload,
        primaryImage: imagesPayload.find(i => i.isPrimary)?.url || imagesPayload[0]?.url || '',
        video: formData.productVideo || '',
        sizes: formData.mainProductSizes
      },
      variants: formData.variants.map(v => {
        // Find the primary variant image
        const variantPrimaryImage = v.images?.find(i => i.isPrimary)?.url || v.images?.[0]?.url || '';
        return {
          ...v,
          primaryImage: variantPrimaryImage,
          sizes: (v.sizes || []).map(s => ({
            ...s,
            extraPricePaise: Math.round(parseFloat(s.extraPricePaise || 0) * 100)
          }))
        };
      })
    };

    console.log('[DEBUG] Exact Payload Before Saving:', JSON.stringify(body, null, 2)); // Added log

    const method = editingProduct ? 'PUT' : 'POST';
    const endpoint = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';

    try {
      const freshToken = useAuthStore.getState().token;
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${freshToken}`
        },
        body: JSON.stringify(body)
      });
      
      const resData = await res.json();
      if (res.ok) {
        setFormOpen(false);
        setEditingProduct(null);
        setUploadedImages([]);
        fetchProducts();
      } else {
        alert(resData.error || 'Failed to submit product details.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProductClick = (prod) => {
    setEditingProduct(prod);
    // Pre-populate uploadedImages from existing product images (prefer mainProduct if available)
    const sourceImages = prod.mainProduct?.images || prod.images || [];
    
    let mainPrimaryFound = false;
    const existingImages = sourceImages.map((img, i) => {
      let isPrimary = false;
      if (img.isPrimary && !mainPrimaryFound) {
        isPrimary = true;
        mainPrimaryFound = true;
      }
      return {
        url: img.url,
        isPrimary: isPrimary,
        displayOrder: img.displayOrder || i
      };
    });
    if (!mainPrimaryFound && existingImages.length > 0) {
      existingImages[0].isPrimary = true;
    }

    setUploadedImages(existingImages);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      category: prod.category?._id || '',
      description: prod.description || '',
      fabric: prod.fabric || '',
      careInstructions: prod.careInstructions || '',
      occasionTags: prod.occasionTags || [],
      styleTags: prod.styleTags || [],
      price: (prod.price / 100).toString(),
      originalPrice: prod.originalPrice ? (prod.originalPrice / 100).toString() : '',
      stock: prod.stock.toString(),
      sku: prod.sku || '',
      isActive: prod.isActive,
      isFeatured: prod.isFeatured || false,
      isBestseller: prod.isBestseller || false,
      isNewArrival: prod.isNewArrival || false,
      rating: prod.rating !== undefined && prod.rating !== null ? prod.rating.toString() : '4.9',
      reviewsCount: prod.reviewsCount !== undefined && prod.reviewsCount !== null ? prod.reviewsCount.toString() : '33',
      
      // Attempt to load from mainProduct first, then fallback to legacy flat fields
      imageUrl: prod.mainProduct?.images?.[0]?.url || prod.images?.[0]?.url || '',
      colorName: prod.mainProduct?.primaryColor?.name || prod.colorName || '',
      colorHex: prod.mainProduct?.primaryColor?.hex || prod.colorHex || '#000000',
      
      // Load primary product sizes with backward compatibility
      mainProductSizes: prod.mainProduct?.sizes && prod.mainProduct.sizes.length > 0 ? prod.mainProduct.sizes : (
        prod.category?.slug === 'sarees' 
          ? [{ size: 'Free Size', stock: prod.stock || 0, extraPricePaise: 0, variantSku: prod.sku || '' }] 
          : (['kurti', 'kurti-sets'].includes(prod.category?.slug) 
            ? ['M', 'L', 'XL', 'XXL', '3XL'].map(sz => ({ size: sz, stock: prod.stock || 0, extraPricePaise: 0, variantSku: '' }))
            : [{ size: 'Free Size', stock: prod.stock || 0, extraPricePaise: 0, variantSku: prod.sku || '' }]
          )
      ),

      variants: prod.variants?.map(v => {
        let variantPrimaryFound = false;
        const sanitizedImages = (v.images || []).map((img, i) => {
          let isPrimary = false;
          if (img.isPrimary && !variantPrimaryFound) {
            isPrimary = true;
            variantPrimaryFound = true;
          }
          return {
             url: img.url,
             isPrimary: isPrimary,
             displayOrder: img.displayOrder || i
          };
        });
        if (!variantPrimaryFound && sanitizedImages.length > 0) {
          sanitizedImages[0].isPrimary = true;
        }
        
        return {
          ...v,
          sizes: (v.sizes && v.sizes.length > 0) ? v.sizes.map(s => ({
            ...s,
            extraPricePaise: s.extraPricePaise ? (s.extraPricePaise / 100).toString() : '0'
          })) : [{ size: v.size || 'Free Size', stock: v.stock || 0, extraPricePaise: v.extraPricePaise ? (v.extraPricePaise / 100).toString() : '0', variantSku: v.variantSku || '' }],
          images: sanitizedImages,
          uploadState: v.colorName ? { aiStatus: 'success', aiMessage: `Retrieved color: ${v.colorName}` } : {}
        };
      }) || [],
      subCategory: prod.subCategory || '',
      brand: prod.brand || '',
      sareeLength: prod.sareeLength || '',
      sareeWidth: prod.sareeWidth || '',
      sareeWeight: prod.sareeWeight || '',
      blousePiece: prod.blousePiece || '',
      blouseType: prod.blouseType || '',
      latkan: prod.latkan || '',
      availability: prod.availability || '',
      dispatchTime: prod.dispatchTime || '',
      productVideo: prod.productVideo || '',
      productHighlights: prod.productHighlights || [],
      showSizeChart: prod.showSizeChart !== false,
      specifications: prod.specifications && Object.keys(prod.specifications).length > 0 ? prod.specifications : {
        sareeLength: prod.sareeLength || '',
        sareeWidth: prod.sareeWidth || '',
        sareeWeight: prod.sareeWeight || '',
        blousePiece: prod.blousePiece || '',
        blouseType: prod.blouseType || '',
        latkan: prod.latkan || '',
        fabric: prod.fabric || ''
      }
    });
    setSupplierText('');
    setManuallyEditedFields(new Set());
    setConfidenceScores({});
    clearAiState();
    
    // Restore AI Status badge if color exists
    if (prod.colorName) {
       setMainUploadState(prev => ({
          ...prev,
          aiStatus: 'success',
          aiMessage: `Retrieved color: ${prod.colorName}`
       }));
    }
    
    setFormOpen(true);
  };

  const handleDeleteProductClick = async (prod) => {
    console.log('[handleDeleteProductClick] Clicked for product:', prod);
    if (!(await useModalStore.getState().confirm('Confirmation', `Delete "${prod.name}"? This cannot be undone.`))) {
      console.log('[handleDeleteProductClick] User cancelled deletion confirmation');
      return;
    }

    try {
      const freshToken = useAuthStore.getState().token;
      console.log('[handleDeleteProductClick] Sending DELETE request with token:', freshToken ? 'present' : 'missing');
      const response = await fetch(`/api/products/${prod._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${freshToken}` }
      });
      console.log('[handleDeleteProductClick] Response status:', response.status);
      if (response.ok) {
        console.log('[handleDeleteProductClick] Product deleted successfully');
        fetchProducts();
      } else {
        const errorData = await response.json();
        console.error('[handleDeleteProductClick] Delete failed. Error:', errorData);
        alert(errorData.error || 'Failed to delete product.');
      }
    } catch (e) {
      console.error('[handleDeleteProductClick] Network error:', e);
      useModalStore.getState().error('Error', 'Failed to delete product due to a network error.');
    }
  };

  const handleOccasionTagToggle = (tag) => {
    const prev = formData.occasionTags;
    const newTags = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
    setFormData(f => ({ ...f, occasionTags: newTags }));
  };

  const handleStyleTagToggle = (tag) => {
    const prev = formData.styleTags;
    const newTags = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
    setFormData(f => ({ ...f, styleTags: newTags }));
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b pb-3 select-none">
        <h2 className="font-display font-bold text-brand-dark text-xl">Manage Products</h2>
        {!formOpen && (
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '', slug: '', category: categories[0]?._id || '', subCategory: '', description: '', fabric: '', careInstructions: '',
                occasionTags: [], styleTags: [], price: '', originalPrice: '', stock: '10', sku: '', isActive: true,
                isFeatured: false, isBestseller: false, isNewArrival: false, imageUrl: '', variants: [],
                brand: '', sareeLength: '', sareeWidth: '', sareeWeight: '', blousePiece: '', blouseType: '', latkan: '', availability: '', dispatchTime: '', productVideo: '', productHighlights: [], showSizeChart: true,
                rating: '4.9', reviewsCount: '33', mainProductSizes: []
              });
              setSupplierText('');
              setManuallyEditedFields(new Set());
              setConfidenceScores({});
              clearAiState();
              setFormOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-muted text-brand-cream text-xs font-semibold px-4 py-2 rounded-lg border border-brand-gold/30 shadow-md"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* CRUD Add/Edit Form */}
      {formOpen ? (
        <form onSubmit={handleFormSubmit} className="relative space-y-6 max-w-5xl font-sans text-xs pb-24">
          <div className="flex justify-between items-center bg-brand-white border border-brand-border p-4 rounded-xl shadow-sm">
             <h3 className="font-display font-bold text-brand-dark text-base">{editingProduct ? `Edit Product: ${editingProduct.name}` : 'New Product Registration'}</h3>
          </div>
          
          {/* ✨ AI Product Assistant Card */}
          <div className="flex flex-col space-y-4 bg-gradient-to-br from-brand-gold/10 to-brand-cream/40 p-5 rounded-xl border border-brand-gold/30 shadow-sm relative overflow-hidden">
            <div className="flex items-center space-x-2 border-b border-brand-gold/20 pb-2">
              <Sparkles className="text-brand-gold" size={18} />
              <span className="font-display font-bold text-brand-dark text-sm tracking-wide">AI Product Assistant</span>
            </div>
            
            <textarea 
              value={supplierText} 
              onChange={e => setSupplierText(e.target.value)} 
              rows={4} 
              placeholder="Paste supplier message here..." 
              className="bg-brand-white border border-brand-border/60 p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-gold font-mono text-[11px] resize-y" 
            />
            
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  onClick={handleGenerateAI} 
                  disabled={aiLoading || !supplierText.trim()}
                  className="flex items-center space-x-1.5 bg-brand-dark hover:bg-brand-muted text-brand-cream px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                  <span>{aiLoading ? 'Analyzing...' : 'Auto-Fill Details'}</span>
                </button>
                <button 
                  type="button" 
                  onClick={clearAiState}
                  disabled={aiLoading}
                  className="flex items-center space-x-1 border border-brand-border hover:bg-brand-cream text-brand-dark px-3 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  title="Clear all AI generated data"
                >
                  <RefreshCw size={12} />
                  <span>Reset Form</span>
                </button>
              </div>

              {aiError && <span className="text-brand-crimson text-xs font-semibold animate-pulse">{aiError}</span>}
              {aiSuccess && (
                <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                  <CheckCircle2 size={14} />
                  <span>Product Details Generated Successfully</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Sec 1: Basic info */}
            <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-sm space-y-4">
              <span className="block text-sm font-display font-bold text-brand-dark border-b pb-2 mb-4">Basic Information</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Product Name * {renderConfidenceBadge('name')}</label>
                  <input type="text" value={formData.name} onChange={handleNameChange} className={getFieldClass('name', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none")} required />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Brand * {renderConfidenceBadge('brand')}</label>
                  <input type="text" value={formData.brand} onChange={(e) => handleFieldChange('brand', e.target.value)} placeholder="e.g. Ajrakh" className={getFieldClass('brand', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none")} required />
                </div>
                
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Category * {renderConfidenceBadge('category')}</label>
                  <select value={formData.category} onChange={(e) => { handleFieldChange('category', e.target.value); handleFieldChange('subCategory', ''); }} className={getFieldClass('category', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none cursor-pointer")} required>
                    <option value="">Choose category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                
                {(() => {
                  const selectedCatObj = categories.find(c => c._id === formData.category);
                  const subCats = selectedCatObj?.subCategories || [];
                  return (
                      <div className="flex flex-col">
                        <label className="font-semibold text-brand-dark mb-1 flex items-center">Sub-category {renderConfidenceBadge('subCategory')}</label>
                        <select
                          value={formData.subCategory}
                          onChange={(e) => handleFieldChange('subCategory', e.target.value)}
                          className={getFieldClass('subCategory', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none cursor-pointer text-xs")}
                          disabled={subCats.length === 0}
                        >
                          <option value="">-- Choose Sub-category --</option>
                          {subCats.map(sub => (
                            <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                          ))}
                        </select>
                      </div>
                  );
                })()}

                <div className="flex flex-col col-span-1 sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-brand-dark flex items-center">Description {renderConfidenceBadge('description')}</label>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={4}
                    placeholder="Rich HTML description..."
                    className={getFieldClass('description', "bg-brand-cream p-3 rounded-md focus:outline-none font-mono text-[11px]")}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Fabric details {renderConfidenceBadge('fabric')}</label>
                  <input type="text" value={formData.fabric} onChange={(e) => handleFieldChange('fabric', e.target.value)} placeholder="e.g. Banarasi Silk" className={getFieldClass('fabric', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none")} />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Care Instructions</label>
                  <input type="text" value={formData.careInstructions} onChange={(e) => handleFieldChange('careInstructions', e.target.value)} placeholder="Dry clean only" className="bg-brand-cream px-3 py-2 rounded-md focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Sec 2: Numbers & status */}
            <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-sm space-y-4">
              <span className="block text-sm font-display font-bold text-brand-dark border-b pb-2 mb-4">Pricing & Inventory</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Price (₹) * {renderConfidenceBadge('price')}</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => handleFieldChange('price', e.target.value)} className={getFieldClass('price', "bg-brand-cream px-3 py-2 rounded-md")} required />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Original Price (₹) {renderConfidenceBadge('originalPrice')}</label>
                  <input type="number" step="0.01" value={formData.originalPrice} onChange={(e) => handleFieldChange('originalPrice', e.target.value)} className={getFieldClass('originalPrice', "bg-brand-cream px-3 py-2 rounded-md")} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Total Stock * {renderConfidenceBadge('stock')}</label>
                  <input type="number" value={(formData.mainProductSizes || []).reduce((acc, s) => acc + (parseInt(s.stock) || 0), 0)} disabled className="bg-brand-cream/50 px-3 py-2 rounded-md cursor-not-allowed opacity-70" required />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Product SKU {renderConfidenceBadge('sku')}</label>
                  <input type="text" value={formData.sku} onChange={(e) => handleFieldChange('sku', e.target.value)} placeholder="SKU-CODE" className={getFieldClass('sku', "bg-brand-cream px-3 py-2 rounded-md")} />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Availability {renderConfidenceBadge('availability')}</label>
                  <select value={formData.availability} onChange={(e) => handleFieldChange('availability', e.target.value)} className={getFieldClass('availability', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none cursor-pointer")}>
                    <option value="">Select Status</option>
                    <option value="Single Ready">Single Ready</option>
                    <option value="Bulk Ready">Bulk Ready</option>
                    <option value="Single & Bulk Ready">Single & Bulk Ready</option>
                    <option value="Made To Order">Made To Order</option>
                    <option value="Pre Order">Pre Order</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">Dispatch Time {renderConfidenceBadge('dispatchTime')}</label>
                  <select value={formData.dispatchTime} onChange={(e) => handleFieldChange('dispatchTime', e.target.value)} className={getFieldClass('dispatchTime', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none cursor-pointer")}>
                    <option value="">Select Dispatch Time</option>
                    <option value="Ships in 24 Hours">Ships in 24 Hours</option>
                    <option value="Ships in 2 Days">Ships in 2 Days</option>
                    <option value="Ships in 3 Days">Ships in 3 Days</option>
                    <option value="Ships in 5 Days">Ships in 5 Days</option>
                    <option value="Made To Order">Made To Order</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Dynamic Specifications Section */}
            <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-sm space-y-4">
              <span className="block text-sm font-display font-bold text-brand-dark border-b pb-2 mb-4">Specifications</span>
              
              {(() => {
                const selectedCat = categories.find(c => c._id === formData.category);
                const catName = selectedCat ? selectedCat.name.toLowerCase() : '';
                
                // Determine which spec configuration to use
                let configKey = null;
                if (catName.includes('saree')) configKey = 'saree';
                else if (catName.includes('kurti')) configKey = 'kurti';
                else if (catName.includes('dress') || catName.includes('material')) configKey = 'dress material';
                else if (catName.includes('accessori') || catName.includes('jewel')) configKey = 'accessori';

                const fields = configKey ? CATEGORY_SPEC_CONFIG[configKey] : [];

                if (fields.length === 0) {
                  return <p className="text-sm text-brand-muted italic">Select a category (e.g. Sarees, Kurtis) to view dynamic specification fields.</p>;
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-fade-in">
                    {fields.map((field) => (
                      <div key={field.key} className="flex flex-col">
                        <label className="font-semibold text-brand-dark mb-1 flex items-center">
                          {field.label} {renderConfidenceBadge(`specifications.${field.key}`)}
                        </label>
                        {field.type === 'select' ? (
                          <select 
                            value={(formData.specifications && formData.specifications[field.key]) || ''} 
                            onChange={(e) => handleSpecChange(field.key, e.target.value)} 
                            className={getFieldClass(`specifications.${field.key}`, "bg-brand-cream px-3 py-2 rounded-md focus:outline-none cursor-pointer")}
                          >
                            <option value="">Select Option</option>
                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input 
                            type="text" 
                            value={(formData.specifications && formData.specifications[field.key]) || ''} 
                            onChange={(e) => handleSpecChange(field.key, e.target.value)} 
                            placeholder={field.placeholder} 
                            className={getFieldClass(`specifications.${field.key}`, "bg-brand-cream px-3 py-2 rounded-md")} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Main Product Media & Sizes */}
            <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-sm space-y-6">
              <span className="block text-sm font-display font-bold text-brand-dark border-b pb-2 mb-4">Main Product</span>
              
              <ProductSizeEditor 
                sizes={formData.mainProductSizes} 
                onChange={(newSizes) => setFormData(prev => ({ ...prev, mainProductSizes: newSizes }))} 
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Upload Area */}
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-2">Product Images *</label>
                  <div className="relative">
                    <PremiumUploadCard state={mainUploadState} onRetry={() => handleImageFilesSelected(null, true)} />
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors select-none ${
                      imageUploading ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-brand-border hover:border-brand-crimson/50 hover:bg-brand-crimson/5'
                    }`}>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageFilesSelected(e.target.files)} disabled={imageUploading} />
                      {imageUploading ? (
                        <><div className="w-6 h-6 border-2 border-brand-crimson border-t-transparent rounded-full animate-spin mb-2" />
                        <span className="text-xs text-brand-muted">Uploading to Cloudinary…</span></>
                      ) : (
                        <><Upload size={20} className="text-brand-muted mb-2" />
                        <span className="text-xs font-semibold text-brand-dark">Click or drag to upload images</span>
                        <span className="text-3xs text-brand-muted mt-1">Multiple files allowed</span></>
                      )}
                    </label>
                  </div>
                  
                  {/* Uploaded images gallery */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 bg-brand-cream/30 p-4 rounded-xl border border-brand-border/40">
                      <p className="text-[10px] font-semibold text-brand-dark uppercase tracking-wider mb-3">Main Gallery ({uploadedImages.length})</p>
                      <div className="flex flex-wrap gap-3">
                        {uploadedImages.map((img, i) => (
                          <div key={img.url || i} className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                            img.isPrimary ? 'border-brand-crimson shadow-md' : 'border-brand-border hover:border-brand-gold'
                          }`} style={{ width: 80, height: 106 }}>
                            <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              {!img.isPrimary && (
                                <button type="button" onClick={() => setPrimaryImage(i)} className="px-2 py-1 rounded bg-brand-gold text-white text-[10px] font-bold shadow-sm" title="Set as primary">Set Primary</button>
                              )}
                              <button type="button" onClick={() => removeUploadedImage(i)} className="p-1.5 rounded-full bg-brand-crimson text-white shadow-sm" title="Remove"><X size={12} /></button>
                            </div>
                            {img.isPrimary && (
                              <span className="absolute bottom-0 left-0 right-0 bg-brand-crimson text-white text-[9px] font-bold tracking-wider text-center py-0.5">PRIMARY ★</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color & Video Area */}
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col bg-brand-cream/20 p-5 rounded-xl border border-brand-border">
                    <div className="flex items-center justify-between mb-3">
                       <label className="font-semibold text-brand-dark flex items-center">Primary Product Color</label>
                       {mainUploadState.aiStatus && (
                         <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-sm ${
                           mainUploadState.aiStatus === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                           mainUploadState.aiStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                           mainUploadState.aiStatus === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                           'bg-red-50 text-red-700 border border-red-200'
                         }`}>
                           {mainUploadState.aiStatus === 'loading' && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                           {mainUploadState.aiStatus === 'success' && <CheckCircle2 size={12} className="shrink-0" />}
                           {mainUploadState.aiStatus === 'warning' && <ShieldAlert size={12} className="shrink-0" />}
                           {mainUploadState.aiStatus === 'error' && <XCircle size={12} className="shrink-0" />}
                           <span>{mainUploadState.aiMessage || 'Processing...'}</span>
                         </div>
                       )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-brand-muted uppercase mb-1 block">Color Name</span>
                        <input type="text" value={formData.colorName || ''} onChange={(e) => { handleFieldChange('colorName', e.target.value); setFormData(p => ({...p, colorManuallyEdited: true}))}} placeholder="e.g. Purple" className="border px-3 py-2.5 rounded-md focus:outline-none bg-brand-white text-xs border-brand-border shadow-sm" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-brand-muted uppercase mb-1 block">Color Hex</span>
                        <div className="flex items-center space-x-2">
                           <input type="color" value={formData.colorHex || '#000000'} onChange={(e) => { handleFieldChange('colorHex', e.target.value); setFormData(p => ({...p, colorManuallyEdited: true}))}} className="w-10 h-10 border rounded cursor-pointer shrink-0 border-brand-border shadow-sm bg-brand-white p-0.5" />
                           <input type="text" value={formData.colorHex || ''} onChange={(e) => { handleFieldChange('colorHex', e.target.value); setFormData(p => ({...p, colorManuallyEdited: true}))}} className="border px-3 py-2.5 rounded-md focus:outline-none bg-brand-white text-xs w-full uppercase font-mono border-brand-border shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">Product Video URL (Optional)</label>
                    <input type="text" value={formData.productVideo} onChange={(e) => setFormData({ ...formData, productVideo: e.target.value })} placeholder="https://youtube.com/shorts/... or Instagram Reel URL" className="bg-brand-cream border px-3 py-2.5 rounded-md text-xs focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO & Publish Details */}
            <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-sm space-y-4">
              <span className="block text-sm font-display font-bold text-brand-dark border-b pb-2 mb-4">SEO & Tagging</span>
              
              <div className="flex flex-col mb-4">
                <label className="font-semibold text-brand-dark mb-1 flex items-center">URL Slug (Auto generated) {renderConfidenceBadge('slug')}</label>
                <input type="text" value={formData.slug} onChange={(e) => handleFieldChange('slug', e.target.value)} className={getFieldClass('slug', "bg-brand-cream px-3 py-2 rounded-md focus:outline-none text-brand-muted")} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="font-semibold text-brand-dark mb-2 block">Occasion Tags</span>
                  <div className="flex flex-wrap gap-2 select-none">
                    {['Casual', 'Festive', 'Wedding', 'Party', 'Daily Wear'].map(tag => (
                      <button key={tag} type="button" onClick={() => handleOccasionTagToggle(tag)} className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${formData.occasionTags.includes(tag) ? 'bg-brand-crimson text-brand-cream border-brand-crimson shadow-sm' : 'bg-brand-cream border-brand-border text-brand-dark hover:border-brand-gold'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-brand-dark mb-2 block">Style Tags</span>
                  <div className="flex flex-wrap gap-2 select-none">
                    {['Traditional', 'Contemporary', 'Designer', 'Ethnic'].map(tag => (
                      <button key={tag} type="button" onClick={() => handleStyleTagToggle(tag)} className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${formData.styleTags.includes(tag) ? 'bg-brand-crimson text-brand-cream border-brand-crimson shadow-sm' : 'bg-brand-cream border-brand-border text-brand-dark hover:border-brand-gold'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 border-t pt-4 font-sans text-xs text-brand-dark select-none">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-brand-crimson h-4 w-4 border-brand-border" />
                  <span className="font-semibold">Is Storefront Active</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded text-brand-crimson h-4 w-4 border-brand-border" />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isBestseller} onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })} className="rounded text-brand-crimson h-4 w-4 border-brand-border" />
                  <span>Bestseller Collection</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isNewArrival} onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })} className="rounded text-brand-crimson h-4 w-4 border-brand-border" />
                  <span>New Arrivals</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.showSizeChart} onChange={(e) => setFormData({ ...formData, showSizeChart: e.target.checked })} className="rounded text-brand-crimson h-4 w-4 border-brand-border" />
                  <span>Show Size Options</span>
                </label>
              </div>

              {/* Rating & Reviews Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-5 mt-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1 flex items-center">
                    Rating Stars (Tick number out of 5)
                  </label>
                  <div className="flex flex-wrap gap-3 items-center py-2 bg-brand-cream/35 px-3 rounded-md border border-brand-border">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <label key={star} className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name="rating-stars"
                          value={star}
                          checked={Math.round(parseFloat(formData.rating || '5')) === star}
                          onChange={() => handleFieldChange('rating', star.toFixed(1))}
                          className="rounded-full text-brand-crimson focus:ring-brand-gold h-4 w-4 border-brand-border"
                        />
                        <span className="text-xs font-semibold text-brand-dark">{star} Star{star > 1 ? 's' : ''}</span>
                      </label>
                    ))}
                    <div className="flex items-center ml-auto border-l pl-3 gap-1.5 border-brand-border">
                      <span className="text-2xs uppercase tracking-wider font-semibold text-brand-muted">Value:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => handleFieldChange('rating', e.target.value)}
                        className="w-16 border px-2 py-1 rounded text-xs text-brand-dark text-center border-brand-border bg-brand-white focus:outline-none focus:ring-1 focus:ring-brand-gold font-bold"
                        placeholder="Custom"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">
                    Number of Ratings (Reviews count) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviewsCount}
                    onChange={(e) => handleFieldChange('reviewsCount', e.target.value)}
                    className="border px-3 py-2.5 rounded-md focus:outline-none bg-brand-white text-xs border-brand-border shadow-sm w-full font-sans"
                    placeholder="e.g. 33"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Variants Section */}
            <div className="bg-transparent space-y-6">
              <div className="flex items-center justify-between border-b-2 border-brand-dark/10 pb-2">
                <div>
                  <h3 className="text-lg font-display font-bold text-brand-dark">Color Variants</h3>
                  <p className="text-xs text-brand-muted mt-0.5">Manage distinct colors and sizes for this product.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {formData.variants.map((v, i) => (
                  <div key={i} className="border border-brand-border rounded-2xl bg-brand-white overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                    {/* Variant Header */}
                    <div className="bg-brand-cream/50 px-5 py-4 flex flex-wrap justify-between items-center border-b border-brand-border gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full border border-brand-border shadow-inner" style={{ backgroundColor: v.colorHex || '#000000' }} />
                        <div>
                          <h4 className="font-bold text-sm text-brand-dark uppercase tracking-wide">Variant {i + 1}</h4>
                          <div className="flex items-center space-x-2 mt-0.5">
                            {v.colorName && <span className="text-[10px] font-semibold text-brand-muted">{v.colorName}</span>}
                            <span className="text-[10px] font-semibold text-brand-muted">•</span>
                            <span className="text-[10px] font-semibold text-brand-muted">{v.images?.length || 0} Images</span>
                            <span className="text-[10px] font-semibold text-brand-muted">•</span>
                            <span className="text-[10px] font-semibold text-brand-muted">Stock: {v.stock}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                         {v.uploadState?.aiStatus && (
                            <div className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-md flex items-center space-x-1.5 ${
                              v.uploadState.aiStatus === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              v.uploadState.aiStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              v.uploadState.aiStatus === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {v.uploadState.aiStatus === 'loading' && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                              {v.uploadState.aiStatus === 'success' && <CheckCircle2 size={12} className="shrink-0" />}
                              {v.uploadState.aiStatus === 'warning' && <ShieldAlert size={12} className="shrink-0" />}
                              {v.uploadState.aiStatus === 'error' && <XCircle size={12} className="shrink-0" />}
                              <span className="hidden sm:inline">{v.uploadState.aiMessage}</span>
                            </div>
                         )}
                        <button type="button" onClick={() => removeVariantRow(i)} className="text-brand-crimson hover:bg-brand-crimson/10 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors">
                          <X size={14} /><span>Delete Variant</span>
                        </button>
                      </div>
                    </div>

                    {/* Variant Body */}
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-8">
                      
                      {/* Left: Configuration */}
                      <div className="lg:col-span-5 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5 block">Color Name</label>
                            <input type="text" value={v.colorName || ''} onChange={(e) => handleVariantChange(i, 'colorName', e.target.value)} placeholder="e.g. Crimson Red" className="border px-3 py-2 rounded-md w-full focus:outline-none text-xs bg-brand-cream/30" required />
                          </div>
                          <div>
                             <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5 block">Color Hex</label>
                             <div className="flex items-center space-x-2">
                                <input type="color" value={v.colorHex || '#000000'} onChange={(e) => handleVariantChange(i, 'colorHex', e.target.value)} className="w-8 h-8 border rounded cursor-pointer shrink-0 p-0.5" />
                                <input type="text" value={v.colorHex || ''} onChange={(e) => handleVariantChange(i, 'colorHex', e.target.value)} className="border px-3 py-2 text-xs rounded-md w-full focus:outline-none font-mono uppercase bg-brand-cream/30" />
                             </div>
                          </div>
                        </div>

                        <ProductSizeEditor 
                          sizes={v.sizes} 
                          onChange={(newSizes) => handleVariantChange(i, 'sizes', newSizes)} 
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-brand-muted uppercase tracking-wider mb-1.5 block">Availability</label>
                            <select value={v.availability || ''} onChange={(e) => handleVariantChange(i, 'availability', e.target.value)} className="border px-3 py-2 rounded-md focus:outline-none cursor-pointer w-full text-xs bg-brand-cream/30">
                              <option value="">Same as Product</option>
                              <option value="Single Ready">Single Ready</option>
                              <option value="Bulk Ready">Bulk Ready</option>
                              <option value="Single & Bulk Ready">Single & Bulk Ready</option>
                              <option value="Made To Order">Made To Order</option>
                              <option value="Pre Order">Pre Order</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Images Gallery */}
                      <div className="lg:col-span-7 lg:border-l lg:pl-6 flex flex-col font-sans">
                        <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider mb-3 block">Variant Media Gallery</label>
                        
                        <div className="flex flex-wrap gap-3">
                          {/* Uploaded images blocks */}
                          {v.images && v.images.map((img, imgIdx) => (
                            <div key={img.url || imgIdx} className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                              img.isPrimary ? 'border-brand-crimson shadow-md' : 'border-brand-border hover:border-brand-gold'
                            }`} style={{ width: 84, height: 112 }}>
                              <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                {!img.isPrimary && (
                                  <button type="button" onClick={() => setVariantPrimaryImage(i, imgIdx)} className="px-2 py-1 rounded bg-brand-gold text-white text-[10px] font-bold shadow-sm">Set Primary</button>
                                )}
                                <button type="button" onClick={() => removeVariantImage(i, imgIdx)} className="p-1.5 rounded-full bg-brand-crimson text-white shadow-sm" title="Remove"><X size={12} /></button>
                              </div>
                              {img.isPrimary && (
                                <span className="absolute bottom-0 left-0 right-0 bg-brand-crimson text-white text-[9px] font-bold tracking-wider text-center py-0.5">PRIMARY ★</span>
                              )}
                            </div>
                          ))}

                          {/* Upload More Button inside Gallery */}
                          <div className="relative" style={{ width: 84, height: 112 }}>
                            <PremiumUploadCard state={v.uploadState} onRetry={() => handleVariantImageUpload(i, null, true)} />
                            <label className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-2 cursor-pointer transition-colors select-none ${
                                v.uploadState?.isUploading ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-brand-border hover:border-brand-crimson/50 hover:bg-brand-crimson/5'
                              }`}>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleVariantImageUpload(i, e.target.files)} disabled={v.uploadState?.isUploading} />
                              {v.uploadState?.isUploading ? (
                                <div className="w-5 h-5 border-2 border-brand-crimson border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <><Upload size={16} className="text-brand-muted mb-1" />
                                <span className="text-[10px] font-semibold text-brand-dark text-center leading-tight">Upload<br/>More</span></>
                              )}
                            </label>
                          </div>
                        </div>
                        
                        {(!v.images || v.images.length === 0) && !v.uploadState?.isUploading && (
                          <p className="text-[10px] text-brand-muted mt-2 italic">Upload images specifically showing this color variant.</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addVariantRow}
                  className="w-full border-2 border-dashed border-brand-border hover:border-brand-gold hover:bg-brand-gold/5 text-brand-dark py-4 rounded-2xl flex items-center justify-center space-x-2 font-bold transition-all shadow-sm"
                >
                  <Plus size={16} />
                  <span>Add New Variant</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Form Actions */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-white/80 backdrop-blur-md border-t border-brand-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex justify-center">
            <div className="max-w-5xl w-full flex items-center justify-between">
              <div className="hidden sm:block">
                <span className="text-xs font-semibold text-brand-muted flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Unsaved Changes</span>
                </span>
              </div>
              <div className="flex space-x-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 sm:flex-none bg-brand-white border border-brand-border text-brand-dark px-6 py-3 rounded-xl font-bold hover:bg-brand-cream transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none bg-brand-dark hover:bg-brand-muted text-brand-cream px-8 py-3 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                </button>
              </div>
            </div>
          </div>

        </form>
      ) : (
        // Products Table List
        <div className="space-y-4">
          
          {/* Search box & filter dropdowns */}
          <div className="flex flex-wrap items-center gap-3 select-none font-sans bg-brand-cream/10 p-4 rounded-xl border border-brand-border/40">
            <div className="flex-grow min-w-[200px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by name..."
                className="w-full bg-brand-white border border-brand-border rounded-md px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            
            <div className="w-44">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-brand-white text-brand-dark border border-brand-border px-3 py-2 rounded-md text-xs focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-brand-white text-brand-dark border border-brand-border px-3 py-2 rounded-md text-xs focus:outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="w-36">
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full bg-brand-white text-brand-dark border border-brand-border px-3 py-2 rounded-md text-xs focus:outline-none cursor-pointer"
              >
                <option value="">All Stock Levels</option>
                <option value="low">Low Stock (&lt;5)</option>
                <option value="out">Out of Stock (0)</option>
              </select>
            </div>

            <button onClick={fetchProducts} className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-4 py-2 rounded-md font-semibold text-xs transition-colors shadow-sm">
              Apply Filters
            </button>
            
            {(search || filterCategory || filterStatus || filterStock) && (
              <button
                onClick={() => {
                  setSearch('');
                  setFilterCategory('');
                  setFilterStatus('');
                  setFilterStock('');
                }}
                className="text-2xs font-bold text-brand-crimson hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
            <table className="min-w-full divide-y divide-brand-border">
              <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Flags</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
                {products.map((prod) => {
                  const img = prod.mainProduct?.primaryImage || prod.mainProduct?.images?.[0]?.url || prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200';
                  return (
                    <tr key={prod._id} className="hover:bg-brand-cream/10">
                      <td className="px-4 py-2 select-none">
                        <img src={img} alt="" className="w-10 h-14 object-cover object-top rounded border shrink-0" />
                      </td>
                      <td className="px-4 py-2 text-left font-display font-semibold text-brand-dark">{prod.name}</td>
                      <td className="px-4 py-2 text-left">{prod.category?.name || 'Unassigned'}</td>
                      <td className="px-4 py-2 text-left">₹{(prod.price / 100).toFixed(0)}</td>
                      <td className={`px-4 py-2 text-left font-bold ${prod.stock < 5 ? 'text-brand-crimson' : 'text-brand-dark'}`}>{prod.stock}</td>
                      <td className="px-4 py-2 text-left select-none text-[10px] space-x-1">
                        {prod.isActive && <span className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded border border-emerald-300">Active</span>}
                        {prod.isFeatured && <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-300">Featured</span>}
                        {prod.isBestseller && <span className="bg-purple-50 text-purple-700 px-1 py-0.5 rounded border border-purple-300">Best</span>}
                      </td>
                      <td className="px-4 py-2 text-center select-none text-2xs font-semibold">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                          <select
                            value={prod.stock > 0 ? 'available' : 'out_of_stock'}
                            onChange={(e) => handleQuickStatusChange(prod, e.target.value)}
                            className="bg-brand-cream border border-brand-border rounded px-2 py-1 text-3xs font-semibold text-brand-dark focus:outline-none cursor-pointer"
                          >
                            <option value="available">🟢 Available</option>
                            <option value="out_of_stock">🔴 Out of Stock</option>
                          </select>
                          <div className="flex items-center space-x-2 text-brand-muted">
                            <button onClick={() => handleEditProductClick(prod)} className="flex items-center space-x-0.5 hover:text-brand-crimson"><Edit size={12} /> <span>Edit</span></button>
                            <button onClick={() => handleDeleteProductClick(prod)} className="flex items-center space-x-0.5 hover:text-brand-crimson"><Trash2 size={12} /> <span>Delete</span></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-brand-muted italic select-none">No products found. Tap 'Add Product' to seed your storefront catalog!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

// -----------------------
// 3. CATEGORIES VIEW
// -----------------------
function CategoriesView({ token }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    displayOrder: '0',
    isActive: true,
    subCategories: []
  });
  const [catImageUploading, setCatImageUploading] = useState(false);

  const handleCatImageUpload = async (file) => {
    if (!file) return;
    setCatImageUploading(true);
    const freshToken = useAuthStore.getState().token;
    try {
      const payload = new FormData();
      payload.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${freshToken}` },
        body: payload
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      useModalStore.getState().error('Error', 'Upload failed');
    } finally {
      setCatImageUploading(false);
    }
  };

  const handleAddSubCat = () => {
    setFormData(prev => ({
      ...prev,
      subCategories: [...(prev.subCategories || []), { name: '', slug: '', imageUrl: '' }]
    }));
  };

  const handleSubCatChange = (idx, field, value) => {
    setFormData(prev => {
      const nextSub = [...(prev.subCategories || [])];
      nextSub[idx] = {
        ...nextSub[idx],
        [field]: value
      };
      if (field === 'name') {
        nextSub[idx].slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return { ...prev, subCategories: nextSub };
    });
  };

  const handleRemoveSubCat = (idx) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== idx)
    }));
  };

  const handleSubCatImageUpload = async (idx, file) => {
    if (!file) return;
    const freshToken = useAuthStore.getState().token;
    try {
      const payload = new FormData();
      payload.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${freshToken}` },
        body: payload
      });
      const data = await res.json();
      if (res.ok && data.url) {
        handleSubCatChange(idx, 'imageUrl', data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      useModalStore.getState().error('Error', 'Upload failed');
    }
  };

  const fetchCats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = editingCat ? 'PUT' : 'POST';
    const endpoint = editingCat ? `/api/categories/${editingCat._id}` : '/api/categories';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const resData = await response.json();
      if (response.ok) {
        setFormOpen(false);
        setEditingCat(null);
        fetchCats();
      } else {
        alert(resData.error || 'Failed to submit category details.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      displayOrder: cat.displayOrder.toString(),
      isActive: cat.isActive,
      subCategories: cat.subCategories || []
    });
    setFormOpen(true);
  };

  const handleDeleteClick = async (cat) => {
    console.log('[handleDeleteClick] Clicked for category:', cat);
    if (!(await useModalStore.getState().confirm('Confirmation', `Delete category "${cat.name}"?`))) {
      console.log('[handleDeleteClick] User cancelled deletion confirmation');
      return;
    }

    try {
      const freshToken = useAuthStore.getState().token;
      console.log('[handleDeleteClick] Sending DELETE request with token:', freshToken ? 'present' : 'missing');
      const response = await fetch(`/api/categories/${cat._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${freshToken}` }
      });
      const data = await response.json();
      console.log('[handleDeleteClick] Response status:', response.status, 'data:', data);
      if (response.ok) {
        console.log('[handleDeleteClick] Category deleted successfully');
        fetchCats();
      } else {
        console.error('[handleDeleteClick] Delete failed. Error:', data);
        alert(data.error || 'Deletion failed.');
      }
    } catch (e) {
      console.error('[handleDeleteClick] Network error:', e);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b pb-3 select-none">
        <h2 className="font-display font-bold text-brand-dark text-xl">Categories Management</h2>
        {!formOpen && (
          <button
            onClick={() => {
              setEditingCat(null);
              setFormData({ name: '', slug: '', description: '', imageUrl: '', displayOrder: '0', isActive: true, subCategories: [] });
              setFormOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-muted text-brand-cream text-xs font-semibold px-4 py-2 rounded-lg border border-brand-gold/30 shadow-md"
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {formOpen ? (
        <form onSubmit={handleFormSubmit} className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-4 max-w-xl font-sans text-xs">
          <h3 className="font-display font-bold text-brand-dark text-sm">{editingCat ? `Edit: ${editingCat.name}` : 'New Category Details'}</h3>
          
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Category Name *</label>
            <input type="text" value={formData.name} onChange={handleNameChange} className="bg-brand-cream border px-3 py-2 rounded-md" required />
          </div>
          
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">URL Slug</label>
            <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md text-brand-muted" required />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-brand-cream border p-2.5 rounded-md" />
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Category Image</label>
            {/* Upload button */}
            <label className={`flex items-center gap-2 border-2 border-dashed rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
              catImageUploading ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-brand-border hover:border-brand-crimson/50'
            }`}>
              <input type="file" accept="image/*" className="hidden" disabled={catImageUploading}
                onChange={(e) => handleCatImageUpload(e.target.files?.[0])} />
              {catImageUploading
                ? <><div className="w-4 h-4 border-2 border-brand-crimson border-t-transparent rounded-full animate-spin" /><span>Uploading…</span></>
                : <><Upload size={14} className="text-brand-muted" /><span>Upload image from device</span></>}
            </label>
            {/* URL fallback */}
            <input type="text" value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Or paste image URL"
              className="bg-brand-cream border px-3 py-2 rounded-md mt-2" />
            {formData.imageUrl && (
              <div className="w-16 h-14 overflow-hidden border mt-2 rounded">
                <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Sub-categories Form Section */}
          <div className="border-t border-brand-border/60 pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-brand-dark text-xs uppercase tracking-wider text-brand-gold">Sub-categories</span>
              <button
                type="button"
                onClick={handleAddSubCat}
                className="bg-brand-dark hover:bg-brand-muted text-brand-cream text-3xs font-semibold px-2 py-1.5 rounded flex items-center space-x-1"
              >
                <Plus size={10} />
                <span>Add Sub-category</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.subCategories?.map((sub, idx) => (
                <div key={idx} className="border border-brand-border/60 p-3 rounded-lg bg-brand-cream/10 relative space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">Sub-category Name *</label>
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => handleSubCatChange(idx, 'name', e.target.value)}
                        className="bg-brand-white border px-2 py-1 rounded"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={sub.slug}
                        onChange={(e) => handleSubCatChange(idx, 'slug', e.target.value)}
                        className="bg-brand-white border px-2 py-1 rounded text-brand-muted"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">Sub-category Cover Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={sub.imageUrl}
                        onChange={(e) => handleSubCatChange(idx, 'imageUrl', e.target.value)}
                        placeholder="Paste image URL here"
                        className="flex-grow bg-brand-white border px-2 py-1 text-2xs rounded"
                      />
                      <label className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-3 py-1 text-2xs rounded cursor-pointer font-semibold whitespace-nowrap shrink-0 flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSubCatImageUpload(idx, e.target.files?.[0])}
                        />
                        Upload
                      </label>
                    </div>
                    {sub.imageUrl && (
                      <div className="mt-2 w-12 h-12 rounded border overflow-hidden">
                        <img src={sub.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSubCat(idx)}
                    className="text-brand-crimson hover:text-brand-dark absolute top-1 right-2 text-2xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(!formData.subCategories || formData.subCategories.length === 0) && (
                <p className="text-3xs text-brand-muted italic">No sub-categories defined for this category yet.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col w-32 border-t pt-4">
            <label className="font-semibold text-brand-dark mb-1">Display Order</label>
            <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md" />
          </div>

          <div className="flex items-center space-x-2.5 pt-2 select-none font-sans text-xs">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
            <span>Active category visible to storefront</span>
          </div>

          <div className="flex space-x-2 pt-2">
            <button type="submit" className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-5 py-2 rounded-lg font-semibold transition-colors border border-brand-gold/30">Save Category</button>
            <button type="button" onClick={() => { setFormOpen(false); setEditingCat(null); }} className="bg-brand-white border text-brand-dark px-5 py-2 rounded-lg font-semibold hover:bg-brand-cream">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
          <table className="min-w-full divide-y divide-brand-border">
            <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
              <tr>
                <th className="px-4 py-3">Banner</th>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
              {categories.map(cat => {
                const img = cat.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200';
                return (
                  <tr key={cat._id} className="hover:bg-brand-cream/10">
                    <td className="px-4 py-2 select-none"><img src={img} alt="" className="w-12 h-10 object-cover rounded border" /></td>
                    <td className="px-4 py-2 font-display font-semibold text-brand-dark text-sm">{cat.name}</td>
                    <td className="px-4 py-2 font-bold">{cat.productsCount || 0}</td>
                    <td className="px-4 py-2">{cat.displayOrder}</td>
                    <td className="px-4 py-2 select-none">{cat.isActive ? <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-300 text-3xs font-bold uppercase tracking-wider">Active</span> : <span className="bg-red-50 text-brand-crimson px-2 py-0.5 rounded border border-brand-crimson/30 text-3xs font-bold uppercase">Disabled</span>}</td>
                    <td className="px-4 py-2 text-center select-none text-2xs font-semibold">
                      <div className="flex justify-center space-x-3 text-brand-muted">
                        <button onClick={() => handleEditClick(cat)} className="flex items-center space-x-0.5 hover:text-brand-crimson"><Edit size={12} /> <span>Edit</span></button>
                        <button onClick={() => handleDeleteClick(cat)} className="flex items-center space-x-0.5 hover:text-brand-crimson"><Trash2 size={12} /> <span>Delete</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -----------------------
// 4. ORDERS VIEW
// -----------------------
function OrdersView({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({ date: 'all', status: 'all', payment: 'all', sort: 'newest' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [trackingInfo, setTrackingInfo] = useState({ courier: 'Delhivery', tracking: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [search]);

  useEffect(() => {
    if (selectedOrder) {
      setTrackingInfo({ courier: selectedOrder.courierName || 'Delhivery', tracking: selectedOrder.trackingNumber || '' });
    }
  }, [selectedOrder?._id]);

  // KPIs
  const today = new Date();
  today.setHours(0,0,0,0);
  const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const readyToShip = orders.filter(o => o.status === 'processing').length;
  const todaysRevenue = orders.filter(o => new Date(o.createdAt) >= today && o.payment?.status === 'paid').reduce((sum, o) => sum + (o.pricing?.total || 0), 0) / 100;

  // Filtering
  const filteredOrders = orders.filter(o => {
    if (activeFilters.status !== 'all' && o.status !== activeFilters.status) return false;
    
    if (activeFilters.payment === 'paid' && o.payment?.status !== 'paid') return false;
    if (activeFilters.payment === 'cod' && o.payment?.method !== 'COD') return false;
    if (activeFilters.payment === 'online' && o.payment?.method === 'COD') return false;

    if (activeFilters.date !== 'all') {
      const orderDate = new Date(o.createdAt);
      orderDate.setHours(0,0,0,0);
      if (activeFilters.date === 'today' && orderDate.getTime() !== today.getTime()) return false;
      if (activeFilters.date === 'yesterday') {
        const y = new Date(today); y.setDate(y.getDate() - 1);
        if (orderDate.getTime() !== y.getTime()) return false;
      }
      if (activeFilters.date === '7days') {
        const d7 = new Date(today); d7.setDate(d7.getDate() - 7);
        if (orderDate < d7) return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (activeFilters.sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (activeFilters.sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (activeFilters.sort === 'highest') return (b.pricing?.total || 0) - (a.pricing?.total || 0);
    return 0;
  });

  const updateStatus = async (orderId, status) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    if (selectedOrder?._id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status }));
    }
    showToast(`Order marked as ${status}`);

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      showToast('Failed to sync status', 'error');
    }
  };

  const handleShipOrder = async () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(o => o._id === selectedOrder._id ? { ...o, status: 'shipped', courierName: trackingInfo.courier, trackingNumber: trackingInfo.tracking } : o));
    setSelectedOrder(prev => ({ ...prev, status: 'shipped', courierName: trackingInfo.courier, trackingNumber: trackingInfo.tracking }));
    showToast(`Order marked as Shipped via ${trackingInfo.courier}`);

    try {
      await fetch(`/api/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'shipped', courierName: trackingInfo.courier, trackingNumber: trackingInfo.tracking })
      });
    } catch (e) {
      showToast('Failed to sync shipping', 'error');
    }
  };

  const handleBulkUpdate = async (status) => {
    if (!selectedRows.length) return;
    for (const id of selectedRows) {
      await updateStatus(id, status);
    }
    setSelectedRows([]);
  };

  const StatusColorStrip = (status) => {
    const m = { pending: 'bg-orange-500', confirmed: 'bg-blue-500', processing: 'bg-purple-500', shipped: 'bg-cyan-500', delivered: 'bg-emerald-500', cancelled: 'bg-red-500' };
    return m[status] || 'bg-gray-400';
  };

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
  
  const FilterChip = ({ label, group, val }) => {
    const isActive = activeFilters[group] === val;
    return (
      <button onClick={() => setActiveFilters(prev => ({ ...prev, [group]: isActive ? 'all' : val }))} 
        className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border transition-colors ${isActive ? 'bg-brand-dark text-white border-brand-dark shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}>
        {label}
      </button>
    );
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied!`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] font-sans text-gray-900 bg-gray-50 -mx-8 -my-8 p-4 pt-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[100] px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 font-bold text-sm ${toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-900 text-white border-gray-800'}`}
          >
            {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-400" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP SECTION */}
      <div className="flex-none mb-4 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { title: "Today's Orders", val: todaysOrders, icon: <ShoppingBag size={18}/>, color: 'text-blue-600' },
            { title: "Pending Orders", val: pendingOrders, icon: <Clock size={18}/>, color: 'text-orange-600' },
            { title: "Ready to Ship", val: readyToShip, icon: <Package size={18}/>, color: 'text-purple-600' },
            { title: "Today's Revenue", val: `₹${formatINR(todaysRevenue)}`, icon: <IndianRupee size={18}/>, color: 'text-emerald-600' }
          ].map((k, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between group">
              <div>
                <div className="text-xs font-bold text-gray-500 mb-0.5">{k.title}</div>
                <div className="text-xl font-black text-gray-900">{k.val}</div>
              </div>
              <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center ${k.color} group-hover:scale-110 transition-transform`}>{k.icon}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative w-full md:w-64 flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Order ID, Phone..." className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark shadow-sm" />
          </div>
          
          <div className="flex-1 flex flex-wrap items-center gap-2">
            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>
            <FilterChip group="date" val="today" label="Today" />
            <FilterChip group="date" val="yesterday" label="Yesterday" />
            <FilterChip group="date" val="7days" label="Last 7 Days" />
            
            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>
            <FilterChip group="status" val="pending" label="Pending" />
            <FilterChip group="status" val="confirmed" label="Confirmed" />
            <FilterChip group="status" val="processing" label="Processing" />
            <FilterChip group="status" val="shipped" label="Shipped" />
            
            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>
            <FilterChip group="payment" val="paid" label="Paid" />
            <FilterChip group="payment" val="cod" label="COD" />
            
            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block"></div>
            <FilterChip group="sort" val="newest" label="Newest" />
            <FilterChip group="sort" val="highest" label="High Value" />
          </div>
        </div>
      </div>

      {/* TWO PANEL LAYOUT */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* LEFT PANEL: Master List */}
        <div className="w-1/3 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex-none relative">
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center z-10">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{filteredOrders.length} Orders</div>
            {selectedRows.length > 0 && (
              <div className="text-xs font-bold text-brand-dark bg-brand-dark/10 px-2 py-0.5 rounded">{selectedRows.length} Selected</div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 flex justify-center text-gray-400"><Loader2 className="animate-spin" size={24}/></div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-10 text-center text-gray-400 font-medium text-sm">No orders match filters</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const isSelected = selectedOrder?._id === order._id;
                  const isChecked = selectedRows.includes(order._id);
                  return (
                    <div 
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`relative p-4 cursor-pointer transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50/50' : 'bg-white'}`}
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${StatusColorStrip(order.status)}`}></div>
                      
                      <div className="flex gap-3">
                        <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                          <input type="checkbox" checked={isChecked} onChange={() => setSelectedRows(prev => isChecked ? prev.filter(r => r !== order._id) : [...prev, order._id])} className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark cursor-pointer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-black text-gray-900 text-sm truncate">#{order.orderId.toUpperCase()}</span>
                            <span className="font-black text-gray-900 text-sm whitespace-nowrap">₹{formatINR((order.pricing?.total || 0) / 100)}</span>
                          </div>
                          <div className="text-sm font-bold text-gray-700 truncate">{order.shippingAddress?.name}</div>
                          <div className="text-xs text-gray-500 truncate mb-2">{order.shippingAddress?.phone} • {order.items?.length || 0} Products</div>
                          
                          <div className="flex justify-between items-center mt-1">
                            <div className="flex gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-600 border border-gray-200">{order.status}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${order.payment?.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                {order.payment?.status === 'pending' && order.payment?.method === 'COD' ? 'COD' : order.payment?.status}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-gray-400">
                              {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Detail View */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden relative">
          
          {selectedRows.length > 0 ? (
            // BULK ACTIONS STATE
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
              <div className="w-20 h-20 bg-brand-dark/10 rounded-full flex items-center justify-center mb-6">
                <Layers size={32} className="text-brand-dark" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">{selectedRows.length} Orders Selected</h3>
              <p className="text-gray-500 font-medium mb-8">Perform bulk actions on all selected orders simultaneously.</p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <button onClick={() => showToast('Printing multiple invoices...')} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-dark hover:shadow-md transition-all font-bold flex flex-col items-center gap-2"><Printer size={20}/> Print Invoices</button>
                <button onClick={() => handleBulkUpdate('processing')} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all font-bold text-purple-700 flex flex-col items-center gap-2"><RefreshCw size={20}/> Pack Orders</button>
                <button onClick={() => handleBulkUpdate('shipped')} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-cyan-500 hover:shadow-md transition-all font-bold text-cyan-700 flex flex-col items-center gap-2"><Truck size={20}/> Ship Orders</button>
                <button onClick={() => handleBulkUpdate('cancelled')} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-red-500 hover:shadow-md transition-all font-bold text-red-600 flex flex-col items-center gap-2"><XCircle size={20}/> Cancel Orders</button>
              </div>
            </div>
          ) : !selectedOrder ? (
            // EMPTY STATE
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
                <Box size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-400">Select an order to view details</h3>
            </div>
          ) : (
            // SINGLE ORDER DETAIL
            <>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                
                {/* Header: ID, Date, Quick Actions */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                      #{selectedOrder.orderId.toUpperCase()}
                      <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider text-white ${StatusColorStrip(selectedOrder.status)}`}>{selectedOrder.status}</span>
                    </h2>
                    <p className="text-sm font-semibold text-gray-500 mt-2 flex items-center gap-2">
                      <Calendar size={14}/> {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(selectedOrder.orderId, 'Order ID')} className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600" title="Copy Order ID"><Copy size={16}/></button>
                    <a href={`/api/orders/${selectedOrder.orderId}/invoice`} target="_blank" className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600" title="Print Invoice"><Printer size={16}/></a>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  
                  {/* Customer Info */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2"><Users size={16} className="text-gray-400"/> Customer Details</h3>
                        <div className="flex gap-2">
                          <a href={`https://wa.me/${selectedOrder.shippingAddress?.phone.replace(/\D/g,'')}`} target="_blank" className="text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1"><MessageSquare size={12}/> WhatsApp</a>
                          <a href={`tel:${selectedOrder.shippingAddress?.phone}`} className="text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1"><Phone size={12}/> Call</a>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <div className="text-lg font-black text-gray-900 mb-1">{selectedOrder.shippingAddress?.name}</div>
                          <div className="text-sm font-semibold text-gray-600">{selectedOrder.shippingAddress?.email || 'No email provided'}</div>
                          <div className="text-sm font-semibold text-gray-600 flex items-center gap-1 mt-1"><Phone size={12}/> {selectedOrder.shippingAddress?.phone}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 leading-relaxed mb-2">
                            {selectedOrder.shippingAddress?.street}<br/>
                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.pincode}
                          </div>
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedOrder.shippingAddress?.street}, ${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.pincode}`)}`} target="_blank" className="text-xs font-bold text-brand-dark hover:underline flex items-center gap-1">
                            <MapPin size={12}/> Open in Google Maps
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4"><ShoppingBag size={16} className="text-gray-400"/> Ordered Items ({selectedOrder.items?.length || 0})</h3>
                      <div className="space-y-4">
                        {selectedOrder.items?.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <img src={item.productImg || 'https://via.placeholder.com/150'} alt="" className="w-20 h-24 object-cover rounded-xl border border-gray-100" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2">{item.productName}</h4>
                              <div className="text-xs font-semibold text-gray-500 mt-1.5 space-y-1">
                                {item.colorName && <div>Color: <span className="text-gray-900">{item.colorName}</span></div>}
                                <div>Size: <span className="text-gray-900">{item.size}</span></div>
                                <div>Qty: <span className="text-gray-900">{item.quantity}</span></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-gray-900 text-base">₹{formatINR(item.price / 100)}</div>
                              <div className="text-xs font-bold text-gray-400 mt-1">Total: ₹{formatINR((item.price * item.quantity) / 100)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar (Summary, Payment, Timeline) */}
                  <div className="space-y-6">
                    
                    {/* Payment Summary */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4"><CreditCard size={16} className="text-gray-400"/> Payment Summary</h3>
                      <div className="space-y-3 text-sm font-semibold text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>₹{formatINR((selectedOrder.pricing?.subtotal || 0) / 100)}</span>
                        </div>
                        {selectedOrder.pricing?.discount > 0 && (
                          <div className="flex justify-between text-brand-crimson">
                            <span>Discount</span>
                            <span>-₹{formatINR((selectedOrder.pricing?.discount || 0) / 100)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>{selectedOrder.pricing?.shipping > 0 ? `₹${formatINR(selectedOrder.pricing.shipping / 100)}` : 'Free'}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between items-center mt-2">
                          <span className="font-black text-gray-900">Grand Total</span>
                          <span className="text-xl font-black text-brand-dark">₹{formatINR((selectedOrder.pricing?.total || 0) / 100)}</span>
                        </div>
                      </div>

                      <div className="mt-5 p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Method</div>
                          <div className="text-xs font-black text-gray-900 uppercase">{selectedOrder.payment?.method || 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Status</div>
                          <div className={`text-xs font-black uppercase ${selectedOrder.payment?.status === 'paid' ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {selectedOrder.payment?.status === 'pending' && selectedOrder.payment?.method === 'COD' ? 'COD' : selectedOrder.payment?.status}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PREMIUM SHIPPING & LOGISTICS CARD */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] overflow-hidden">
                      {/* Header */}
                      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                            <Truck size={18} className="text-brand-dark"/> Shipping Details
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            selectedOrder.status === 'pending' ? 'bg-gray-100 text-gray-500' :
                            selectedOrder.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                            selectedOrder.status === 'shipped' ? 'bg-cyan-100 text-cyan-700' :
                            selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {selectedOrder.status === 'pending' ? 'Not Shipped' :
                             selectedOrder.status === 'processing' ? 'Packed' :
                             selectedOrder.status === 'shipped' ? 'In Transit' :
                             selectedOrder.status === 'delivered' ? 'Delivered' : 'Cancelled'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-500">Manage courier assignment and shipment tracking.</p>
                      </div>

                      <div className="p-5 space-y-6">
                        {/* Courier Dropdown */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Courier Partner</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Box size={16} className="text-gray-400"/>
                            </div>
                            <select 
                              value={trackingInfo.courier} 
                              onChange={e => setTrackingInfo({...trackingInfo, courier: e.target.value})} 
                              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-brand-dark focus:bg-white focus:ring-2 focus:ring-brand-dark/20 appearance-none cursor-pointer"
                            >
                              <option value="Shiprocket">Shiprocket</option>
                              <option value="Delhivery">Delhivery</option>
                              <option value="Blue Dart">Blue Dart</option>
                              <option value="DTDC">DTDC</option>
                              <option value="XpressBees">XpressBees</option>
                              <option value="Ekart">Ekart</option>
                              <option value="India Post">India Post</option>
                              <option value="Professional Couriers">Professional Couriers</option>
                              <option value="Shadowfax">Shadowfax</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <ChevronDown size={14} className="text-gray-400"/>
                            </div>
                          </div>
                        </div>

                        {/* Tracking Input */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tracking / AWB Number</label>
                          <div className="relative flex items-center">
                            <input 
                              type="text" 
                              value={trackingInfo.tracking} 
                              onChange={e => setTrackingInfo({...trackingInfo, tracking: e.target.value})} 
                              placeholder="Enter Tracking / AWB Number" 
                              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-base font-black text-gray-900 focus:outline-none focus:border-brand-dark focus:bg-white focus:ring-2 focus:ring-brand-dark/20" 
                            />
                            {trackingInfo.tracking.length > 5 && (
                              <div className="absolute right-3 flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                                <CheckCircle2 size={14}/> Verified
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={handleShipOrder} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-brand-muted transition-colors"><Truck size={14}/> Ship</button>
                          <button onClick={() => showToast('Printing Shipping Label...')} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"><Printer size={14}/> Label</button>
                          <button onClick={() => copyToClipboard(trackingInfo.tracking, 'Tracking Number')} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"><Copy size={14}/> Copy</button>
                          <button onClick={() => window.open(`https://www.google.com/search?q=${trackingInfo.tracking}+tracking`, '_blank')} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors"><Activity size={14}/> Track</button>
                          <button onClick={() => window.open(`https://wa.me/${selectedOrder.shippingAddress?.phone.replace(/\D/g,'')}?text=Your order ${selectedOrder.orderId} tracking number is ${trackingInfo.tracking} via ${trackingInfo.courier}`, '_blank')} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-lg text-xs font-bold transition-colors"><MessageSquare size={14}/> WhatsApp</button>
                          <button onClick={() => window.location.href = `mailto:${selectedOrder.shippingAddress?.email}?subject=Your Order Tracking Info`} className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"><Mail size={14}/> Email</button>
                        </div>
                        
                        {/* Pickup Details */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-2">
                            <Clock size={16} className="text-gray-400 mt-0.5 shrink-0"/>
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Expected Pickup</div>
                              <div className="text-xs font-bold text-gray-800">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-2">
                            <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0"/>
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Est. Delivery</div>
                              <div className="text-xs font-bold text-gray-800">3-5 Biz Days</div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* NEW TRACKING TIMELINE */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-6">Tracking Timeline</h3>
                      <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                        {[
                          { id: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle2 size={12}/> },
                          { id: 'processing', label: 'Packed', icon: <Box size={12}/> },
                          { id: 'shipped', label: 'Picked Up / In Transit', icon: <Truck size={12}/> },
                          { id: 'out', label: 'Out for Delivery', icon: <MapPin size={12}/> },
                          { id: 'delivered', label: 'Delivered', icon: <CheckCircle2 size={12}/> }
                        ].map((step, i) => {
                          const statusMap = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 5, cancelled: -1 };
                          const currentLevel = statusMap[selectedOrder.status] || 0;
                          
                          let isPast = currentLevel >= i + 1;
                          let isActive = currentLevel === i + 1;
                          if (selectedOrder.status === 'delivered') { isPast = true; isActive = false; }
                          
                          let dotColor = 'bg-gray-100 border-gray-300 text-gray-400';
                          if (isPast) dotColor = 'bg-brand-dark border-brand-dark text-white';
                          if (isActive) dotColor = 'bg-white border-brand-dark text-brand-dark shadow-[0_0_0_4px_rgba(0,0,0,0.05)]';
                          if (selectedOrder.status === 'cancelled') dotColor = 'bg-gray-100 border-gray-300 text-gray-300';

                          return (
                            <div key={step.id} className="relative pl-6">
                              <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${dotColor} z-10 transition-colors`}>
                                {isPast ? step.icon : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                              </div>
                              <div className={`text-sm font-bold -mt-0.5 ${isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
              
              {/* STICKY BOTTOM ACTION BAR */}
              <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20">
                <div className="flex flex-wrap items-center justify-between gap-4 max-w-4xl mx-auto">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateStatus(selectedOrder._id, 'confirmed')} className={`px-5 py-3 rounded-xl font-black text-sm transition-all border-2 ${selectedOrder.status === 'pending' ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}>
                      ✓ Confirm
                    </button>
                    <button onClick={() => updateStatus(selectedOrder._id, 'processing')} className={`px-5 py-3 rounded-xl font-black text-sm transition-all border-2 ${selectedOrder.status === 'confirmed' ? 'bg-purple-600 text-white border-purple-600 shadow-md hover:bg-purple-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}>
                      📦 Pack
                    </button>
                    <button onClick={handleShipOrder} className={`px-5 py-3 rounded-xl font-black text-sm transition-all border-2 ${selectedOrder.status === 'processing' ? 'bg-cyan-600 text-white border-cyan-600 shadow-md hover:bg-cyan-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}>
                      🚚 Ship
                    </button>
                    <button onClick={() => updateStatus(selectedOrder._id, 'delivered')} className={`px-5 py-3 rounded-xl font-black text-sm transition-all border-2 ${selectedOrder.status === 'shipped' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md hover:bg-emerald-700' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'}`}>
                      ✅ Deliver
                    </button>
                  </div>
                  <div>
                    <button onClick={() => updateStatus(selectedOrder._id, 'cancelled')} className="px-5 py-3 rounded-xl font-black text-sm transition-all bg-white text-red-500 hover:bg-red-50 hover:text-red-700">
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
      
      <style>{`
        /* Custom scrollbar for inner panes to keep it sleek */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E5E7EB; border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #D1D5DB; }
      `}</style>
    </div>
  );
}

// -----------------------
// 5. CUSTOMERS VIEW
// -----------------------
function CustomersView({ token }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCusts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/customers?search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCusts();
  }, [search]);

  const toggleAdminRole = async (cust) => {
    const newRole = cust.role === 'admin' ? 'customer' : 'admin';
    if (!(await useModalStore.getState().confirm('Confirmation', `Change role of user ${cust.email} to: ${newRole}?`))) return;

    try {
      const response = await fetch(`/api/admin/customers/${cust.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        fetchCusts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <h2 className="font-display font-bold text-brand-dark text-xl border-b pb-3 select-none">Customers Database</h2>

      <div className="flex flex-col sm:flex-row gap-2 max-w-md select-none font-sans">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="flex-grow bg-brand-white border border-brand-border rounded-md px-3 py-2 text-xs focus:outline-none"
        />
        <button onClick={fetchCusts} className="bg-brand-dark text-brand-cream px-4 py-2 rounded-md font-semibold text-xs">Search</button>
      </div>

      <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
            <tr>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Joined Date</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Total Spent</th>
              <th className="px-4 py-3 text-center">Admin Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
            {customers.map(cust => (
              <tr key={cust._id} className="hover:bg-brand-cream/10">
                <td className="px-4 py-3 font-semibold text-brand-dark">{cust.fullName || 'No Name'}</td>
                <td className="px-4 py-3">{cust.email}</td>
                <td className="px-4 py-3">{cust.phone || 'N/A'}</td>
                <td className="px-4 py-3">{new Date(cust.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 font-bold">{cust.ordersCount}</td>
                <td className="px-4 py-3 font-bold text-brand-crimson">₹{cust.totalSpent.toFixed(0)}</td>
                <td className="px-4 py-3 text-center select-none">
                  <button
                    onClick={() => toggleAdminRole(cust)}
                    className={`px-3 py-1 rounded text-3xs font-bold uppercase tracking-wider ${
                      cust.role === 'admin' ? 'bg-red-50 text-brand-crimson border border-brand-crimson/30' : 'bg-gray-100 text-brand-muted hover:border-brand-crimson'
                    }`}
                  >
                    {cust.role === 'admin' ? 'Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------
// 6. COUPONS VIEW
// -----------------------
function CouponsView({ token }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage', // 'percentage' | 'flat'
    value: '',
    minOrderValue: '0',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCoupons(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/coupons/${editingId}` : '/api/coupons';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormOpen(false);
        setEditingId(null);
        fetchCoupons();
      } else {
        const d = await response.json();
        alert(d.error || 'Failed to submit coupon.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClick = async (coup) => {
    if (!(await useModalStore.getState().confirm('Confirmation', `Delete coupon code "${coup.code}"?`))) return;
    try {
      const response = await fetch(`/api/coupons/${coup._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchCoupons();
      } else {
        useModalStore.getState().info('Information', data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b pb-3 select-none">
        <h2 className="font-display font-bold text-brand-dark text-xl">Coupons Manager</h2>
        {!formOpen && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ code: '', type: 'percentage', value: '', minOrderValue: '0', maxUses: '', validFrom: '', validUntil: '', isActive: true });
              setFormOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-muted text-brand-cream text-xs font-semibold px-4 py-2 rounded-lg border border-brand-gold/30 shadow-md"
          >
            <Plus size={14} />
            <span>Create Coupon</span>
          </button>
        )}
      </div>

      {formOpen ? (
        <form onSubmit={handleFormSubmit} className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-4 max-w-xl font-sans text-xs">
          <h3 className="font-display font-bold text-brand-dark text-sm">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Coupon Code (Uppercase enforced) *</label>
            <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="bg-brand-cream border px-3 py-2 rounded-md font-bold tracking-widest text-center" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Type *</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md cursor-pointer">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (INR)</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Discount Value *</label>
              <input type="number" step="0.01" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md" required />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Min Order Threshold (INR)</label>
              <input type="number" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md" />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Max Uses limit</label>
              <input type="number" placeholder="Leave empty for unlimited" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md" />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Valid From</label>
              <input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md cursor-pointer" />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Valid Until</label>
              <input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center space-x-2.5 pt-2 select-none font-sans text-xs">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
            <span>Active code serviceable at cart checkouts</span>
          </div>

          <div className="flex space-x-2 pt-2">
            <button type="submit" className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-5 py-2 rounded-lg font-semibold transition-colors border border-brand-gold/30">Save Coupon</button>
            <button type="button" onClick={() => { setFormOpen(false); setEditingId(null); }} className="bg-brand-white border text-brand-dark px-5 py-2 rounded-lg font-semibold hover:bg-brand-cream">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
          <table className="min-w-full divide-y divide-brand-border">
            <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Redeemed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
              {coupons.map(coup => (
                <tr key={coup._id} className="hover:bg-brand-cream/10">
                  <td className="px-4 py-3 text-brand-crimson font-bold tracking-widest">{coup.code}</td>
                  <td className="px-4 py-3 capitalize">{coup.type}</td>
                  <td className="px-4 py-3 font-semibold text-brand-dark">{coup.type === 'percentage' ? `${coup.value}%` : `₹${(coup.value / 100).toFixed(0)}`}</td>
                  <td className="px-4 py-3">₹{(coup.minOrderValue / 100).toFixed(0)}</td>
                  <td className="px-4 py-3 font-bold">{coup.usedCount} {coup.maxUses ? `/ ${coup.maxUses}` : ''}</td>
                  <td className="px-4 py-3 select-none">{coup.isActive ? <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-300 text-3xs font-bold uppercase">Active</span> : <span className="bg-red-50 text-brand-crimson px-2 py-0.5 rounded border border-brand-crimson/30 text-3xs font-bold uppercase">Disabled</span>}</td>
                  <td className="px-4 py-3 text-center select-none text-2xs font-semibold">
                    <button
                      onClick={() => handleDeleteClick(coup)}
                      disabled={coup.usedCount > 0}
                      className="text-brand-crimson hover:underline font-bold disabled:opacity-30 disabled:hover:no-underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-brand-muted italic select-none">No coupon codes configured. Create one above for customer checkout rebates!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -----------------------
// 7. REVIEWS MODERATION VIEW
// -----------------------
function ReviewsView({ token }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyIndexId, setReplyIndexId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [products, setProducts] = useState([]);

  // Manual review form state
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    productId: '',
    customerName: '',
    rating: 5,
    comment: '',
    isVerified: false,
    isApproved: true
  });
  const [manualFormSubmitting, setManualFormSubmitting] = useState(false);
  const [manualFormError, setManualFormError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const handleApprove = async (revId) => {
    try {
      const response = await fetch(`/api/reviews/${revId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (revId) => {
    try {
      const response = await fetch(`/api/reviews/${revId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (revId) => {
    try {
      const response = await fetch(`/api/reviews/${revId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setDeleteConfirmId(null);
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/reviews/${replyIndexId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });
      if (response.ok) {
        setReplyIndexId(null);
        setReplyText('');
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualFormError('');
    if (!manualForm.productId || !manualForm.customerName || !manualForm.comment) {
      setManualFormError('Product, customer name, and comment are required.');
      return;
    }
    setManualFormSubmitting(true);
    try {
      const response = await fetch('/api/reviews/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(manualForm)
      });
      const data = await response.json();
      if (response.ok) {
        setManualFormOpen(false);
        setManualForm({ productId: '', customerName: '', rating: 5, comment: '', isVerified: false, isApproved: true });
        fetchReviews();
      } else {
        setManualFormError(data.error || 'Failed to create review.');
      }
    } catch (e) {
      console.error(e);
      setManualFormError('Network error creating review.');
    } finally {
      setManualFormSubmitting(false);
    }
  };

  const getSentimentColor = (sent) => {
    switch (sent) {
      case 'positive': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'negative': return 'bg-red-50 text-red-700 border-red-300';
      case 'flagged': return 'bg-red-100 text-brand-crimson border-brand-crimson/50 font-bold';
      default: return 'bg-gray-100 text-brand-muted border-gray-300';
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(rev => {
    if (filterTab === 'pending') return !rev.isApproved;
    if (filterTab === 'approved') return rev.isApproved;
    if (filterTab === 'flagged') return rev.sentiment === 'flagged';
    return true;
  });

  const pendingCount = reviews.filter(r => !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;
  const flaggedCount = reviews.filter(r => r.sentiment === 'flagged').length;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
        <h2 className="font-display font-bold text-brand-dark text-xl select-none">Reviews Moderation</h2>
        <button
          onClick={() => setManualFormOpen(true)}
          className="flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-gold text-brand-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-md"
        >
          <Plus size={14} />
          <span>Add Manual Review</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 select-none">
        {[
          { key: 'all', label: 'All', count: reviews.length },
          { key: 'pending', label: 'Pending', count: pendingCount },
          { key: 'approved', label: 'Approved', count: approvedCount },
          { key: 'flagged', label: 'Flagged', count: flaggedCount }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-2xs font-bold uppercase tracking-wider border transition-colors ${
              filterTab === tab.key
                ? 'bg-brand-crimson text-brand-white border-brand-crimson'
                : 'bg-brand-white text-brand-muted border-brand-border hover:border-brand-crimson hover:text-brand-crimson'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
            <tr>
              <th className="px-4 py-3">Product / Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Sentiment (AI)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
            {filteredReviews.map(rev => (
              <tr key={rev._id} className={`hover:bg-brand-cream/10 ${rev.sentiment === 'flagged' ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-3 text-left">
                  <span className="block font-bold text-brand-dark">{rev.product?.name || 'Unknown Product'}</span>
                  <span className="text-3xs text-brand-muted">By {rev.customerName} {rev.isVerified ? ' ✓ Verified' : ''}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-brand-gold">{rev.rating}★</td>
                <td className="px-4 py-3 text-left max-w-xs truncate" title={rev.comment}>{rev.comment}</td>
                <td className="px-4 py-3 select-none">
                  <span className={`px-2 py-0.5 rounded border text-3xs font-semibold capitalize ${getSentimentColor(rev.sentiment)}`}>
                    {rev.sentiment}
                  </span>
                </td>
                <td className="px-4 py-3 select-none">
                  {rev.isApproved ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-300 text-3xs font-bold uppercase">Approved</span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-300 text-3xs font-bold uppercase">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center select-none text-2xs font-semibold">
                  <div className="flex flex-wrap justify-center gap-2 text-brand-muted">
                    {!rev.isApproved && (
                      <button onClick={() => handleApprove(rev._id)} className="text-emerald-600 hover:underline flex items-center"><CheckCircle2 size={12} className="mr-0.5" /> Approve</button>
                    )}
                    {rev.isApproved && (
                      <button onClick={() => handleReject(rev._id)} className="text-amber-600 hover:underline flex items-center"><XCircle size={12} className="mr-0.5" /> Reject</button>
                    )}
                    <button onClick={() => { setReplyIndexId(rev._id); setReplyText(rev.adminReply || ''); }} className="hover:text-brand-gold flex items-center"><MessageSquare size={12} className="mr-0.5" /> Reply</button>
                    <button onClick={() => setDeleteConfirmId(rev._id)} className="text-brand-crimson hover:underline flex items-center"><Trash2 size={12} className="mr-0.5" /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-brand-muted italic select-none">
                  {filterTab === 'all' ? 'No product reviews submitted yet.' : `No ${filterTab} reviews found.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-4">
          <div className="fixed inset-0" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-brand-white border border-brand-border p-6 rounded-2xl w-full max-w-sm shadow-2xl z-10 space-y-4 font-sans text-xs text-center">
            <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 size={24} className="text-brand-crimson" />
            </div>
            <h3 className="font-display font-bold text-brand-dark text-sm">Delete Review?</h3>
            <p className="text-brand-muted text-xs">This action is permanent and cannot be undone. The product rating will also be recalculated.</p>
            <div className="flex space-x-2 justify-center pt-2">
              <button onClick={() => handleDelete(deleteConfirmId)} className="bg-brand-crimson text-brand-white px-5 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors">Yes, Delete</button>
              <button onClick={() => setDeleteConfirmId(null)} className="bg-brand-white border border-brand-border text-brand-dark px-5 py-2 rounded-lg hover:bg-brand-cream font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Review reply dialog overlay */}
      {replyIndexId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-4">
          <div className="fixed inset-0" onClick={() => setReplyIndexId(null)} />
          <form onSubmit={handleReplySubmit} className="relative bg-brand-white border border-brand-border p-5 rounded-2xl w-full max-w-md shadow-2xl z-10 space-y-4 font-sans text-xs text-left">
            <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-2">Admin Reply Message</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="e.g. Thank you for your feedback! We are thrilled you love the zari work."
              rows={4}
              className="bg-brand-cream border p-2.5 rounded w-full focus:outline-none"
              required
            />
            <div className="flex space-x-2 pt-2">
              <button type="submit" className="bg-brand-crimson text-brand-white px-5 py-2 rounded hover:bg-brand-muted font-semibold">Post Reply</button>
              <button type="button" onClick={() => setReplyIndexId(null)} className="bg-brand-white border text-brand-dark px-5 py-2 rounded hover:bg-brand-cream">Close</button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Review Creation Modal */}
      {manualFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-4">
          <div className="fixed inset-0" onClick={() => setManualFormOpen(false)} />
          <form onSubmit={handleManualSubmit} className="relative bg-brand-white border border-brand-border p-6 rounded-2xl w-full max-w-lg shadow-2xl z-10 space-y-5 font-sans text-xs text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-display font-bold text-brand-dark text-base">Add Manual Review</h3>
              <button type="button" onClick={() => setManualFormOpen(false)} className="text-brand-muted hover:text-brand-crimson"><X size={18} /></button>
            </div>

            {manualFormError && (
              <div className="bg-red-50 border border-brand-crimson/20 p-3 rounded-lg text-brand-crimson font-semibold text-xs">{manualFormError}</div>
            )}

            {/* Product Selector */}
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Select Product *</label>
              <select
                value={manualForm.productId}
                onChange={(e) => setManualForm(prev => ({ ...prev, productId: e.target.value }))}
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
                required
              >
                <option value="">-- Choose a product --</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Customer Name *</label>
              <input
                type="text"
                value={manualForm.customerName}
                onChange={(e) => setManualForm(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="e.g. Priya Sharma"
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
                required
              />
            </div>

            {/* Star Rating */}
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-2">Rating *</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setManualForm(prev => ({ ...prev, rating: star }))}
                    className={`p-1 transition-colors ${
                      star <= manualForm.rating ? 'text-brand-gold' : 'text-brand-border'
                    }`}
                  >
                    <Star size={22} fill={star <= manualForm.rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
                <span className="text-brand-muted text-xs ml-2 self-center">{manualForm.rating} / 5</span>
              </div>
            </div>

            {/* Comment */}
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Review Comment *</label>
              <textarea
                value={manualForm.comment}
                onChange={(e) => setManualForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="e.g. Beautiful silk saree with vibrant colors! The fabric quality is exceptional and the zari work is stunning."
                rows={4}
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold text-xs"
                required
              />
            </div>

            {/* Toggles Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={manualForm.isVerified}
                  onChange={(e) => setManualForm(prev => ({ ...prev, isVerified: e.target.checked }))}
                  className="accent-brand-gold w-4 h-4"
                />
                <span className="text-xs font-semibold text-brand-dark">Mark as Verified Purchase</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={manualForm.isApproved}
                  onChange={(e) => setManualForm(prev => ({ ...prev, isApproved: e.target.checked }))}
                  className="accent-emerald-600 w-4 h-4"
                />
                <span className="text-xs font-semibold text-brand-dark">Auto-Approve (show on storefront)</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex space-x-2 pt-2 border-t border-brand-border">
              <button
                type="submit"
                disabled={manualFormSubmitting}
                className="bg-brand-crimson text-brand-white px-6 py-2.5 rounded-lg hover:bg-brand-gold font-bold transition-colors disabled:opacity-50 shadow-md"
              >
                {manualFormSubmitting ? 'Creating...' : 'Create Review'}
              </button>
              <button type="button" onClick={() => setManualFormOpen(false)} className="bg-brand-white border border-brand-border text-brand-dark px-5 py-2.5 rounded-lg hover:bg-brand-cream font-semibold transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// -----------------------
// 9. HOMEPAGE VIEW (Banners & Page Content)
// -----------------------
function HomepageView({ token: tokenProp }) {
  const token = useAuthStore.getState().token || tokenProp;
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [categories, setCategories] = useState([]);
  // Settings/Content State (heading, description, split images, featured collection)
  const [settingsForm, setSettingsForm] = useState({
    homeCategoryHeading: 'Shop by Category',
    homeCategoryDescription: '',
    homePromoHeading: 'Handpicked. Curated. Yours.',
    homePromoDescription: '',
    homePromoImage1: '',
    homePromoImage2: '',
    homePromoImage3: '',
    homeFeaturedHeading: 'Featured Collection',
    homeFeaturedSubheading: 'Premium Wardrobe Curations',
    homeFeaturedCategory: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [promoUploading, setPromoUploading] = useState({ 1: false, 2: false, 3: false });

  // Hero Landing Section State
  const [heroForm, setHeroForm] = useState({
    heroLandingActive: true,
    heroLandingHeading: 'Craftsmanship You Can Feel In Every Fold!',
    heroLandingSubheading: 'Thoughtfully manufactured for modern Indian women.',
    heroLandingCtaText: 'Shop Now',
    heroLandingCtaLink: '/shop',
    heroLandingMediaType: 'images',
    heroLandingVideoUrl: '',
    heroLandingImages: []
  });
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState('');
  const [heroVideoUploading, setHeroVideoUploading] = useState(false);
  const [heroImagesUploading, setHeroImagesUploading] = useState(false);

  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const res = await fetch('/api/banners/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBanners(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/settings/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsForm({
          homeCategoryHeading: data.homeCategoryHeading || 'Shop by Category',
          homeCategoryDescription: data.homeCategoryDescription || '',
          homePromoHeading: data.homePromoHeading || 'Handpicked. Curated. Yours.',
          homePromoDescription: data.homePromoDescription || '',
          homePromoImage1: data.homePromoImage1 || '',
          homePromoImage2: data.homePromoImage2 || '',
          homePromoImage3: data.homePromoImage3 || '',
          homeFeaturedHeading: data.homeFeaturedHeading || 'Featured Collection',
          homeFeaturedSubheading: data.homeFeaturedSubheading || 'Premium Wardrobe Curations',
          homeFeaturedCategory: data.homeFeaturedCategory || ''
        });
        setHeroForm({
          heroLandingActive: data.heroLandingActive !== false,
          heroLandingHeading: data.heroLandingHeading || 'Craftsmanship You Can Feel In Every Fold!',
          heroLandingSubheading: data.heroLandingSubheading || 'Thoughtfully manufactured for modern Indian women.',
          heroLandingCtaText: data.heroLandingCtaText || 'Shop Now',
          heroLandingCtaLink: data.heroLandingCtaLink || '/shop',
          heroLandingMediaType: data.heroLandingMediaType || 'images',
          heroLandingVideoUrl: data.heroLandingVideoUrl || '',
          heroLandingImages: data.heroLandingImages || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchSettings();
    // Load categories for selector
    fetch('/api/categories/all', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok && res.json())
      .then(cats => cats && setCategories(cats))
      .catch(err => console.error('Fetch categories error:', err));
  }, [token]);

  // Handle Promo Image upload to Cloudinary
  const handlePromoImageUpload = async (file, imageIdx) => {
    if (!file) return;
    setPromoUploading(prev => ({ ...prev, [imageIdx]: true }));
    try {
      const payload = new FormData();
      payload.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setSettingsForm(prev => ({ ...prev, [`homePromoImage${imageIdx}`]: data.url }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      console.error(e);
      useModalStore.getState().error('Error', 'Upload failed due to network error');
    } finally {
      setPromoUploading(prev => ({ ...prev, [imageIdx]: false }));
    }
  };


  const handleEditBanner = (ban) => {
    setEditingBanner(ban);
    setBannerFormOpen(true);
  };

  const handleDeleteBanner = async (banId) => {
    if (!(await useModalStore.getState().confirm('Confirmation', 'Are you sure you want to delete this banner?'))) return;
    try {
      const res = await fetch(`/api/banners/${banId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBanners();
      } else {
        useModalStore.getState().error('Error', 'Failed to delete banner');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        setSettingsSuccess('Homepage content updated successfully!');
      } else {
        useModalStore.getState().error('Error', 'Failed to update homepage content settings');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans text-xs">
      <div>
        <h2 className="font-display font-bold text-brand-dark text-xl border-b pb-3 select-none">Homepage Content Management</h2>
        <p className="text-brand-muted mt-1">Configure carousels, categories descriptions, split promo sections, and custom images.</p>
      </div>

      {/* SECTION 0: HERO LANDING SECTION */}
      <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-display font-bold text-brand-dark text-sm">Hero Landing Section <span className="text-3xs text-brand-muted font-sans ml-2">(appears above the main carousel)</span></h3>
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={heroForm.heroLandingActive}
              onChange={(e) => setHeroForm(prev => ({ ...prev, heroLandingActive: e.target.checked }))}
              className="accent-emerald-600 w-4 h-4"
            />
            <span className="text-xs font-semibold text-brand-dark">{heroForm.heroLandingActive ? 'Active' : 'Hidden'}</span>
          </label>
        </div>

        {/* Text Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col col-span-2">
            <label className="font-semibold text-brand-dark mb-1">Hero Heading (Italic Serif)</label>
            <input type="text" value={heroForm.heroLandingHeading} onChange={(e) => setHeroForm(prev => ({ ...prev, heroLandingHeading: e.target.value }))} className="bg-brand-cream border p-2 rounded focus:outline-none" placeholder="e.g. Craftsmanship You Can Feel In Every Fold!" />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="font-semibold text-brand-dark mb-1">Hero Subheading</label>
            <input type="text" value={heroForm.heroLandingSubheading} onChange={(e) => setHeroForm(prev => ({ ...prev, heroLandingSubheading: e.target.value }))} className="bg-brand-cream border p-2 rounded focus:outline-none" placeholder="e.g. Thoughtfully manufactured for modern Indian women." />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">CTA Button Text</label>
            <input type="text" value={heroForm.heroLandingCtaText} onChange={(e) => setHeroForm(prev => ({ ...prev, heroLandingCtaText: e.target.value }))} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">CTA Button Link</label>
            <input type="text" value={heroForm.heroLandingCtaLink} onChange={(e) => setHeroForm(prev => ({ ...prev, heroLandingCtaLink: e.target.value }))} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
        </div>

        {/* Media Type Selector */}
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-display font-bold text-brand-dark text-2xs uppercase tracking-wider text-brand-gold">Media Content (Right Side)</h4>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="radio"
                name="heroMediaType"
                value="images"
                checked={heroForm.heroLandingMediaType === 'images'}
                onChange={() => setHeroForm(prev => ({ ...prev, heroLandingMediaType: 'images' }))}
                className="accent-brand-crimson"
              />
              <span className="text-xs font-semibold text-brand-dark">📷 Images Carousel</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="radio"
                name="heroMediaType"
                value="video"
                checked={heroForm.heroLandingMediaType === 'video'}
                onChange={() => setHeroForm(prev => ({ ...prev, heroLandingMediaType: 'video' }))}
                className="accent-brand-crimson"
              />
              <span className="text-xs font-semibold text-brand-dark">🎬 Video Background</span>
            </label>
          </div>

          {/* Video Upload */}
          {heroForm.heroLandingMediaType === 'video' && (
            <div className="space-y-3 border border-brand-border/60 p-4 rounded-xl bg-brand-cream/5">
              <label className="font-semibold text-brand-dark block mb-1">Video URL</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={heroForm.heroLandingVideoUrl}
                  onChange={(e) => setHeroForm(prev => ({ ...prev, heroLandingVideoUrl: e.target.value }))}
                  className="flex-grow bg-brand-cream border p-2 rounded focus:outline-none text-2xs"
                  placeholder="Paste Cloudinary video URL or upload below"
                />
                <label className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-3 py-2 rounded-md font-semibold cursor-pointer select-none text-center flex items-center justify-center min-w-[110px] text-2xs">
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={heroVideoUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setHeroVideoUploading(true);
                      try {
                        const payload = new FormData();
                        payload.append('video', file);
                        const res = await fetch('/api/upload/video', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: payload
                        });
                        const data = await res.json();
                        if (res.ok && data.url) {
                          setHeroForm(prev => {
                            const updated = { ...prev, heroLandingVideoUrl: data.url };
                            fetch('/api/settings', {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify(updated)
                            })
                            .then(saveRes => {
                              if (saveRes.ok) {
                                setHeroSuccess('Video uploaded and saved to settings successfully!');
                              } else {
                                console.error('Failed to auto-save settings');
                              }
                            })
                            .catch(err => console.error('Auto-save video failed:', err));
                            return updated;
                          });
                        } else {
                          alert(data.error || 'Video upload failed');
                        }
                      } catch (err) {
                        console.error(err);
                        useModalStore.getState().error('Error', 'Video upload failed');
                      } finally {
                        setHeroVideoUploading(false);
                      }
                    }}
                  />
                  {heroVideoUploading ? 'Uploading...' : 'Upload Video'}
                </label>
              </div>
              {heroForm.heroLandingVideoUrl && (
                <div className="mt-2 aspect-video w-full max-w-md rounded-lg overflow-hidden border border-brand-border">
                  <video src={heroForm.heroLandingVideoUrl} controls muted className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Images Upload */}
          {heroForm.heroLandingMediaType === 'images' && (
            <div className="space-y-3 border border-brand-border/60 p-4 rounded-xl bg-brand-cream/5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-brand-dark">Slideshow Images ({heroForm.heroLandingImages.length} uploaded)</label>
                <label className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-3 py-1.5 rounded-md font-semibold cursor-pointer select-none text-center text-2xs">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={heroImagesUploading}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setHeroImagesUploading(true);
                      try {
                        const payload = new FormData();
                        for (let i = 0; i < files.length; i++) {
                          payload.append('images', files[i]);
                        }
                        const res = await fetch('/api/upload/multiple', {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` },
                          body: payload
                        });
                        const data = await res.json();
                        if (res.ok && data.images) {
                          const newUrls = data.images.map(img => img.url);
                          setHeroForm(prev => ({ ...prev, heroLandingImages: [...prev.heroLandingImages, ...newUrls] }));
                        } else {
                          alert(data.error || 'Upload failed');
                        }
                      } catch (err) {
                        console.error(err);
                        useModalStore.getState().error('Error', 'Image upload failed');
                      } finally {
                        setHeroImagesUploading(false);
                      }
                    }}
                  />
                  {heroImagesUploading ? 'Uploading...' : '+ Upload Images'}
                </label>
              </div>

              {/* Image thumbnails grid */}
              {heroForm.heroLandingImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {heroForm.heroLandingImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-brand-border group">
                      <img src={imgUrl} alt={`Hero img ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setHeroForm(prev => ({
                            ...prev,
                            heroLandingImages: prev.heroLandingImages.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="absolute top-1 right-1 bg-brand-crimson/90 hover:bg-brand-crimson text-brand-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-brand-dark/70 text-brand-cream text-3xs font-bold px-1.5 py-0.5 rounded">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-brand-muted italic text-3xs py-3 text-center">No images uploaded yet. Click "+ Upload Images" to add slideshow photos.</p>
              )}
            </div>
          )}
        </div>

        {/* Save Hero Section Button */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            disabled={heroSaving}
            onClick={async () => {
              setHeroSaving(true);
              setHeroSuccess('');
              try {
                const res = await fetch('/api/settings', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(heroForm)
                });
                if (res.ok) {
                  setHeroSuccess('Hero landing section saved successfully!');
                } else {
                  useModalStore.getState().error('Error', 'Failed to save hero landing settings.');
                }
              } catch (err) {
                console.error(err);
                useModalStore.getState().error('Error', 'Network error saving hero section.');
              } finally {
                setHeroSaving(false);
              }
            }}
            className="bg-brand-crimson hover:bg-brand-gold text-brand-cream px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 shadow-md"
          >
            {heroSaving ? 'Saving...' : 'Save Hero Landing Section'}
          </button>
          {heroSuccess && <span className="text-xs text-emerald-600 font-semibold">{heroSuccess}</span>}
        </div>
      </div>

      {/* SECTION 1: HERO BANNERS CAROUSEL CRUD */}
      <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-display font-bold text-brand-dark text-sm">Main Hero Carousel Banners</h3>
          <button
            onClick={() => { setEditingBanner(null); setBannerFormOpen(true); }}
            className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-3 py-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-colors border border-brand-gold/30 text-2xs"
          >
            <Plus size={12} /> <span>Add Slide Banner</span>
          </button>
        </div>

        {bannersLoading ? (
          <div className="py-6 text-center text-brand-muted">Loading slide banners...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(ban => (
              <div key={ban._id} className="border border-brand-border/60 rounded-xl p-4 flex gap-4 bg-brand-cream/10 relative">
                <div className="w-24 h-16 rounded-md overflow-hidden bg-brand-cream shrink-0">
                  <img src={ban.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0 pr-8">
                  <span className="font-bold text-brand-dark block truncate">{ban.title || 'Untitled Banner'}</span>
                  <span className="text-3xs text-brand-muted block truncate mt-0.5">{ban.subtitle}</span>
                  <div className="flex items-center space-x-3 mt-2 text-3xs font-semibold">
                    <span className="text-brand-gold">Order: {ban.displayOrder}</span>
                    <span className={ban.isActive ? 'text-emerald-600' : 'text-brand-crimson'}>
                      {ban.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>
                <div className="absolute right-4 top-4 flex flex-col space-y-2 text-brand-muted">
                  <button onClick={() => handleEditBanner(ban)} className="hover:text-brand-gold" title="Edit"><Edit size={12} /></button>
                  <button onClick={() => handleDeleteBanner(ban._id)} className="hover:text-brand-crimson" title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <p className="col-span-2 text-center text-brand-muted italic py-4">No slide banners found. Using storefront fallback placeholders.</p>
            )}
          </div>
        )}
      </div>

      {/* BANNER EDIT MODAL */}
      <AdminBannerForm 
        isOpen={bannerFormOpen} 
        onClose={() => { setBannerFormOpen(false); setEditingBanner(null); }} 
        initialData={editingBanner} 
        onSave={fetchBanners} 
        token={token} 
      />

      {/* SECTION 2: OTHER HOMEPAGE HEADING AND SPLIT PROMO SECTION */}
      <form onSubmit={handleSettingsSubmit} className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-6">
        <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-3">Homepage Static Sections Content</h3>
        
        {settingsLoading ? (
          <div className="py-6 text-center text-brand-muted">Loading static sections content...</div>
        ) : (
          <div className="space-y-6">
            
            {/* Category Grid Section Heading */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">"Shop by Category" Title Heading</label>
                <input type="text" value={settingsForm.homeCategoryHeading} onChange={(e) => setSettingsForm({ ...settingsForm, homeCategoryHeading: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Category Section Description Text</label>
                <input type="text" value={settingsForm.homeCategoryDescription} onChange={(e) => setSettingsForm({ ...settingsForm, homeCategoryDescription: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
              </div>
            </div>

            {/* Split Promotional Banner Section */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-display font-bold text-brand-dark text-2xs uppercase tracking-wider text-brand-gold">Promotional Split Banner Section</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Split Promo Section Main Heading</label>
                  <input type="text" value={settingsForm.homePromoHeading} onChange={(e) => setSettingsForm({ ...settingsForm, homePromoHeading: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Split Promo Description Paragraph Text</label>
                  <textarea value={settingsForm.homePromoDescription} onChange={(e) => setSettingsForm({ ...settingsForm, homePromoDescription: e.target.value })} rows={2} className="bg-brand-cream border p-2 rounded focus:outline-none" />
                </div>
              </div>

              {/* Promo split images 1, 2, 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {[1, 2, 3].map(idx => (
                  <div key={idx} className="flex flex-col border border-brand-border/60 p-3.5 rounded-xl bg-brand-cream/5">
                    <label className="font-bold text-brand-dark mb-2.5">Promo Image {idx} *</label>
                    <div className="aspect-square w-full rounded-lg overflow-hidden border border-brand-border bg-brand-cream relative mb-3">
                      {settingsForm[`homePromoImage${idx}`] ? (
                        <img src={settingsForm[`homePromoImage${idx}`]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-brand-muted text-3xs italic">No Image</div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <input type="text" value={settingsForm[`homePromoImage${idx}`]} onChange={(e) => setSettingsForm({ ...settingsForm, [`homePromoImage${idx}`]: e.target.value })} className="flex-grow bg-brand-cream border p-1 rounded focus:outline-none text-[10px] min-w-0" placeholder="Image URL" />
                      <label className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-2 py-1.5 rounded cursor-pointer select-none text-center text-3xs font-semibold whitespace-nowrap shrink-0">
                        <input type="file" accept="image/*" className="hidden" disabled={promoUploading[idx]} onChange={(e) => handlePromoImageUpload(e.target.files?.[0], idx)} />
                        {promoUploading[idx] ? '...' : 'Upload'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Collection Configuration */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-display font-bold text-brand-dark text-2xs uppercase tracking-wider text-brand-gold">Featured Collection Customization</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Featured Collection Title Heading</label>
                  <input type="text" value={settingsForm.homeFeaturedHeading} onChange={(e) => setSettingsForm({ ...settingsForm, homeFeaturedHeading: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Featured Collection Subheading Text</label>
                  <input type="text" value={settingsForm.homeFeaturedSubheading} onChange={(e) => setSettingsForm({ ...settingsForm, homeFeaturedSubheading: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Choose Collection Category Source</label>
                <select
                  value={settingsForm.homeFeaturedCategory}
                  onChange={(e) => setSettingsForm({ ...settingsForm, homeFeaturedCategory: e.target.value })}
                  className="bg-brand-cream border p-2 rounded focus:outline-none cursor-pointer w-full sm:w-1/2"
                >
                  <option value="">Default: Showcase products marked as "Featured"</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>Showcase all active "{cat.name}" products</option>
                  ))}
                </select>
              </div>
            </div>

            {settingsSuccess && <p className="text-xs text-emerald-600 font-semibold">{settingsSuccess}</p>}

            <button type="submit" className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-6 py-2.5 rounded-lg font-semibold transition-colors border border-brand-gold/30">Save Homepage Static Sections</button>

          </div>
        )}

      </form>
    </div>
  );
}

// -----------------------
// 8. SETTINGS VIEW
// -----------------------
function SettingsView({ token }) {
  const [form, setForm] = useState({
    storeName: 'Swastika Sarees',
    storeEmail: '',
    storePhone: '',
    freeShippingThreshold: '',
    flatShippingRate: '',
    codEnabled: true,
    codExtraCharge: '',
    nonServiceablePincodes: '',
    whatsAppNumber: '',
    returnPolicyText: '',
    shippingPolicyText: '',
    deliveryDays: '7',
    announcementText: '',
    announcementActive: true
  });
  const [success, setSuccess] = useState('');

  // Reviews moderation states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [replyIndexId, setReplyIndexId] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  // Manual review form states
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    productId: '',
    customerName: '',
    rating: '5',
    comment: '',
    isVerified: false,
    isApproved: true
  });
  const [manualError, setManualError] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch('/api/reviews/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (e) {
      console.error('Fetch reviews error:', e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/all?limit=200', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Fetch products error:', e);
    }
  };

  useEffect(() => {
    fetch('/api/settings/admin', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(d => {
        setForm({
          storeName: d.storeName || '',
          storeEmail: d.storeEmail || '',
          storePhone: d.storePhone || '',
          freeShippingThreshold: d.freeShippingThreshold ? (d.freeShippingThreshold / 100).toString() : '',
          flatShippingRate: d.flatShippingRate ? (d.flatShippingRate / 100).toString() : '',
          codEnabled: d.codEnabled !== false,
          codExtraCharge: d.codExtraCharge ? (d.codExtraCharge / 100).toString() : '',
          nonServiceablePincodes: d.nonServiceablePincodes ? d.nonServiceablePincodes.join(', ') : '',
          whatsAppNumber: d.whatsAppNumber || '',
          returnPolicyText: d.returnPolicyText || '',
          shippingPolicyText: d.shippingPolicyText || '',
          deliveryDays: d.deliveryDays !== undefined ? d.deliveryDays.toString() : '7',
          announcementText: d.announcementText || '',
          announcementActive: d.announcementActive !== false
        });
      })
      .catch(err => console.error(err));

    fetchReviews();
    fetchProducts();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        setSuccess('General settings updated successfully!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (revId) => {
    setActionError('');
    try {
      const response = await fetch(`/api/reviews/${revId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews();
      } else {
        const err = await response.json();
        setActionError(err.error || 'Failed to approve review.');
      }
    } catch (e) {
      console.error(e);
      setActionError('Network error while approving review.');
    }
  };

  const handleReject = async (revId) => {
    setActionError('');
    try {
      const response = await fetch(`/api/reviews/${revId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews();
      } else {
        const err = await response.json();
        setActionError(err.error || 'Failed to reject review.');
      }
    } catch (e) {
      console.error(e);
      setActionError('Network error while rejecting review.');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const response = await fetch(`/api/reviews/${replyIndexId}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reply: replyText })
      });
      if (response.ok) {
        setReplyIndexId(null);
        setReplyText('');
        fetchReviews();
      } else {
        const err = await response.json();
        setActionError(err.error || 'Failed to submit reply.');
      }
    } catch (e) {
      console.error(e);
      setActionError('Network error while submitting reply.');
    }
  };

  const handleDelete = async (revId) => {
    if (!(await useModalStore.getState().confirm('Confirmation', 'Are you sure you want to delete this review?'))) return;
    setActionError('');
    try {
      const response = await fetch(`/api/reviews/${revId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchReviews();
      } else {
        const err = await response.json();
        setActionError(err.error || 'Failed to delete review.');
      }
    } catch (e) {
      console.error(e);
      setActionError('Network error while deleting review.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError('');
    setManualSuccess('');
    try {
      const response = await fetch('/api/reviews/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(manualForm)
      });
      const data = await response.json();
      if (response.ok) {
        setManualSuccess('Manual review created successfully!');
        setManualForm({
          productId: '',
          customerName: '',
          rating: '5',
          comment: '',
          isVerified: false,
          isApproved: true
        });
        fetchReviews();
        setTimeout(() => {
          setManualFormOpen(false);
          setManualSuccess('');
        }, 1500);
      } else {
        setManualError(data.error || 'Failed to add manual review.');
      }
    } catch (e) {
      console.error(e);
      setManualError('Network error while submitting manual review.');
    }
  };

  const getSentimentColor = (sent) => {
    switch (sent) {
      case 'positive': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'negative': return 'bg-red-50 text-red-700 border-red-300';
      case 'flagged': return 'bg-red-100 text-brand-crimson border-brand-crimson/50 font-bold';
      default: return 'bg-gray-100 text-brand-muted border-gray-300';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl font-sans text-xs">
      <h2 className="font-display font-bold text-brand-dark text-xl border-b pb-3 select-none">Store Settings</h2>
      
      <form onSubmit={handleSubmit} className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Store Name</label>
            <input type="text" value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Store Email</label>
            <input type="email" value={form.storeEmail} onChange={(e) => setForm({ ...form, storeEmail: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">WhatsApp number format (Country code first, no +)</label>
            <input type="text" value={form.whatsAppNumber} onChange={(e) => setForm({ ...form, whatsAppNumber: e.target.value })} placeholder="919999999999" className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Free Shipping threshold (INR)</label>
            <input type="number" value={form.freeShippingThreshold} onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Flat Shipping rate (INR)</label>
            <input type="number" value={form.flatShippingRate} onChange={(e) => setForm({ ...form, flatShippingRate: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">COD Handling Charge (INR)</label>
            <input type="number" value={form.codExtraCharge} onChange={(e) => setForm({ ...form, codExtraCharge: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="font-semibold text-brand-dark mb-1">Expected Delivery Time Gap (Days)</label>
            <input type="number" value={form.deliveryDays} onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
        </div>

        <div className="flex items-center space-x-2.5 pt-2 select-none">
          <input type="checkbox" checked={form.codEnabled} onChange={(e) => setForm({ ...form, codEnabled: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
          <span>Enable Cash on Delivery option at Checkout</span>
        </div>

        <div className="flex flex-col font-sans">
          <label className="font-semibold text-brand-dark mb-1">Non-serviceable Pincodes (Comma separated list)</label>
          <textarea value={form.nonServiceablePincodes} onChange={(e) => setForm({ ...form, nonServiceablePincodes: e.target.value })} placeholder="500001, 500002" className="bg-brand-cream border p-2.5 rounded focus:outline-none font-mono" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-brand-dark mb-1">Returns Policy text summary</label>
          <textarea value={form.returnPolicyText} onChange={(e) => setForm({ ...form, returnPolicyText: e.target.value })} rows={3} className="bg-brand-cream border p-2 rounded focus:outline-none" />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-brand-dark mb-1">Shipping Policy text summary</label>
          <textarea value={form.shippingPolicyText} onChange={(e) => setForm({ ...form, shippingPolicyText: e.target.value })} rows={3} className="bg-brand-cream border p-2 rounded focus:outline-none" />
        </div>

        {/* Announcement Bar Settings Section */}
        <div className="border-t border-brand-border/60 pt-4 space-y-4">
          <h4 className="font-display font-bold text-brand-dark text-2xs uppercase tracking-wider text-brand-gold">Global Announcement Bar Settings</h4>
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Announcement Bar Text</label>
            <input type="text" value={form.announcementText} onChange={(e) => setForm({ ...form, announcementText: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
          </div>
          <div className="flex items-center space-x-2.5 select-none pb-2">
            <input type="checkbox" checked={form.announcementActive} onChange={(e) => setForm({ ...form, announcementActive: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
            <span>Enable/Show Announcement Bar at the top of the storefront</span>
          </div>
        </div>

        {success && <p className="text-xs text-emerald-600 font-semibold">{success}</p>}

        <button type="submit" className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-6 py-2.5 rounded-lg font-semibold transition-colors border border-brand-gold/30">Save Settings</button>
      </form>

      {/* Customer Reviews Moderation Section */}
      <div id="cus_reviews" className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-6 mt-6">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-display font-bold text-brand-dark text-sm">Customer Reviews Moderation (cus_reviews)</h3>
            <p className="text-brand-muted mt-0.5">Approve, reject, reply to, or delete storefront customer reviews, or add manual feedback.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setManualError('');
              setManualSuccess('');
              setManualForm({
                productId: '',
                customerName: '',
                rating: '5',
                comment: '',
                isVerified: false,
                isApproved: true
              });
              setManualFormOpen(true);
            }}
            className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-3 py-1.5 rounded-lg flex items-center space-x-1 font-semibold transition-colors border border-brand-gold/30 text-2xs"
          >
            <Plus size={12} /> <span>Add Manual Review</span>
          </button>
        </div>

        {actionError && (
          <div className="bg-red-50 border border-brand-crimson/20 p-3 rounded-lg text-brand-crimson font-semibold">
            {actionError}
          </div>
        )}

        {reviewsLoading ? (
          <div className="py-6 text-center text-brand-muted">Loading reviews database...</div>
        ) : (
          <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
            <table className="min-w-full divide-y divide-brand-border">
              <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
                <tr>
                  <th className="px-4 py-3">Product / Customer</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Sentiment (AI)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
                {reviews.map(rev => (
                  <tr key={rev._id} className="hover:bg-brand-cream/10">
                    <td className="px-4 py-3 text-left">
                      <span className="block font-bold text-brand-dark">{rev.product?.name || 'Unknown Product'}</span>
                      <span className="text-3xs text-brand-muted">By {rev.customerName} {rev.isVerified ? ' (Verified)' : ''}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-gold">{rev.rating}★</td>
                    <td className="px-4 py-3 text-left max-w-xs truncate" title={rev.comment}>
                      <div>{rev.comment}</div>
                      {rev.adminReply && (
                        <div className="text-brand-crimson mt-1 text-3xs font-semibold pl-2 border-l border-brand-crimson/30">
                          Reply: {rev.adminReply}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 select-none">
                      <span className={`px-2 py-0.5 rounded border text-3xs font-semibold capitalize ${getSentimentColor(rev.sentiment)}`}>
                        {rev.sentiment || 'neutral'}
                      </span>
                    </td>
                    <td className="px-4 py-3 select-none">
                      {rev.isApproved ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-300 text-3xs font-bold uppercase">Approved</span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-300 text-3xs font-bold uppercase">Pending/Rejected</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center select-none text-2xs font-semibold">
                      <div className="flex justify-center space-x-3 text-brand-muted">
                        {rev.isApproved ? (
                          <button
                            type="button"
                            onClick={() => handleReject(rev._id)}
                            className="text-amber-600 hover:underline flex items-center"
                          >
                            Reject
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApprove(rev._id)}
                            className="text-emerald-600 hover:underline flex items-center"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setReplyIndexId(rev._id);
                            setReplyText(rev.adminReply || '');
                          }}
                          className="hover:text-brand-gold flex items-center"
                        >
                          Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rev._id)}
                          className="text-brand-crimson hover:underline flex items-center"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-brand-muted italic select-none">No product reviews submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review reply dialog overlay */}
      {replyIndexId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-4">
          <div className="fixed inset-0" onClick={() => setReplyIndexId(null)} />
          <form onSubmit={handleReplySubmit} className="relative bg-brand-white border border-brand-border p-5 rounded-2xl w-full max-w-md shadow-2xl z-10 space-y-4 font-sans text-xs text-left">
            <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-2">Admin Reply Message</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="e.g. Thank you for your feedback! We are thrilled you love the zari work."
              rows={4}
              className="bg-brand-cream border p-2.5 rounded w-full focus:outline-none text-xs text-brand-dark"
              required
            />
            <div className="flex space-x-2 pt-2">
              <button type="submit" className="bg-brand-crimson text-brand-white px-5 py-2 rounded hover:bg-brand-muted font-semibold">Post Reply</button>
              <button type="button" onClick={() => setReplyIndexId(null)} className="bg-brand-white border text-brand-dark px-5 py-2 rounded hover:bg-brand-cream">Close</button>
            </div>
          </form>
        </div>
      )}

      {/* Manual review creation modal */}
      {manualFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-4">
          <div className="fixed inset-0" onClick={() => setManualFormOpen(false)} />
          <form onSubmit={handleManualSubmit} className="relative bg-brand-white border border-brand-border p-6 rounded-2xl w-full max-w-lg shadow-2xl z-10 space-y-4 font-sans text-xs text-left">
            <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-2">Add Manual Customer Review</h3>
            
            {manualError && (
              <div className="bg-red-50 border border-brand-crimson/20 p-3 rounded-lg text-brand-crimson font-semibold">
                {manualError}
              </div>
            )}
            {manualSuccess && (
              <div className="bg-emerald-50 border border-emerald-600/20 p-3 rounded-lg text-emerald-700 font-semibold font-display">
                {manualSuccess}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col col-span-2">
                <label className="font-semibold text-brand-dark mb-1">Select Product *</label>
                <select
                  value={manualForm.productId}
                  onChange={(e) => setManualForm({ ...manualForm, productId: e.target.value })}
                  className="bg-brand-cream border p-2 rounded focus:outline-none w-full text-xs text-brand-dark"
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={manualForm.customerName}
                  onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="bg-brand-cream border p-2 rounded focus:outline-none text-xs text-brand-dark"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Rating *</label>
                <select
                  value={manualForm.rating}
                  onChange={(e) => setManualForm({ ...manualForm, rating: e.target.value })}
                  className="bg-brand-cream border p-2 rounded focus:outline-none text-xs text-brand-dark"
                  required
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="flex flex-col col-span-2">
                <label className="font-semibold text-brand-dark mb-1">Review Comment / Text *</label>
                <textarea
                  value={manualForm.comment}
                  onChange={(e) => setManualForm({ ...manualForm, comment: e.target.value })}
                  placeholder="e.g. The fabric quality is absolutely premium! Beautiful embroidery."
                  rows={4}
                  className="bg-brand-cream border p-2.5 rounded focus:outline-none w-full text-xs text-brand-dark"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 select-none">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={manualForm.isVerified}
                  onChange={(e) => setManualForm({ ...manualForm, isVerified: e.target.checked })}
                  className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border"
                />
                <label htmlFor="isVerified" className="text-brand-dark font-medium">Mark as Verified Purchase</label>
              </div>

              <div className="flex items-center space-x-2 select-none">
                <input
                  type="checkbox"
                  id="isApproved"
                  checked={manualForm.isApproved}
                  onChange={(e) => setManualForm({ ...manualForm, isApproved: e.target.checked })}
                  className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border"
                />
                <label htmlFor="isApproved" className="text-brand-dark font-medium">Approve and display immediately</label>
              </div>
            </div>

            <div className="flex space-x-2 pt-2 border-t mt-4">
              <button type="submit" className="bg-brand-crimson text-brand-white px-5 py-2 rounded hover:bg-brand-muted font-semibold transition-colors">Add Review</button>
              <button type="button" onClick={() => setManualFormOpen(false)} className="bg-brand-white border text-brand-dark px-5 py-2 rounded hover:bg-brand-cream transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const SIZES = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

function LeadsView({ token }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token]);

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    const headers = ['Email', 'Phone', 'Created At'];
    const rows = leads.map(l => [
      l.email || '',
      l.phone || '',
      new Date(l.createdAt).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `swastika_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3 border-brand-border/40">
        <div>
          <h2 className="font-display font-bold text-brand-dark text-xl select-none">Marketing Leads</h2>
          <p className="text-brand-muted text-xs mt-1">Leads captured from the homepage discount capture popup modal.</p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-brand-crimson hover:bg-brand-gold text-brand-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-md"
          >
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center text-brand-muted">Loading leads list...</div>
      ) : (
        <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
          <table className="min-w-full divide-y divide-brand-border">
            <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left select-none">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Email Address</th>
                <th className="px-6 py-3">WhatsApp Number</th>
                <th className="px-6 py-3">Captured Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
              {leads.map((lead, idx) => (
                <tr key={lead._id} className="hover:bg-brand-cream/10">
                  <td className="px-6 py-4 font-semibold text-brand-muted">{idx + 1}</td>
                  <td className="px-6 py-4 font-semibold text-brand-dark">{lead.email || '—'}</td>
                  <td className="px-6 py-4 text-brand-dark font-mono">{lead.phone ? `+91 ${lead.phone}` : '—'}</td>
                  <td className="px-6 py-4 text-brand-muted">{new Date(lead.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-brand-muted italic select-none">No marketing leads captured yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
