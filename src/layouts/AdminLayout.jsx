import React from 'react';
import {
  LayoutDashboard, ShoppingBag, FolderHeart, ListOrdered, Users, Ticket, Image,
  MessageSquare, Settings, Mail, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout({ activeTab, setActiveTab, user, logout, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) {
      await logout();
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-cream/30 font-sans">
      
      {/* Sticky Left Sidebar */}
      <aside className="w-64 bg-brand-dark text-brand-cream py-6 px-4 shrink-0 select-none border-r border-brand-gold/20 flex flex-col justify-between sticky top-0 h-screen overflow-y-auto hidden md:flex">
        <div>
          <div className="border-b border-brand-muted/20 pb-4 mb-6 text-left px-2">
            <span className="font-display font-bold text-xl text-brand-gold-light tracking-wide block cursor-pointer" onClick={() => navigate('/')}>Swastika Admin</span>
            <span className="text-[10px] text-brand-cream/60 uppercase tracking-widest font-sans mt-0.5 block">Store Management</span>
          </div>

          <nav className="space-y-1 text-xs sm:text-sm font-sans font-medium">
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
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'leads' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <Mail size={16} /> <span>Marketing Leads</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-brand-crimson text-brand-cream' : 'hover:bg-brand-muted/40 hover:text-brand-gold'}`}
            >
              <Settings size={16} /> <span>Store Settings</span>
            </button>
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-brand-muted/20 mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-brand-cream font-semibold">{user?.fullName || 'Administrator'}</span>
            <span className="text-[9px] text-brand-cream/60 truncate w-32">{user?.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-brand-cream/60 hover:text-brand-crimson transition-colors rounded-md"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Top Admin Header */}
        <header className="sticky top-0 z-40 bg-brand-white border-b border-brand-border/40 h-16 flex items-center justify-between px-6 sm:px-8 shadow-sm">
          <div className="flex items-center space-x-4 select-none">
            {/* Mobile Title */}
            <span className="font-display font-bold text-lg text-brand-gold-light md:hidden block cursor-pointer" onClick={() => navigate('/')}>Swastika Admin</span>
            
            <h1 className="font-display font-bold text-lg text-brand-dark hidden md:block capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 select-none">
            <div className="flex items-center space-x-2 bg-brand-cream px-3 py-1.5 rounded-full border border-brand-border/40">
              <div className="w-6 h-6 rounded-full bg-brand-dark text-brand-cream flex items-center justify-center text-xs font-bold uppercase">
                {user?.email?.charAt(0) || 'A'}
              </div>
              <span className="text-xs font-semibold text-brand-dark hidden sm:block">Admin</span>
            </div>
            {/* Mobile Logout */}
            <button 
              onClick={handleLogout}
              className="md:hidden p-1.5 text-brand-muted hover:text-brand-crimson transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* Mobile Navigation Dropdown (Fallback for small screens) */}
          <div className="md:hidden mb-6">
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full bg-brand-white border border-brand-border text-brand-dark rounded-lg p-3 font-semibold font-sans focus:outline-none focus:ring-2 focus:ring-brand-gold shadow-sm capitalize"
            >
              <option value="dashboard">Dashboard</option>
              <option value="products">Products</option>
              <option value="categories">Categories</option>
              <option value="orders">Orders</option>
              <option value="customers">Customers</option>
              <option value="coupons">Coupons</option>
              <option value="reviews">Reviews</option>
              <option value="homepage">Homepage Content</option>
              <option value="leads">Marketing Leads</option>
              <option value="settings">Store Settings</option>
            </select>
          </div>
          
          {children}
        </main>
      </div>

    </div>
  );
}
