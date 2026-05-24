import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  LifeBuoy,
  MessageCircle,
  Package,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
  suspicious: '#8b5cf6',
  sold: '#3b82f6',
  deleted: '#6b7280',
  unknown: '#9ca3af',
};

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const labelize = (value) => String(value || '').replace(/_/g, ' ');

const tooltipValue = (value, name) => {
  if (name === 'listingValue') return formatCurrency(value);
  return formatNumber(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg">
      {label && <p className="mb-1 font-bold text-gray-950">{label}</p>}
      {payload.map((item) => (
        <p key={item.dataKey || item.name} style={{ color: item.color }} className="font-semibold capitalize">
          {labelize(item.name)}: {tooltipValue(item.value, item.dataKey)}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, to, helper }) => {
  const content = (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-gray-950">{value}</p>
          {helper && <p className="mt-1 text-sm font-semibold text-gray-500">{helper}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

const ChartCard = ({ title, icon: Icon, children, action }) => (
  <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-black text-gray-950">
        <Icon size={20} className="text-emerald-600" />
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const EmptyChart = ({ label }) => (
  <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm font-semibold text-gray-500">
    {label}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/admin/dashboard').then((res) => res.data.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-white" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-white" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
        <p className="font-bold text-red-700">Dashboard data could not be loaded.</p>
      </div>
    );
  }

  const statusData = stats?.statusData || [];
  const growthData = stats?.growthData || [];
  const weeklyListingValue = stats?.weeklyListingValue || [];
  const recentUsers = stats?.recentUsers || [];
  const recentProducts = stats?.recentProducts || [];
  const recentSupportTickets = stats?.recentSupportTickets || [];

  const cards = [
    {
      label: 'Total Users',
      value: formatNumber(stats?.totalUsers),
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      to: '/admin/users',
      helper: `${formatNumber(stats?.newUsersToday)} new today`,
    },
    {
      label: 'Total Ads',
      value: formatNumber(stats?.totalProducts),
      icon: Package,
      color: 'bg-emerald-50 text-emerald-600',
      to: '/admin/products',
      helper: `${formatNumber(stats?.approvedProducts)} approved`,
    },
    {
      label: 'Review Queue',
      value: formatNumber(stats?.reviewQueue),
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      to: '/admin/reports',
      helper: `${formatNumber(stats?.pendingProducts)} pending`,
    },
    {
      label: 'Support Tickets',
      value: formatNumber(stats?.openSupportTickets),
      icon: LifeBuoy,
      color: 'bg-purple-50 text-purple-600',
      to: '/admin/support-tickets',
      helper: `${formatNumber(stats?.urgentSupportTickets)} urgent`,
    },
    {
      label: 'Chats',
      value: formatNumber(stats?.totalChats),
      icon: MessageCircle,
      color: 'bg-indigo-50 text-indigo-600',
      to: '/admin/chats',
      helper: `${formatNumber(stats?.totalMessages)} messages`,
    },
    {
      label: 'Listing Value',
      value: formatCurrency(stats?.listingValue),
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600',
      helper: `${formatNumber(stats?.soldProducts)} sold ads`,
    },
    {
      label: 'Total Views',
      value: formatNumber(stats?.totalViews),
      icon: Eye,
      color: 'bg-cyan-50 text-cyan-600',
      helper: 'Across all ads',
    },
    {
      label: 'Active Users',
      value: formatNumber(stats?.activeUsers),
      icon: CheckCircle2,
      color: 'bg-lime-50 text-lime-600',
      helper: 'Seen in last 15 min',
    },
  ];

  const quickActions = [
    { to: '/admin/reports', icon: Clock, label: 'Review pending ads', value: stats?.reviewQueue || 0, color: 'text-amber-600 bg-amber-50' },
    { to: '/admin/support-tickets', icon: LifeBuoy, label: 'Handle complaints', value: stats?.openSupportTickets || 0, color: 'text-purple-600 bg-purple-50' },
    { to: '/admin/users', icon: Users, label: 'Manage users', value: stats?.totalUsers || 0, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <Shield size={18} />
              Live Admin Overview
            </div>
            <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">Dashboard Overview</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Welcome back, <span className="font-bold text-gray-900">{user?.name || 'Admin'}</span>. All numbers below are loaded from current platform data.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Today</p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-black text-gray-950">{formatNumber(stats?.todayProducts)}</p>
                <p className="text-sm font-semibold text-gray-600">new ads</p>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-950">{formatNumber(stats?.newUsersToday)}</p>
                <p className="text-sm font-semibold text-gray-600">new users</p>
              </div>
            </div>
            <p className={`mt-4 text-sm font-bold ${Number(stats?.todayDelta || 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {Number(stats?.todayDelta || 0) >= 0 ? '+' : ''}{formatNumber(stats?.todayDelta)} ads vs yesterday
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard
          title="Ad Status"
          icon={BarChart3}
          action={<Link to="/admin/products" className="text-sm font-bold text-emerald-600">Manage</Link>}
        >
          {statusData.length ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={86}>
                    {statusData.map((entry) => <Cell key={entry.status} fill={statusColors[entry.status] || statusColors.unknown} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3">
                {statusData.map((item) => (
                  <div key={item.status} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <span className="h-3 w-3 rounded-full" style={{ background: statusColors[item.status] || statusColors.unknown }} />
                    {item.name}: {formatNumber(item.value)}
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyChart label="No ad status data yet" />}
        </ChartCard>

        <ChartCard title="6 Month Growth" icon={TrendingUp}>
          {growthData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <ReLineChart data={growthData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" name="Users" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="products" name="Products" stroke="#10b981" strokeWidth={3} dot={false} />
              </ReLineChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No growth data yet" />}
        </ChartCard>

        <ChartCard title="Weekly Listing Value" icon={BarChart3}>
          {weeklyListingValue.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={weeklyListingValue}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="listingValue" name="Listing Value" fill="#f97316" radius={[8, 8, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No listing value data yet" />}
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-gray-950">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {quickActions.map(({ to, icon: Icon, label, value, color }) => (
              <Link key={label} to={to} className="rounded-2xl border border-gray-100 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={23} />
                </div>
                <p className="text-2xl font-black text-gray-950">{formatNumber(value)}</p>
                <p className="mt-1 text-sm font-bold text-gray-600">{label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-950">
            <AlertTriangle size={20} className="text-amber-600" />
            Operations Snapshot
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
              <span className="font-semibold text-amber-800">Pending ads</span>
              <span className="font-black text-amber-900">{formatNumber(stats?.pendingProducts)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-purple-50 px-4 py-3">
              <span className="font-semibold text-purple-800">Urgent tickets</span>
              <span className="font-black text-purple-900">{formatNumber(stats?.urgentSupportTickets)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
              <span className="font-semibold text-red-800">Rejected ads</span>
              <span className="font-black text-red-900">{formatNumber(stats?.rejectedProducts)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RecentList title="Recent Users" icon={Users} to="/admin/users" empty="No users yet">
          {recentUsers.map((item) => (
            <ListRow
              key={item._id}
              title={item.name}
              subtitle={item.email}
              meta={item.isBlocked ? 'blocked' : item.role}
              tone={item.isBlocked ? 'red' : 'gray'}
            />
          ))}
        </RecentList>

        <RecentList title="Recent Ads" icon={Package} to="/admin/products" empty="No ads yet">
          {recentProducts.map((item) => (
            <ListRow
              key={item._id}
              title={item.title}
              subtitle={`${formatCurrency(item.price)} | ${item.category || 'Uncategorized'}`}
              meta={item.status}
              tone={item.status === 'approved' ? 'green' : item.status === 'pending' ? 'amber' : 'gray'}
            />
          ))}
        </RecentList>

        <RecentList title="Recent Support" icon={LifeBuoy} to="/admin/support-tickets" empty="No tickets yet">
          {recentSupportTickets.map((item) => (
            <ListRow
              key={item._id}
              title={item.subject}
              subtitle={`${item.ticketNumber} | ${item.user?.email || 'Unknown user'}`}
              meta={labelize(item.status)}
              tone={item.priority === 'urgent' ? 'red' : item.status === 'resolved' ? 'green' : 'purple'}
            />
          ))}
        </RecentList>
      </section>
    </div>
  );
};

const toneClasses = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  purple: 'bg-purple-50 text-purple-700',
};

const RecentList = ({ title, icon: Icon, to, empty, children }) => {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-black text-gray-950">
          <Icon size={20} className="text-emerald-600" />
          {title}
        </h2>
        <Link to={to} className="text-sm font-bold text-emerald-600">View all</Link>
      </div>
      <div className="space-y-3">
        {hasChildren ? children : <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm font-semibold text-gray-500">{empty}</div>}
      </div>
    </section>
  );
};

const ListRow = ({ title, subtitle, meta, tone = 'gray' }) => (
  <div className="rounded-xl border border-gray-100 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-bold text-gray-950">{title || 'Untitled'}</p>
        <p className="mt-1 truncate text-sm text-gray-500">{subtitle || '-'}</p>
      </div>
      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${toneClasses[tone] || toneClasses.gray}`}>
        {meta || 'active'}
      </span>
    </div>
  </div>
);

export default AdminDashboard;
