import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, RefreshCw, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { isPublicProductVisible } from '../utils';

const normalizeFavorite = (item) => {
  const product = item?.product || item;
  if (!product?._id) return null;
  return {
    ...product,
    isFavorited: true,
    favoriteId: item?._id !== product._id ? item?._id : undefined,
  };
};

const FavoriteSkeleton = () => (
  <div className="fav-skeleton-card">
    <div className="fav-skeleton-card__img" />
    <div className="fav-skeleton-card__body">
      <span />
      <span />
      <span />
    </div>
  </div>
);

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [removingId, setRemovingId] = useState('');

  const fetchFavorites = useCallback(async (currentPage = 1, append = false, search = activeSearch) => {
    try {
      setError('');
      if (append) setLoadingMore(true);
      else setLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: '12',
      });
      if (search.trim()) params.set('search', search.trim());

      const { data } = await api.get(`/favorites?${params.toString()}`);
      const payload = data?.data || {};
      const nextFavorites = (payload.favorites || [])
        .map(normalizeFavorite)
        .filter(Boolean)
        .filter(isPublicProductVisible);
      const pagination = payload.pagination || {};

      setFavorites((prev) => {
        if (!append) return nextFavorites;
        const seen = new Set(prev.map((item) => item._id));
        return [...prev, ...nextFavorites.filter((item) => !seen.has(item._id))];
      });
      setTotalCount((prevTotal) => (
        append ? prevTotal + nextFavorites.length : nextFavorites.length
      ));
      setHasMore(Number(pagination.pages || 1) > currentPage);
      setPage(currentPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your saved listings.');
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeSearch]);

  useEffect(() => {
    if (user) fetchFavorites(1, false, activeSearch);
  }, [activeSearch, fetchFavorites, user]);

  const filteredLabel = activeSearch ? ` matching "${activeSearch}"` : '';
  const visibleCount = favorites.length;

  const stats = useMemo(() => ([
    { label: 'Saved ads', value: totalCount || visibleCount },
    { label: 'Ready to contact', value: visibleCount },
    { label: 'Safe buying', value: 'On' },
  ]), [totalCount, visibleCount]);

  const handleSearch = (event) => {
    event.preventDefault();
    setActiveSearch(searchTerm.trim());
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
  };

  const refresh = () => fetchFavorites(1, false, activeSearch);

  const removeFavorite = async (productId) => {
    if (removingId) return;
    setRemovingId(productId);
    const previous = favorites;
    setFavorites((prev) => prev.filter((item) => item._id !== productId));
    setTotalCount((count) => Math.max(0, count - 1));
    try {
      await api.post('/favorites/toggle', { productId });
      toast.success('Removed from favorites');
    } catch (err) {
      setFavorites(previous);
      setTotalCount((count) => count + 1);
      toast.error(err.response?.data?.message || 'Failed to remove favorite');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <>
      <style>{favoriteStyles}</style>
      <main className="fav-page">
        <div className="fav-container">
          <Link to="/" className="fav-back">
            <ArrowLeft size={16} />
            Back to listings
          </Link>

          <section className="fav-hero">
            <div className="fav-hero__main">
              <div className="fav-hero__icon">
                <Heart size={26} fill="currentColor" />
              </div>
              <div>
                <p className="fav-hero__eyebrow">Saved marketplace ads</p>
                <h1>My Favorites</h1>
                <p className="fav-hero__sub">
                  Keep track of listings you like, compare prices, and contact sellers when you are ready.
                </p>
              </div>
            </div>

            <div className="fav-stats">
              {stats.map((item) => (
                <div key={item.label} className="fav-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="fav-toolbar" aria-label="Favorites tools">
            <form className="fav-search" onSubmit={handleSearch}>
              <Search size={17} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search saved listings"
              />
              {activeSearch && (
                <button type="button" onClick={clearSearch} className="fav-search__clear">
                  Clear
                </button>
              )}
            </form>
            <button type="button" onClick={refresh} disabled={loading} className="fav-refresh">
              <RefreshCw size={16} className={loading ? 'fav-spin' : ''} />
              Refresh
            </button>
          </section>

          <div className="fav-context">
            <span>{loading && !favorites.length ? 'Loading saved listings' : `${visibleCount} saved listing${visibleCount === 1 ? '' : 's'}${filteredLabel}`}</span>
            <span className="fav-context__safe"><ShieldCheck size={14} /> Inspect before paying</span>
          </div>

          {error && !loading ? (
            <section className="fav-state">
              <div className="fav-state__icon fav-state__icon--warn">
                <RefreshCw size={28} />
              </div>
              <h2>Could not load favorites</h2>
              <p>{error}</p>
              <button type="button" onClick={refresh}>Try again</button>
            </section>
          ) : loading && favorites.length === 0 ? (
            <div className="fav-grid">
              {Array.from({ length: 8 }).map((_, index) => <FavoriteSkeleton key={index} />)}
            </div>
          ) : favorites.length === 0 ? (
            <section className="fav-state">
              <div className="fav-state__icon">
                <Heart size={34} />
              </div>
              <h2>{activeSearch ? 'No matching favorites' : 'No favorites yet'}</h2>
              <p>
                {activeSearch
                  ? 'Try another search term or clear the filter to see all saved listings.'
                  : 'Tap the heart on any listing to save it here for quick comparison later.'}
              </p>
              {activeSearch ? (
                <button type="button" onClick={clearSearch}>Clear search</button>
              ) : (
                <Link to="/">Browse listings</Link>
              )}
            </section>
          ) : (
            <div className="fav-grid">
              {favorites.map((favorite) => (
                <div key={favorite._id} className="fav-card-wrap">
                  <ProductCard product={favorite} />
                  <button
                    type="button"
                    onClick={() => removeFavorite(favorite._id)}
                    disabled={removingId === favorite._id}
                    className="fav-remove"
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {hasMore && favorites.length > 0 && (
            <div className="fav-load">
              <button type="button" onClick={() => fetchFavorites(page + 1, true)} disabled={loadingMore}>
                {loadingMore ? 'Loading more...' : 'Load more favorites'}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const favoriteStyles = `
  .fav-page {
    min-height: 100vh;
    background: #f5f7fa;
    padding: 24px 0 64px;
  }
  .fav-container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 16px;
  }
  @media (min-width: 640px) { .fav-container { padding: 0 28px; } }
  @media (min-width: 1024px) { .fav-container { padding: 0 44px; } }

  .fav-back {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #5d6b82;
    font-size: 13px;
    font-weight: 800;
    text-decoration: none;
    margin-bottom: 16px;
  }
  .fav-back:hover { color: #ff8200; }

  .fav-hero {
    display: grid;
    grid-template-columns: minmax(0,1fr);
    gap: 18px;
    border: 1px solid #dde5f0;
    border-radius: 16px;
    background: linear-gradient(135deg, #ffffff 0%, #fff8f4 100%);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04);
    padding: 20px;
  }
  @media (min-width: 840px) {
    .fav-hero {
      grid-template-columns: minmax(0,1fr) auto;
      align-items: center;
      padding: 24px;
    }
  }
  .fav-hero__main {
    display: flex;
    min-width: 0;
    gap: 14px;
  }
  .fav-hero__icon {
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    color: #ff8200;
    background: #fff3e4;
    border: 1px solid #ffcc99;
  }
  .fav-hero__eyebrow {
    color: #ff8200;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 4px;
  }
  .fav-hero h1 {
    margin: 0;
    color: #17233c;
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 900;
    line-height: 1.1;
  }
  .fav-hero__sub {
    max-width: 620px;
    color: #5d6b82;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
    margin-top: 6px;
  }
  .fav-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .fav-stat {
    min-width: 92px;
    border: 1px solid #dde5f0;
    border-radius: 12px;
    background: #ffffff;
    padding: 12px;
    text-align: center;
  }
  .fav-stat strong {
    display: block;
    color: #17233c;
    font-size: 18px;
    font-weight: 900;
    line-height: 1;
  }
  .fav-stat span {
    display: block;
    margin-top: 5px;
    color: #95a1b2;
    font-size: 11px;
    font-weight: 800;
  }

  .fav-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 14px 0 10px;
  }
  .fav-search {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
    border: 1px solid #dde5f0;
    border-radius: 12px;
    background: #ffffff;
    padding: 0 12px;
    min-height: 44px;
    color: #ff8200;
  }
  .fav-search input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    color: #17233c;
    font-size: 13px;
    font-weight: 700;
  }
  .fav-search__clear,
  .fav-refresh {
    border: 0;
    background: transparent;
    color: #ff8200;
    cursor: pointer;
    font-size: 12px;
    font-weight: 900;
  }
  .fav-refresh {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 44px;
    flex-shrink: 0;
    border: 1px solid #dde5f0;
    border-radius: 12px;
    background: #ffffff;
    padding: 0 14px;
  }
  .fav-refresh:disabled { opacity: 0.6; cursor: not-allowed; }
  .fav-spin { animation: fav-spin 0.8s linear infinite; }
  @keyframes fav-spin { to { transform: rotate(360deg); } }

  .fav-context {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #5d6b82;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 12px;
  }
  .fav-context__safe {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #1a7a4a;
    white-space: nowrap;
  }

  .fav-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  @media (min-width: 480px) { .fav-grid { gap: 12px; } }
  @media (min-width: 640px) { .fav-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (min-width: 980px) { .fav-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  @media (min-width: 1280px) { .fav-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
  @media (max-width: 359px) { .fav-grid { grid-template-columns: 1fr; } }

  .fav-card-wrap {
    position: relative;
    min-width: 0;
    height: 100%;
  }
  .fav-remove {
    position: absolute;
    top: 9px;
    right: 9px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid #fecaca;
    border-radius: 50%;
    background: rgba(255,255,255,0.94);
    color: #ef4444;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(15,14,12,0.12);
    transition: transform 0.16s ease, background 0.16s ease;
  }
  .fav-remove:hover { transform: translateY(-1px); background: #fff1f1; }
  .fav-remove:disabled { opacity: 0.6; cursor: not-allowed; }

  .fav-state {
    display: flex;
    min-height: 360px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid #dde5f0;
    border-radius: 16px;
    background: #ffffff;
    padding: 36px 18px;
    text-align: center;
  }
  .fav-state__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: #fff3e4;
    color: #ff8200;
    margin-bottom: 16px;
  }
  .fav-state__icon--warn { color: #92400e; background: #fffbeb; }
  .fav-state h2 {
    color: #17233c;
    font-size: 22px;
    font-weight: 900;
    margin-bottom: 7px;
  }
  .fav-state p {
    max-width: 430px;
    color: #5d6b82;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.55;
    margin-bottom: 18px;
  }
  .fav-state a,
  .fav-state button,
  .fav-load button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    border: 0;
    border-radius: 10px;
    background: #ff8200;
    color: #ffffff;
    cursor: pointer;
    padding: 0 18px;
    font-size: 13px;
    font-weight: 900;
    text-decoration: none;
  }
  .fav-load {
    display: flex;
    justify-content: center;
    margin-top: 26px;
  }
  .fav-load button:disabled { opacity: 0.65; cursor: not-allowed; }

  .fav-skeleton-card {
    overflow: hidden;
    border: 1px solid #dde5f0;
    border-radius: 14px;
    background: #ffffff;
    animation: fav-pulse 1.4s ease-in-out infinite;
  }
  .fav-skeleton-card__img {
    aspect-ratio: 4 / 3;
    background: #dde5f0;
  }
  .fav-skeleton-card__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }
  .fav-skeleton-card__body span {
    display: block;
    height: 12px;
    border-radius: 999px;
    background: #dde5f0;
  }
  .fav-skeleton-card__body span:nth-child(1) { width: 76%; }
  .fav-skeleton-card__body span:nth-child(2) { width: 56%; }
  .fav-skeleton-card__body span:nth-child(3) { width: 68%; }
  @keyframes fav-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }

  @media (max-width: 640px) {
    .fav-page { padding-top: 16px; }
    .fav-hero { padding: 16px; }
    .fav-hero__main { gap: 11px; }
    .fav-hero__icon { width: 48px; height: 48px; border-radius: 14px; }
    .fav-stats { grid-template-columns: 1fr 1fr 1fr; }
    .fav-stat { padding: 10px 7px; }
    .fav-toolbar { align-items: stretch; }
    .fav-refresh { width: 44px; padding: 0; justify-content: center; font-size: 0; }
    .fav-context { align-items: flex-start; flex-direction: column; gap: 6px; }
  }
`;

export default Favorites;
