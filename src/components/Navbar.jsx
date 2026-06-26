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
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [hoveredCatId, setHoveredCatId] = useState(null);
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const activeCats = data.filter(c => c.isActive !== false);
        setCategories(activeCats);
        if (activeCats.length > 0) {
          setHoveredCatId(activeCats[0]._id);
        }
      })
      .catch(err => console.error('Navbar categories fetch error:', err));

    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => setSettings(data))
      .catch(err => console.error('Navbar settings fetch error:', err));
  }, []);

  // Close menus on page navigation (excluding search drawer if search is active)
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    
    const params = new URLSearchParams(location.search);
    if (!params.get('search')) {
      setSearchOpen(false);
    }
  }, [location.pathname]);

  // Sync search input state with the URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    setSearchQuery(searchParam);
    if (searchParam) {
      setSearchOpen(true);
    }
  }, [location.search]);

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

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const params = new URLSearchParams(location.search);
    if (val.trim()) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    
    if (location.pathname === '/shop') {
      params.delete('page');
      navigate(`/shop?${params.toString()}`, { replace: true });
    } else {
      navigate(`/shop?${params.toString()}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
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
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === '/' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>Home</Link>
            
            {/* Shop Hover Dropdown */}
            <div className="relative group py-2">
              <Link to="/shop" className={`text-sm font-medium tracking-wide transition-colors flex items-center space-x-1 ${location.pathname === '/shop' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>
                <span>Shop</span>
                <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
              </Link>
              {/* Dropdown Container */}
              <div className="absolute left-0 top-full hidden group-hover:block z-50 pt-2">
                <div className="flex bg-brand-white border border-brand-border rounded-2xl shadow-2xl overflow-hidden min-w-[560px] max-w-[800px] min-h-[300px] animate-fadeIn">
                  {/* Left Column: Categories List */}
                  <div className="w-52 border-r border-brand-border/40 py-4 px-2 bg-brand-cream/5 select-none">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <button
                          key={cat._id}
                          onMouseEnter={() => setHoveredCatId(cat._id)}
                          onClick={() => {
                            navigate(`/shop?category=${cat.slug}`);
                          }}
                          className={`w-full text-left flex items-center justify-between px-4 py-3 text-xs font-bold rounded-lg transition-colors duration-250 ${
                            hoveredCatId === cat._id
                              ? 'bg-brand-cream text-brand-crimson'
                              : 'text-brand-dark hover:bg-brand-cream/45 hover:text-brand-crimson'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-brand-muted">→</span>
                        </button>
                      ))
                    ) : (
                      <span className="block px-4 py-2 text-xs text-brand-muted italic">No categories loaded</span>
                    )}
                  </div>
                  
                  {/* Right Column: Sub-categories Visual Group */}
                  <div className="flex-1 p-6 bg-brand-white">
                    {(() => {
                      const activeCat = categories.find(c => c._id === hoveredCatId) || categories[0];
                      if (!activeCat) return <div className="text-brand-muted text-xs italic">Select a category...</div>;
                      
                      const subs = activeCat.subCategories || [];
                      return (
                        <div className="space-y-4">
                          <div className="border-b border-brand-border/60 pb-2 flex justify-between items-center select-none">
                            <span className="font-display font-bold text-brand-dark text-xs uppercase tracking-wider">{activeCat.name} Collection</span>
                            <Link to={`/shop?category=${activeCat.slug}`} className="text-brand-crimson hover:text-brand-gold text-[10px] font-bold uppercase transition-colors">View All →</Link>
                          </div>
                          
                          {subs.length > 0 ? (
                            <div className="grid grid-cols-3 gap-6">
                              {subs.map((sub, i) => (
                                <Link
                                  key={i}
                                  to={`/shop?category=${activeCat.slug}&subcategory=${sub.slug}`}
                                  className="flex flex-col items-center group text-center"
                                >
                                  {/* Custom Gold Ethnic Framed Circle Image */}
                                  <div className="relative w-20 h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                                    {/* Gold Ethnic Mandala SVG Overlay */}
                                    <svg className="absolute inset-0 w-full h-full text-brand-gold/60 group-hover:text-brand-gold transition-colors duration-300" viewBox="0 0 100 100" fill="none">
                                      <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.75" />
                                      {[...Array(16)].map((_, idx) => {
                                        const angle = (idx * 360) / 16;
                                        return (
                                          <circle
                                            key={idx}
                                            cx={50 + 40 * Math.cos((angle * Math.PI) / 180)}
                                            cy={50 + 40 * Math.sin((angle * Math.PI) / 180)}
                                            r="2"
                                            fill="currentColor"
                                          />
                                        );
                                      })}
                                    </svg>
                                    
                                    {/* Circular Subcategory Image */}
                                    <div className="w-14 h-14 rounded-full overflow-hidden z-10 border border-brand-border bg-brand-cream">
                                      <img
                                        src={sub.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150'}
                                        alt={sub.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Label text */}
                                  <span className="mt-2 text-[10px] font-bold text-brand-dark uppercase tracking-widest group-hover:text-brand-crimson transition-colors leading-tight truncate w-full px-1">
                                    {sub.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-44 border border-dashed border-brand-border/60 rounded-xl select-none">
                              <span className="text-3xs text-brand-muted italic">Shop full range of {activeCat.name} directly. No separate sub-categories listed.</span>
                              <Link to={`/shop?category=${activeCat.slug}`} className="mt-2 text-2xs font-bold text-brand-crimson bg-brand-cream hover:bg-brand-crimson hover:text-brand-cream border px-3 py-1.5 rounded transition-all duration-300">Browse collection</Link>
                            </div>
                          )}
                        </div>
                       );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <Link to="/shop?new=true" className="text-sm font-medium tracking-wide text-brand-dark hover:text-brand-crimson transition-colors">New Arrivals</Link>
            <Link to="/shop?sale=true" className="text-sm font-medium tracking-wide text-brand-crimson hover:text-brand-gold transition-colors font-semibold">Sale</Link>
            <Link to="/about" className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === '/about' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>About</Link>
            
            {/* Contact Hover Tooltip */}
            <div className="relative group py-2">
              <Link to="/contact" className={`text-sm font-medium tracking-wide transition-colors ${location.pathname === '/contact' ? 'text-brand-crimson border-b-2 border-brand-crimson pb-1' : 'text-brand-dark hover:text-brand-crimson'}`}>Contact</Link>
              
              {/* WhatsApp Tooltip Container */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block z-50 pt-2">
                <a
                  href={`https://wa.me/${settings?.whatsAppNumber || '919999999999'}?text=Hi!%20I'm%20interested%20in%20shopping%20at%20Swastika%20Sarees.%20🙏`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl whitespace-nowrap transition-colors"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.773-4.364 9.777-9.776.002-2.622-1.018-5.086-2.87-6.94A9.704 9.704 0 0 0 12.008 1.18c-5.409 0-9.782 4.368-9.786 9.785-.002 1.8.488 3.56 1.417 5.09L2.645 22.01l6.002-1.576zM17.973 14.73c-.324-.162-1.92-.949-2.217-1.058-.297-.108-.513-.162-.73.162-.216.324-.838 1.058-1.027 1.275-.19.216-.379.243-.703.08-1.62-.778-2.735-1.378-3.824-3.245-.297-.506.297-.47.85-1.579.088-.18.044-.337-.022-.472-.066-.135-.513-1.233-.703-1.689-.185-.446-.37-.385-.513-.392l-.438-.008c-.162 0-.427.061-.65.304-.224.243-.854.838-.854 2.043 0 1.206.878 2.372.999 2.535.122.162 1.728 2.637 4.19 3.7c.586.253 1.043.404 1.4.516.59.187 1.127.16 1.551.097.472-.07 1.92-.784 2.19-1.503.27-.719.27-1.334.19-1.469-.082-.136-.298-.217-.622-.38z" />
                  </svg>
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>
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
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search premium sarees, kurtis, dress materials... (e.g. Silk wedding saree)"
                className="w-full bg-brand-cream text-brand-dark border border-brand-border rounded-full py-3 pl-12 pr-10 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold font-sans text-sm"
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 text-brand-muted" size={18} />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                  const params = new URLSearchParams(location.search);
                  params.delete('search');
                  if (location.pathname === '/shop') {
                    navigate(`/shop?${params.toString()}`, { replace: true });
                  } else {
                    navigate(location.pathname);
                  }
                }}
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
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full bg-brand-cream border border-brand-border rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-brand-crimson focus:border-brand-crimson text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-brand-muted" size={16} />
            </form>

            <nav className="flex flex-col space-y-1 text-sm font-medium overflow-y-auto max-h-[70vh] text-left">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 text-left font-semibold">Home</Link>
              <Link to="/shop?new=true" onClick={() => setMobileMenuOpen(false)} className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 text-left font-semibold">New Arrivals</Link>
              <Link to="/shop?sale=true" onClick={() => setMobileMenuOpen(false)} className="text-brand-crimson py-2.5 border-b border-brand-border/40 text-left font-bold">Sale Offers</Link>
              
              {/* Dynamic mobile category list with subcategories accordion */}
              {categories.map(cat => {
                const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                const isExpanded = mobileExpandedCatId === cat._id;
                return (
                  <div key={cat._id} className="border-b border-brand-border/40 py-0.5 flex flex-col">
                    <div className="flex justify-between items-center w-full">
                      <Link
                        to={`/shop?category=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-brand-dark hover:text-brand-crimson py-2.5 text-left font-semibold flex-grow"
                      >
                        {cat.name}
                      </Link>
                      {hasSubs && (
                        <button
                          type="button"
                          onClick={() => setMobileExpandedCatId(prev => prev === cat._id ? null : cat._id)}
                          className="p-2 text-brand-muted hover:text-brand-crimson font-bold text-sm select-none"
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>
                    
                    {/* Collapsible Subcategory Row Grid */}
                    {hasSubs && isExpanded && (
                      <div className="bg-brand-cream/15 p-2.5 rounded-xl border border-brand-border/40 my-1 animate-fadeIn">
                        <div className="flex gap-3.5 overflow-x-auto py-1 scrollbar-none select-none">
                          {cat.subCategories.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              to={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex flex-col items-center text-center shrink-0 w-16"
                            >
                              <div className="relative w-12 h-12 flex items-center justify-center">
                                {/* Mobile Gold Frame SVG */}
                                <svg className="absolute inset-0 w-full h-full text-brand-gold" viewBox="0 0 100 100" fill="none">
                                  <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3" />
                                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.75" />
                                  {[...Array(12)].map((_, idx) => {
                                    const angle = (idx * 360) / 12;
                                    return (
                                      <circle
                                        key={idx}
                                        cx={50 + 40 * Math.cos((angle * Math.PI) / 180)}
                                        cy={50 + 40 * Math.sin((angle * Math.PI) / 180)}
                                        r="2.5"
                                        fill="currentColor"
                                      />
                                    );
                                  })}
                                </svg>
                                <div className="w-8 h-8 rounded-full overflow-hidden z-10 border border-brand-border bg-brand-cream">
                                  <img
                                    src={sub.imageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150'}
                                    className="w-full h-full object-cover"
                                    alt=""
                                  />
                                </div>
                              </div>
                              <span className="mt-1 text-[8px] font-bold text-brand-dark uppercase tracking-wider truncate w-full px-0.5 leading-none">
                                {sub.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 text-left font-semibold">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 text-left font-semibold">Contact</Link>
              <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="text-brand-gold hover:text-brand-crimson py-2.5 border-b border-brand-border/40 text-left font-bold">Track Guest Order</Link>
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
