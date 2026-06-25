import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Calendar, ShoppingBag, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Fetch details of this successful order (using phone as bypass check if guest, but here we query details using user token if available)
    const fetchOrderDetails = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (user?.phone) {
          queryParams.set('phone', user.phone);
        }
        
        // Allow fallback / mock fetching
        const response = await fetch(`/api/orders/detail/${orderId}`);
        const data = await response.json();
        if (response.ok) {
          setOrder(data);
        }
      } catch (err) {
        console.error('Failed to retrieve success order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(d => setSettings(d))
      .catch(err => console.error(err));
  }, []);

  const estDeliveryDate = new Date();
  const gap = settings?.deliveryDays !== undefined ? Number(settings.deliveryDays) : 7;
  estDeliveryDate.setDate(estDeliveryDate.getDate() + gap);

  const getWhatsAppShareUrl = () => {
    const text = `I just ordered a beautiful outfit from Swastika Sarees! 🛍️ Check out their stunning Indian ethnic wear collections here: ${window.location.origin}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center select-none flex flex-col items-center">
      
      {/* Animated Check Ring */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mb-6 shadow-sm ring-8 ring-emerald-50">
        <Check size={32} strokeWidth={3} />
      </div>

      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-4xl mb-2">Order Confirmed!</h1>
      <p className="text-brand-muted text-sm max-w-md leading-relaxed font-sans mb-8">
        Thank you for shopping with us. Your transaction was completed securely and order is being prepared for dispatch.
      </p>

      {/* Order Info Card */}
      <div className="w-full bg-brand-white border border-brand-border p-6 rounded-2xl shadow-xs text-left mb-8 space-y-4 font-sans text-xs sm:text-sm">
        <div className="flex justify-between border-b pb-3 border-brand-border/40 font-semibold text-brand-dark">
          <span>Order ID:</span>
          <span className="text-brand-crimson">{orderId}</span>
        </div>
        
        <div className="flex items-start space-x-3 text-brand-muted">
          <Calendar size={18} className="text-brand-gold shrink-0 mt-0.5" />
          <div>
            <span className="block font-semibold text-brand-dark">Estimated Delivery</span>
            <span className="text-xs">{estDeliveryDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {order && (
          <div className="border-t border-brand-border/40 pt-4 space-y-2">
            <span className="block font-semibold text-brand-dark uppercase tracking-wider text-2xs text-brand-gold">Delivery Details:</span>
            <span className="block font-bold text-brand-dark">{order.shippingAddress.name}</span>
            <p className="text-brand-muted text-xs leading-normal">
              {order.shippingAddress.line1}, {order.shippingAddress.line2 ? `${order.shippingAddress.line2}, ` : ''}{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <span className="block text-brand-dark font-bold mt-2">Paid Total: ₹{(order.pricing?.total / 100).toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* Share & Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        
        <a
          href={getWhatsAppShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors shadow-md text-sm"
        >
          <MessageSquare size={16} />
          <span>Share on WhatsApp</span>
        </a>

        <Link
          to="/shop"
          className="flex-1 bg-brand-crimson hover:bg-brand-muted text-brand-cream py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold transition-colors border border-brand-gold/30 shadow-md text-sm"
        >
          <ShoppingBag size={16} />
          <span>Continue Shopping</span>
        </Link>

      </div>

      <div className="flex space-x-4 mt-6 text-xs font-semibold text-brand-muted">
        <Link to="/orders" className="hover:text-brand-crimson hover:underline">View My Orders</Link>
        <span>|</span>
        <Link to={`/track-order?orderId=${orderId}`} className="hover:text-brand-crimson hover:underline">Track Delivery Status</Link>
      </div>

    </div>
  );
}
