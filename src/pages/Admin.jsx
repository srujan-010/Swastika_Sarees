import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FolderHeart, ListOrdered, Users, Ticket, Image,
  MessageSquare, BarChart3, Settings, ShieldAlert, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, Upload, X, Star
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Import Recharts components for beautiful analytics
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

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
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-cream/30">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-brand-dark text-brand-cream py-8 px-4 shrink-0 select-none border-r border-brand-gold/20 flex flex-col justify-between">
        <div>
          <div className="border-b border-brand-muted/20 pb-4 mb-6 text-left px-2">
            <span className="font-display font-bold text-xl text-brand-gold-light tracking-wide block">Swastika Admin</span>
            <span className="text-[10px] text-brand-cream/60 uppercase tracking-widest font-sans mt-0.5 block">Store Management</span>
          </div>

          <nav className="space-y-1 text-xs md:text-sm font-sans font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <LayoutDashboard size={16} /> <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <ShoppingBag size={16} /> <span>Products</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <FolderHeart size={16} /> <span>Categories</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <ListOrdered size={16} /> <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'customers' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <Users size={16} /> <span>Customers</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'coupons' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <Ticket size={16} /> <span>Coupons</span>
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'reviews' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <MessageSquare size={16} /> <span>Reviews</span>
            </button>
            <button
              onClick={() => setActiveTab('homepage')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'homepage' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <Image size={16} /> <span>Homepage Content</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <Settings size={16} /> <span>Store Settings</span>
            </button>
          </nav>
        </div>

        <div className="px-2 pt-6 border-t border-brand-muted/20 font-sans text-2xs text-brand-cream/40">
          Logged in: {user.email} <br />
          Role: Admin
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 p-6 sm:p-8">
        
        {/* Tab 0: Access Denied */}
        {activeTab === 'denied' && <DeniedView />}

        {/* Tab 1: Dashboard Analytics */}
        {activeTab === 'dashboard' && <DashboardView token={token} />}

        {/* Tab 2: Product Management */}
        {activeTab === 'products' && <ProductsView token={token} />}

        {/* Tab 3: Category Management */}
        {activeTab === 'categories' && <CategoriesView token={token} />}

        {/* Tab 4: Orders Management */}
        {activeTab === 'orders' && <OrdersView token={token} />}

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

      </main>

    </div>
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

  useEffect(() => {
    fetch('/api/admin/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch analytics error:', err);
        setLoading(false);
      });
  }, [token]);

  if (loading || !data) return <div className="h-64 skeleton-shimmer rounded-2xl" />;

  const COLORS_LIST = ['#8B1A1A', '#C8832A', '#E8A84C', '#6B3A3A', '#1A0505'];

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 select-none">
        
        <div className="bg-brand-white border border-brand-border/40 p-4 rounded-xl shadow-2xs">
          <span className="text-2xs text-brand-muted font-semibold uppercase tracking-wider block">Total Revenue</span>
          <span className="text-lg sm:text-2xl font-bold text-brand-crimson mt-1 block">₹{data.kpis?.totalRevenue?.toLocaleString('en-IN') || 0}</span>
        </div>
        
        <div className="bg-brand-white border border-brand-border/40 p-4 rounded-xl shadow-2xs">
          <span className="text-2xs text-brand-muted font-semibold uppercase tracking-wider block">Total Orders</span>
          <span className="text-lg sm:text-2xl font-bold text-brand-dark mt-1 block">{data.kpis?.totalOrders || 0}</span>
        </div>

        <div className="bg-brand-white border border-brand-border/40 p-4 rounded-xl shadow-2xs">
          <span className="text-2xs text-brand-muted font-semibold uppercase tracking-wider block">Pending Orders</span>
          <span className="text-lg sm:text-2xl font-bold text-brand-gold mt-1 block">{data.kpis?.pendingOrders || 0}</span>
        </div>

        <div className="bg-brand-white border border-brand-border/40 p-4 rounded-xl shadow-2xs">
          <span className="text-2xs text-brand-muted font-semibold uppercase tracking-wider block">New Customers</span>
          <span className="text-lg sm:text-2xl font-bold text-brand-dark mt-1 block">{data.kpis?.newCustomersCount || 0}</span>
        </div>

        <div className="bg-brand-white border border-brand-border/40 p-4 rounded-xl shadow-2xs">
          <span className="text-2xs text-brand-muted font-semibold uppercase tracking-wider block">Low Stock Items</span>
          <span className={`text-lg sm:text-2xl font-bold mt-1 block ${data.kpis?.lowStockItemsCount > 0 ? 'text-brand-crimson' : 'text-emerald-600'}`}>{data.kpis?.lowStockItemsCount || 0}</span>
        </div>

      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Revenue line chart */}
        <div className="lg:col-span-2 bg-brand-white border border-brand-border p-5 rounded-2xl shadow-xs">
          <h4 className="font-display font-bold text-brand-dark text-sm mb-4">Daily Revenue (Last 30 Days)</h4>
          <div className="w-full h-64 text-2xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyRevenue || []}>
                <XAxis dataKey="date" stroke="#6B3A3A" />
                <YAxis stroke="#6B3A3A" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8B1A1A" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown pie chart */}
        <div className="bg-brand-white border border-brand-border p-5 rounded-2xl shadow-xs">
          <h4 className="font-display font-bold text-brand-dark text-sm mb-4">Sales by Category</h4>
          <div className="w-full h-64 text-2xs flex items-center justify-center">
            {data.categoryRevenue && data.categoryRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.categoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_LIST[index % COLORS_LIST.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-brand-muted text-xs italic">No category data yet</span>
            )}
          </div>
        </div>

      </div>

      {/* Top Products bar chart */}
      <div className="bg-brand-white border border-brand-border p-5 rounded-2xl shadow-xs">
        <h4 className="font-display font-bold text-brand-dark text-sm mb-4">Top 5 Best Selling Products (INR)</h4>
        <div className="w-full h-64 text-2xs">
          {data.topProducts && data.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts}>
                <XAxis dataKey="name" stroke="#6B3A3A" />
                <YAxis stroke="#6B3A3A" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#C8832A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-brand-muted text-xs italic">No sales logs recorded</span>
          )}
        </div>
      </div>

    </div>
  );
}

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
    variants: [], // { colorName, colorHex, size, stock, extraPricePaise }
    subCategory: '',
    showSizeChart: true
  });

  // Multi-image uploader state
  const [uploadedImages, setUploadedImages] = useState([]); // [{ url, isPrimary, displayOrder }]
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    setImageUploading(true);
    const freshToken = useAuthStore.getState().token;
    try {
      const formPayload = new FormData();
      Array.from(files).forEach(f => formPayload.append('images', f));
      const res = await fetch('/api/upload/multiple', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${freshToken}` },
        body: formPayload
      });
      const data = await res.json();
      if (res.ok && data.images) {
        setUploadedImages(prev => {
          const next = [
            ...prev,
            ...data.images.map((img, i) => ({
              url: img.url,
              isPrimary: prev.length === 0 && i === 0,
              displayOrder: prev.length + i
            }))
          ];
          return next;
        });
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed due to network error');
    } finally {
      setImageUploading(false);
    }
  };

  const setPrimaryImage = (idx) => {
    setUploadedImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })));
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
      alert('Failed to update product status due to a network error.');
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
  };


  // Variant row builders
  const addVariantRow = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { colorName: '', colorHex: '#C8832A', size: 'Free Size', stock: 10, extraPricePaise: 0 }]
    }));
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
      list[idx] = { ...list[idx], [field]: value };
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
      alert('Please upload at least one product image.');
      return;
    }
    
    const body = {
      ...formData,
      images: imagesPayload,
      variants: formData.variants.map(v => ({
        ...v,
        extraPricePaise: Math.round(parseFloat(v.extraPricePaise || 0) * 100)
      }))
    };

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
    // Pre-populate uploadedImages from existing product images
    const existingImages = (prod.images || []).map((img, i) => ({
      url: img.url,
      isPrimary: img.isPrimary || i === 0,
      displayOrder: img.displayOrder || i
    }));
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
      imageUrl: prod.images?.[0]?.url || '',
      variants: prod.variants?.map(v => ({
        ...v,
        extraPricePaise: (v.extraPricePaise / 100).toString()
      })) || [],
      subCategory: prod.subCategory || '',
      showSizeChart: prod.showSizeChart !== false
    });
    setFormOpen(true);
  };

  const handleDeleteProductClick = async (prod) => {
    if (!window.confirm(`Delete "${prod.name}"? This cannot be undone.`)) return;

    try {
      const freshToken = useAuthStore.getState().token;
      const response = await fetch(`/api/products/${prod._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${freshToken}` }
      });
      if (response.ok) {
        fetchProducts();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete product.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete product due to a network error.');
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
                isFeatured: false, isBestseller: false, isNewArrival: false, imageUrl: '', variants: [], showSizeChart: true
              });
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
        <form onSubmit={handleFormSubmit} className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md space-y-6 max-w-4xl font-sans text-xs">
          <h3 className="font-display font-bold text-brand-dark text-base">{editingProduct ? `Edit Product: ${editingProduct.name}` : 'New Product Registration'}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Sec 1: Basic info */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-brand-gold uppercase tracking-wider border-b pb-1">Basic Info</span>
              
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Product Name *</label>
                <input type="text" value={formData.name} onChange={handleNameChange} className="bg-brand-cream border px-3 py-2 rounded-md focus:outline-none" required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">URL Slug (Auto generated)</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md focus:outline-none text-brand-muted" required />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })} className="bg-brand-cream border px-3 py-2 rounded-md focus:outline-none cursor-pointer" required>
                  <option value="">Choose category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              
              {(() => {
                const selectedCatObj = categories.find(c => c._id === formData.category);
                const subCats = selectedCatObj?.subCategories || [];
                if (subCats.length > 0) {
                  return (
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">Sub-category</label>
                      <select
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        className="bg-brand-cream border px-3 py-2 rounded-md focus:outline-none cursor-pointer text-xs"
                      >
                        <option value="">-- Choose Sub-category --</option>
                        {subCats.map(sub => (
                          <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div className="flex flex-col relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-brand-dark">Description</label>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Rich HTML description..."
                  className="bg-brand-cream border p-3 rounded-md focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Fabric details</label>
                <input type="text" value={formData.fabric} onChange={(e) => setFormData({ ...formData, fabric: e.target.value })} placeholder="e.g. Banarasi Silk" className="bg-brand-cream border px-3 py-2 rounded-md focus:outline-none" />
              </div>

              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Care Instructions</label>
                <textarea value={formData.careInstructions} onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })} placeholder="Dry clean only" className="bg-brand-cream border p-2.5 rounded-md focus:outline-none" />
              </div>
            </div>

            {/* Sec 2: Numbers & status */}
            <div className="space-y-4">
              <span className="block text-xs font-bold text-brand-gold uppercase tracking-wider border-b pb-1">Price & Inventory</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Price (₹) *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md" required />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Original Price (₹)</label>
                  <input type="number" step="0.01" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md" />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Total Stock *</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="bg-brand-cream border px-3 py-2 rounded-md" required />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Product SKU</label>
                  <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="SKU-CODE" className="bg-brand-cream border px-3 py-2 rounded-md" />
                </div>
              </div>

              {/* Tags select */}
              <div className="flex flex-col">
                <span className="font-semibold text-brand-dark mb-2 block">Occasion Tags</span>
                <div className="flex flex-wrap gap-1.5 select-none">
                  {['Casual', 'Festive', 'Wedding', 'Party', 'Daily Wear'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleOccasionTagToggle(tag)}
                      className={`px-2 py-1 rounded text-3xs font-semibold border ${formData.occasionTags.includes(tag) ? 'bg-brand-crimson text-brand-cream border-brand-crimson' : 'bg-brand-cream border-brand-border text-brand-dark'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-brand-dark mb-2 block">Style Tags</span>
                <div className="flex flex-wrap gap-1.5 select-none">
                  {['Traditional', 'Contemporary', 'Designer', 'Ethnic'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleStyleTagToggle(tag)}
                      className={`px-2 py-1 rounded text-3xs font-semibold border ${formData.styleTags.includes(tag) ? 'bg-brand-crimson text-brand-cream border-brand-crimson' : 'bg-brand-cream border-brand-border text-brand-dark'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status checkboxes */}
              <div className="grid grid-cols-2 gap-y-2 border-t pt-3 font-sans text-xs text-brand-dark select-none">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
                  <span>Is Storefront Active</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isBestseller} onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
                  <span>Bestseller Collection</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.isNewArrival} onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
                  <span>New Arrivals</span>
                </label>
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.showSizeChart} onChange={(e) => setFormData({ ...formData, showSizeChart: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
                  <span>Show Size Options & Size Chart</span>
                </label>
              </div>

              {/* ─── MULTI-IMAGE CLOUDINARY UPLOADER ─── */}
              <div className="flex flex-col border-t pt-4 col-span-2">
                <label className="font-semibold text-brand-dark mb-2">Product Images *</label>
                
                {/* Drop zone */}
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors select-none ${
                  imageUploading ? 'border-brand-gold/40 bg-brand-gold/5' : 'border-brand-border hover:border-brand-crimson/50 hover:bg-brand-crimson/5'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageFilesSelected(e.target.files)}
                    disabled={imageUploading}
                  />
                  {imageUploading ? (
                    <><div className="w-6 h-6 border-2 border-brand-crimson border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-xs text-brand-muted">Uploading to Cloudinary…</span></>
                  ) : (
                    <><Upload size={20} className="text-brand-muted mb-2" />
                    <span className="text-xs font-semibold text-brand-dark">Click or drag to upload images</span>
                    <span className="text-3xs text-brand-muted mt-1">Multiple files allowed · Original quality preserved</span></>
                  )}
                </label>

                {/* Also allow URL fallback */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-px bg-brand-border" />
                  <span className="text-3xs text-brand-muted uppercase tracking-wider">or paste URL</span>
                  <div className="flex-1 h-px bg-brand-border" />
                </div>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://… (used only if no files uploaded)"
                  className="bg-brand-cream border px-3 py-2 rounded-md mt-2 text-xs"
                />

                {/* Uploaded images grid */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-3xs font-semibold text-brand-dark uppercase tracking-wider mb-2">Uploaded Images — click ★ to set primary</p>
                    <div className="flex flex-wrap gap-3">
                      {uploadedImages.map((img, i) => (
                        <div key={i} className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          img.isPrimary ? 'border-brand-crimson' : 'border-brand-border'
                        }`} style={{ width: 72, height: 96 }}>
                          <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <button type="button" onClick={() => setPrimaryImage(i)}
                              className="p-1 rounded-full bg-brand-gold text-white" title="Set as primary">
                              <Star size={10} fill="currentColor" />
                            </button>
                            <button type="button" onClick={() => removeUploadedImage(i)}
                              className="p-1 rounded-full bg-brand-crimson text-white" title="Remove">
                              <X size={10} />
                            </button>
                          </div>
                          {img.isPrimary && (
                            <span className="absolute bottom-0 left-0 right-0 bg-brand-crimson text-white text-[8px] font-bold text-center py-0.5">PRIMARY</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Variants row tables */}
          <div className="border-t pt-6 text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="block text-xs font-bold text-brand-gold uppercase tracking-wider">Product Variants (Colors & Sizes)</span>
              <button
                type="button"
                onClick={addVariantRow}
                className="bg-brand-dark hover:bg-brand-muted text-brand-cream text-3xs font-semibold px-3 py-1.5 rounded flex items-center space-x-1"
              >
                <Plus size={10} />
                <span>Add Variant Option</span>
              </button>
            </div>
            
            <div className="overflow-x-auto border border-brand-border rounded-xl">
              <table className="min-w-full divide-y bg-brand-white divide-brand-border">
                <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
                  <tr>
                    <th className="px-4 py-2">Color Name</th>
                    <th className="px-4 py-2">Color Hex</th>
                    <th className="px-4 py-2">Size</th>
                    <th className="px-4 py-2">Stock</th>
                    <th className="px-4 py-2">Extra Price (INR)</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40 font-sans">
                  {formData.variants.map((v, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">
                        <input type="text" value={v.colorName} onChange={(e) => handleVariantChange(i, 'colorName', e.target.value)} placeholder="e.g. Crimson Red" className="border px-2 py-1 rounded w-32 focus:outline-none" required />
                      </td>
                      <td className="px-4 py-2 flex items-center space-x-2 mt-1 border-none">
                        <input type="color" value={v.colorHex} onChange={(e) => handleVariantChange(i, 'colorHex', e.target.value)} className="w-6 h-6 border rounded cursor-pointer shrink-0" />
                        <input type="text" value={v.colorHex} onChange={(e) => handleVariantChange(i, 'colorHex', e.target.value)} className="border px-1 py-1 text-3xs rounded w-16 focus:outline-none font-mono" />
                      </td>
                      <td className="px-4 py-2">
                        <select value={v.size} onChange={(e) => handleVariantChange(i, 'size', e.target.value)} className="border px-2 py-1 rounded focus:outline-none cursor-pointer">
                          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} className="border px-2 py-1 rounded w-16" required />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" step="0.01" value={v.extraPricePaise} onChange={(e) => handleVariantChange(i, 'extraPricePaise', e.target.value)} className="border px-2 py-1 rounded w-20" placeholder="0" />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button type="button" onClick={() => removeVariantRow(i)} className="text-brand-crimson hover:underline font-bold">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {formData.variants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 text-center text-brand-muted text-2xs italic">No variants added yet. Added products default to Free Size without distinct color filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-6 py-2.5 rounded-lg font-semibold transition-colors border border-brand-gold/30 shadow-md"
            >
              {editingProduct ? 'Save Product Changes' : 'Publish Product'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditingProduct(null);
              }}
              className="bg-brand-white border border-brand-border text-brand-dark px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-cream"
            >
              Cancel
            </button>
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
                  const img = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200';
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
      alert('Upload failed');
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
      alert('Upload failed');
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
    if (!confirm(`Delete category "${cat.name}"?`)) return;

    try {
      const response = await fetch(`/api/categories/${cat._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchCats();
      } else {
        alert(data.error || 'Deletion failed.');
      }
    } catch (e) {
      console.error(e);
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
  
  // Courier edit overlay
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);
  const [courierName, setCourierName] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/all?search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const updateStatus = async (order, status) => {
    if (status === 'shipped') {
      setTrackingModalOrder(order);
      setCourierName('Delhivery');
      setTrackingNumber('');
      setNotes(order.internalNotes || '');
      return;
    }

    try {
      const response = await fetch(`/api/orders/${order._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/orders/${trackingModalOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'shipped',
          courierName,
          trackingNumber,
          internalNotes: notes
        })
      });
      if (response.ok) {
        setTrackingModalOrder(null);
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <h2 className="font-display font-bold text-brand-dark text-xl border-b pb-3 select-none">Orders Moderation</h2>

      <div className="flex flex-col sm:flex-row gap-2 max-w-md select-none font-sans">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Order ID or phone..."
          className="flex-grow bg-brand-white border border-brand-border rounded-md px-3 py-2 text-xs focus:outline-none"
        />
        <button onClick={fetchOrders} className="bg-brand-dark text-brand-cream px-4 py-2 rounded-md font-semibold text-xs">Search</button>
      </div>

      <div className="overflow-x-auto border border-brand-border rounded-2xl bg-brand-white shadow-2xs">
        <table className="min-w-full divide-y divide-brand-border">
          <thead className="bg-brand-cream text-[10px] text-brand-crimson font-bold uppercase tracking-wider text-left">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Delivery Status</th>
              <th className="px-4 py-3 text-center">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 font-sans text-xs">
            {orders.map(order => (
              <tr key={order._id} className="hover:bg-brand-cream/10">
                <td className="px-4 py-3 text-brand-crimson font-bold">{order.orderId}</td>
                <td className="px-4 py-3 text-left">
                  <span className="block font-bold text-brand-dark">{order.shippingAddress.name}</span>
                  <span className="text-3xs text-brand-muted">{order.shippingAddress.phone}</span>
                </td>
                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3 font-bold text-brand-dark">₹{(order.pricing.total / 100).toFixed(0)}</td>
                <td className="px-4 py-3 select-none">
                  <span className={`px-1.5 py-0.5 rounded text-3xs font-bold uppercase tracking-wider ${
                    order.payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>{order.payment.status}</span>
                </td>
                <td className="px-4 py-3 select-none">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order, e.target.value)}
                    className="bg-brand-cream text-brand-dark border px-2 py-1 rounded text-2xs focus:outline-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center select-none text-2xs font-semibold">
                  <a
                    href={`/api/orders/${order.orderId}/invoice`}
                    target="_blank"
                    className="text-brand-gold hover:text-brand-crimson hover:underline flex items-center justify-center space-x-0.5"
                  >
                    <Eye size={12} /> <span>Print</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Courier AWB Overlay Modal */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-4">
          <div className="fixed inset-0" onClick={() => setTrackingModalOrder(null)} />
          <form onSubmit={handleTrackingSubmit} className="relative bg-brand-white border border-brand-border p-6 rounded-2xl w-full max-w-md shadow-2xl z-10 space-y-4 font-sans text-xs text-left">
            <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-2">Record Courier Details: {trackingModalOrder.orderId}</h3>
            
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Courier Service Name *</label>
              <input type="text" value={courierName} onChange={(e) => setCourierName(e.target.value)} className="bg-brand-cream border p-2 rounded focus:outline-none" required />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">AWB Tracking Number *</label>
              <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="bg-brand-cream border p-2 rounded focus:outline-none" required />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Internal Note</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fragile silk, pack carefully" className="bg-brand-cream border p-2 rounded focus:outline-none" />
            </div>

            <div className="flex space-x-2 pt-2">
              <button type="submit" className="bg-brand-crimson text-brand-white px-5 py-2 rounded hover:bg-brand-muted font-semibold">Mark as Shipped</button>
              <button type="button" onClick={() => setTrackingModalOrder(null)} className="bg-brand-white border text-brand-dark px-5 py-2 rounded hover:bg-brand-cream">Close</button>
            </div>
          </form>
        </div>
      )}

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
    if (!confirm(`Change role of user ${cust.email} to: ${newRole}?`)) return;

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
    if (!confirm(`Delete coupon code "${coup.code}"?`)) return;
    try {
      const response = await fetch(`/api/coupons/${coup._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchCoupons();
      } else {
        alert(data.error);
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
  
  // Banner Form State
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    ctaText: 'Explore Collection',
    ctaLink: '/shop',
    imageUrl: '',
    displayOrder: 0,
    isActive: true
  });
  const [bannerUploading, setBannerUploading] = useState(false);

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

  // Handle Banner upload to Cloudinary
  const handleBannerImageUpload = async (file) => {
    if (!file) return;
    setBannerUploading(true);
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
        setBannerForm(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed due to network error');
    } finally {
      setBannerUploading(false);
    }
  };

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
      alert('Upload failed due to network error');
    } finally {
      setPromoUploading(prev => ({ ...prev, [imageIdx]: false }));
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerForm.imageUrl) {
      alert('Image URL is required.');
      return;
    }
    const method = editingBanner ? 'PUT' : 'POST';
    const endpoint = editingBanner ? `/api/banners/${editingBanner._id}` : '/api/banners';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bannerForm)
      });
      if (res.ok) {
        setBannerFormOpen(false);
        setEditingBanner(null);
        setBannerForm({
          title: '',
          subtitle: '',
          ctaText: 'Explore Collection',
          ctaLink: '/shop',
          imageUrl: '',
          displayOrder: 0,
          isActive: true
        });
        fetchBanners();
      } else {
        const err = await res.json();
        alert(err.error || 'Banner save failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditBanner = (ban) => {
    setEditingBanner(ban);
    setBannerForm({
      title: ban.title || '',
      subtitle: ban.subtitle || '',
      ctaText: ban.ctaText || 'Explore Collection',
      ctaLink: ban.ctaLink || '/shop',
      imageUrl: ban.imageUrl || '',
      displayOrder: ban.displayOrder || 0,
      isActive: ban.isActive !== false
    });
    setBannerFormOpen(true);
  };

  const handleDeleteBanner = async (banId) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      const res = await fetch(`/api/banners/${banId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBanners();
      } else {
        alert('Failed to delete banner');
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
        alert('Failed to update homepage content settings');
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
                          setHeroForm(prev => ({ ...prev, heroLandingVideoUrl: data.url }));
                        } else {
                          alert(data.error || 'Video upload failed');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Video upload failed');
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
                        alert('Image upload failed');
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
                  alert('Failed to save hero landing settings.');
                }
              } catch (err) {
                console.error(err);
                alert('Network error saving hero section.');
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
      {bannerFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/50 backdrop-blur-xs p-4">
          <div className="fixed inset-0" onClick={() => { setBannerFormOpen(false); setEditingBanner(null); }} />
          <form onSubmit={handleBannerSubmit} className="relative bg-brand-white border border-brand-border p-6 rounded-2xl w-full max-w-lg shadow-2xl z-10 space-y-4 font-sans text-xs text-left">
            <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-2">
              {editingBanner ? 'Edit Carousel Banner' : 'Add New Carousel Banner'}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col col-span-2">
                <label className="font-semibold text-brand-dark mb-1">Banner Title</label>
                <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" required />
              </div>
              <div className="flex flex-col col-span-2">
                <label className="font-semibold text-brand-dark mb-1">Subtitle / Description</label>
                <textarea value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} rows={2} className="bg-brand-cream border p-2 rounded focus:outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">CTA Action Button Text</label>
                <input type="text" value={bannerForm.ctaText} onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">CTA Action Link</label>
                <input type="text" value={bannerForm.ctaLink} onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Display Sort Order</label>
                <input type="number" value={bannerForm.displayOrder} onChange={(e) => setBannerForm({ ...bannerForm, displayOrder: parseInt(e.target.value) || 0 })} className="bg-brand-cream border p-2 rounded focus:outline-none" />
              </div>
              <div className="flex items-center space-x-2.5 pt-4">
                <input type="checkbox" checked={bannerForm.isActive} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })} className="rounded text-brand-crimson h-3.5 w-3.5 border-brand-border" />
                <span>Show in Slides</span>
              </div>
            </div>

            <div className="flex flex-col border-t pt-4">
              <label className="font-semibold text-brand-dark mb-1">Banner Image URL *</label>
              <div className="flex space-x-2">
                <input type="text" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} className="flex-grow bg-brand-cream border p-2 rounded focus:outline-none text-2xs" placeholder="Paste image URL here" />
                <label className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-3 py-2 rounded-md font-semibold cursor-pointer select-none text-center flex items-center justify-center min-w-[100px]">
                  <input type="file" accept="image/*" className="hidden" disabled={bannerUploading} onChange={(e) => handleBannerImageUpload(e.target.files?.[0])} />
                  {bannerUploading ? 'Uploading...' : 'Upload Image'}
                </label>
              </div>
              {bannerForm.imageUrl && (
                <div className="mt-3 aspect-[12/5] w-full rounded-lg overflow-hidden border border-brand-border">
                  <img src={bannerForm.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button type="submit" className="bg-brand-crimson text-brand-white px-5 py-2 rounded hover:bg-brand-muted font-semibold">Save Banner</button>
              <button type="button" onClick={() => { setBannerFormOpen(false); setEditingBanner(null); }} className="bg-brand-white border text-brand-dark px-5 py-2 rounded hover:bg-brand-cream">Cancel</button>
            </div>
          </form>
        </div>
      )}

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
    if (!confirm('Are you sure you want to delete this review?')) return;
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
