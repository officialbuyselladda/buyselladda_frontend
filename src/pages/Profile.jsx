import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, MessageCircle, FileText, Edit, LogOut, Shield, Eye, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['profileStats'],
    queryFn: () => api.get('/users/profile-stats').then(res => res.data.data),
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto md:mx-0">
              <User size={48} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                {user.name}
              </h1>
              <p className="text-xl text-gray-600 mb-1">{user.email}</p>
              {user.role === 'admin' && (
                <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold mt-2">
                  <Shield size={16} className="mr-1" />
                  Admin
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                {user.phone && <span>📞 {user.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
            <Package size={32} className="mx-auto text-primary-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</h3>
            <p className="text-gray-600">Products Posted</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
            <Package size={32} className="mx-auto text-emerald-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats?.approvedProducts || 0}</h3>
            <p className="text-gray-600">Live Listings</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
            <MessageCircle size={32} className="mx-auto text-blue-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalChats || 0}</h3>
            <p className="text-gray-600">Messages</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
            <Eye size={32} className="mx-auto text-purple-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</h3>
            <p className="text-gray-600">Total Views</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-primary-500 to-emerald-500 text-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/create-product" 
                className="group flex items-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all group-hover:scale-105"
              >
                <Plus size={24} className="mr-3 flex-shrink-0" />
                <span className="font-semibold">Post New Ad</span>
              </Link>
              <Link 
                to="/my-products" 
                className="group flex items-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all group-hover:scale-105"
              >
                <Package size={24} className="mr-3 flex-shrink-0" />
                <span className="font-semibold">My Products</span>
              </Link>
              <Link 
                to="/chats" 
                className="group flex items-center p-4 rounded-2xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all group-hover:scale-105"
              >
                <MessageCircle size={24} className="mr-3 flex-shrink-0" />
                <span className="font-semibold">My Messages</span>
              </Link>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Account</h2>
            <div className="space-y-4">
              <Link to="/profile/edit" className="flex items-center p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all">
                <Edit size={20} className="mr-3 text-gray-500" />
                <span>Edit Profile</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center p-4 border border-red-200 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium"
              >
                <LogOut size={20} className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
            {user.role === 'admin' && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link 
                  to="/admin/dashboard" 
                  className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-all"
                >
                  Go to Admin Panel
                  <Shield size={18} className="ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

