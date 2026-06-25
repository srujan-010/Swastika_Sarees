import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [hovered, setHovered] = useState(false);

  const isSaved = isInWishlist(product._id);
  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';
  const secondaryImage = product.images?.find(img => !img.isPrimary && img.displayOrder > 0)?.url || product.images?.[1]?.url || primaryImage;

  const currentPrice = product.price / 100;
  const originalPrice = product.originalPrice ? product.originalPrice / 100 : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Extract unique colors from variants
  const colors = [];
  const colorMap = new Map();
  product.variants?.forEach(v => {
    if (v.colorName && !colorMap.has(v.colorName)) {
      colorMap.set(v.colorName, true);
      colors.push({ name: v.colorName, hex: v.colorHex });
    }
  });

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use first variant as default choice if available
    const defaultVariant = product.variants?.[0];
    
    addItem({
      product: product._id,
      slug: product.slug,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      color: defaultVariant?.colorName || null,
      size: defaultVariant?.size || null,
      imageUrl: primaryImage,
      stock: product.stock
    });
  };

  return (
    <div
      className="group relative bg-brand-white border border-brand-border/40 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      
      {/* Image Block */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-cream select-none">
        
        {/* Wishlist Toggle Button (Top-Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md z-10 transition-transform duration-200 hover:scale-110 bg-brand-white/95 ${
            isSaved ? 'text-brand-crimson' : 'text-brand-muted hover:text-brand-crimson'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>

        {/* Status Badges (Top-Left) */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10 select-none">
          {product.isNewArrival && (
            <span className="bg-brand-gold text-brand-cream text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-sm shadow-xs">
              NEW
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-brand-crimson text-brand-cream text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-sm shadow-xs">
              BESTSELLER
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-emerald-600 text-brand-cream text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-sm shadow-xs">
              SALE
            </span>
          )}
        </div>

        {/* Hover Swap Gallery Container */}
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={hovered ? secondaryImage : primaryImage}
            alt={product.name}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Out Of Stock Blurred Screen */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-brand-dark/25 backdrop-blur-xs flex items-center justify-center z-10 select-none">
            <span className="bg-brand-crimson text-brand-cream text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-sm border border-brand-gold/30 shadow-lg">
              Out Of Stock
            </span>
          </div>
        )}

        {/* Hover Action Row (Quick View & Add to Cart) */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 w-full p-3 flex justify-between items-center bg-gradient-to-t from-brand-dark/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 select-none">
            <button
              onClick={() => onQuickView(product)}
              className="flex items-center space-x-1 bg-brand-white hover:bg-brand-cream text-brand-dark px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-md"
            >
              <Eye size={12} />
              <span>Quick View</span>
            </button>
            <button
              onClick={handleAddToCart}
              className="flex items-center space-x-1 bg-brand-crimson hover:bg-brand-muted text-brand-cream px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-md border border-brand-gold/25"
            >
              <ShoppingCart size={12} />
              <span>Add to Cart</span>
            </button>
          </div>
        )}

      </div>

      {/* Info Block */}
      <div className="p-4 flex flex-col flex-grow text-left">
        <span className="text-[10px] font-sans text-brand-gold uppercase tracking-wider font-semibold mb-1">
          {product.category?.name || 'Ethnic Wear'}
        </span>
        
        <Link to={`/product/${product.slug}`} className="flex-grow">
          <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base leading-snug line-clamp-2 hover:text-brand-crimson transition-colors duration-200">
            {product.name}
          </h4>
        </Link>

        {/* Color Swatches */}
        {colors.length > 0 && (
          <div className="flex space-x-1.5 mt-2.5 mb-1 items-center select-none">
            {colors.slice(0, 5).map((color, i) => (
              <span
                key={i}
                title={color.name}
                className="w-3.5 h-3.5 rounded-full border border-brand-border shadow-2xs hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: color.hex || '#ccc' }}
              />
            ))}
            {colors.length > 5 && (
              <span className="text-[10px] font-sans text-brand-muted font-bold">+{colors.length - 5}</span>
            )}
          </div>
        )}

        {/* Price Row */}
        <div className="flex items-center space-x-2 mt-2 select-none">
          <span className="font-sans font-bold text-brand-crimson text-sm sm:text-base">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {originalPrice && (
            <>
              <span className="font-sans text-xs text-brand-muted line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded-sm font-sans text-[10px] font-semibold">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>

      </div>

    </div>
  );
}
