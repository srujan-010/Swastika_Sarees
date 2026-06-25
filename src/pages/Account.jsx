import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, MapPin, Heart, LogOut, ShieldAlert, Plus, Trash2, Edit } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Puducherry"
];

export default function Account() {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile, addAddress, deleteAddress, updateAddress, fetchProfile } = useAuthStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'addresses' | 'wishlist'
  
  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Address Form States
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/account');
      return;
    }
    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (user) {
      setProfileName(user.fullName || '');
      setProfilePhone(user.phone || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    const ok = await updateProfile(profileName, profilePhone);
    if (ok) {
      setProfileSuccess('Profile updated successfully!');
    }
  };

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
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      fetchProfile();
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

  const handleMoveToCart = (prod) => {
    // Add default variant choice
    const defaultVariant = prod.variants?.[0];
    addItem({
      product: prod._id,
      slug: prod.slug,
      name: prod.name,
      price: prod.price / 100, // convert paise to INR
      quantity: 1,
      color: defaultVariant?.colorName || null,
      size: defaultVariant?.size || null,
      imageUrl: prod.images?.[0]?.url,
      stock: prod.stock
    });
    toggleWishlist(prod);
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left select-none">
      <h1 className="font-display font-bold text-brand-dark text-2xl sm:text-3xl mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 bg-brand-white border border-brand-border p-5 rounded-2xl h-fit space-y-2">
          
          <div className="border-b border-brand-border/60 pb-4 mb-4 text-center md:text-left">
            <span className="block font-display font-bold text-brand-dark text-lg">{user.fullName || 'Valued Customer'}</span>
            <span className="text-2xs text-brand-muted font-sans mt-0.5 block">{user.email}</span>
            {user.role === 'admin' && (
              <span className="mt-2 inline-block bg-brand-gold/10 text-brand-gold text-[10px] font-bold px-2 py-0.5 rounded border border-brand-gold/30">
                Boutique Admin
              </span>
            )}
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-brand-crimson text-brand-cream' : 'text-brand-dark hover:bg-brand-cream hover:text-brand-crimson'
            }`}
          >
            <User size={16} />
            <span>Profile Details</span>
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
              activeTab === 'addresses' ? 'bg-brand-crimson text-brand-cream' : 'text-brand-dark hover:bg-brand-cream hover:text-brand-crimson'
            }`}
          >
            <MapPin size={16} />
            <span>Addresses Book</span>
          </button>
          
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold transition-all ${
              activeTab === 'wishlist' ? 'bg-brand-crimson text-brand-cream' : 'text-brand-dark hover:bg-brand-cream hover:text-brand-crimson'
            }`}
          >
            <Heart size={16} />
            <span>My Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 text-sm font-semibold text-brand-crimson border-t border-brand-border/40 hover:bg-brand-cream"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </aside>

        {/* Tab content panel */}
        <div className="flex-1 bg-brand-white border border-brand-border p-6 rounded-2xl shadow-xs">
          
          {/* TAB 1: Profile Details */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">Profile Settings</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md font-sans text-xs">
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-brand-cream border border-brand-border/40 text-brand-muted px-3 py-2.5 rounded-md cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold text-brand-dark mb-1">Contact Phone</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="bg-brand-cream border border-brand-border text-brand-dark px-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    placeholder="10-digit mobile number"
                  />
                </div>
                
                {profileSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold">{profileSuccess}</p>
                )}

                <button
                  type="submit"
                  className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-6 py-2.5 rounded-lg font-semibold transition-colors border border-brand-gold/30 shadow-xs"
                >
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Addresses Book */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3 border-brand-border/40">
                <h2 className="font-display font-bold text-brand-dark text-lg">My Addresses</h2>
                {!addressFormOpen && (
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressForm({
                        name: user.fullName || '',
                        phone: user.phone || '',
                        line1: '',
                        line2: '',
                        city: '',
                        state: '',
                        pincode: '',
                        isDefault: false
                      });
                      setAddressFormOpen(true);
                    }}
                    className="flex items-center space-x-1 bg-brand-crimson hover:bg-brand-muted text-brand-cream text-2xs font-semibold px-3 py-1.5 rounded-md border border-brand-gold/30 shadow-sm transition-all"
                  >
                    <Plus size={12} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Address Edit/Add Form Overlay */}
              {addressFormOpen && (
                <form onSubmit={handleAddressSubmit} className="bg-brand-cream/35 border border-brand-border p-5 rounded-2xl space-y-4 max-w-xl font-sans text-xs">
                  <h3 className="font-display font-semibold text-brand-dark text-sm">{editingAddressId ? 'Edit Address' : 'New Address Details'}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">Receiver Name *</label>
                      <input
                        type="text"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="bg-brand-white border border-brand-border px-3 py-2 rounded-md focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">Phone Number *</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                        className="bg-brand-white border border-brand-border px-3 py-2 rounded-md focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">Address line 1 *</label>
                      <input
                        type="text"
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="bg-brand-white border border-brand-border px-3 py-2 rounded-md focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">Address line 2</label>
                      <input
                        type="text"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                        className="bg-brand-white border border-brand-border px-3 py-2 rounded-md focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/[^0-9]/g, '') })}
                        className="bg-brand-white border border-brand-border px-3 py-2 rounded-md focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">City *</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="bg-brand-white border border-brand-border px-3 py-2 rounded-md focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-semibold text-brand-dark mb-1">State *</label>
                      <select
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="bg-brand-white border border-brand-border px-3 py-2 rounded-md focus:outline-none cursor-pointer"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    
                    <div className="sm:col-span-2 flex items-center mt-2">
                      <label className="flex items-center space-x-2.5 cursor-pointer font-sans text-xs text-brand-dark font-medium">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                          className="rounded text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                        />
                        <span>Set as Default Delivery Address</span>
                      </label>
                    </div>
                  </div>

                  {addressError && (
                    <div className="bg-red-50 border border-brand-crimson/25 p-3 rounded-lg flex items-center space-x-2 text-2xs font-semibold text-brand-crimson font-sans">
                      <ShieldAlert size={14} />
                      <span>{addressError}</span>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-5 py-2 rounded-lg font-semibold transition-colors border border-brand-gold/30 shadow-xs"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddressFormOpen(false);
                        setEditingAddressId(null);
                      }}
                      className="bg-brand-white border border-brand-border text-brand-dark px-5 py-2 rounded-lg font-semibold transition-colors hover:bg-brand-cream"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses?.map((addr) => (
                  <div
                    key={addr._id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${
                      addr.isDefault ? 'border-brand-crimson bg-brand-crimson/5 ring-1 ring-brand-crimson' : 'border-brand-border bg-brand-white'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-brand-dark text-xs sm:text-sm">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="bg-brand-gold text-brand-cream text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-2xs sm:text-xs text-brand-muted leading-relaxed font-sans mt-1">
                        {addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <span className="block text-2xs font-semibold text-brand-dark mt-2 font-sans">Phone: {addr.phone}</span>
                    </div>
                    
                    <div className="flex justify-end space-x-3 border-t border-brand-border/40 pt-3 mt-4 text-2xs font-semibold text-brand-muted">
                      <button
                        onClick={() => handleEditAddressClick(addr)}
                        className="flex items-center space-x-0.5 hover:text-brand-crimson"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this address card?')) {
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
                ))}
                
                {user.addresses?.length === 0 && !addressFormOpen && (
                  <p className="text-xs text-brand-muted italic py-4">No addresses saved yet. Click 'Add New' to insert shipping card details!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Wishlist Grid */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-brand-dark text-lg border-b pb-3 border-brand-border/40">My Wishlist</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {wishlist.map((prod) => {
                  const primaryImage = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200';
                  return (
                    <div
                      key={prod._id}
                      className="bg-brand-white border border-brand-border/45 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-cream border-b select-none">
                        <img src={primaryImage} alt={prod.name} className="w-full h-full object-cover object-top" />
                        <button
                          onClick={() => toggleWishlist(prod)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-brand-white/90 text-brand-crimson hover:scale-105 shadow-sm"
                          aria-label="Remove wishlist"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="p-3 text-left flex flex-col justify-between flex-grow">
                        <div>
                          <h4 className="font-display font-semibold text-brand-dark text-xs line-clamp-2 leading-snug">{prod.name}</h4>
                          <span className="block font-sans font-bold text-brand-crimson text-xs mt-1.5">₹{(prod.price / 100).toFixed(0)}</span>
                        </div>
                        
                        <button
                          onClick={() => handleMoveToCart(prod)}
                          className="w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-1.5 rounded mt-3 text-2xs font-semibold border border-brand-gold/30 shadow-2xs transition-colors"
                        >
                          Move to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {wishlist.length === 0 && (
                <div className="text-center py-10 italic text-brand-muted text-xs">
                  <span>Your wishlist is empty. Tap the heart icons on product cards to save items!</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
