import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit3, Eye, Clock, Package, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PRODUCT_STATUS } from '../utils';
import toast from 'react-hot-toast';
import { getImageUrl, placeholderImage } from '../utils/image';

const MyProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data: productsData } = useQuery({
    queryKey: ['myProducts', activeTab, page],
    queryFn: () => api.get(`/products/my-products?status=${activeTab === 'all' ? '' : activeTab}&page=${page}&limit=${pageSize}`).then(res => res.data),
    enabled: !!user,
  });
  const products = productsData?.data?.data || []; 
  const pagination = productsData?.data?.pagination || {};

  const deleteMutation = useMutation({
    mutationFn: (productId) => api.delete(`/products/${productId}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries(['myProducts']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const handleDelete = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-1">Manage your listed products ({products.length})</p>
          </div>
          
          {/* Status Tabs */}
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex-1 min-w-0 ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <Link 
            to="/create-product" 
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
          >
            <Plus size={20} className="mr-2" />
            Post New Product
          </Link>
        </div>

        {products?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Package size={64} className="mx-auto text-gray-400 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-8">Start posting your first product to buy or sell locally.</p>
            <Link 
              to="/create-product" 
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-2xl hover:bg-primary-700 transition-all shadow-lg"
            >
              Post Your First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border hover:border-primary-200">
                  <div className="aspect-video bg-gray-100 overflow-hidden relative">
                    <img 
                      src={getImageUrl(product.images?.[0])} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(event) => {
                        event.currentTarget.src = placeholderImage;
                      }}
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {PRODUCT_STATUS[product.status] || product.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">{product.title}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {formatDistanceToNow(new Date(product.createdAt))} ago
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">{product.location}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      Views: {product.views || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={product.status === 'approved' ? `/products/${product._id}` : '#'}
                        className="flex-1 flex items-center justify-center py-2 px-4 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
                        title="View"
                        onClick={(event) => {
                          if (product.status !== 'approved') {
                            event.preventDefault();
                            toast('This ad will be visible after admin approval.');
                          }
                        }}
                      >
                        <Eye size={16} />
                        <span className="ml-1">View</span>
                      </Link>
                      <Link 
                        to={`/edit-product/${product._id}`}
                        className="flex-1 flex items-center justify-center py-2 px-4 bg-primary-100 text-primary-700 font-medium rounded-xl hover:bg-primary-200 transition-all"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                        <span className="ml-1">Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 flex items-center justify-center py-2 px-4 bg-red-100 text-red-700 font-medium rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-2 bg-white p-6 rounded-2xl shadow-lg">
                <button
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {pagination.pages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          Products from your account. New posts are reviewed for quality before going live.
        </div>
      </div>
    </div>
  );
};

export default MyProducts;
