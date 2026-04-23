import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Heart, ChevronLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../utils';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites(1);
    }
  }, [user]);

  const fetchFavorites = async (currentPage = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/favorites?page=${currentPage}&limit=12`);
      if (currentPage === 1) {
        setFavorites(data.data.favorites || []);
      } else {
        setFavorites(prev => [...prev, ...data.data.favorites]);
      }
      setHasMore(data.data.pagination.pages > currentPage);
      setPage(currentPage);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (productId) => {
    try {
      await api.post('/favorites/toggle', { productId });
      // Update local state
      setFavorites(prev => prev.filter(f => f._id !== productId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  const loadMore = () => {
    fetchFavorites(page + 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Favorites</h1>
          <p className="text-gray-600 mb-8">Sign in to save your favorite listings and view them here.</p>
          <a href="/login" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg">
            Sign In
            <ChevronLeft className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-500 fill-red-100" />
            <div>
              <h1 className="text-3xl font-black text-gray-900">My Favorites</h1>
              <p className="text-gray-600">{favorites.length} saved listings</p>
            </div>
          </div>
        </div>

        {loading && favorites.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100">
                <div className="bg-gray-100 rounded-xl h-48 mb-4"></div>
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Click the heart icon on any listing to save it here and get notified when price changes.
            </p>
            <a href="/" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg">
              Browse Listings
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite._id} className="relative group">
                <ProductCard product={favorite} />
                <button
                  onClick={() => toggleFavorite(favorite._id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 text-red-500 fill-current" />
                </button>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading more...
                </>
              ) : (
                'Load More Favorites'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

