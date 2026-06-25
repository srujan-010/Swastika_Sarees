import React from 'react';
import { Link } from 'react-router-dom';

export default function ReturnsPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-left select-none">
      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-3xl text-center mb-2">Returns & Refund Policy</h1>
      <div className="paisley-divider">⚜️</div>

      <div className="space-y-6 mt-10 font-sans text-xs sm:text-sm text-brand-muted leading-relaxed">
        <p>
          At Swastika Sarees, we want you to absolutely love your purchase. If you are not completely satisfied with the product weight, texture, or color match, we offer a hassle-free return and exchange service.
        </p>

        <h3 className="font-display font-bold text-brand-dark text-base sm:text-lg">Return Conditions</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Returns or exchanges must be initiated within <strong>7 days</strong> of delivery.</li>
          <li>Apparel must be unused, unwashed, unaltered (unstitch, no custom length cut), and in its original fold.</li>
          <li>All original price tags, labels, and invoice slips must accompany the return parcel.</li>
        </ul>

        <h3 className="font-display font-bold text-brand-dark text-base sm:text-lg">Exchange Process</h3>
        <p>
          Need a different size or color variant? Open your account, navigate to the <strong>Orders History</strong> log, and request an exchange. Once our quality inspection team confirms the return parcel courier pickup, we will dispatch the replacement item.
        </p>

        <h3 className="font-display font-bold text-brand-dark text-base sm:text-lg">Refund Details</h3>
        <p>
          For prepaid transactions, refunds will be credited back to your original payment channel (UPI, card, net banking) within 5-7 business days of quality approval at our warehouse. Cash on Delivery (COD) refunds will be issued to your bank account via UPI transfer.
        </p>

        <div className="bg-brand-cream border border-brand-border/60 p-4 rounded-xl mt-8">
          Have queries about return booking? Consult our customer support team directly on <a href="https://wa.me/919999999999" className="text-brand-crimson font-bold hover:underline">WhatsApp</a> or send a query from the <Link to="/contact" className="text-brand-crimson font-bold hover:underline">Contact Desk</Link>.
        </div>
      </div>
    </div>
  );
}
