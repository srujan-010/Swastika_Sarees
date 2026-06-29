import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [hovered, setHovered] = useState(false);

  const isSaved = isInWishlist(product._id);
  const sourceImages = product.mainProduct?.images?.length > 0 ? product.mainProduct.images : product.images;
  const primaryImage = sourceImages?.find(img => img.isPrimary)?.url || sourceImages?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';
  const secondaryImage = sourceImages?.find(img => !img.isPrimary && img.displayOrder > 0)?.url || sourceImages?.[1]?.url || primaryImage;

  const currentPrice = product.price / 100;
  const originalPrice = product.originalPrice ? product.originalPrice / 100 : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Extract unique colors and sum total stock
  const colorMap = new Map();
  let totalStock = 0;
  let hasSizes = false;

  if (product.mainProduct?.primaryColor?.name || product.colorName) {
    colorMap.set(product.mainProduct?.primaryColor?.name || product.colorName, { hex: product.mainProduct?.primaryColor?.hex || product.colorHex });
  }
  if (product.mainProduct?.sizes && product.mainProduct.sizes.length > 0) {
    hasSizes = true;
    totalStock += product.mainProduct.sizes.reduce((acc, s) => acc + (s.stock || 0), 0);
  }

  product.variants?.forEach(v => {
    if (v.colorName && !colorMap.has(v.colorName)) {
      colorMap.set(v.colorName, { hex: v.colorHex });
    }
    if (v.sizes && v.sizes.length > 0) {
      hasSizes = true;
      totalStock += v.sizes.reduce((acc, s) => acc + (s.stock || 0), 0);
    }
  });

  const colors = Array.from(colorMap.entries()).map(([name, {hex}]) => ({name, hex}));

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
      whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-brand-white border border-brand-border/30 rounded-xl overflow-hidden shadow-xs hover:shadow-[0_20px_40px_rgba(200,131,42,0.12)] transition-shadow duration-500 flex flex-col h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      
      {/* Image Block */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-brand-cream select-none">
        
        {/* Wishlist Toggle Button (Top-Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md z-30 transition-all duration-500 hover:scale-110 bg-brand-white/95 border border-brand-border/20 ${
            isSaved ? 'text-brand-crimson' : 'text-brand-muted hover:text-brand-crimson'
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

        {/* Status Badges (Top-Left) */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-4 left-4 flex flex-col space-y-2 z-30 select-none"
        >
          {product.isNewArrival && (
            <span className="bg-brand-gold text-brand-cream text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm shadow-xs border border-brand-gold/10">
              NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-brand-crimson text-brand-cream text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm shadow-xs border border-brand-crimson/10">
              BESTSELLER
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-brand-dark text-brand-cream text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm shadow-xs border border-brand-dark/10">
              SALE
            </span>
          )}
        </motion.div>

        {/* Hover Swap Gallery Container (Smooth crossfade) */}
        <Link to={`/product/${product.slug}`} className="block h-full w-full relative group/img">
          <img
            src={primaryImage}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={product.name}
              className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.03] ${
                hovered ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
          
          {/* Soft Dark Overlay on Hover */}
          <div className={`absolute inset-0 bg-black/15 transition-opacity duration-500 pointer-events-none z-10 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
        </Link>

        {/* Out Of Stock Translucent White Window Overlay & Centered Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 z-20 select-none flex items-center justify-center pointer-events-none">
            <span className="bg-white/90 backdrop-blur-xs text-brand-dark text-[10px] sm:text-xs font-bold tracking-widest uppercase px-4 py-3 rounded-full border border-white/20 shadow-md">
              OUT OF STOCK
            </span>
          </div>
        )}

        {/* Hover Action Row (Quick View & Add to Cart) */}
        <div className="absolute bottom-0 left-0 w-full p-4 pb-6 flex flex-col items-center justify-end space-y-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.25,0.46,0.45,0.94] z-20 select-none">
          {isOutOfStock ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickView(product)}
              className="w-[85%] max-w-[200px] flex justify-center items-center space-x-2 bg-brand-white hover:bg-brand-cream text-brand-dark px-4 py-3 rounded-md text-sm font-semibold tracking-wide transition-colors shadow-lg"
            >
              <Eye size={16} />
              <span>Quick View</span>
            </motion.button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onQuickView(product)}
                className="w-[85%] max-w-[200px] flex justify-center items-center space-x-2 bg-brand-white/95 backdrop-blur-md hover:bg-brand-white text-brand-dark px-4 py-3 rounded-md text-sm font-semibold tracking-wide transition-colors shadow-lg"
              >
                <Eye size={16} />
                <span>Quick View</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="w-[85%] max-w-[200px] flex justify-center items-center space-x-2 bg-brand-crimson hover:bg-brand-gold hover:text-brand-dark text-brand-cream px-4 py-3 rounded-md text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg border border-brand-gold/25"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </motion.button>
            </>
          )}
        </div>

      </div>

      {/* Info Block */}
      <div className="p-5 flex flex-col flex-grow text-left bg-brand-white justify-between">
        <div className="space-y-3">
          <span className="text-[10px] font-sans text-brand-gold uppercase tracking-widest font-bold block">
            {product.category?.name || 'Ethnic Wear'}
          </span>
          
          <Link to={`/product/${product.slug}`} className="block">
            <h4 className="font-display font-semibold text-brand-dark text-base leading-snug line-clamp-2 hover:text-brand-crimson transition-colors duration-300 h-12">
              {product.name}
            </h4>
          </Link>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <div className="flex space-x-2 items-center select-none pt-1">
              {colors.slice(0, 5).map((color, i) => (
                <span
                  key={i}
                  title={color.name}
                  className="w-4 h-4 rounded border border-brand-border shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: color.hex || '#ccc' }}
                />
              ))}
              {colors.length > 5 && (
                <span className="text-xs font-sans text-brand-muted font-bold pl-1">+{colors.length - 5}</span>
              )}
            </div>
          )}
        </div>

        {/* Price Row */}
        <div className="flex items-center space-x-3 mt-5 select-none">
          <span className="font-sans font-bold text-brand-crimson text-lg">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {originalPrice && (
            <>
              <span className="font-sans text-sm text-brand-muted line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="border border-brand-gold/20 bg-brand-gold/5 text-brand-gold px-2 py-0.5 rounded-sm font-sans text-[10px] font-bold">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>

      </div>

    </motion.div>
  );
}
