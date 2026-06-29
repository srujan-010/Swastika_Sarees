import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [hovered, setHovered] = useState(false);
  const [selectedVariantColor, setSelectedVariantColor] = useState(null);
  const navigate = useNavigate();

  const isSaved = isInWishlist(product._id);
  const currentPrice = product.price / 100;
  const originalPrice = product.originalPrice ? product.originalPrice / 100 : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Extract unique colors and sum total stock
  const colorMap = new Map();
  let totalStock = 0;
  let hasSizes = false;

  const defaultImages = product.mainProduct?.images?.length > 0 ? product.mainProduct.images : product.images;

  if (product.mainProduct?.primaryColor?.name || product.colorName) {
    colorMap.set(product.mainProduct?.primaryColor?.name || product.colorName, { 
      hex: product.mainProduct?.primaryColor?.hex || product.colorHex,
      images: defaultImages
    });
  }
  if (product.mainProduct?.sizes && product.mainProduct.sizes.length > 0) {
    hasSizes = true;
    totalStock += product.mainProduct.sizes.reduce((acc, s) => acc + (s.stock || 0), 0);
  }

  product.variants?.forEach(v => {
    if (v.colorName && !colorMap.has(v.colorName)) {
      colorMap.set(v.colorName, { hex: v.colorHex, images: v.images });
    }
    if (v.sizes && v.sizes.length > 0) {
      hasSizes = true;
      totalStock += v.sizes.reduce((acc, s) => acc + (s.stock || 0), 0);
    }
  });

  const colors = Array.from(colorMap.entries()).map(([name, {hex, images}]) => ({name, hex, images}));

  const activeColorData = selectedVariantColor ? colorMap.get(selectedVariantColor) : null;
  const sourceImages = activeColorData?.images?.length > 0 ? activeColorData.images : defaultImages;
  
  const primaryImage = sourceImages?.find(img => img.isPrimary)?.url || sourceImages?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';
  const secondaryImage = sourceImages?.find(img => !img.isPrimary && img.displayOrder > 0)?.url || sourceImages?.[1]?.url || primaryImage;

  if (!hasSizes) {
    totalStock = product.stock || 0;
  }
  
  const isOutOfStock = totalStock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultColor = product.mainProduct?.primaryColor?.name || product.colorName || product.variants?.[0]?.colorName;
    const defaultSizes = (product.mainProduct?.sizes && product.mainProduct.sizes.length > 0) 
      ? product.mainProduct.sizes 
      : product.variants?.[0]?.sizes;
      
    const defaultSizeObj = defaultSizes?.find(s => s.stock > 0) || defaultSizes?.[0];
    addItem({
      product: product._id,
      slug: product.slug,
      name: product.name,
      price: currentPrice + (defaultSizeObj?.extraPricePaise ? defaultSizeObj.extraPricePaise / 100 : 0),
      quantity: 1,
      color: defaultColor || null,
      size: product.category?.slug !== 'sarees' ? (defaultSizeObj?.size || null) : null,
      sku: defaultSizeObj?.variantSku || product.sku,
      imageUrl: primaryImage,
      stock: defaultSizeObj?.stock !== undefined ? defaultSizeObj.stock : totalStock
    });
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden flex flex-col h-full bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-xl border border-brand-border/20 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* TOP HALF: Image Section */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-brand-cream select-none">

        {/* Wishlist Toggle Button (Top-Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md z-30 transition-all duration-300 hover:scale-110 bg-[#e3e1df]/95 border border-[#cfcdcb] ${isSaved ? 'text-brand-crimson' : 'text-[#3b2a2a]'
            }`}
          aria-label="Toggle Wishlist"
        >
          <motion.div
            whileHover={{ rotate: isSaved ? 0 : [0, -15, 15, -15, 15, 0], transition: { duration: 0.6 } }}
            whileTap={{ scale: 0.8 }}
            animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
          >
            <Heart size={16} fill={isSaved ? "currentColor" : "none"} className="transition-colors duration-300" />
          </motion.div>
        </button>

        {/* Status Badges (Top-Left Rectangular) */}
        <div className="absolute top-4 left-0 flex flex-col space-y-1 z-30">
          {product.isNewArrival && (
            <span className="bg-[#9b6a2e] text-[#f4ecd8] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 shadow-sm">
              NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-[#1f0f08] text-[#f4ecd8] text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 shadow-sm">
              BESTSELLER
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-brand-crimson text-brand-cream text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 shadow-sm">
              SALE
            </span>
          )}
        </div>

        {/* Hover Swap Gallery Container */}
        <div className="absolute inset-0 block h-full w-full z-0">
          <img
            src={primaryImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={product.name}
              className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 ${hovered ? 'opacity-100' : 'opacity-0'
                }`}
              loading="lazy"
            />
          )}
        </div>

        {/* Out Of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 z-20 select-none flex items-center justify-center pointer-events-none">
            <span className="bg-white/90 backdrop-blur-xs text-brand-dark text-[10px] sm:text-xs font-bold tracking-widest uppercase px-4 py-3 rounded-full border border-white/20 shadow-md">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Hover Content (Buttons + Details) */}
        <div className={`absolute inset-0 flex flex-col justify-end p-4 pb-5 z-20 transition-all duration-500 ease-[0.25,0.46,0.45,0.94] ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

          {/* Action Row (Buttons above rating) */}
          <div className={`flex flex-col items-center justify-end space-y-2.5 w-full mb-3 transition-transform duration-500 ${hovered ? 'translate-y-0' : 'translate-y-4'}`}>
            {!isOutOfStock ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                  className="w-[85%] max-w-[200px] flex justify-center items-center space-x-2 bg-white/95 backdrop-blur-md hover:bg-white text-brand-dark px-4 py-2 rounded text-sm font-semibold tracking-wide transition-colors shadow-lg pointer-events-auto"
                >
                  <Eye size={16} />
                  <span>Quick View</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="w-[85%] max-w-[200px] flex justify-center items-center space-x-2 bg-brand-crimson text-brand-cream hover:bg-brand-gold hover:text-brand-dark px-4 py-2 rounded text-sm font-semibold tracking-wide transition-colors duration-300 shadow-lg pointer-events-auto"
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                className="w-[85%] max-w-[200px] flex justify-center items-center space-x-2 bg-white/95 hover:bg-white text-brand-dark px-4 py-2.5 rounded text-sm font-semibold tracking-wide transition-colors shadow-lg pointer-events-auto"
              >
                <Eye size={16} />
                <span>Quick View</span>
              </motion.button>
            )}
          </div>

          {/* Hover Overlay Details */}
          <div className={`w-full text-left pointer-events-none transition-transform duration-500 delay-100 ${hovered ? 'translate-y-0' : 'translate-y-4'}`}>
            <div className="inline-flex items-center space-x-1.5 bg-white text-[#5c2e2e] px-2 py-0.5 rounded shadow-sm text-[11px] font-bold mt-1">
              <div className="flex space-x-0.5 text-[#5c2e2e]">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <span className="text-[#5c2e2e]/90 font-medium tracking-wide border-l border-[#5c2e2e]/30 pl-1.5">
                {product.rating || '4.9'} | {product.reviewsCount || '33'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM HALF: Info Section (Below Image) */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow text-left bg-white justify-between">
        <div className="space-y-2">
          <span className="text-[10px] font-sans text-[#8B5A2B] uppercase tracking-[0.15em] font-bold block">
            {product.category?.name || 'KURTIS'}
          </span>

          <div className="block">
            <h4 className="font-display font-medium text-brand-dark text-base sm:text-lg leading-snug line-clamp-2 hover:text-[#5C2E2E] transition-colors duration-300">
              {product.name}
            </h4>
          </div>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="flex space-x-2 items-center select-none pt-2">
              {colors.slice(0, 5).map((color, i) => (
                <span
                  key={i}
                  title={color.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariantColor(color.name);
                  }}
                  className={`w-4 h-4 shadow-sm transition-all cursor-pointer ${
                    selectedVariantColor === color.name 
                      ? 'rounded-full ring-1 ring-[#5C2E2E] ring-offset-[3px] ring-offset-white scale-110' 
                      : 'rounded-sm border border-black/10 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex || '#ccc' }}
                />
              ))}
              {colors.length > 5 && (
                <span className="text-[10px] font-sans text-brand-muted font-bold pl-1">+{colors.length - 5}</span>
              )}
            </div>
          )}
        </div>

        {/* Price Row */}
        <div className="flex items-center space-x-3 mt-4 select-none">
          <span className="font-sans font-bold text-[#5C2E2E] text-xl">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {originalPrice && (
            <>
              <span className="font-sans text-sm text-[#4a4a4a] line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="border border-[#8B5A2B]/40 text-[#8B5A2B] px-1.5 py-0.5 text-[10px] font-bold tracking-wider rounded-sm">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>
      </div>

    </motion.div>
  );
}
