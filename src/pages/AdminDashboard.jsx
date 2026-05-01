import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3, Users, Package, MessageCircle, Eye, Shield, DollarSign, TrendingUp, Clock,
  LineChart, BarChart
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart as ReLineChart, BarChart as ReBarChart,
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// Mock chart data
const statusData = [
  { name: 'Approved', value: 1248, color: '#10b981' },
  { name: 'Pending', value: 324, color: '#f59e0b' },
  { name: 'Rejected', value: 128, color: '#ef4444' },
];

const growthData = [
  { month: 'Jan', users: 400, products: 240 },
  { month: 'Feb', users: 600, products: 380 },
  { month: 'Mar', users: 800, products: 500 },
  { month: 'Apr', users: 1000, products: 650 },
  { month: 'May', users: 1200, products: 800 },
];

const revenueData = [
  { week: 'W1', revenue: 12000 },
  { week: 'W2', revenue: 18000 },
  { week: 'W3', revenue: 24000 },
  { week: 'W4', revenue: 32000 },
];

/* ─── Custom Tooltip ─────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: '#111', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: 0 }}>
            {p.name}: <strong>{typeof p.value === 'number' && p.dataKey === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Stat Card ──────────────────────────────────────── */
const StatCard = ({ stat }) => {
  const gradients = {
    blue: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    emerald: 'linear-gradient(135deg,#10b981,#059669)',
    yellow: 'linear-gradient(135deg,#f59e0b,#d97706)',
    purple: 'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    indigo: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    green: 'linear-gradient(135deg,#22c55e,#16a34a)',
  };

  return (
    <Link
      to={stat.link || '#'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        background: '#fff',
        borderRadius: 20,
        padding: '24px 28px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        border: '1px solid #f0f0f0',
        textDecoration: 'none',
        transition: 'box-shadow .2s, transform .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16, flexShrink: 0,
        background: gradients[stat.color] || gradients.blue,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
      }}>
        <stat.icon size={26} color="#fff" />
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{stat.label}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '4px 0 0', lineHeight: 1 }}>{stat.value}</p>
      </div>
    </Link>
  );
};

/* ─── Chart Card ─────────────────────────────────────── */
const ChartCard = ({ title, icon: Icon, children, link, linkLabel }) => (
  <div style={{
    background: '#fff',
    borderRadius: 24,
    padding: '28px 24px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
    display: 'flex', flexDirection: 'column',
  }}>
    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 20px' }}>
      <Icon size={20} color="#6366f1" />
      {title}
    </h3>
    {children}
    {link && (
      <Link to={link} style={{ color: '#10b981', fontWeight: 600, fontSize: 13, marginTop: 16, textDecoration: 'none' }}>
        {linkLabel || 'View More →'}
      </Link>
    )}
  </div>
);

/* ─── Main Component ─────────────────────────────────── */
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

  const recentUsers = stats?.recentUsers || [];
  const recentProducts = stats?.recentProducts || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .admin-grid-6 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .admin-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .admin-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .admin-grid-header { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .main-bottom { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        @media (max-width: 1024px) {
          .admin-grid-6 { grid-template-columns: repeat(2, 1fr); }
          .admin-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .admin-grid-header { grid-template-columns: repeat(2, 1fr); }
          .quick-grid { grid-template-columns: repeat(2, 1fr); }
          .main-bottom { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .admin-grid-6 { grid-template-columns: 1fr; }
          .admin-grid-3 { grid-template-columns: 1fr; }
          .admin-grid-2 { grid-template-columns: 1fr; }
          .admin-grid-header { grid-template-columns: 1fr; }
          .quick-grid { grid-template-columns: 1fr; }
        }
        .action-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
        .action-card { transition: transform .2s, box-shadow .2s; }
        .user-row:hover { background: #f9fafb; }
        .badge-approved { background: #dcfce7; color: #15803d; }
        .badge-pending  { background: #fef9c3; color: #a16207; }
        .badge-default  { background: #f3f4f6; color: #374151; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* ── Welcome Header ── */}
        <div style={{
          background: '#fff',
          borderRadius: 28,
          padding: '32px 36px',
          marginBottom: 28,
          boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
          border: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(135deg,#10b981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
            }}>
              <Shield size={28} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                Admin Dashboard
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: 15 }}>Welcome back, <strong style={{ color: '#374151' }}>{user?.name}</strong></p>
            </div>
          </div>

          <div className="admin-grid-header">
            {/* Today */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(59,130,246,0.07))',
              border: '1px solid rgba(16,185,129,0.18)',
              borderRadius: 18, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={22} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Today</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '2px 0 0' }}>{stats?.todayProducts || 0} <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>new products</span></p>
              </div>
            </div>
            {/* Pending */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(245,158,11,0.07),rgba(249,115,22,0.07))',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 18, padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={22} color="#f59e0b" />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Pending</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '2px 0 0' }}>{stats?.pendingProducts || 0}</p>
                </div>
              </div>
              <Link to="/admin/products?status=pending" style={{ color: '#10b981', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>Review All →</Link>
            </div>
            {/* New Users */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(59,130,246,0.07),rgba(99,102,241,0.07))',
              border: '1px solid rgba(59,130,246,0.18)',
              borderRadius: 18, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={22} color="#3b82f6" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>New Users</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '2px 0 0' }}>{stats?.newUsersToday || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="admin-grid-6" style={{ marginBottom: 28 }}>
          {statsData.map((stat, i) => <StatCard key={i} stat={stat} />)}
        </div>

        {/* ── Charts Row ── */}
        <div className="admin-grid-3" style={{ marginBottom: 28 }}>
          {/* Pie */}
          <ChartCard title="Product Status" icon={BarChart3} link="/admin/analytics" linkLabel="View Full Analytics →">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={44}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
              {statusData.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{s.name}: <strong style={{ color: '#111' }}>{s.value}</strong></span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Line */}
          <ChartCard title="Monthly Growth" icon={LineChart}>
            <ResponsiveContainer width="100%" height={220}>
              <ReLineChart data={growthData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" name="Users" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="products" name="Products" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </ReLineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 3, borderRadius: 2, background: '#3b82f6' }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Users</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 3, borderRadius: 2, background: '#10b981' }} />
                <span style={{ fontSize: 12, color: '#6b7280' }}>Products</span>
              </div>
            </div>
          </ChartCard>

          {/* Bar */}
          <ChartCard title="Weekly Revenue" icon={BarChart}>
            <ResponsiveContainer width="100%" height={220}>
              <ReBarChart data={revenueData} barSize={28}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Quick Actions + Platform Health ── */}
        <div className="main-bottom" style={{ marginBottom: 28 }}>
          {/* Quick Actions */}
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: '28px 28px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 22px' }}>
              <BarChart3 size={22} color="#6366f1" />
              Quick Actions
            </h2>
            <div className="quick-grid">
              {[
                {
                  to: '/admin/products', icon: Package, color: '#10b981',
                  bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
                  border: '#bbf7d0', title: 'Manage Products',
                  sub: `${stats?.pendingProducts || 0} pending`, cta: 'Review →', ctaColor: '#059669',
                },
                {
                  to: '/admin/users', icon: Users, color: '#3b82f6',
                  bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                  border: '#bfdbfe', title: 'Manage Users',
                  sub: `${stats?.totalUsers || 0} total`, cta: 'View All →', ctaColor: '#2563eb',
                },
                {
                  to: '/admin/analytics', icon: BarChart3, color: '#8b5cf6',
                  bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
                  border: '#c4b5fd', title: 'Analytics',
                  sub: 'Detailed reports', cta: 'Dive Deep →', ctaColor: '#7c3aed',
                },
              ].map((c, i) => (
                <Link key={i} to={c.to} className="action-card" style={{
                  background: c.bg,
                  border: `1.5px solid ${c.border}`,
                  borderRadius: 18, padding: '24px 20px',
                  textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, marginBottom: 14,
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}>
                    <c.icon size={26} color={c.color} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: '0 0 4px', textAlign: 'center' }}>{c.title}</p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', textAlign: 'center' }}>{c.sub}</p>
                  <span style={{ color: c.ctaColor, fontWeight: 700, fontSize: 13 }}>{c.cta}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Health */}
          <div style={{
            background: 'linear-gradient(160deg,#f0fdf4,#eff6ff)',
            borderRadius: 24, padding: '28px 28px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            border: '1px solid #e0f2fe',
            display: 'flex', flexDirection: 'column', gap: 0,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: '0 0 22px' }}>Platform Health</h3>
            {[
              { label: 'Uptime', value: '99.9%', color: '#10b981' },
              { label: 'Active Users', value: stats?.activeUsers || 0, color: '#3b82f6' },
              { label: 'Server Load', value: 'Low', color: '#10b981' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0',
                borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}>
                <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
            <Link to="/admin/system-settings" style={{
              color: '#10b981', fontWeight: 700, fontSize: 13,
              textDecoration: 'none', marginTop: 20, display: 'block',
            }}>
              System Settings →
            </Link>
          </div>
        </div>

        {/* ── Recent Lists ── */}
        {(recentUsers.length > 0 || recentProducts.length > 0) && (
          <div className="admin-grid-2">
            {/* Recent Users */}
            <div style={{
              background: '#fff', borderRadius: 24, padding: '28px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Users size={18} color="#3b82f6" /> Recent Users
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentUsers.slice(0, 5).map((u) => (
                  <div key={u._id} className="user-row" style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px', borderRadius: 14,
                    transition: 'background .15s', cursor: 'default',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                      background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Users size={18} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                    </div>
                    <span className="badge-default" style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 20, whiteSpace: 'nowrap',
                    }}>{u.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Products */}
            <div style={{
              background: '#fff', borderRadius: 24, padding: '28px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Package size={18} color="#10b981" /> Recent Products
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentProducts.slice(0, 5).map((p) => (
                  <div key={p._id} className="user-row" style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 14px', borderRadius: 14,
                    transition: 'background .15s', cursor: 'default',
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                      background: 'linear-gradient(135deg,#10b981,#34d399)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Package size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>₹{p.price?.toLocaleString()}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                      ...(p.status === 'approved' ? { background: '#dcfce7', color: '#15803d' } : { background: '#fef9c3', color: '#a16207' }),
                    }}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;