import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  Gauge,
  Infinity as InfinityIcon,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const defaultLimits = {
  daily: 5,
  weekendDaily: 10,
  monthly: 50,
  unlimited: false,
};

const getLimits = (limits = {}) => ({
  daily: Number(limits.daily ?? defaultLimits.daily),
  weekendDaily: Number(limits.weekendDaily ?? defaultLimits.weekendDaily),
  monthly: Number(limits.monthly ?? defaultLimits.monthly),
  unlimited: Boolean(limits.unlimited),
});

const NumberField = ({ label, value, onChange, disabled }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    <input
      type="number"
      min="0"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-400"
    />
  </label>
);

const UsageBar = ({ used, limit, unlimited }) => {
  const percentage = unlimited || !limit ? 0 : Math.min((used / limit) * 100, 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-600">{unlimited ? 'Unlimited access' : `${used}/${limit} used`}</span>
        {!unlimited && <span className="text-gray-400">{Math.max(limit - used, 0)} left</span>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const AdminUserLimits = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', role: 'user', status: 'all', page: 1, limit: 10 });
  const [editingUser, setEditingUser] = useState(null);
  const [limitForm, setLimitForm] = useState(defaultLimits);
  const [bulkForm, setBulkForm] = useState({ ...defaultLimits, role: 'user' });

  const { data: limitsData = { users: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminUserLimits', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        role: filters.role,
        status: filters.status,
        page: String(filters.page),
        limit: String(filters.limit),
      });
      if (filters.search.trim()) params.set('search', filters.search.trim());
      const res = await api.get(`/admin/user-limits?${params}`);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, limits }) => api.put(`/admin/users/${userId}/ad-limits`, limits),
    onSuccess: () => {
      toast.success('User limits updated');
      queryClient.invalidateQueries({ queryKey: ['adminUserLimits'] });
      closeEdit();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update limits'),
  });

  const bulkMutation = useMutation({
    mutationFn: (payload) => api.put('/admin/user-limits/bulk', payload),
    onSuccess: (res) => {
      const modified = res.data?.data?.modified ?? 0;
      toast.success(`Limits applied to ${modified} users`);
      queryClient.invalidateQueries({ queryKey: ['adminUserLimits'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Bulk update failed'),
  });

  const openEdit = (user) => {
    setEditingUser(user);
    setLimitForm(getLimits(user.adPostingLimits));
  };

  const closeEdit = () => {
    setEditingUser(null);
    setLimitForm(defaultLimits);
  };

  const submitUserLimits = (event) => {
    event.preventDefault();
    updateMutation.mutate({ userId: editingUser._id, limits: limitForm });
  };

  const submitBulkLimits = (event) => {
    event.preventDefault();
    if (!confirm(`Apply these ad limits to ${bulkForm.role === 'all' ? 'all users' : bulkForm.role + ' accounts'}?`)) return;
    bulkMutation.mutate(bulkForm);
  };

  const users = limitsData.users || [];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Gauge size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Ad Limits</h1>
            <p className="text-gray-600">Control daily, weekend, monthly, and unlimited posting access for every account.</p>
          </div>
        </div>
      </div>

      <form onSubmit={submitBulkLimits} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <SlidersHorizontal size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Apply Limits in Bulk</h2>
            <p className="text-sm text-gray-500">Use this for everyone, all users, or admin accounts only.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Apply To</span>
            <select
              value={bulkForm.role}
              onChange={(event) => setBulkForm({ ...bulkForm, role: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="user">All Users</option>
              <option value="admin">Admins</option>
              <option value="all">Every Account</option>
            </select>
          </label>
          <NumberField label="Daily Ads" value={bulkForm.daily} disabled={bulkForm.unlimited} onChange={(daily) => setBulkForm({ ...bulkForm, daily })} />
          <NumberField label="Weekend Ads" value={bulkForm.weekendDaily} disabled={bulkForm.unlimited} onChange={(weekendDaily) => setBulkForm({ ...bulkForm, weekendDaily })} />
          <NumberField label="Monthly Ads" value={bulkForm.monthly} disabled={bulkForm.unlimited} onChange={(monthly) => setBulkForm({ ...bulkForm, monthly })} />
          <div className="flex items-end gap-3">
            <label className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={bulkForm.unlimited}
                onChange={(event) => setBulkForm({ ...bulkForm, unlimited: event.target.checked })}
                className="h-4 w-4 rounded"
              />
              Unlimited
            </label>
            <button
              type="submit"
              disabled={bulkMutation.isPending}
              className="flex h-[50px] items-center justify-center rounded-xl bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              title="Apply bulk limits"
            >
              <Save size={18} />
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Search users by name or email..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filters.role}
            onChange={(event) => setFilters({ ...filters, role: event.target.value, page: 1 })}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="user">Users</option>
            <option value="admin">Admins</option>
            <option value="all">All Roles</option>
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading user limits...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <p className="font-semibold text-gray-900">No users found</p>
            <p className="text-sm text-gray-500">Try another filter or search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-5">User</th>
                  <th className="p-5">Posting Limits</th>
                  <th className="p-5">Today</th>
                  <th className="p-5">This Month</th>
                  <th className="p-5">Access</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const limits = getLimits(user.adPostingLimits);
                  const usage = user.adUsage || {};
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <UserCog size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Daily {limits.daily}</span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Weekend {limits.weekendDaily}</span>
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">Monthly {limits.monthly}</span>
                        </div>
                      </td>
                      <td className="min-w-48 p-5">
                        <UsageBar used={usage.today || 0} limit={usage.activeDailyLimit || limits.daily} unlimited={limits.unlimited} />
                      </td>
                      <td className="min-w-48 p-5">
                        <UsageBar used={usage.month || 0} limit={limits.monthly} unlimited={limits.unlimited} />
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${limits.unlimited ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                          {limits.unlimited ? <InfinityIcon size={14} /> : <CalendarDays size={14} />}
                          {limits.unlimited ? 'Unlimited' : usage.isWeekend ? 'Weekend limit active' : 'Daily limit active'}
                        </span>
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => openEdit(user)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          <ShieldCheck size={16} />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {limitsData.pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={filters.page <= 1}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {filters.page} of {limitsData.pages}</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page >= limitsData.pages}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
          <span className="text-gray-500">({limitsData.total} total)</span>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitUserLimits} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manage Ad Limits</h2>
                <p className="text-sm text-gray-500">{editingUser.name} - {editingUser.email}</p>
              </div>
              <button type="button" onClick={closeEdit} className="rounded-lg p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <NumberField label="Daily Ads" value={limitForm.daily} disabled={limitForm.unlimited} onChange={(daily) => setLimitForm({ ...limitForm, daily })} />
              <NumberField label="Weekend Ads" value={limitForm.weekendDaily} disabled={limitForm.unlimited} onChange={(weekendDaily) => setLimitForm({ ...limitForm, weekendDaily })} />
              <NumberField label="Monthly Ads" value={limitForm.monthly} disabled={limitForm.unlimited} onChange={(monthly) => setLimitForm({ ...limitForm, monthly })} />
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 md:col-span-3">
                <input
                  type="checkbox"
                  checked={limitForm.unlimited}
                  onChange={(event) => setLimitForm({ ...limitForm, unlimited: event.target.checked })}
                  className="h-4 w-4 rounded"
                />
                <span className="font-semibold text-gray-700">Give this user unlimited ad posting access</span>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeEdit} className="rounded-xl border px-5 py-2 font-semibold">Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white disabled:opacity-60">
                {updateMutation.isPending ? 'Saving...' : 'Save Limits'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminUserLimits;
