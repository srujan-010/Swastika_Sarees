import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleUp } from '../utils/animations';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, signUp, logout, error, loading, loginWithGoogle, loginWithApple } = useAuthStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        const redirectPath = searchParams.get('redirect') || '/';
        navigate(redirectPath);
      }
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (email.toLowerCase() === 'admin@swastikasarees.com') {
      navigate('/admin');
      return;
    }

    if (activeTab === 'login') {
      if (!email || !password) {
        setFormError('All credentials must be filled.');
        return;
      }
      const success = await login(email, password);
      if (success) {
        const updatedUser = useAuthStore.getState().user;
        if (updatedUser && updatedUser.role === 'admin') {
          navigate('/admin');
          return;
        }
        navigate('/');
      }
    } else {
      if (!email || !password || !fullName || !phone) {
        setFormError('All registration fields are required.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      const success = await signUp(email, password, fullName, phone);
      if (success) {
        setFormError('Account created successfully! Please log in.');
        setActiveTab('login');
      }
    }
  };

  const handleGoogle = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) {
        const updatedUser = useAuthStore.getState().user;
        if (updatedUser && updatedUser.role === 'admin') navigate('/admin');
        else navigate(searchParams.get('redirect') || '/');
      }
    } catch (err) {
      setFormError('Failed to login with Google');
    }
  };

  const handleApple = async () => {
    try {
      const success = await loginWithApple();
      if (success) {
        const updatedUser = useAuthStore.getState().user;
        if (updatedUser && updatedUser.role === 'admin') navigate('/admin');
        else navigate(searchParams.get('redirect') || '/');
      }
    } catch (err) {
      setFormError('Failed to login with Apple');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 select-none">
      
      {/* Tab Switcher */}
      <div className="flex border-b border-brand-border/60 mb-6 bg-brand-cream p-1 rounded-xl">
        <button
          onClick={() => {
            setActiveTab('login');
            setFormError('');
          }}
          className={`flex-1 py-3 font-semibold text-xs sm:text-sm rounded-lg transition-all ${
            activeTab === 'login'
              ? 'bg-brand-crimson text-brand-cream shadow-xs'
              : 'text-brand-muted hover:text-brand-dark'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setActiveTab('register');
            setFormError('');
          }}
          className={`flex-1 py-3 font-semibold text-xs sm:text-sm rounded-lg transition-all ${
            activeTab === 'register'
              ? 'bg-brand-crimson text-brand-cream shadow-xs'
              : 'text-brand-muted hover:text-brand-dark'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Main Box */}
      <div className="bg-brand-white border border-brand-border p-6 rounded-2xl shadow-md text-left space-y-6">
        
        <div className="text-center">
          <h2 className="font-display font-bold text-brand-dark text-xl sm:text-2xl">
            {activeTab === 'login' ? 'Welcome Back!' : 'Start Your Sparkle'}
          </h2>
          <p className="text-2xs sm:text-xs text-brand-muted font-sans mt-1 uppercase tracking-wide">
            {activeTab === 'login' ? "Trendy & Elegant Ladies' Apparel" : "Join Swastika Sarees Boutique"}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.form 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit} 
            className="space-y-4 font-sans text-xs"
          >
          
          {activeTab === 'register' && (
            <>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-brand-cream border border-brand-border text-brand-dark pl-9 pr-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                  <UserIcon className="absolute left-3 top-3 text-brand-muted" size={14} />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="font-semibold text-brand-dark mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="10-digit mobile"
                    className="w-full bg-brand-cream border border-brand-border text-brand-dark pl-9 pr-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  />
                  <Phone className="absolute left-3 top-3 text-brand-muted" size={14} />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-brand-cream border border-brand-border text-brand-dark pl-9 pr-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
              <Mail className="absolute left-3 top-3 text-brand-muted" size={14} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="font-semibold text-brand-dark mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-brand-cream border border-brand-border text-brand-dark pl-9 pr-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
              <Lock className="absolute left-3 top-3 text-brand-muted" size={14} />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="flex flex-col">
              <label className="font-semibold text-brand-dark mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-brand-cream border border-brand-border text-brand-dark pl-9 pr-3 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <Lock className="absolute left-3 top-3 text-brand-muted" size={14} />
              </div>
            </div>
          )}

          {(error || formError) && (
            <div className="bg-red-50 border border-brand-crimson/25 p-3 rounded-lg flex items-center space-x-2 text-2xs font-semibold text-brand-crimson font-sans">
              <AlertCircle size={14} className="shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 border border-brand-gold/30 shadow-md text-xs sm:text-sm"
          >
            {loading ? 'Processing...' : activeTab === 'login' ? 'Log In' : 'Create Account'}
          </button>
          </motion.form>
        </AnimatePresence>

        {/* Social Logins */}
        <div className="flex items-center gap-4 my-6 opacity-80 select-none">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Or continue with</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 select-none">
          <button type="button" onClick={handleGoogle} disabled={loading} className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors active:bg-gray-100 disabled:opacity-50">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" /> Google
          </button>
          <button type="button" onClick={handleApple} disabled={loading} className="flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors active:bg-gray-100 disabled:opacity-50">
            <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current text-black" xmlns="http://www.w3.org/2000/svg">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-48.7-22.7-79.4-22-38.1 1.2-76.3 22.8-97.5 59.8-35.7 62.5-9.1 185.5 25.1 244.6 16.9 29.2 38 61.8 68.6 60.5 27.6-1.1 38.1-17.7 73.6-17.7 35.7 0 45 17.7 73.6 17.1 31.2-.6 50.2-29.4 68.4-56.1 20.5-30 29-59.4 29.4-61-1-.4-54.8-20.5-55-79.5zm-51.2-181c20.3-24.3 33.6-58.2 29.4-91.7-28.7 1.1-64 19.3-84.6 44.1-17.8 20.9-33.3 55.4-28.3 88 32.2 2.5 64.9-16.1 83.5-40.4z" />
            </svg>
            Apple
          </button>
        </div>

      </div>

    </div>
  );
}
