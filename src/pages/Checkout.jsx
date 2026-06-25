import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ShoppingBag, CreditCard, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Puducherry", "Ladakh"
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, appliedCoupon, getSubtotal, getCouponDiscount, getShippingCharge, getTotal, clearCart } = useCartStore();
  const { user, token, addAddress } = useAuthStore();

  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState(null);
  
  const getExpectedDeliveryDateString = (daysGap = 7) => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + Number(daysGap));
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Address Form State
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Load configuration settings
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error(err));

    // Redirect to home if cart is empty
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Load user profile details if logged in
  useEffect(() => {
    if (user) {
      setAddress({
        name: user.fullName || '',
        phone: user.phone || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: ''
      });
      // Pick default address if available
      const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      }
    }
  }, [user]);

  // Auto-fill state/city using Indian Postal Pincode API
  const handlePincodeChange = async (e) => {
    const pin = e.target.value.replace(/[^0-9]/g, '');
    setAddress(prev => ({ ...prev, pincode: pin }));

    if (pin.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        
        if (data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setAddress(prev => ({
            ...prev,
            city: postOffice.Block || postOffice.District,
            state: postOffice.State
          }));
          setAddressError('');
        }
      } catch (err) {
        console.error('Pincode lookup error:', err);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const validateAddressStep = () => {
    setAddressError('');

    // If using user's saved address
    if (user && selectedAddressId) {
      const selected = user.addresses.find(a => a._id === selectedAddressId);
      if (!selected) {
        setAddressError('Please select a valid address card.');
        return false;
      }
      
      // Check serviceable block
      const nonServiceableList = settings?.nonServiceablePincodes || [];
      if (nonServiceableList.includes(selected.pincode)) {
        setAddressError(`Sorry, our delivery partner does not service pincode ${selected.pincode} currently.`);
        return false;
      }
      return true;
    }

    // Validate manual form fields
    const { name, phone, line1, city, state, pincode } = address;
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      setAddressError('All required shipping fields must be completed.');
      return false;
    }
    if (pincode.length !== 6 || isNaN(pincode)) {
      setAddressError('Pincode must be exactly 6 digits.');
      return false;
    }
    if (phone.length < 10) {
      setAddressError('Enter a valid 10-digit phone number.');
      return false;
    }

    const nonServiceableList = settings?.nonServiceablePincodes || [];
    if (nonServiceableList.includes(pincode)) {
      setAddressError(`Sorry, our delivery partner does not service pincode ${pincode} currently.`);
      return false;
    }

    return true;
  };

  const handleProceedToReview = async () => {
    if (validateAddressStep()) {
      if (user && selectedAddressId === null) {
        const isDuplicate = user.addresses?.some(
          a => a.name === address.name &&
               a.phone === address.phone &&
               a.line1 === address.line1 &&
               a.line2 === address.line2 &&
               a.city === address.city &&
               a.state === address.state &&
               a.pincode === address.pincode
        );

        if (!isDuplicate) {
          try {
            await addAddress(address);
          } catch (err) {
            console.error("Failed to auto-save address:", err);
          }
        }
      }
      setStep(2);
    }
  };

  const getShippingAddress = () => {
    if (user && selectedAddressId) {
      const selected = user.addresses.find(a => a._id === selectedAddressId);
      return {
        name: selected.name,
        phone: selected.phone,
        line1: selected.line1,
        line2: selected.line2,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode
      };
    }
    return address;
  };

  // Pricing math calculations
  const subtotal = getSubtotal();
  const couponDiscount = getCouponDiscount();
  const shippingCharge = getShippingCharge();
  const isCOD = paymentMethod === 'cod';
  const grandTotal = getTotal(isCOD);

  // Initialize Razorpay modal payments
  const handlePayment = async () => {
    setProcessingOrder(true);
    setOrderError('');

    const shippingAddress = getShippingAddress();

    if (paymentMethod === 'cod') {
      // 1. Process Cash On Delivery Immediately
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cartItems: cart,
            shippingAddress,
            pricing: {
              subtotal,
              discount: 0,
              couponDiscount,
              shippingCharge: shippingCharge + (settings?.codExtraCharge ? settings.codExtraCharge / 100 : 50),
              total: grandTotal
            },
            couponApplied: appliedCoupon?.code || null,
            paymentMethod: 'cod',
            userId: user?.id || null
          })
        });

        const data = await response.json();
        if (response.ok) {
          clearCart();
          navigate(`/order-success/${data.orderId}`);
        } else {
          throw new Error(data.error || 'Failed to submit order.');
        }
      } catch (err) {
        setOrderError(err.message);
      } finally {
        setProcessingOrder(false);
      }
      return;
    }

    // 2. Process Razorpay Payment Flow
    try {
      // Call backend to create Razorpay Order
      const res = await fetch('/api/orders/razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amountINR: grandTotal })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Razorpay order initiation failed.');

      // Check if sandbox mock order returned
      if (orderData.isMock) {
        // Simulate a secure payment popup delay
        setTimeout(async () => {
          try {
            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                cartItems: cart,
                shippingAddress,
                pricing: {
                  subtotal,
                  discount: 0,
                  couponDiscount,
                  shippingCharge,
                  total: grandTotal
                },
                couponApplied: appliedCoupon?.code || null,
                paymentMethod: 'razorpay',
                razorpayOrderId: orderData.id,
                razorpayPaymentId: `pay_mock_${crypto.randomUUID().slice(0, 12)}`,
                userId: user?.id || null
              })
            });

            const dbData = await response.json();
            if (response.ok) {
              clearCart();
              navigate(`/order-success/${dbData.orderId}`);
            } else {
              throw new Error(dbData.error || 'Database submission failed');
            }
          } catch (err) {
            setOrderError(err.message);
          } finally {
            setProcessingOrder(false);
          }
        }, 1500);
        return;
      }

      // Launch Real Razorpay modal using dynamic script loading
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const options = {
          key: settings?.razorpayKeyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Swastika Sarees',
          description: 'Payment for luxury Indian ethnic wear',
          order_id: orderData.id,
          handler: async (paymentRes) => {
            try {
              const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  cartItems: cart,
                  shippingAddress,
                  pricing: {
                    subtotal,
                    discount: 0,
                    couponDiscount,
                    shippingCharge,
                    total: grandTotal
                  },
                  couponApplied: appliedCoupon?.code || null,
                  paymentMethod: 'razorpay',
                  razorpayOrderId: paymentRes.razorpay_order_id,
                  razorpayPaymentId: paymentRes.razorpay_payment_id,
                  razorpaySignature: paymentRes.razorpay_signature,
                  userId: user?.id || null
                })
              });

              const dbData = await response.json();
              if (response.ok) {
                clearCart();
                navigate(`/order-success/${dbData.orderId}`);
              } else {
                throw new Error(dbData.error || 'Failed to sync checkout database order');
              }
            } catch (err) {
              setOrderError(err.message);
            } finally {
              setProcessingOrder(false);
            }
          },
          prefill: {
            name: shippingAddress.name,
            contact: shippingAddress.phone,
            email: user?.email || ''
          },
          theme: {
            color: '#8B1A1A'
          },
          modal: {
            ondismiss: () => {
              setProcessingOrder(false);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);

    } catch (err) {
      setOrderError(err.message);
      setProcessingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left select-none">
      
      {/* Step Progress Indicators */}
      <div className="flex justify-center mb-10 items-center space-x-4 max-w-xl mx-auto border-b border-brand-border/30 pb-6">
        <div className="flex items-center space-x-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans ${step >= 1 ? 'bg-brand-crimson text-brand-cream' : 'bg-brand-cream border text-brand-dark'}`}>1</span>
          <span className="text-xs font-semibold text-brand-dark">Address</span>
        </div>
        <div className="w-10 h-0.5 bg-brand-border" />
        <div className="flex items-center space-x-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans ${step >= 2 ? 'bg-brand-crimson text-brand-cream' : 'bg-brand-cream border text-brand-dark'}`}>2</span>
          <span className="text-xs font-semibold text-brand-dark">Review</span>
        </div>
        <div className="w-10 h-0.5 bg-brand-border" />
        <div className="flex items-center space-x-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans ${step === 3 ? 'bg-brand-crimson text-brand-cream' : 'bg-brand-cream border text-brand-dark'}`}>3</span>
          <span className="text-xs font-semibold text-brand-dark">Payment</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side forms */}
        <div className="flex-1">
          
          {/* STEP 1: Delivery Address */}
          {step === 1 && (
            <div className="bg-brand-white border border-brand-border/40 p-6 rounded-2xl shadow-xs space-y-6">
              <h2 className="font-display font-bold text-brand-dark text-xl flex items-center space-x-2 border-b pb-3 border-brand-border/40">
                <Truck size={20} className="text-brand-gold shrink-0 mt-0.5" />
                <span>Shipping Address</span>
              </h2>

              {/* Logged in address card list */}
              {user && user.addresses?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <button
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-brand-crimson bg-brand-crimson/5 ring-1 ring-brand-crimson'
                          : 'border-brand-border hover:border-brand-crimson bg-brand-white'
                      }`}
                    >
                      <span className="block font-bold text-xs sm:text-sm text-brand-dark mb-1">{addr.name}</span>
                      <p className="text-2xs sm:text-xs text-brand-muted leading-relaxed font-sans">
                        {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <span className="block text-2xs font-semibold text-brand-dark mt-2 font-sans">Phone: {addr.phone}</span>
                    </button>
                  ))}
                  
                  {/* Select custom form toggle */}
                  <button
                    onClick={() => setSelectedAddressId(null)}
                    className={`text-left p-4 rounded-xl border flex flex-col items-center justify-center font-semibold text-xs transition-all ${
                      selectedAddressId === null
                        ? 'border-brand-crimson bg-brand-crimson/5'
                        : 'border-dashed border-brand-border hover:border-brand-crimson bg-brand-cream/35'
                    }`}
                  >
                    <span>➕ Add / Use New Address</span>
                  </button>
                </div>
              )}

              {/* Manual Form fields */}
              {(selectedAddressId === null || !user) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                  <div className="flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      placeholder="Enter receiver's name"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/[^0-9]/g, '') })}
                      className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">Address Line 1 (House No, Building, Street) *</label>
                    <input
                      type="text"
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      placeholder="Flat, House no., Building, Company, Apartment"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">Address Line 2 (Area, Landmark, Colony) *</label>
                    <input
                      type="text"
                      value={address.line2}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      placeholder="Area, Colony, Street, Sector, Village, Landmark"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={address.pincode}
                      onChange={handlePincodeChange}
                      className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold font-bold text-sm tracking-widest text-center"
                      placeholder="6-digit Pincode"
                    />
                    {pincodeLoading && <span className="text-[10px] text-brand-gold mt-1">Fetching City & State...</span>}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">City / District *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                      placeholder="City/Town"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-brand-dark mb-1">State *</label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                    >
                      <option value="">Select Indian State</option>
                      {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {addressError && (
                <div className="bg-red-50 border border-brand-crimson/25 p-3 rounded-lg flex items-center space-x-2 text-2xs font-semibold text-brand-crimson font-sans select-none">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              <button
                onClick={handleProceedToReview}
                className="w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-3 rounded-lg font-semibold transition-colors border border-brand-gold/30 shadow-md"
              >
                Proceed to Review Order
              </button>

            </div>
          )}

          {/* STEP 2: Order Review */}
          {step === 2 && (
            <div className="bg-brand-white border border-brand-border/40 p-6 rounded-2xl shadow-xs space-y-6">
              <h2 className="font-display font-bold text-brand-dark text-xl flex items-center space-x-2 border-b pb-3 border-brand-border/40">
                <ShoppingBag size={20} className="text-brand-gold shrink-0 mt-0.5" />
                <span>Review Order Details</span>
              </h2>

              {/* Shipping address recap */}
              <div className="p-4 bg-brand-cream rounded-xl border border-brand-border/40 font-sans text-xs">
                <span className="block font-bold text-brand-dark uppercase tracking-wider text-2xs text-brand-gold mb-1.5">Deliver To:</span>
                <span className="block font-bold text-brand-dark">{getShippingAddress().name}</span>
                <p className="text-brand-muted leading-relaxed mt-0.5">
                  {getShippingAddress().line1}, {getShippingAddress().line2 ? `${getShippingAddress().line2}, ` : ''}{getShippingAddress().city}, {getShippingAddress().state} - <strong>{getShippingAddress().pincode}</strong>
                </p>
                <span className="block font-semibold text-brand-dark mt-2">Phone: {getShippingAddress().phone}</span>
              </div>

              {/* Items Summary list */}
              <div className="divide-y divide-brand-border/40 border border-brand-border/40 rounded-xl overflow-hidden">
                {cart.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-16 object-cover object-top border rounded" />
                    <div className="flex-grow text-left">
                      <span className="font-display font-semibold text-brand-dark text-xs sm:text-sm line-clamp-1">{item.name}</span>
                      <span className="block text-[10px] text-brand-muted font-sans mt-0.5">Qty: {item.quantity} {item.color ? `| Color: ${item.color}` : ''} {item.size ? `| Size: ${item.size}` : ''}</span>
                    </div>
                    <span className="font-sans font-bold text-brand-dark text-xs sm:text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-brand-white hover:bg-brand-cream border border-brand-border text-brand-dark py-3 rounded-lg font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-brand-crimson hover:bg-brand-muted text-brand-cream py-3 rounded-lg font-semibold transition-colors border border-brand-gold/30 shadow-md"
                >
                  Proceed to Payment
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Secure Payment options */}
          {step === 3 && (
            <div className="bg-brand-white border border-brand-border/40 p-6 rounded-2xl shadow-xs space-y-6">
              <h2 className="font-display font-bold text-brand-dark text-xl flex items-center space-x-2 border-b pb-3 border-brand-border/40">
                <CreditCard size={20} className="text-brand-gold shrink-0 mt-0.5" />
                <span>Select Payment Method</span>
              </h2>

              <div className="space-y-3 font-sans text-xs">
                
                {/* Razorpay Option */}
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-brand-crimson bg-brand-crimson/5 ring-1 ring-brand-crimson'
                      : 'border-brand-border bg-brand-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-brand-crimson/10 text-brand-crimson rounded-full"><CreditCard size={18} /></span>
                    <div>
                      <span className="block font-bold text-brand-dark text-xs sm:text-sm">Online Payment (Razorpay)</span>
                      <p className="text-2xs text-brand-muted leading-tight mt-0.5">Pay securely using UPI, Credit/Debit cards, Net Banking, or Mobile Wallets.</p>
                    </div>
                  </div>
                  {paymentMethod === 'razorpay' && <CheckCircle2 className="text-brand-crimson shrink-0" size={18} />}
                </button>

                {/* Cash On Delivery Option */}
                {settings?.codEnabled !== false && (
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-brand-crimson bg-brand-crimson/5 ring-1 ring-brand-crimson'
                        : 'border-brand-border bg-brand-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-brand-gold/10 text-brand-gold rounded-full"><Truck size={18} /></span>
                      <div>
                        <span className="block font-bold text-brand-dark text-xs sm:text-sm">Cash on Delivery (COD)</span>
                        <p className="text-2xs text-brand-muted leading-tight mt-0.5">Pay cash when courier arrives. Flat ₹{settings?.codExtraCharge ? (settings.codExtraCharge / 100).toFixed(0) : '50'} processing charge.</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <CheckCircle2 className="text-brand-crimson shrink-0" size={18} />}
                  </button>
                )}

              </div>

              {orderError && (
                <div className="bg-red-50 border border-brand-crimson/25 p-3 rounded-lg flex items-center space-x-2 text-2xs font-semibold text-brand-crimson font-sans">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}



              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-brand-white hover:bg-brand-cream border border-brand-border text-brand-dark py-3 rounded-lg font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processingOrder}
                  className="flex-1 bg-brand-crimson hover:bg-brand-muted disabled:bg-brand-muted/20 text-brand-cream py-3 rounded-lg font-semibold transition-colors border border-brand-gold/30 disabled:border-none shadow-md flex items-center justify-center space-x-2"
                >
                  <span>{processingOrder ? 'Processing Payment...' : paymentMethod === 'cod' ? 'Confirm COD Order' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Side Order calculations */}
        <div className="w-full lg:w-96 select-none bg-brand-white border border-brand-border p-6 rounded-2xl shadow-xs self-start">
          <h3 className="font-display font-bold text-brand-dark text-lg border-b border-brand-border/60 pb-3 mb-4">
            Cart Total
          </h3>

          <div className="space-y-3 font-sans text-xs border-b border-brand-border/60 pb-4 mb-4 text-brand-muted">
            <div className="flex justify-between">
              <span>Bag Subtotal:</span>
              <span className="text-brand-dark font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({appliedCoupon?.code}):</span>
                <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="text-brand-dark font-semibold">
                {shippingCharge > 0 ? `₹${shippingCharge.toLocaleString('en-IN')}` : 'FREE'}
              </span>
            </div>

            {/* Extra COD Charges */}
            {paymentMethod === 'cod' && (
              <div className="flex justify-between text-brand-gold font-semibold">
                <span>COD Handling Charge:</span>
                <span>₹{settings?.codExtraCharge ? (settings.codExtraCharge / 100).toFixed(0) : '50'}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-base font-bold text-brand-dark">
            <span>Amount Payable:</span>
            <span className="text-brand-crimson text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-brand-border/60 text-xs font-sans text-brand-dark">
            <span className="block font-semibold text-brand-muted uppercase text-[10px] tracking-wider mb-1 font-display">Expected Delivery Date</span>
            <div className="flex items-center space-x-1.5 text-brand-crimson font-bold">
              <span>{getExpectedDeliveryDateString(settings?.deliveryDays || 7)}</span>
            </div>
            <span className="text-[10px] text-brand-muted mt-0.5 block">Estimated based on standard transit time</span>
          </div>
        </div>

      </div>

    </div>
  );
}
