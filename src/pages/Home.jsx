import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Truck, RotateCcw, HelpCircle, Star, Heart, Instagram, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem, fadeInUp, scaleUp, kenBurns, fadeScale, slideUpFade, blurReveal, slideInRight } from '../utils/animations';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState({ featured: [], bestsellers: [], newArrivals: [] });
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  // Lead capture popup states
  const [showPopup, setShowPopup] = useState(false);
  const [popupEmail, setPopupEmail] = useState('');
  const [popupPhone, setPopupPhone] = useState('');
  const [popupSubmitting, setPopupSubmitting] = useState(false);
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Trigger popup after 10s or 200px scroll for unsigned-in new users
  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (token) return;

    const isDismissed = localStorage.getItem('swastika_popup_dismissed');
    const isSubmitted = localStorage.getItem('swastika_popup_submitted');
    if (isDismissed || isSubmitted) return;

    let triggered = false;
    const triggerPopup = () => {
      if (triggered) return;
      triggered = true;
      setShowPopup(true);
      window.removeEventListener('scroll', handleScroll);
    };

    const timer = setTimeout(() => {
      triggerPopup();
    }, 10000);

    const handleScroll = () => {
      if (window.scrollY > 200) {
        triggerPopup();
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    if (!popupEmail && !popupPhone) {
      alert('Please enter your email or WhatsApp number.');
      return;
    }
    setPopupSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: popupEmail, phone: popupPhone })
      });
      if (response.ok) {
        localStorage.setItem('swastika_popup_submitted', 'true');
        setPopupSuccess(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 2200);
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setPopupSubmitting(false);
    }
  };

  const handlePopupDismiss = () => {
    localStorage.setItem('swastika_popup_dismissed', 'true');
    setShowPopup(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [setRes, banRes, catRes, colRes, revRes] = await Promise.allSettled([
          fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/banners').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/categories').then(r => r.ok ? r.json() : []).catch(() => []),
          fetch('/api/products/collections').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/reviews/all?approved=true').then(r => r.ok ? r.json() : []).catch(() => [])
        ]);

        if (setRes.status === 'fulfilled' && setRes.value) {
          setSettings(setRes.value);
        }
        if (banRes.status === 'fulfilled' && banRes.value) {
          setBanners(banRes.value);
        }
        if (catRes.status === 'fulfilled' && catRes.value) {
          setCategories(catRes.value);
        }
        if (colRes.status === 'fulfilled' && colRes.value) {
          setCollections(colRes.value);
        }
        if (revRes.status === 'fulfilled' && revRes.value) {
          setReviews(revRes.value);
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll banner slides — runs after activeBanners is defined (see below)

  // Mock banners data if database collection is empty
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
      title: 'Summer Chiffon & Georgette Kurtis',
      subtitle: 'Lightweight, vibrant, and elegant. Shine bright this festive season!',
      ctaText: 'Explore Kurtis',
      ctaLink: '/shop?category=kurtis',
      imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200'
    }
  ];

  // Mock categories if empty
  const activeCategories = categories.length > 0 ? categories : [
    { name: 'Sarees', slug: 'sarees', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300' },
    { name: 'Kurtis', slug: 'kurtis', imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=300' },
    { name: 'Dress Materials', slug: 'dress-materials', imageUrl: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=300' },
    { name: 'Accessories', slug: 'accessories', imageUrl: 'https://images.unsplash.com/photo-1598530028795-0e68f863a8a3?auto=format&fit=crop&q=80&w=300' }
  ];

  // Mock reviews if empty
  const activeReviews = reviews.length > 0 ? reviews : [
    { customerName: 'Divya Reddy', rating: 5, comment: 'The Banarasi silk saree is absolutely gorgeous! The gold zari weave is so fine and luxurious. Shipping was so fast.', product: { name: 'Royal Banarasi Silk Saree' } },
    { customerName: 'Ananya Sharma', rating: 5, comment: 'Purchased a floral georgette kurti, the fitting is perfect and fabric is very lightweight and comfortable. Highly recommended!', product: { name: 'Floral Georgette Kurti' } },
    { customerName: 'Priya Patel', rating: 5, comment: 'Ordered dress material. The cotton fabric is thick and print is vibrant. Got matching accessories too, lovely customer service on WhatsApp.', product: { name: 'Handblock Print Cotton Suit' } }
  ];

  const handleNextBanner = () => {
    setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
    setActiveThumbnailIndex(0);
  };

  const handlePrevBanner = () => {
    setActiveBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    setActiveThumbnailIndex(0);
  };

  // Auto-scroll: now correctly uses activeBanners (includes fallback mocks)
  useEffect(() => {
    if (activeBanners.length <= 1 || isHoveringCarousel) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
      setActiveThumbnailIndex(0);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length, isHoveringCarousel]);

  // Auto-scroll reviews carousel
  useEffect(() => {
    if (activeReviews.length <= 1) return;
    const interval = setInterval(() => {
      setActiveReviewIndex((prev) => (prev + 1) % activeReviews.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [activeReviews.length]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 15;
    const y = (clientY / window.innerHeight - 0.5) * 15;
    setMousePosition({ x, y });
  };

  const premiumSlideData = [
    {
      badge: 'NEW COLLECTION',
      titleSplit: ['Royal Banarasi', 'Collection'],
      description: 'Experience timeless craftsmanship woven by the master artisans of Banaras. Designed for celebrations, weddings, and unforgettable moments.',
      chips: ['Pure Silk', 'Handwoven', 'Premium Finish', 'Wedding Collection'],
      price: '₹4,999',
      originalPrice: '₹8,999',
      discountBadge: 'Save 45%',
      thumbnails: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1585848526322-87db98f2445c?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=200'
      ]
    },
    {
      badge: 'PREMIUM CHIFFON',
      titleSplit: ['Summer Chiffon', 'Georgette'],
      description: 'Embrace the summer breeze with our ultra-lightweight chiffon collection. Featuring vibrant prints and impeccable draping for effortless elegance.',
      chips: ['Breathable', 'Vibrant Prints', 'Summer Ready', 'Easy Care'],
      price: '₹1,499',
      originalPrice: '₹2,999',
      discountBadge: 'Save 50%',
      thumbnails: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1596455607563-ad6193f76b5c?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1598530028795-0e68f863a8a3?auto=format&fit=crop&q=80&w=200'
      ]
    },
    {
      badge: 'FESTIVE SPECIAL',
      titleSplit: ['Festive Special', 'Edition'],
      description: 'Make a statement at your next celebration with our exclusive festive edition. Rich zari work and traditional motifs reimagined for the modern era.',
      chips: ['Rich Zari', 'Traditional', 'Elegant Drape', 'Exclusive'],
      price: '₹6,499',
      originalPrice: '₹12,999',
      discountBadge: 'Save 50%',
      thumbnails: [
        'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1585848526139-478db1738740?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1583391733958-d25e07fac662?auto=format&fit=crop&q=80&w=200'
      ]
    }
  ];

  return (
    <div className="relative">

      {/* 0. Brand-new Hero Split Landing Section (Appears above the main carousel) */}
      {settings?.heroLandingActive && (
        <motion.section 
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'top center' }}
          className="relative w-full min-h-[50vh] md:h-[65vh] flex flex-col md:flex-row bg-brand-cream overflow-hidden border-b border-brand-border/40 select-none"
        >
          {/* Left panel (Text Details & CTA) */}
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

          {/* Right panel (Media Section) */}
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
              // Fallback Images Carousel / Single Image
              <div className="w-full h-full relative">
                {settings.heroLandingImages && settings.heroLandingImages.length > 0 ? (
                  <img
                    src={settings.heroLandingImages[0]}
                    alt="Craftsmanship"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000"
                    alt="Craftsmanship Fallback"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* 1. HERO BANNER CAROUSEL (Premium Editorial Vogue-Style) */}
      {/* 1. HERO BANNER CAROUSEL (Premium Editorial Vogue-Style) */}
      <section 
        className="relative w-full overflow-hidden bg-[#FDFBF7] md:min-h-[85vh] lg:min-h-[90vh]"
        style={{ minHeight: 'calc(100vh - 80px)' }}
        onMouseEnter={() => setIsHoveringCarousel(true)}
        onMouseLeave={() => setIsHoveringCarousel(false)}
      >
        {/* Soft layered cream gradients and ambient lighting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#F4F0E6]/60 via-transparent to-[#FDFBF7] z-0 pointer-events-none"></div>

        {/* Very light Banarasi weave / paisley texture at 2-5% opacity */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/woven.png')]"></div>

        {/* Flowing silk-inspired background waves connecting text and image */}
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
          const extraData = premiumSlideData[index % premiumSlideData.length];

          return (
            <div
              key={slide._id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col md:flex-row px-4 sm:px-12 md:px-16 lg:px-24 py-8 md:py-16 lg:py-20 ${
                activeBannerIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Image Mobile (Top) / Desktop (Right Side 45%) */}
              <div className="w-full md:w-[45%] h-[45%] md:h-full relative order-1 md:order-2 overflow-visible z-10 flex items-end justify-center md:justify-start lg:justify-center">
                
                {/* Decorative Background Elements behind the active model */}
                <div className="absolute bottom-0 w-full h-[95%] flex items-end justify-center md:justify-start lg:justify-center pointer-events-none z-0">
                  {/* Subtle radial golden glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.18)_0%,_transparent_60%)]"></div>
                  {/* Large decorative arch */}
                  <div className="w-[85%] md:w-[95%] lg:w-[85%] h-full border border-brand-gold/20 rounded-t-full bg-[#FDFBF7]/30 backdrop-blur-[2px] relative overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.05)]">
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/10 to-transparent"></div>
                  </div>
                </div>

                <motion.div
                  className="relative w-full h-full max-h-[105%] md:max-h-[100%] flex items-end justify-center md:justify-start lg:justify-center z-10"
                  initial={{ opacity: 0, y: 15 }}
                  animate={activeBannerIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ opacity: { duration: 1.2 }, y: { duration: 1.2, ease: "easeOut" } }}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="w-auto h-full object-contain object-bottom scale-[1.05] md:scale-[1.08] lg:scale-110 origin-bottom drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Text Mobile (Bottom) / Desktop (Left Side 55%) */}
              <div className="w-full md:w-[55%] h-[55%] md:h-full flex flex-col justify-center text-center md:text-left z-20 order-2 md:order-1 pt-6 md:pt-0 md:pl-6 lg:pl-12">
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
                      className="max-w-[580px] mx-auto md:mx-0 space-y-5 md:space-y-6 flex flex-col items-center md:items-start"
                    >
                      {/* Small Collection Label */}
                      <motion.div 
                        variants={{ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                        className="inline-block"
                      >
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-brand-dark/70 flex items-center justify-center md:justify-start">
                          <span className="w-8 h-px bg-brand-gold mr-3 hidden md:block"></span>
                          {extraData.badge}
                          <span className="w-8 h-px bg-brand-gold ml-3 md:hidden block"></span>
                        </span>
                      </motion.div>

                      {/* Large Luxury Heading */}
                      <motion.div 
                        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                        className="font-display leading-[1.05] text-brand-dark flex flex-col space-y-1"
                      >
                        <span className="text-3xl sm:text-4xl md:text-[3.2rem] lg:text-[4rem] tracking-tight font-medium drop-shadow-sm">{extraData.titleSplit[0]}</span>
                        <span className="text-3xl sm:text-4xl md:text-[3.2rem] lg:text-[4rem] italic text-brand-gold font-light">{extraData.titleSplit[1] || slide.title}</span>
                      </motion.div>

                      {/* Elegant Description */}
                      <motion.p 
                        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                        className="font-sans text-xs sm:text-sm md:text-base text-brand-muted leading-relaxed font-light md:pr-10"
                      >
                        {extraData.description}
                      </motion.p>

                      {/* Feature Chips */}
                      <motion.div 
                        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                        className="flex flex-wrap justify-center md:justify-start gap-2 pt-1"
                      >
                        {extraData.chips.map((chip, idx) => (
                          <span key={idx} className="text-[9px] sm:text-[10px] px-3 py-1 bg-brand-white/60 border border-brand-border/40 text-brand-dark/70 uppercase tracking-widest rounded-sm backdrop-blur-sm">
                            {chip}
                          </span>
                        ))}
                      </motion.div>

                      {/* Price */}
                      <motion.div 
                        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                        className="flex items-center space-x-4 pt-4"
                      >
                        <span className="text-xl sm:text-2xl md:text-3xl font-display font-medium text-brand-dark">{extraData.price}</span>
                        <span className="text-xs sm:text-sm md:text-base text-brand-muted/70 line-through decoration-brand-muted/40 decoration-1">{extraData.originalPrice}</span>
                      </motion.div>

                      {/* Buttons */}
                      <motion.div 
                        variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}
                        className="flex flex-row items-center space-x-3 sm:space-x-4 pt-4 w-full justify-center md:justify-start"
                      >
                        <Link
                          to={slide.ctaLink}
                          className="bg-brand-dark text-brand-cream px-6 sm:px-10 py-3.5 sm:py-4 rounded-sm text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:bg-brand-crimson whitespace-nowrap"
                        >
                          {slide.ctaText || 'Explore Collection'}
                        </Link>
                        <Link
                          to="/shop"
                          className="bg-brand-white/50 border border-brand-dark/20 text-brand-dark px-6 sm:px-10 py-3.5 sm:py-4 rounded-sm text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-brand-white hover:border-brand-dark/40 whitespace-nowrap backdrop-blur-sm"
                        >
                          View All
                        </Link>
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

      {/* Section Transition Gradient Line */}
      <div className="w-full h-8 bg-gradient-to-b from-[#F1ECE1] to-brand-white relative overflow-hidden flex items-start justify-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent mt-[-1px]"></div>
      </div>

      {/* 2. CATEGORY GRID (Luxury layout) */}
      <motion.section 
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeScale}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center select-none"
      >
        <h2 className="font-display text-3xl sm:text-4xl text-brand-dark tracking-wide font-bold uppercase">
          {settings?.homeCategoryHeading || 'Shop by Category'}
        </h2>
        <div className="luxury-divider" />
        <p className="text-sm text-brand-muted/80 max-w-lg mx-auto mb-12 leading-relaxed">
          {settings?.homeCategoryDescription || 'Handcrafted fabrics tailored for festive sparkle, weddings, daily charm, and special moments.'}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {activeCategories.map((cat, i) => (
            <motion.div variants={scaleUp} key={i}>
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-500 border border-brand-border/20 block h-full"
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute bottom-6 left-0 right-0 text-center flex flex-col items-center justify-center px-4">
                  <span className="font-display text-brand-cream text-lg sm:text-xl font-bold tracking-wider">
                    {cat.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-sans text-brand-gold-light mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Shop Collection &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. FEATURED PRODUCTS COLLECTION (Increased vertical padding) */}
      <motion.section 
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        variants={slideUpFade}
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

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] skeleton-shimmer rounded-xl" />
              ))}
            </div>
          ) : collections.featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {collections.featured.slice(0, 4).map(prod => (
                <motion.div variants={fadeInUp} key={prod._id}>
                  <ProductCard
                    product={prod}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-6">Add featured products from the admin panel to showcase here!</p>
          )}
        </div>
      </motion.section>

      {/* 4. PROMOTIONAL SPLIT BANNER (Enhanced typography and spacing) */}
      <motion.section 
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        variants={blurReveal}
        className="w-full bg-brand-dark text-brand-cream flex flex-col md:flex-row overflow-hidden border-t-2 border-b-2 border-brand-gold/30"
      >
        {/* Left block */}
        <div className="w-full md:w-1/2 p-10 sm:p-20 flex flex-col justify-center text-left space-y-5 relative">
          <div className="absolute inset-0 ambient-glow-bg z-0" />
          <div className="relative z-10">
            <span className="text-brand-gold font-sans font-bold tracking-widest text-xs uppercase">Bespoke Boutique Experience</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight uppercase tracking-wide mt-2">
              {settings?.homePromoHeading || 'Handpicked. Curated. Yours.'}
            </h2>
            <p className="font-sans text-sm text-brand-cream/70 leading-relaxed max-w-md mt-4">
              {settings?.homePromoDescription || 'Unsure of fabric weight, shade match, or sizes? Skip the queue and consult directly with our catalog experts on WhatsApp for product videos, customized sizing checkups, and COD booking services.'}
            </p>
          <div className="pt-2">
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
        
        {/* Right block: collage/grid of 3 mock images */}
        <div className="w-full md:w-1/2 grid grid-cols-3 aspect-video md:aspect-auto md:min-h-[420px]">
          <div className="h-full overflow-hidden">
            <img src={settings?.homePromoImage1 || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=350"} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="h-full overflow-hidden border-l border-r border-brand-gold/20">
            <img src={settings?.homePromoImage2 || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=350"} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="h-full overflow-hidden">
            <img src={settings?.homePromoImage3 || "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=350"} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </motion.section>

      {/* 5. NEW ARRIVALS GRID (Increased spacing) */}
      <motion.section 
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        variants={slideInRight}
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

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] skeleton-shimmer rounded-xl" />)}
          </div>
        ) : collections.newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {collections.newArrivals.slice(0, 4).map(prod => (
              <motion.div variants={fadeInUp} key={prod._id}>
                <ProductCard product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-brand-muted text-sm text-center py-6">Check back soon for new arrivals!</p>
        )}
      </motion.section>

      {/* 6. BESTSELLERS (Increased spacing and cream background) */}
      <motion.section 
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeScale}
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

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] skeleton-shimmer rounded-xl" />)}
            </div>
          ) : collections.bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {collections.bestsellers.slice(0, 4).map(prod => (
                <motion.div variants={fadeInUp} key={prod._id}>
                  <ProductCard product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-6">Add bestselling products to display here!</p>
          )}
        </div>
      </motion.section>

      {/* 7. WHY CHOOSE US (Luxury Refinement) */}
      <motion.section 
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, margin: "-50px" }}
        variants={blurReveal}
        className="bg-brand-cream border-b border-brand-border/30 py-20 lg:py-24 text-center select-none relative"
      >
        <div className="absolute inset-0 ambient-glow-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="font-display text-3xl text-brand-dark font-bold uppercase tracking-wide mb-2">Boutique Guarantee</h2>
          <div className="luxury-divider" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
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
          </div>
        </div>
      </motion.section>

      {/* 8. CUSTOMER REVIEWS (Testimonial Carousel) */}
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
                <blockquote className="text-base sm:text-lg md:text-xl text-brand-dark italic max-w-2xl font-serif leading-relaxed px-4 text-center">
                  "{rev.comment}"
                </blockquote>
                <div className="mt-6 flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-bold text-brand-dark tracking-wider uppercase">{rev.customerName}</span>
                  <span className="text-[10px] text-brand-gold font-sans font-bold uppercase tracking-widest mt-1">Verified Purchaser — {rev.product?.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Controls */}
          {activeReviews.length > 1 && (
            <div className="flex justify-center items-center space-x-3.5 mt-8">
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
        
        {/* Instagram Post Grid */}
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
              <img src={src} alt="Instagram post thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 text-brand-cream select-none">
                <Instagram size={20} className="mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                <span className="text-[9px] uppercase tracking-widest font-bold font-sans">View Post</span>
              </div>
            </a>
          ))}
        </div>

        {/* Instagram Follow CTA button */}
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

      {/* Quick View Popup Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Lead Capture Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#FFF8F0] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#E8D5C4]/30 h-[80vh] md:h-auto max-h-[600px] text-left"
            >
              {/* Close Button */}
              <button
                onClick={handlePopupDismiss}
                className="absolute top-4 right-4 z-20 p-2 text-[#1A0505]/60 hover:text-[#1A0505] transition-colors bg-white/20 md:bg-transparent rounded-full"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Left Side: Image panel (Saree models & discount) */}
              <div className="w-full md:w-1/2 relative bg-[#1A0505] h-2/5 md:h-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
                  alt="Special saree collections discount banner"
                  className="w-full h-full object-cover object-top"
                />
                {/* Floating overlays for discount */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0505]/90 via-[#1A0505]/20 to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="font-display text-2xl sm:text-3xl text-[#FFF8F0] font-bold leading-tight">
                    Most-wanted <span className="italic font-normal">saree</span> collection!
                  </span>
                  <div className="mt-3 inline-flex items-center space-x-2 bg-[#8B1A1A] text-[#FFF8F0] px-3 py-1.5 rounded border border-[#C8832A]/30 self-start text-xs font-bold uppercase tracking-wider">
                    <span>Get UPTO 50% OFF</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Beige form panel */}
              <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-left space-y-6 h-3/5 md:h-auto bg-[#E8D5C4]/30">
                {!popupSuccess ? (
                  <form onSubmit={handlePopupSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-[#1A0505] tracking-wide">
                        Drapes Everyone's Obsessed With!
                      </h3>
                      <p className="text-xs text-[#6B3A3A] font-sans leading-relaxed">
                        Subscribe to get exclusive collections, custom sizes updates, and first-order discount codes!
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Email Address */}
                      <div className="flex flex-col">
                        <input
                          type="email"
                          required
                          value={popupEmail}
                          onChange={(e) => setPopupEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="bg-[#FFF8F0]/80 border border-[#E8D5C4]/60 p-3 rounded text-xs focus:outline-none focus:border-[#C8832A] text-[#1A0505] placeholder-[#6B3A3A]/50"
                        />
                      </div>

                      {/* WhatsApp / Phone */}
                      <div className="flex space-x-2">
                        <div className="flex bg-[#FFF8F0]/80 border border-[#E8D5C4]/60 rounded px-3 py-2 items-center space-x-1.5 select-none shrink-0 text-xs">
                          <span>🇮🇳</span>
                          <span className="font-semibold text-[#1A0505]">+91</span>
                        </div>
                        <input
                          type="tel"
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit number"
                          value={popupPhone}
                          onChange={(e) => setPopupPhone(e.target.value)}
                          placeholder="Whatsapp Number"
                          className="flex-grow bg-[#FFF8F0]/80 border border-[#E8D5C4]/60 p-3 rounded text-xs focus:outline-none focus:border-[#C8832A] text-[#1A0505] placeholder-[#6B3A3A]/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={popupSubmitting}
                      className="w-full bg-[#5C2E2E] hover:bg-[#1A0505] text-[#FFF8F0] py-3 rounded text-xs font-semibold uppercase tracking-widest transition-colors duration-300 shadow-md flex items-center justify-center"
                    >
                      {popupSubmitting ? 'Joining...' : 'Join Swastika Family'}
                    </button>
                    
                    <div className="text-center pt-2 select-none">
                      <span className="text-[10px] text-[#6B3A3A]/60 font-sans tracking-wide">
                        Powered by <strong className="font-bold text-[#6B3A3A]/80">Swastika Sarees</strong>
                      </span>
                    </div>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 space-y-4"
                  >
                    <span className="text-4xl">🎉</span>
                    <h3 className="font-display font-bold text-2xl text-[#1A0505]">
                      Welcome to the Family!
                    </h3>
                    <p className="text-xs text-[#6B3A3A] font-sans max-w-xs mx-auto leading-relaxed">
                      Thank you for subscribing. We will send exclusive offers and updates directly to your inbox and WhatsApp!
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
