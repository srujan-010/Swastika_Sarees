import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, Search, AlertCircle, ShieldAlert } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setOrder(null);
    
    if (!orderId || !phone) {
      setErrorMsg('Order ID and phone number are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/track?orderId=${orderId.trim()}&phone=${phone.trim()}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data);
      } else {
        setErrorMsg(data.error || 'Failed to locate order matching these details.');
      }
    } catch (err) {
      setErrorMsg('Error connecting to the tracking server.');
    } finally {
      setLoading(false);
    }
  };

  const getTimelineStep = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const timeline = [
    { title: 'Placed', icon: Clock, desc: 'Boutique received order' },
    { title: 'Confirmed', icon: Package, desc: 'Verified by our desk' },
    { title: 'Processing', icon: Package, desc: 'Fabric quality inspections' },
    { title: 'Shipped', icon: Truck, desc: 'Courier partner transit' },
    { title: 'Delivered', icon: CheckCircle, desc: 'Package dropped successfully' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-left select-none">
      
      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-3xl text-center mb-2">Track Guest Order</h1>
      <p className="text-2xs sm:text-xs text-brand-muted text-center font-sans uppercase tracking-wider mb-8">
        Review delivery milestones without logging in
      </p>

      <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md max-w-lg mx-auto mb-10">
        
        <form onSubmit={handleTrackSubmit} className="space-y-4 font-sans text-xs">
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Order ID *</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="e.g. SS-10001"
              className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold font-bold text-center"
              required
            />
          </div>
          
          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Contact Phone Number *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="10-digit mobile listed at checkout"
              className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold font-semibold"
              required
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-brand-crimson/25 p-3 rounded-lg flex items-center space-x-2 text-2xs font-semibold text-brand-crimson">
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 border border-brand-gold/30 shadow-md flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
          >
            <Search size={15} />
            <span>{loading ? 'Searching Database...' : 'Track Delivery'}</span>
          </button>
        </form>

      </div>

      {/* Tracking Results Block */}
      {order && (
        <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-xs space-y-6 max-w-xl mx-auto animate-shimmer-once">
          <div className="flex justify-between border-b pb-3 border-brand-border/40 font-sans text-xs">
            <div>Status: <span className="font-bold text-brand-crimson uppercase">{order.status}</span></div>
            <div>Receiver: <strong className="text-brand-dark">{order.shippingAddress.name}</strong></div>
          </div>

          {order.status !== 'cancelled' ? (
            <div className="space-y-6 font-sans text-2xs">
              {timeline.map((stepData, index) => {
                const StepIcon = stepData.icon;
                const isPast = index <= getTimelineStep(order.status);
                
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold shrink-0 ${
                        isPast 
                          ? 'bg-brand-crimson text-brand-cream border-brand-crimson'
                          : 'bg-brand-white border-brand-border text-brand-muted'
                      }`}
                    >
                      {isPast && index < getTimelineStep(order.status) ? <span>✓</span> : <StepIcon size={12} />}
                    </div>
                    <div>
                      <span className={`block font-bold ${isPast ? 'text-brand-dark' : 'text-brand-muted'}`}>{stepData.title}</span>
                      <span className="text-3xs text-brand-muted mt-0.5 leading-none">{stepData.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-red-50 border border-brand-crimson/25 p-4 rounded-xl font-sans text-xs">
              <span className="block font-bold text-brand-crimson">Order Cancelled</span>
              <p className="text-brand-muted italic mt-0.5">Reason: {order.cancelReason || 'Cancelled by boutique'}</p>
            </div>
          )}

          {/* Shipped Tracking details */}
          {order.status === 'shipped' && order.tracking?.trackingNumber && (
            <div className="bg-brand-gold/10 border border-brand-gold/25 p-4 rounded-xl font-sans text-xs flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="font-bold block text-brand-dark">Courier: {order.tracking.courierName}</span>
                <span className="text-brand-muted mt-0.5 block">AWB: {order.tracking.trackingNumber}</span>
              </div>
              <a
                href={order.tracking.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-dark hover:bg-brand-muted text-brand-cream px-3 py-1.5 rounded font-semibold text-2xs"
              >
                Track Live ↗
              </a>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
