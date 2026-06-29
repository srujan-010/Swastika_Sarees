/**
 * Navbar.jsx
 *
 * Sticky header with:
 *  - Desktop: Premium Mega Menu on "Shop" hover (flicker-free via leave-delay timer)
 *  - Mobile: Slide-out drawer with accordion category expansion
 *  - Scroll-aware: height + blur changes on scroll
 *  - Escape key closes mega menu
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Search, Heart, ShoppingBag,
  User as UserIcon, LogOut, ChevronDown, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import MegaMenu from './MegaMenu';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────
   Static Mega Menu Config — edit here to update featured cards & banner.
   Occasions and category lists are static; the category panel is dynamic
   (pulled from /api/categories in the useEffect below).
───────────────────────────────────────────────────────────────────────── */
const SHOP_MEGA_CONFIG = {
  occasions: [
    { label: 'Wedding Collection', link: '/shop?occasion=wedding' },
    { label: 'Party Wear', link: '/shop?occasion=party' },
    { label: 'Festive Collection', link: '/shop?occasion=festive' },
    { label: 'Traditional Collection', link: '/shop?occasion=traditional' },
    { label: 'New Arrivals', link: '/shop?new=true' },
    { label: 'Best Sellers', link: '/shop?sort=popular' },
  ],
  featuredCards: [
    {
      title: 'Wedding Collection',
      description: 'Silk & Banarasi weaves crafted for your special day',
      link: '/shop?occasion=wedding',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80&fit=crop',
    },
    {
      title: 'Festive Picks',
      description: 'Vibrant georgette & chiffon for every celebration',
      link: '/shop?occasion=festive',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80&fit=crop',
    },
  ],
  banner: {
    heading: 'Timeless Elegance',
    subtext: 'Handpicked sarees crafted for every occasion and every woman',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1608748010899-18f300247112?w=700&q=80&fit=crop',
  },
};

/* ═══════════════════════════════════════════════════════════════════════ */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { wishlist } = useWishlistStore();

  /* ── UI State ── */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [cartBounce, setCartBounce] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /* ── Data State ── */
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);

  /* ── Mobile Accordion ── */
  const [mobileExpandedCatId, setMobileExpandedCatId] = useState(null);

  /* ── Mega Menu: open state + flicker-free leave timer ── */
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const leaveTimer = useRef(null);

  /* ── Scroll handler ── */
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Escape key closes mega menu & profile dropdown ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMegaMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Fetch categories & settings ── */
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setCategories(data.filter((c) => c.isActive !== false)))
      .catch((err) => console.error('Navbar categories fetch error:', err));

    fetch('/api/settings')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setSettings(data))
      .catch((err) => console.error('Navbar settings fetch error:', err));
  }, []);

  /* ── Close menus on route change ── */
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setMegaMenuOpen(false);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);

    const params = new URLSearchParams(location.search);
    if (!params.get('search')) setSearchOpen(false);
  }, [location.pathname]);

  /* ── Sync search input with URL search param ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    setSearchQuery(searchParam);
    if (searchParam) setSearchOpen(true);
  }, [location.search]);

  /* ── Cart count + bounce animation ── */
  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    if (totalCartQuantity !== cartCount) {
      setCartCount(totalCartQuantity);
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 500);
      return () => clearTimeout(t);
    }
  }, [totalCartQuantity]);

  /* ── Mega Menu hover handlers ──────────────────────────────────────────
     Strategy: The MegaMenu panel is a direct DOM child of <header>.
     Because React uses mouseleave (not mouseout), moving the mouse from
     the Shop trigger INTO the mega panel does NOT fire header's mouseleave.
     So we:
       • Open on entering the Shop trigger (handleNavEnter)
       • Close on leaving the entire <header> bounds (handleHeaderLeave)
       • Also cancel any pending timer when entering the panel (handleMenuEnter)
       • Close immediately when leaving the panel downward (handleMenuLeave)
       • Close when entering any other nav link (closeMegaMenu)
     The 300ms timer is a safety net for edge cases.
  ── */
  const closeMegaMenu = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setMegaMenuOpen(false);
  }, []);

  const handleNavEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setMegaMenuOpen(true);
  }, []);

  // Not attached to Shop trigger anymore — kept for header-level
  const handleNavLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setMegaMenuOpen(false), 300);
  }, []);

  const handleMenuEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  const handleMenuLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setMegaMenuOpen(false), 300);
  }, []);

  // Fires when mouse exits the <header> + its absolute children (mega menu)
  const handleHeaderLeave = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setMegaMenuOpen(false);
  }, []);

  /* ── Search handlers ── */
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

  /* ── Active link style helper ── */
  const navLinkClass = (active) =>
    `text-xs uppercase tracking-widest font-semibold transition-all duration-300 relative py-1 link-underline ` +
    (active ? 'text-brand-crimson after:scale-x-100 after:origin-bottom-left' : 'text-brand-dark hover:text-brand-crimson');

  /* ═══════════════════════════════════════════════════════════════════════
     JSX
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <header
      onMouseLeave={handleHeaderLeave}
      className={`sticky top-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
        ? 'bg-brand-white/80 backdrop-blur-xl border-b border-brand-border/20 shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-1'
        : 'bg-brand-white border-b border-brand-border/40 py-3'
        }`}
    >
      {/* ── Inner Constrained Row ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-20'
            }`}
        >
          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-brand-dark hover:text-brand-crimson p-2 rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link to="/" className="flex flex-col items-center md:items-start group select-none">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: isScrolled ? 0.85 : 1 }}
                style={{ transformOrigin: 'left center' }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-display text-3xl md:text-[2.1rem] font-bold tracking-tight text-brand-crimson group-hover:text-brand-gold transition-colors duration-300"
              >
                Swastika Sarees
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="hidden sm:inline font-sans text-[9px] tracking-wider text-brand-muted uppercase"
              >
                Shine Bright, Get Your Sparkle On!
              </motion.span>
            </Link>
          </div>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            {/* Home — closes mega menu on hover */}
            <Link
              to="/"
              onMouseEnter={closeMegaMenu}
              className={navLinkClass(location.pathname === '/')}
            >
              Home
            </Link>

            {/* Shop — Mega Menu Trigger
                 NO onMouseLeave here; closing is handled by header's onMouseLeave.
                 This prevents the gap-flicker when mouse travels into the panel. */}
            <div
              className="relative py-3"
              onMouseEnter={handleNavEnter}
            >
              <Link
                to="/shop"
                className={`${navLinkClass(location.pathname === '/shop')} flex items-center space-x-1`}
                aria-haspopup="true"
                aria-expanded={megaMenuOpen}
              >
                <span>Shop</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${megaMenuOpen ? 'rotate-180 text-brand-crimson' : ''
                    }`}
                />
              </Link>
            </div>

            {/* New Arrivals */}
            <Link
              to="/shop?new=true"
              onMouseEnter={closeMegaMenu}
              className={navLinkClass(false)}
            >
              New Arrivals
            </Link>

            {/* Sale — Crimson highlight */}
            <Link
              to="/shop?sale=true"
              onMouseEnter={closeMegaMenu}
              className="text-xs uppercase tracking-widest font-bold text-brand-crimson hover:text-brand-gold transition-colors duration-300 relative py-1"
            >
              Sale
            </Link>

            {/* About */}
            <Link
              to="/about"
              onMouseEnter={closeMegaMenu}
              className={navLinkClass(location.pathname === '/about')}
            >
              About
            </Link>

            {/* Contact + WhatsApp tooltip */}
            <div className="relative group py-2">
              <Link
                to="/contact"
                className={navLinkClass(location.pathname === '/contact')}
              >
                Contact
              </Link>
              {/* WhatsApp Quick-Contact Tooltip */}
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

          {/* ── Header Action Icons ── */}
          <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-full hover:bg-brand-cream"
              aria-label="Open search"
            >
              <Search size={22} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-full hover:bg-brand-cream"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-2xs font-bold leading-none text-brand-cream translate-x-1 -translate-y-1 bg-brand-gold rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-full hover:bg-brand-cream ${cartBounce ? 'animate-bounce' : ''
                }`}
              aria-label="Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-2xs font-bold leading-none text-brand-cream translate-x-1 -translate-y-1 bg-brand-crimson rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-1 p-2 text-brand-dark hover:text-brand-crimson transition-colors rounded-md hover:bg-brand-cream"
                    aria-label="Account menu"
                    aria-expanded={profileDropdownOpen}
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
                        onClick={() => { logout(); navigate('/'); }}
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

      {/* ══ Premium Mega Menu — Desktop only, full-width ══
          Rendered as absolute child of the sticky header so it appears
          directly below the header bar without layout shifts.
      ══ */}
      <MegaMenu
        isOpen={megaMenuOpen}
        categories={categories}
        config={SHOP_MEGA_CONFIG}
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleMenuLeave}
      />

      {/* Backdrop dimmer when mega menu is open (desktop only) */}
      {megaMenuOpen && (
        <div
          className="fixed inset-0 bg-brand-dark/20 z-30 hidden md:block"
          style={{ top: isScrolled ? '56px' : '80px' }}
          onClick={() => setMegaMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ══ Inline Search Drawer ══ */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-brand-white border-b border-brand-border shadow-md py-4 z-40"
          >
            <div className="max-w-3xl mx-auto px-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search premium sarees, kurtis, dress materials..."
                  className="w-full bg-brand-cream text-brand-dark border border-brand-border rounded-full py-3 pl-12 pr-10 focus-ring font-sans text-sm"
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
                  aria-label="Close search"
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ Mobile Drawer Navigation ══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="relative flex flex-col w-full max-w-xs bg-brand-white h-full shadow-2xl p-6 border-r border-brand-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-4 mb-6">
                <span className="font-display font-bold text-brand-crimson text-xl">
                  Swastika Sarees
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-dark hover:text-brand-crimson"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mb-6 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-brand-cream border border-brand-border rounded-md py-2 pl-10 pr-4 focus-ring text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-brand-muted" size={16} />
              </form>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col space-y-1 text-sm font-medium overflow-y-auto max-h-[70vh]">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 font-semibold"
                >
                  Home
                </Link>
                <Link
                  to="/shop?new=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 font-semibold"
                >
                  New Arrivals
                </Link>
                <Link
                  to="/shop?sale=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-crimson py-2.5 border-b border-brand-border/40 font-bold"
                >
                  Sale Offers
                </Link>

                {/* Dynamic category accordion */}
                {categories.map((cat) => {
                  const hasSubs = cat.subCategories && cat.subCategories.length > 0;
                  const isExpanded = mobileExpandedCatId === cat._id;
                  return (
                    <div key={cat._id} className="border-b border-brand-border/40 py-0.5 flex flex-col">
                      <div className="flex justify-between items-center w-full">
                        <Link
                          to={`/shop?category=${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-brand-dark hover:text-brand-crimson py-2.5 font-semibold flex-grow"
                        >
                          {cat.name}
                        </Link>
                        {hasSubs && (
                          <button
                            type="button"
                            onClick={() =>
                              setMobileExpandedCatId((prev) =>
                                prev === cat._id ? null : cat._id
                              )
                            }
                            className="p-2 text-brand-muted hover:text-brand-crimson font-bold text-sm select-none"
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${cat.name}`}
                          >
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                              <ChevronDown size={16} />
                            </motion.div>
                          </button>
                        )}
                      </div>

                      {/* Subcategory horizontal scroll strip */}
                      <AnimatePresence>
                        {hasSubs && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-brand-cream/15 p-2.5 rounded-xl border border-brand-border/40 my-1">
                              <div className="flex gap-3.5 overflow-x-auto py-1 scrollbar-none select-none">
                                {cat.subCategories.map((sub, sIdx) => (
                                  <Link
                                    key={sIdx}
                                    to={`/shop?category=${cat.slug}&subcategory=${sub.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex flex-col items-center text-center shrink-0 w-16 group"
                                  >
                                    <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
                                      {/* Gold mandala SVG frame */}
                                      <svg
                                        className="absolute inset-0 w-full h-full text-brand-gold"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        aria-hidden="true"
                                      >
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
                                          src={
                                            sub.imageUrl ||
                                            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=150'
                                          }
                                          className="w-full h-full object-cover"
                                          alt={sub.name}
                                          loading="lazy"
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 font-semibold"
                >
                  About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-dark hover:text-brand-crimson py-2.5 border-b border-brand-border/40 font-semibold"
                >
                  Contact
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-brand-gold hover:text-brand-crimson py-2.5 border-b border-brand-border/40 font-bold"
                >
                  Track Guest Order
                </Link>
              </nav>

              {/* Mobile auth section */}
              <div className="mt-auto border-t border-brand-border/60 pt-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-brand-muted">
                      Logged in as {user.email}
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="block text-brand-gold hover:text-brand-crimson font-medium text-sm"
                      >
                        🛡️ Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/account"
                      className="block text-brand-dark hover:text-brand-crimson text-sm font-medium"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block text-brand-dark hover:text-brand-crimson text-sm font-medium"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/'); }}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
