import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('swastika_token') || null,
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true });
    
    // Check if we have a stored mock token
    const token = localStorage.getItem('swastika_token');
    const mockUser = localStorage.getItem('swastika_mock_user');

    if (token && token.startsWith('mock-')) {
      try {
        set({ token, user: JSON.parse(mockUser), loading: false });
        // Refresh profile from DB
        await get().fetchProfile();
        return;
      } catch (e) {
        get().logout();
      }
    }

    if (!isSupabaseConfigured()) {
      set({ loading: false });
      return;
    }

    try {
      // Get current Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        const token = session.access_token;
        localStorage.setItem('swastika_token', token);
        set({ token });
        
        // Fetch MongoDB synced profile details
        await get().fetchProfile();
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const token = session.access_token;
          localStorage.setItem('swastika_token', token);
          set({ token });
          await get().fetchProfile();
        } else {
          get().logout();
        }
      });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data });
        localStorage.setItem('swastika_mock_user', JSON.stringify(data));
      } else {
        throw new Error(data.error || 'Failed to fetch user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  },

  // 1. Local Mock Logins for Testing
  loginMock: async (role = 'customer') => {
    set({ loading: true, error: null });
    const mockToken = role === 'admin' ? 'mock-admin-token' : 'mock-customer-token';
    localStorage.setItem('swastika_token', mockToken);
    set({ token: mockToken });
    
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data, loading: false });
        localStorage.setItem('swastika_mock_user', JSON.stringify(data));
      } else {
        throw new Error(data.error || 'Failed to initialize mock login profile');
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // 2. Real Supabase Logins
  login: async (email, password) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured()) {
      // Simulation mode: authenticate user with mock token
      const mockToken = 'mock-customer-token';
      localStorage.setItem('swastika_token', mockToken);
      set({ token: mockToken });
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          set({ user: data, loading: false });
          localStorage.setItem('swastika_mock_user', JSON.stringify(data));
          return true;
        } else {
          throw new Error(data.error || 'Failed to initialize simulation customer profile.');
        }
      } catch (err) {
        set({ error: err.message, loading: false });
        return false;
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const token = data.session.access_token;
      localStorage.setItem('swastika_token', token);
      set({ token });
      await get().fetchProfile();
      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  signUp: async (email, password, fullName, phone) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured()) {
      // Simulation mode signup success
      set({ loading: false });
      return true;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          }
        }
      });
      if (error) throw error;

      // In some configurations, Supabase returns session immediately if email confirmation is off
      if (data.session) {
        const token = data.session.access_token;
        localStorage.setItem('swastika_token', token);
        set({ token });
        await get().fetchProfile();
      }

      set({ loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  loginWithGoogle: async () => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase is not configured.' });
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('swastika_token');
    localStorage.removeItem('swastika_mock_user');
    set({ user: null, token: null, error: null });
  },

  updateProfile: async (fullName, phone) => {
    const { token } = get();
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone })
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data });
        return true;
      }
      throw new Error(data.error);
    } catch (err) {
      set({ error: err.message });
      return false;
    }
  },

  // Address Handlers
  addAddress: async (address) => {
    const { token } = get();
    try {
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(address)
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data });
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  updateAddress: async (addressId, address) => {
    const { token } = get();
    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(address)
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data });
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  deleteAddress: async (addressId) => {
    const { token } = get();
    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        set({ user: data });
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}));
