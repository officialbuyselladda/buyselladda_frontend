import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { cn, getCategoryLabel, getCategoryValue, useCategoryOptions } from '../utils';
import api from '../services/api';
import { useLocation } from '../context/LocationContext';
import { Search, MapPin, X, ChevronRight, LocateFixed } from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────
   Skeleton Card
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    <div className="bg-gray-100 aspect-[4/3] w-full" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      <div className="h-4 bg-gray-100 rounded-full w-1/2" />
      <div className="h-3 bg-gray-100 rounded-full w-2/3" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Category Pill
───────────────────────────────────────────── */
const CategoryPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
      active
        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100'
        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'
    )}
  >
    {label}
  </button>
);

/* ─────────────────────────────────────────────
   Main Home Component
───────────────────────────────────────────── */
const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(null);
  const [page, setPage] = useState(1);
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(() => localStorage.getItem('locationPromptDismissed') === 'true');
  const [locationWarning, setLocationWarning] = useState(null);

  const { userLocation, userAddress, loadingLocation, getLocation, clearLocation } = useLocation();
  const { options: allCategories } = useCategoryOptions();
  const categoryScrollRef = useRef(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  }), [searchParams]);

  /* ── Fetch ── */
  const fetchProducts = useCallback(async (currentPage = 1, append = false) => {
    try {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (userLocation?.lat && userLocation?.lng) {
        params.append('lat', String(userLocation.lat));
        params.append('lng', String(userLocation.lng));
        params.append('radius', '25');
      }
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const { data } = await api.get('/products?' + params);
      const validProducts = (data.data?.products || []).filter(p => p && p._id);
      const total = data.data?.pagination?.total ?? null;
      setLocationWarning(data.data?.warning || null);

      if (total !== null) setTotalCount(total);
      setHasMore(validProducts.length === 20);

      if (!append) setProducts(validProducts);
      else setProducts(prev => {
        const ids = new Set(prev.map(p => p._id));
        return [...prev, ...validProducts.filter(p => !ids.has(p._id))];
      });

    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, userLocation?.lat, userLocation?.lng]);

  /* ── Reset on filter change ── */
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [filters, userLocation?.lat, userLocation?.lng, fetchProducts]);

  /* ── Infinite scroll ── */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchProducts(next, true);
        }
      },
      { threshold: 0.5 }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    value ? params.set(key, value) : params.delete(key);
    setSearchParams(params);
  };

  const clearSearch = () => updateFilter('search', '');
  const dismissLocationPrompt = () => {
    localStorage.setItem('locationPromptDismissed', 'true');
    setLocationPromptDismissed(true);
  };

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-4 space-y-3">

        {!userLocation && !locationPromptDismissed && (
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
              <LocateFixed size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Show nearby products</p>
              <p className="text-xs text-gray-600">Allow location access to see ads closest to you first.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={getLocation}
                disabled={loadingLocation}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loadingLocation ? 'Detecting...' : 'Allow'}
              </button>
              <button onClick={dismissLocationPrompt} className="rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-white">
                Later
              </button>
            </div>
          </div>
        )}

        {/* ── Active Search Banner ── */}
        {filters.search && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 flex-1">
              Results for <span className="font-semibold text-orange-500">"{filters.search}"</span>
            </span>
            <button
              onClick={clearSearch}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-orange-100 hover:bg-orange-200 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-orange-500" />
            </button>
          </div>
        )}

        {/* ── Location Banner ── */}
        {userLocation && (
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
            <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm text-gray-600 flex-1">
              Showing products within 25 km of <span className="font-medium text-gray-800">{userAddress || 'your location'}</span>
            </span>
            <button
              onClick={clearLocation}
              className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
            >
              Change
            </button>
          </div>
        )}

        {locationWarning && userLocation && (
          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-2.5 text-sm text-yellow-800">
            {locationWarning}
          </div>
        )}

        {/* ── Categories ── */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
          <div
            ref={categoryScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <CategoryPill
              label="All"
              active={!filters.category}
              onClick={() => updateFilter('category', '')}
            />
            {allCategories.map(cat => {
              const slug = getCategoryValue(cat);
              const name = getCategoryLabel(cat);
              return (
                <CategoryPill
                  key={cat._id || slug}
                  label={name}
                  active={filters.category === slug}
                  onClick={() => updateFilter('category', filters.category === slug ? '' : slug)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Results Header ── */}
        <div className="flex items-center justify-between px-1">
          <div className="text-sm text-gray-500">
            {loading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-3 h-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-3 h-3 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            ) : (
              <span>
                <span className="font-semibold text-gray-800 text-base">{totalCount ?? products.length}</span>
                {' '}listings found
              </span>
            )}
          </div>
          {filters.category && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-medium capitalize">
              {filters.category}
            </span>
          )}
        </div>

        {/* ── Product Grid ── */}
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">No listings found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
            {(filters.search || filters.category) && (
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 px-5 py-2 bg-orange-500 text-white text-sm rounded-full hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {products.map((p, i) => (
                <div
                  key={p._id}
                  className="opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${Math.min(i % 20, 11) * 40}ms`, animationFillMode: 'forwards' }}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {/* ── Load More Skeleton (auto-trigger) ── */}
            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mt-0">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* ── Sentinel for Infinite Scroll ── */}
            {hasMore && <div ref={sentinelRef} className="h-10" />}

            {/* ── End of Results ── */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                  <div className="h-px w-12 bg-gray-200" />
                  You've seen it all
                  <div className="h-px w-12 bg-gray-200" />
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* ── Global Styles ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.35s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Home;
