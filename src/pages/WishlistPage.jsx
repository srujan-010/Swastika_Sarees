import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleMoveToCart = (prod) => {
    // Add default variant choice if available
    const defaultVariant = prod.variants?.[0];
    addItem({
      product: prod._id,
      slug: prod.slug,
      name: prod.name,
      price: prod.price / 100, // convert paise to INR
      quantity: 1,
      color: defaultVariant?.colorName || null,
      size: defaultVariant?.size || null,
      imageUrl: prod.images?.[0]?.url,
      stock: prod.stock
    });
    toggleWishlist(prod);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center select-none flex flex-col items-center">
        <div className="p-4 bg-brand-crimson/10 text-brand-crimson rounded-full mb-6">
          <Heart size={48} />
        </div>
        <h2 className="font-display font-bold text-brand-dark text-2xl mb-2">Your Wishlist is Empty</h2>
        <p className="text-brand-muted text-sm max-w-sm mb-8 leading-relaxed font-sans">
          Save your favorite ethnic sarees, trendy kurtis, and designer materials to check them out here anytime.
        </p>
        <Link
          to="/shop"
          className="bg-brand-crimson hover:bg-brand-muted text-brand-cream font-semibold text-sm px-8 py-3 rounded-lg border border-brand-gold/30 shadow-md hover:shadow-lg transition-all"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left select-none">
      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-3xl mb-8">My Wishlist</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((prod) => {
          const primaryImage = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=300';
          const currentPrice = prod.price / 100;
          return (
            <div
              key={prod._id}
              className="bg-brand-white border border-brand-border/40 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-cream border-b">
                <img src={primaryImage} alt={prod.name} className="w-full h-full object-cover object-top" />
                <button
                  onClick={() => toggleWishlist(prod)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-brand-white/95 text-brand-crimson hover:scale-105 shadow-sm"
                  aria-label="Remove wishlist item"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-4 text-left flex flex-col justify-between flex-grow">
                <div>
                  <h4 className="font-display font-semibold text-brand-dark text-sm sm:text-base line-clamp-2 leading-snug">{prod.name}</h4>
                  <span className="block font-sans font-bold text-brand-crimson text-sm sm:text-base mt-2">₹{currentPrice.toLocaleString('en-IN')}</span>
                </div>
                
                <button
                  onClick={() => handleMoveToCart(prod)}
                  className="w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-2 rounded-lg mt-4 text-xs font-semibold border border-brand-gold/30 shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag size={14} />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
