import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Truck, RotateCcw, HelpCircle, Star, Heart, Instagram, X, Check, AlertCircle } from 'lucide-react';
import { useModalStore } from '../store/modalStore';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp, scaleUp, kenBurns, fadeScale, slideUpFade, blurReveal, slideInRight } from '../utils/animations';
import { useAuthStore } from '../store/authStore';

// ----------------------------------------------------------------------
// Premium LazyImage Component with Shimmer / Blur Fade-In Placeholders
// ----------------------------------------------------------------------
function LazyImage({ src, alt, className = '', aspect = 'aspect-square', imgClassName = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${aspect} ${className} bg-brand-cream/40`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-brand-cream skeleton-shimmer z-10" />
      )}
      {error ? (
        <div className="absolute inset-0 bg-brand-cream/80 flex items-center justify-center text-brand-muted text-[10px] z-10 font-sans">
          Image Unavailable
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState({ featured: [], bestsellers: [], newArrivals: [] });
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 1. Fetch data on mount / retry with request abort cancellation & 3-retries logic
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let active = true;

    // Reset state before fetching to prevent stale displays
    setLoading(true);
    setError(null);
    setBanners([]);
    setCategories([]);
    setCollections({ featured: [], bestsellers: [], newArrivals: [] });
    setReviews([]);
    setSettings(null);

    const fetchDataWithRetry = async (attempt = 1, maxAttempts = 3) => {
      try {
        const [settingsData, bannersData, categoriesData, collectionsData, reviewsData] = await Promise.all([
          fetch('/api/settings', { signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
          fetch('/api/banners', { signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
          fetch('/api/categories', { signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
          fetch('/api/products/collections', { signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
          fetch('/api/reviews/all?approved=true', { signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); })
        ]);

        if (active) {
          setSettings(settingsData);
          setBanners(bannersData);
          setCategories(categoriesData);
          setCollections(collectionsData || { featured: [], bestsellers: [], newArrivals: [] });
          setReviews(reviewsData);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(`Fetch attempt ${attempt} failed:`, err);
        if (attempt < maxAttempts) {
          setTimeout(() => {
            if (active) fetchDataWithRetry(attempt + 1, maxAttempts);
          }, 1500);
        } else {
          if (active) {
            setError("We're refreshing the latest collections. Please try again.");
            setLoading(false);
          }
        }
      }
    };

    fetchDataWithRetry();

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryTrigger]);

  // Fallback banners data when API loaded but has empty arrays
  const activeBanners = banners.length > 0 ? banners : [
    {
      _id: 'banner1',
      title: 'Royal Banarasi Silk Collection',
      subtitle: 'Drape yourself in royal heritage. Crafted by master weavers of Varanasi.',
      ctaText: 'Explore Sarees',
      ctaLink: '/shop?category=sarees',
      imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200'
    },
    {
      _id: 'banner2',
      title: 'Summer Chiffon Georgette',
      subtitle: 'Embrace the summer breeze with our ultra-lightweight chiffon collection. Featuring vibrant prints and impeccable draping for effortless elegance.',
      ctaText: 'Shop Sarees',
      ctaLink: '/shop?category=sarees',
      secondaryButtonText: 'View All',
      secondaryButtonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
      badge: 'Premium Chiffon',
      chips: ['Breathable', 'Vibrant Prints', 'Summer Ready', 'Easy Care'],
      mockPrice: '1,499',
      mockOriginalPrice: '2,999',
      background: 'premium-beige-gradient'
    }
  ];

  // Fallback categories when API loaded but empty
  const activeCategories = categories.length > 0 ? categories : [
    { name: 'Sarees', slug: 'sarees', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300' },
    { name: 'Kurtis', slug: 'kurtis', imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=300' },
    { name: 'Dress Materials', slug: 'dress-materials', imageUrl: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=300' },
    { name: 'Accessories', slug: 'accessories', imageUrl: 'https://images.unsplash.com/photo-1598530028795-0e68f863a8a3?auto=format&fit=crop&q=80&w=300' }
  ];

  // Fallback reviews when API loaded but empty
  const activeReviews = reviews.length > 0 ? reviews : [
    { customerName: 'Divya Reddy', rating: 5, comment: 'The Banarasi silk saree is absolutely gorgeous! The gold zari weave is so fine and luxurious. Shipping was so fast.', product: { name: 'Royal Banarasi Silk Saree' } },
    { customerName: 'Ananya Sharma', rating: 5, comment: 'Purchased a floral georgette kurti, the fitting is perfect and fabric is very lightweight and comfortable. Highly recommended!', product: { name: 'Floral Georgette Kurti' } },
    { customerName: 'Priya Patel', rating: 5, comment: 'Ordered dress material. The cotton fabric is thick and print is vibrant. Got matching accessories too, lovely customer service on WhatsApp.', product: { name: 'Handblock Print Cotton Suit' } }
  ];

  // Auto-scroll Banners Carousel (Locks when loading)
  useEffect(() => {
    if (loading || error || activeBanners.length <= 1 || isHoveringCarousel) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
      setActiveThumbnailIndex(0);
    }, 6000);
    return () => clearInterval(interval);
  }, [loading, error, activeBanners.length, isHoveringCarousel]);

  // Auto-scroll Reviews (Locks when loading)
  useEffect(() => {
    if (loading || error || activeReviews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % activeReviews.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [loading, error, activeReviews.length]);

  const handleNextBanner = () => {
    setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
    setActiveThumbnailIndex(0);
  };

  const handlePrevBanner = () => {
    setActiveBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    setActiveThumbnailIndex(0);
  };

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 15;
    const y = (clientY / window.innerHeight - 0.5) * 15;
    setMousePosition({ x, y });
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        
        {/* ──────────────────────────────────────────────────
            STATE A: SKELETON LOADERS VIEW
            ────────────────────────────────────────────────── */}
        {loading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#FDFBF7]"
          >
            {/* 1. Carousel Hero Skeleton */}
            <div className="relative w-full bg-brand-cream/35 overflow-hidden flex items-center justify-center border-b border-brand-border/30" style={{ minHeight: 'calc(100vh - 80px)' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col md:flex-row items-center gap-12 w-full h-full">
                <div className="w-full md:w-1/2 space-y-6 text-left">
                  <div className="h-4 w-1/4 bg-brand-border/60 skeleton-shimmer rounded animate-pulse" />
                  <div className="h-14 w-3/4 bg-brand-border/60 skeleton-shimmer rounded animate-pulse" />
                  <div className="h-8 w-2/3 bg-brand-border/60 skeleton-shimmer rounded animate-pulse" />
                  <div className="h-10 w-1/3 bg-brand-border/60 skeleton-shimmer rounded animate-pulse" />
                </div>
                <div className="w-full md:w-1/2 aspect-[4/3] bg-brand-border/40 skeleton-shimmer rounded-lg animate-pulse" />
              </div>
            </div>

            {/* 2. Category Grid Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
              <div className="h-8 w-1/4 bg-brand-border/50 skeleton-shimmer rounded mx-auto mb-4 animate-pulse" />
              <div className="h-1 w-20 bg-brand-border/50 skeleton-shimmer rounded mx-auto mb-10 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="aspect-[3/4] bg-brand-border/40 skeleton-shimmer rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* 3. Featured Collection Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 border-t border-brand-border/40">
              <div className="flex justify-between items-end mb-10">
                <div className="w-1/3 space-y-2">
                  <div className="h-8 w-3/4 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="aspect-[3/4] bg-brand-border/40 skeleton-shimmer rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* 4. Promotional Split Banner Skeleton */}
            <div className="w-full bg-brand-dark py-20 flex flex-col md:flex-row gap-8 px-6 sm:px-12 md:px-24">
              <div className="w-full md:w-1/2 space-y-6 flex flex-col justify-center text-left">
                <div className="h-4 w-1/4 bg-brand-border/20 skeleton-shimmer rounded animate-pulse" />
                <div className="h-10 w-2/3 bg-brand-border/20 skeleton-shimmer rounded animate-pulse" />
                <div className="h-16 w-3/4 bg-brand-border/20 skeleton-shimmer rounded animate-pulse" />
                <div className="h-10 w-1/3 bg-brand-border/20 skeleton-shimmer rounded animate-pulse" />
              </div>
              <div className="w-full md:w-1/2 grid grid-cols-3 gap-4 h-64">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-full bg-brand-border/20 skeleton-shimmer rounded animate-pulse" />
                ))}
              </div>
            </div>

            {/* 5. New Arrivals Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
              <div className="flex justify-between items-end mb-10">
                <div className="w-1/3 space-y-2">
                  <div className="h-8 w-3/4 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="aspect-[3/4] bg-brand-border/40 skeleton-shimmer rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* 6. Bestsellers Skeleton */}
            <div className="bg-brand-cream/30 py-20 lg:py-24 border-t border-brand-border/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                  <div className="w-1/3 space-y-2">
                    <div className="h-8 w-3/4 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-brand-border/50 skeleton-shimmer rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="aspect-[3/4] bg-brand-border/40 skeleton-shimmer rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* 7. Testimonials Skeleton */}
            <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
              <div className="h-8 w-1/3 bg-brand-border/50 skeleton-shimmer rounded mx-auto animate-pulse" />
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map(n => <div key={n} className="h-4 w-4 bg-brand-border/50 skeleton-shimmer rounded-full animate-pulse" />)}
              </div>
              <div className="space-y-2 animate-pulse">
                <div className="h-4 w-5/6 bg-brand-border/50 skeleton-shimmer rounded mx-auto" />
                <div className="h-4 w-4/5 bg-brand-border/50 skeleton-shimmer rounded mx-auto" />
              </div>
              <div className="h-4 w-1/4 bg-brand-border/50 skeleton-shimmer rounded mx-auto animate-pulse" />
            </div>

            {/* 8. Instagram Skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <div className="h-6 w-1/4 bg-brand-border/50 skeleton-shimmer rounded mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-1/6 bg-brand-border/50 skeleton-shimmer rounded mx-auto mb-8 animate-pulse" />
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="aspect-square bg-brand-border/40 skeleton-shimmer rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────────────
            STATE B: ERROR VIEW
            ────────────────────────────────────────────────── */}
        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[75vh] flex flex-col items-center justify-center bg-[#FDFBF7] px-4 text-center select-none"
          >
            <AlertCircle size={48} className="text-brand-crimson mb-4 animate-bounce" />
            <h2 className="font-display font-bold text-brand-dark text-xl sm:text-2xl mb-2">Failed to load boutique collections</h2>
            <p className="text-sm text-brand-muted max-w-md leading-relaxed mb-6 font-sans">
              {error}
            </p>
            <button
              onClick={() => setRetryTrigger(prev => prev + 1)}
              className="bg-brand-crimson hover:bg-brand-dark text-brand-cream px-8 py-3.5 rounded border border-brand-gold/30 font-bold shadow-md hover:shadow-lg transition-all uppercase tracking-widest text-xs"
            >
              Retry Loading
            </button>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────────────
            STATE C: RENDER MAIN HOMEPAGE CONTENT
            ────────────────────────────────────────────────── */}
        {!loading && !error && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >

            {/* 0. Hero Split Landing Section */}
            {settings?.heroLandingActive && (
              <motion.section 
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'top center' }}
                className="relative w-full min-h-[50vh] md:h-[65vh] flex flex-col md:flex-row bg-brand-cream overflow-hidden border-b border-brand-border/40 select-none"
              >
                <div className="w-full md:w-1/2 p-8 sm:p-16 md:p-20 flex flex-col justify-center text-left space-y-6 z-10">
                  <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-brand-dark tracking-tight"
                  >
                    {settings.heroLandingHeading || 'Craftsmanship You Can Feel In Every Fold!'}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                    className="font-sans text-sm sm:text-base text-brand-muted max-w-lg leading-relaxed"
                  >
                    {settings.heroLandingSubheading || 'Thoughtfully manufactured for modern Indian women.'}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="pt-2"
                  >
                    <Link
                      to={settings.heroLandingCtaLink || '/shop'}
                      className="inline-flex items-center justify-center bg-brand-dark hover:bg-brand-muted text-brand-cream px-8 py-3.5 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      {settings.heroLandingCtaText || 'Shop Now'}
                    </Link>
                  </motion.div>
                </div>

                <div className="w-full md:w-1/2 relative aspect-video md:aspect-auto h-[40vh] md:h-full overflow-hidden bg-brand-dark">
                  {settings.heroLandingMediaType === 'video' && settings.heroLandingVideoUrl ? (
                    <video
                      src={settings.heroLandingVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full relative">
                      {settings.heroLandingImages && settings.heroLandingImages.length > 0 ? (
                        <LazyImage
                          src={settings.heroLandingImages[0]}
                          alt="Craftsmanship"
                          aspect="aspect-auto h-full w-full"
                        />
                      ) : (
                        <LazyImage
                          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000"
                          alt="Craftsmanship Fallback"
                          aspect="aspect-auto h-full w-full"
                        />
                      )}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* 1. HERO BANNER CAROUSEL (Vogue-Style) */}
            <section 
              className="relative w-full overflow-hidden bg-[#FDFBF7] md:min-h-[85vh] lg:min-h-[90vh]"
              style={{ minHeight: 'calc(100vh - 80px)' }}
              onMouseEnter={() => setIsHoveringCarousel(true)}
              onMouseLeave={() => setIsHoveringCarousel(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F4F0E6]/60 via-transparent to-[#FDFBF7] z-0 pointer-events-none"></div>
              <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/woven.png')]"></div>

              <svg className="absolute inset-0 w-full h-full z-0 opacity-[0.15] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 800" fill="none">
                <path d="M0 200C300 300 600 0 1000 200C1300 350 1440 200 1440 200V800H0V200Z" fill="url(#silk-gradient)" />
                <path d="M0 400C400 300 800 600 1200 400C1350 325 1440 400 1440 400V800H0V400Z" fill="url(#silk-gradient-2)" />
                <defs>
                  <linearGradient id="silk-gradient" x1="0" y1="0" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D4AF37" stopOpacity="0.5"/>
                    <stop offset="1" stopColor="#D4AF37" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="silk-gradient-2" x1="1440" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D4AF37" stopOpacity="0.0"/>
                    <stop offset="1" stopColor="#D4AF37" stopOpacity="0.4"/>
                  </linearGradient>
                </defs>
              </svg>
              
              {activeBanners.map((slide, index) => {
                const isProduct = slide.type === 'product' && slide.productId;
                const displayTitle = slide.overrideTitle || (isProduct ? slide.productId.name : slide.title) || 'Banner Title';
                const titleWords = displayTitle.split(' ');
                const titleFirstPart = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
                const titleSecondPart = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');
                
                const displaySubtitle = slide.overrideSubtitle || (isProduct && slide.productId.category ? slide.productId.category.name : slide.subtitle) || '';
                const displayPrice = isProduct ? slide.productId.price : (slide.mockPrice ? slide.mockPrice : null);
                const originalPrice = isProduct && slide.productId.originalPrice ? `₹${slide.productId.originalPrice}` : (slide.mockOriginalPrice ? `₹${slide.mockOriginalPrice}` : null);
                
                let displayFeatures = slide.features || [];
                let displayChips = slide.chips || [];
                
                if (displayFeatures.length === 0 && displayChips.length === 0) {
                  const t = displayTitle.toLowerCase();
                  const c = (isProduct && slide.productId.category ? slide.productId.category.name : '').toLowerCase();
                  const matches = (k) => t.includes(k) || c.includes(k);
                  
                  if (matches('silk')) {
                    displayFeatures = ['Pure Silk', 'Running Blouse', 'Ready to Ship', 'Premium Finish'];
                    displayChips = ['Premium Silk', 'Wedding Wear', 'Festive', 'Luxury'];
                  } else if (matches('georgette') || matches('chiffon')) {
                    displayFeatures = ['Lightweight', 'Flowing Drape', 'Party Wear', 'Easy Care'];
                    displayChips = ['Lightweight', 'Elegant', 'Designer', 'Comfort Fit'];
                  } else if (matches('cotton') && !matches('kurti')) {
                    displayFeatures = ['Breathable', 'Skin Friendly', 'Daily Wear', 'Summer Collection'];
                    displayChips = ['Comfort', 'Breathable', 'Everyday', 'Handloom'];
                  } else if (matches('kurti')) {
                    displayFeatures = ['Premium Cotton', '3 Piece Set', 'Available Sizes M–3XL', 'Embroidery Work'];
                    displayChips = ['Premium Cotton', 'Festive', 'Easy Care', 'Ready to Ship'];
                  } else if (matches('dress') || matches('unstitched')) {
                    displayFeatures = ['Unstitched Fabric', 'Matching Dupatta', 'Designer Collection', 'Stitch Ready'];
                    displayChips = ['Custom Fit', 'Complete Set', 'Designer', 'Premium'];
                  } else {
                    displayFeatures = ['Premium Quality Fabric', 'Designer Collection', 'Ready to Ship', 'COD Available'];
                    displayChips = ['Premium Fabric', 'Handpicked', 'Easy Care', 'Festive Wear'];
                  }
                }
                
                let displayBadge = slide.badge;
                if (!displayBadge && isProduct) {
                  displayBadge = slide.productId.isFeatured ? 'FEATURED' : 'NEW ARRIVAL';
                }
                
                const displayImage = isProduct ? slide.selectedImage : slide.imageUrl;
                const ctaText = slide.ctaText || 'Shop Now';
                const ctaLink = isProduct ? `/product/${slide.productId.slug}` : (slide.ctaLink || '/shop');
                const secondaryBtnText = slide.secondaryButtonText;
                const secondaryBtnLink = slide.secondaryButtonLink || '/shop';

                let containerLayout = '';
                let textAlignmentClass = '';
                
                if (slide.layout === 'right-image') {
                  containerLayout = 'flex-col md:flex-row';
                  textAlignmentClass = 'items-center md:items-start md:pl-6 lg:pl-12';
                } else if (slide.layout === 'center') {
                  containerLayout = 'flex-col justify-center items-center';
                  textAlignmentClass = 'items-center mt-4';
                } else {
                  // left-image default
                  containerLayout = 'flex-col md:flex-row-reverse';
                  textAlignmentClass = 'items-center md:items-start md:pr-6 lg:pr-12';
                }

                let alignClass = 'text-left';
                if (slide.textAlignment === 'center' || (!slide.textAlignment && slide.layout === 'center')) alignClass = 'text-center';
                if (slide.textAlignment === 'right') alignClass = 'text-right';
                if (slide.textAlignment === 'left') alignClass = 'text-left';
                
                if (slide.layout === 'center' && !slide.textAlignment) alignClass = 'text-center';
                else if (!slide.textAlignment && slide.layout !== 'center') alignClass = 'text-center md:text-left';

                textAlignmentClass = `${alignClass} ${textAlignmentClass}`;

                let bgStyle = '';
                switch(slide.background) {
                  case 'white-premium': bgStyle = 'bg-white'; break;
                  case 'beige-luxury': bgStyle = 'bg-[#FDFBF7]'; break;
                  case 'palace': bgStyle = 'bg-gradient-to-b from-[#F9F6F0] to-[#F1EAD7]'; break;
                  case 'dark-luxury': bgStyle = 'bg-brand-dark'; break;
                  case 'minimal': bgStyle = 'bg-gray-50'; break;
                  case 'transparent': bgStyle = 'bg-transparent'; break;
                  case 'luxury-palace-interior': bgStyle = 'bg-gradient-to-b from-[#EFE5D9] to-[#FDFBF7]'; break;
                  case 'heritage-haveli': bgStyle = 'bg-[#F4F0E6]'; break;
                  case 'royal-archways': bgStyle = 'bg-gradient-to-b from-[#F9F6F0] to-[#E6DBC8]'; break;
                  case 'marble-floor-shadows': bgStyle = 'bg-[#FDFBF7]'; break;
                  case 'silk-fabric-texture': bgStyle = 'bg-[#F7EFE5]'; break;
                  case 'premium-beige-gradient': bgStyle = 'bg-[#D6D3CB]'; break;
                  case 'warm-ivory-luxury': bgStyle = 'bg-[#FAF8F5]'; break;
                  case 'golden-ambient-lighting': bgStyle = 'bg-gradient-to-tr from-[#EAD9C0] to-[#FDFBF7]'; break;
                  case 'traditional-jharokha-windows': bgStyle = 'bg-[#F2EFE9]'; break;
                  case 'floral-luxury-decor': bgStyle = 'bg-[#F9F6F0]'; break;
                  case 'soft-bokeh-lighting': bgStyle = 'bg-[#FDFBF7]'; break;
                  case 'minimal-editorial-fashion': bgStyle = 'bg-white'; break;
                  default: bgStyle = 'bg-[#FDFBF7]';
                }

                let waveColor = '';
                let archColor = '';
                let archBorder = '';
                let showArch = false;
                
                if (['premium-beige-gradient', 'white-premium', 'golden-ambient-lighting', 'dark-luxury'].includes(slide.background)) {
                  showArch = true;
                  if (slide.background === 'premium-beige-gradient') {
                    waveColor = '#E2DFD8';
                    archColor = 'bg-[#E1DFD7]';
                    archBorder = 'border-black/10';
                  } else if (slide.background === 'white-premium') {
                    waveColor = '#F7F7F7';
                    archColor = 'bg-[#F9F9F9]';
                    archBorder = 'border-black/5';
                  } else if (slide.background === 'golden-ambient-lighting') {
                    waveColor = '#E3CBA8';
                    archColor = 'bg-[#EAD4B3]';
                    archBorder = 'border-black/10';
                  } else if (slide.background === 'dark-luxury') {
                    waveColor = '#242424';
                    archColor = 'bg-[#1F1F1F]';
                    archBorder = 'border-white/10';
                  }
                }

                const isDark = slide.background === 'dark-luxury';
                const textColor = isDark ? 'text-white' : 'text-brand-dark';
                const mutedColor = isDark ? 'text-white/70' : 'text-brand-muted';

                return (
                  <div
                    key={slide._id || index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex px-4 sm:px-12 md:px-16 lg:px-24 py-8 md:py-16 lg:py-20 ${containerLayout} ${bgStyle} ${
                      activeBannerIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {/* Custom Background Image with Ken Burns */}
                    {slide.backgroundImage && (
                      <motion.div 
                        initial={{ scale: 1, opacity: 0 }} 
                        animate={activeBannerIndex === index ? { scale: 1.05, opacity: 0.3 } : { opacity: 0 }} 
                        transition={{ duration: 8, ease: "linear" }}
                        className="absolute inset-0 z-0 origin-center"
                      >
                        <img src={slide.backgroundImage} alt="Background" className="w-full h-full object-cover mix-blend-multiply" />
                      </motion.div>
                    )}

                    {/* Gradient Overlay */}
                    {slide.gradientOverlay === 'soft-radial' && (
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent z-0"></div>
                    )}
                    {slide.gradientOverlay === 'dark-vignette' && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/20 z-0"></div>
                    )}
                    {slide.gradientOverlay === 'golden-glow' && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 via-transparent to-transparent z-0"></div>
                    )}
                    {slide.gradientOverlay === 'warm-overlay' && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#EAD9C0]/20 to-[#EAD9C0]/40 z-0"></div>
                    )}
                    
                    {/* Decorative Theme */}
                    {slide.decorativeTheme === 'floral-watermark' && (
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/floral-texture.png')] opacity-[0.03] z-0 mix-blend-multiply pointer-events-none"></div>
                    )}

                    {/* Background Decor */}
                    {showArch && (
                      <svg className="absolute top-0 left-0 w-full h-[80%] z-0 pointer-events-none opacity-80" preserveAspectRatio="none" viewBox="0 0 1440 600" fill="none">
                        <path d="M0 0H1440V200C1100 450 400 150 0 550V0Z" fill={waveColor} />
                      </svg>
                    )}
                    
                    {(slide.background === 'palace' || slide.background === 'luxury-palace-interior') && (
                      <div className="absolute bottom-0 w-full md:w-[80%] h-[95%] left-1/2 -translate-x-1/2 border border-brand-gold/20 rounded-t-full bg-white/20 pointer-events-none z-0"></div>
                    )}

                    {/* Image Area */}
                    <div className={`relative z-10 flex items-end justify-center ${slide.layout === 'center' ? 'w-full h-[60%]' : 'w-full md:w-1/2 h-[50%] md:h-full'}`}>
                      {/* Arch Background Decor */}
                      {showArch && (
                        <div className={`absolute bottom-0 w-[95%] sm:w-[85%] md:w-[80%] h-[92%] border-[1px] rounded-t-full z-[-1] pointer-events-none ${archColor} ${archBorder}`}></div>
                      )}
                      <motion.div
                        className="relative w-full h-full flex items-end justify-center"
                        initial={{ opacity: 0, y: 15 }}
                        animate={activeBannerIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                        transition={{ opacity: { duration: 1.2 }, y: { duration: 1.2, ease: "easeOut" } }}
                      >
                        <img
                          src={displayImage}
                          alt={displayTitle}
                          className={`relative z-10 w-auto h-full object-contain object-bottom drop-shadow-2xl ${slide.layout === 'center' ? 'max-h-full' : 'scale-[1.05] md:scale-[1.08] lg:scale-110 origin-bottom'}`}
                        />
                        {/* Model Floor Shadow */}
                        <div className="absolute bottom-0 w-[50%] md:w-[60%] h-4 bg-black/40 blur-[12px] rounded-[100%] z-0 translate-y-1" />
                      </motion.div>
                    </div>

                    {/* Text Area */}
                    <div className={`relative z-20 flex flex-col justify-center ${textAlignmentClass} ${slide.layout === 'center' ? 'w-full h-[40%]' : 'w-full md:w-1/2 h-[50%] md:h-full'}`}>
                      <AnimatePresence mode="wait">
                        {activeBannerIndex === index && (
                          <motion.div
                            initial="initial"
                            animate="animate"
                            exit={{ opacity: 0, transition: { duration: 0.3 } }}
                            variants={{
                              initial: {},
                              animate: { transition: { staggerChildren: 0.12 } }
                            }}
                            className="max-w-[580px] w-full space-y-6 md:space-y-8 flex flex-col"
                          >
                            {displayBadge && (
                              <motion.div 
                                variants={{ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                                className={`inline-block ${slide.layout === 'center' || alignClass.includes('text-center') ? 'mx-auto' : (alignClass.includes('text-right') ? 'ml-auto' : 'mr-auto')}`}
                              >
                                <span className={`text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase ${isDark ? 'text-white/80' : 'text-brand-dark/70'} flex items-center justify-center`}>
                                  {alignClass.includes('text-center') || alignClass.includes('text-right') ? <span className="w-8 h-px bg-brand-gold mr-3 hidden md:block"></span> : null}
                                  {displayBadge}
                                  {alignClass.includes('text-center') || alignClass.includes('text-left') ? <span className="w-8 h-px bg-brand-gold ml-3 hidden md:block"></span> : null}
                                </span>
                              </motion.div>
                            )}

                            <motion.div 
                              variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                              className={`font-display leading-[1.05] ${textColor} flex flex-col space-y-1`}
                            >
                              <span className="text-3xl sm:text-4xl md:text-[3.2rem] lg:text-[4rem] tracking-tight font-medium drop-shadow-sm">{titleFirstPart}</span>
                              {titleSecondPart && <span className="text-3xl sm:text-4xl md:text-[3.2rem] lg:text-[4rem] italic text-brand-gold font-light">{titleSecondPart}</span>}
                            </motion.div>

                            {displaySubtitle && (
                              <motion.p 
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                                className={`font-sans text-xs sm:text-sm md:text-base ${mutedColor} leading-relaxed font-light`}
                              >
                                {displaySubtitle}
                              </motion.p>
                            )}

                            {/* Feature Checklist */}
                            {displayFeatures && displayFeatures.length > 0 && (
                              <motion.ul 
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                                className={`grid grid-cols-2 gap-y-3 gap-x-4 text-[11px] sm:text-xs font-sans ${mutedColor}`}
                              >
                                {displayFeatures.map((feature, idx) => (
                                  <li key={idx} className={`flex items-center ${alignClass.includes('text-center') ? 'justify-center' : alignClass.includes('text-right') ? 'justify-end' : 'justify-start'}`}>
                                    <Check className="w-4 h-4 text-brand-gold mr-2 shrink-0" />
                                    <span className="tracking-wide">{feature}</span>
                                  </li>
                                ))}
                              </motion.ul>
                            )}

                            {/* Chips */}
                            {displayChips && displayChips.length > 0 && (
                              <motion.div 
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                                className={`flex flex-wrap gap-2 pt-1 ${alignClass.includes('text-center') ? 'justify-center' : alignClass.includes('text-right') ? 'justify-end' : 'justify-start'}`}
                              >
                                {displayChips.map((chip, idx) => (
                                  <span key={idx} className={`border border-black/5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-brand-cream/80 text-brand-dark'}`}>
                                    {chip}
                                  </span>
                                ))}
                              </motion.div>
                            )}

                            {/* Pricing */}
                            {displayPrice && (
                              <motion.div 
                                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                                className={`flex items-baseline space-x-3 pt-3 ${alignClass.includes('text-center') ? 'justify-center' : alignClass.includes('text-right') ? 'justify-end' : 'justify-start'}`}
                              >
                                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest ${mutedColor}`}>Starting From</span>
                                <div className="flex items-center space-x-3">
                                  <span className={`text-3xl sm:text-4xl md:text-5xl font-display font-bold ${textColor} tracking-tight`}>₹{displayPrice}</span>
                                  {originalPrice && <span className={`text-sm sm:text-base md:text-lg font-sans tracking-wide text-brand-dark/40 line-through decoration-1`}>{originalPrice}</span>}
                                </div>
                              </motion.div>
                            )}

                            <motion.div 
                              variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                              className={`flex flex-row items-center space-x-3 sm:space-x-4 pt-4 w-full ${alignClass.includes('text-center') ? 'justify-center' : alignClass.includes('text-right') ? 'justify-end' : 'justify-center md:justify-start'}`}
                            >
                              <Link
                                to={ctaLink}
                                className={`bg-[#18110D] text-brand-cream px-8 sm:px-12 py-3.5 sm:py-4 rounded-sm text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 shadow-sm hover:shadow-md hover:bg-black whitespace-nowrap ${isDark ? 'bg-white text-brand-dark hover:bg-brand-cream' : ''}`}
                              >
                                {ctaText}
                              </Link>
                              {secondaryBtnText && (
                                <Link
                                  to={secondaryBtnLink}
                                  className={`bg-black/5 border border-black/10 text-brand-dark px-8 sm:px-12 py-3.5 sm:py-4 rounded-sm text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 whitespace-nowrap hover:bg-black/10 ${isDark ? 'border-white/20 bg-white/10 text-white hover:bg-white/20' : ''}`}
                                >
                                  {secondaryBtnText}
                                </Link>
                              )}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}

              {/* Carousel Navigation Indicators */}
              {activeBanners.length > 1 && (
                <div className="absolute bottom-4 md:bottom-8 lg:bottom-12 left-0 w-full md:w-[55%] px-4 sm:px-12 md:px-16 lg:px-32 flex justify-center md:justify-start items-center space-x-2 md:space-x-3 z-30">
                  {activeBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveBannerIndex(i);
                        setActiveThumbnailIndex(0);
                      }}
                      className={`transition-all duration-500 ease-out rounded-full ${
                        activeBannerIndex === i ? 'w-10 h-1 bg-brand-dark' : 'w-2 h-2 bg-brand-dark/20 hover:bg-brand-dark/40'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>


            {/* Split Gradient Transition Line */}
            <div className="w-full h-8 bg-gradient-to-b from-[#F1ECE1] to-brand-white relative overflow-hidden flex items-start justify-center">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent mt-[-1px]" />
            </div>

            {/* 2. CATEGORIES GRID */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center select-none"
            >
              <motion.p variants={fadeInUp} className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-brand-gold uppercase mb-2">
                HANDPICKED CURATIONS
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-display text-3xl sm:text-4xl text-brand-dark tracking-tight font-bold mb-3">
                {settings?.homeCategoryHeading || 'Shop by Category'}
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-sm text-brand-muted/80 max-w-lg mx-auto mb-12 leading-relaxed">
                {settings?.homeCategoryDescription || 'Discover our curated collections'}
              </motion.p>

              <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {activeCategories.map((cat, i) => (
                  <motion.div variants={scaleUp} key={i}>
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden block h-full bg-brand-dark"
                    >
                      <LazyImage
                        src={cat.imageUrl}
                        alt={cat.name}
                        aspect="aspect-[3/4] h-full w-full"
                        imgClassName="transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end text-left z-10">
                        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                          <span className="font-display text-white text-xl sm:text-2xl font-bold tracking-wide">
                            {cat.name}
                          </span>
                          
                          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out mt-1 sm:mt-2">
                             <div className="overflow-hidden">
                               <p className="text-xs sm:text-sm text-white/90 mb-3 sm:mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                                 {cat.description || `Handwoven elegance for weddings and celebrations.`}
                               </p>
                               <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-brand-gold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
                                 EXPLORE COLLECTION <span className="text-sm leading-none ml-1">&rarr;</span>
                               </span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>

            {/* 3. FEATURED PRODUCTS COLLECTION */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="bg-brand-white border-t border-b border-brand-border/40 py-20 lg:py-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                  <motion.div variants={fadeInUp} className="text-left">
                    <h2 className="font-display text-3xl text-brand-dark font-bold uppercase tracking-wide">
                      {settings?.homeFeaturedHeading || 'Featured Collection'}
                    </h2>
                    <span className="text-xs text-brand-gold font-sans font-bold uppercase tracking-widest mt-1 block">
                      {settings?.homeFeaturedSubheading || 'Premium Wardrobe Curations'}
                    </span>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Link to="/shop" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-crimson hover:text-brand-gold flex items-center space-x-1.5 transition-colors">
                      <span>View All</span>
                      <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                </div>

                {collections.featured.length > 0 ? (
                  <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    {collections.featured.slice(0, 4).map(prod => (
                      <motion.div variants={fadeInUp} key={prod._id}>
                        <ProductCard
                          product={prod}
                          onQuickView={(p) => setQuickViewProduct(p)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-brand-muted text-sm text-center py-6">Add featured products from the admin panel to showcase here!</p>
                )}
              </div>
            </motion.section>

            {/* 4. PROMOTIONAL SPLIT BANNER */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={blurReveal}
              className="w-full bg-brand-dark text-brand-cream flex flex-col md:flex-row overflow-hidden border-t-2 border-b-2 border-brand-gold/30"
            >
              <div className="w-full md:w-1/2 p-10 sm:p-20 flex flex-col justify-center text-left space-y-5 relative">
                <div className="absolute inset-0 ambient-glow-bg z-0" />
                <div className="relative z-10">
                  <span className="text-brand-gold font-sans font-bold tracking-widest text-xs uppercase">Bespoke Boutique Experience</span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight uppercase tracking-wide mt-2">
                    {settings?.homePromoHeading || 'Handpicked. Curated. Yours.'}
                  </h2>
                  <p className="font-sans text-sm text-brand-cream/70 leading-relaxed max-w-md mt-4">
                    {settings?.homePromoDescription || 'Unsure of fabric weight, shade match, or sizes? Consult directly with our catalog experts on WhatsApp for product videos, customized sizing checkups, and COD booking services.'}
                  </p>
                  <div className="pt-4">
                    <a
                      href={`https://wa.me/${settings?.whatsAppNumber || '919999999999'}?text=Hi!%20I'm%20interested%20in%20shopping%20at%20Swastika%20Sarees.%20Could%20you%20share%20the%20latest%20arrivals%20catalog?%20🙏`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3.5 rounded text-xs font-semibold uppercase tracking-widest transition-colors shadow-lg"
                    >
                      <MessageSquare size={14} />
                      <span>Consult via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 grid grid-cols-3 aspect-video md:aspect-auto md:min-h-[420px]">
                <div className="h-full overflow-hidden">
                  <LazyImage src={settings?.homePromoImage1 || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=350"} alt="" aspect="h-full w-full" imgClassName="hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="h-full overflow-hidden border-l border-r border-brand-gold/20">
                  <LazyImage src={settings?.homePromoImage2 || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=350"} alt="" aspect="h-full w-full" imgClassName="hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="h-full overflow-hidden">
                  <LazyImage src={settings?.homePromoImage3 || "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=350"} alt="" aspect="h-full w-full" imgClassName="hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </motion.section>

            {/* 5. NEW ARRIVALS GRID */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24"
            >
              <div className="flex justify-between items-end mb-10 border-b border-brand-border/30 pb-4">
                <motion.div variants={fadeInUp} className="text-left">
                  <h2 className="font-display text-3xl text-brand-dark font-bold uppercase tracking-wide">New Arrivals</h2>
                  <span className="text-xs text-brand-gold font-sans font-bold uppercase tracking-widest mt-1 block">Unveil The Season's Best</span>
                </motion.div>
                <motion.div variants={fadeInUp}>
                  <Link to="/shop?sort=newest" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-crimson hover:text-brand-gold flex items-center space-x-1.5 transition-colors">
                    <span>View All New</span>
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>

              {collections.newArrivals.length > 0 ? (
                <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                  {collections.newArrivals.slice(0, 4).map(prod => (
                    <motion.div variants={fadeInUp} key={prod._id}>
                      <ProductCard product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <p className="text-brand-muted text-sm text-center py-6">Check back soon for new arrivals!</p>
              )}
            </motion.section>

            {/* 6. BESTSELLERS */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="bg-brand-cream/45 border-t border-b border-brand-border/40 py-20 lg:py-24"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10 border-b border-brand-border/30 pb-4">
                  <motion.div variants={fadeInUp} className="text-left">
                    <h2 className="font-display text-3xl text-brand-dark font-bold uppercase tracking-wide">Bestsellers</h2>
                    <span className="text-xs text-brand-gold font-sans font-bold uppercase tracking-widest mt-1 block">Customer Favorites</span>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Link to="/shop?sort=popular" className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-crimson hover:text-brand-gold flex items-center space-x-1.5 transition-colors">
                      <span>View All Bestselling</span>
                      <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                </div>

                {collections.bestsellers.length > 0 ? (
                  <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    {collections.bestsellers.slice(0, 4).map(prod => (
                      <motion.div variants={fadeInUp} key={prod._id}>
                        <ProductCard product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-brand-muted text-sm text-center py-6">Add bestselling products to display here!</p>
                )}
              </div>
            </motion.section>

            {/* 7. WHY CHOOSE US */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="bg-brand-cream border-b border-brand-border/30 py-20 lg:py-24 text-center select-none relative"
            >
              <div className="absolute inset-0 ambient-glow-bg" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.h2 variants={fadeInUp} className="font-display text-3xl text-brand-dark font-bold uppercase tracking-wide mb-2">Boutique Guarantee</motion.h2>
                <motion.div variants={fadeInUp} className="luxury-divider mx-auto" />
                
                <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <motion.div variants={fadeInUp} className="flex flex-col items-center p-6 bg-brand-white rounded-xl shadow-xs border border-brand-border/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-4">
                      <ShieldCheck size={28} />
                    </div>
                    <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1.5 uppercase tracking-wide">Handpicked Quality</h4>
                    <p className="text-2xs sm:text-xs text-brand-muted leading-relaxed">Each piece is individually checked for weave defects and stitching detail.</p>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} className="flex flex-col items-center p-6 bg-brand-white rounded-xl shadow-xs border border-brand-border/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-4">
                      <Truck size={28} />
                    </div>
                    <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1.5 uppercase tracking-wide">Pan-India Shipping</h4>
                    <p className="text-2xs sm:text-xs text-brand-muted leading-relaxed">Free standard shipping on cart totals above ₹999 anywhere in India.</p>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} className="flex flex-col items-center p-6 bg-brand-white rounded-xl shadow-xs border border-brand-border/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-4">
                      <MessageSquare size={28} />
                    </div>
                    <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1.5 uppercase tracking-wide">WhatsApp Support</h4>
                    <p className="text-2xs sm:text-xs text-brand-muted leading-relaxed">Get assistance in choosing designs, variants, and colors via video consult.</p>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} className="flex flex-col items-center p-6 bg-brand-white rounded-xl shadow-xs border border-brand-border/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-4">
                      <RotateCcw size={28} />
                    </div>
                    <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1.5 uppercase tracking-wide">Easy Returns</h4>
                    <p className="text-2xs sm:text-xs text-brand-muted leading-relaxed">Not happy with weight or color? Return within 7 days of delivery.</p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.section>

            {/* 8. CUSTOMER REVIEWS */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideUpFade}
              className="bg-brand-white border-t border-b border-brand-border/40 py-20 lg:py-24 text-center select-none overflow-hidden relative"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="font-display text-3xl sm:text-4xl text-brand-dark tracking-wide font-bold uppercase">Praise & Reviews</h2>
                <div className="luxury-divider" />
                
                <div className="relative min-h-[220px] flex items-center justify-center mt-6">
                  {activeReviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className={`absolute inset-x-0 transition-all duration-[800ms] ease-in-out flex flex-col items-center justify-center ${
                        activeReviewIndex === idx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none z-0'
                      }`}
                    >
                      <div className="flex text-brand-gold justify-center mb-6">
                        {[...Array(rev.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" className="mx-0.5" />)}
                      </div>
                      <blockquote className="text-base sm:text-lg md:text-xl text-brand-dark italic max-w-2xl font-serif leading-relaxed px-4 text-center font-light">
                        "{rev.comment}"
                      </blockquote>
                      <div className="mt-6 flex flex-col items-center font-medium">
                        <span className="text-xs sm:text-sm font-bold text-brand-dark tracking-wider uppercase">{rev.customerName}</span>
                        <span className="text-[10px] text-brand-gold font-sans font-bold uppercase tracking-widest mt-1">Verified Purchaser — {rev.product?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {activeReviews.length > 1 && (
                  <div className="flex justify-center items-center space-x-3.5 mt-8 z-20 relative">
                    <button
                      onClick={() => setActiveReviewIndex(prev => (prev - 1 + activeReviews.length) % activeReviews.length)}
                      className="p-2 rounded-full border border-brand-border/40 hover:border-brand-gold hover:text-brand-gold text-brand-muted transition-colors duration-300 flex items-center justify-center"
                      aria-label="Previous Review"
                    >
                      &#10094;
                    </button>
                    {activeReviews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveReviewIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          activeReviewIndex === i ? 'bg-brand-gold w-5' : 'bg-brand-border/50'
                        }`}
                        aria-label={`Go to review ${i + 1}`}
                      />
                    ))}
                    <button
                      onClick={() => setActiveReviewIndex(prev => (prev + 1) % activeReviews.length)}
                      className="p-2 rounded-full border border-brand-border/40 hover:border-brand-gold hover:text-brand-gold text-brand-muted transition-colors duration-300 flex items-center justify-center"
                      aria-label="Next Review"
                    >
                      &#10095;
                    </button>
                  </div>
                )}
              </div>
            </motion.section>

            {/* 9. INSTAGRAM FEED STRIP */}
            <motion.section 
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeScale}
              className="bg-brand-white border-t border-brand-border/40 py-20 lg:py-24 text-center select-none"
            >
              <h2 className="font-display text-2xl text-brand-dark font-bold uppercase tracking-wide mb-1">Follow Us On Instagram</h2>
              <a
                href="https://instagram.com/swastikasarees_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-brand-crimson font-bold hover:text-brand-gold uppercase tracking-widest transition-colors"
              >
                @swastikasarees_
              </a>
              
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3.5 mt-8 max-w-7xl mx-auto px-4">
                {[
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200',
                  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=200',
                  'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=200',
                  'https://images.unsplash.com/photo-1598530028795-0e68f863a8a3?auto=format&fit=crop&q=80&w=200',
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200',
                  'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=200'
                ].map((src, i) => (
                  <a
                    key={i}
                    href="https://instagram.com/swastikasarees_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-lg overflow-hidden group border border-brand-border/30 shadow-2xs hover:shadow-md transition-all duration-500"
                  >
                    <LazyImage src={src} alt="Instagram post thumbnail" aspect="aspect-square" imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-brand-cream select-none">
                      <Instagram size={20} className="mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="text-[9px] uppercase tracking-widest font-bold font-sans">View Post</span>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-10">
                <a
                  href="https://instagram.com/swastikasarees_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-brand-white hover:bg-brand-cream border border-brand-crimson/30 hover:border-brand-crimson text-brand-crimson px-7 py-3 rounded-sm text-xs font-semibold uppercase tracking-widest transition-all duration-300"
                >
                  <Instagram size={14} />
                  <span>Follow @swastikasarees_</span>
                </a>
              </div>
            </motion.section>

            {/* Quick View Modal */}
            <AnimatePresence>
              {quickViewProduct && (
                <QuickViewModal
                  product={quickViewProduct}
                  onClose={() => setQuickViewProduct(null)}
                />
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
