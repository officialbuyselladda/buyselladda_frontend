import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldAlert, Search, Ban, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const AdminModeration = () => {
  const [filters, setFilters] = useState({ search: '', status: 'all', type: 'all', page: 1 });
  const [selectedItems, setSelectedItems] = useState([]);
  const queryClient = useQueryClient();

  const { data: moderationData = { items: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['adminModeration', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/admin/moderation?${params}`);
      return res.data.data;
    },
  });

  const items = moderationData.items || [];

  const banUserMutation = useMutation({
    mutationFn: (userId) => api.put(`/admin/users/${userId}/block`),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries(['adminModeration']);
    },
  });

  const approveProductMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/approve`),
    onSuccess: () => {
      toast.success('Product approved');
      queryClient.invalidateQueries(['adminModeration']);
    },
  });

  const rejectProductMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/reject`),
    onSuccess: () => {
      toast.success('Product rejected');
      queryClient.invalidateQueries(['adminModeration']);
    },
  });

  const columns = [
    {
      key: 'user',
      header: 'User',
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <ShieldAlert size={18} />
          </div>
          <div>
            <div className="font-semibold">{item.user.name}</div>
            <div className="text-sm text-gray-500">{item.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      cell: (item) => <p className="line-clamp-2">{item.reason}</p>,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (item) => <StatusBadge status={item.type} type="warning" />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (item) => (
        <div className="flex gap-1">
          {item.type === 'user' ? (
            <button onClick={() => banUserMutation.mutate(item.user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title={item.user?.isBlocked ? 'Unblock user' : 'Block user'}>
              {item.user?.isBlocked ? <UserCheck size={16} /> : <Ban size={16} />}
            </button>
          ) : (
            <>
              <button onClick={() => approveProductMutation.mutate(item.productId || item.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded" title="Approve product">
                <CheckCircle size={16} />
              </button>
              <button onClick={() => rejectProductMutation.mutate(item.productId || item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Reject product">
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldAlert size={36} className="text-orange-500" />
          Moderation
        </h1>
        <p className="text-gray-600">{items.length} items</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Search reports..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value, page: 1 })} className="rounded-xl border border-gray-200 px-3 py-2.5">
            <option value="all">All types</option>
            <option value="user">User reports</option>
            <option value="product">Product reports</option>
          </select>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })} className="rounded-xl border border-gray-200 px-3 py-2.5">
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="suspicious">Suspicious</option>
            <option value="rejected">Rejected</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-8">
          <h3 className="font-bold text-orange-900 mb-4">Moderation Queue</h3>
          <p className="text-orange-800">Review reports and take action on users/products</p>
        </div>

        <DataTable
          columns={columns}
          data={items}
          enableSelection
          selectedRows={selectedItems}
          onSelectionChange={setSelectedItems}
          loading={isLoading}
          pagination={{ page: filters.page, pages: moderationData.pages, total: moderationData.total }}
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
          emptyState="No moderation items. Good job!"
        />
      </div>
    </div>
  );
};

export default AdminModeration;

