import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  User, MapPin, Heart, LogOut, ShieldAlert, Plus, Trash2, Edit,
  Home, ShoppingBag, CreditCard, Gift, Wallet, RefreshCw, Star,
  Bell, Settings, Upload, CheckCircle2, ChevronRight, ShoppingCart, Percent,
  AlertCircle, ShieldCheck, HelpCircle, Eye, Calendar, Sparkles, Trophy
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useModalStore } from '../store/modalStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Puducherry"
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'saved-cart', label: 'Saved Cart', icon: ShoppingCart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'coupons', label: 'Coupons', icon: Gift },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'returns', label: 'Returns & Refunds', icon: RefreshCw },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Account Settings', icon: Settings },
];

export default function Account() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const { user, token, logout, updateProfile, addAddress, deleteAddress, updateAddress, fetchProfile } = useAuthStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { success, confirm } = useModalStore();

  // Active Tab State loaded from URL Query Parameter (?tab=xxx)
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });

  // Sync state with URL parameter changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'dashboard';
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/account?tab=${tabId}`);
  };

  // State variables for fetched data
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [newsletterPref, setNewsletterPref] = useState(true);
  const [whatsappPref, setWhatsappPref] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change Form States (Mocked functionality)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Address Form States
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
  });
  const [addressError, setAddressError] = useState('');

  // Review Form Modal States (for writing reviews on purchased items)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Saved Cart mock state (Initialized from user.savedCart or seeded if empty)
  const [savedCart, setSavedCart] = useState([]);

  // Mock Payment Method state (Add Payment)
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ type: 'card', value: '', name: '', expiry: '' });

  // Initial authentication check & data fetching
  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/account');
      return;
    }
    fetchProfile();
  }, [token]);

  // Load user data into form states
  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phone || '');
      setProfileDob(user.dob || '');
      setProfileGender(user.gender || '');
      setNewsletterPref(user.newsletterPref !== false);
      setWhatsappPref(user.whatsappPref !== false);
      
      // Initialize savedCart from user object
      if (user.savedCart && user.savedCart.length > 0) {
        setSavedCart(user.savedCart);
      } else {
        setSavedCart([]);
      }
    }
  }, [user]);

  // Tab-specific data loading
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'orders' || activeTab === 'dashboard' || activeTab === 'reviews' || activeTab === 'returns') {
      setOrdersLoading(true);
      fetch('/api/orders/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setOrdersLoading(false);
      })
      .catch(err => {
        console.error('Failed to load orders:', err);
        setOrdersLoading(false);
      });
    }

    if (activeTab === 'coupons' || activeTab === 'dashboard') {
      setCouponsLoading(true);
      fetch('/api/coupons/active')
      .then(res => res.json())
      .then(data => {
        setCoupons(Array.isArray(data) ? data : []);
        setCouponsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load active coupons:', err);
        setCouponsLoading(false);
      });
    }

    if (activeTab === 'reviews') {
      setReviewsLoading(true);
      fetch('/api/reviews/my-reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setMyReviews(Array.isArray(data) ? data : []);
        setReviewsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load reviews:', err);
        setReviewsLoading(false);
      });
    }
  }, [activeTab, token]);

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-crimson"></div>
      </div>
    );
  }

  // Member Since formatter
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  }) : 'July 2026';

  // Loyalty calculations
  const totalSpendINR = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + (o.pricing.grandTotal / 100), 0);

  // Handlers for Profile Photo Upload
  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadLoading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const ok = await updateProfile({ profilePhoto: data.imageUrl });
        if (ok) {
          success('Profile Photo Updated', 'Your profile picture has been changed successfully.');
          fetchProfile();
        }
      } else {
        console.error('Failed to upload image to server');
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  // Submit Handler for Profile Form
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    const ok = await updateProfile({
      fullName: profileName,
      phone: profilePhone,
      dob: profileDob,
      gender: profileGender,
      newsletterPref,
      whatsappPref
    });

    if (ok) {
      setProfileSuccess('Profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
      fetchProfile();
    } else {
      setProfileError('Failed to update profile. Please try again.');
    }
  };

  // Change Password Handler (Simulated)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    // Mock API call delay
    setTimeout(() => {
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    }, 800);
  };

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    const confirmed = await confirm(
      'Delete Account Permanently',
      'Are you sure you want to permanently delete your Swastika Sarees account? This action is irreversible, and you will lose your reward points, order history, and wallet balances.',
      { confirmText: 'Delete Permanently', isDanger: true }
    );

    if (confirmed) {
      try {
        const res = await fetch('/api/users/profile', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          logout();
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to delete account:', err);
      }
    }
  };

  // Submit Handler for Address Book
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');

    const { name, phone, line1, city, state, pincode } = addressForm;
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      setAddressError('All fields marked * are required.');
      return;
    }

    if (pincode.length !== 6 || isNaN(pincode)) {
      setAddressError('Pincode must be exactly 6 digits.');
      return;
    }

    let ok = false;
    if (editingAddressId) {
      ok = await updateAddress(editingAddressId, addressForm);
    } else {
      ok = await addAddress(addressForm);
    }

    if (ok) {
      setAddressFormOpen(false);
      setEditingAddressId(null);
      setAddressForm({
        name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false
      });
      fetchProfile();
      success('Address Saved', 'Your address book has been updated successfully.');
    } else {
      setAddressError('Failed to save address details.');
    }
  };

  const handleEditAddressClick = (addr) => {
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault || false
    });
    setEditingAddressId(addr._id);
    setAddressFormOpen(true);
  };

  const handleSetDefaultAddress = async (addrId) => {
    const addressToUpdate = user.addresses.find(a => a._id === addrId);
    if (!addressToUpdate) return;
    
    const ok = await updateAddress(addrId, { ...addressToUpdate, isDefault: true });
    if (ok) {
      fetchProfile();
      success('Default Address Updated', 'Default shipping address has been updated.');
    }
  };

  // Move Wishlist Item to Cart
  const handleMoveToCart = (prod) => {
    const defaultVariant = prod.variants?.[0];
    addItem({
      product: prod._id,
      slug: prod.slug,
      name: prod.name,
      price: prod.price / 100, // paise to INR
      quantity: 1,
      color: defaultVariant?.colorName || null,
      size: defaultVariant?.size || null,
      imageUrl: prod.images?.[0]?.url || '',
      stock: prod.stock
    });
    toggleWishlist(prod);
    success('Moved to Bag', `${prod.name} has been moved to your shopping bag.`);
  };

  // Saved Cart / Save for Later actions
  const handleMoveSavedToCart = (item) => {
    addItem({
      product: item._id,
      slug: item.slug,
      name: item.name,
      price: item.price / 100,
      quantity: 1,
      color: item.color || null,
      size: item.size || null,
      imageUrl: item.imageUrl || '',
      stock: item.stock
    });
    setSavedCart(prev => prev.filter(i => i._id !== item._id));
    
    // Sync with backend user profile
    const updatedSaved = savedCart.filter(i => i._id !== item._id);
    updateProfile({ savedCart: updatedSaved });
    success('Moved to Bag', `${item.name} has been added to your shopping bag.`);
  };

  const handleDeleteSaved = (itemId) => {
    const updatedSaved = savedCart.filter(i => i._id !== itemId);
    setSavedCart(updatedSaved);
    updateProfile({ savedCart: updatedSaved });
  };

  // Payments additions
  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!newPayment.value || !newPayment.name) return;

    let maskedValue = newPayment.value;
    if (newPayment.type === 'card') {
      const last4 = newPayment.value.slice(-4);
      maskedValue = `•••• •••• •••• ${last4 || '4242'}`;
    }

    const updatedPayments = [...(user.savedPayments || []), {
      type: newPayment.type,
      maskedValue,
      name: newPayment.name,
      expiry: newPayment.expiry || '12/30'
    }];

    updateProfile({ savedPayments: updatedPayments }).then(() => {
      fetchProfile();
      setPaymentFormOpen(false);
      setNewPayment({ type: 'card', value: '', name: '', expiry: '' });
      success('Payment Method Added', 'Successfully saved payment detail.');
    });
  };

  const handleDeletePayment = (paymentId) => {
    const updatedPayments = user.savedPayments.filter(p => p._id !== paymentId);
    updateProfile({ savedPayments: updatedPayments }).then(() => fetchProfile());
  };

  // Submit Product Review
  const openWriteReviewModal = (product) => {
    setReviewProduct(product);
    setReviewForm({ rating: 5, comment: '' });
    setReviewModalOpen(true);
  };

  const submitProductReview = async (e) => {
    e.preventDefault();
    if (!reviewProduct) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: reviewProduct._id,
          rating: reviewForm.rating,
          text: reviewForm.comment
        })
      });
      if (res.ok) {
        success('Review Submitted', 'Your review has been sent for approval.');
        setReviewModalOpen(false);
        // Refresh reviews list
        fetch('/api/reviews/my-reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => setMyReviews(Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Dynamic products awaiting review list
  const deliveredProducts = orders
    .filter(o => o.status === 'Delivered')
    .flatMap(o => o.items.map(i => ({
      _id: i.product,
      name: i.name,
      price: i.price,
      imageUrl: i.imageUrl || i.image,
      slug: i.slug
    })));

  // Filter unique products
  const uniqueDeliveredProducts = Array.from(new Map(deliveredProducts.map(p => [p._id, p])).values());

  const productsAwaitingReview = uniqueDeliveredProducts.filter(p => 
    !myReviews.some(r => r.product && (r.product._id === p._id || r.product === p._id))
  );

  // Cancel order request
  const handleCancelOrder = async (orderId) => {
    const confirmed = await confirm(
      'Cancel Order',
      'Are you sure you want to cancel this order? A refund will be credited to your wallet if you have paid online.',
      { confirmText: 'Cancel Order', isDanger: true }
    );
    if (confirmed) {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Cancelled' })
        });
        if (res.ok) {
          success('Order Cancelled', 'Your order was successfully cancelled.');
          // Refresh orders list
          fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => setOrders(Array.isArray(data) ? data : []));
        }
      } catch (err) {
        console.error('Failed to cancel order:', err);
      }
    }
  };

  // Return order request
  const handleReturnOrder = async (orderId) => {
    const confirmed = await confirm(
      'Initiate Return',
      'Are you sure you want to initiate a return request for this order? Our agent will pick it up within 2-3 business days.',
      { confirmText: 'Confirm Return', isDanger: false }
    );
    if (confirmed) {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'Returned' })
        });
        if (res.ok) {
          success('Return Initiated', 'Your return request has been submitted successfully.');
          // Refresh orders list
          fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => setOrders(Array.isArray(data) ? data : []));
        }
      } catch (err) {
        console.error('Failed to return order:', err);
      }
    }
  };

  // Print simulated invoice
  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2D2D2D; padding: 40px; line-height: 1.6; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
            .invoice-header { display: flex; justify-content: space-between; border-bottom: 2px solid #a88a53; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a0505; text-transform: uppercase; }
            .bill-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; text-align: left; }
            th { border-bottom: 2px solid #eee; padding: 10px; font-size: 14px; color: #777; text-transform: uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
            .totals { float: right; width: 300px; margin-top: 20px; }
            .totals div { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px; }
            .totals .grand-total { font-size: 18px; font-weight: bold; color: #b91c1c; border-top: 2px solid #a88a53; pt: 10px; margin-top: 10px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="invoice-box">
            <div class="invoice-header">
              <div>
                <div class="logo">Swastika Sarees</div>
                <div>Premium Ethnic Luxury Wear</div>
              </div>
              <div style="text-align: right;">
                <h2 style="margin: 0; color: #b91c1c;">INVOICE</h2>
                <div>Order ID: <strong>${order.orderId}</strong></div>
                <div>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
            <div class="bill-details">
              <div>
                <strong>Billed To:</strong>
                <div>${order.shippingAddress.name}</div>
                <div>${order.shippingAddress.line1}</div>
                <div>${order.shippingAddress.line2 || ''}</div>
                <div>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</div>
                <div>Phone: ${order.shippingAddress.phone}</div>
              </div>
              <div style="text-align: right;">
                <strong>Payment Method:</strong>
                <div>${order.paymentMethod?.toUpperCase()}</div>
                <strong>Order Status:</strong>
                <div>${order.status}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>
                      <div><strong>${item.name}</strong></div>
                      ${item.color ? `<span style="font-size:12px;color:#777;">Color: ${item.color}</span>` : ''}
                      ${item.size ? `<span style="font-size:12px;color:#777;margin-left:10px;">Size: ${item.size}</span>` : ''}
                    </td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">₹${(item.price / 100).toLocaleString('en-IN')}</td>
                    <td style="text-align: right;">₹${((item.price * item.quantity) / 100).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="totals">
              <div>
                <span>Subtotal:</span>
                <span>₹${(order.pricing.subtotal / 100).toLocaleString('en-IN')}</span>
              </div>
              ${order.pricing.couponDiscount > 0 ? `
                <div style="color: #059669;">
                  <span>Coupon Discount:</span>
                  <span>-₹${(order.pricing.couponDiscount / 100).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
              <div>
                <span>Shipping Charge:</span>
                <span>${order.pricing.shippingCharge > 0 ? `₹${(order.pricing.shippingCharge / 100).toLocaleString('en-IN')}` : 'FREE'}</span>
              </div>
              <div class="grand-total">
                <span>Amount Payable:</span>
                <span>₹${(order.pricing.grandTotal / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div style="clear: both; margin-top: 100px; text-align: center; font-size: 12px; color: #999; border-top: 1px dashed #eee; padding-top: 20px;">
              Thank you for shopping with Swastika Sarees!
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-brand-cream/10 min-h-screen py-10 select-none text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb path */}
        <div className="flex items-center space-x-1.5 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-crimson font-medium">Home</Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-brand-dark">My Account</span>
          <ChevronRight size={12} />
          <span className="font-semibold text-brand-crimson uppercase tracking-wider text-[10px]">
            {activeTab.replace('-', ' ')}
          </span>
        </div>

        {/* Outer Grid Container */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ──────────────────────────────────────────────────
              LEFT SIDEBAR
              ────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-80 shrink-0 select-none">
            
            {/* Customer Profile Card */}
            <div className="bg-white border border-brand-border/60 p-6 rounded-2xl shadow-xs text-center mb-6 relative overflow-hidden">
              {/* Decorative premium badge */}
              <div className="absolute -right-12 -top-12 bg-brand-gold/10 w-24 h-24 rounded-full flex items-center justify-center transform rotate-45 border border-brand-gold/20">
                <Sparkles size={16} className="text-brand-gold absolute bottom-4 left-4" />
              </div>

              <div className="relative inline-block group mb-4">
                <div className="w-20 h-20 rounded-full bg-brand-cream border-2 border-brand-gold/40 flex items-center justify-center text-brand-dark font-display font-bold text-2xl overflow-hidden shadow-inner">
                  {uploadLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-crimson"></div>
                  ) : user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
                  )}
                </div>
                <button
                  type="button"
                  onClick={triggerPhotoUpload}
                  disabled={uploadLoading}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-brand-dark text-brand-cream border border-brand-gold/30 hover:bg-brand-crimson transition-colors shadow-md"
                  aria-label="Upload Photo"
                >
                  <Upload size={10} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              <h2 className="font-display font-bold text-brand-dark text-lg">{user.fullName || 'Valued Customer'}</h2>
              <span className="text-2xs text-brand-muted font-sans font-medium block truncate max-w-[240px] mx-auto mt-0.5">{user.email}</span>
              {user.phone && <span className="text-2xs text-brand-muted font-sans block mt-0.5">{user.phone}</span>}
              <div className="border-t border-brand-border/60 pt-3 mt-4 text-[10px] text-brand-muted font-sans text-center">
                <span>Member Since: <strong>{memberSince}</strong></span>
              </div>
            </div>

            {/* Sidebar Navigation - Collapses into slide-out menu or selector on mobile/tablet */}
            <div className="lg:block bg-white border border-brand-border/60 p-4 rounded-2xl shadow-xs">
              
              {/* Mobile Menu Trigger Header */}
              <div className="lg:hidden flex items-center justify-between py-2 px-2 border-b border-brand-border/40">
                <span className="font-display font-bold text-brand-dark text-sm uppercase tracking-wider">Account Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-brand-crimson font-bold text-xs uppercase hover:underline"
                >
                  {mobileMenuOpen ? 'Hide Menu' : 'Show Menu'}
                </button>
              </div>

              {/* Navigation Links list */}
              <div className={`space-y-1.5 mt-2 lg:mt-0 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
                {SIDEBAR_ITEMS.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleTabChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-brand-crimson text-brand-cream border border-brand-gold/20 shadow-xs' 
                          : 'text-brand-dark hover:bg-brand-cream/80 hover:text-brand-crimson'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent size={15} />
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'wishlist' && wishlist.length > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-brand-white text-brand-crimson' : 'bg-brand-crimson/15 text-brand-crimson'}`}>
                          {wishlist.length}
                        </span>
                      )}
                      {item.id === 'saved-cart' && savedCart.length > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-brand-white text-brand-crimson' : 'bg-brand-crimson/15 text-brand-crimson'}`}>
                          {savedCart.length}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 text-xs font-bold text-brand-crimson hover:bg-brand-cream/80 border-t border-brand-border/40 mt-3"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>

            </div>

          </aside>


          {/* ──────────────────────────────────────────────────
              RIGHT VIEW CONTENT
              ────────────────────────────────────────────────── */}
          <main className="flex-grow select-none bg-white border border-brand-border/60 p-6 sm:p-8 rounded-2xl shadow-xs self-start min-h-[500px]">
            
            <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >

              {/* 🏠 DASHBOARD HOME VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display font-bold text-brand-dark text-xl sm:text-2xl">Hello, {user.fullName || 'Valued Customer'}!</h1>
                    <p className="text-2xs sm:text-xs text-brand-muted mt-1 leading-relaxed">Welcome back to your luxury shopping dashboard. Here is a summary of your profile details, orders, and rewards.</p>
                  </div>

                  {/* Summary Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div onClick={() => handleTabChange('orders')} className="bg-brand-cream/20 border border-brand-border/50 p-4 rounded-xl shadow-2xs hover:shadow-md hover:border-brand-gold/30 transition-all cursor-pointer flex flex-col justify-between h-28 select-none">
                      <div className="flex justify-between items-center text-brand-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-display">Orders Placed</span>
                        <ShoppingBag size={18} />
                      </div>
                      <span className="font-display font-bold text-brand-dark text-xl sm:text-2xl">{orders.length}</span>
                    </div>

                    <div onClick={() => handleTabChange('wishlist')} className="bg-brand-cream/20 border border-brand-border/50 p-4 rounded-xl shadow-2xs hover:shadow-md hover:border-brand-gold/30 transition-all cursor-pointer flex flex-col justify-between h-28 select-none">
                      <div className="flex justify-between items-center text-brand-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-display">Wishlist Items</span>
                        <Heart size={18} />
                      </div>
                      <span className="font-display font-bold text-brand-dark text-xl sm:text-2xl">{wishlist.length}</span>
                    </div>

                    <div onClick={() => handleTabChange('saved-cart')} className="bg-brand-cream/20 border border-brand-border/50 p-4 rounded-xl shadow-2xs hover:shadow-md hover:border-brand-gold/30 transition-all cursor-pointer flex flex-col justify-between h-28 select-none">
                      <div className="flex justify-between items-center text-brand-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-display">Saved Items</span>
                        <ShoppingCart size={18} />
                      </div>
                      <span className="font-display font-bold text-brand-dark text-xl sm:text-2xl">{savedCart.length}</span>
                    </div>

                    <div onClick={() => handleTabChange('coupons')} className="bg-brand-cream/20 border border-brand-border/50 p-4 rounded-xl shadow-2xs hover:shadow-md hover:border-brand-gold/30 transition-all cursor-pointer flex flex-col justify-between h-28 select-none">
                      <div className="flex justify-between items-center text-brand-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-display">Active Coupons</span>
                        <Gift size={18} />
                      </div>
                      <span className="font-display font-bold text-brand-dark text-xl sm:text-2xl">{coupons.length}</span>
                    </div>

                    <div onClick={() => handleTabChange('wallet')} className="bg-brand-cream/20 border border-brand-border/50 p-4 rounded-xl shadow-2xs hover:shadow-md hover:border-brand-gold/30 transition-all cursor-pointer flex flex-col justify-between h-28 select-none">
                      <div className="flex justify-between items-center text-brand-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider font-display">Wallet Balance</span>
                        <Wallet size={18} />
                      </div>
                      <span className="font-display font-bold text-brand-dark text-xl sm:text-2xl">₹{(user.walletBalance / 100).toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Recent Orders List */}
                  <div>
                    <div className="flex justify-between items-center border-b pb-3 border-brand-border/40 mb-4">
                      <h3 className="font-display font-bold text-brand-dark text-sm sm:text-base">Recent Orders</h3>
                      <button onClick={() => handleTabChange('orders')} className="text-brand-crimson font-bold text-xs hover:underline flex items-center">View All <ChevronRight size={14} /></button>
                    </div>
                    {ordersLoading ? (
                      <div className="py-10 text-center text-brand-muted text-xs">Loading orders...</div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 2).map((order) => (
                          <div key={order._id} className="border border-brand-border/60 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-16 bg-brand-cream border rounded overflow-hidden shrink-0">
                                <img src={order.items?.[0]?.imageUrl || order.items?.[0]?.image} alt={order.items?.[0]?.name} className="w-full h-full object-cover object-top" />
                              </div>
                              <div>
                                <span className="block font-bold text-brand-dark text-2xs uppercase tracking-wider mb-0.5">Order {order.orderId}</span>
                                <span className="block text-brand-muted text-[10px]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="block font-semibold text-brand-crimson mt-1">₹{(order.pricing.grandTotal / 100).toLocaleString('en-IN')} via {order.paymentMethod?.toUpperCase()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 self-end md:self-auto">
                              <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full border uppercase tracking-wider ${
                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                order.status === 'Cancelled' ? 'bg-brand-crimson/5 text-brand-crimson border-brand-crimson/20' :
                                'bg-brand-gold/10 text-brand-gold border-brand-gold/30'
                              }`}>{order.status}</span>
                              <button onClick={() => handleTabChange('orders')} className="border border-brand-border text-brand-dark px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-cream">Manage</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 italic border border-dashed rounded-xl border-brand-border/80">
                        <p className="text-brand-muted text-xs mb-3">You haven't placed any orders yet.</p>
                        <Link to="/shop" className="bg-brand-crimson text-brand-cream px-4 py-2 text-2xs rounded-lg font-bold shadow-2xs hover:bg-brand-dark transition-colors inline-block">Continue Shopping</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* 📦 ORDERS HISTORY VIEW */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">My Orders</h2>
                  
                  {ordersLoading ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-crimson mx-auto"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-brand-border/60 rounded-2xl overflow-hidden shadow-xs bg-white text-xs select-none">
                          
                          {/* Order Card Header */}
                          <div className="bg-brand-cream/20 border-b border-brand-border/40 p-4 flex flex-wrap justify-between items-center gap-2">
                            <div className="flex gap-4 sm:gap-6">
                              <div>
                                <span className="block text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Order Placed</span>
                                <span className="block font-bold text-brand-dark font-sans">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Total Amount</span>
                                <span className="block font-bold text-brand-crimson font-sans">₹{(order.pricing.grandTotal / 100).toLocaleString('en-IN')}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Ship To</span>
                                <span className="block font-bold text-brand-dark truncate max-w-[120px]">{order.shippingAddress.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-[10px] text-brand-muted uppercase tracking-wider font-semibold">Order ID</span>
                              <span className="block font-bold text-brand-dark font-mono">{order.orderId}</span>
                            </div>
                          </div>

                          {/* Order Card Body */}
                          <div className="p-4 space-y-4">
                            {order.items.map((item) => (
                              <div key={item._id || item.product} className="flex justify-between items-start gap-4">
                                <div className="flex space-x-4">
                                  <div className="w-16 h-20 bg-brand-cream border rounded overflow-hidden shrink-0">
                                    <img src={item.imageUrl || item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                                  </div>
                                  <div>
                                    <h4 className="font-display font-bold text-brand-dark text-xs leading-snug line-clamp-2 max-w-md">{item.name}</h4>
                                    <div className="mt-1 flex items-center gap-3 text-[10px] text-brand-muted font-sans font-medium">
                                      {item.color && <span>Color: <strong>{item.color}</strong></span>}
                                      {item.size && <span>Size: <strong>{item.size}</strong></span>}
                                      <span>Qty: <strong>{item.quantity}</strong></span>
                                    </div>
                                    <span className="block font-sans font-bold text-brand-dark mt-1.5">₹{(item.price / 100).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-1.5 select-none font-semibold">
                                  <button
                                    onClick={() => addItem({
                                      product: item.product,
                                      slug: item.slug || '',
                                      name: item.name,
                                      price: item.price / 100,
                                      quantity: 1,
                                      color: item.color || null,
                                      size: item.size || null,
                                      imageUrl: item.imageUrl || item.image || ''
                                    })}
                                    className="bg-brand-dark text-brand-cream px-3 py-1.5 rounded-lg hover:bg-black text-[10px] transition-colors"
                                  >
                                    Buy Again
                                  </button>
                                  {order.status === 'Delivered' && (
                                    <button
                                      onClick={() => openWriteReviewModal(item)}
                                      className="border border-brand-border text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand-cream text-[10px]"
                                    >
                                      Review Product
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Status Timeline */}
                            <div className="border-t border-brand-border/40 pt-4 mt-4 select-none">
                              <span className="block font-bold text-[10px] text-brand-muted uppercase tracking-wider mb-3">Delivery Status Timeline</span>
                              <div className="flex justify-between items-center text-[10px] font-bold text-brand-muted relative">
                                <div className="absolute left-0 right-0 h-1 bg-brand-border/40 top-3 -z-10"></div>
                                <div className={`absolute left-0 h-1 bg-brand-gold top-3 -z-10 transition-all`} style={{
                                  width: order.status === 'Delivered' ? '100%' :
                                         order.status === 'Out for Delivery' ? '75%' :
                                         order.status === 'Shipped' ? '50%' :
                                         order.status === 'Packed' ? '25%' : '0%'
                                }}></div>

                                <div className="flex flex-col items-center">
                                  <div className="w-7 h-7 rounded-full bg-brand-gold text-brand-cream flex items-center justify-center font-bold mb-1 shadow-xs border-2 border-brand-white">1</div>
                                  <span>Confirmed</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs border-2 border-brand-white ${['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-brand-gold text-brand-cream' : 'bg-brand-border/60 text-brand-muted'}`}>2</div>
                                  <span>Packed</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs border-2 border-brand-white ${['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-brand-gold text-brand-cream' : 'bg-brand-border/60 text-brand-muted'}`}>3</div>
                                  <span>Shipped</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs border-2 border-brand-white ${['Out for Delivery', 'Delivered'].includes(order.status) ? 'bg-brand-gold text-brand-cream' : 'bg-brand-border/60 text-brand-muted'}`}>4</div>
                                  <span>Out for Delivery</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold mb-1 shadow-xs border-2 border-brand-white ${order.status === 'Delivered' ? 'bg-emerald-600 text-brand-cream' : 'bg-brand-border/60 text-brand-muted'}`}>5</div>
                                  <span>Delivered</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Order Card Footer */}
                          <div className="bg-brand-white border-t border-brand-border/40 p-4 flex justify-between items-center flex-wrap gap-3">
                            <div className="flex items-center space-x-2 text-[10px] text-brand-muted font-sans font-medium">
                              <span>Payment Status: <strong className="text-brand-dark uppercase tracking-wider">{order.paymentStatus || 'Paid'}</strong></span>
                              <span>•</span>
                              <span>Method: <strong className="text-brand-dark uppercase">{order.paymentMethod}</strong></span>
                            </div>
                            <div className="flex items-center space-x-2 font-semibold">
                              <button onClick={() => handlePrintInvoice(order)} className="border border-brand-border text-brand-dark px-3 py-1.5 rounded-lg hover:bg-brand-cream">Download Invoice</button>
                              {['Placed', 'Processing', 'Packed'].includes(order.status) && (
                                <button onClick={() => handleCancelOrder(order._id)} className="bg-brand-crimson/5 border border-brand-crimson/20 text-brand-crimson px-3 py-1.5 rounded-lg hover:bg-brand-crimson hover:text-brand-cream">Cancel Order</button>
                              )}
                              {order.status === 'Delivered' && (
                                <button onClick={() => handleReturnOrder(order._id)} className="bg-brand-gold/10 border border-brand-gold/30 text-brand-gold px-3 py-1.5 rounded-lg hover:bg-brand-gold hover:text-brand-cream">Return Item</button>
                              )}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 italic">
                      <p className="text-brand-muted mb-4">You have not ordered any items yet.</p>
                      <Link to="/shop" className="bg-brand-crimson text-brand-cream px-6 py-2.5 rounded-xl font-bold hover:bg-brand-dark shadow-xs transition-colors">Start Shopping</Link>
                    </div>
                  )}
                </div>
              )}


              {/* ❤ WISHLIST GRID VIEW */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">My Wishlist ({wishlist.length})</h2>
                  
                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlist.map((prod) => {
                        const primaryImage = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200';
                        return (
                          <div key={prod._id} className="bg-white border border-brand-border/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between select-none">
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-cream border-b select-none">
                              <img src={primaryImage} alt={prod.name} className="w-full h-full object-cover object-top" />
                              <button
                                onClick={() => toggleWishlist(prod)}
                                className="absolute top-3 right-3 p-2 rounded-full bg-brand-white/90 text-brand-crimson hover:scale-105 shadow-sm"
                                aria-label="Remove wishlist"
                              >
                                <Trash2 size={13} />
                              </button>
                              {prod.originalPrice > prod.price && (
                                <span className="absolute top-3 left-3 bg-emerald-600 text-brand-cream text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">PRICE DROP</span>
                              )}
                            </div>

                            <div className="p-4 text-left flex flex-col justify-between flex-grow">
                              <div>
                                <h4 className="font-display font-bold text-brand-dark text-xs line-clamp-2 leading-snug">{prod.name}</h4>
                                <div className="mt-1.5 flex items-center space-x-2">
                                  <span className="font-sans font-bold text-brand-crimson text-xs">₹{(prod.price / 100).toFixed(0)}</span>
                                  {prod.originalPrice > prod.price && (
                                    <span className="font-sans text-[10px] text-brand-muted line-through">₹{(prod.originalPrice / 100).toFixed(0)}</span>
                                  )}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => handleMoveToCart(prod)}
                                className="w-full bg-brand-crimson hover:bg-brand-dark text-brand-cream py-2 rounded-xl mt-4 text-[10px] font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5 border border-brand-gold/25"
                              >
                                <ShoppingCart size={13} /> Move to Cart
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20 italic">
                      <p className="text-brand-muted mb-4">Your wishlist is empty. Save items you like while browsing!</p>
                      <Link to="/shop" className="bg-brand-crimson text-brand-cream px-6 py-2.5 rounded-xl font-bold hover:bg-brand-dark shadow-xs transition-colors">Browse Collection</Link>
                    </div>
                  )}
                </div>
              )}


              {/* 🛒 SAVED CART / SAVE FOR LATER VIEW */}
              {activeTab === 'saved-cart' && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">Saved for Later ({savedCart.length})</h2>
                  
                  {savedCart.length > 0 ? (
                    <div className="space-y-4">
                      {savedCart.map((item) => (
                        <div key={item._id} className="border border-brand-border/60 p-4 rounded-xl flex justify-between items-center gap-4 text-xs bg-white select-none">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-18 bg-brand-cream border rounded overflow-hidden shrink-0">
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-brand-dark text-xs leading-snug line-clamp-1 max-w-sm">{item.name}</h4>
                              <span className="block font-sans font-bold text-brand-crimson mt-1">₹{(item.price / 100).toLocaleString('en-IN')}</span>
                              <span className="block text-[9px] text-emerald-600 mt-0.5">In Stock</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 font-semibold">
                            <button
                              onClick={() => handleMoveSavedToCart(item)}
                              className="bg-brand-crimson hover:bg-brand-dark text-brand-cream px-3.5 py-2 rounded-xl text-2xs"
                            >
                              Move to Bag
                            </button>
                            <button
                              onClick={() => handleDeleteSaved(item._id)}
                              className="border border-brand-border hover:bg-brand-cream text-brand-muted px-3 py-2 rounded-xl text-2xs"
                              aria-label="Delete saved item"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 italic text-brand-muted">
                      <span>No items saved for later.</span>
                    </div>
                  )}
                </div>
              )}


              {/* 📍 ADDRESS BOOK VIEW */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3 border-brand-border/40">
                    <h2 className="font-display font-bold text-brand-dark text-lg">Saved Shipping Addresses</h2>
                    {!addressFormOpen && (
                      <button
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressForm({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
                          setAddressFormOpen(true);
                        }}
                        className="bg-brand-dark hover:bg-brand-crimson text-brand-cream text-2xs font-bold px-3 py-2 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors border border-brand-gold/30"
                      >
                        <Plus size={12} />
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {/* Add/Edit Address Form */}
                  {addressFormOpen && (
                    <form onSubmit={handleAddressSubmit} className="bg-brand-cream/10 border border-brand-border/50 p-6 rounded-xl space-y-4 font-sans text-xs select-none">
                      <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-2 mb-2">{editingAddressId ? 'Modify Address details' : 'Add New Shipping Card'}</h3>
                      
                      {addressError && <p className="text-brand-crimson font-bold">{addressError}</p>}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Full Name *</label>
                          <input type="text" value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Mobile Number *</label>
                          <input type="text" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Street Address *</label>
                          <input type="text" placeholder="House no, Building, Street name" value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium mb-2" />
                          <input type="text" placeholder="Locality, Area, Landmark (Optional)" value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">City *</label>
                          <input type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">State *</label>
                          <select value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium">
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Pincode *</label>
                          <input type="text" maxLength={6} value={addressForm.pincode} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div className="sm:col-span-2 flex items-center space-x-2 pt-2">
                          <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="rounded text-brand-crimson focus:ring-brand-crimson w-4 h-4" />
                          <label htmlFor="isDefault" className="text-[11px] font-semibold text-brand-dark">Set as default shipping address</label>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4 border-t border-brand-border/40 font-semibold">
                        <button type="submit" className="bg-brand-crimson text-brand-cream px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors shadow-2xs">Save Address</button>
                        <button type="button" onClick={() => setAddressFormOpen(false)} className="border border-brand-border text-brand-dark px-4 py-2.5 rounded-lg hover:bg-brand-cream transition-colors">Cancel</button>
                      </div>
                    </form>
                  )}

                  {/* Addresses Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {user.addresses?.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between ${
                          addr.isDefault ? 'border-brand-crimson bg-brand-crimson/5 ring-1 ring-brand-crimson' : 'border-brand-border bg-white'
                        } shadow-xs select-none`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-brand-dark text-xs sm:text-sm">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="bg-brand-gold text-brand-cream text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs uppercase tracking-wider font-display">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-2xs sm:text-xs text-brand-muted leading-relaxed font-sans mt-1">
                            {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                          <span className="block text-2xs font-semibold text-brand-dark mt-2.5 font-sans">Phone: {addr.phone}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-brand-border/40 pt-4 mt-5 text-2xs font-semibold text-brand-muted">
                          {!addr.isDefault ? (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="text-brand-crimson hover:underline"
                            >
                              Set Default
                            </button>
                          ) : <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Default</span>}
                          
                          <div className="flex space-x-3 text-brand-muted">
                            <button
                              onClick={() => handleEditAddressClick(addr)}
                              className="flex items-center space-x-0.5 hover:text-brand-crimson"
                            >
                              <Edit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await confirm(
                                  'Delete Address',
                                  'Are you sure you want to delete this address card? This action cannot be undone.',
                                  { confirmText: 'Delete', isDanger: true }
                                );
                                if (confirmed) {
                                  deleteAddress(addr._id).then(() => fetchProfile());
                                }
                              }}
                              className="flex items-center space-x-0.5 hover:text-brand-crimson text-brand-muted"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                    
                    {user.addresses?.length === 0 && !addressFormOpen && (
                      <p className="text-xs text-brand-muted italic py-4">No addresses saved yet. Click 'Add New Address' to insert shipping card details!</p>
                    )}
                  </div>
                </div>
              )}


              {/* 💳 PAYMENT METHODS VIEW */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3 border-brand-border/40">
                    <h2 className="font-display font-bold text-brand-dark text-lg">Saved Payment Options</h2>
                    {!paymentFormOpen && (
                      <button
                        onClick={() => setPaymentFormOpen(true)}
                        className="bg-brand-dark hover:bg-brand-crimson text-brand-cream text-2xs font-bold px-3 py-2 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors border border-brand-gold/30"
                      >
                        <Plus size={12} />
                        <span>Add Payment Mode</span>
                      </button>
                    )}
                  </div>

                  {paymentFormOpen && (
                    <form onSubmit={handleAddPayment} className="bg-brand-cream/10 border border-brand-border/50 p-6 rounded-xl space-y-4 font-sans text-xs select-none">
                      <h3 className="font-display font-bold text-brand-dark text-sm border-b pb-2 mb-2">Save Card or UPI Address</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Payment Type</label>
                          <select value={newPayment.type} onChange={e => setNewPayment({ ...newPayment, type: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium">
                            <option value="card">Credit / Debit Card</option>
                            <option value="upi">UPI ID (VPA)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">
                            {newPayment.type === 'card' ? 'Card Number (16 Digits) *' : 'UPI ID (e.g. user@okaxis) *'}
                          </label>
                          <input type="text" required value={newPayment.value} onChange={e => setNewPayment({ ...newPayment, value: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">
                            {newPayment.type === 'card' ? 'Cardholder Name *' : 'Owner Name *'}
                          </label>
                          <input type="text" required value={newPayment.name} onChange={e => setNewPayment({ ...newPayment, name: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        {newPayment.type === 'card' && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Expiry Date *</label>
                            <input type="text" placeholder="MM/YY" required value={newPayment.expiry} onChange={e => setNewPayment({ ...newPayment, expiry: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-3 pt-4 border-t border-brand-border/40 font-semibold">
                        <button type="submit" className="bg-brand-crimson text-brand-cream px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors shadow-2xs">Save details</button>
                        <button type="button" onClick={() => setPaymentFormOpen(false)} className="border border-brand-border text-brand-dark px-4 py-2.5 rounded-lg hover:bg-brand-cream transition-colors">Cancel</button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.savedPayments?.map((payment) => (
                      <div key={payment._id} className="border border-brand-border/60 p-4 rounded-xl flex justify-between items-center bg-white shadow-xs select-none">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 rounded-lg bg-brand-cream border text-brand-dark shrink-0">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <span className="block font-bold text-brand-dark text-xs">{payment.name}</span>
                            <span className="block text-[10px] font-mono text-brand-muted mt-0.5">{payment.maskedValue}</span>
                            {payment.expiry && <span className="block text-[9px] text-brand-muted font-sans mt-0.5">Expires: {payment.expiry}</span>}
                          </div>
                        </div>
                        <button onClick={() => handleDeletePayment(payment._id)} className="text-brand-crimson hover:bg-brand-cream/50 p-2 rounded-lg" aria-label="Delete Payment Method">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(!user.savedPayments || user.savedPayments.length === 0) && !paymentFormOpen && (
                      <p className="text-xs text-brand-muted italic py-4">No saved payments found. Add cards or UPI IDs for faster checkouts!</p>
                    )}
                  </div>
                </div>
              )}


              {/* 🎁 COUPONS VIEW */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">Available Discount Coupons</h2>
                  
                  {couponsLoading ? (
                    <div className="py-10 text-center text-brand-muted text-xs">Loading coupons...</div>
                  ) : coupons.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {coupons.map((coupon) => (
                        <div key={coupon._id} className="border border-brand-gold/30 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between select-none relative bg-brand-gold/5">
                          {/* Ticket tear-off border circles */}
                          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white border-r border-brand-gold/30 rounded-full transform -translate-y-1/2"></div>
                          <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white border-l border-brand-gold/30 rounded-full transform -translate-y-1/2"></div>

                          <div className="p-5 flex justify-between items-start gap-4">
                            <div className="space-y-2">
                              <span className="inline-block bg-brand-crimson text-brand-cream text-[10px] font-black px-2 py-0.5 rounded tracking-widest font-mono border border-brand-gold/20 shadow-2xs">{coupon.code}</span>
                              <h4 className="font-display font-bold text-brand-dark text-xs sm:text-sm mt-1">
                                {coupon.type === 'percentage' ? `${coupon.value}% OFF on ethnic wear` : `Flat ₹${(coupon.value / 100).toFixed(0)} Cashback`}
                              </h4>
                              <p className="text-[10px] text-brand-muted leading-relaxed font-sans">
                                Minimum order value of <strong>₹{(coupon.minOrderValue / 100).toFixed(0)}</strong> required. Valid until {new Date(coupon.validUntil).toLocaleDateString('en-IN')}.
                              </p>
                            </div>
                            <span className="text-brand-gold shrink-0 mt-1"><Percent size={20} /></span>
                          </div>
                          
                          <div className="bg-brand-white border-t border-brand-gold/20 p-3 px-5 text-[10px] font-bold text-brand-muted font-sans flex justify-between items-center">
                            <span>Valid Till: {new Date(coupon.validUntil).toLocaleDateString('en-IN')}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(coupon.code);
                                success('Copied!', `${coupon.code} code copied to clipboard.`);
                              }}
                              className="text-brand-crimson hover:underline"
                            >
                              Copy Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-muted italic py-4">No active coupons available at this moment. Stay tuned!</p>
                  )}
                </div>
              )}


              {/* 💰 WALLET VIEW */}
              {activeTab === 'wallet' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">My Shopping Wallet</h2>
                  </div>

                  {/* Wallet Balance widget */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-brand-dark border border-brand-gold/30 p-6 rounded-2xl text-brand-cream flex justify-between items-center relative overflow-hidden shadow-md select-none">
                      <div className="absolute -right-10 -bottom-10 bg-brand-gold/15 w-32 h-32 rounded-full"></div>
                      <div className="space-y-1 z-10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold font-display">Wallet Balance</span>
                        <div className="font-display font-bold text-2xl sm:text-3xl text-brand-cream">₹{(user.walletBalance / 100).toLocaleString('en-IN')}</div>
                        <span className="block text-[10px] text-brand-cream/70 font-sans">100% safe & faster checkouts</span>
                      </div>
                      <span className="text-brand-gold shrink-0 z-10"><Wallet size={36} /></span>
                    </div>

                    <div className="bg-white border border-brand-border/60 p-6 rounded-2xl text-brand-dark flex justify-between items-center relative overflow-hidden shadow-xs select-none">
                      <div className="absolute -right-10 -bottom-10 bg-brand-cream/30 w-32 h-32 rounded-full"></div>
                      <div className="space-y-1 z-10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted font-display">Refunded Cashback</span>
                        <div className="font-display font-bold text-2xl sm:text-3xl text-brand-crimson">₹{(user.cashbackBalance / 100).toLocaleString('en-IN')}</div>
                        <span className="block text-[10px] text-brand-muted font-sans">Usable automatically on order checkout</span>
                      </div>
                      <span className="text-brand-crimson/80 shrink-0 z-10"><Percent size={36} /></span>
                    </div>
                  </div>

                  {/* Transactions log */}
                  <div>
                    <h3 className="font-display font-bold text-brand-dark text-sm sm:text-base border-b pb-2 mb-4">Transaction History</h3>
                    {user.transactions && user.transactions.length > 0 ? (
                      <div className="space-y-3">
                        {user.transactions.map((tx) => (
                          <div key={tx._id || tx.createdAt} className="border border-brand-border/40 p-4 rounded-xl flex justify-between items-center gap-4 text-xs font-sans">
                            <div>
                              <span className="block font-bold text-brand-dark">{tx.description}</span>
                              <span className="block text-[9px] text-brand-muted mt-0.5">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span className={`font-bold text-xs shrink-0 ${tx.type === 'Credit' ? 'text-emerald-600' : 'text-brand-crimson'}`}>
                              {tx.type === 'Credit' ? '+' : '-'}₹{(tx.amountPaise / 100).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-brand-muted italic py-4">No wallet transactions found.</p>
                    )}
                  </div>
                </div>
              )}


              {/* 🔄 RETURNS & REFUNDS VIEW */}
              {activeTab === 'returns' && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">Returns & Refund Status</h2>
                  
                  {ordersLoading ? (
                    <div className="py-10 text-center text-brand-muted text-xs">Loading requests...</div>
                  ) : orders.filter(o => o.status === 'Returned').length > 0 ? (
                    <div className="space-y-4">
                      {orders.filter(o => o.status === 'Returned').map((order) => (
                        <div key={order._id} className="border border-brand-border/60 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 bg-brand-cream border rounded overflow-hidden shrink-0">
                              <img src={order.items?.[0]?.imageUrl || order.items?.[0]?.image} alt={order.items?.[0]?.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div>
                              <span className="block font-bold text-brand-dark text-2xs uppercase tracking-wider mb-0.5">Return Request for Order {order.orderId}</span>
                              <span className="block text-brand-muted text-[10px]">{new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span className="block text-[10px] text-brand-crimson mt-1 font-semibold">Refund Status: Wallet Credited • ₹{(order.pricing.grandTotal / 100).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider">Refund Processed</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 italic text-brand-muted">
                      <span>No return or refund requests found. Returns are available for up to 7 days after delivery.</span>
                    </div>
                  )}
                </div>
              )}


              {/* ⭐ REVIEWS VIEW */}
              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">Product Ratings & Reviews</h2>
                  </div>

                  {/* Products Awaiting Review */}
                  <div>
                    <h3 className="font-display font-bold text-brand-dark text-xs sm:text-sm uppercase tracking-wider mb-3">Awaiting Your Review</h3>
                    {productsAwaitingReview.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {productsAwaitingReview.map((prod) => (
                          <div key={prod._id} className="border border-brand-border/60 p-4 rounded-xl flex justify-between items-center gap-4 text-xs bg-white select-none">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-16 bg-brand-cream border rounded overflow-hidden shrink-0">
                                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover object-top" />
                              </div>
                              <h4 className="font-display font-bold text-brand-dark text-xs leading-snug line-clamp-2 max-w-[160px]">{prod.name}</h4>
                            </div>
                            <button
                              onClick={() => openWriteReviewModal(prod)}
                              className="bg-brand-dark text-brand-cream px-3 py-1.5 rounded-lg hover:bg-black font-semibold text-[10px] transition-colors"
                            >
                              Write Review
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xs text-brand-muted italic py-2">All your purchased items have been reviewed! Thank you for sharing your feedback.</p>
                    )}
                  </div>

                  {/* Submitted Reviews list */}
                  <div className="border-t border-brand-border/40 pt-6">
                    <h3 className="font-display font-bold text-brand-dark text-xs sm:text-sm uppercase tracking-wider mb-4">Your Submitted Reviews</h3>
                    {reviewsLoading ? (
                      <div className="py-10 text-center text-brand-muted text-xs">Loading reviews...</div>
                    ) : myReviews.length > 0 ? (
                      <div className="space-y-4">
                        {myReviews.map((review) => (
                          <div key={review._id} className="border border-brand-border/40 p-4 rounded-xl font-sans text-xs bg-white">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex space-x-3">
                                {review.product && (
                                  <div className="w-10 h-14 bg-brand-cream border rounded overflow-hidden shrink-0">
                                    <img src={review.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'} alt={review.product.name} className="w-full h-full object-cover object-top" />
                                  </div>
                                )}
                                <div>
                                  {review.product && <h4 className="font-display font-bold text-brand-dark text-xs line-clamp-1">{review.product.name}</h4>}
                                  <div className="flex items-center space-x-1 text-brand-gold font-bold mt-1">
                                    {Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                                    {Array.from({ length: 5 - review.rating }).map((_, i) => <Star key={i} size={12} className="text-brand-border" />)}
                                  </div>
                                  <p className="text-brand-dark mt-2 leading-relaxed italic">"{review.text}"</p>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                review.isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-brand-gold/5 text-brand-gold border-brand-gold/20'
                              }`}>{review.isApproved ? 'Approved' : 'Pending Moderation'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-brand-muted italic py-4">No reviews submitted yet.</p>
                    )}
                  </div>
                </div>
              )}


              {/* 🔔 NOTIFICATIONS VIEW */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">Notifications Alerts</h2>
                  <div className="space-y-4">
                    <div className="border border-brand-gold/30 p-4 rounded-xl flex gap-3 bg-brand-gold/5 text-xs select-none relative overflow-hidden">
                      <Gift size={16} className="text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-brand-dark">Exclusive Promo Code: 10% Off!</span>
                        <p className="text-brand-muted mt-1 font-sans">Use code <strong>SWASTIKA10</strong> at checkout to claim 10% off your next purchase. Valid for the next 7 days.</p>
                      </div>
                    </div>

                    <div className="border border-brand-border/60 p-4 rounded-xl flex gap-3 bg-white text-xs select-none">
                      <Sparkles size={16} className="text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-brand-dark">New Banarasi Silks Added!</span>
                        <p className="text-brand-muted mt-1 font-sans">We've added handpicked bridal Banarasi weaves to the boutique. Explore under Wedding Collection!</p>
                      </div>
                    </div>

                    <div className="border border-brand-border/60 p-4 rounded-xl flex gap-3 bg-white text-xs select-none">
                      <Bell size={16} className="text-brand-crimson shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-brand-dark">Order Dispatched</span>
                        <p className="text-brand-muted mt-1 font-sans">Your recent order SS-10009 has been shipped and is on its way. Track it under Orders tab.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* ⚙ ACCOUNT SETTINGS VIEW */}
              {activeTab === 'settings' && (
                <div className="space-y-8 select-none">
                  
                  {/* Profile Edit details */}
                  <div>
                    <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40 mb-5">Edit Profile Details</h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-4 font-sans text-xs max-w-2xl">
                      {profileSuccess && <p className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-1.5"><CheckCircle2 size={14} /> {profileSuccess}</p>}
                      {profileError && <p className="text-brand-crimson font-bold bg-brand-crimson/5 border border-brand-crimson/20 p-3 rounded-lg flex items-center gap-1.5"><AlertCircle size={14} /> {profileError}</p>}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Full Name</label>
                          <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Mobile Number</label>
                          <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Date of Birth</label>
                          <input type="date" value={profileDob} onChange={e => setProfileDob(e.target.value)} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Gender</label>
                          <select value={profileGender} onChange={e => setProfileGender(e.target.value)} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium">
                            <option value="">Select Gender</option>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 select-none">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-2">Notification Preferences</span>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="newsPref" checked={newsletterPref} onChange={e => setNewsletterPref(e.target.checked)} className="rounded text-brand-crimson focus:ring-brand-crimson w-4 h-4" />
                          <label htmlFor="newsPref" className="text-[11px] font-semibold text-brand-dark">Receive email notifications on seasonal offers & new arrivals</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="waPref" checked={whatsappPref} onChange={e => setWhatsappPref(e.target.checked)} className="rounded text-brand-crimson focus:ring-brand-crimson w-4 h-4" />
                          <label htmlFor="waPref" className="text-[11px] font-semibold text-brand-dark">Receive instant WhatsApp order delivery alerts & invoice receipts</label>
                        </div>
                      </div>

                      <button type="submit" className="bg-brand-crimson text-brand-cream px-6 py-2.5 rounded-xl font-bold shadow-2xs hover:bg-brand-dark transition-colors inline-block mt-4 border border-brand-gold/30">Save Profile Settings</button>
                    </form>
                  </div>

                  {/* Change Password */}
                  <div className="border-t border-brand-border/40 pt-6">
                    <h3 className="font-display font-bold text-brand-dark text-sm mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 font-sans text-xs max-w-lg">
                      {passwordSuccess && <p className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-1.5"><CheckCircle2 size={14} /> {passwordSuccess}</p>}
                      {passwordError && <p className="text-brand-crimson font-bold bg-brand-crimson/5 border border-brand-crimson/20 p-3 rounded-lg flex items-center gap-1.5"><AlertCircle size={14} /> {passwordError}</p>}
                      
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Current Password</label>
                        <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">New Password</label>
                        <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Confirm New Password</label>
                        <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="w-full bg-brand-white border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium" />
                      </div>
                      <button type="submit" className="bg-brand-dark text-brand-cream px-5 py-2.5 rounded-xl font-bold shadow-2xs hover:bg-black transition-colors inline-block mt-2">Change Password</button>
                    </form>
                  </div>

                  {/* Danger Zone: Delete Account */}
                  <div className="border-t border-red-200/60 pt-6">
                    <h3 className="font-display font-bold text-red-700 text-sm mb-2">Danger Zone</h3>
                    <p className="text-[11px] text-brand-muted mb-4 font-sans leading-relaxed">Deleting your account is permanent. It removes all address configurations, order transaction records, wallet balances, and settings.</p>
                    <button type="button" onClick={handleDeleteAccount} className="bg-brand-crimson text-brand-cream px-5 py-2.5 rounded-xl font-bold shadow-xs hover:bg-red-800 transition-colors">Delete Account Permanently</button>
                  </div>

                </div>
              )}

            </motion.div>
            </AnimatePresence>

          </main>

        </div>

      </div>

      {/* ──────────────────────────────────────────────────
          MODAL: WRITE PRODUCT REVIEW
          ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {reviewModalOpen && reviewProduct && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden touch-none select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewModalOpen(false)}
              className="absolute inset-0 bg-black"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-brand-border/60 rounded-2xl max-w-md w-full shadow-2xl p-6 relative z-10 text-left"
            >
              <h3 className="font-display font-bold text-brand-dark text-lg border-b pb-3 mb-4 flex items-center gap-1.5"><Star size={18} className="text-brand-gold fill-current" /> Rate & Review Product</h3>
              
              <div className="flex space-x-3 mb-4">
                <div className="w-10 h-12 bg-brand-cream border rounded overflow-hidden shrink-0">
                  <img src={reviewProduct.imageUrl || reviewProduct.image} alt={reviewProduct.name} className="w-full h-full object-cover object-top" />
                </div>
                <span className="font-display font-semibold text-brand-dark text-xs line-clamp-2 leading-snug">{reviewProduct.name}</span>
              </div>

              <form onSubmit={submitProductReview} className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Rating *</label>
                  <div className="flex items-center space-x-2 text-brand-gold">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const starIdx = idx + 1;
                      const active = starIdx <= reviewForm.rating;
                      return (
                        <button
                          key={starIdx}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: starIdx })}
                          className="hover:scale-110 active:scale-95 transition-transform"
                          aria-label={`Rate ${starIdx} Star`}
                        >
                          <Star size={24} className={active ? 'fill-current' : 'text-brand-border'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-muted mb-1 block">Review Comment *</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Tell us what you love or how we can improve this product. Share your fit, fabrics, or styling thoughts!"
                    className="w-full bg-brand-cream border border-brand-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark font-medium"
                  />
                </div>

                <div className="flex space-x-3 pt-3 border-t border-brand-border/40 font-semibold">
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-brand-crimson text-brand-cream px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors shadow-2xs disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="border border-brand-border text-brand-dark px-4 py-2.5 rounded-lg hover:bg-brand-cream transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
