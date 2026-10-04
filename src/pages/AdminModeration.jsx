import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusStyles = {
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  suspicious: 'border-orange-200 bg-orange-50 text-orange-700',
  rejected: 'border-red-200 bg-red-50 text-red-700',
  reviewed: 'border-blue-200 bg-blue-50 text-blue-700',
  dismissed: 'border-gray-200 bg-gray-50 text-gray-700',
};

const safeDateTime = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-IN') : 'Recently';
};

const AdminModeration = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', status: 'all', type: 'all', page: 1, limit: 10 });
  const [selectedItems, setSelectedItems] = useState([]);

  const {
    data: moderationData = { items: [], total: 0, page: 1, pages: 1 },
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminModeration', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) params.append(key, value);
      });
      const res = await api.get(`/admin/moderation?${params.toString()}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (error) toast.error(error.response?.data?.message || 'Failed to load moderation queue');
  }, [error]);

  const items = moderationData.items || [];
  const itemIds = items.map((item) => item.id || item._id || item.productId).filter(Boolean);
  const allPageSelected = itemIds.length > 0 && itemIds.every((id) => selectedItems.includes(id));

  const stats = useMemo(() => {
    const pending = items.filter((item) => ['pending', 'suspicious'].includes(item.status)).length;
    const userReports = items.filter((item) => item.type === 'user').length;
    const productReports = items.filter((item) => item.type === 'product').length;
    return [
      { label: 'Total Queue', value: moderationData.total || 0, icon: ShieldAlert, tone: 'orange' },
      { label: 'Needs Review', value: pending, icon: Clock, tone: 'amber' },
      { label: 'User Reports', value: userReports, icon: Ban, tone: 'red' },
      { label: 'Product Reports', value: productReports, icon: Eye, tone: 'blue' },
    ];
  }, [items, moderationData.total]);

  const invalidateQueue = () => {
    queryClient.invalidateQueries({ queryKey: ['adminModeration'] });
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
  };

  const banUserMutation = useMutation({
    mutationFn: (userId) => api.put(`/admin/users/${userId}/block`),
    onSuccess: () => {
      toast.success('User status updated');
      invalidateQueue();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'User action failed'),
  });

  const approveProductMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/approve`),
    onSuccess: () => {
      toast.success('Product approved');
      invalidateQueue();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Approve failed'),
  });

  const rejectProductMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/reject`),
    onSuccess: () => {
      toast.success('Product rejected');
      invalidateQueue();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reject failed'),
  });

  const getItemId = (item) => item.id || item._id || item.productId;
  const getProductId = (item) => item.productId || item.id;

  const toggleSelect = (id) => {
    setSelectedItems((current) => (
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]
    ));
  };

  const toggleSelectPage = () => {
    setSelectedItems((current) => {
      if (allPageSelected) return current.filter((id) => !itemIds.includes(id));
      return Array.from(new Set([...current, ...itemIds]));
    });
  };

  const approveSelectedProducts = () => {
    const productIds = items
      .filter((item) => selectedItems.includes(getItemId(item)) && item.type === 'product')
      .map(getProductId)
      .filter(Boolean);
    if (productIds.length === 0) {
      toast.error('Select product items first');
      return;
    }
    if (!confirm(`Approve ${productIds.length} selected products?`)) return;
    productIds.forEach((id) => approveProductMutation.mutate(id));
    setSelectedItems([]);
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > (moderationData.pages || 1)) return;
    setFilters((current) => ({ ...current, page: nextPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black uppercase text-orange-700">
              <ShieldAlert size={14} />
              Trust and Safety
            </div>
            <h1 className="text-3xl font-black text-gray-950">Moderation Queue</h1>
            <p className="mt-1 text-sm text-gray-600">Review product approvals, suspicious ads, and user reports from one workspace.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <RefreshCw size={17} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={approveSelectedProducts}
              disabled={selectedItems.length === 0 || approveProductMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={17} />
              Approve Selected
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase text-gray-500">{label}</span>
                <span className={`rounded-xl p-2 ${
                  tone === 'orange' ? 'bg-orange-50 text-orange-700' :
                  tone === 'amber' ? 'bg-amber-50 text-amber-700' :
                  tone === 'red' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="text-2xl font-black text-gray-950">{Number(value).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
                placeholder="Search reason, title, user, or details"
                className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </div>
            <select
              value={filters.type}
              onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value, page: 1 }))}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            >
              <option value="all">All types</option>
              <option value="product">Products</option>
              <option value="user">Users</option>
            </select>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="suspicious">Suspicious</option>
              <option value="rejected">Declined</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
              <input type="checkbox" className="rounded border-gray-300" checked={allPageSelected} onChange={toggleSelectPage} />
              Select page
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-xl font-black text-gray-950">No moderation items</h2>
              <p className="mt-1 text-sm text-gray-500">Queue is clean for the selected filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const itemId = getItemId(item);
                const productId = getProductId(item);
                const user = item.user || {};
                const isUserReport = item.type === 'user';
                const status = item.status || 'pending';
                return (
                  <article key={itemId} className="p-5 transition hover:bg-gray-50">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <label className="flex items-center gap-3 lg:w-10">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedItems.includes(itemId)}
                          onChange={() => toggleSelect(itemId)}
                        />
                      </label>

                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isUserReport ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                        {isUserReport ? <Ban size={22} /> : <ShieldAlert size={22} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-black capitalize ${statusStyles[status] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                            {status}
                          </span>
                          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-black capitalize text-gray-700">
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-gray-500">{safeDateTime(item.date)}</span>
                        </div>

                        <h3 className="line-clamp-1 text-base font-black text-gray-950">
                          {item.title || item.reason || 'Moderation item'}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-600">
                          {item.details || item.reason || 'Needs admin review.'}
                        </p>
                        <p className="mt-2 text-xs font-bold text-gray-500">
                          User: {user.name || 'Unknown'} {user.email ? `- ${user.email}` : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {!isUserReport && productId && (
                          <Link
                            to={`/products/${productId}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-700 hover:bg-gray-50"
                          >
                            <Eye size={16} />
                            View
                          </Link>
                        )}
                        {isUserReport ? (
                          <button
                            onClick={() => user._id && banUserMutation.mutate(user._id)}
                            disabled={!user._id || banUserMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {user.isBlocked ? <UserCheck size={16} /> : <Ban size={16} />}
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => productId && approveProductMutation.mutate(productId)}
                              disabled={!productId || approveProductMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <CheckCircle2 size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => productId && rejectProductMutation.mutate(productId)}
                              disabled={!productId || rejectProductMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              <XCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {moderationData.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Page {moderationData.page || filters.page} of {moderationData.pages || 1} - {Number(moderationData.total || 0).toLocaleString('en-IN')} total
              </p>
              <div className="flex gap-2">
                <button onClick={() => changePage(filters.page - 1)} disabled={filters.page <= 1} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-50">
                  Previous
                </button>
                <button onClick={() => changePage(filters.page + 1)} disabled={filters.page >= (moderationData.pages || 1)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModeration;
