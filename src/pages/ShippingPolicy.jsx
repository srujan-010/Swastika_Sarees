import React from 'react';
import { Link } from 'react-router-dom';

export default function ShippingPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-left select-none">
      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-3xl text-center mb-2">Shipping Information</h1>
      <div className="paisley-divider">⚜️</div>

      <div className="space-y-6 mt-10 font-sans text-xs sm:text-sm text-brand-muted leading-relaxed">
        <p>
          We are pleased to offer standard courier shipping across India, servicing over 26,000 pincodes.
        </p>

        <h3 className="font-display font-bold text-brand-dark text-base sm:text-lg">Delivery Charges</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Free Shipping</strong>: Valid on all shopping bag totals above <strong>₹999</strong>.</li>
          <li><strong>Flat Shipping Rate</strong>: A standard shipping fee of <strong>₹100</strong> is charged on orders under ₹999.</li>
          <li><strong>Cash on Delivery (COD)</strong>: Available with a flat processing convenience surcharge of <strong>₹50</strong>.</li>
        </ul>

        <h3 className="font-display font-bold text-brand-dark text-base sm:text-lg">Delivery Timelines</h3>
        <p>
          Standard deliveries are dispatched within 24-48 business hours of verification from our Secunderabad warehouse. Transit timelines generally range:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Metropolitan Cities</strong> (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad): 3-5 business days.</li>
          <li><strong>Rest of India</strong>: 5-7 business days.</li>
        </ul>

        <h3 className="font-display font-bold text-brand-dark text-base sm:text-lg">Courier Partners & Tracking</h3>
        <p>
          We partner with premium shipping networks including Delhivery, BlueDart, ExpressBees, and DTDC. Once your package is shipped, you will receive an automated tracking link. You can track your package transit milestones using our <Link to="/track-order" className="text-brand-crimson font-bold hover:underline">Track Order</Link> lookup page.
        </p>
      </div>
    </div>
  );
}
