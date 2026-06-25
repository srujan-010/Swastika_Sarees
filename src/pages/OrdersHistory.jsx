import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Calendar, CreditCard, RotateCcw, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function OrdersHistory() {
  const navigate = useNavigate();
  const { token, fetchProfile } = useAuthStore();
  const { addItem } = useCartStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  
  const [returningOrderId, setReturningOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnType, setReturnType] = useState('refund'); // 'refund' | 'exchange'
  
  const [actionMsg, setActionMsg] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();
  }, [token]);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      const response = await fetch(`/api/orders/${cancellingOrderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });
      
      const data = await response.json();
      if (response.ok) {
        setOrders(prev => prev.map(o => o._id === cancellingOrderId ? { ...o, status: 'cancelled', cancelReason } : o));
        setCancellingOrderId(null);
        setCancelReason('');
        setActionMsg('Order cancelled successfully.');
      } else {
        setActionMsg(data.error || 'Failed to cancel order.');
      }
    } catch (error) {
      setActionMsg('Failed to connect to backend.');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setActionMsg('');
    try {
      const response = await fetch(`/api/orders/${returningOrderId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          returnItems: [], // empty lists mean returning full order
          reason: returnReason,
          type: returnType
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReturningOrderId(null);
        setReturnReason('');
        setActionMsg('Return request submitted! Our customer team will contact you via WhatsApp.');
        fetchOrders();
      } else {
        setActionMsg(data.error || 'Failed to submit return request.');
      }
    } catch (error) {
      setActionMsg('Failed to connect to return desk.');
    }
  };

  // Re-purchase order items
  const handleReorder = (order) => {
    order.items?.forEach(item => {
      addItem({
        product: item.product,
        name: item.name,
        price: item.price / 100, // convert paise to INR
        quantity: item.quantity,
        color: item.color || null,
        size: item.size || null,
        imageUrl: item.imageUrl || '',
        stock: 99 // override validation check block
      });
    });
    navigate('/cart');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'processing': return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center">
        <div className="w-full h-80 skeleton-shimmer rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-left select-none">
      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-3xl mb-8">My Orders</h1>

      {actionMsg && (
        <div className="bg-brand-cream border border-brand-border p-4 rounded-xl mb-6 text-xs font-semibold text-brand-dark font-sans">
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Orders History list */}
      <div className="space-y-6">
        {orders.map((order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
          const orderTotal = order.pricing?.total / 100;
          const isCancellable = ['pending', 'confirmed'].includes(order.status);
          
          // Check return eligibility within 7 days
          const isDelivered = order.status === 'delivered';
          const deliveryDate = new Date(order.updatedAt);
          const diffDays = Math.ceil(Math.abs(new Date() - deliveryDate) / (1000 * 60 * 60 * 24));
          const isReturnable = isDelivered && diffDays <= 7;

          return (
            <div
              key={order._id}
              className="bg-brand-white border border-brand-border/40 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              {/* Order Card Top Bar */}
              <div className="bg-brand-cream/60 border-b border-brand-border/40 p-4 flex flex-col sm:flex-row justify-between sm:items-center text-xs font-sans text-brand-muted gap-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <div>Date: <strong className="text-brand-dark">{formattedDate}</strong></div>
                  <div>ID: <strong className="text-brand-crimson font-bold">{order.orderId}</strong></div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded border text-3xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <Link to={`/orders/${order.orderId}`} className="text-brand-crimson hover:underline font-semibold flex items-center">
                    <span>Details</span>
                    <ChevronRight size={14} className="mt-0.5" />
                  </Link>
                </div>
              </div>

              {/* Order Card Preview Items */}
              <div className="p-4 divide-y divide-brand-border/30">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-14 object-cover object-top border rounded shrink-0" />
                    <div className="flex-grow text-left">
                      <span className="font-display font-semibold text-brand-dark text-xs sm:text-sm line-clamp-1">{item.name}</span>
                      <span className="block text-[10px] text-brand-muted font-sans mt-0.5">
                        Qty: {item.quantity} {item.color ? `| Color: ${item.color}` : ''} {item.size ? `| Size: ${item.size}` : ''}
                      </span>
                    </div>
                    <span className="font-sans font-bold text-brand-dark text-xs">₹{(item.price * item.quantity / 100).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Order Card bottom control buttons */}
              <div className="bg-brand-cream/20 border-t border-brand-border/40 p-4 flex flex-col sm:flex-row justify-between sm:items-center text-xs font-semibold gap-3">
                <span className="text-brand-dark font-sans text-xs">
                  Grand Total: <strong className="text-brand-crimson">₹{orderTotal.toLocaleString('en-IN')}</strong>
                </span>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleReorder(order)}
                    className="bg-brand-white border border-brand-border text-brand-dark px-4 py-2 rounded-lg hover:bg-brand-cream transition-colors shadow-2xs"
                  >
                    Reorder Items
                  </button>

                  {isCancellable && (
                    <button
                      onClick={() => setCancellingOrderId(order._id)}
                      className="bg-brand-white border border-brand-crimson/30 text-brand-crimson px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}

                  {isReturnable && (
                    <button
                      onClick={() => setReturningOrderId(order._id)}
                      className="bg-brand-white border border-brand-gold/30 text-brand-gold px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Return / Exchange
                    </button>
                  )}
                </div>
              </div>

              {/* Cancel Form Overlay */}
              {cancellingOrderId === order._id && (
                <form onSubmit={handleCancelSubmit} className="bg-red-50/50 border-t border-brand-crimson/20 p-4 font-sans text-xs flex flex-col gap-3 select-none">
                  <span className="font-semibold text-brand-crimson flex items-center"><XCircle size={14} className="mr-1" /> Cancellation Request Form</span>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for cancelling order (e.g. ordered wrong size, changed mind)"
                    className="bg-brand-white border border-brand-border rounded p-2 focus:outline-none"
                    required
                  />
                  <div className="flex space-x-2">
                    <button type="submit" className="bg-brand-crimson text-brand-white px-4 py-1.5 rounded hover:bg-brand-muted font-semibold">Confirm Cancel</button>
                    <button type="button" onClick={() => setCancellingOrderId(null)} className="bg-brand-white border text-brand-dark px-4 py-1.5 rounded hover:bg-brand-cream">Close</button>
                  </div>
                </form>
              )}

              {/* Return Form Overlay */}
              {returningOrderId === order._id && (
                <form onSubmit={handleReturnSubmit} className="bg-amber-50/50 border-t border-brand-gold/20 p-4 font-sans text-xs flex flex-col gap-3 select-none">
                  <span className="font-semibold text-brand-gold flex items-center"><RotateCcw size={14} className="mr-1" /> Returns & Exchanges Desk</span>
                  
                  <div className="flex space-x-4 items-center">
                    <span className="font-bold text-brand-dark">Request Option:</span>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="radio" name="ret_type" checked={returnType === 'refund'} onChange={() => setReturnType('refund')} className="text-brand-crimson h-3.5 w-3.5" />
                      <span>Full Refund</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input type="radio" name="ret_type" checked={returnType === 'exchange'} onChange={() => setReturnType('exchange')} className="text-brand-crimson h-3.5 w-3.5" />
                      <span>Product Exchange</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Describe issue (e.g. color mismatch, quality issue, damage details)"
                    className="bg-brand-white border border-brand-border rounded p-2 focus:outline-none"
                    required
                  />
                  <div className="flex space-x-2">
                    <button type="submit" className="bg-brand-gold text-brand-cream px-4 py-1.5 rounded hover:bg-brand-gold-light font-semibold">Submit Return</button>
                    <button type="button" onClick={() => setReturningOrderId(null)} className="bg-brand-white border text-brand-dark px-4 py-1.5 rounded hover:bg-brand-cream">Close</button>
                  </div>
                </form>
              )}

            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-brand-white border border-brand-border p-12 rounded-2xl shadow-xs text-center flex flex-col items-center">
            <Package className="text-brand-gold mb-3" size={36} />
            <span className="font-display font-semibold text-brand-dark text-sm sm:text-base mb-1">No Orders Found</span>
            <p className="text-xs text-brand-muted max-w-xs mb-6">Looks like you haven't placed any orders with this profile yet.</p>
            <Link to="/shop" className="bg-brand-crimson text-brand-cream px-6 py-2.5 rounded-lg border border-brand-gold/30 shadow-md hover:bg-brand-muted transition-colors font-semibold text-xs">
              Go To Shop Catalog
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
