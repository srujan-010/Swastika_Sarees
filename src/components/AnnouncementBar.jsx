import React, { useEffect, useState } from 'react';

export default function AnnouncementBar() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (active) {
          setSettings(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load settings in announcement bar:', err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-brand-crimson/95 h-[36px] skeleton-shimmer border-b border-brand-gold/20 flex items-center justify-center">
        <div className="h-2 w-1/3 bg-brand-cream/35 rounded animate-pulse"></div>
      </div>
    );
  }

  const showBar = settings ? settings.announcementActive !== false : true; 
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
