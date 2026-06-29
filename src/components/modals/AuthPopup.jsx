import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useModalStore } from '../../store/modalStore';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, Check, Heart, Package, Zap, Gift, Shield, Star, Truck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const IconComponent = ({ name, size = 16, className = '' }) => {
  const icons = { Heart, Package, Zap, Gift, Shield, Star: CheckCircle2, Truck: Zap, CheckCircle2 };
  const Icon = icons[name] || Heart;
  return <Icon size={size} className={className} />;
};

export default function AuthPopup() {
  const { user, login, signUp, loginWithGoogle } = useAuthStore();
  const { success } = useModalStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [settings, setSettings] = useState(null);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [whatsappOffers, setWhatsappOffers] = useState(true);
  const [newsletter, setNewsletter] = useState(true);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Password Strength simple calc
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 5) score += 33;
    if (password.match(/[A-Z]/) && password.match(/[a-z]/)) score += 33;
    if (password.match(/[^A-Za-z0-9]/) || password.match(/[0-9]/)) score += 34;
    return score;
  };

  useEffect(() => {
    // Fetch settings first
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/popup');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load popup settings');
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings) return; // Wait for settings

    if (settings.display?.isEnabled === false) return; // Globally disabled
    if (settings.display?.showOnlyForGuest && user) return; // Only for guests
    if (user && settings.display?.hideAfterLogin) return; // Logged in, and should hide

    // Check session storage
    if (settings.display?.showOncePerSession && sessionStorage.getItem('auth_popup_seen')) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, settings.display?.delayMs || 0);

    return () => clearTimeout(timer);
  }, [user, settings]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('auth_popup_seen', 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'signin') {
        const successLog = await login(email, password);
        if (successLog) {
          handleClose();
          success('Welcome back to Swastika Sarees!', 'Successfully signed in.');
        } else {
          setError('Invalid email or password.');
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const successSign = await signUp(email, password, fullName, phone);
        if (successSign) {
          handleClose();
          success('Welcome to Swastika Sarees!', 'Your account has been created.');
        } else {
          setError('Failed to create account. Email may already be in use.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      // the redirect will happen via supabase, so it will reload
    } catch (err) {
      setError('Failed to login with Google');
    }
  };

  if (!isOpen || !settings) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden touch-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-brand-dark/80 backdrop-blur-[6px]"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 50 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[92vw] max-w-4xl bg-brand-white rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-y-auto md:overflow-hidden max-h-[90vh] md:min-h-[500px]"
        >
          {/* Close Button - Responsive padding for larger tap target */}
          <button 
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 z-[60] p-3 bg-black/20 hover:bg-black/40 md:bg-white/80 md:hover:bg-white text-white md:text-gray-800 rounded-full shadow-sm backdrop-blur transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Top/Left Hero Banner */}
          <div className="w-full md:w-5/12 h-[200px] sm:h-[240px] md:h-auto shrink-0 relative bg-brand-dark block">
            <div className={`absolute inset-0 z-10 ${
              settings.overlay?.type === 'gradient' ? 'bg-gradient-to-t from-black via-black/50 to-transparent' :
              settings.overlay?.type === 'dark' ? 'bg-black' :
              settings.overlay?.type === 'light' ? 'bg-white' : ''
            }`} style={{ opacity: (settings.overlay?.opacity || 80) / 100 }} />
            
            <img 
              src={settings.images?.desktopUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6153c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
              alt="Premium Sarees"
              className="absolute inset-0 w-full h-full object-cover rounded-t-[24px] md:rounded-l-[24px] md:rounded-tr-none"
            />
            <div className={`absolute inset-0 z-20 p-5 md:p-8 flex flex-col justify-end ${settings.overlay?.type === 'light' ? 'text-brand-dark' : 'text-white'}`}>
              {settings.promotional?.badgeText && (
                <span className="inline-block px-3 py-1 bg-brand-gold text-brand-dark text-[10px] font-black uppercase tracking-widest rounded-full w-max mb-3 md:mb-4">{settings.promotional.badgeText}</span>
              )}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-1.5 md:mb-2 leading-tight">{settings.promotional?.heading}</h2>
              <p className={`text-[13px] md:text-sm mb-4 md:mb-6 max-w-xs leading-snug ${settings.overlay?.type === 'light' ? 'text-gray-700' : 'text-brand-cream/90'}`}>{settings.promotional?.description}</p>
              
              <div className="flex flex-wrap md:grid md:grid-cols-2 gap-2 md:gap-4 mt-2 md:mt-4">
                {settings.benefits?.filter(b => b.isEnabled).map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 md:px-0 md:py-0 bg-white/20 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border border-white/20 md:border-transparent rounded-full md:rounded-none text-[11px] md:text-xs font-semibold">
                    <IconComponent name={b.icon} size={14} className={settings.overlay?.type === 'light' ? 'text-brand-dark' : 'text-brand-gold'}/> 
                    {b.title}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom/Right Form Container */}
          <div className="w-full md:w-7/12 p-5 sm:p-8 md:p-10 bg-brand-cream/10 md:overflow-y-auto">
            <div className="max-w-md mx-auto">
              {/* Header */}
              <div className="text-center mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-display font-bold text-brand-dark mb-1.5 md:mb-2">{settings.header?.title}</h2>
                <p className="text-[13px] md:text-sm text-brand-muted leading-snug">{settings.header?.subtitle}</p>
              </div>

              {/* Pill Tab Switcher */}
              <div className="flex p-1 bg-gray-100 rounded-full mb-6 md:mb-8 relative shadow-inner">
                <button 
                  type="button"
                  onClick={() => { setActiveTab('signin'); setError(''); }}
                  className={`flex-1 h-12 text-[13px] sm:text-sm font-bold z-10 transition-colors rounded-full ${activeTab === 'signin' ? 'text-brand-dark' : 'text-gray-500'}`}
                >
                  {settings.buttons?.signIn || 'Sign In'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setActiveTab('signup'); setError(''); }}
                  className={`flex-1 h-12 text-[13px] sm:text-sm font-bold z-10 transition-colors rounded-full ${activeTab === 'signup' ? 'text-brand-dark' : 'text-gray-500'}`}
                >
                  {settings.buttons?.signUp || 'Create Account'}
                </button>
                {/* Animated indicator */}
                <motion.div 
                  initial={false}
                  animate={{ left: activeTab === 'signin' ? '4px' : 'calc(50% + 2px)', width: 'calc(50% - 6px)' }}
                  className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm border border-gray-200/50"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forms */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {activeTab === 'signup' && (
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      required 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Full Name" 
                      className="w-full h-12 bg-white border border-gray-200 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-shadow"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email or Mobile Number" 
                    className="w-full h-12 bg-white border border-gray-200 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-shadow"
                  />
                </div>

                {activeTab === 'signup' && (
                  <div className="relative flex items-center">
                    <div className="absolute left-4 h-full flex items-center gap-1.5 border-r border-gray-200 pr-3 z-10">
                      <span className="text-xs font-bold text-gray-600">+91</span>
                    </div>
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="WhatsApp Number" 
                      className="w-full h-12 bg-white border border-gray-200 pl-20 pr-4 rounded-xl text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-shadow"
                    />
                  </div>
                )}

                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password" 
                    className="w-full h-12 bg-white border border-gray-200 pl-11 pr-11 rounded-xl text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-shadow"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {activeTab === 'signup' && (
                  <>
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="flex gap-1 h-1.5 mt-[-6px] px-1">
                        <div className={`flex-1 rounded-full ${getPasswordStrength() > 0 ? (getPasswordStrength() < 50 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-gray-200'}`}></div>
                        <div className={`flex-1 rounded-full ${getPasswordStrength() > 33 ? (getPasswordStrength() < 66 ? 'bg-orange-500' : 'bg-emerald-500') : 'bg-gray-200'}`}></div>
                        <div className={`flex-1 rounded-full ${getPasswordStrength() > 66 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                      </div>
                    )}

                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password" 
                        className="w-full h-12 bg-white border border-gray-200 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-shadow"
                      />
                    </div>
                  </>
                )}

                {/* Additional Checkboxes */}
                {activeTab === 'signin' ? (
                  <div className="flex justify-between items-center text-xs mt-1">
                    <label className="flex items-center gap-2 cursor-pointer p-1">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded border-gray-300 w-4 h-4 text-brand-dark focus:ring-brand-dark" />
                      <span className="font-semibold text-gray-600">Remember Me</span>
                    </label>
                    <a href="#" className="font-bold text-brand-dark hover:underline p-1">Forgot Password?</a>
                  </div>
                ) : (
                  <div className="space-y-3 mt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-[13px] leading-snug">
                      <input type="checkbox" checked={whatsappOffers} onChange={e => setWhatsappOffers(e.target.checked)} className="mt-[2px] w-4 h-4 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]" />
                      <span className="font-semibold text-gray-600">Receive exclusive offers and order updates on WhatsApp</span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer text-[13px] leading-snug">
                      <input type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)} className="mt-[2px] w-4 h-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark" />
                      <span className="font-semibold text-gray-600">Subscribe to newsletters for first-order discounts</span>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-[52px] bg-brand-dark text-white font-bold text-[15px] rounded-xl shadow-[0_8px_16px_-4px_rgba(26,5,5,0.2)] hover:bg-black transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : (activeTab === 'signin' ? (settings.buttons?.signIn || 'Sign In') : (settings.buttons?.signUp || 'Create Account'))}
                </button>
              </form>

              {/* Social Logins */}
              {activeTab === 'signin' && (
                <>
                  <div className="flex items-center gap-4 my-6 opacity-80">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Or continue with</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={handleGoogle} className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors active:bg-gray-100">
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" /> {settings.buttons?.google || 'Google'}
                    </button>
                    <button type="button" disabled className="flex items-center justify-center gap-2 h-12 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-400 cursor-not-allowed">
                      <img src="https://www.svgrepo.com/show/448202/apple.svg" className="w-4 h-4 opacity-50" alt="Apple" /> {settings.buttons?.apple || 'Apple'}
                    </button>
                  </div>

                  <div className="mt-8 text-center">
                    <button type="button" onClick={handleClose} className="text-[13px] font-bold text-gray-500 hover:text-brand-dark transition-colors p-2">
                      {settings.buttons?.guest || 'Continue as Guest'}
                    </button>
                  </div>
                </>
              )}

              {/* Toggle links */}
              <div className="mt-8 text-center text-[13px] font-semibold text-gray-500 mb-4 md:mb-0">
                {activeTab === 'signin' ? (
                  <>Don't have an account? <button type="button" onClick={() => setActiveTab('signup')} className="text-brand-dark font-bold hover:underline ml-1"> {settings.buttons?.signUp || 'Create Account'}</button></>
                ) : (
                  <>Already have an account? <button type="button" onClick={() => setActiveTab('signin')} className="text-brand-dark font-bold hover:underline ml-1"> {settings.buttons?.signIn || 'Sign In'}</button></>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
