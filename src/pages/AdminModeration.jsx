import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldAlert, Search, UserX, Hammer, Gavel, Ban, UserCheck } from 'lucide-react';
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
    mutationFn: (userId) => api.put(`/admin/users/${userId}/ban`),
    onSuccess: () => {
      toast.success('User banned');
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
          <button onClick={() => banUserMutation.mutate(item.user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
            <Ban size={16} />
          </button>
          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded">
            <UserCheck size={16} />
          </button>
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
          emptyState="No moderation items. Good job!"
        />
      </div>
    </div>
  );
};

export default AdminModeration;

