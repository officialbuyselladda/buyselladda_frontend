import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Eye, MessageSquare, RefreshCw, Search, ShieldCheck, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getImageUrl, placeholderImage } from '../utils/image';

const safeDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-IN') : 'Recently';
};

const priceText = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const AdminChats = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  const {
    data = { chats: [], total: 0, page: 1, pages: 1, limit: 10 },
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminChats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      if (filters.search.trim()) params.append('search', filters.search.trim());
      const res = await api.get(`/admin/chats?${params.toString()}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (error) toast.error(error.response?.data?.message || 'Failed to load chats');
  }, [error]);

  const chats = data.chats || [];
  const stats = useMemo(() => {
    const unread = chats.reduce((total, chat) => total + Number(chat.unread || 0), 0);
    const activeProducts = chats.filter((chat) => chat.product).length;
    const flagged = chats.filter((chat) => chat.status === 'flagged').length;
    return [
      { label: 'Total Chats', value: data.total || 0, icon: MessageSquare, tone: 'blue' },
      { label: 'Unread', value: unread, icon: Clock, tone: 'orange' },
      { label: 'Product Chats', value: activeProducts, icon: ShieldCheck, tone: 'emerald' },
      { label: 'Flagged', value: flagged, icon: Eye, tone: 'red' },
    ];
  }, [chats, data.total]);

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/chats/${id}`),
    onSuccess: () => {
      toast.success('Chat deleted');
      queryClient.invalidateQueries({ queryKey: ['adminChats'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleDelete = (chatId) => {
    if (confirm('Delete this chat and all messages permanently?')) {
      deleteMutation.mutate(chatId);
    }
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > (data.pages || 1)) return;
    setFilters((current) => ({ ...current, page: nextPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">
              <MessageSquare size={14} />
              Conversations
            </div>
            <h1 className="text-3xl font-black text-gray-950">Chats Control</h1>
            <p className="mt-1 text-sm text-gray-600">Monitor marketplace conversations, unread activity, and product-linked deal chats.</p>
          </div>

          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <RefreshCw size={17} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase text-gray-500">{label}</span>
                <span className={`rounded-xl p-2 ${
                  tone === 'blue' ? 'bg-blue-50 text-blue-700' :
                  tone === 'orange' ? 'bg-orange-50 text-orange-700' :
                  tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="text-2xl font-black text-gray-950">{Number(value).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
              placeholder="Search product, buyer, seller, or last message"
              className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <MessageSquare size={30} />
              </div>
              <h2 className="text-xl font-black text-gray-950">No chats found</h2>
              <p className="mt-1 text-sm text-gray-500">Try changing your search keyword.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {chats.map((chat) => {
                const product = chat.product;
                const image = getImageUrl(product?.images?.[0]) || placeholderImage;
                const participants = chat.participants || [];
                return (
                  <article key={chat._id} className="p-5 transition hover:bg-gray-50">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-100">
                        {product?.images?.length ? (
                          <img src={image} alt={product?.title || 'Product'} className="h-full w-full object-cover" />
                        ) : (
                          <MessageSquare className="text-gray-400" size={26} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${
                            chat.status === 'flagged' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {chat.status || 'active'}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                            {Number(chat.unread || 0)} unread
                          </span>
                          <span className="text-xs font-bold text-gray-500">{safeDate(chat.updatedAt)}</span>
                        </div>

                        <h3 className="line-clamp-1 text-base font-black text-gray-950">
                          {chat.title || product?.title || 'Direct conversation'}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-sm font-medium text-gray-600">
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                          <Users size={14} />
                          <span className="line-clamp-1">{participants.map((item) => item.name || item.email).filter(Boolean).join(', ') || 'No participants'}</span>
                          {product?.price ? <span className="text-orange-700">{priceText(product.price)}</span> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {product?._id && (
                          <Link
                            to={`/products/${product._id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-black text-gray-700 hover:bg-gray-50"
                          >
                            <Eye size={16} />
                            View Ad
                          </Link>
                        )}
                        <button
                          onClick={() => handleDelete(chat._id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {data.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Page {data.page || filters.page} of {data.pages || 1} - {Number(data.total || 0).toLocaleString('en-IN')} total
              </p>
              <div className="flex gap-2">
                <button onClick={() => changePage(filters.page - 1)} disabled={filters.page <= 1} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-50">
                  Previous
                </button>
                <button onClick={() => changePage(filters.page + 1)} disabled={filters.page >= (data.pages || 1)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-50">
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

export default AdminChats;
