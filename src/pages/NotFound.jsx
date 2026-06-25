import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center select-none flex flex-col items-center font-sans">
      <div className="p-4 bg-brand-gold/10 text-brand-gold rounded-full mb-6">
        <HelpCircle size={48} />
      </div>
      <h1 className="font-display font-bold text-brand-dark text-4xl mb-2">404</h1>
      <h3 className="font-display font-semibold text-brand-dark text-lg mb-3">Page Not Found</h3>
      <p className="text-xs text-brand-muted max-w-xs mb-8 leading-relaxed">
        Oops! The page you are looking for has been moved, archived, or does not exist. Let's find your sparkle elsewhere!
      </p>
      <Link
        to="/shop"
        className="bg-brand-crimson hover:bg-brand-muted text-brand-cream font-semibold text-xs px-8 py-3 rounded-lg border border-brand-gold/30 shadow-md transition-colors"
      >
        Back to Shop
      </Link>
    </div>
  );
}
