import { create } from 'zustand';
import { auth } from '../utils/firebase';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('swastika_token') || null,
  loading: false,
  error: null,

  initialize: async () => {
    set({ loading: true });
    
    const token = localStorage.getItem('swastika_token');
    const mockUser = localStorage.getItem('swastika_mock_user');

    if (token) {
      if (token.startsWith('mock-')) {
        try {
          set({ token, user: JSON.parse(mockUser), loading: false });
          await get().fetchProfile();
          return;
        } catch (e) {
          get().logout();
        }
      } else {
        try {
          set({ token });
          await get().fetchProfile();
          set({ loading: false });
          return;
        } catch (e) {
          get().logout();
        }
      }
    } else {
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
      if (!response.ok) {
        let errorMsg = 'Failed to fetch user profile';
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      set({ user: data });
      localStorage.setItem('swastika_mock_user', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching user profile:', err);
      throw err;
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

  // 2. Native MongoDB Logins
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      const token = data.token;
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
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, phone })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const token = data.token;
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

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
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

  loginWithApple: async () => {
    set({ loading: true, error: null });
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
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

  logout: async () => {
    localStorage.removeItem('swastika_token');
    localStorage.removeItem('swastika_mock_user');
    set({ user: null, token: null, error: null, loading: false });
  },

  updateProfile: async (profileData) => {
    const { token } = get();
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
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
