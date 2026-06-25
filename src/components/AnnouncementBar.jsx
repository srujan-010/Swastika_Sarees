import React, { useEffect, useState } from 'react';

export default function AnnouncementBar() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Failed to load settings in announcement bar:', err));
  }, []);

  // Return standard marquee if loading or disabled is not explicit
  const showBar = settings ? settings.isActive !== false : true; 
  const marqueeText = settings?.announcementText || "🚚 Free shipping on orders above ₹999 | Use code SWASTIKA10 for 10% off your first order | Shipping all over India";

  if (!showBar) return null;

  return (
    <div className="w-full bg-brand-crimson text-brand-cream py-2 overflow-hidden text-xs md:text-sm font-medium tracking-wide border-b border-brand-gold/20 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="mx-4">{marqueeText}</span>
        <span className="mx-4" aria-hidden="true">|</span>
        <span className="mx-4" aria-hidden="true">{marqueeText}</span>
        <span className="mx-4" aria-hidden="true">|</span>
        <span className="mx-4" aria-hidden="true">{marqueeText}</span>
      </div>
    </div>
  );
}
