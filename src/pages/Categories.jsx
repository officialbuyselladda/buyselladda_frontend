import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, Grid, List } from 'lucide-react';
import { cn } from '../utils';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-hot-toast';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [page, setPage] = useState(1);

  const categorySlug = searchParams.get('category') || searchParams.get('slug');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
      fetchCategoryProducts(categorySlug, 1);
    }
  }, [categorySlug]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories/tree');
      setCategories(data.data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchCategoryProducts = async (slug, currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ category: slug, page: currentPage, limit: 20 });
      const { data } = await api.get(`/products?${params}`);
      if (currentPage === 1) {
        setProducts(data.data.products || []);
      } else {
        setProducts(prev => [...prev, ...data.data.products]);
      }
      setPage(currentPage);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (slug) => {
    navigate(`/categories?slug=${slug}`);
  };

  const loadMore = () => {
    fetchCategoryProducts(selectedCategory, page + 1);
  };

  if (!selectedCategory && categories.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              Browse Categories
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find exactly what you're looking for. Millions of listings across thousands of categories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div 
                key={category._id}
                className="group"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 h-full flex flex-col items-center text-center cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{category.icon || '📦'}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">{category.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{category.productsCount || 0} listings</p>
                  {category.children && category.children.length > 0 && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {category.children.length} subcategories
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.slug === selectedCategory) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-primary-600">Home</a></li>
            <li><span className="w-6 h-6 flex items-center justify-center text-gray-400">/</span></li>
            <li className="font-medium text-gray-900 capitalize">{category.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Subcategories */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24 max-h-[70vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-6 text-gray-900 flex items-center gap-2">
                Subcategories ({category.children?.length || 0})
              </h3>
              <div className="space-y-2">
                {category.children?.map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() => navigate(`/categories?slug=${sub.slug}`)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group",
                      selectedCategory === sub.slug
                        ? "bg-primary-50 border-2 border-primary-200 text-primary-700"
                        : "hover:bg-gray-50 border border-gray-100"
                    )}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
                      <span className="text-lg">{sub.icon || '📦'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{sub.name}</p>
                      <p className="text-xs text-gray-500">{sub.productsCount || 0} ads</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                )) || (
                  <p className="text-gray-500 text-sm py-8 text-center">No subcategories</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Products */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 capitalize">{category.name}</h1>
                  <p className="text-gray-600 mt-1">Browse {category.productsCount || 0}+ listings in this category</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                  >
                    {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {loading && products.length === 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100">
                    <div className="bg-gray-100 rounded-xl h-48 mb-4"></div>
                    <div className="h-5 bg-gray-100 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📦</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Be the first to post in <span className="font-semibold text-gray-900 capitalize">{category.name}</span>
                </p>
                <button className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg">
                  Post Free Ad
                </button>
              </div>
            ) : (
              <div className={cn('space-y-4', {
                'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6': viewMode === 'grid',
                'space-y-4': viewMode === 'list'
              })}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {products.length > 0 && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Loading more...
                    </>
                  ) : (
                    'Load More Ads'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;

