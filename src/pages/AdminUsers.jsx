import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import {
  Ban,
  CheckCircle2,
  Edit3,
  Eye,
  KeyRound,
  Mail,
  MailCheck,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Send,
  Download,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  location: '',
  role: 'user',
  isBlocked: false,
};

const emptyPasswordForm = {
  password: '',
  confirmPassword: '',
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-IN') : 'Recently';
};

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ role: 'all', status: 'all', search: '', page: 1, limit: 10 });
  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedPasswordUser, setSelectedPasswordUser] = useState(null);

  const { data: usersData = { users: [], total: 0, page: 1, pages: 1 }, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        role: filters.role,
        status: filters.status,
        page: String(filters.page),
        limit: String(filters.limit),
      });
      if (filters.search.trim()) params.set('search', filters.search.trim());
      const res = await api.get(`/admin/users?${params}`);
      return res.data.data;
    },
  });

  const { data: selectedUser, isFetching: detailLoading } = useQuery({
    queryKey: ['adminUserDetail', selectedUserId],
    queryFn: () => api.get(`/admin/users/${selectedUserId}`).then((res) => res.data.data),
    enabled: Boolean(selectedUserId) && (modalMode === 'view' || modalMode === 'edit'),
  });

  useEffect(() => {
    if (modalMode === 'edit' && selectedUser) {
      setForm({
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        password: '',
        phone: selectedUser.phone || '',
        location: selectedUser.location || '',
        role: selectedUser.role || 'user',
        isBlocked: Boolean(selectedUser.isBlocked),
      });
    }
  }, [modalMode, selectedUser]);

  const closeModal = () => {
    setModalMode(null);
    setSelectedUserId(null);
    setSelectedPasswordUser(null);
    setForm(emptyForm);
    setPasswordForm(emptyPasswordForm);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        role: form.role,
        isBlocked: Boolean(form.isBlocked),
      };

      if (modalMode === 'add') {
        return api.post('/admin/users', { ...payload, password: form.password });
      }
      return api.put(`/admin/users/${selectedUserId}`, payload);
    },
    onSuccess: () => {
      toast.success(modalMode === 'add' ? 'User created' : 'User updated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const blockMutation = useMutation({
    mutationFn: (userId) => api.put(`/admin/users/${userId}/block`),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Action failed'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }) => api.put(`/admin/users/${userId}/password`, { password }),
    onSuccess: () => {
      toast.success('Password updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Password update failed'),
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (userId) => api.put(`/admin/users/${userId}/verify-email`),
    onSuccess: () => {
      toast.success('User email verified');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserDetail'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not verify email'),
  });

  const resendVerificationMutation = useMutation({
    mutationFn: (userId) => api.post(`/admin/users/${userId}/resend-verification`),
    onSuccess: (response) => {
      toast.success(response.data?.message || 'Verification link sent');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not send verification email'),
  });

  const openAdd = () => {
    setForm(emptyForm);
    setModalMode('add');
  };

  const openView = (userId) => {
    setSelectedUserId(userId);
    setModalMode('view');
  };

  const openEdit = (userId) => {
    setSelectedUserId(userId);
    setModalMode('edit');
  };

  const openPasswordReset = (user) => {
    setSelectedUserId(user._id);
    setSelectedPasswordUser(user);
    setPasswordForm(emptyPasswordForm);
    setModalMode('password');
  };

  const submitForm = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error('Enter a valid email address');
      return;
    }
    if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error('Enter a valid 10 digit Indian mobile number');
      return;
    }
    if (modalMode === 'add' && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    saveMutation.mutate();
  };

  const submitPasswordReset = (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      toast.error('Select a user first');
      return;
    }
    if (passwordForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    resetPasswordMutation.mutate({ userId: selectedUserId, password: passwordForm.password });
  };

  const users = usersData.users || [];
  const pageStats = users.reduce((acc, item) => {
    acc.admins += item.role === 'admin' ? 1 : 0;
    acc.blocked += item.isBlocked ? 1 : 0;
    acc.unverified += !item.isEmailVerified ? 1 : 0;
    acc.ads += Number(item.productCount || 0);
    return acc;
  }, { admins: 0, blocked: 0, unverified: 0, ads: 0 });

  const exportCurrentPage = () => {
    if (!users.length) {
      toast.error('No users to export');
      return;
    }
    const rows = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Email Status', 'Ads', 'Joined'],
      ...users.map((item) => [
        item.name,
        item.email,
        item.phone || '',
        item.role,
        item.isBlocked ? 'Blocked' : 'Active',
        item.isEmailVerified ? 'Verified' : 'Unverified',
        item.productCount || 0,
        formatDate(item.createdAt),
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-page-${filters.page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Users size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Control</h1>
            <p className="text-gray-600">{usersData.total} users with view, edit, block, delete, and add controls</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Page Users', value: users.length, icon: Users, cls: 'bg-blue-50 text-blue-700' },
          { label: 'Admins', value: pageStats.admins, icon: Shield, cls: 'bg-purple-50 text-purple-700' },
          { label: 'Blocked', value: pageStats.blocked, icon: Ban, cls: 'bg-red-50 text-red-700' },
          { label: 'Total Ads', value: pageStats.ads, icon: Eye, cls: 'bg-emerald-50 text-emerald-700' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-gray-500">{label}</span>
              <span className={`rounded-xl p-2 ${cls}`}><Icon size={18} /></span>
            </div>
            <p className="text-2xl font-black text-gray-950">{Number(value).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filters.role}
            onChange={(event) => setFilters({ ...filters, role: event.target.value, page: 1 })}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
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
          <select
            value={filters.limit}
            onChange={(event) => setFilters({ ...filters, limit: Number(event.target.value), page: 1 })}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
            <option value={50}>50 rows</option>
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-bold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={17} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCurrentPage}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-bold text-gray-700 hover:bg-gray-50"
          >
            <Download size={17} />
            Export
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-500">
          <span>{users.length} shown, {usersData.total || 0} total</span>
          {pageStats.unverified > 0 && <span>{pageStats.unverified} unverified on this page</span>}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <p className="font-semibold text-gray-900">No users found</p>
            <p className="text-sm text-gray-500">Try another filter or create a new user.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-5">User</th>
                  <th className="p-5">Contact</th>
                  <th className="p-5">Role</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Ads</th>
                  <th className="p-5">Joined</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isAdminRow = user.role === 'admin';
                  return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                          {user.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">Trust score: {user.trustScore || 0}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <p className="flex items-center gap-2 text-sm text-gray-700"><Mail size={15} /> {user.email}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-gray-500"><Phone size={15} /> {user.phone || 'No phone'}</p>
                    </td>
                    <td className="p-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {user.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="p-5 font-semibold">{user.productCount || 0}</td>
                    <td className="p-5 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="p-5">
                      <div className="flex gap-1">
                        <button onClick={() => openView(user._id)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="View">
                          <Eye size={17} />
                        </button>
                        {!isAdminRow && (
                          <button onClick={() => openEdit(user._id)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Edit">
                            <Edit3 size={17} />
                          </button>
                        )}
                        <button onClick={() => openPasswordReset(user)} className="rounded-lg p-2 text-purple-600 hover:bg-purple-50" title="Reset password">
                          <KeyRound size={17} />
                        </button>
                        {!isAdminRow && (
                          <button onClick={() => blockMutation.mutate(user._id)} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50" title={user.isBlocked ? 'Unblock' : 'Block'}>
                            {user.isBlocked ? <CheckCircle2 size={17} /> : <Ban size={17} />}
                          </button>
                        )}
                        {!user.isEmailVerified && user.role !== 'admin' && (
                          <>
                            <button onClick={() => verifyEmailMutation.mutate(user._id)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Verify email manually">
                              <MailCheck size={17} />
                            </button>
                            <button onClick={() => resendVerificationMutation.mutate(user._id)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Resend verification link">
                              <Send size={17} />
                            </button>
                          </>
                        )}
                        {!isAdminRow && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this user?')) deleteMutation.mutate(user._id);
                            }}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {usersData.pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={filters.page <= 1}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {filters.page} of {usersData.pages}</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page >= usersData.pages}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
          <span className="text-gray-500">({usersData.total} total)</span>
        </div>
      )}

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitForm} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            {detailLoading && modalMode === 'edit' ? (
              <div className="p-10 text-center text-gray-500">Loading user...</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Name</span>
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Email</span>
                  <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                </label>
                {modalMode === 'add' && (
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-gray-700">Password</span>
                    <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                  </label>
                )}
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Phone</span>
                  <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Location</span>
                  <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Role</span>
                  <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="user">User</option>
                    {modalMode === 'add' && <option value="admin">Admin</option>}
                  </select>
                </label>
                <label className="flex items-center gap-3 pt-7">
                  <input type="checkbox" checked={form.isBlocked} onChange={(event) => setForm({ ...form, isBlocked: event.target.checked })} className="h-4 w-4 rounded" />
                  <span className="font-semibold text-gray-700">Blocked</span>
                </label>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-xl border px-5 py-2 font-semibold">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending || detailLoading} className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white disabled:opacity-60">
                {saveMutation.isPending ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalMode === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitPasswordReset} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reset User Password</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedPasswordUser?.name || 'Selected user'} - {selectedPasswordUser?.email || ''}
                </p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm font-semibold text-purple-800">
              This will immediately replace the account password. The user will need the new password for the next login.
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">New password</span>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  autoComplete="new-password"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Confirm password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  autoComplete="new-password"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-xl border px-5 py-2 font-semibold">Cancel</button>
              <button type="submit" disabled={resetPasswordMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white disabled:opacity-60">
                <KeyRound size={16} />
                {resetPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalMode === 'view' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-10 text-center text-gray-500">Loading user...</div>
            ) : selectedUser ? (
              <div className="space-y-6">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{selectedUser.name}</p>
                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                      </div>
                    </div>
                    <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${selectedUser.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                    <p className="flex items-center gap-2 text-gray-700"><Phone size={16} /> {selectedUser.phone || 'No phone'}</p>
                    <p className="flex items-center gap-2 text-gray-700"><MapPin size={16} /> {selectedUser.location || 'No location'}</p>
                    <p className="flex items-center gap-2 text-gray-700"><Shield size={16} /> {selectedUser.role}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedUser.isEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      Email {selectedUser.isEmailVerified ? 'verified' : 'not verified'}
                    </span>
                    {!selectedUser.isEmailVerified && selectedUser.role !== 'admin' && (
                      <>
                        <button onClick={() => verifyEmailMutation.mutate(selectedUser._id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                          <MailCheck size={16} />
                          Verify Email
                        </button>
                        <button onClick={() => resendVerificationMutation.mutate(selectedUser._id)} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">
                          <Send size={16} />
                          Resend Link
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Recent Ads</h3>
                    <span className="text-sm text-gray-500">{selectedUser.productCount || 0} shown</span>
                  </div>
                  {selectedUser.products?.length ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {selectedUser.products.map((product) => (
                        <div key={product._id} className="rounded-xl border border-gray-100 p-4">
                          <p className="font-semibold text-gray-900">{product.title}</p>
                          <p className="text-sm text-gray-500">₹{product.price?.toLocaleString()} • {product.category}</p>
                          <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{product.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">No ads posted yet</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
