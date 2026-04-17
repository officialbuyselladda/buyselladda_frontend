import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { cn, CATEGORIES } from '../utils';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Search, Locate, Map, Filter, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
const { userLocation, userAddress, loadingLocation, getLocation, clearLocation } = useLocation();

  // Sync filters with URL
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || 'approved',
    lat: searchParams.get('lat') || '',
    lng: searchParams.get('lng') || '',
  }), [searchParams]);

  const fetchProducts = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
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
    setPage(p => p + 1);
    fetchProducts(page + 1);
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
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
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Categories */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl p-6 border">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
                Categories
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateFilter('category', cat)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl text-sm font-medium transition-all hover:shadow-md",
                      filters.category === cat 
                        ? "bg-primary-600 text-white shadow-md" 
                        : "text-gray-700 hover:bg-white hover:shadow-sm"
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
              <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span>Showing results near {userAddress || 'you'} (10km)</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={clearLocation} className="px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-all">
                    Change Location
                  </button>
                  <button onClick={() => setShowMap(!showMap)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                    {showMap ? <ChevronLeft className="w-5 h-5" /> : <Map className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {products.length} products found
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span>Sort</span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loading && products.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {Array(10).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-100 rounded-xl h-48 mb-4"></div>
                      <div className="h-5 bg-gray-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24">
                  <Search className="mx-auto h-24 w-24 text-gray-400 mb-6 opacity-50" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 text-lg">Try different keywords or categories</p>
                  <button 
                    onClick={() => window.scrollTo(0, 0)}
                    className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg"
                  >
                    Back to top
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}

              {products.length > 0 && (
                <div className="flex justify-center">
                  <button 
                    onClick={loadMore}
                    disabled={loading}
                    className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    Load More
                    {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible Map */}
            {showMap && userLocation && (
              <div className="mt-12 bg-white rounded-2xl shadow-xl border p-6">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '500px' }}
                    center={{ lat: parseFloat(filters.lat), lng: parseFloat(filters.lng) }}
                    zoom={12}
                  >
                    <Marker 
                      position={{ lat: parseFloat(filters.lat), lng: parseFloat(filters.lng) }} 
                      title="Your Location"
                      icon={{
                        url: `https://maps.google.com/mapfiles/ms/icons/blue-dot.png`
                      }}
                    />
                    {mapMarkers.map(marker => (
                      <Marker key={marker.id} position={marker.position} title={marker.title} />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            )}
          </div>

          {/* Right Sidebar - Popular */}
          <div className="hidden xl:block xl:col-span-2">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Popular Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIES.slice(0, 6).map(cat => (
                    <button
                      key={cat}
                      onClick={() => updateFilter('category', cat)}
                      className="p-3 rounded-xl text-sm font-medium hover:shadow-md transition-all bg-white"
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

