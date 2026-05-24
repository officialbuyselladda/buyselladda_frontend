import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { cn, getCategoryLabel, getCategoryValue, useCategoryOptions } from '../utils';
import api from '../services/api';
import { useLocation } from '../context/LocationContext';
import {
  Bike,
  BookOpen,
  Briefcase,
  Building2,
  Car,
  Grid3X3,
  Home as HomeIcon,
  KeyRound,
  LocateFixed,
  MapPin,
  MonitorSmartphone,
  Search,
  Shirt,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── Skeleton Card ─────────────────────────────── */
const SkeletonCard = () => (
  <div className="home-skeleton-card">
    <div className="home-skeleton-card__img" />
    <div className="home-skeleton-card__body">
      <div className="home-skeleton-card__line home-skeleton-card__line--w3" />
      <div className="home-skeleton-card__line home-skeleton-card__line--w2" />
      <div className="home-skeleton-card__line home-skeleton-card__line--w1" />
    </div>
  </div>
);

/* ─── Category Pill ─────────────────────────────── */
const getCategoryIconElement = (label) => {
  const value = String(label || '').toLowerCase();
  const iconProps = { size: 30, strokeWidth: 1.9 };
  if (value === 'all') return <Grid3X3 {...iconProps} />;
  if (value.includes('stationary') || value.includes('stationery') || value.includes('book')) return <BookOpen {...iconProps} />;
  if (value.includes('electronic') || value.includes('mobile') || value.includes('phone')) return <MonitorSmartphone {...iconProps} />;
  if (value.includes('job')) return <Briefcase {...iconProps} />;
  if (value.includes('cloth') || value.includes('fashion')) return <Shirt {...iconProps} />;
  if (value.includes('car')) return <Car {...iconProps} />;
  if (value.includes('motorcycle') || value.includes('bike') || value.includes('scooter')) return <Bike {...iconProps} />;
  if (value.includes('rent')) return <KeyRound {...iconProps} />;
  if (value.includes('flat') || value.includes('building') || value.includes('apartment')) return <Building2 {...iconProps} />;
  if (value.includes('house') || value.includes('room') || value.includes('property')) return <HomeIcon {...iconProps} />;
  return <Grid3X3 {...iconProps} />;
};

const CategoryPill = ({ label, active, onClick }) => {
  return (
  <button
    onClick={onClick}
    className={`home-cat-pill ${active ? 'home-cat-pill--active' : ''}`}
  >
    <span className="home-cat-pill__icon">
      {getCategoryIconElement(label)}
    </span>
    <span className="home-cat-pill__label">{label}</span>
  </button>
  );
};

/* ─── Main Home ─────────────────────────────────── */
const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(null);
  const [page, setPage] = useState(1);
  const [locationPromptDismissed, setLocationPromptDismissed] = useState(
    () => localStorage.getItem('locationPromptDismissed') === 'true'
  );
  const [locationWarning, setLocationWarning] = useState(null);

  const { userLocation, userAddress, loadingLocation, loadingAddress, getLocation, clearLocation } = useLocation();
  const { options: allCategories } = useCategoryOptions();
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

  return (
    <>
      <style>{homeStyles}</style>

      <div className="home-page">
        <div className="home-container">

          {/* ── Location Prompt ── */}
          {!userLocation && !locationPromptDismissed && (
            <div className="home-banner home-banner--location">
              <div className="home-banner__icon home-banner__icon--blue">
                <LocateFixed size={18} />
              </div>
              <div className="home-banner__content">
                <p className="home-banner__title">Show nearby products</p>
                <p className="home-banner__sub">Allow location access to see ads closest to you first.</p>
              </div>
              <div className="home-banner__actions">
                <button
                  onClick={getLocation}
                  disabled={loadingLocation}
                  className="home-banner__btn home-banner__btn--primary"
                >
                  {loadingLocation ? 'Detecting…' : 'Allow'}
                </button>
                <button onClick={dismissLocationPrompt} className="home-banner__btn home-banner__btn--ghost">
                  Later
                </button>
              </div>
            </div>
          )}

          {/* ── Active Search Banner ── */}
          {filters.search && (
            <div className="home-banner home-banner--search">
              <Search size={15} className="home-banner__search-icon" />
              <span className="home-banner__search-text">
                Results for <strong>"{filters.search}"</strong>
              </span>
              <button onClick={clearSearch} className="home-banner__clear" aria-label="Clear search">
                <X size={13} />
              </button>
            </div>
          )}

          {/* ── Location Active Banner ── */}
          {userLocation && (
            <div className="home-banner home-banner--loc-active">
              <div className="home-banner__loc-icon">
                <MapPin size={15} />
              </div>
              <span className="home-banner__loc-text">
                Showing within 25 km of{' '}
                <strong>{loadingAddress && !userAddress ? 'detecting your address...' : userAddress || 'your location'}</strong>
              </span>
              <button onClick={clearLocation} className="home-banner__loc-change">
                Change
              </button>
            </div>
          )}

          {/* ── Location Warning ── */}
          {locationWarning && userLocation && (
            <div className="home-banner home-banner--warn">{locationWarning}</div>
          )}

          {/* ── Categories ── */}
          <div className="home-cats">
            <div className="home-cats__scroll">
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
          <div className="home-results-header">
            <div className="home-results-count">
              {loading ? (
                <span className="home-results-dots">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <>
                  <span className="home-results-count__num">{totalCount ?? products.length}</span>
                  <span className="home-results-count__label"> listings found</span>
                </>
              )}
            </div>
            {filters.category && (
              <span className="home-results-cat">{filters.category}</span>
            )}
          </div>

          {/* ── Grid ── */}
          {loading && products.length === 0 ? (
            <div className="home-grid">
              {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="home-empty">
              <div className="home-empty__icon">
                <Search size={28} />
              </div>
              <p className="home-empty__title">No listings found</p>
              <p className="home-empty__sub">Try a different search or category</p>
              {(filters.search || filters.category) && (
                <button
                  onClick={() => setSearchParams({})}
                  className="home-empty__clear-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="home-grid">
                {products.map((p, i) => (
                  <div
                    key={p._id}
                    className="home-grid__item"
                    style={{ animationDelay: `${Math.min(i % 20, 11) * 40}ms` }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {loadingMore && (
                <div className="home-grid home-grid--more">
                  {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {hasMore && <div ref={sentinelRef} className="home-sentinel" />}

              {!hasMore && products.length > 0 && (
                <div className="home-end">
                  <span className="home-end__line" />
                  <span className="home-end__text">You've seen it all</span>
                  <span className="home-end__line" />
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════
   STYLES
═══════════════════════════════════════════ */
const homeStyles = `
  :root {
    --h-bg: #f5f4f1;
    --h-surface: #ffffff;
    --h-surface-2: #faf9f7;
    --h-border: #edeae5;
    --h-accent: #d4571a;
    --h-accent-hover: #b84816;
    --h-accent-light: #fff4ef;
    --h-text: #0f0e0c;
    --h-text-2: #6b6860;
    --h-text-3: #9c9890;
    --h-blue: #2563eb;
    --h-blue-bg: #eff6ff;
    --h-blue-border: #bfdbfe;
    --h-yellow-bg: #fffbeb;
    --h-yellow-border: #fde68a;
    --h-yellow-text: #92400e;
    --h-radius: 14px;
    --h-radius-sm: 9px;
    --h-radius-full: 999px;
    --h-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
    --h-t: 0.16s cubic-bezier(0.4,0,0.2,1);
  }

  .home-page {
    min-height: 100vh;
    background: var(--h-bg);
    padding: 20px 0 60px;
  }

  .home-container {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  @media (min-width: 640px) { .home-container { padding: 0 24px; } }
  @media (min-width: 1024px) { .home-container { padding: 0 40px; } }

  /* ── Banners ── */
  .home-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: var(--h-radius);
    padding: 12px 16px;
    border: 1px solid transparent;
  }

  /* Location Prompt */
  .home-banner--location {
    background: var(--h-blue-bg);
    border-color: var(--h-blue-border);
    flex-wrap: wrap;
    gap: 12px;
  }
  @media (min-width: 640px) { .home-banner--location { flex-wrap: nowrap; } }
  .home-banner__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: var(--h-surface);
  }
  .home-banner__icon--blue { color: var(--h-blue); }
  .home-banner__content { flex: 1; min-width: 0; }
  .home-banner__title { font-size: 13.5px; font-weight: 700; color: var(--h-text); margin-bottom: 2px; }
  .home-banner__sub { font-size: 12px; color: var(--h-text-2); }
  .home-banner__actions { display: flex; gap: 6px; flex-shrink: 0; }
  .home-banner__btn {
    font-size: 13px;
    font-weight: 700;
    padding: 8px 16px;
    border-radius: var(--h-radius-sm);
    border: none;
    cursor: pointer;
    transition: background var(--h-t), opacity var(--h-t);
  }
  .home-banner__btn--primary {
    background: var(--h-blue);
    color: #fff;
  }
  .home-banner__btn--primary:hover { background: #1d4ed8; }
  .home-banner__btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .home-banner__btn--ghost {
    background: transparent;
    color: var(--h-blue);
  }
  .home-banner__btn--ghost:hover { background: rgba(37,99,235,0.08); }

  /* Search Banner */
  .home-banner--search {
    background: var(--h-accent-light);
    border-color: #fddcc8;
    padding: 10px 14px;
  }
  .home-banner__search-icon { color: var(--h-accent); flex-shrink: 0; }
  .home-banner__search-text { flex: 1; font-size: 13px; color: var(--h-text-2); }
  .home-banner__search-text strong { color: var(--h-accent); font-weight: 700; }
  .home-banner__clear {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(212,87,26,0.12);
    border: none;
    color: var(--h-accent);
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--h-t);
  }
  .home-banner__clear:hover { background: rgba(212,87,26,0.22); }

  /* Location Active Banner */
  .home-banner--loc-active {
    background: var(--h-surface);
    border-color: var(--h-border);
    box-shadow: var(--h-shadow);
    padding: 9px 14px;
  }
  .home-banner__loc-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--h-blue-bg);
    color: var(--h-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .home-banner__loc-text { flex: 1; font-size: 13px; color: var(--h-text-2); }
  .home-banner__loc-text strong { color: var(--h-text); font-weight: 600; }
  .home-banner__loc-change {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--h-blue);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color var(--h-t);
    flex-shrink: 0;
  }
  .home-banner__loc-change:hover { color: #1d4ed8; }

  /* Warning Banner */
  .home-banner--warn {
    background: var(--h-yellow-bg);
    border-color: var(--h-yellow-border);
    font-size: 13px;
    color: var(--h-yellow-text);
  }

  /* ── Categories ── */
  .home-cats {
    background: var(--h-surface);
    border: 1px solid var(--h-border);
    border-radius: var(--h-radius);
    padding: 14px;
    box-shadow: var(--h-shadow);
    overflow: hidden;
  }
  .home-cats__scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scroll-behavior: smooth;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 2px 14px 8px 2px;
  }
  .home-cats__scroll::-webkit-scrollbar { display: none; }

  .home-cat-pill {
    display: flex;
    width: 96px;
    min-height: 92px;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 8px;
    border-radius: 14px;
    border: 1.5px solid var(--h-border);
    background: var(--h-surface);
    color: var(--h-text-2);
    cursor: pointer;
    transition: background var(--h-t), color var(--h-t), border-color var(--h-t), box-shadow var(--h-t), transform var(--h-t);
    scroll-snap-align: start;
    touch-action: pan-x;
  }
  .home-cat-pill:hover {
    transform: translateY(-2px);
    border-color: #fddcc8;
    color: var(--h-accent);
    background: var(--h-accent-light);
  }
  .home-cat-pill--active {
    background: var(--h-accent-light);
    color: var(--h-accent);
    border-color: var(--h-accent);
    box-shadow: 0 2px 10px rgba(212,87,26,0.28);
  }
  .home-cat-pill--active:hover {
    background: var(--h-accent-light);
    border-color: var(--h-accent-hover);
    color: var(--h-accent-hover);
  }
  .home-cat-pill__icon {
    display: flex;
    width: 46px;
    height: 46px;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: #faf9f7;
    color: var(--h-accent);
    transition: background var(--h-t), color var(--h-t), transform var(--h-t);
  }
  .home-cat-pill:hover .home-cat-pill__icon,
  .home-cat-pill--active .home-cat-pill__icon {
    background: var(--h-accent);
    color: #ffffff;
    transform: scale(1.03);
  }
  .home-cat-pill__label {
    display: -webkit-box;
    overflow: hidden;
    color: inherit;
    font-size: 11.5px;
    font-weight: 800;
    line-height: 1.15;
    text-align: center;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  @media (max-width: 640px) {
    .home-cats {
      margin-left: -16px;
      margin-right: -16px;
      padding: 12px 0;
      border-radius: 0;
      border-left: 0;
      border-right: 0;
    }
    .home-cats__scroll {
      gap: 9px;
      padding: 2px 16px 8px;
      scroll-padding-left: 16px;
      scroll-padding-right: 16px;
    }
    .home-cat-pill {
      width: 84px;
      min-height: 86px;
      border-radius: 13px;
      padding: 9px 7px;
    }
    .home-cat-pill__icon {
      width: 42px;
      height: 42px;
      border-radius: 14px;
    }
    .home-cat-pill__label {
      font-size: 10.5px;
    }
  }

  /* ── Results Header ── */
  .home-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;
  }
  .home-results-count { font-size: 13.5px; color: var(--h-text-2); display: flex; align-items: center; gap: 4px; }
  .home-results-count__num { font-size: 17px; font-weight: 800; color: var(--h-text); }
  .home-results-count__label { font-weight: 500; }
  .home-results-cat {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--h-accent);
    background: var(--h-accent-light);
    border: 1px solid #fddcc8;
    padding: 4px 12px;
    border-radius: var(--h-radius-full);
    text-transform: capitalize;
    letter-spacing: 0.01em;
  }

  /* Loading dots */
  .home-results-dots {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .home-results-dots span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--h-accent);
    animation: home-bounce 1.2s ease-in-out infinite;
  }
  .home-results-dots span:nth-child(2) { animation-delay: 0.15s; }
  .home-results-dots span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes home-bounce {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ── Product Grid ── */
  .home-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  @media (min-width: 480px)  { .home-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
  @media (min-width: 640px)  { .home-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 900px)  { .home-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (min-width: 1200px) { .home-grid { grid-template-columns: repeat(5, 1fr); } }
  @media (min-width: 1500px) { .home-grid { grid-template-columns: repeat(6, 1fr); } }

  .home-grid--more { margin-top: 0; }

  .home-grid__item {
    opacity: 0;
    animation: home-fade-in 0.32s ease-out forwards;
  }
  @keyframes home-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Skeleton ── */
  .home-skeleton-card {
    background: var(--h-surface);
    border-radius: var(--h-radius);
    overflow: hidden;
    border: 1px solid var(--h-border);
    animation: home-pulse 1.5s ease-in-out infinite;
  }
  @keyframes home-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  .home-skeleton-card__img {
    aspect-ratio: 4/3;
    background: #edeae5;
  }
  .home-skeleton-card__body {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .home-skeleton-card__line {
    height: 11px;
    border-radius: 99px;
    background: #edeae5;
  }
  .home-skeleton-card__line--w3 { width: 75%; }
  .home-skeleton-card__line--w2 { width: 50%; }
  .home-skeleton-card__line--w1 { width: 65%; }

  /* ── Empty State ── */
  .home-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 20px;
    background: var(--h-surface);
    border: 1px solid var(--h-border);
    border-radius: var(--h-radius);
    text-align: center;
  }
  .home-empty__icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #f5f4f1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--h-text-3);
    margin-bottom: 16px;
  }
  .home-empty__title { font-size: 16px; font-weight: 700; color: var(--h-text); margin-bottom: 5px; }
  .home-empty__sub { font-size: 13px; color: var(--h-text-3); }
  .home-empty__clear-btn {
    margin-top: 18px;
    padding: 9px 22px;
    background: var(--h-accent);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border: none;
    border-radius: var(--h-radius-full);
    cursor: pointer;
    transition: background var(--h-t), transform var(--h-t);
    box-shadow: 0 2px 10px rgba(212,87,26,0.25);
  }
  .home-empty__clear-btn:hover { background: var(--h-accent-hover); transform: translateY(-1px); }

  /* ── Sentinel / End ── */
  .home-sentinel { height: 32px; }
  .home-end {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 28px 0 8px;
  }
  .home-end__line {
    flex: 1;
    max-width: 80px;
    height: 1px;
    background: var(--h-border);
  }
  .home-end__text {
    font-size: 12.5px;
    color: var(--h-text-3);
    font-weight: 500;
    white-space: nowrap;
  }
`;

export default Home;
