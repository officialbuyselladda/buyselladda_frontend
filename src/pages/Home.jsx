import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { cn, useCategories, CATEGORIES } from '../utils';
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
  const { userLocation, userAddress, clearLocation } = useLocation();
  const { data: categoriesData } = useCategories();

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
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.lat) params.append('lat', filters.lat);
      if (filters.lng) params.append('lng', filters.lng);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const { data } = await api.get('/products?' + params);

      const rawProducts = data.data?.products || [];
      const validProducts = rawProducts.filter(p => p && p._id);

      if (currentPage === 1) setProducts(validProducts);
      else setProducts(prev => [...prev, ...validProducts]);

    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [filters]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    value ? params.set(key, value) : params.delete(key);
    setSearchParams(params);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProducts(next);
  };

  const mapMarkers = products
    .filter(p => p.locationCoords?.coordinates)
    .map(p => ({
      lat: p.locationCoords.coordinates[1],
      lng: p.locationCoords.coordinates[0],
      id: p._id,
      title: p.title
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="max-w-7xl mx-auto px-4 py-6">

       

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">

          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm border sticky top-24">
              <h3 className="font-bold mb-4">Categories</h3>

              <div className="space-y-2">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg",
                    !filters.category
                      ? "bg-orange-500 text-white"
                      : "hover:bg-gray-100"
                  )}
                >
                  All Categories
                </button>

                {(categoriesData || CATEGORIES).map(cat => (
                  <button
                    key={cat._id || cat}
                    onClick={() =>
                      updateFilter(
                        'category',
                        filters.category === (cat.slug || cat) ? '' : (cat.slug || cat)
                      )
                    }
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg",
                      filters.category === (cat.slug || cat)
                        ? "bg-orange-500 text-white"
                        : "hover:bg-gray-100"
                    )}
                  >
                    {cat.name || cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-6">

            {/* LOCATION */}
            {userLocation && (
              <div className="bg-white rounded-xl p-4 mb-4 flex justify-between shadow-sm">
                <span className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Near {userAddress || 'you'}
                </span>

                <button onClick={clearLocation} className="text-sm text-blue-600">
                  Change
                </button>
              </div>
            )}

            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">
                {loading ? "Loading..." : `${products.length} results`}
              </h2>
            </div>

            {/* PRODUCTS */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse h-48 bg-white rounded-xl"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <Search className="mx-auto mb-3 text-gray-400" size={40} />
                <p>No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {products.map(p => (
                  <div key={p._id} className="hover:scale-[1.02] transition-all duration-300">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}

            {/* LOAD MORE */}
            {products.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}

            {/* MAP */}
            {showMap && userLocation && (
              <div className="mt-6 bg-white p-4 rounded-xl shadow">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '400px' }}
                    center={{
                      lat: parseFloat(filters.lat),
                      lng: parseFloat(filters.lng)
                    }}
                    zoom={12}
                  >
                    {mapMarkers.map(m => (
                      <Marker key={m.id} position={{ lat: m.lat, lng: m.lng }} />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="bg-white p-5 rounded-2xl shadow-sm sticky top-24">
              <h3 className="font-bold mb-3">Popular</h3>

              {CATEGORIES.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className="block w-full text-left py-2 hover:text-blue-600"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;

