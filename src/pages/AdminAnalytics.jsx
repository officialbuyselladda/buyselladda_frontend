import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area } from 'recharts';
import MetricCard from '../components/MetricCard';
import { Users, Package, TrendingUp, Activity, DollarSign } from 'lucide-react';

const analyticsData = [
  { month: 'Jan', users: 1200, products: 450, revenue: 25000 },
  { month: 'Feb', users: 1800, products: 620, revenue: 38000 },
  { month: 'Mar', users: 2500, products: 890, revenue: 52000 },
  { month: 'Apr', users: 3200, products: 1120, revenue: 68000 },
  { month: 'May', users: 4200, products: 1450, revenue: 85000 },
  { month: 'Jun', users: 5200, products: 1780, revenue: 105000 },
];

const growthData = [
  { name: 'Users', value: 4200, change: 25 },
  { name: 'Products', value: 1450, change: 18 },
  { name: 'Revenue', value: '₹1.05L', change: 32 },
];

const AdminAnalytics = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <TrendingUp size={44} className="text-gradient bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-2xl text-white shadow-lg" />
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-primary-600 to-accent-500 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600 mt-1">Platform growth and performance metrics</p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Users" 
          value="5,200" 
          icon={Users} 
          color="blue"
          change={25}
        />
        <MetricCard 
          title="Active Listings" 
          value="1,780" 
          icon={Package} 
          color="emerald"
          change={18}
        />
        <MetricCard 
          title="Monthly Revenue" 
          value="₹1,05,000" 
          icon={DollarSign} 
          color="orange"
          change={32}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Growth Chart */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Activity size={28} />
            Growth Overview
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f8fafc" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={12} />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="users" fill="url(#userGradient)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="products" fill="url(#productGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Daily Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <defs>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={false} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#activityGradient)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/30">
              <p className="text-sm text-gray-600 uppercase tracking-wide">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900">8PM - 10PM</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/30">
              <p className="text-sm text-gray-600 uppercase tracking-wide">Conversion</p>
              <p className="text-2xl font-bold text-gray-900">4.2%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

