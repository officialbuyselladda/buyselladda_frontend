import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, Folder } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';

const mockCategories = [
  { _id: '1', name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, gadgets', status: 'active', productCount: 245, createdAt: '2024-01-15' },
  { _id: '2', name: 'Vehicles', slug: 'vehicles', description: 'Cars, bikes, trucks', status: 'active', productCount: 89, createdAt: '2024-01-14' },
  { _id: '3', name: 'Furniture', slug: 'furniture', description: 'Home & office furniture', status: 'pending', productCount: 34, createdAt: '2024-01-13' },
];

const AdminCategories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    page: parseInt(searchParams.get('page')) || 1,
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: categoriesData = { categories: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminCategories', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      params.append('page', filters.page);
      params.append('limit', 10);
      const res = await api.get(`/admin/categories?${params}`);
      return res.data.data;
    },
  });

  const categories = categoriesData.categories || [];

  const deleteMutation = useMutation({
    mutationFn: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries(['adminCategories']);
    },
    onError: () => toast.error('Delete failed'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/categories/${id}/status`, { status }),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries(['adminCategories']);
    },
  });

  const handleBulkDelete = () => {
    if (selectedCategories.length === 0) return toast.error('Select categories');
    if (confirm(`Delete ${selectedCategories.length} categories?`)) {
      selectedCategories.forEach(id => deleteMutation.mutate(id));
      setSelectedCategories([]);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      accessor: 'name',
      cell: (category) => (
        <div>
          <div className="font-semibold">{category.name}</div>
          <div className="text-sm text-gray-500">{category.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      accessor: 'description',
      cell: (category) => <p className="line-clamp-2">{category.description}</p>,
    },
    {
      key: 'productCount',
      header: 'Products',
      accessor: 'productCount',
      cell: (category) => <span className="font-semibold">{category.productCount.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      cell: (category) => <StatusBadge status={category.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      cell: (category) => new Date(category.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      cell: (category) => (
        <div className="flex gap-2">
          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
            <Edit size={16} />
          </button>
          <ConfirmationModal
            title="Delete Category"
            message="This will delete the category and all associations. Sure?"
            onConfirm={() => deleteMutation.mutate(category._id)}
          >
            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 size={16} />
            </button>
          </ConfirmationModal>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">{categories.length} categories • Page {filters.page} of {categoriesData.pages}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkDelete}
            disabled={selectedCategories.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete Selected ({selectedCategories.length})
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 flex items-center gap-2 shadow-lg"
          >
            <Plus size={18} />
            New Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8 p-4 bg-gray-50 rounded-2xl">
          <div className="flex gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={categories}
          enableSelection
          selectedRows={selectedCategories}
          onSelectionChange={setSelectedCategories}
          pagination={{
            page: filters.page,
            pages: categoriesData.pages,
            total: categoriesData.total
          }}
          onPageChange={(page) => setFilters({...filters, page })}
          loading={isLoading}
          emptyState="No categories found. Create your first category!"
          className="shadow-2xl"
        />
      </div>

      {/* Create Modal - Simplified */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Folder size={28} className="text-emerald-600" />
              New Category
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea rows="3" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-vertical" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" className="flex-1 px-6 py-2 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

