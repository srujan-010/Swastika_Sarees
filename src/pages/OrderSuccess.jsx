import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Package, Truck, MapPin, CreditCard, Calendar,
  ShoppingBag, ListOrdered, ChevronRight, AlertCircle,
  Loader2, Phone, Mail, MessageSquare, Share2, Home, Check, Heart
} from 'lucide-react';

// ─── Confetti burst ─────────────────────────────────────────────────────────
function ConfettiBurst() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#8b1a1a', '#D4AF37', '#c0392b', '#f39c12', '#27ae60', '#2980b9'];
    const particles = Array.from({ length: 160 }, () => ({
      x: canvas.width / 2, y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 14, vy: (Math.random() - 0.9) * 12,
      size: Math.random() * 8 + 3, color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 6,
      shape: Math.random() > 0.5 ? 'rect' : 'circle', opacity: 1
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.vx *= 0.99;
        p.rotation += p.rotSpeed; p.opacity -= 0.012;
        if (p.opacity > 0) {
          alive = true;
          ctx.save(); ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180);
          ctx.fillStyle = p.color;
          if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
        }
      });
      if (alive) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100vw', height: '100vh' }} />;
}

// ─── Timeline statuses ───────────────────────────────────────────────────────
const STATUSES = [
  { key: 'pending',          label: 'Placed',       icon: Package },
  { key: 'confirmed',        label: 'Confirmed',    icon: CheckCircle2 },
  { key: 'packed',           label: 'Packed',       icon: Package },
  { key: 'shipped',          label: 'Shipped',      icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Del.', icon: Truck },
  { key: 'delivered',        label: 'Delivered',    icon: Home },
];

function OrderTimeline({ status }) {
  const cur = STATUSES.findIndex(s => s.key === status);
  return (
    <div className="flex items-start justify-between w-full relative">
      <div className="absolute top-5 left-0 right-0 h-[2px] bg-brand-border/20 z-0" />
      <div className="absolute top-5 left-0 h-[2px] bg-brand-gold z-0 transition-all duration-700"
        style={{ width: `${Math.max(0, (cur / (STATUSES.length - 1)) * 100)}%` }} />
      {STATUSES.map((s, i) => {
        const done = i <= cur;
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex flex-col items-center gap-2 relative z-10" style={{ flex: 1 }}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${done ? 'bg-brand-gold border-brand-gold shadow-md' : 'bg-white border-brand-border/40'} ${i === cur ? 'ring-4 ring-brand-gold/20' : ''}`}>
              {done ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Icon className="w-4 h-4 text-brand-border/40" />}
            </div>
            <span className={`text-[9px] sm:text-[10px] font-semibold text-center uppercase tracking-wide ${done ? 'text-brand-dark' : 'text-brand-border/50'}`}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = p => `₹${(p / 100).toLocaleString('en-IN')}`;
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = d => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ─── Main ────────────────────────────────────────────────────────────────────
export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [retries, setRetries] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const [recommended, setRecommended] = useState([]);

  // Fetch order with auto-retry (race between payment capture and DB write)
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    const tryFetch = async (attempt = 1) => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/orders/success/${orderId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) { setOrder(data); setLoading(false); }
      } catch {
        if (cancelled) return;
        if (attempt < 4) setTimeout(() => tryFetch(attempt + 1), 2000 * attempt);
        else { setFetchError(true); setLoading(false); }
      }
    };
    tryFetch();
    return () => { cancelled = true; };
  }, [orderId, retries]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(d => d && setSettings(d)).catch(() => {});
    fetch('/api/products/collections')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.featured?.length > 0) {
          setRecommended(d.featured.slice(0, 6));
        } else if (d?.bestsellers?.length > 0) {
          setRecommended(d.bestsellers.slice(0, 6));
        }
      }).catch(() => {});
  }, []);

  useEffect(() => { const t = setTimeout(() => setShowConfetti(false), 3500); return () => clearTimeout(t); }, []);

  const deliveryDays = settings?.deliveryDays ? Number(settings.deliveryDays) : 7;
  const estDelivery = order ? new Date(new Date(order.createdAt).getTime() + deliveryDays * 86400000) : new Date(Date.now() + deliveryDays * 86400000);
  const waShare = `https://wa.me/?text=${encodeURIComponent(`🎉 Just ordered from Swastika Sarees! Shop stunning ethnic wear: ${window.location.origin}`)}`;

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#FDFBF7]">
      <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mb-4 animate-pulse">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
      <h2 className="font-display font-bold text-brand-dark text-xl mb-2">Finalizing Your Order…</h2>
      <p className="text-brand-muted text-sm max-w-xs">Payment received. Creating your order. Don't refresh.</p>
    </div>
  );

  if (fetchError || !order) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-[#FDFBF7] space-y-4">
      <AlertCircle className="w-14 h-14 text-amber-500" />
      <h2 className="font-display font-bold text-brand-dark text-xl">We Received Your Payment</h2>
      <p className="text-brand-muted text-sm max-w-sm">We are finalizing your order. Please check My Orders in a moment.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => setRetries(r => r + 1)} className="px-6 py-3 bg-brand-crimson text-white rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-brand-dark transition-colors">Check Again</button>
        <Link to="/account?tab=orders" className="px-6 py-3 bg-white border border-brand-border text-brand-dark rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-brand-cream transition-colors">View My Orders</Link>
      </div>
    </div>
  );

  const addr = order.shippingAddress;
  const isCOD = order.payment?.method === 'cod';
  const isPaid = order.payment?.status === 'paid';

  return (
    <>
      {showConfetti && <ConfettiBurst />}
      <div className="min-h-screen bg-[#FDFBF7] py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* ── Success Hero ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-emerald-50 via-white to-brand-cream border border-emerald-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold uppercase tracking-widest">Order Placed Successfully</span>
            </div>
            <div className="px-6 py-7 flex flex-col md:flex-row items-center gap-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-400 flex items-center justify-center shadow-lg shrink-0">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={2} />
              </motion.div>
              <div className="text-center md:text-left">
                <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="font-display font-bold text-brand-dark text-3xl sm:text-4xl mb-1">Thank You!</motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-brand-muted text-sm mb-4 leading-relaxed">Your order has been placed. We'll prepare it with care and ship it soon.</motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-brand-crimson/10 text-brand-crimson border border-brand-crimson/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide">Order #{order.orderId}</span>
                  <span className={`border px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {isPaid ? '✓ Payment Confirmed' : '⏳ Pay on Delivery'}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ── Stat Cards ──────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Order Date', value: fmtDate(order.createdAt), sub: fmtTime(order.createdAt), icon: Calendar, col: 'text-brand-gold bg-brand-gold/10' },
              { label: 'Est. Delivery', value: fmtDate(estDelivery), sub: `~${deliveryDays} days`, icon: Truck, col: 'text-blue-600 bg-blue-50' },
              { label: 'Payment', value: isCOD ? 'Cash on Del.' : 'Razorpay', sub: isPaid ? 'Paid' : 'Pending', icon: CreditCard, col: isPaid ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50' },
              { label: 'Amount', value: fmt(order.pricing.total), sub: 'Grand Total', icon: ShoppingBag, col: 'text-brand-crimson bg-brand-crimson/10' },
            ].map((c, i) => (
              <div key={i} className="bg-white border border-brand-border/40 rounded-xl p-4 flex flex-col gap-2 shadow-xs">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.col}`}><c.icon className="w-4 h-4" /></div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">{c.label}</span>
                <span className="font-display font-bold text-brand-dark text-sm leading-tight">{c.value}</span>
                <span className="text-[10px] text-brand-muted">{c.sub}</span>
              </div>
            ))}
          </motion.div>

          {/* ── Action Buttons ──────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
            className="flex flex-wrap gap-3">
            <Link to={`/track-order?orderId=${order.orderId}`} className="flex items-center gap-2 bg-brand-crimson hover:bg-brand-dark text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-sm">
              <Truck className="w-4 h-4" />Track Order
            </Link>
            <Link to="/shop" className="flex items-center gap-2 bg-white hover:bg-brand-cream border border-brand-border text-brand-dark px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all">
              <ShoppingBag className="w-4 h-4" />Continue Shopping
            </Link>
            <Link to="/account?tab=orders" className="flex items-center gap-2 bg-white hover:bg-brand-cream border border-brand-border text-brand-dark px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all">
              <ListOrdered className="w-4 h-4" />My Orders
            </Link>
            <a href={waShare} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all">
              <Share2 className="w-4 h-4" />Share
            </a>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* ── Address ─────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-white border border-brand-border/40 rounded-xl shadow-xs overflow-hidden">
              <div className="bg-brand-cream/60 border-b border-brand-border/30 px-5 py-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-crimson shrink-0" />
                <span className="font-bold text-xs uppercase tracking-widest text-brand-dark">Delivering To</span>
              </div>
              <div className="px-5 py-4 space-y-1.5 text-sm">
                <p className="font-bold text-brand-dark text-base">{addr.name}</p>
                <p className="text-brand-muted flex items-center gap-1.5 text-sm"><Phone className="w-3.5 h-3.5 shrink-0" />{addr.phone}</p>
                <p className="text-brand-muted">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="text-brand-muted">{addr.city}, {addr.state} — {addr.pincode}</p>
              </div>
            </motion.div>

            {/* ── Payment Summary ──────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}
              className="bg-white border border-brand-border/40 rounded-xl shadow-xs overflow-hidden">
              <div className="bg-brand-cream/60 border-b border-brand-border/30 px-5 py-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-crimson shrink-0" />
                <span className="font-bold text-xs uppercase tracking-widest text-brand-dark">Order Summary</span>
              </div>
              <div className="px-5 py-4 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-brand-muted"><span>Subtotal</span><span>{fmt(order.pricing.subtotal)}</span></div>
                {order.pricing.couponDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon Discount</span><span>−{fmt(order.pricing.couponDiscount)}</span></div>}
                <div className="flex justify-between text-brand-muted">
                  <span>Shipping</span>
                  <span className={order.pricing.shippingCharge === 0 ? 'text-emerald-600 font-semibold' : ''}>{order.pricing.shippingCharge === 0 ? 'FREE' : fmt(order.pricing.shippingCharge)}</span>
                </div>
                <div className="border-t border-brand-border/30 pt-2 flex justify-between font-bold text-sm text-brand-dark">
                  <span>Grand Total</span><span className="text-brand-crimson">{fmt(order.pricing.total)}</span>
                </div>
                <div className="flex justify-between text-brand-muted"><span>Method</span><span className="font-semibold">{isCOD ? 'Cash on Delivery' : 'Razorpay'}</span></div>
                <div className="flex justify-between text-brand-muted"><span>Status</span><span className={`font-semibold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>{isPaid ? 'PAID' : 'PAY ON DELIVERY'}</span></div>
              </div>
            </motion.div>
          </div>

          {/* ── Ordered Items ────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white border border-brand-border/40 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-brand-cream/60 border-b border-brand-border/30 px-5 py-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-crimson shrink-0" />
              <span className="font-bold text-xs uppercase tracking-widest text-brand-dark">Ordered Items ({order.items.length})</span>
            </div>
            <div className="divide-y divide-brand-border/20">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 px-5 py-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-brand-cream/50 border border-brand-border/30 shrink-0">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      : item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-brand-border/40" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-dark text-sm leading-snug">{item.name}</p>
                    <div className="flex flex-wrap gap-x-3 mt-1">
                      {item.color && <span className="text-[11px] text-brand-muted">Color: <strong className="text-brand-dark">{item.color}</strong></span>}
                      {item.size && <span className="text-[11px] text-brand-muted">Size: <strong className="text-brand-dark">{item.size}</strong></span>}
                      <span className="text-[11px] text-brand-muted">Qty: <strong className="text-brand-dark">{item.quantity}</strong></span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-bold text-brand-dark text-sm">{fmt(item.price)}</span>
                      <span className="text-[10px] text-brand-muted">× {item.quantity} =</span>
                      <span className="font-bold text-brand-crimson text-sm">{fmt(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Timeline ─────────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-white border border-brand-border/40 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-brand-cream/60 border-b border-brand-border/30 px-5 py-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-crimson shrink-0" />
              <span className="font-bold text-xs uppercase tracking-widest text-brand-dark">Order Progress</span>
            </div>
            <div className="px-6 py-6 overflow-x-auto">
              <div style={{ minWidth: '480px' }}><OrderTimeline status={order.status} /></div>
            </div>
            {order.tracking?.trackingNumber && (
              <div className="px-5 pb-4">
                <a href={order.tracking.trackingUrl || '#'} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-crimson hover:text-brand-gold transition-colors">
                  Track with {order.tracking.courierName} — {order.tracking.trackingNumber}
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </motion.div>

          {/* ── What's Next ──────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-brand-cream/60 to-white border border-brand-border/40 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-widest text-brand-dark mb-3">What's Next?</h3>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              {[
                { icon: Mail,        title: 'Confirmation Email', desc: `Sent to ${addr.name}`,              col: 'text-blue-500 bg-blue-50' },
                { icon: MessageSquare, title: 'WhatsApp Updates', desc: 'Shipping & delivery notifications', col: 'text-emerald-600 bg-emerald-50' },
                { icon: Truck,       title: 'Dispatched in 1–2 Days', desc: `Delivery by ${fmtDate(estDelivery)}`, col: 'text-brand-gold bg-brand-gold/10' },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white border border-brand-border/30">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.col}`}><c.icon className="w-4 h-4" /></div>
                  <div>
                    <p className="font-bold text-brand-dark leading-snug">{c.title}</p>
                    <p className="text-brand-muted mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Recommended ──────────────────────────────────────────────── */}
          {recommended.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="bg-white border border-brand-border/40 rounded-xl shadow-xs overflow-hidden">
              <div className="bg-brand-cream/60 border-b border-brand-border/30 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-brand-crimson shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-widest text-brand-dark">You May Also Like</span>
                </div>
                <Link to="/shop" className="text-[10px] font-bold text-brand-crimson hover:text-brand-gold uppercase tracking-widest flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></Link>
              </div>
              <div className="p-5 overflow-x-auto">
                <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                  {recommended.map((p, i) => (
                    <Link key={p._id || i} to={`/product/${p.slug}`} className="w-36 shrink-0 group">
                      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-brand-cream/50 border border-brand-border/30 mb-2">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-brand-border/30" /></div>
                        }
                      </div>
                      <p className="text-xs font-semibold text-brand-dark truncate group-hover:text-brand-crimson transition-colors">{p.name}</p>
                      <p className="text-xs text-brand-crimson font-bold mt-0.5">₹{p.price?.toLocaleString('en-IN')}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Footer Links ─────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="text-center py-2 space-y-3">
            <p className="text-xs text-brand-muted">
              Questions? <a href={`https://wa.me/${settings?.whatsAppNumber || '919999999999'}`} target="_blank" rel="noopener noreferrer" className="text-brand-crimson font-bold hover:underline">Chat on WhatsApp</a> or <Link to="/contact" className="text-brand-crimson font-bold hover:underline">Contact Us</Link>
            </p>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-brand-muted">
              {[['/', 'Home'], ['/shop', 'Shop'], ['/account?tab=orders', 'My Orders'], ['/track-order', 'Track Order'], ['/returns', 'Returns']].map(([to, label]) => (
                <Link key={to} to={to} className="hover:text-brand-crimson transition-colors">{label}</Link>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
}

