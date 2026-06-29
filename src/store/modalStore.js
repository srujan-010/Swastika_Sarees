import { create } from 'zustand';

export const useModalStore = create((set, get) => ({
  isOpen: false,
  modalData: null,
  
  showModal: (config) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        modalData: { ...config, resolve }
      });
      if (config.autoClose) {
        setTimeout(() => {
          get().closeModal(true);
        }, config.autoClose);
      }
    });
  },
  
  closeModal: (result = false) => {
    const { modalData } = get();
    if (modalData?.resolve) {
      modalData.resolve(result);
    }
    set({ isOpen: false });
    // Let the animation finish before wiping data
    setTimeout(() => {
      set((state) => state.isOpen ? state : { ...state, modalData: null });
    }, 200);
  },

  // Helpers
  confirm: (title, message, options = {}) => get().showModal({ type: 'confirm', title, message, ...options }),
  success: (title, message, options = {}) => get().showModal({ type: 'success', title, message, ...options }),
  error: (title, message, options = {}) => get().showModal({ type: 'error', title, message, ...options }),
  warning: (title, message, options = {}) => get().showModal({ type: 'warning', title, message, ...options }),
  info: (title, message, options = {}) => get().showModal({ type: 'info', title, message, ...options }),
}));
