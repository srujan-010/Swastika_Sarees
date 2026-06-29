import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { useModalStore } from '../../store/modalStore';

export default function GlobalModal() {
  const { isOpen, modalData, closeModal } = useModalStore();

  if (!modalData && !isOpen) return null;

  // Use modalData if present, otherwise fallback to prevent crashes during exit animation
  const { type, title, message, confirmText, cancelText, isDanger } = modalData || {};

  const handleConfirm = () => closeModal(true);
  const handleCancel = () => closeModal(false);

  // Icon mapping
  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={40} className="text-emerald-500 mb-4 mx-auto" />;
      case 'error':
        return <XCircle size={40} className="text-brand-crimson mb-4 mx-auto" />;
      case 'warning':
        return <AlertTriangle size={40} className="text-amber-500 mb-4 mx-auto" />;
      case 'info':
        return <Info size={40} className="text-blue-500 mb-4 mx-auto" />;
      case 'confirm':
      default:
        return <HelpCircle size={40} className="text-brand-gold mb-4 mx-auto" />;
    }
  };

  // Button styles mapping
  const getPrimaryButtonClass = () => {
    if (type === 'error' || isDanger) {
      return "bg-brand-crimson text-white hover:bg-red-700";
    }
    return "bg-brand-dark text-white hover:bg-black";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={type === 'confirm' ? undefined : handleConfirm}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-brand-white rounded-[18px] shadow-2xl p-6 md:p-8 w-full max-w-[450px] overflow-hidden text-center border border-brand-border/30"
          >
            {renderIcon()}
            
            <h3 className="text-[18px] font-display font-bold text-brand-dark mb-2">
              {title}
            </h3>
            
            <p className="text-[15px] font-medium text-brand-muted mb-8 leading-relaxed whitespace-pre-wrap">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {type === 'confirm' && (
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-brand-dark bg-brand-cream/80 hover:bg-brand-cream transition-colors border border-brand-border/50 text-sm"
                >
                  {cancelText || 'Cancel'}
                </button>
              )}
              
              <button
                onClick={handleConfirm}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold transition-colors text-sm shadow-sm ${getPrimaryButtonClass()}`}
              >
                {confirmText || (type === 'confirm' ? 'Confirm' : 'Done')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
