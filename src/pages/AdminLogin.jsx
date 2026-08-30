import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getFirstAllowedAdminPath } from '../utils/adminPermissions';

const schema = yup.object({
  email: yup.string().email('Valid email required').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { adminLogin, user, loading: authLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  // Auto-redirect if already logged in as admin (only when not in login process)
  useEffect(() => {
    if (!authLoading && user && user.role === 'admin' && !loginSuccess) {
      toast.success('Welcome back to Admin Panel');
      navigate(getFirstAllowedAdminPath(user), { replace: true });
    }
  }, [user, authLoading, navigate, loginSuccess]);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await adminLogin(data.email, data.password);
    setLoading(false);
    if (result.success) {
      setLoginSuccess(true);
      // Small delay to allow state to update properly
      setTimeout(() => {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        navigate(getFirstAllowedAdminPath(storedUser), { replace: true });
      }, 150);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-gray-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50">
        <div className="text-center">
          <img
            src="/logo-1.png"
            alt="BuySellAdda Logo"
            className="mx-auto h-24 w-auto object-contain mb-6"
          />
          <p className="mb-3 text-sm font-bold text-gray-600">Har Deal, Ek Nayi Shuruaat</p>
          <h2 className="mt-2 text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-600 bg-clip-text text-transparent">
            BuySellAdda Admin Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage the platform
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('email')}
                type="email"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gradient-to-r from-slate-50 to-gray-50"
                placeholder="admin@buyselladda.com"
              />
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><Mail className="h-4 w-4" />{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-400" />
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                {...register('password')}
                type="password"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-2xl focus:ring-3 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gradient-to-r from-slate-50 to-gray-50"
                placeholder="Enter your password"
              />
            </div>
            {errors.password && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><Lock className="h-4 w-4" />{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-2xl shadow-xl text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-60 transition-all transform hover:scale-[1.02] active:scale-100"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Enter Admin Panel
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-gray-200">
          <Link 
            to="/login" 
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-1 mx-auto"
          >
            ← Back to User Login
          </Link>
        </div>
      </div>
    </div>
  );
}

