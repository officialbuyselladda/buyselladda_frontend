import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { cn, CATEGORIES } from '../utils';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Search, Map, ArrowUp, ArrowDown, MapPin, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const { userLocation, userAddress, loadingLocation, getLocation, clearLocation } = useLocation();

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
  }), [searchParams]);

  const fetchProducts = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // ✅ Only append non-empty values to avoid backend validation errors
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.lat) params.append('lat', filters.lat);
      if (filters.lng) params.append('lng', filters.lng);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const { data } = await api.get('/products?' + params);
      if (currentPage === 1) {
        setProducts(data.data.products || []);
      } else {
        setProducts(prev => [...prev, ...(data.data.products || [])]);
      }
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [filters, fetchProducts]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  const mapMarkers = products.filter(p => p.locationCoords?.coordinates).map(product => ({
    position: {
      lat: product.locationCoords.coordinates[1],
      lng: product.locationCoords.coordinates[0]
    },
    title: `${product.title} - ₹${product.price}`,
    id: product._id
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">

          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-24">
              <h3 className="font-bold text-base mb-5 text-gray-800 tracking-tight">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    !filters.category
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  All Categories
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      filters.category === cat
                        ? "bg-primary-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">

            {/* Location Bar */}
            {userLocation && (
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>Near <span className="font-medium text-gray-800">{userAddress || 'you'}</span> · 10km</span>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={clearLocation}
                    className="px-3 py-1.5 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-all"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-600"
                    title={showMap ? 'Hide Map' : 'Show Map'}
                  >
                    {showMap ? <ChevronLeft className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Header Row */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {loading && products.length === 0
                  ? 'Loading...'
                  : `${products.length} listings found`}
              </h2>
              <div className="flex items-center gap-1 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                <button className="p-1 hover:text-primary-600 rounded transition-all">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-medium">Sort</span>
                <button className="p-1 hover:text-primary-600 rounded transition-all">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-3 border border-gray-100">
                    <div className="bg-gray-100 rounded-xl h-44 mb-3"></div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                    <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
                <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">No listings found</h3>
                <p className="text-gray-400 text-sm mb-6">Try different keywords or browse all categories</p>
                <button
                  onClick={() => setSearchParams({})}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all shadow"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Load More */}
            {products.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : 'Load More'}
                </button>
              </div>
            )}

            {/* Map */}
            {showMap && userLocation && (
              <div className="mt-8 bg-white rounded-2xl shadow border border-gray-100 p-4 overflow-hidden">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                  <Map className="w-4 h-4 text-primary-500" /> Listings near you
                </h4>
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '450px', borderRadius: '12px' }}
                    center={{ lat: parseFloat(filters.lat), lng: parseFloat(filters.lng) }}
                    zoom={12}
                  >
                    <Marker
                      position={{ lat: parseFloat(filters.lat), lng: parseFloat(filters.lng) }}
                      title="Your Location"
                      icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                    />
                    {mapMarkers.map(marker => (
                      <Marker key={marker.id} position={marker.position} title={marker.title} />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block xl:col-span-2">
            <div className="sticky top-24 space-y-5">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-sm mb-4 text-gray-700 uppercase tracking-wide">Popular</h3>
                <div className="space-y-1">
                  {CATEGORIES.slice(0, 6).map(cat => (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', cat)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all",
                        filters.category === cat
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;