import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout & navigation components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';


// Storefront pages
import GlobalModal from './components/modals/GlobalModal';
import AuthPopup from './components/modals/AuthPopup';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import WishlistPage from './pages/WishlistPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrdersHistory from './pages/OrdersHistory';
import OrderDetail from './pages/OrderDetail';
import Account from './pages/Account';
import Login from './pages/Login';
import TrackOrder from './pages/TrackOrder';
import About from './pages/About';
import Contact from './pages/Contact';
import ReturnsPolicy from './pages/ReturnsPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import NotFound from './pages/NotFound';

// Admin CMS view
import Admin from './pages/Admin';

// Scroll to top helper on page change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { pageTransition } from './utils/animations';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="flex-grow"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/orders" element={<OrdersHistory />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/returns" element={<ReturnsPolicy />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          
          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

function AppContent({ scaleX }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <div className="font-sans min-h-screen bg-brand-cream/30">
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX }}
      />
      
      {/* Dynamic Store Layout Wrapper with Ambient Glow */}
      <div className="flex flex-col min-h-screen bg-brand-cream/15 font-sans relative overflow-hidden">
        {/* Ambient background that moves softly */}
        <div className="absolute inset-0 ambient-glow-bg pointer-events-none" />
        
        {/* Global Announcement bar */}
        <AnnouncementBar />

        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Storefront Main View Routing */}
        <AnimatedRoutes />

        {/* Global Foot Block */}
        <Footer />
        <GlobalModal />
        <AuthPopup />
      </div>
    </>
  );
}

export default function App() {
  const { initialize } = useAuthStore();
  
  // Scroll Progress logic
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Restore auth state on startup
    initialize();
  }, [initialize]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent scaleX={scaleX} />
    </Router>
  );
}
