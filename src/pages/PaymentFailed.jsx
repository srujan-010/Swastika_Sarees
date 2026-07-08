import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, ShoppingBag, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#FDFBF7] px-4 py-12">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Top Banner */}
          <div className="bg-red-50 px-6 py-8 text-center border-b border-red-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-100"
            >
              <XCircle className="w-10 h-10 text-red-500" strokeWidth={2} />
            </motion.div>
            <h1 className="font-display font-bold text-brand-dark text-2xl mb-2">
              Payment Failed
            </h1>
            <p className="text-sm text-red-700/80 max-w-xs mx-auto">
              We couldn't process your payment. Don't worry, no money was deducted from your account.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Common Reasons */}
            <div className="bg-red-50/50 rounded-xl p-4 border border-red-100/50">
              <div className="flex items-center gap-2 mb-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold text-xs uppercase tracking-widest">Common Reasons</span>
              </div>
              <ul className="text-sm text-red-700/80 space-y-1.5 list-disc pl-5 font-sans">
                <li>Bank server might be down or busy</li>
                <li>Incorrect card details or OTP</li>
                <li>Insufficient funds in the account</li>
                <li>Payment cancelled during processing</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-brand-crimson hover:bg-brand-dark text-white py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Payment Again
              </button>
              
              <Link
                to="/cart"
                className="w-full bg-white hover:bg-brand-cream border border-brand-border text-brand-dark py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Return to Cart
              </Link>
            </div>
            
            <div className="text-center pt-2">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-crimson transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Support note */}
        <p className="text-center text-xs text-brand-muted mt-6 max-w-sm mx-auto">
          If money was deducted from your account, it will be automatically refunded by your bank within 3-5 business days. For help, contact <Link to="/contact" className="text-brand-crimson font-semibold hover:underline">support</Link>.
        </p>
      </div>
    </div>
  );
}
