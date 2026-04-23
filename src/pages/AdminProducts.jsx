import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Package, Eye, Trash2, CheckCircle2, XCircle, Clock, Edit3, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONDITIONS, PRODUCT_STATUS } from '../utils';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'all', search: '', page: 1, limit: 10 });
  const [selectedProducts, setSelectedProducts] = useState([]); 

  const { data: productsData = { products: [], total: 0, page: 1, pages: 1 }, isLoading, error } = useQuery({
    queryKey: ['adminProducts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', filters.status);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      if (filters.search.trim()) params.append('search', filters.search);
      const res = await api.get(`/admin/products?${params}`);
      return res.data.data;
    },
  });

  const products = productsData.products || [];

  if (error) toast.error('Failed to load products');

  const approveMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/approve`),
    onSuccess: () => {
      toast.success('Product approved');
      queryClient.invalidateQueries(['adminProducts']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (productId) => api.put(`/admin/products/${productId}/reject`),
    onSuccess: () => {
      toast.success('Product rejected');
      queryClient.invalidateQueries(['adminProducts']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) => api.delete(`/admin/products/${productId}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['adminProducts']);
    },
  });

  const handleApprove = (productId) => approveMutation.mutate(productId);
  const handleReject = (productId) => rejectMutation.mutate(productId);
  const handleDelete = (productId) => {
    if (confirm('Delete this product permanently?')) deleteMutation.mutate(productId);
  };

  const toggleSelect = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const bulkAction = (action) => {
    if (selectedProducts.length === 0) {
      toast.error('Select products first');
      return;
    }
    if (confirm(`Approve ${selectedProducts.length} selected products?`)) {
      selectedProducts.forEach(id => action(id));
      setSelectedProducts([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
            <p className="text-gray-600">{products.length} products • {filters.status} filter ({productsData.total} total)</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => bulkAction(handleApprove)}
              disabled={selectedProducts.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              Approve Selected
            </button>
            <button 
              onClick={() => bulkAction(handleReject)}
              disabled={selectedProducts.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <XCircle size={18} />
              Reject Selected
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
  <input
                type="text"
                placeholder="Search products by title or seller..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent md:w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending ({products.filter(p => p.status === 'pending').length})</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-6 text-left">
                      <input type="checkbox" className="rounded" onChange={() => {}} />
                    </th>
                    <th className="p-6 text-left font-semibold text-gray-900 w-12">Preview</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Product</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Seller</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Status</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Posted</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="p-6">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => toggleSelect(product._id)}
                        />
                      </td>
                      <td className="p-6">
                        <img 
                          src={product.images?.[0]?.url || '/placeholder.jpg'} 
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      </td>
                      <td className="p-6 max-w-md">
                        <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2">
                          {product.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">₹{product.price?.toLocaleString()}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span className="font-medium">{product.sellerName}</span>
                        </div>
                        <p className="text-sm text-gray-500">{product.sellerEmail}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {PRODUCT_STATUS[product.status] || product.status}
                        </span>
                      </td>
                      <td className="p-6 text-sm text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <Link 
                            to={`/products/${product._id}`}
                            className="p-2 hover:bg-gray-100 rounded-xl"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          {product.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(product._id)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                title="Approve"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleReject(product._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {productsData.pages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-sm">
            <button 
              onClick={() => setFilters(p => ({...p, page: Math.max(1, p.page - 1)}))}
              disabled={filters.page <= 1}
              className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {filters.page} of {productsData.pages}</span>
            <button 
              onClick={() => setFilters(p => ({...p, page: p.page + 1}))}
              disabled={filters.page >= productsData.pages}
              className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
            <span className="text-gray-500">({productsData.total} total)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;

