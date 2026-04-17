import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, Package, MessageCircle, Eye, Shield, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/admin/dashboard').then(res => res.data.data),
  });

  const statsData = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue', link: '/admin/users' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'emerald', link: '/admin/products' },
    { label: 'Pending Approval', value: stats?.pendingProducts || 0, icon: Clock, color: 'yellow', link: '/admin/products?status=pending' },
    { label: 'Total Chats', value: stats?.totalChats || 0, icon: MessageCircle, color: 'purple' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: Eye, color: 'indigo' },
    { label: 'Revenue', value: `₹${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-white/50">
          <div className="flex items-center gap-4 mb-6">
            <Shield size={40} className="text-emerald-600 bg-emerald-100 p-3 rounded-2xl" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-emerald-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-200/50 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <TrendingUp size={24} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide font-medium">Today</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.todayProducts || 0} new products</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-200/50 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Clock size={24} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide font-medium">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.pendingProducts || 0}</p>
                </div>
              </div>
              <Link to="/admin/products?status=pending" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
                Review All →
              </Link>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/50 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide font-medium">New Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.newUsersToday || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {statsData.map((stat, index) => (
            <Link 
              key={index}
              to={stat.link || '#'}
              className="group bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-white/50 hover:border-primary-200/50 transition-all hover:-translate-y-2 h-full"
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 shadow-lg`}>
                  <stat.icon size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 uppercase tracking-wide font-medium group-hover:text-primary-600 transition-colors">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2 leading-tight">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity - Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <BarChart3 size={28} />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link to="/admin/products" className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all bg-gradient-to-br from-primary-50 to-emerald-50">
                <Package size={40} className="mx-auto mb-4 text-primary-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">Manage Products</h3>
                <p className="text-gray-600 mb-4">{stats?.pendingProducts || 0} pending</p>
                <span className="text-primary-600 font-semibold">Review →</span>
              </Link>
              <Link to="/admin/users" className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all bg-gradient-to-br from-blue-50 to-indigo-50">
                <Users size={40} className="mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-xl mb-2">Manage Users</h3>
                <p className="text-gray-600 mb-4">{stats?.totalUsers || 0} total</p>
                <span className="text-blue-600 font-semibold">View All →</span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/5 to-blue-500/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-emerald-200/30">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Health</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold text-emerald-600">100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold">{stats?.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Server Load</span>
                <span className="font-semibold text-emerald-600">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

