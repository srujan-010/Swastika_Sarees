import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, CreditCard, Clock, Truck, Printer, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function OrderDetail() {
  const { orderId } = useParams();
  const { token, user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const queryParams = new URLSearchParams();
        if (user?.phone) {
          queryParams.set('phone', user.phone);
        }
        
        // Pass token in headers if user is logged in
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/orders/detail/${orderId}?${queryParams.toString()}`, { headers });
        const data = await response.json();
        
        if (response.ok) {
          setOrder(data);
        } else {
          setErrorMsg(data.error || 'Failed to retrieve order details.');
        }
      } catch (err) {
        setErrorMsg('Failed to connect to orders desk.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token, user]);

  const getTimelineStep = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-full h-80 skeleton-shimmer rounded-xl" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center select-none flex flex-col items-center font-sans">
        <ShieldAlert className="text-brand-crimson mb-4" size={40} />
        <h3 className="font-display font-semibold text-brand-dark text-lg mb-2">Access Denied</h3>
        <p className="text-xs text-brand-muted mb-6">{errorMsg}</p>
        <Link to="/orders" className="bg-brand-crimson text-brand-cream text-2xs px-5 py-2.5 rounded-lg border font-semibold">View History</Link>
      </div>
    );
  }

  if (!order) return null;

  const currentStep = getTimelineStep(order.status);
  const timeline = [
    { title: 'Placed', icon: Clock, desc: 'Waiting confirmation' },
    { title: 'Confirmed', icon: Package, desc: 'Verified by boutique' },
    { title: 'Processing', icon: Package, desc: 'Quality inspections' },
    { title: 'Shipped', icon: Truck, desc: 'In courier transit' },
    { title: 'Delivered', icon: Check, desc: 'Received successfully' }
  ];

  // Helper inside loop: Timeline item icon resolver
  function Check(props) {
    return <span className="text-3xs">✓</span>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-left select-none">
      
      {/* Breadcrumb Header */}
      <nav className="text-2xs sm:text-xs text-brand-muted font-sans mb-8 flex space-x-1.5 items-center">
        <Link to="/" className="hover:text-brand-crimson">Home</Link>
        <span>&gt;</span>
        <Link to="/orders" className="hover:text-brand-crimson">Orders</Link>
        <span>&gt;</span>
        <span className="text-brand-dark font-medium">{order.orderId}</span>
      </nav>

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-brand-border/60 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-brand-dark text-xl sm:text-2xl">Order ID: <span className="text-brand-crimson">{order.orderId}</span></h1>
          <span className="text-xs text-brand-muted font-sans mt-0.5 block">Placed on {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
        </div>
        
        {/* Print Invoice Button */}
        <a
          href={`/api/orders/${order.orderId}/invoice`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 bg-brand-white border border-brand-border hover:bg-brand-cream text-brand-dark text-2xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-2xs"
        >
          <Printer size={13} />
          <span>Print / Save Invoice</span>
        </a>
      </div>

      {/* Tracking Timeline Log Grid */}
      {order.status !== 'cancelled' ? (
        <div className="bg-brand-white border border-brand-border/40 p-6 rounded-2xl shadow-xs mb-8 select-none">
          <h3 className="font-display font-bold text-brand-dark text-sm mb-6 uppercase tracking-wider text-brand-gold">Delivery Timeline</h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-2 relative font-sans text-2xs">
            {timeline.map((stepData, index) => {
              const StepIcon = stepData.icon;
              const isPast = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={index} className="flex-1 flex sm:flex-col items-center sm:text-center w-full gap-3 sm:gap-2 relative">
                  
                  {/* Step Ring */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold shrink-0 transition-colors ${
                      isPast 
                        ? 'bg-brand-crimson text-brand-cream border-brand-crimson ring-4 ring-brand-crimson/15'
                        : 'bg-brand-white border-brand-border text-brand-muted'
                    }`}
                  >
                    {isPast && index < currentStep ? <span className="font-sans">✓</span> : <StepIcon size={12} />}
                  </div>

                  <div className="text-left sm:text-center">
                    <span className={`block font-bold ${isPast ? 'text-brand-dark font-semibold' : 'text-brand-muted'}`}>{stepData.title}</span>
                    <span className="text-[10px] text-brand-muted block mt-0.5 leading-tight">{stepData.desc}</span>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-brand-crimson/25 p-5 rounded-2xl mb-8 font-sans text-xs">
          <span className="block font-bold text-brand-crimson text-sm mb-1">Order Cancelled</span>
          <p className="text-brand-muted italic mt-0.5">Reason: {order.cancelReason || 'Cancelled by customer'}</p>
        </div>
      )}

      {/* Courier/Shipping details */}
      {order.status === 'shipped' && order.tracking?.trackingNumber && (
        <div className="bg-brand-gold/10 border border-brand-gold/30 p-4 rounded-xl mb-8 font-sans text-xs flex justify-between items-center flex-wrap gap-2">
          <div>
            <span className="font-bold text-brand-dark block">Courier Partner: {order.tracking.courierName}</span>
            <span className="text-brand-muted mt-0.5 block">AWB Tracking No: <strong className="text-brand-crimson">{order.tracking.trackingNumber}</strong></span>
          </div>
          <a
            href={order.tracking.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-4 py-2 rounded-md font-semibold transition-colors"
          >
            Track Courier Live ↗
          </a>
        </div>
      )}

      {/* Shipping Address & Payments Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Address Card */}
        <div className="bg-brand-white border border-brand-border/40 p-5 rounded-2xl shadow-2xs font-sans text-xs">
          <h4 className="font-display font-bold text-brand-gold text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1">
            <MapPin size={14} className="mt-[-2px]" />
            <span>Shipping Address</span>
          </h4>
          <span className="block font-bold text-brand-dark text-sm mb-1">{order.shippingAddress.name}</span>
          <p className="text-brand-muted leading-relaxed font-sans">
            {order.shippingAddress.line1}, {order.shippingAddress.line2 ? `${order.shippingAddress.line2}, ` : ''}{order.shippingAddress.city}, {order.shippingAddress.state} - <strong>{order.shippingAddress.pincode}</strong>
          </p>
          <span className="block text-brand-dark font-semibold mt-2">Phone: {order.shippingAddress.phone}</span>
        </div>

        {/* Payment Card */}
        <div className="bg-brand-white border border-brand-border/40 p-5 rounded-2xl shadow-2xs font-sans text-xs">
          <h4 className="font-display font-bold text-brand-gold text-xs uppercase tracking-wider mb-3.5 flex items-center space-x-1">
            <CreditCard size={14} className="mt-[-2px]" />
            <span>Payment Summary</span>
          </h4>
          <div className="space-y-1.5">
            <div>Method: <strong className="text-brand-dark uppercase">{order.payment.method}</strong></div>
            <div>Transaction ID: <span className="text-brand-muted select-text">{order.payment.transactionId || 'Pending'}</span></div>
            <div>
              Status: <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider ${
                order.payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-amber-50 text-amber-700 border border-amber-300'
              }`}>{order.payment.status}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cart Items breakdown list */}
      <div className="bg-brand-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-2xs mb-8 select-none">
        <h3 className="font-display font-bold text-brand-dark text-sm p-4 bg-brand-cream/40 border-b">Ordered Items</h3>
        <div className="divide-y divide-brand-border/30">
          {order.items?.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4">
              <img src={item.imageUrl} alt={item.name} className="w-12 h-16 object-cover object-top border rounded shrink-0" />
              <div className="flex-grow text-left">
                <span className="font-display font-semibold text-brand-dark text-xs sm:text-sm line-clamp-1">{item.name}</span>
                <span className="block text-[10px] text-brand-muted font-sans mt-0.5">
                  Qty: {item.quantity} {item.color ? `| Color: ${item.color}` : ''} {item.size ? `| Size: ${item.size}` : ''}
                </span>
              </div>
              <span className="font-sans font-bold text-brand-dark text-xs sm:text-sm">₹{(item.price * item.quantity / 100).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total block card */}
      <div className="w-full sm:w-80 ml-auto bg-brand-white border border-brand-border p-5 rounded-2xl shadow-2xs font-sans text-xs text-brand-muted select-none space-y-2.5">
        <div className="flex justify-between">
          <span>Items Subtotal:</span>
          <span className="text-brand-dark font-semibold">₹{(order.pricing?.subtotal / 100).toFixed(2)}</span>
        </div>
        {order.pricing?.couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Coupon Discount ({order.couponApplied}):</span>
            <span>-₹{(order.pricing.couponDiscount / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping Charges:</span>
          <span className="text-brand-dark font-semibold">
            {order.pricing?.shippingCharge > 0 ? `₹${(order.pricing.shippingCharge / 100).toFixed(2)}` : 'FREE'}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold text-brand-dark border-t border-brand-border/40 pt-2.5 mt-2">
          <span>Grand Total:</span>
          <span className="text-brand-crimson">₹{(order.pricing?.total / 100).toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
}

function ShieldAlert(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1={12} y1={8} x2={12} y2={12} />
      <line x1={12} y1={16} x2={12.01} y2={16} />
    </svg>
  );
}
