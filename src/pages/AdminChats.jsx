import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { MessageSquare, Search, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminChats = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  const { data = { chats: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminChats', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/admin/chats?${params}`);
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/chats/${id}`),
    onSuccess: () => {
      toast.success('Chat deleted');
      queryClient.invalidateQueries({ queryKey: ['adminChats'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MessageSquare size={40} className="text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chats Control</h1>
          <p className="text-gray-600">{data.total} conversations across the marketplace</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
            placeholder="Search product, buyer, seller, or last message..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading chats...</div>
        ) : data.chats.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No chats found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-5">Conversation</th>
                  <th className="p-5">Participants</th>
                  <th className="p-5">Last Message</th>
                  <th className="p-5">Unread</th>
                  <th className="p-5">Updated</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.chats.map((chat) => (
                  <tr key={chat._id} className="hover:bg-gray-50">
                    <td className="p-5">
                      <p className="font-semibold text-gray-900">{chat.title}</p>
                      <p className="text-sm text-gray-500">{chat.product ? `₹${chat.product.price?.toLocaleString()}` : 'No product attached'}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users size={16} />
                        {(chat.participants || []).map((user) => user.name || user.email).join(', ')}
                      </div>
                    </td>
                    <td className="p-5 max-w-md truncate text-sm text-gray-600">{chat.lastMessage?.text || 'No messages yet'}</td>
                    <td className="p-5">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{chat.unread || 0}</span>
                    </td>
                    <td className="p-5 text-sm text-gray-500">{new Date(chat.updatedAt).toLocaleString()}</td>
                    <td className="p-5">
                      <button
                        onClick={() => {
                          if (confirm('Delete this chat and all messages?')) deleteMutation.mutate(chat._id);
                        }}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.pages > 1 && (
        <div className="flex justify-center gap-3 text-sm">
          <button onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={filters.page <= 1} className="rounded-lg border px-3 py-2 disabled:opacity-50">Previous</button>
          <span className="px-3 py-2">Page {data.page} of {data.pages}</span>
          <button onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))} disabled={filters.page >= data.pages} className="rounded-lg border px-3 py-2 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminChats;
