import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const AdminNavbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['adminNotifications'],
    queryFn: () => api.get('/admin/notifications').then(res => res.data.data || []),
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/admin/search', { state: { query: searchQuery } });
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users, products, chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white/50"
              />
            </div>
          </form>

          {/* Right side: Notifications + Profile */}
          <div className="flex items-center gap-4 ml-8">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl relative transition-all">
                <Bell size={20} />
                {notifications?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {notifications.length > 99 ? '99+' : notifications.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="hidden md:block font-semibold text-gray-900 text-sm">
                  {user?.name || 'Admin'}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg mx-1 transition-all">
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg mx-1 transition-all text-red-600 hover:text-red-700"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;

