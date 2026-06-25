import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cart: JSON.parse(localStorage.getItem('swastika_cart')) || [],
  appliedCoupon: null,
  couponError: null,
  shippingThreshold: 999, // Free shipping above ₹999
  shippingRate: 100, // Flat rate ₹100
  codRate: 50, // Extra COD fee ₹50

  saveToStorage: (cart) => {
    localStorage.setItem('swastika_cart', JSON.stringify(cart));
  },

  addItem: (item) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(
      (i) => i.product === item.product && i.color === item.color && i.size === item.size
    );

    let newCart = [...cart];
    if (existingIndex > -1) {
      const newQty = newCart[existingIndex].quantity + (item.quantity || 1);
      // Validate stock limit
      if (newQty <= (item.stock || 99)) {
        newCart[existingIndex].quantity = newQty;
      } else {
        newCart[existingIndex].quantity = item.stock;
      }
    } else {
      newCart.push({ ...item, quantity: item.quantity || 1 });
    }

    set({ cart: newCart });
    get().saveToStorage(newCart);
    get().revalidateCoupon(); // Recalculate discount if coupon applied
  },

  removeItem: (productId, color, size) => {
    const { cart } = get();
    const newCart = cart.filter(
      (i) => !(i.product === productId && i.color === color && i.size === size)
    );
    set({ cart: newCart });
    get().saveToStorage(newCart);
    get().revalidateCoupon();
  },

  updateQuantity: (productId, color, size, quantity) => {
    const { cart } = get();
    const newCart = cart.map((item) => {
      if (item.product === productId && item.color === color && item.size === size) {
        const validatedQty = Math.max(1, Math.min(quantity, item.stock || 99));
        return { ...item, quantity: validatedQty };
      }
      return item;
    });
    set({ cart: newCart });
    get().saveToStorage(newCart);
    get().revalidateCoupon();
  },

  clearCart: () => {
    set({ cart: [], appliedCoupon: null, couponError: null });
    localStorage.removeItem('swastika_cart');
  },

  applyCoupon: async (code) => {
    set({ couponError: null });
    const subtotal = get().getSubtotal();
    
    if (subtotal === 0) {
      set({ couponError: 'Cart is empty' });
      return false;
    }

    try {
      const response = await fetch(`/api/coupons/validate/${code}?orderValue=${subtotal}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        set({ appliedCoupon: data });
        return true;
      } else {
        set({ couponError: data.error || 'Failed to apply coupon' });
        set({ appliedCoupon: null });
        return false;
      }
    } catch (error) {
      set({ couponError: 'Error validating coupon', appliedCoupon: null });
      return false;
    }
  },

  removeCoupon: () => {
    set({ appliedCoupon: null, couponError: null });
  },

  revalidateCoupon: async () => {
    const { appliedCoupon } = get();
    if (appliedCoupon) {
      await get().applyCoupon(appliedCoupon.code);
    }
  },

  // Calculations
  getSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getCouponDiscount: () => {
    const { appliedCoupon } = get();
    if (!appliedCoupon) return 0;
    
    const subtotal = get().getSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return Math.round(subtotal * (appliedCoupon.value / 100));
    }
    return appliedCoupon.discountAmountINR || (appliedCoupon.value / 100);
  },

  getShippingCharge: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0 || subtotal >= get().shippingThreshold) {
      return 0;
    }
    return get().shippingRate;
  },

  getTotal: (isCOD = false) => {
    const subtotal = get().getSubtotal();
    const discount = get().getCouponDiscount();
    const shipping = get().getShippingCharge();
    const codCharge = isCOD ? get().codRate : 0;
    return Math.max(0, subtotal - discount + shipping + codCharge);
  }
}));
