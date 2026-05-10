import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../components/MetricCard';
import api from '../services/api';
import { BarChart3, Eye, MessageCircle, Package, TrendingUp, Users } from 'lucide-react';

const colors = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#64748b'];

const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => api.get('/admin/analytics').then((res) => res.data.data),
  });

  const totals = data?.totals || {};
  const growthData = data?.growthData || [];
  const statusData = data?.statusData || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <TrendingUp size={44} className="rounded-2xl bg-emerald-100 p-3 text-emerald-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Live marketplace performance from your database</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Users" value={totals.users || 0} icon={Users} color="blue" />
        <MetricCard title="Approved Ads" value={totals.activeListings || 0} icon={Package} color="emerald" />
        <MetricCard title="Pending Ads" value={totals.pendingProducts || 0} icon={BarChart3} color="orange" />
        <MetricCard title="Chats" value={totals.chats || 0} icon={MessageCircle} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <BarChart3 size={22} />
            Six Month Growth
          </h2>
          {isLoading ? (
            <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={growthData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="products" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <Package size={22} />
            Ad Status Split
          </h2>
          {isLoading ? (
            <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                  {statusData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MetricCard title="Total Views" value={totals.views || 0} icon={Eye} color="indigo" />
        <MetricCard title="Approved Listing Value" value={`₹${(totals.listingValue || 0).toLocaleString()}`} icon={TrendingUp} color="emerald" />
      </div>
    </div>
  );
};

export default AdminAnalytics;
