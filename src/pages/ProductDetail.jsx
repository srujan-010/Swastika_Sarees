import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Send, ShieldAlert, Star, MessageSquare, Truck, Check, Share2, Plus, Minus, AlertTriangle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInUp, scaleUp } from '../utils/animations';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null); // null, 'serviceable', 'unserviceable', 'invalid'
  const [settings, setSettings] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  
  // Reviews submit form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const reviewsTabRef = useRef(null);

  // Fetch product detail & settings
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/slug/${slug}`);
        if (!res.ok) {
          navigate('/404');
          return;
        }
        const data = await res.json();
        
        setProduct(data);
        
        // Select default variant choices
        const defaultVariant = data.variants?.[0];
        setSelectedColor(defaultVariant?.colorName || data.mainProduct?.primaryColor?.name || data.colorName || null);
        const showSizeInit = data.showSizeChart !== false && data.category?.slug !== 'sarees';
        setSelectedSize(showSizeInit ? (defaultVariant?.size || null) : null);
        setActiveImageIndex(0);
        setQuantity(1);

        // Track recently viewed in localStorage
        trackRecentlyViewed(data);

        // Fetch related products
        const relRes = await fetch(`/api/products?category=${data.category?.slug}&limit=4`);
        if (relRes.ok) {
          const relData = await relRes.json();
          setRelatedProducts((relData.products || []).filter(p => p._id !== data._id));
        }

        // Fetch product reviews
        const revRes = await fetch(`/api/reviews/product/${data._id}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviewsData(revData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Load store general settings (for pincode checks and flat charges)
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setSettings(data))
      .catch(err => console.error('Failed to load settings:', err));

    fetchProductDetails();
  }, [slug]);

  // Load recently viewed lists
  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem('swastika_recently_viewed')) || [];
    // Exclude current product from list
    setRecentlyViewed(cached.filter(p => p.slug !== slug).slice(0, 8));
  }, [slug]);

  // Reset active image index when color changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  // Preload primary images of all variants for smooth switching
  useEffect(() => {
    if (product?.variants) {
      product.variants.forEach(v => {
        const primaryImg = v.images?.find(i => i.isPrimary) || v.images?.[0];
        if (primaryImg?.url) {
          const img = new Image();
          img.src = primaryImg.url;
        }
      });
    }
  }, [product]);

  const trackRecentlyViewed = (prod) => {
    const cached = JSON.parse(localStorage.getItem('swastika_recently_viewed')) || [];
    const filtered = cached.filter(p => p._id !== prod._id);
    const newHistory = [
      {
        _id: prod._id,
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        originalPrice: prod.originalPrice,
        images: prod.images,
        category: prod.category
      },
      ...filtered
    ].slice(0, 9); // Max 8 + current
    localStorage.setItem('swastika_recently_viewed', JSON.stringify(newHistory));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-full h-96 skeleton-shimmer rounded-2xl mb-8" />
        <div className="w-2/3 h-12 skeleton-shimmer rounded-md" />
      </div>
    );
  }

  if (!product) return null;

  const isSaved = isInWishlist(product._id);

  const activeVariant = product?.variants?.find(v => 
    v.colorName === selectedColor && (selectedSize ? v.size === selectedSize : true)
  ) || product?.variants?.find(v => v.colorName === selectedColor);

  const images = activeVariant?.images?.length > 0 
    ? activeVariant.images 
    : (product.mainProduct?.images?.length > 0 ? product.mainProduct.images : (product.images?.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600' }]));

  const safeImageIndex = Math.min(activeImageIndex, Math.max(0, images.length - 1));



  const displaySku = activeVariant?.variantSku || product.sku;
  const displayStock = activeVariant?.stock !== undefined ? activeVariant.stock : product.stock;
  const displayAvailability = activeVariant?.availability || product.availability || 'Single Ready';
  const displayVideo = activeVariant?.video || product.productVideo;
  
  const basePrice = product.price / 100;
  const extraPrice = activeVariant?.extraPricePaise ? activeVariant.extraPricePaise / 100 : 0;
  const currentPrice = basePrice + extraPrice;
  const originalPrice = product.originalPrice ? (product.originalPrice / 100) + extraPrice : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Extract unique variants or fallback to primary product color
  const colorsMap = new Map();
  const sizesMap = new Map();
  
  const defaultImageUrl = product.mainProduct?.images?.find(i => i.isPrimary)?.url || product.mainProduct?.images?.[0]?.url || product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';

  if (product.mainProduct?.primaryColor?.name || product.colorName) {
    colorsMap.set(
       product.mainProduct?.primaryColor?.name || product.colorName, 
       {
         hex: product.mainProduct?.primaryColor?.hex || product.colorHex || '#000000',
         imageUrl: defaultImageUrl,
         availability: product.availability || 'Single Ready'
       }
    );
  }

  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      if (v.colorName && !colorsMap.has(v.colorName)) {
        const variantImageUrl = v.images?.find(i => i.isPrimary)?.url || v.images?.[0]?.url || defaultImageUrl;
        colorsMap.set(v.colorName, {
          hex: v.colorHex,
          imageUrl: variantImageUrl,
          availability: v.availability || product.availability || 'Single Ready'
        });
      }
      if (v.size && !sizesMap.has(v.size)) sizesMap.set(v.size, true);
    });
  }

  const uniqueColors = Array.from(colorsMap.entries()).map(([name, data]) => ({ name, ...data }));
  const uniqueSizes = Array.from(sizesMap.keys());
  const showSize = product.showSizeChart !== false && product.category?.slug !== 'sarees';

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      slug: product.slug,
      name: product.name,
      price: currentPrice,
      quantity,
      color: selectedColor,
      size: selectedSize,
      imageUrl: images[0]?.url,
      stock: product.stock
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const getExpectedDeliveryDateString = (daysGap = 7) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + Number(daysGap));
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // WhatsApp Pre-filled message generator
  const getWhatsAppMessageUrl = () => {
    const waPhone = settings?.whatsAppNumber || '919999999999';
    const message = `Hi! I'm interested in ordering "${product.name}"${
      selectedColor ? ` in Color: ${selectedColor}` : ''
    }${selectedSize ? `, Size: ${selectedSize}` : ''}. Could you confirm availability and COD options? 🙏\nProduct link: ${window.location.href}`;
    
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  };

  // Check pincode availability
  const checkDeliveryPincode = (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeStatus('invalid');
      return;
    }

    const nonServiceableList = settings?.nonServiceablePincodes || [];
    if (nonServiceableList.includes(pincode)) {
      setPincodeStatus('unserviceable');
    } else {
      setPincodeStatus('serviceable');
    }
  };

  // Submit review form
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('swastika_token');
    if (!token) {
      setReviewMsg('Please log in to submit a review.');
      return;
    }

    setSubmittingReview(true);
    setReviewMsg('');
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      const data = await response.json();
      if (response.ok) {
        setReviewMsg('Review submitted successfully! It is pending approval by the admin.');
        setReviewComment('');
      } else {
        setReviewMsg(data.error || 'Failed to submit review.');
      }
    } catch (e) {
      setReviewMsg('Error connecting to the reviews backend.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Breadcrumbs */}
      <nav className="text-2xs sm:text-xs text-brand-muted font-sans mb-8 select-none flex space-x-1.5 justify-start text-left">
        <Link to="/" className="hover:text-brand-crimson">Home</Link>
        <span>&gt;</span>
        <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-brand-crimson">{product.category?.name}</Link>
        <span>&gt;</span>
        <span className="text-brand-dark font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Details Panel */}
      <motion.div 
        initial="initial"
        animate="whileInView"
        variants={staggerContainer}
        className="flex flex-col lg:flex-row gap-10 border-b border-brand-border/40 pb-16"
      >
        
        {/* Column 1: Images Gallery */}
        <motion.div variants={fadeInUp} className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-brand-cream border border-brand-border/40 shadow-xs relative select-none">
            
            {/* Primary Zoom image (CSS hover transition) */}
            <div className="w-full h-full cursor-zoom-in overflow-hidden bg-brand-cream relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[safeImageIndex]?.url}
                  src={images[safeImageIndex]?.url}
                  alt={`${product.name} - ${selectedColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full h-full object-cover object-top hover:scale-125 transition-transform duration-500 ease-out absolute inset-0 origin-center"
                />
              </AnimatePresence>
            </div>

            {displayStock === 0 && (
              <div className="absolute inset-0 bg-brand-dark/15 backdrop-blur-2xs flex items-center justify-center select-none pointer-events-none z-10">
                <div className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-md border border-white/20 text-brand-dark p-5 rounded-full shadow-2xl animate-float-slow" style={{ width: "130px", height: "130px" }}>
                  <AlertTriangle size={32} className="text-brand-dark animate-bounce mb-1" />
                  <span className="text-[10px] font-bold tracking-widest text-center uppercase leading-tight">OUT OF<br/>STOCK</span>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="flex space-x-2.5 mt-4 overflow-x-auto w-full py-1.5 select-none">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-14 h-20 rounded-md overflow-hidden border shrink-0 transition-all ${
                    safeImageIndex === index ? 'border-brand-crimson ring-1 ring-brand-crimson scale-102' : 'border-brand-border/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Column 2: Buy details */}
        <motion.div variants={fadeInUp} className="w-full lg:w-1/2 text-left flex flex-col">
          
          <span className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-2 font-sans select-none flex items-center space-x-2">
            <span>{product.brand ? product.brand : product.category?.name}</span>
            {product.brand && (
              <>
                <span className="text-brand-muted/40">•</span>
                <span className="text-brand-muted">{product.category?.name}</span>
              </>
            )}
          </span>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark leading-tight mb-3">
            {product.name}
          </h1>

          {/* Ratings Link scroll trigger */}
          <div className="flex items-center space-x-2.5 mb-5 text-sm font-sans select-none">
            <div className="flex text-brand-gold">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  fill={i < Math.round(product.ratings?.average || 0) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="font-semibold text-brand-dark">{product.ratings?.average || 0}★</span>
            <button
              onClick={() => {
                setActiveTab('reviews');
                reviewsTabRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-brand-crimson hover:underline text-xs"
            >
              ({reviewsData.reviews?.length || 0} customer reviews)
            </button>
          </div>

          {/* Pricing Block */}
          <div className="bg-brand-cream/60 border border-brand-border/40 p-4 rounded-xl flex items-center space-x-4 mb-6 select-none max-w-md shadow-2xs">
            <span className="font-sans font-bold text-brand-crimson text-2xl sm:text-3xl">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {originalPrice && (
              <>
                <span className="font-sans text-base text-brand-muted line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="bg-brand-gold text-brand-cream px-2 py-0.5 rounded-sm font-sans text-xs font-bold shadow-xs">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Details list */}
          <div className="grid grid-cols-2 gap-y-2 border-b border-brand-border/40 pb-5 mb-6 text-xs sm:text-sm font-sans text-brand-muted">
            {product.fabric && (
              <div><strong>Fabric:</strong> <span className="text-brand-dark">{product.fabric}</span></div>
            )}
            {displaySku && (
              <div><strong>SKU:</strong> <span className="text-brand-dark">{displaySku}</span></div>
            )}
            <div><strong>Shipping:</strong> <span className="text-brand-dark">Free above ₹999</span></div>
            <div><strong>COD:</strong> <span className="text-brand-dark">Available (₹50 extra)</span></div>
          </div>

          {/* Variants selection */}
          <div className="space-y-5 mb-6 select-none">
            
            {/* Variant Cards */}
            {uniqueColors.length > 0 && (
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">
                  Select Color: <span className="text-brand-gold font-sans">{selectedColor}</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3">
                  {uniqueColors.map((color) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`relative rounded-xl overflow-hidden border bg-brand-white flex flex-col items-center transition-all duration-200 w-full md:w-[100px] h-[140px] ${
                          isSelected 
                            ? 'border-brand-gold ring-1 ring-brand-gold shadow-md scale-[1.02] z-10' 
                            : 'border-brand-border/60 hover:border-brand-crimson/50 hover:shadow-xs'
                        }`}
                        title={color.name}
                      >
                        <div className="w-full h-[105px] bg-brand-cream shrink-0">
                          <img 
                            src={color.imageUrl} 
                            alt={color.name} 
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="w-full flex-1 flex flex-col justify-center items-center px-1.5 py-1">
                          <span className="text-[10px] font-sans font-semibold text-brand-dark truncate w-full text-center">
                            {color.name}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-brand-gold text-brand-cream rounded-full px-1.5 py-0.5 text-[8px] font-bold shadow-sm flex items-center space-x-0.5 z-10">
                            <Check size={8} /> <span>Selected</span>
                          </div>
                        )}
                        
                        {color.availability && color.availability.toLowerCase().includes('out of stock') && (
                          <div className="absolute inset-0 bg-brand-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-20">
                            <span className="bg-brand-crimson text-brand-cream text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider rounded">Sold Out</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size select buttons */}
            {showSize && uniqueSizes.length > 0 && (
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">
                  Select Size: <span className="text-brand-gold font-sans">{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2 font-sans">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded border text-xs font-semibold transition-all ${
                        selectedSize === size
                          ? 'bg-brand-crimson text-brand-cream border-brand-crimson shadow-sm'
                          : 'bg-brand-white border-brand-border text-brand-dark hover:border-brand-crimson'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity stepper block */}
            {displayStock > 0 && (
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Quantity</span>
                <div className="flex items-center space-x-3 w-32 border border-brand-border bg-brand-cream rounded-md p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-1 hover:bg-brand-border rounded transition-colors text-brand-dark"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-brand-dark font-sans">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(displayStock, q + 1))}
                    className="p-1 hover:bg-brand-border rounded transition-colors text-brand-dark"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 select-none">
            <button
              onClick={handleAddToCart}
              disabled={displayStock === 0}
              className="flex-1 bg-brand-crimson hover:bg-brand-muted disabled:bg-brand-muted/20 text-brand-cream py-3.5 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors shadow-md border border-brand-gold/30 disabled:border-none"
            >
              <ShoppingBag size={18} />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={displayStock === 0}
              className="flex-1 bg-brand-gold hover:bg-brand-gold-light disabled:bg-brand-gold/20 text-brand-dark py-3.5 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors shadow-md"
            >
              <span>Buy Now</span>
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                isSaved
                  ? 'border-brand-crimson text-brand-crimson bg-brand-crimson/5'
                  : 'border-brand-border text-brand-muted hover:border-brand-crimson bg-brand-white'
              }`}
              title="Save to Wishlist"
            >
              <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          {/* WhatsApp Direct Order Button */}
          <a
            href={getWhatsAppMessageUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors shadow-md mb-6 select-none"
          >
            <MessageSquare size={18} />
            <span>Order via WhatsApp 📲</span>
          </a>

          {/* Delivery Pincode Checker */}
          <div className="bg-brand-cream border border-brand-border/60 p-4 rounded-xl mb-6 select-none">
            <span className="block text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2.5">Delivery Check</span>
            <form onSubmit={checkDeliveryPincode} className="flex space-x-2 font-sans">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="flex-grow bg-brand-white border border-brand-border text-brand-dark px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold rounded-md"
              />
              <button
                type="submit"
                className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-4 py-2 rounded-md text-xs font-semibold transition-colors"
              >
                Check
              </button>
            </form>
            
            {pincodeStatus === 'serviceable' && (
              <span className="text-emerald-600 text-xs font-semibold flex items-center mt-2 font-sans">
                <Check size={14} className="mr-1" /> Delivery is available to this address (Estimated: 4-6 business days)
              </span>
            )}
            {pincodeStatus === 'unserviceable' && (
              <span className="text-brand-crimson text-xs font-semibold flex items-center mt-2 font-sans">
                <ShieldAlert size={14} className="mr-1" /> Service is currently unavailable to this pincode.
              </span>
            )}
            {pincodeStatus === 'invalid' && (
              <span className="text-brand-crimson text-xs font-semibold block mt-2 font-sans">
                Please input a valid 6-digit Indian pincode.
              </span>
            )}
          </div>

          {/* Expected Delivery Date Block */}
          <div className="bg-brand-white border border-brand-border/60 p-4 rounded-xl mb-6 select-none font-sans text-xs flex flex-col space-y-3">
            <div>
              <span className="block text-xs font-semibold text-brand-dark uppercase tracking-wider mb-2 font-display">Expected Delivery Date</span>
              <div className="flex items-center space-x-2 text-brand-dark mt-1">
                <span className="font-bold text-brand-crimson text-sm">
                  {getExpectedDeliveryDateString(settings?.deliveryDays || 7)}
                </span>
                <span className="text-3xs text-brand-muted font-medium">({settings?.deliveryDays || 7} Days Gap)</span>
              </div>
            </div>
            {product.dispatchTime && (
              <div className="border-t border-brand-border/40 pt-3">
                <span className="block text-xs font-semibold text-brand-dark uppercase tracking-wider mb-1 font-display">Dispatch</span>
                <div className="text-brand-muted text-sm font-medium">
                  {product.dispatchTime}
                </div>
              </div>
            )}
          </div>

          {/* Promo Strip */}
          <div className="bg-brand-gold/10 text-brand-dark text-center py-2.5 px-4 rounded-md border border-brand-gold/20 text-xs font-medium tracking-wide select-none">
            🎁 Use code <strong>FIRST10</strong> for 10% off | Free shipping above ₹999
          </div>

        </motion.div>

      </motion.div>

      {/* Tabs Section */}
      <section ref={reviewsTabRef} className="mt-16 text-left select-none">
        
        {/* Navigation tabs */}
        <div className="flex border-b border-brand-border/60">
          {[
            { id: 'description', label: 'Description' },
            showSize && { id: 'size_guide', label: 'Size Guide' },
            { id: 'shipping_policy', label: 'Shipping & Returns' },
            { id: 'reviews', label: `Reviews (${reviewsData.reviews?.length || 0})` }
          ].filter(Boolean).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setReviewMsg('');
              }}
              className={`px-4 sm:px-6 py-3 font-semibold text-xs sm:text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-crimson text-brand-crimson font-bold'
                  : 'border-transparent text-brand-muted hover:text-brand-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="py-8 font-sans text-xs sm:text-sm text-brand-dark leading-relaxed"
          >
            
            {/* Tab 1: Description */}
            {activeTab === 'description' && (
            <div className="space-y-6">
              <div
                className="prose prose-sm max-w-none text-brand-dark"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>No description provided.</p>' }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-border/40 pt-6 mt-6">
                {product.careInstructions && (
                  <div>
                    <h5 className="font-display font-semibold text-brand-dark mb-1 text-sm">Care Instructions</h5>
                    <p className="text-brand-muted">{product.careInstructions}</p>
                  </div>
                )}
                {product.fabric && (
                  <div>
                    <h5 className="font-display font-semibold text-brand-dark mb-1 text-sm">Material & Fabric</h5>
                    <p className="text-brand-muted">{product.fabric}</p>
                  </div>
                )}
              </div>

              {/* Product Highlights */}
              {product.productHighlights && product.productHighlights.length > 0 && (
                <div className="mt-6 border-t border-brand-border/40 pt-6">
                  <h5 className="font-display font-semibold text-brand-dark mb-3 text-sm">Product Highlights</h5>
                  <ul className="list-disc pl-5 space-y-1 text-brand-muted">
                    {product.productHighlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Saree Specifications Table */}
              {(product.sareeLength || product.sareeWidth || product.sareeWeight || product.blousePiece || product.latkan) && (
                <div className="mt-6 border-t border-brand-border/40 pt-6">
                  <h5 className="font-display font-semibold text-brand-dark mb-3 text-sm">Specifications</h5>
                  <div className="bg-brand-cream/30 rounded-lg overflow-hidden border border-brand-border/50 text-sm w-full md:w-2/3 lg:w-1/2">
                    {product.sareeLength && (
                      <div className="flex border-b border-brand-border/50 last:border-0"><div className="w-1/3 bg-brand-cream/50 p-3 font-semibold text-brand-dark">Saree Length</div><div className="w-2/3 p-3 text-brand-muted">{product.sareeLength}</div></div>
                    )}
                    {product.sareeWidth && (
                      <div className="flex border-b border-brand-border/50 last:border-0"><div className="w-1/3 bg-brand-cream/50 p-3 font-semibold text-brand-dark">Saree Width</div><div className="w-2/3 p-3 text-brand-muted">{product.sareeWidth}</div></div>
                    )}
                    {product.sareeWeight && (
                      <div className="flex border-b border-brand-border/50 last:border-0"><div className="w-1/3 bg-brand-cream/50 p-3 font-semibold text-brand-dark">Weight</div><div className="w-2/3 p-3 text-brand-muted">{product.sareeWeight}</div></div>
                    )}
                    {product.blousePiece && (
                      <div className="flex border-b border-brand-border/50 last:border-0"><div className="w-1/3 bg-brand-cream/50 p-3 font-semibold text-brand-dark">Blouse Piece</div><div className="w-2/3 p-3 text-brand-muted">{product.blousePiece} {product.blouseType && product.blousePiece === 'Included' ? `(${product.blouseType})` : ''}</div></div>
                    )}
                    {product.latkan && (
                      <div className="flex border-b border-brand-border/50 last:border-0"><div className="w-1/3 bg-brand-cream/50 p-3 font-semibold text-brand-dark">Latkan</div><div className="w-2/3 p-3 text-brand-muted">{product.latkan}</div></div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Video */}
              {product.productVideo && (
                <div className="mt-8 border-t border-brand-border/40 pt-6">
                  <h5 className="font-display font-semibold text-brand-dark mb-4 text-sm">Product Video</h5>
                  <div className="w-full max-w-[320px] aspect-[9/16] bg-brand-dark rounded-xl overflow-hidden shadow-lg relative">
                    <iframe
                      src={product.productVideo.replace("watch?v=", "embed/").replace("shorts/", "embed/")}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Size Guide */}
          {activeTab === 'size_guide' && (
            <div className="max-w-md">
              <h4 className="font-display font-semibold text-brand-dark text-sm mb-4">Measurement Chart (Inches)</h4>
              <div className="overflow-hidden border border-brand-border rounded-xl">
                <table className="min-w-full divide-y divide-brand-border bg-brand-white">
                  <thead className="bg-brand-cream">
                    <tr>
                      <th className="px-4 py-2 text-2xs font-bold text-brand-crimson uppercase tracking-wider text-left">Size</th>
                      <th className="px-4 py-2 text-2xs font-bold text-brand-crimson uppercase tracking-wider text-left">Bust</th>
                      <th className="px-4 py-2 text-2xs font-bold text-brand-crimson uppercase tracking-wider text-left">Waist</th>
                      <th className="px-4 py-2 text-2xs font-bold text-brand-crimson uppercase tracking-wider text-left">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/40 text-brand-muted">
                    <tr><td className="px-4 py-2 font-bold text-brand-dark">S</td><td className="px-4 py-2">34</td><td className="px-4 py-2">28</td><td className="px-4 py-2">44</td></tr>
                    <tr><td className="px-4 py-2 font-bold text-brand-dark">M</td><td className="px-4 py-2">36</td><td className="px-4 py-2">30</td><td className="px-4 py-2">44</td></tr>
                    <tr><td className="px-4 py-2 font-bold text-brand-dark">L</td><td className="px-4 py-2">38</td><td className="px-4 py-2">32</td><td className="px-4 py-2">45</td></tr>
                    <tr><td className="px-4 py-2 font-bold text-brand-dark">XL</td><td className="px-4 py-2">40</td><td className="px-4 py-2">34</td><td className="px-4 py-2">45</td></tr>
                    <tr><td className="px-4 py-2 font-bold text-brand-dark">XXL</td><td className="px-4 py-2">42</td><td className="px-4 py-2">36</td><td className="px-4 py-2">46</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Shipping & Returns */}
          {activeTab === 'shipping_policy' && (
            <div className="space-y-4 max-w-xl">
              <h4 className="font-display font-semibold text-brand-dark text-sm">Delivery Information</h4>
              <p className="text-brand-muted">
                {settings?.shippingPolicyText || "We ship to over 26,000 pin codes across India. Standard orders are dispatched within 24-48 hours and typically arrive within 4-7 business days."}
              </p>
              <h4 className="font-display font-semibold text-brand-dark text-sm pt-3">Easy 7-day Returns</h4>
              <p className="text-brand-muted">
                {settings?.returnPolicyText || "We have a hassle-free 7-day return policy. Items must be returned in their original condition with tag attachment intact. Re-booking exchanges is also available."}
              </p>
            </div>
          )}

          {/* Tab 4: Reviews & Rating charts */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Rating breakdown block */}
              <div className="w-full lg:w-1/3 p-5 bg-brand-cream/35 border border-brand-border/40 rounded-xl max-h-[300px]">
                <h4 className="font-display font-bold text-brand-dark text-sm mb-3">Reviews Summary</h4>
                <div className="flex items-center space-x-2.5 mb-4">
                  <span className="text-3xl font-extrabold text-brand-crimson font-sans">{product.ratings?.average || 0}</span>
                  <div>
                    <div className="flex text-brand-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.round(product.ratings?.average || 0) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-[10px] text-brand-muted">Based on {reviewsData.reviews?.length || 0} reviews</span>
                  </div>
                </div>

                {/* Rating bars */}
                <div className="space-y-1.5 font-sans text-2xs text-brand-muted">
                  {[5, 4, 3, 2, 1].map(r => {
                    const count = reviewsData.breakdown?.[r] || 0;
                    const total = reviewsData.reviews?.length || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={r} className="flex items-center space-x-2">
                        <span className="w-2">{r}</span>
                        <Star size={10} className="text-brand-gold shrink-0 mt-[-2px]" fill="currentColor" />
                        <div className="flex-1 bg-brand-cream border border-brand-border/50 h-2 rounded-full overflow-hidden">
                          <div className="bg-brand-gold h-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="w-full lg:w-2/3 space-y-6">
                
                {/* Submit review Form */}
                <div className="bg-brand-cream/25 border border-brand-border p-5 rounded-2xl">
                  <h4 className="font-display font-bold text-brand-dark text-sm mb-4">Write a Product Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <span className="block text-2xs font-semibold text-brand-dark uppercase tracking-wider mb-1.5">Rating</span>
                      <div className="flex space-x-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="text-brand-gold"
                          >
                            <Star size={20} fill={star <= reviewRating ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="block text-2xs font-semibold text-brand-dark uppercase tracking-wider mb-1.5">Review Comment</span>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with color, fabric texture, and fit..."
                        rows={3}
                        className="w-full bg-brand-white border border-brand-border text-brand-dark rounded-md p-3 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                  {reviewMsg && <p className="text-xs text-brand-crimson font-medium mt-3">{reviewMsg}</p>}
                </div>

                <div className="divide-y divide-brand-border/40 space-y-4">
                  {reviewsData.reviews?.length > 0 ? (
                    reviewsData.reviews.map((rev) => (
                      <div key={rev._id} className="pt-4 first:pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-brand-dark text-xs">{rev.customerName}</span>
                            {rev.isVerified && (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-300">Verified Buyer</span>
                            )}
                          </div>
                          <span className="text-[10px] text-brand-muted">{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex text-brand-gold my-1.5">
                          {[...Array(rev.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                        </div>
                        <p className="text-xs text-brand-muted leading-relaxed">
                          {rev.comment}
                        </p>
                        {rev.adminReply && (
                          <div className="bg-brand-cream/50 border-l-2 border-brand-gold p-3 mt-3.5 rounded-r-md">
                            <span className="block text-2xs font-bold text-brand-dark">Swastika Support Team reply:</span>
                            <p className="text-2xs text-brand-muted italic mt-0.5">{rev.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-brand-muted italic py-4">No approved reviews yet for this product. Be the first to write one!</p>
                  )}
                </div>

              </div>

            </div>
          )}

          </motion.div>
        </AnimatePresence>
      </section>

      {/* You may also like list */}
      {relatedProducts.length > 0 && (
        <motion.section 
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-20"
        >
          <div className="flex justify-between items-end border-b border-brand-border/30 pb-3 mb-8">
            <motion.h2 variants={fadeInUp} className="font-display text-xl sm:text-2xl text-brand-dark font-bold text-left">You May Also Like</motion.h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(prod => (
              <motion.div variants={fadeInUp} key={prod._id}>
                <ProductCard
                  product={prod}
                  onQuickView={() => {}}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <motion.section 
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-20"
        >
          <div className="flex justify-between items-end border-b border-brand-border/30 pb-3 mb-8">
            <motion.h2 variants={fadeInUp} className="font-display text-xl sm:text-2xl text-brand-dark font-bold text-left">Recently Viewed</motion.h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.slice(0, 4).map(prod => (
              <motion.div variants={fadeInUp} key={prod._id}>
                <ProductCard
                  product={prod}
                  onQuickView={() => {}}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

    </div>
  );
}
