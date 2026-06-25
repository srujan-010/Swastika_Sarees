import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ArrowRight, ShoppingCart, Percent, AlertCircle, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    appliedCoupon,
    couponError,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getCouponDiscount,
    getShippingCharge,
    getTotal,
    shippingThreshold
  } = useCartStore();

  const { toggleWishlist } = useWishlistStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const couponDiscount = getCouponDiscount();
  const shippingCharge = getShippingCharge();
  const grandTotal = getTotal();

  const remainingForFreeShipping = Math.max(0, shippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / shippingThreshold) * 100);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    await applyCoupon(couponCode.trim());
    setCouponLoading(false);
  };

  const handleMoveToWishlist = (item) => {
    toggleWishlist({
      _id: item.product,
      name: item.name,
      slug: item.slug,
      price: item.price * 100, // convert back to paise for store toggle consistency
      images: [{ url: item.imageUrl }]
    });
    removeItem(item.product, item.color, item.size);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center select-none flex flex-col items-center">
        <div className="p-4 bg-brand-gold/10 text-brand-gold rounded-full mb-6">
          <ShoppingCart size={48} />
        </div>
        <h2 className="font-display font-bold text-brand-dark text-2xl mb-2">Your Cart is Empty</h2>
        <p className="text-brand-muted text-sm max-w-sm mb-8 leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore our exquisite collection of premium sarees, kurtis, and designer ethnic wear to find your perfect sparkle!
        </p>
        <Link
          to="/shop"
          className="bg-brand-crimson hover:bg-brand-muted text-brand-cream font-semibold text-sm px-8 py-3 rounded-lg border border-brand-gold/30 shadow-md hover:shadow-lg transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-3xl mb-8">Shopping Bag</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Cart Items List */}
        <div className="flex-1 space-y-4">
          
          {/* Free Shipping Alert banner */}
          <div className="bg-brand-cream border border-brand-border/60 p-4 rounded-xl select-none">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-2">
                <span className="text-xs text-brand-dark font-sans block">
                  Add <strong>₹{remainingForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong>FREE SHIPPING!</strong>
                </span>
                <div className="w-full bg-brand-white border border-brand-border/40 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-brand-gold h-full transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
                </div>
              </div>
            ) : (
              <span className="text-xs text-emerald-600 font-semibold block font-sans">
                🎉 Your order is eligible for <strong>FREE SHIPPING!</strong>
              </span>
            )}
          </div>

          <div className="divide-y divide-brand-border/40 bg-brand-white border border-brand-border/40 rounded-xl overflow-hidden shadow-xs">
            {cart.map((item, idx) => {
              const isOOS = item.stock === 0;
              const hasInsufficientStock = item.stock < item.quantity;
              
              return (
                <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 relative">
                  
                  {/* Item Image */}
                  <div className="w-20 h-28 bg-brand-cream border border-brand-border/40 rounded-md overflow-hidden shrink-0 self-start select-none">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover object-top" />
                  </div>

                  {/* Item Info details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link to={`/product/${item.slug}`} className="font-display font-semibold text-brand-dark text-sm sm:text-base hover:text-brand-crimson line-clamp-1">
                          {item.name}
                        </Link>
                        <span className="font-sans font-bold text-brand-dark text-sm sm:text-base select-none">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-2xs sm:text-xs text-brand-muted font-sans mt-1 select-none">
                        {item.color && (
                          <span className="bg-brand-cream px-2 py-0.5 rounded border border-brand-border">Color: {item.color}</span>
                        )}
                        {item.size && (
                          <span className="bg-brand-cream px-2 py-0.5 rounded border border-brand-border">Size: {item.size}</span>
                        )}
                      </div>

                      {/* Stock Warning Banners */}
                      {(isOOS || hasInsufficientStock) && (
                        <div className="mt-2.5 p-2 bg-red-50 text-brand-crimson rounded border border-brand-crimson/20 flex items-center space-x-1.5 text-2xs font-semibold select-none font-sans">
                          <AlertCircle size={12} />
                          <span>
                            {isOOS 
                              ? 'Out of Stock! Please remove to proceed.' 
                              : `Insufficient inventory. Only ${item.stock} pieces left.`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 select-none">
                      
                      {/* Qty Stepper */}
                      <div className="flex items-center space-x-2 border border-brand-border bg-brand-cream rounded-md p-0.5 w-24">
                        <button
                          onClick={() => updateQuantity(item.product, item.color, item.size, item.quantity - 1)}
                          className="p-0.5 hover:bg-brand-border rounded"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="flex-1 text-center text-xs font-bold text-brand-dark font-sans">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product, item.color, item.size, item.quantity + 1)}
                          className="p-0.5 hover:bg-brand-border rounded"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Remove & Save buttons */}
                      <div className="flex space-x-4 text-xs font-semibold text-brand-muted">
                        <button
                          onClick={() => handleMoveToWishlist(item)}
                          className="flex items-center space-x-1 hover:text-brand-crimson"
                        >
                          <Heart size={14} />
                          <span className="hidden sm:inline">Save for Later</span>
                        </button>
                        <button
                          onClick={() => removeItem(item.product, item.color, item.size)}
                          className="flex items-center space-x-1 hover:text-brand-crimson text-brand-muted"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          <div className="pt-2 select-none">
            <Link to="/shop" className="text-xs sm:text-sm font-semibold text-brand-crimson hover:underline">
              ← Continue Shopping
            </Link>
          </div>

        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="w-full lg:w-96 select-none self-start bg-brand-white border border-brand-border p-6 rounded-2xl shadow-xs">
          <h3 className="font-display font-bold text-brand-dark text-lg border-b border-brand-border/60 pb-3 mb-4">
            Order Summary
          </h3>

          {/* Coupon Form */}
          <div className="mb-6">
            <span className="block text-2xs font-semibold text-brand-dark uppercase tracking-wider mb-2 font-sans">Apply Coupon Code</span>
            {appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg flex items-center justify-between text-xs font-semibold text-emerald-800">
                <div className="flex items-center space-x-1.5 font-sans">
                  <Percent size={14} />
                  <span>Code: <strong>{appliedCoupon.code}</strong> applied!</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-brand-crimson font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex space-x-2 font-sans">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SWASTIKA10"
                  className="flex-grow bg-brand-cream border border-brand-border text-brand-dark px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-gold rounded-md"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-4 py-2 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </form>
            )}
            {couponError && (
              <p className="text-2xs text-brand-crimson font-semibold mt-1.5 font-sans">{couponError}</p>
            )}
          </div>

          {/* Pricing list */}
          <div className="space-y-3 font-sans text-xs border-b border-brand-border/60 pb-4 mb-4 text-brand-muted">
            <div className="flex justify-between">
              <span>Bag Subtotal:</span>
              <span className="text-brand-dark font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount:</span>
                <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Estimated Shipping:</span>
              <span className="text-brand-dark font-semibold">
                {shippingCharge > 0 ? `₹${shippingCharge.toLocaleString('en-IN')}` : 'FREE'}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-base font-bold text-brand-dark mb-6">
            <span>Grand Total:</span>
            <span className="text-brand-crimson text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          {/* Checkout triggers */}
          <button
            onClick={() => navigate('/checkout')}
            disabled={cart.some(item => item.stock < item.quantity)}
            className="w-full bg-brand-crimson hover:bg-brand-muted disabled:bg-brand-muted/20 text-brand-cream py-3.5 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors shadow-md border border-brand-gold/30 disabled:border-none"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

        </div>

      </div>

    </div>
  );
}
