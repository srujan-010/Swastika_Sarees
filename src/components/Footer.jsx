import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Mail, Instagram, MessageSquare, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-cream/80 pt-16 pb-8 border-t-2 border-brand-gold/30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Foot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-brand-muted/20 pb-12 mb-8">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold text-brand-cream tracking-wide">Swastika Sarees</h3>
            <p className="font-sans text-sm italic text-brand-gold-light">"Shine Bright, Get Your Sparkle On!"</p>
            <p className="font-sans text-xs text-brand-cream/65 leading-relaxed">
              Experience the magnificence of handpicked, curated Indian ethnic wear. Discover sarees, kurtis, dress materials, and luxury accessories tailored to bring out your natural elegance.
            </p>
            <div className="flex space-x-3 pt-2">
              <a
                href="https://instagram.com/swastikasarees_"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-muted hover:bg-brand-gold transition-colors duration-300 rounded-full text-brand-cream"
                aria-label="Instagram Profile"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-brand-muted hover:bg-brand-gold transition-colors duration-300 rounded-full text-brand-cream"
                aria-label="WhatsApp Support"
              >
                <MessageSquare size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: Customer Care Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-brand-gold mb-6 border-b border-brand-border/10 pb-2">Customer Care</h4>
            <ul className="space-y-3 text-xs md:text-sm">
              <li><Link to="/track-order" className="hover:text-brand-gold transition-colors">Track Order</Link></li>
              <li><Link to="/shipping" className="hover:text-brand-gold transition-colors">Shipping & Delivery Info</Link></li>
              <li><Link to="/returns" className="hover:text-brand-gold transition-colors">Return & Refund Policy</Link></li>
              <li><Link to="/about" className="hover:text-brand-gold transition-colors">About Swastika Sarees</Link></li>
              <li><Link to="/contact" className="hover:text-brand-gold transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Categories Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-brand-gold mb-6 border-b border-brand-border/10 pb-2">Quick Shop</h4>
            <ul className="space-y-3 text-xs md:text-sm">
              <li><Link to="/shop?category=sarees" className="hover:text-brand-gold transition-colors">Sarees</Link></li>
              <li><Link to="/shop?category=kurtis" className="hover:text-brand-gold transition-colors">Kurtis</Link></li>
              <li><Link to="/shop?category=dress-materials" className="hover:text-brand-gold transition-colors">Dress Materials</Link></li>
              <li><Link to="/shop?category=accessories" className="hover:text-brand-gold transition-colors">Fashion Accessories</Link></li>
              <li><Link to="/shop?sale=true" className="text-brand-gold-light hover:underline font-medium">Clearance Sale</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold text-brand-gold mb-2 border-b border-brand-border/10 pb-2">Contact Us</h4>
            <div className="flex items-start space-x-3 text-xs md:text-sm">
              <PhoneCall size={18} className="text-brand-gold shrink-0 mt-0.5" />
              <div>
                <span className="block font-semibold">WhatsApp Order Desk:</span>
                <a href="https://wa.me/919999999999" className="hover:text-brand-gold transition-colors">+91 99999 99999</a>
              </div>
            </div>
            <div className="flex items-start space-x-3 text-xs md:text-sm">
              <Mail size={18} className="text-brand-gold shrink-0 mt-0.5" />
              <div>
                <span className="block font-semibold">Email Desk:</span>
                <a href="mailto:contact@swastikasarees.com" className="hover:text-brand-gold transition-colors">contact@swastikasarees.com</a>
              </div>
            </div>
            <div className="pt-2">
              <div className="text-2xs uppercase tracking-wider text-brand-cream/40 mb-2">Registered Office</div>
              <p className="text-2xs text-brand-cream/50 leading-relaxed">
                Swastika Sarees, Retail Park, Secunderabad, Telangana - 500003, India.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-2xs md:text-xs text-brand-cream/50">
          <div>
            &copy; {new Date().getFullYear()} Swastika Sarees. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0 font-medium">
            <span>Made with</span>
            <span className="text-brand-crimson animate-pulse">♥</span>
            <span>in India</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
