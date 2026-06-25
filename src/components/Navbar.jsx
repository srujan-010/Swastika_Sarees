import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, ShoppingBag, User as UserIcon, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { wishlist } = useWishlistStore();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [cartBounce, setCartBounce] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  // Update cart count and trigger bounce animation
  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    if (totalCartQuantity !== cartCount) {
      setCartCount(totalCartQuantity);
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalCartQuantity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-white border-b border-brand-border/40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Hamburg Trigger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-brand-dark hover:text-brand-crimson p-2 rounded-md"
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
          </div>

          {/* Brand Logo & Text */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link to="/" className="flex flex-col items-center md:items-start group select-none">
              <span className="font-display text-2xl md:text-3xl font-bold tracking-tight text-brand-crimson group-hover:text-brand-gold transition-colors duration-300">
                Swastika Sarees
              </span>
              <span className="hidden sm:inline font-sans text-[10px] tracking-wider text-brand-muted uppercase">
                Shine Bright, Get Your Sparkle On!
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === '/' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>Home</Link>
            <Link to="/shop" className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === '/shop' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>Shop</Link>
            <Link to="/shop?new=true" className="text-sm font-medium tracking-wide text-brand-dark hover:text-brand-crimson transition-colors">New Arrivals</Link>
            <Link to="/shop?sale=true" className="text-sm font-medium tracking-wide text-brand-crimson hover:text-brand-gold transition-colors font-semibold">Sale</Link>
            <Link to="/about" className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === '/about' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>About</Link>
            <Link to="/contact" className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === '/contact' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>Contact</Link>
          </nav>

          {/* Header Action Icons */}
          <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4">
            
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-full hover:bg-brand-cream"
              aria-label="Open search bar"
            >
              <Search size={22} />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-full hover:bg-brand-cream"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-2xs font-bold leading-none text-brand-cream transform translate-x-1 -translate-y-1 bg-brand-gold rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className={`relative p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-full hover:bg-brand-cream ${cartBounce ? 'animate-bounce' : ''}`}
              aria-label="Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-2xs font-bold leading-none text-brand-cream transform translate-x-1 -translate-y-1 bg-brand-crimson rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Management Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-1 p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-md hover:bg-brand-cream"
                  >
                    <UserIcon size={22} />
                    <ChevronDown size={14} className="hidden sm:inline" />
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-brand-white border border-brand-border ring-1 ring-black ring-opacity-5 z-50">
                      <div className="px-4 py-2 border-b border-brand-border/60 text-xs font-semibold text-brand-muted truncate">
                        Hi, {user.fullName || 'User'}
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-brand-gold font-medium hover:bg-brand-cream hover:text-brand-crimson"
                        >
                          <ShieldCheck size={16} className="mr-2" /> Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-cream hover:text-brand-crimson"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-brand-dark hover:bg-brand-cream hover:text-brand-crimson"
                      >
                        Order History
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-brand-crimson border-t border-brand-border/40 hover:bg-brand-cream"
                      >
                        <LogOut size={16} className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-sm font-medium tracking-wide text-brand-dark hover:text-brand-crimson transition-colors hover:bg-brand-cream px-3 py-1.5 rounded-md"
                >
                  <UserIcon size={20} />
                  <span className="hidden lg:inline">Login</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Floating Inline Search Drawer */}
      {searchOpen && (
        <div className="absolute top-20 left-0 w-full bg-brand-white border-b border-brand-border shadow-md py-4 z-40 animate-shimmer-once">
          <div className="max-w-3xl mx-auto px-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium sarees, kurtis, dress materials... (e.g. Silk wedding saree)"
                className="w-full bg-brand-cream text-brand-dark border border-brand-border rounded-full py-3 pl-12 pr-10 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold font-sans text-sm"
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 text-brand-muted" size={18} />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-3.5 text-brand-muted hover:text-brand-crimson"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div className="relative flex flex-col w-full max-w-xs bg-brand-white h-full shadow-2xl p-6 border-r border-brand-border animate-shimmer-once">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-4 mb-6">
              <span className="font-display font-bold text-brand-crimson text-xl">Swastika Sarees</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-brand-dark hover:text-brand-crimson"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="mb-6 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-brand-cream border border-brand-border rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-brand-crimson focus:border-brand-crimson text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-brand-muted" size={16} />
            </form>

            <nav className="flex flex-col space-y-4 text-base font-medium">
              <Link to="/" className="text-brand-dark hover:text-brand-crimson py-1">Home</Link>
              <Link to="/shop" className="text-brand-dark hover:text-brand-crimson py-1">Shop Catalog</Link>
              <Link to="/shop?new=true" className="text-brand-dark hover:text-brand-crimson py-1">New Arrivals</Link>
              <Link to="/shop?sale=true" className="text-brand-crimson font-semibold py-1">Sale Offers</Link>
              <Link to="/about" className="text-brand-dark hover:text-brand-crimson py-1">About Us</Link>
              <Link to="/contact" className="text-brand-dark hover:text-brand-crimson py-1">Contact</Link>
              <Link to="/track-order" className="text-brand-gold hover:text-brand-crimson py-1 font-semibold">Track Guest Order</Link>
            </nav>

            <div className="mt-auto border-t border-brand-border/60 pt-6">
              {user ? (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-brand-muted">Logged in as {user.email}</div>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block text-brand-gold hover:text-brand-crimson font-medium text-sm"
                    >
                      🛡️ Admin Dashboard
                    </Link>
                  )}
                  <Link to="/account" className="block text-brand-dark hover:text-brand-crimson text-sm font-medium">My Profile</Link>
                  <Link to="/orders" className="block text-brand-dark hover:text-brand-crimson text-sm font-medium">My Orders</Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left text-brand-crimson font-medium text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block text-center bg-brand-crimson text-brand-cream py-2.5 rounded-md hover:bg-brand-muted transition-colors font-sans text-sm font-medium shadow-md"
                >
                  Log In / Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
