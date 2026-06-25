import React, { useState, useEffect, useRef } from "react";
import { X, Heart, ShoppingBag, Plus, Minus, ChevronDown, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";

export default function QuickViewModal({ product, onClose }) {
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const scrollContainerRef = useRef(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    if (product) {
      const defaultVariant = product.variants?.[0];
      setSelectedColor(defaultVariant?.colorName || null);
      const showSizeInit = product.showSizeChart !== false && product.category?.slug !== 'sarees';
      setSelectedSize(showSizeInit ? (defaultVariant?.size || null) : null);
      setActiveImageIndex(0);
      setQuantity(1);
      setScrolled(false);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    }
  }, [product]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > el.clientHeight * 0.25);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!product) return null;

  const isSaved = isInWishlist(product._id);
  const images = product.images?.length > 0
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800" }];

  const currentPrice = product.price / 100;
  const originalPrice = product.originalPrice ? product.originalPrice / 100 : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const colorsMap = new Map();
  const sizesMap = new Map();
  product.variants?.forEach(v => {
    if (v.colorName && !colorsMap.has(v.colorName)) colorsMap.set(v.colorName, v.colorHex);
    if (v.size && !sizesMap.has(v.size)) sizesMap.set(v.size, true);
  });
  const uniqueColors = Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
  const uniqueSizes = Array.from(sizesMap.keys());
  const showSize = product.showSizeChart !== false && product.category?.slug !== 'sarees';

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      slug: product.slug,
      name: product.name,
      price: currentPrice,
      quantity,
      color: selectedColor,
      size: selectedSize,
      imageUrl: images[0]?.url,
      stock: product.stock
    });
    onClose();
  };

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
      <div className="fixed inset-0" onClick={onClose} />

      {/* Scrollable modal shell */}
      <div
        ref={scrollContainerRef}
        className="relative w-full h-full sm:h-[95vh] sm:max-w-2xl md:max-w-3xl overflow-y-auto rounded-none sm:rounded-3xl shadow-2xl z-10"
        style={{ scrollbarWidth: "none", scrollBehavior: "smooth" }}
      >
        {/* ── PHASE 1: HERO IMAGE ─────────── */}
        <div className="relative w-full flex-shrink-0 overflow-hidden bg-black" style={{ height: "100vh" }}>
          <img
            src={images[activeImageIndex]?.url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ transition: "opacity 0.35s ease" }}
          />

          {product.stock === 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-25 flex flex-col items-center justify-center bg-brand-crimson/95 border border-brand-gold/45 text-brand-cream p-4 rounded-full shadow-2xl animate-pulse select-none" style={{ width: "120px", height: "120px" }}>
              <AlertTriangle size={28} className="text-brand-gold animate-bounce mb-1" />
              <span className="text-[10px] font-bold tracking-widest text-center uppercase leading-tight">OUT OF<br/>STOCK</span>
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.3) 100%)" }} />

          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 z-30 p-2.5 rounded-full border border-white/20 text-white" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }} aria-label="Close">
            <X size={20} />
          </button>

          {/* Wishlist */}
          <button onClick={() => toggleWishlist(product)} className="absolute top-4 left-4 z-30 p-2.5 rounded-full border text-white transition-all" style={{ background: isSaved ? "rgba(139,26,26,0.8)" : "rgba(0,0,0,0.45)", borderColor: isSaved ? "#8B1A1A" : "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }} aria-label="Wishlist">
            <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
          </button>

          {/* Badges */}
          <div className="absolute top-16 left-4 z-20 flex flex-col gap-1.5">
            {product.isNewArrival && <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">NEW</span>}
            {product.isBestseller && <span className="bg-red-800 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">BESTSELLER</span>}
            {discountPercent > 0 && <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">{discountPercent}% OFF</span>}
            {product.stock === 0 && <span className="text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm border border-white/30" style={{ background: "rgba(0,0,0,0.6)" }}>OUT OF STOCK</span>}
          </div>

          {/* Image dots */}
          {images.length > 1 && (
            <div className="absolute z-20 flex gap-1.5" style={{ bottom: "6.5rem", left: "50%", transform: "translateX(-50%)" }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setActiveImageIndex(i)} className="rounded-full transition-all" style={{ width: activeImageIndex === i ? "20px" : "8px", height: "8px", background: activeImageIndex === i ? "white" : "rgba(255,255,255,0.4)" }} />
              ))}
            </div>
          )}

          {/* Product name at bottom of hero */}
          <div className="absolute left-0 right-0 z-20 px-6 text-center" style={{ bottom: "3.5rem" }}>
            <p className="text-white/60 text-xs uppercase tracking-widest font-sans mb-1">{product.category?.name || "Indian Ethnic Wear"}</p>
            <h2 className="font-display font-bold text-white leading-tight drop-shadow-lg" style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)" }}>{product.name}</h2>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-white font-bold text-xl font-sans">&#8377;{currentPrice.toLocaleString("en-IN")}</span>
              {originalPrice && <span className="text-white/50 text-sm line-through font-sans">&#8377;{originalPrice.toLocaleString("en-IN")}</span>}
            </div>
          </div>

          {/* Animated scroll indicator */}
          <button
            onClick={scrollToDetails}
            className="absolute z-30 flex flex-col items-center gap-1 text-white/80 hover:text-white transition-all duration-500"
            style={{ bottom: "0.75rem", left: "50%", transform: "translateX(-50%)", opacity: scrolled ? 0 : 1, pointerEvents: scrolled ? "none" : "auto" }}
          >
            <span style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>Scroll for details</span>
            <ChevronDown size={22} strokeWidth={2.5} style={{ animation: "bounce 1s infinite" }} />
          </button>
        </div>

        {/* ── PHASE 2: DETAILS PANEL ─────── */}
        <div ref={detailsRef} className="bg-white w-full relative" style={{ padding: "2rem 1.5rem 3rem" }}>
          {/* Pill handle */}
          <div className="absolute rounded-full bg-gray-200" style={{ top: "0.75rem", left: "50%", transform: "translateX(-50%)", width: "40px", height: "4px" }} />

          {/* Header */}
          <div className="mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold font-sans" style={{ color: "#C8832A" }}>{product.category?.name || "Indian Ethnic Wear"}</span>
            <h3 className="font-display font-bold text-gray-900 mt-0.5" style={{ fontSize: "1.35rem", lineHeight: 1.3 }}>{product.name}</h3>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 rounded-xl p-3.5 mb-5 border border-gray-100" style={{ background: "#FDF8F3" }}>
            <span className="font-sans font-bold text-2xl" style={{ color: "#8B1A1A" }}>&#8377;{currentPrice.toLocaleString("en-IN")}</span>
            {originalPrice && <>
              <span className="text-sm line-through text-gray-400 font-sans">&#8377;{originalPrice.toLocaleString("en-IN")}</span>
              <span className="text-white text-xs font-bold px-2 py-0.5 rounded-sm" style={{ background: "#C8832A" }}>{discountPercent}% OFF</span>
            </>}
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded border" style={product.stock > 0 ? { background: "#f0fdf4", color: "#15803d", borderColor: "#86efac" } : { background: "#fff1f2", color: "#8B1A1A", borderColor: "rgba(139,26,26,0.3)" }}>
              {product.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
            </span>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {images.map((img, i) => (
                <button key={i} onClick={() => { setActiveImageIndex(i); scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="shrink-0 overflow-hidden rounded-lg border-2 transition-all"
                  style={{ width: "56px", height: "76px", borderColor: activeImageIndex === i ? "#8B1A1A" : "transparent", opacity: activeImageIndex === i ? 1 : 0.65 }}>
                  <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          {/* Variants */}
          <div className="space-y-5 mb-6">
            {uniqueColors.length > 0 && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-gray-800">
                  Colour: <span style={{ color: "#8B1A1A", textTransform: "none" }}>{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {uniqueColors.map(c => (
                    <button key={c.name} onClick={() => setSelectedColor(c.name)} title={c.name}
                      className="w-8 h-8 rounded-full transition-all hover:scale-105"
                      style={{ background: c.hex || "#ccc", border: selectedColor === c.name ? "2px solid #8B1A1A" : "2px solid white", boxShadow: selectedColor === c.name ? "0 0 0 3px rgba(139,26,26,0.25)" : "0 0 0 1px #e5e7eb", transform: selectedColor === c.name ? "scale(1.15)" : "scale(1)" }} />
                  ))}
                </div>
              </div>
            )}
            {showSize && uniqueSizes.length > 0 && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-gray-800">
                  Size: <span style={{ color: "#8B1A1A", textTransform: "none" }}>{selectedSize}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className="px-4 py-1.5 rounded-lg border text-xs font-medium transition-all"
                      style={{ background: selectedSize === s ? "#8B1A1A" : "white", color: selectedSize === s ? "white" : "#1a0505", borderColor: selectedSize === s ? "#8B1A1A" : "#e5e7eb" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.stock > 0 && (
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider mb-2.5 text-gray-800">Quantity</span>
                <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 w-32" style={{ background: "#FDF8F3" }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 text-gray-700 transition-colors"><Minus size={14} /></button>
                  <span className="flex-1 text-center text-sm font-bold text-gray-900 font-sans">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-gray-100 text-gray-700 transition-colors"><Plus size={14} /></button>
                </div>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mb-4">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm py-3.5 rounded-xl border transition-all text-white"
              style={{ background: product.stock === 0 ? "#9ca3af" : "#8B1A1A", borderColor: product.stock === 0 ? "transparent" : "rgba(200,131,42,0.3)", boxShadow: product.stock > 0 ? "0 4px 12px rgba(139,26,26,0.3)" : "none" }}>
              <ShoppingBag size={18} />
              <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
            </button>
            <button onClick={() => toggleWishlist(product)}
              className="p-3.5 rounded-xl border flex items-center justify-center transition-all"
              style={{ borderColor: isSaved ? "#8B1A1A" : "#e5e7eb", color: isSaved ? "#8B1A1A" : "#9ca3af", background: isSaved ? "rgba(139,26,26,0.05)" : "white" }}>
              <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Full details link */}
          <Link to={`/product/${product.slug}`} onClick={onClose}
            className="flex items-center justify-center gap-1.5 text-xs font-medium underline underline-offset-2 transition-colors"
            style={{ color: "#9ca3af" }}
            onMouseEnter={e => e.currentTarget.style.color = "#8B1A1A"}
            onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}>
            <span>View Full Product Details</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
