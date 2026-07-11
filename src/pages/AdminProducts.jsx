import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  ImageOff,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { PRODUCT_STATUS } from '../utils';
import { getImageUrl, placeholderImage } from '../utils/image';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspicious', label: 'Suspicious' },
  { value: 'paused', label: 'Paused' },
  { value: 'sold', label: 'Sold' },
];

const statusStyles = {
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  suspicious: 'bg-rose-100 text-rose-800 border-rose-200',
  paused: 'bg-gray-100 text-gray-700 border-gray-200',
  sold: 'bg-blue-100 text-blue-800 border-blue-200',
};

const safeDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-IN') : 'Recently';
};

const priceText = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'all', search: '', page: 1, limit: 10 });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);

  const {
    data: productsData = { products: [], total: 0, page: 1, pages: 1 },
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['adminProducts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', filters.status);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      if (filters.search.trim()) params.append('search', filters.search.trim());
      const res = await api.get(`/admin/products?${params.toString()}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (error) toast.error(error.response?.data?.message || 'Failed to load products');
  }, [error]);

  const products = productsData.products || [];
  const currentIds = products.map((product) => product._id);
  const allCurrentSelected = currentIds.length > 0 && currentIds.every((id) => selectedProducts.includes(id));

  const pageStats = useMemo(() => {
    const counts = products.reduce((acc, product) => {
      const status = product.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      acc.views += Number(product.views || 0);
      return acc;
    }, { pending: 0, approved: 0, rejected: 0, suspicious: 0, paused: 0, sold: 0, views: 0 });

    return [
      { label: 'Pending', value: counts.pending + counts.suspicious, icon: Clock, tone: 'amber' },
      { label: 'Approved', value: counts.approved, icon: ShieldCheck, tone: 'emerald' },
      { label: 'Rejected', value: counts.rejected, icon: XCircle, tone: 'red' },
      { label: 'Views', value: counts.views, icon: Eye, tone: 'blue' },
    ];
  }, [products]);

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
  };

  const approveMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/approve`),
    onSuccess: () => {
      toast.success('Product approved');
      invalidateProducts();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Approve failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/reject`),
    onSuccess: () => {
      toast.success('Product rejected');
      invalidateProducts();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Reject failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => api.delete(`/admin/products/${productId}`),
    onSuccess: () => {
      toast.success('Product deleted');
      invalidateProducts();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleApprove = (productId) => approveMutation.mutate(productId);
  const handleReject = (productId) => rejectMutation.mutate(productId);
  const handleDelete = (productId) => {
    if (confirm('Delete this product permanently?')) deleteMutation.mutate(productId);
  };

  const toggleSelect = (productId) => {
    setSelectedProducts((prev) => (
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    ));
  };

  const toggleSelectPage = () => {
    setSelectedProducts((prev) => {
      if (allCurrentSelected) return prev.filter((id) => !currentIds.includes(id));
      return Array.from(new Set([...prev, ...currentIds]));
    });
  };

  const bulkAction = (type) => {
    if (selectedProducts.length === 0) {
      toast.error('Select products first');
      return;
    }
    const label = type === 'approve' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${label} ${selectedProducts.length} selected ads?`)) return;
    selectedProducts.forEach((id) => {
      if (type === 'approve') approveMutation.mutate(id);
      else rejectMutation.mutate(id);
    });
    setSelectedProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-700">
              <Package size={14} />
              Product Management
            </div>
            <h1 className="text-3xl font-black text-gray-950">Manage Ads</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review, approve, reject, and remove marketplace listings from one queue.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => bulkAction('approve')}
              disabled={selectedProducts.length === 0 || approveMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={18} />
              Approve Selected
            </button>
            <button
              onClick={() => bulkAction('reject')}
              disabled={selectedProducts.length === 0 || rejectMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={18} />
              Reject Selected
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {pageStats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-wide text-gray-500">{label}</span>
                <span className={`rounded-xl p-2 ${
                  tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                  tone === 'red' ? 'bg-red-50 text-red-700' :
                  tone === 'blue' ? 'bg-blue-50 text-blue-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  <Icon size={18} />
                </span>
              </div>
              <p className="text-2xl font-black text-gray-950">{Number(value).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_190px_120px_auto] lg:items-center">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or description"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full rounded-2xl border border-gray-200 py-3 pl-12 pr-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <label className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-black text-gray-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: Number(e.target.value), page: 1 })}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-gray-500">
            <span>{products.length} shown on this page, {productsData.total || 0} total</span>
            {selectedProducts.length > 0 && <span>{selectedProducts.length} selected</span>}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <Package size={56} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <ImageOff size={56} className="mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-2xl font-black text-gray-900">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-5 text-left">
                      <input type="checkbox" className="rounded" checked={allCurrentSelected} onChange={toggleSelectPage} />
                    </th>
                    <th className="p-5 text-left text-sm font-black text-gray-900">Ad</th>
                    <th className="p-5 text-left text-sm font-black text-gray-900">Seller</th>
                    <th className="p-5 text-left text-sm font-black text-gray-900">Status</th>
                    <th className="p-5 text-left text-sm font-black text-gray-900">Signals</th>
                    <th className="p-5 text-left text-sm font-black text-gray-900">Posted</th>
                    <th className="p-5 text-left text-sm font-black text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => {
                    const status = product.status || 'pending';
                    return (
                      <tr key={product._id} className="hover:bg-gray-50/80">
                        <td className="p-5 align-top">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleSelect(product._id)}
                          />
                        </td>
                        <td className="p-5 align-top">
                          <div className="flex min-w-0 gap-4">
                            <img
                              src={getImageUrl(product.images?.[0])}
                              alt={product.title || 'Product'}
                              className="h-20 w-24 flex-shrink-0 rounded-2xl border border-gray-100 object-cover"
                              onError={(event) => { event.currentTarget.src = placeholderImage; }}
                            />
                            <div className="min-w-0">
                              <button type="button" onClick={() => setDetailProduct(product)} className="line-clamp-2 text-left font-black text-gray-950 hover:text-orange-700">
                                {product.title || 'Untitled ad'}
                              </button>
                              <p className="mt-1 text-sm font-black text-emerald-700">{priceText(product.price)}</p>
                              <p className="mt-1 line-clamp-1 text-xs font-semibold text-gray-500">
                                {[product.category, product.subCategory, product.location].filter(Boolean).join(' | ') || 'No category/location'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 align-top">
                          <div className="flex items-center gap-2 font-bold text-gray-800">
                            <User size={16} />
                            <span>{product.sellerName || product.user?.name || 'Unknown'}</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{product.sellerEmail || product.user?.email || '-'}</p>
                          {product.user?.trustScore !== undefined && (
                            <p className="mt-1 text-xs font-bold text-emerald-700">Trust {product.user.trustScore}</p>
                          )}
                        </td>
                        <td className="p-5 align-top">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                            {PRODUCT_STATUS[status] || status}
                          </span>
                          {status === 'approved' && product.approvalSource && (
                            <p className="mt-1 text-[11px] font-semibold text-gray-400">
                              {product.approvalSource === 'auto' ? 'Auto-approved' : 'Admin approved'}
                            </p>
                          )}
                          {status === 'suspicious' && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                              <AlertTriangle size={12} /> Needs review
                            </p>
                          )}
                        </td>
                        <td className="p-5 align-top text-sm text-gray-600">
                          <p className="font-bold">{Number(product.views || 0).toLocaleString('en-IN')} views</p>
                          <p className="mt-1 text-xs">{product.condition || '-'}</p>
                        </td>
                        <td className="p-5 align-top text-sm font-semibold text-gray-500">
                          {safeDate(product.createdAt)}
                        </td>
                        <td className="p-5 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => setDetailProduct(product)} className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100" title="Review details">
                              <Eye size={18} />
                            </button>
                            {status !== 'approved' && status !== 'deleted' && (
                              <button type="button" onClick={() => handleApprove(product._id)} className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50" title="Approve">
                                <CheckCircle2 size={18} />
                              </button>
                            )}
                            {status !== 'rejected' && status !== 'deleted' && (
                              <button type="button" onClick={() => handleReject(product._id)} className="rounded-xl p-2 text-red-600 transition hover:bg-red-50" title="Reject">
                                <XCircle size={18} />
                              </button>
                            )}
                            <button type="button" onClick={() => handleDelete(product._id)} className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {productsData.pages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={filters.page <= 1}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-black text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-bold text-gray-600">Page {filters.page} of {productsData.pages}</span>
            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.min(productsData.pages, p.page + 1) }))}
              disabled={filters.page >= productsData.pages}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-black text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            <span className="text-gray-500">({productsData.total} total)</span>
          </div>
        )}
      </div>

      <Modal isOpen={Boolean(detailProduct)} onClose={() => setDetailProduct(null)} title="Ad Review Details">
        {detailProduct && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-2 gap-2">
              {(detailProduct.images?.length ? detailProduct.images : [null]).map((image, index) => (
                <img
                  key={image?.public_id || image?.url || index}
                  src={getImageUrl(image)}
                  alt=""
                  className="h-32 w-full rounded-xl border border-gray-100 object-cover"
                  onError={(event) => { event.currentTarget.src = placeholderImage; }}
                />
              ))}
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">{detailProduct.title || 'Untitled ad'}</p>
              <p className="font-black text-emerald-700">{priceText(detailProduct.price)}</p>
            </div>
            <p className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl bg-gray-50 p-3 leading-6">
              {detailProduct.description || 'No description provided.'}
            </p>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3">
              <p><strong>Category:</strong><br />{detailProduct.category || '-'}</p>
              <p><strong>Sub category:</strong><br />{detailProduct.subCategory || '-'}</p>
              <p><strong>Condition:</strong><br />{detailProduct.condition || '-'}</p>
              <p><strong>Location:</strong><br />{detailProduct.location || '-'}</p>
              <p><strong>Seller:</strong><br />{detailProduct.sellerName || detailProduct.user?.name || '-'}</p>
              <p><strong>Status:</strong><br />{PRODUCT_STATUS[detailProduct.status] || detailProduct.status}</p>
              <p><strong>Views:</strong><br />{Number(detailProduct.views || 0).toLocaleString('en-IN')}</p>
              <p><strong>Posted:</strong><br />{safeDate(detailProduct.createdAt)}</p>
            </div>
            <div className="flex gap-3">
              {detailProduct.status !== 'approved' && (
                <button type="button" onClick={() => { handleApprove(detailProduct._id); setDetailProduct(null); }} className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">
                  Approve
                </button>
              )}
              {detailProduct.status !== 'rejected' && (
                <button type="button" onClick={() => { handleReject(detailProduct._id); setDetailProduct(null); }} className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-black text-white">
                  Reject
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminProducts;
