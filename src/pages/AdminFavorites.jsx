import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Eye, Heart, ImageOff, RefreshCw, Search, Trash2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { getImageUrl, placeholderImage } from '../utils/image';

const safeDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-IN') : 'Recently';
};

const priceText = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const statusStyles = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  suspicious: 'bg-orange-50 text-orange-700 border-orange-200',
  sold: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-gray-50 text-gray-700 border-gray-200',
};

const AdminFavorites = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    user: searchParams.get('user') || '',
    page: Number(searchParams.get('page') || 1),
    limit: 12,
  });
  const [selectedFavorites, setSelectedFavorites] = useState([]);

  const {
    data: favoritesData = { favorites: [], total: 0, page: 1, pages: 1, limit: 12 },
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminFavorites', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      if (filters.search.trim()) params.append('search', filters.search.trim());
      if (filters.user.trim()) params.append('userId', filters.user.trim());
      const res = await api.get(`/admin/favorites?${params.toString()}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.user) params.user = filters.user;
    if (filters.page > 1) params.page = String(filters.page);
    setSearchParams(params, { replace: true });
  }, [filters.search, filters.user, filters.page, setSearchParams]);

  useEffect(() => {
    if (error) toast.error(error.response?.data?.message || 'Failed to load favorites');
  }, [error]);

  const favorites = favoritesData.favorites || [];
  const pageIds = favorites.map((favorite) => favorite._id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedFavorites.includes(id));

  const stats = useMemo(() => {
    const uniqueUsers = new Set(favorites.map((favorite) => favorite.user?._id).filter(Boolean)).size;
    const approved = favorites.filter((favorite) => favorite.product?.status === 'approved').length;
    return [
      { label: 'Total Saved', value: favoritesData.total || 0, icon: Heart, tone: 'red' },
      { label: 'Page Users', value: uniqueUsers, icon: UserRound, tone: 'blue' },
      { label: 'Approved Ads', value: approved, icon: Eye, tone: 'emerald' },
      { label: 'This Page', value: favorites.length, icon: CalendarDays, tone: 'orange' },
    ];
  }, [favorites, favoritesData.total]);

  const deleteMutation = useMutation({
    mutationFn: (favoriteId) => api.delete(`/admin/favorites/${favoriteId}`),
    onSuccess: () => {
      toast.success('Favorite removed');
      queryClient.invalidateQueries({ queryKey: ['adminFavorites'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Remove failed'),
  });

  const handleRemove = (favoriteId) => {
    if (confirm('Remove this saved listing from the user account?')) {
      deleteMutation.mutate(favoriteId);
      setSelectedFavorites((current) => current.filter((id) => id !== favoriteId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFavorites.length === 0) {
      toast.error('Select favorites first');
      return;
    }
    if (!confirm(`Remove ${selectedFavorites.length} selected favorites?`)) return;
    await Promise.allSettled(selectedFavorites.map((id) => deleteMutation.mutateAsync(id)));
    setSelectedFavorites([]);
  };

  const toggleSelect = (favoriteId) => {
    setSelectedFavorites((current) => (
      current.includes(favoriteId) ? current.filter((id) => id !== favoriteId) : [...current, favoriteId]
    ));
  };

  const toggleSelectPage = () => {
    setSelectedFavorites((current) => {
      if (allPageSelected) return current.filter((id) => !pageIds.includes(id));
      return Array.from(new Set([...current, ...pageIds]));
    });
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > (favoritesData.pages || 1)) return;
    setFilters((current) => ({ ...current, page: nextPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-black uppercase text-red-700">
              <Heart size={14} />
              Engagement
            </div>
            <h1 className="text-3xl font-black text-gray-950">User Favorites</h1>
            <p className="mt-1 text-sm text-gray-600">Track saved listings, user interest, and remove stale favorites.</p>
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
              onClick={handleBulkDelete}
              disabled={selectedFavorites.length === 0 || deleteMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={17} />
              Remove Selected ({selectedFavorites.length})
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase text-gray-500">{label}</span>
                <span className={`rounded-xl p-2 ${
                  tone === 'red' ? 'bg-red-50 text-red-700' :
                  tone === 'blue' ? 'bg-blue-50 text-blue-700' :
                  tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-orange-50 text-orange-700'
                }`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="text-2xl font-black text-gray-950">{Number(value).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
                placeholder="Search by product, user, email, or category"
                className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </div>
            <input
              value={filters.user}
              onChange={(event) => setFilters((current) => ({ ...current, user: event.target.value, page: 1 }))}
              placeholder="Filter by user ID"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
            />
            <label className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700">
              <input type="checkbox" className="rounded border-gray-300" checked={allPageSelected} onChange={toggleSelectPage} />
              Select page
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Heart size={28} />
              </div>
              <h2 className="text-xl font-black text-gray-950">No favorites found</h2>
              <p className="mt-1 text-sm text-gray-500">Try changing search or user filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {favorites.map((favorite) => {
                const product = favorite.product || {};
                const user = favorite.user || {};
                const image = getImageUrl(product.images?.[0]) || placeholderImage;
                const status = product.status || 'unknown';
                return (
                  <article key={favorite._id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="relative aspect-[16/10] bg-gray-100">
                      <img src={image} alt={product.title || 'Saved listing'} className="h-full w-full object-cover" />
                      <label className="absolute left-3 top-3 inline-flex items-center rounded-xl bg-white/95 p-2 shadow-sm">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedFavorites.includes(favorite._id)}
                          onChange={() => toggleSelect(favorite._id)}
                        />
                      </label>
                      {!product.images?.length && (
                        <span className="absolute right-3 top-3 rounded-xl bg-white/95 p-2 text-gray-500 shadow-sm">
                          <ImageOff size={16} />
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/products/${product._id}`} className="line-clamp-1 text-base font-black text-gray-950 hover:text-orange-600">
                            {product.title || 'Deleted product'}
                          </Link>
                          <p className="mt-1 text-lg font-black text-gray-950">{priceText(product.price)}</p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black capitalize ${statusStyles[status] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                          {status}
                        </span>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                            <UserRound size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-black text-gray-900">{user.name || 'Unknown user'}</p>
                            <p className="line-clamp-1 text-xs font-semibold text-gray-500">{user.email || 'No email'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} />
                          Saved {safeDate(favorite.createdAt)}
                        </span>
                        <button
                          onClick={() => handleRemove(favorite._id)}
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {favoritesData.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Page {favoritesData.page || filters.page} of {favoritesData.pages || 1} - {Number(favoritesData.total || 0).toLocaleString('en-IN')} total
              </p>
              <div className="flex gap-2">
                <button onClick={() => changePage(filters.page - 1)} disabled={filters.page <= 1} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-50">
                  Previous
                </button>
                <button onClick={() => changePage(filters.page + 1)} disabled={filters.page >= (favoritesData.pages || 1)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 disabled:opacity-50">
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

export default AdminFavorites;
