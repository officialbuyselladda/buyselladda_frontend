import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Bell, Mail, Search, Send, Trash2, User } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminNotifications = () => {
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });
  const [form, setForm] = useState({
    user: '',
    sendToAll: false,
    sendEmail: true,
    title: '',
    message: '',
    type: 'system',
    priority: 'medium',
  });
  const queryClient = useQueryClient();

  const { data: notificationsData = { notifications: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminNotifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/admin/notifications?${params}`);
      return res.data.data;
    },
  });

  const { data: usersData = { users: [] } } = useQuery({
    queryKey: ['adminNotificationUsers'],
    queryFn: async () => {
      const res = await api.get('/admin/users?limit=100&role=user');
      return res.data.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/notifications', payload),
    onSuccess: (res) => {
      const count = res.data?.data?.recipientsCount || 1;
      toast.success(`Notification sent to ${count} user${count > 1 ? 's' : ''}`);
      setForm((current) => ({ ...current, title: '', message: '' }));
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to send notification'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/notifications/${id}`),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
  });

  const submitNotification = (event) => {
    event.preventDefault();
    if (!form.sendToAll && !form.user) {
      toast.error('Select a user or send to all users');
      return;
    }
    sendMutation.mutate({
      user: form.sendToAll ? undefined : form.user,
      sendToAll: form.sendToAll,
      sendEmail: form.sendEmail,
      title: form.title,
      message: form.message,
      type: form.type,
      priority: form.priority,
    });
  };

  const notifications = notificationsData.notifications || [];

  const columns = [
    {
      key: 'user',
      header: 'User',
      cell: (notif) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <User size={16} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{notif.user?.name || 'Unknown'}</p>
            <p className="text-xs text-gray-500">{notif.user?.email || '-'}</p>
          </div>
        </div>
      ),
    },
    { key: 'title', header: 'Title', cell: (notif) => <div className="font-semibold line-clamp-1">{notif.title}</div> },
    { key: 'message', header: 'Message', cell: (notif) => <p className="line-clamp-2 text-sm text-gray-600">{notif.message}</p> },
    { key: 'type', header: 'Type', cell: (notif) => <StatusBadge status={notif.type} /> },
    { key: 'priority', header: 'Priority', cell: (notif) => <StatusBadge status={notif.priority} /> },
    { key: 'sentAt', header: 'Sent', cell: (notif) => new Date(notif.createdAt).toLocaleString() },
    {
      key: 'actions',
      header: '',
      cell: (notif) => (
        <ConfirmationModal title="Delete Notification" message="Delete this notification?" onConfirm={() => deleteMutation.mutate(notif._id)}>
          <button className="rounded-lg p-2 text-red-600 hover:bg-red-50">
            <Trash2 size={16} />
          </button>
        </ConfirmationModal>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <Bell className="text-emerald-600" size={36} />
          Notifications
        </h1>
        <p className="text-gray-600">Send in-app and email notifications to users</p>
      </div>

      <form onSubmit={submitNotification} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Recipient</span>
            <select
              value={form.user}
              onChange={(event) => setForm({ ...form, user: event.target.value })}
              disabled={form.sendToAll}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
            >
              <option value="">Select user</option>
              {(usersData.users || []).map((user) => (
                <option key={user._id} value={user._id}>{user.name} - {user.email}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Title</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" required />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Message</span>
            <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={4} className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Type</span>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3">
              <option value="system">System</option>
              <option value="promotion">Promotion</option>
              <option value="product_status">Product Status</option>
              <option value="favorite_activity">Favorite Activity</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Priority</span>
            <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.sendToAll} onChange={(event) => setForm({ ...form, sendToAll: event.target.checked, user: '' })} />
              Send to all users
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.sendEmail} onChange={(event) => setForm({ ...form, sendEmail: event.target.checked })} />
              <Mail size={15} />
              Send email also
            </label>
          </div>
          <button disabled={sendMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
            <Send size={18} />
            {sendMutation.isPending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
          <Search size={18} className="text-gray-400" />
          <input
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
            placeholder="Search notifications..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <DataTable
          columns={columns}
          data={notifications}
          pagination={{ page: filters.page, pages: notificationsData.pages, total: notificationsData.total }}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          loading={isLoading}
          emptyState="No notifications yet"
        />
      </div>
    </div>
  );
};

export default AdminNotifications;
