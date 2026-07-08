import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, ChevronDown, CheckCircle2, Package, Truck, Home, XCircle, 
  Clock, IndianRupee, MapPin, CreditCard, MessageSquare, Phone, Mail, 
  Printer, Download, Box, AlertTriangle, ArrowRight, Save, User, RefreshCw,
  Copy, ExternalLink, ShieldAlert, FileText, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersDashboard({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Right panel forms
  const [trackingNotes, setTrackingNotes] = useState('');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [packageWeight, setPackageWeight] = useState('');
  const [packageDimensions, setPackageDimensions] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); 
  
  // Modals
  const [actionModal, setActionModal] = useState(null);
  const [timelineAction, setTimelineAction] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders/all?limit=500', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const selectedOrder = orders.find(o => o._id === selectedOrderId);

  // Auto-sync right panel state when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      setTrackingNotes(selectedOrder.internalNotes || '');
      setCourier(selectedOrder.tracking?.courierName || '');
      setTrackingNumber(selectedOrder.tracking?.trackingNumber || '');
      setPackageWeight(selectedOrder.logistics?.weight || '');
      setPackageDimensions(selectedOrder.logistics?.dimensions || '');
      setShippingCost(selectedOrder.logistics?.cost || '');
    }
  }, [selectedOrderId]);

  // Debounced Auto-Save
  const saveTimeoutRef = useRef(null);
  const handleAutoSave = (field, value) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = {};
        if (field === 'notes') payload.internalNotes = value;
        if (field === 'tracking') {
          payload.courierName = courier;
          payload.trackingNumber = value;
        }
        if (field === 'courier') {
          payload.courierName = value;
          payload.trackingNumber = trackingNumber;
        }
        // If updating logistics, we'll send it as an object (requires backend update, but we'll mock it locally for now)
        if (['weight', 'dimensions', 'cost'].includes(field)) {
           // We might need a custom endpoint, but we can pass it and let backend ignore it if not in schema yet
           payload.logistics = {
             weight: field === 'weight' ? value : packageWeight,
             dimensions: field === 'dimensions' ? value : packageDimensions,
             cost: field === 'cost' ? value : shippingCost
           };
        }

        const res = await fetch(`/api/orders/${selectedOrderId}/status`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(''), 2000);
          setOrders(prev => prev.map(o => {
            if (o._id === selectedOrderId) {
              if (field === 'notes') return { ...o, internalNotes: value };
              if (field === 'tracking' || field === 'courier') {
                return { ...o, tracking: { ...o.tracking, courierName: field === 'courier' ? value : courier, trackingNumber: field === 'tracking' ? value : trackingNumber } };
              }
              if (['weight', 'dimensions', 'cost'].includes(field)) {
                return { ...o, logistics: { ...o.logistics, weight: field === 'weight' ? value : packageWeight, dimensions: field === 'dimensions' ? value : packageDimensions, cost: field === 'cost' ? value : shippingCost } };
              }
            }
            return o;
          }));
        } else {
          setSaveStatus('error');
        }
      } catch (err) {
        setSaveStatus('error');
      }
    }, 800);
  };

  const handleStatusUpdate = async (status, notify = false, isRefund = false) => {
    try {
      const payload = {
        courierName: courier,
        trackingNumber,
        internalNotes: trackingNotes
      };
      
      if (status) payload.status = status;
      if (isRefund) {
        payload.paymentStatus = 'refunded';
        payload.refundCompleted = true;
      }

      const res = await fetch(`/api/orders/${selectedOrderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o._id === selectedOrderId ? updated.order || updated : o));
        setActionModal(null);
        setTimelineAction(null);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update order status. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('A network error occurred while updating the order.');
    }
  };

  const handleBulkAction = (action) => {
    alert(`Bulk Action [${action}] triggered for ${selectedRows.length} orders.`);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const handlePrintLabel = (order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - ${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .label-box { border: 2px solid #000; width: 400px; padding: 20px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; font-weight: bold; font-size: 24px; }
            .section { margin-bottom: 15px; }
            .bold { font-weight: bold; }
            .barcode { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #ccc; font-family: 'Courier New', Courier, monospace; letter-spacing: 5px; font-size: 20px; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="header">SWASTIKA SAREES</div>
            <div class="section">
              <span class="bold">SHIP TO:</span><br/>
              ${order.shippingAddress?.name}<br/>
              ${order.shippingAddress?.line1}<br/>
              ${order.shippingAddress?.line2 ? order.shippingAddress.line2 + '<br/>' : ''}
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}<br/>
              Ph: ${order.shippingAddress?.phone}
            </div>
            <div class="section">
              <span class="bold">ORDER ID:</span> ${order.orderId}<br/>
              <span class="bold">COURIER:</span> ${order.tracking?.courierName || 'Standard'}<br/>
              <span class="bold">PAYMENT:</span> ${order.payment?.method === 'cod' ? 'CASH ON DELIVERY (COD)' : 'PREPAID'}
            </div>
            <div class="barcode">
              ||||| |||| || ||| |||||| |<br/>
              ${order.tracking?.trackingNumber || order.orderId}
            </div>
          </div>
          <script>window.print(); setTimeout(() => window.close(), 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // KPI Calculations
  const today = new Date();
  today.setHours(0,0,0,0);
  const todaysOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.pricing?.total || 0) / 100, 0);
  
  // Formatters
  const fmt = p => `₹${(p / 100).toLocaleString('en-IN')}`;
  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Filtered List
  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.orderId.toLowerCase().includes(s) || 
           (o.shippingAddress?.name || '').toLowerCase().includes(s) || 
           (o.shippingAddress?.phone || '').includes(s) ||
           (o.tracking?.trackingNumber && o.tracking.trackingNumber.toLowerCase().includes(s));
  });

  const timelineSteps = [
    { id: 'pending', label: 'Order Placed', actionLabel: 'Confirm Order', actionStatus: 'confirmed' },
    { id: 'confirmed', label: 'Confirmed', actionLabel: 'Pack Order', actionStatus: 'processing' },
    { id: 'processing', label: 'Packed', actionLabel: 'Mark Ready to Ship', actionStatus: 'ready' },
    { id: 'ready', label: 'Ready To Ship', actionLabel: 'Mark Shipped', actionStatus: 'shipped' },
    { id: 'shipped', label: 'Shipped', actionLabel: 'Out for Delivery', actionStatus: 'out_for_delivery' },
    { id: 'out_for_delivery', label: 'Out For Delivery', actionLabel: 'Mark Delivered', actionStatus: 'delivered' },
    { id: 'delivered', label: 'Delivered', actionLabel: 'Complete', actionStatus: null }
  ];

  const getTimelineLevel = (status) => {
    const map = { 'pending': 0, 'confirmed': 1, 'processing': 2, 'ready': 3, 'shipped': 4, 'out_for_delivery': 5, 'delivered': 6 };
    return map[status] !== undefined ? map[status] : (status === 'cancelled' ? -1 : 0);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-gray-50 overflow-hidden font-sans text-sm">
      
      {/* ── LEFT PANEL (ORDER QUEUE) ── */}
      <div className="w-[35%] min-w-[320px] max-w-[420px] bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10 shrink-0">
        
        {/* Left Panel Header */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-lg text-gray-800 mb-3 flex justify-between items-center">
            Order Queue
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-semibold">{filteredOrders.length}</span>
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Name, Phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white transition-all"
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
            {['All', 'Pending', 'Packed', 'Shipped', 'COD', 'Prepaid'].map(f => (
              <button key={f} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:border-gray-300 transition-colors">
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Left Panel List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mb-2" />
              <p className="text-xs">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Package className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No orders found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map(order => {
                const isSelected = selectedOrderId === order._id;
                const isHighValue = (order.pricing?.total || 0) >= 1000000; // >= 10,000 INR
                const isCOD = order.payment?.method === 'cod';
                
                return (
                  <div 
                    key={order._id}
                    onClick={() => setSelectedOrderId(order._id)}
                    className={`p-4 cursor-pointer hover:bg-brand-cream/30 transition-colors relative ${isSelected ? 'bg-brand-cream/40 border-l-4 border-l-brand-gold' : 'border-l-4 border-l-transparent'}`}
                  >
                    {/* Unread indicator mockup */}
                    {order.status === 'pending' && <div className="absolute top-4 left-2 w-2 h-2 rounded-full bg-blue-500" />}
                    
                    <div className="flex gap-3">
                      <div className="pt-0.5 z-20" onClick={e => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedRows.includes(order._id)}
                          onChange={() => setSelectedRows(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}
                          className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-gold cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{order.orderId}</span>
                            {isHighValue && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">VIP</span>}
                          </div>
                          <span className="font-semibold text-gray-900">{fmt(order.pricing?.total || 0)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium truncate max-w-[150px]">{order.shippingAddress?.name}</span>
                          <span className="text-gray-500 text-[11px]">{formatDate(order.createdAt).split(',')[0]}</span>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                          <div className="flex gap-1.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${isCOD ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                              {isCOD ? 'COD' : 'PREPAID'}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium">{order.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL (ORDER DETAILS) ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50 relative">
        
        {/* STICKY BULK ACTION BAR */}
        <AnimatePresence>
          {selectedRows.length > 0 && (
            <motion.div 
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className="absolute top-0 left-0 right-0 z-30 bg-gray-900 text-white px-6 py-3 shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand-gold" />
                <span className="font-bold text-base">{selectedRows.length} Orders Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkAction('invoice')} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> Invoice</button>
                <button onClick={() => handleBulkAction('labels')} className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5"><Printer className="w-3.5 h-3.5"/> Labels</button>
                <button onClick={() => handleBulkAction('pack')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors">Mark Packed</button>
                <button onClick={() => handleBulkAction('ship')} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors">Mark Shipped</button>
                <div className="w-px h-6 bg-gray-700 mx-2"></div>
                <button onClick={() => handleBulkAction('export')} className="text-gray-300 hover:text-white px-2 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1"><Download className="w-3.5 h-3.5"/> Export</button>
                <button onClick={() => setSelectedRows([])} className="text-red-400 hover:text-red-300 px-2 py-1.5 rounded text-xs font-semibold transition-colors">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedOrder ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Box className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-500">Select an order to view details</p>
          </div>
        ) : (
          <div className={`flex-1 overflow-y-auto ${selectedRows.length > 0 ? 'pt-[60px]' : ''}`}>
            
            <div className="max-w-4xl mx-auto p-6 space-y-8 pb-24">
              
              {/* SECTION 1: ORDER HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{selectedOrder.orderId}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedOrder.payment?.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {selectedOrder.payment?.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm font-medium flex items-center gap-4">
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                    <span className="font-bold text-gray-900">{fmt(selectedOrder.pricing?.total || 0)}</span>
                    {(selectedOrder.pricing?.total || 0) >= 1000000 && <span className="text-amber-600 font-bold bg-amber-50 px-2 rounded">High Value Order</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <a href={`/api/orders/${selectedOrder.orderId}/invoice`} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2">
                    <Printer className="w-4 h-4"/> Print Invoice
                  </a>
                  <button onClick={() => copyToClipboard(`https://swastikasarees.com/track/${selectedOrder.orderId}`, 'Order Link')} className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2">
                    <Copy className="w-4 h-4"/> Copy Link
                  </button>
                  <button onClick={() => handlePrintLabel(selectedOrder)} className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2">
                    <Printer className="w-4 h-4"/> Shipping Label
                  </button>
                </div>
              </div>

              {/* SECTION 7: HORIZONTAL WORKFLOW */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-x-auto">
                <div className="flex items-center min-w-[600px]">
                  {timelineSteps.map((step, idx) => {
                    const currentLevel = getTimelineLevel(selectedOrder.status);
                    const isPast = currentLevel >= idx;
                    const isActive = currentLevel === idx;
                    
                    return (
                      <React.Fragment key={step.id}>
                        {/* Step Node */}
                        <div 
                          className="relative flex flex-col items-center group cursor-pointer"
                          onClick={() => step.actionStatus && setTimelineAction(step)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isPast ? 'bg-brand-dark border-brand-dark text-white' : 
                            isActive ? 'bg-white border-brand-dark text-brand-dark ring-4 ring-brand-cream/50' : 
                            'bg-gray-50 border-gray-300 text-gray-300'
                          }`}>
                            {isPast ? <Check className="w-4 h-4"/> : <span className="text-xs font-bold">{idx + 1}</span>}
                          </div>
                          
                          <div className="absolute top-10 w-24 text-center">
                            <p className={`text-[11px] font-bold ${isPast || isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                            {isActive && step.actionLabel && (
                              <p className="text-[10px] text-brand-gold mt-0.5 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to {step.actionLabel}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Connector Line */}
                        {idx < timelineSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${currentLevel > idx ? 'bg-brand-dark' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                
                {/* LEFT COL (2/3) */}
                <div className="col-span-2 space-y-8">
                  
                  {/* SECTION 4: PRODUCTS */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Products ({selectedOrder.items?.length || 0})</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((item, i) => (
                        <div key={i} className="p-6 flex gap-6 hover:bg-gray-50/50 transition-colors">
                          <div className="w-24 h-32 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden shrink-0 shadow-sm">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-gray-300"/></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a href={`/product/${item.product}`} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-900 hover:text-brand-crimson text-lg block line-clamp-2">
                              {item.name}
                            </a>
                            <p className="text-xs text-gray-400 font-mono mt-1 mb-3">SKU: {item.sku || `SWSTK-${item.product.substring(0,6).toUpperCase()}`}</p>
                            
                            <div className="flex flex-wrap gap-4 mb-4">
                              {item.color && <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Color</p><p className="text-sm font-semibold text-gray-800">{item.color}</p></div>}
                              {item.size && <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Size</p><p className="text-sm font-semibold text-gray-800">{item.size}</p></div>}
                              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Qty</p><p className="text-sm font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{item.quantity}</p></div>
                              <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Stock</p><p className="text-sm font-semibold text-green-600">In Stock</p></div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 w-32 border-l border-gray-100 pl-6">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Price</p>
                            <p className="font-bold text-gray-800 mb-2">{fmt(item.price)}</p>
                            
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 border-t border-gray-100 pt-2">Subtotal</p>
                            <p className="font-black text-lg text-gray-900">{fmt(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 6: SHIPPING & FULFILLMENT (SUPER-SECTION) */}
                  <div className="bg-white border border-gray-400 rounded-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-white" />
                        <h3 className="font-black text-white uppercase tracking-wider text-sm">Shipping & Fulfillment</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {saveStatus === 'saving' && <span className="text-xs text-white/70 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin"/> Saving...</span>}
                        {saveStatus === 'saved' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Saved</span>}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Courier Partner</label>
                          <select 
                            value={courier} 
                            onChange={(e) => {
                              setCourier(e.target.value);
                              handleAutoSave('courier', e.target.value);
                            }}
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-brand-gold outline-none"
                          >
                            <option value="">Select Courier...</option>
                            <option value="Delhivery">Delhivery</option>
                            <option value="Bluedart">Bluedart</option>
                            <option value="XpressBees">XpressBees</option>
                            <option value="Ecom Express">Ecom Express</option>
                            <option value="DTDC">DTDC</option>
                            <option value="Shiprocket">Shiprocket</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tracking (AWB) Number</label>
                          <input 
                            type="text" 
                            value={trackingNumber} 
                            onChange={(e) => {
                              setTrackingNumber(e.target.value);
                              handleAutoSave('tracking', e.target.value);
                            }}
                            placeholder="e.g. 10009837261"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm font-mono font-bold text-gray-900 focus:ring-2 focus:ring-brand-gold outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-6 border-t border-gray-100 pt-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Weight (kg)</label>
                          <input 
                            type="text" 
                            value={packageWeight}
                            onChange={(e) => { setPackageWeight(e.target.value); handleAutoSave('weight', e.target.value); }}
                            placeholder="e.g. 0.5"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dimensions (LxWxH)</label>
                          <input 
                            type="text" 
                            value={packageDimensions}
                            onChange={(e) => { setPackageDimensions(e.target.value); handleAutoSave('dimensions', e.target.value); }}
                            placeholder="e.g. 10x10x5 cm"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Shipping Cost (₹)</label>
                          <input 
                            type="text" 
                            value={shippingCost}
                            onChange={(e) => { setShippingCost(e.target.value); handleAutoSave('cost', e.target.value); }}
                            placeholder="Actual cost"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                        <button onClick={() => alert('AWB Generation will require Courier API Integration (e.g. Shiprocket)')} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
                          <Package className="w-4 h-4"/> Generate AWB
                        </button>
                        <button onClick={() => handlePrintLabel(selectedOrder)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
                          <Printer className="w-4 h-4"/> Print Label
                        </button>
                        <button onClick={() => window.open(`https://www.google.com/search?q=${trackingNumber}+tracking`, '_blank')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
                          <ExternalLink className="w-4 h-4"/> Track Shipment
                        </button>
                        <button onClick={() => copyToClipboard(trackingNumber, 'Tracking Number')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
                          <Copy className="w-4 h-4"/> Copy Link
                        </button>
                        <button className="bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm ml-auto">
                          <MessageSquare className="w-4 h-4"/> Notify Customer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 8: INTERNAL NOTES */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-gray-400" />
                      <h3 className="font-black text-gray-800 uppercase tracking-wider text-sm">Internal Notes</h3>
                    </div>
                    <div className="p-6">
                      <textarea 
                        value={trackingNotes}
                        onChange={(e) => {
                          setTrackingNotes(e.target.value);
                          handleAutoSave('notes', e.target.value);
                        }}
                        placeholder="Admin notes, packing instructions, gift messages, fraud flags..."
                        className="w-full bg-yellow-50/50 border border-yellow-200 rounded-lg p-4 text-sm font-medium focus:ring-2 focus:ring-yellow-400 outline-none min-h-[120px] resize-none text-gray-800"
                      />
                      <p className="text-xs text-gray-400 font-bold mt-3 flex items-center gap-1.5"><Save className="w-3.5 h-3.5"/> Auto-saves. Not visible to customers.</p>
                    </div>
                  </div>

                </div>

                {/* RIGHT COL (1/3) */}
                <div className="space-y-8">
                  
                  {/* SECTION 2: CUSTOMER */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="font-black text-gray-800 uppercase tracking-wider text-xs mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400"/> Customer Details
                    </h3>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-brand-dark text-white flex items-center justify-center font-black text-xl shadow-inner">
                        {selectedOrder.shippingAddress?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg">{selectedOrder.shippingAddress?.name}</p>
                        <p className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          {selectedOrder.user === 'guest' ? 'Guest Checkout' : 'Registered Customer'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                          <a href={`tel:${selectedOrder.shippingAddress?.phone}`} className="font-bold text-gray-900 hover:text-brand-crimson">
                            {selectedOrder.shippingAddress?.phone}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                          <a href={`mailto:${selectedOrder.shippingAddress?.email || 'N/A'}`} className="font-bold text-gray-900 hover:text-brand-crimson truncate max-w-[200px] block">
                            {selectedOrder.shippingAddress?.email || 'Not Provided'}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 flex gap-2">
                      <a href={`https://wa.me/${(selectedOrder.shippingAddress?.phone || '').replace(new RegExp('[^0-9]', 'g'), '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 py-2.5 rounded-lg flex justify-center items-center gap-2 text-xs font-bold transition-colors">
                        <MessageSquare className="w-4 h-4" /> WhatsApp
                      </a>
                      <a href={`tel:${selectedOrder.shippingAddress?.phone}`} className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2.5 rounded-lg flex justify-center items-center gap-2 text-xs font-bold transition-colors">
                        <Phone className="w-4 h-4" /> Call
                      </a>
                    </div>
                  </div>

                  {/* SECTION 3: SHIPPING ADDRESS */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
                      <h3 className="font-black text-gray-800 uppercase tracking-wider text-xs flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400"/> Shipping Address
                      </h3>
                      {selectedOrder.status === 'pending' && (
                        <button className="text-[10px] font-bold text-brand-dark uppercase tracking-wider hover:underline">Edit</button>
                      )}
                    </div>
                    
                    <div className="text-sm font-semibold text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
                      <button onClick={() => copyToClipboard(`${selectedOrder.shippingAddress?.line1}, ${selectedOrder.shippingAddress?.city}`, 'Address')} className="absolute top-2 right-2 p-1.5 bg-white border border-gray-200 rounded text-gray-400 hover:text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="w-3 h-3"/>
                      </button>
                      <p>{selectedOrder.shippingAddress?.line1}</p>
                      {selectedOrder.shippingAddress?.line2 && <p>{selectedOrder.shippingAddress?.line2}</p>}
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      <p className="font-black mt-1">PIN: {selectedOrder.shippingAddress?.pincode}</p>
                    </div>

                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedOrder.shippingAddress?.line1}, ${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.pincode}`)}`} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5"/> Open in Google Maps
                    </a>
                  </div>

                  {/* SECTION 5: PAYMENT */}
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="font-black text-gray-800 uppercase tracking-wider text-xs mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400"/> Payment Details
                    </h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-100">
                      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Method</span>
                        <span className="text-sm font-black text-gray-900 uppercase">
                          {selectedOrder.payment?.method === 'cod' ? 'Cash on Delivery' : 'Prepaid (Razorpay)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
                        <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          selectedOrder.payment?.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedOrder.payment?.status || 'PENDING'}
                        </span>
                      </div>
                      {selectedOrder.payment?.transactionId && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Transaction ID</span>
                          <span className="text-xs font-mono font-bold text-gray-800 break-all">{selectedOrder.payment.transactionId}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-sm font-semibold text-gray-600 px-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-gray-900">{fmt(selectedOrder.pricing?.subtotal || 0)}</span>
                      </div>
                      {(selectedOrder.pricing?.couponDiscount || 0) > 0 && (
                        <div className="flex justify-between text-brand-crimson bg-brand-crimson/5 px-2 py-1 -mx-2 rounded">
                          <span>Discount ({selectedOrder.couponApplied})</span>
                          <span>-{fmt(selectedOrder.pricing.couponDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Taxes (Included)</span>
                        <span className="text-gray-900">₹0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-gray-900">{(selectedOrder.pricing?.shippingCharge || 0) === 0 ? 'FREE' : fmt(selectedOrder.pricing.shippingCharge)}</span>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-gray-200 mt-2">
                        <span className="font-black text-gray-900 uppercase tracking-wider text-xs">Grand Total</span>
                        <span className="text-2xl font-black text-brand-dark leading-none">{fmt(selectedOrder.pricing?.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* SECTION 9: QUICK ACTIONS FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
              <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button onClick={() => setTimelineAction(timelineSteps[0])} className={`px-5 py-3 rounded-lg font-black text-sm transition-all border-2 ${selectedOrder.status === 'pending' ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}>
                    Confirm Order
                  </button>
                  <button onClick={() => setTimelineAction(timelineSteps[1])} className={`px-5 py-3 rounded-lg font-black text-sm transition-all border-2 ${selectedOrder.status === 'confirmed' ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}>
                    Pack Order
                  </button>
                  <button onClick={() => setTimelineAction(timelineSteps[3])} className={`px-5 py-3 rounded-lg font-black text-sm transition-all border-2 ${selectedOrder.status === 'processing' || selectedOrder.status === 'ready' ? 'bg-cyan-600 text-white border-cyan-600 hover:bg-cyan-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}>
                    Mark Shipped
                  </button>
                  <button onClick={() => setTimelineAction(timelineSteps[5])} className={`px-5 py-3 rounded-lg font-black text-sm transition-all border-2 ${selectedOrder.status === 'shipped' || selectedOrder.status === 'out_for_delivery' ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}>
                    Mark Delivered
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTimelineAction({ actionLabel: 'Refund Payment', label: 'Refunded', actionStatus: null, isRefund: true })} className="px-5 py-3 rounded-lg font-black text-sm transition-all bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Refund
                  </button>
                  <button onClick={() => setTimelineAction({ actionLabel: 'Cancel Order', label: 'Cancelled', actionStatus: 'cancelled', isRefund: false })} className="px-5 py-3 rounded-lg font-black text-sm transition-all bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 hover:text-red-700 shadow-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Action Modals (Premium Workflow Confirmation) */}
      <AnimatePresence>
        {timelineAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900">
                  {timelineAction.actionLabel}?
                </h3>
                <button onClick={() => setTimelineAction(null)} className="text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-full p-1 transition-colors"><XCircle className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                  You are about to update order <strong className="text-gray-900">#{selectedOrder?.orderId}</strong> to <strong className="text-brand-dark">{timelineAction.label}</strong>.
                </p>

                {timelineAction.actionStatus === 'shipped' && (
                  <div className="mb-6 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4"/> Verification</p>
                    <div className="space-y-1 text-sm font-semibold text-blue-900">
                      <p>Courier: {courier || <span className="text-amber-600">Missing</span>}</p>
                      <p>Tracking: {trackingNumber || <span className="text-amber-600">Missing</span>}</p>
                    </div>
                  </div>
                )}

                {timelineAction.isRefund && (
                  <div className="mb-6 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><IndianRupee className="w-4 h-4"/> Refund Details</p>
                    <div className="space-y-1 text-sm font-semibold text-emerald-900">
                      <p>Amount to Refund: <span className="font-black text-emerald-700">{fmt(selectedOrder?.pricing?.total || 0)}</span></p>
                      <p>Transaction ID: {selectedOrder?.payment?.transactionId || 'N/A'}</p>
                      <p className="text-xs text-emerald-600 mt-2">This will permanently mark the payment status as Refunded.</p>
                    </div>
                  </div>
                )}

                <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Notify Customer
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark" />
                      <span className="text-sm font-bold text-gray-800">Email Notification</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark" />
                      <span className="text-sm font-bold text-gray-800">WhatsApp Notification</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => setTimelineAction(null)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(timelineAction.actionStatus, true, timelineAction.isRefund)} 
                    className={`px-6 py-2.5 rounded-xl font-black text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${timelineAction.actionStatus === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : timelineAction.isRefund ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                  >
                    Confirm & Update <ChevronRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
