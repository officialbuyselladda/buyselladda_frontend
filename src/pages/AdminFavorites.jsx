import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Heart, Search, Filter, Trash2, User, Package, Clock } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminFavorites = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    user: searchParams.get('user') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const queryClient = useQueryClient();

  const { data: favoritesData = { favorites: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminFavorites', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.user) params.append('userId', filters.user);
      params.append('page', filters.page);
      params.append('limit', 10);
      const res = await api.get(`/admin/favorites?${params}`);
      return res.data.data;
    },
  });

  const favorites = favoritesData.favorites || [];

  const deleteMutation = useMutation({
    mutationFn: (favoriteId) => api.delete(`/admin/favorites/${favoriteId}`),
    onSuccess: () => {
      toast.success('Favorite removed');
      queryClient.invalidateQueries(['adminFavorites']);
    },
  });

  const handleBulkDelete = () => {
    if (selectedFavorites.length === 0) return toast.error('Select favorites');
    if (confirm(`Remove ${selectedFavorites.length} favorites?`)) {
      selectedFavorites.forEach(id => deleteMutation.mutate(id));
      setSelectedFavorites([]);
    }
  };

  const columns = [
    {
      key: 'user',
      header: 'User',
      accessor: 'user.name',
      cell: (favorite) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div>
            <div className="font-semibold">{favorite.user.name}</div>
            <div className="text-sm text-gray-500">{favorite.user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      accessor: 'product.title',
      cell: (favorite) => (
        <div className="font-semibold line-clamp-1">{favorite.product.title}</div>
      ),
    },
    {
      key: 'savedAt',
      header: 'Saved',
      accessor: 'createdAt',
      cell: (favorite) => new Date(favorite.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      cell: (favorite) => (
        <ConfirmationModal
          title="Remove Favorite"
          message="Remove this favorite from user?"
          onConfirm={() => deleteMutation.mutate(favorite._id)}
        >
          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={16} />
          </button>
        </ConfirmationModal>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="text-red-500" size={36} />
            User Favorites
          </h1>
          <p className="text-gray-600">{favorites.length} favorites • {favoritesData.total} total</p>
        </div>
        <button
          onClick={handleBulkDelete}
          disabled={selectedFavorites.length === 0}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Trash2 size={18} />
          Remove Selected ({selectedFavorites.length})
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex gap-3 flex-1 p-4 bg-gray-50 rounded-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products or users..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1 })}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <input
            type="text"
            placeholder="User ID"
            value={filters.user}
            onChange={(e) => setFilters({...filters, user: e.target.value, page: 1 })}
            className="w-48 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <DataTable
          columns={columns}
          data={favorites}
          enableSelection
          selectedRows={selectedFavorites}
          onSelectionChange={setSelectedFavorites}
          pagination={{
            page: filters.page,
            pages: favoritesData.pages,
            total: favoritesData.total
          }}
          onPageChange={(page) => setFilters({...filters, page })}
          loading={isLoading}
          emptyState="No favorites found"
          className="shadow-2xl"
        />
      </div>
    </div>
  );
};

export default AdminFavorites;

