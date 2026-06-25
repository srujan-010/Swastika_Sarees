import React, { useState } from 'react';
import { MessageSquare, PhoneCall, Mail, MapPin, Send, Check } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-left select-none">
      <h1 className="font-display font-bold text-brand-dark text-3xl sm:text-4xl text-center mb-2">Contact Us</h1>
      <div className="paisley-divider">⚜️</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        
        {/* Contact Info */}
        <div className="space-y-6">
          <h3 className="font-display font-bold text-brand-dark text-lg sm:text-xl">Boutique Consultation desk</h3>
          <p className="font-sans text-xs sm:text-sm text-brand-muted leading-relaxed">
            Need customized fits, matching borders, or live video displays of fabric textures? Reach out directly via our active WhatsApp support number.
          </p>

          <div className="space-y-4 font-sans text-xs sm:text-sm text-brand-muted">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-brand-cream border border-brand-border/60 hover:border-brand-gold rounded-2xl flex items-center space-x-4 shadow-2xs transition-colors cursor-pointer text-left block"
            >
              <span className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-full"><MessageSquare size={20} /></span>
              <div>
                <span className="block font-bold text-brand-dark">Order & Customization Desk</span>
                <span className="text-xs">+91 99999 99999 (WhatsApp consult)</span>
              </div>
            </a>

            <div className="p-4 bg-brand-cream border border-brand-border/60 rounded-2xl flex items-center space-x-4 shadow-2xs">
              <span className="p-3 bg-brand-gold/10 text-brand-gold rounded-full"><Mail size={20} /></span>
              <div>
                <span className="block font-bold text-brand-dark">Email Support</span>
                <span className="text-xs">contact@swastikasarees.com</span>
              </div>
            </div>

            <div className="p-4 bg-brand-cream border border-brand-border/60 rounded-2xl flex items-start space-x-4 shadow-2xs">
              <span className="p-3 bg-brand-crimson/10 text-brand-crimson rounded-full mt-0.5"><MapPin size={20} /></span>
              <div>
                <span className="block font-bold text-brand-dark">Boutique Store Office</span>
                <span className="text-xs leading-normal block mt-0.5">Swastika Sarees Retail, Sector 4, Secunderabad, Telangana - 500003, India.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message form */}
        <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md">
          <h3 className="font-display font-bold text-brand-dark text-lg mb-4">Send a Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Your Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2 rounded-md focus:outline-none"
                required
              />
            </div>
            
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2 rounded-md focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
                className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2 rounded-md focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Message Comment *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="bg-brand-cream border border-brand-border text-brand-dark p-3 rounded-md focus:outline-none"
                required
              />
            </div>

            {submitted && (
              <span className="text-emerald-600 text-xs font-semibold flex items-center">
                <Check size={14} className="mr-1" /> Thank you! Message received. We will respond shortly.
              </span>
            )}

            <button
              type="submit"
              className="w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-3 rounded-lg font-semibold border border-brand-gold/30 shadow-md flex items-center justify-center space-x-1"
            >
              <Send size={14} />
              <span>Send Message</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
