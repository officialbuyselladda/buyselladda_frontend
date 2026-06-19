import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Validate token with backend - ensures user is still valid
  const validateToken = useCallback(async (token) => {
    try {
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.data?.user) {
        return data.data.user;
      }
      return null;
    } catch (error) {
      // Token invalid or expired - clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
  }, []);

  // Load initial state - runs only once on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Set user immediately from localStorage for instant UI update
          setUser(parsedUser);
          
          // Optionally validate token in background (commented out to prevent unnecessary API calls)
          // const validatedUser = await validateToken(token);
          // if (validatedUser) {
          //   setUser(validatedUser);
          //   localStorage.setItem('user', JSON.stringify(validatedUser));
          // } else {
          //   // Token invalid, user already cleared
          // }
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      
      setLoading(false);
      setInitialLoadDone(true);
    };

    // Small delay to ensure components are ready
    initAuth();
  }, [validateToken]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        toast.success(data.message);
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const { data } = await api.post('/auth/admin-login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        toast.success(data.message);
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
      return { success: false };
    }
  };

  const register = async (name, email, password, phone, userType = 'normal') => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone, userType });
      if (data.success) {
        toast.success(data.message);
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        toast.success(data.message || 'Password reset successful');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed');
      return { success: false };
    }
  };

  const verifyEmail = useCallback(async (token) => {
    try {
      const { data } = await api.get(`/auth/verify-email/${token}`);
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        toast.success(data.message || 'Email verified');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
      return { success: false };
    }
  }, []);

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  const value = {
    user,
    login,
    adminLogin,
    register,
    resetPassword,
    verifyEmail,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

