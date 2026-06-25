import { create } from 'zustand';

export const useWishlistStore = create((set, get) => ({
  wishlist: JSON.parse(localStorage.getItem('swastika_wishlist')) || [],

  saveToStorage: (wishlist) => {
    localStorage.setItem('swastika_wishlist', JSON.stringify(wishlist));
  },

  toggleWishlist: (product) => {
    const { wishlist } = get();
    const exists = wishlist.some(item => item._id === product._id);
    
    let newWishlist;
    if (exists) {
      newWishlist = wishlist.filter(item => item._id !== product._id);
    } else {
      newWishlist = [...wishlist, product];
    }
    
    set({ wishlist: newWishlist });
    get().saveToStorage(newWishlist);
  },

  isInWishlist: (productId) => {
    return get().wishlist.some(item => item._id === productId);
  },

  clearWishlist: () => {
    set({ wishlist: [] });
    localStorage.removeItem('swastika_wishlist');
  }
}));
