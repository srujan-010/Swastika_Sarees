import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, ShieldCheck, Truck, RotateCcw, HelpCircle, Star, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState({ featured: [], bestsellers: [], newArrivals: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch banners
        const banRes = await fetch('/api/banners');
        const banData = await banRes.json();
        setBanners(banData);

        // Fetch categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(catData);

        // Fetch products collections
        const colRes = await fetch('/api/products/collections');
        const colData = await colRes.json();
        setCollections(colData);

        // Fetch approved reviews
        const revRes = await fetch('/api/reviews/all?approved=true');
        const revData = await revRes.json();
        setReviews(revData);
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
  };

  const handlePrevBanner = () => {
    setActiveBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // Auto-scroll: now correctly uses activeBanners (includes fallback mocks)
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  return (
    <div className="relative">
      
      {/* 1. HERO BANNER CAROUSEL */}
      <section className="relative h-[65vh] sm:h-[80vh] w-full overflow-hidden bg-brand-dark">
        {activeBanners.map((slide, index) => (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              activeBannerIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Slide Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            >
              {/* Overlay with brand tints */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/50 to-transparent" />
            </div>

            {/* Subtle Gold Shimmer particle animation layer */}
            <div className="absolute inset-0 gold-shimmer opacity-35 z-10 pointer-events-none" />

            {/* Text details overlay */}
            <div className="absolute inset-0 flex items-center z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-md sm:max-w-xl text-left text-brand-cream space-y-4">
                  <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-sm text-shimmer">
                    {slide.title}
                  </h1>
                  <p className="text-sm sm:text-lg font-sans text-brand-cream/80 drop-shadow-xs">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={slide.ctaLink}
                      className="inline-flex items-center space-x-2 bg-brand-crimson hover:bg-brand-muted text-brand-cream px-6 py-3 rounded-lg text-sm font-semibold tracking-wide border border-brand-gold/40 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ))}

        {/* Carousel controls */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrevBanner}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-brand-white/10 hover:bg-brand-white/20 text-brand-cream transition-colors"
              aria-label="Previous slide"
            >
              &#10094;
            </button>
            <button
              onClick={handleNextBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-brand-white/10 hover:bg-brand-white/20 text-brand-cream transition-colors"
              aria-label="Next slide"
            >
              &#10095;
            </button>
            
            {/* Indicators */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2.5 z-30">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBannerIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeBannerIndex === i ? 'bg-brand-gold w-6' : 'bg-brand-cream/40'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. CATEGORY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center select-none">
        <h2 className="font-display text-2xl sm:text-4xl text-brand-dark tracking-wide font-bold">
          Shop by Category
        </h2>
        <div className="paisley-divider">⚜️</div>
        <p className="text-sm text-brand-muted/80 max-w-lg mx-auto mb-10">
          Handcrafted fabrics tailored for festive sparkle, weddings, daily charm, and special moments.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {activeCategories.map((cat, i) => (
            <Link
              key={i}
              to={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-transparent hover:border-brand-gold/60"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/15 to-transparent" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="font-display text-brand-cream text-lg sm:text-xl font-bold tracking-wide">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS COLLECTION */}
      <section className="bg-brand-white border-t border-b border-brand-border/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div className="text-left">
              <h2 className="font-display text-2xl sm:text-3xl text-brand-dark font-bold">Featured Collection</h2>
              <span className="text-xs text-brand-gold font-sans font-semibold uppercase tracking-wider">Premium Wardrobe Curations</span>
            </div>
            <Link to="/shop" className="text-xs sm:text-sm font-semibold text-brand-crimson hover:text-brand-gold flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] skeleton-shimmer rounded-xl" />
              ))}
            </div>
          ) : collections.featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {collections.featured.slice(0, 4).map(prod => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-6">Add featured products from the admin panel to showcase here!</p>
          )}
        </div>
      </section>

      {/* 4. PROMOTIONAL SPLIT BANNER */}
      <section className="w-full bg-brand-dark text-brand-cream flex flex-col md:flex-row overflow-hidden border-t-2 border-b-2 border-brand-gold/30">
        {/* Left block */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center text-left space-y-4">
          <span className="text-brand-gold font-sans font-bold tracking-widest text-xs uppercase">Bespoke Boutique Experience</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            Handpicked. Curated. Yours.
          </h2>
          <p className="font-sans text-sm text-brand-cream/70 leading-relaxed max-w-md">
            Unsure of fabric weight, shade match, or sizes? Skip the queue and consult directly with our catalog experts on WhatsApp for product videos, customized sizing checkups, and COD booking services.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/919999999999?text=Hi!%20I'm%20interested%20in%20shopping%20at%20Swastika%20Sarees.%20Could%20you%20share%20the%20latest%20arrivals%20catalog?%20🙏"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 rounded-lg text-sm font-semibold transition-colors shadow-lg"
            >
              <MessageSquare size={16} />
              <span>Consult via WhatsApp</span>
            </a>
          </div>
        </div>
        
        {/* Right block: collage/grid of 3 mock images */}
        <div className="w-full md:w-1/2 grid grid-cols-3 aspect-video md:aspect-auto md:min-h-[400px]">
          <div className="h-full overflow-hidden">
            <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=350" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="h-full overflow-hidden border-l border-r border-brand-gold/20">
            <img src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=350" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="h-full overflow-hidden">
            <img src="https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=350" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* 5. NEW ARRIVALS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8 border-b border-brand-border/30 pb-3">
          <div className="text-left">
            <h2 className="font-display text-2xl sm:text-3xl text-brand-dark font-bold">New Arrivals</h2>
            <span className="text-xs text-brand-gold font-sans font-semibold uppercase tracking-wider">Unveil The Season's Best</span>
          </div>
          <Link to="/shop?sort=newest" className="text-xs sm:text-sm font-semibold text-brand-crimson hover:text-brand-gold flex items-center space-x-1">
            <span>View All New</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] skeleton-shimmer rounded-xl" />)}
          </div>
        ) : collections.newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {collections.newArrivals.slice(0, 4).map(prod => (
              <ProductCard key={prod._id} product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
            ))}
          </div>
        ) : (
          <p className="text-brand-muted text-sm text-center py-6">Check back soon for new arrivals!</p>
        )}
      </section>

      {/* 6. BESTSELLERS */}
      <section className="bg-brand-cream/45 border-t border-b border-brand-border/40 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8 border-b border-brand-border/30 pb-3">
            <div className="text-left">
              <h2 className="font-display text-2xl sm:text-3xl text-brand-dark font-bold">Bestsellers</h2>
              <span className="text-xs text-brand-gold font-sans font-semibold uppercase tracking-wider">Customer Favorites</span>
            </div>
            <Link to="/shop?sort=popular" className="text-xs sm:text-sm font-semibold text-brand-crimson hover:text-brand-gold flex items-center space-x-1">
              <span>View All Bestselling</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] skeleton-shimmer rounded-xl" />)}
            </div>
          ) : collections.bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {collections.bestsellers.slice(0, 4).map(prod => (
                <ProductCard key={prod._id} product={prod} onQuickView={(p) => setQuickViewProduct(p)} />
              ))}
            </div>
          ) : (
            <p className="text-brand-muted text-sm text-center py-6">Add bestselling products to display here!</p>
          )}
        </div>
      </section>

      {/* 7. WHY CHOOSE US */}
      <section className="bg-brand-cream border-b border-brand-border/30 py-16 text-center select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl text-brand-dark font-bold mb-10">Boutique Guarantee</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-4 bg-brand-white rounded-xl shadow-xs border border-brand-border/30">
              <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-3">
                <ShieldCheck size={28} />
              </div>
              <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1">Handpicked Quality</h4>
              <p className="text-2xs sm:text-xs text-brand-muted">Each piece is individually checked for weave defects and stitching detail.</p>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-brand-white rounded-xl shadow-xs border border-brand-border/30">
              <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-3">
                <Truck size={28} />
              </div>
              <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1">Pan-India Shipping</h4>
              <p className="text-2xs sm:text-xs text-brand-muted">Free standard shipping on cart totals above ₹999 anywhere in India.</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-brand-white rounded-xl shadow-xs border border-brand-border/30">
              <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-3">
                <MessageSquare size={28} />
              </div>
              <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1">WhatsApp Support</h4>
              <p className="text-2xs sm:text-xs text-brand-muted">Get assistance in choosing designs, variants, and colors via video consult.</p>
            </div>

            <div className="flex flex-col items-center p-4 bg-brand-white rounded-xl shadow-xs border border-brand-border/30">
              <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-3">
                <RotateCcw size={28} />
              </div>
              <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1">Easy Returns</h4>
              <p className="text-2xs sm:text-xs text-brand-muted">Not happy with weight or color? Return within 7 days of delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="font-display text-2xl sm:text-3xl text-brand-dark font-bold">Praise & Reviews</h2>
        <div className="paisley-divider">⚜️</div>
        
        <div className="flex flex-wrap justify-center gap-6 mt-6 select-none">
          {activeReviews.slice(0, 3).map((rev, idx) => (
            <div
              key={idx}
              className="bg-brand-white border border-brand-border/40 p-6 rounded-2xl shadow-xs text-left max-w-xs flex flex-col justify-between flex-grow"
            >
              <div>
                <div className="flex text-brand-gold mb-3.5">
                  {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-xs text-brand-dark italic mb-4 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
              <div className="border-t border-brand-border/50 pt-3 flex flex-col">
                <span className="text-xs font-bold text-brand-dark">{rev.customerName}</span>
                <span className="text-[10px] text-brand-muted font-sans font-semibold">Verified Purchaser — {rev.product?.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. INSTAGRAM FEED STRIP */}
      <section className="bg-brand-white border-t border-brand-border/40 py-16 text-center select-none">
        <h2 className="font-display text-lg sm:text-xl text-brand-dark font-bold mb-1">Follow Us On Instagram</h2>
        <a
          href="https://instagram.com/swastikasarees_"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-brand-crimson font-semibold hover:underline"
        >
          @swastikasarees_
        </a>
        
        {/* Placeholder Post Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mt-8 max-w-7xl mx-auto px-4">
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
              className="relative aspect-square rounded-lg overflow-hidden group border border-brand-border/40"
            >
              <img src={src} alt="Instagram post thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-brand-dark/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-brand-cream text-xs">
                <span>View Post ↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Quick View Popup Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
}
