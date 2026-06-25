import React from 'react';
import { Sparkles, Heart, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-left select-none">
      <h1 className="font-display font-bold text-brand-dark text-3xl sm:text-4xl text-center mb-2">About Swastika Sarees</h1>
      <div className="paisley-divider">⚜️</div>
      
      <div className="space-y-8 mt-10 text-sm sm:text-base font-sans text-brand-muted leading-relaxed">
        
        <p className="text-brand-dark font-display text-lg sm:text-xl font-semibold leading-relaxed text-center max-w-2xl mx-auto italic">
          "Unveiling the magnificent heritage of Indian weaving with a modern boutique touch."
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-6">
          <div>
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
              alt="Silk weaving work"
              className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md border border-brand-border/40"
            />
          </div>
          <div className="space-y-4">
            <h3 className="font-display font-bold text-brand-dark text-lg sm:text-xl">Our Humble Story</h3>
            <p className="text-xs sm:text-sm">
              Established with a deep love for Indian handloom, Swastika Sarees is a family-owned boutique that brings weavers' craftsmanship directly to your wardrobe. Based in Telangana, we specialize in high-end silks, soft chiffons, block-printed cotton suits, and luxury ornaments.
            </p>
            <p className="text-xs sm:text-sm">
              Our name represents the auspicious spirit of purity, harmony, and creative beauty. Every thread woven in our collection holds the promise of luxurious elegance and vibrant heritage.
            </p>
          </div>
        </div>

        <div className="bg-brand-cream border border-brand-border/60 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center select-none pt-8">
          <div className="flex flex-col items-center">
            <span className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-3"><Sparkles size={24} /></span>
            <h4 className="font-display font-semibold text-brand-dark text-sm mb-1">Handcrafted Heritage</h4>
            <p className="text-2xs text-brand-muted">Working directly with traditional master weavers across Banaras, Kanchipuram, and Rajasthan.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-3"><Heart size={24} /></span>
            <h4 className="font-display font-semibold text-brand-dark text-sm mb-1">Made For You</h4>
            <p className="text-2xs text-brand-muted">Bespoke customized sizing fits and design adjustments managed via active WhatsApp consultations.</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="p-3 bg-brand-gold/10 text-brand-gold rounded-full mb-3"><ShieldCheck size={24} /></span>
            <h4 className="font-display font-semibold text-brand-dark text-sm mb-1">Pan-India Trust</h4>
            <p className="text-2xs text-brand-muted">SSL secured payment channels, Cash on Delivery options, and verified product quality checks.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
