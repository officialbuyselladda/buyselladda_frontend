import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Edit, Folder, Plus, Search, Trash2, X } from 'lucide-react';

const emptyForm = { name: '', description: '', parent: '', icon: '📦', isActive: true, sortOrder: 0 };

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', status: 'all', page: 1, limit: 10 });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data = { categories: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminCategories', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: String(filters.limit),
        status: filters.status,
      });
      if (filters.search.trim()) params.set('search', filters.search.trim());
      const res = await api.get(`/admin/categories?${params}`);
      return res.data.data;
    },
  });

  const { data: allCategoriesData = { categories: [] } } = useQuery({
    queryKey: ['adminCategoriesAll'],
    queryFn: async () => {
      const res = await api.get('/admin/categories?page=1&limit=100&status=all');
      return res.data.data;
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        parent: form.parent || null,
        icon: form.icon.trim(),
        isActive: Boolean(form.isActive),
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (editing) return api.patch(`/admin/categories/${editing._id}`, payload);
      return api.post('/admin/categories', payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminCategoriesAll'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminCategoriesAll'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (category) => api.patch(`/admin/categories/${category._id}`, { isActive: !category.isActive }),
    onSuccess: () => {
      toast.success('Category status updated');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['adminCategoriesAll'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name || '',
      description: category.description || '',
      parent: category.parent?._id || category.parent || '',
      icon: category.icon || '📦',
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
    });
    setModalOpen(true);
  };

  const submitForm = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">{data.total} categories with full admin control</p>
            <p className="text-sm text-gray-500">Active categories automatically appear in navbar, post-ad form, home filters, and category pages.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={18} />
          New Category
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading categories...</div>
        ) : data.categories.length === 0 ? (
          <div className="p-12 text-center">
            <Folder className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <p className="font-semibold text-gray-900">No categories found</p>
            <p className="text-sm text-gray-500">Create a category to organize ads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-5">Category</th>
                  <th className="p-5">Products</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Sort</th>
                  <th className="p-5">Created</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                          {category.icon || '📦'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-400">/{category.slug}</p>
                          <p className="max-w-md truncate text-sm text-gray-500">{category.description || 'No description'}</p>
                          {category.parent?.name && <p className="mt-1 text-xs text-gray-500">Parent: {category.parent.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 font-semibold">{category.productCount || 0}</td>
                    <td className="p-5">
                      <button
                        onClick={() => toggleMutation.mutate(category)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-5">{category.sortOrder || 0}</td>
                    <td className="p-5 text-sm text-gray-500">{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(category)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50">
                          <Edit size={17} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this category?')) deleteMutation.mutate(category._id);
                          }}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={filters.page <= 1}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {filters.page} of {data.pages}</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page >= data.pages}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitForm} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Electronics"
                />
                <span className="mt-1 block text-xs text-gray-400">
                  Slug: /{form.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'category-name'}
                </span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Icon</span>
                  <input
                    value={form.icon}
                    onChange={(event) => setForm({ ...form, icon: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="📱"
                    maxLength={10}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Parent Category</span>
                  <select
                    value={form.parent}
                    onChange={(event) => setForm({ ...form, parent: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Root category</option>
                    {allCategoriesData.categories
                      .filter((category) => category._id !== editing?._id)
                      .map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Phones, laptops, gadgets"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-gray-700">Sort Order</span>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center gap-3 pt-7">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span className="font-semibold text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-xl border px-5 py-2 font-semibold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white disabled:opacity-60"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
