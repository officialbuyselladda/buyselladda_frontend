import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search, Filter, ChevronLeft, X, MapPin, Tag, DollarSign } from 'lucide-react';
import { cn, getCategoryLabel, getCategoryValue, useCategoryOptions } from '../utils';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'latest'
  });
  const [showFilters, setShowFilters] = useState(false);

  const query = searchParams.get('q') || searchParams.get('search') || '';
  const { options: categoryOptions } = useCategoryOptions();

  const fetchProducts = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ search: query, page: currentPage, limit: 20 });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await api.get(`/products?${params}`);
      if (currentPage === 1) {
        setProducts(data.data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.data.products || [])]);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [query, filters]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [query, filters, fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', location: '', sortBy: 'latest' });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => navigate(`/search?q=${encodeURIComponent(e.target.value)}`)}
                className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                placeholder="Search for anything..."
              />
              {query && (
                <button
                  onClick={() => navigate('/')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Desktop */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block bg-white rounded-2xl border p-6 mb-8 sticky top-24`}>
            <h3 className="font-bold text-lg mb-6 text-gray-900">Filters</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="latest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="price_low">Price low to high</option>
                  <option value="price_high">Price high to low</option>
                </select>
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map(cat => (
                    <option key={cat._id || getCategoryValue(cat)} value={getCategoryValue(cat)}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="self-end text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter city/area"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Clear All
              </button>
            </div>
        </div>

        {/* Results Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Search results for "{query}"
              </h1>
              <p className="text-gray-600 mt-1">{products.length} listings found</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <button className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
              <span>Page {page}</span>
            </div>
          </div>
        </div>

        {/* Products */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100">
                <div className="bg-gray-100 rounded-xl h-48 mb-4"></div>
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <Search className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">
              Try different keywords or check your spelling. You can also browse by category.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all">
                Browse Categories
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl"
            >
              Load More Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

