import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout & navigation components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnnouncementBar from './components/AnnouncementBar';


// Storefront pages
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

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Restore auth state on startup
    initialize();
  }, [initialize]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      
      {/* Dynamic Store Layout Wrapper */}
      <div className="flex flex-col min-h-screen bg-brand-cream/15 font-sans">
        
        {/* Global Announcement bar */}
        <AnnouncementBar />

        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Storefront Main View Routing */}
        <main className="flex-grow">
          <Routes>
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
            
            {/* Admin CMS Route */}
            <Route path="/admin" element={<Admin />} />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>


        {/* Global Foot Block */}
        <Footer />

      </div>
    </Router>
  );
}
