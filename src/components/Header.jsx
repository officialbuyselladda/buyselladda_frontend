import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import api from '../services/api';
import { cn, getCategoryLabel, getCategoryValue, useCategoryOptions } from '../utils';
import { searchLocations } from '../utils/geocode';
import { getImageUrl } from '../utils/image';
import {
  Search, Menu, ChevronDown, MapPin, LogOut, Shield, LocateFixed,
  MessageCircle, Plus, X, User, Bell, ChevronRight, Home, Package
} from 'lucide-react';

/* ── Utility: close on outside click ── */
const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};

const getProductSuggestions = (response) => {
  const payload = response?.data?.data || response?.data || {};
  return Array.isArray(payload.products) ? payload.products : Array.isArray(payload.data) ? payload.data : [];
};

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationCtx = useContext(LocationContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [settingLocation, setSettingLocation] = useState(false);
  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [loadingSearchSuggestions, setLoadingSearchSuggestions] = useState(false);
  const { options: categoryOptions } = useCategoryOptions();

  const { data: unreadNotificationCount = 0 } = useQuery({
    queryKey: ['notificationUnreadCount', user?._id],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return res.data.data?.unreadCount || 0;
    },
    enabled: Boolean(user?._id && user?.role === 'user'),
    refetchInterval: 15000,
  });

  const userMenuRef = useRef(null);
  const locationMenuRef = useRef(null);
  const searchRef = useRef(null);
  useOutsideClick(userMenuRef, () => setUserMenuOpen(false));
  useOutsideClick(locationMenuRef, () => setLocationMenuOpen(false));
  useOutsideClick(searchRef, () => {
    if (!mobileOpen) setSearchMenuOpen(false);
  });

  const isAdminPath = location.pathname.startsWith('/admin') && !location.pathname.endsWith('/admin/login');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/?${params.toString()}`);
    setSearchMenuOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const categorySuggestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (term.length < 2) return [];
    return categoryOptions
      .filter((cat) => getCategoryLabel(cat).toLowerCase().includes(term))
      .slice(0, 4);
  }, [categoryOptions, searchQuery]);

  const hasSearchSuggestions = searchQuery.trim().length >= 2;

  const goToCategorySuggestion = (category) => {
    const params = new URLSearchParams();
    params.set('category', getCategoryValue(category));
    navigate(`/?${params.toString()}`);
    setSelectedCategory(getCategoryValue(category));
    setSearchMenuOpen(false);
    setMobileOpen(false);
  };

  const goToProductSuggestion = (product) => {
    if (!product?._id) return;
    navigate(`/products/${product._id}`);
    setSearchMenuOpen(false);
    setMobileOpen(false);
  };

  const locationLabel = locationCtx?.loadingAddress && !locationCtx?.userAddress
    ? 'Detecting address...'
    : locationCtx?.userAddress || 'Set location';

  const handleUseCurrentLocation = () => {
    setLocationError('');
    locationCtx?.getLocation?.({ refresh: true });
    setLocationMenuOpen(false);
  };

  const handleManualLocationSubmit = async (event) => {
    event.preventDefault();
    const query = manualLocation.trim();
    if (!query) {
      setLocationError('Enter city, area, or pincode.');
      return;
    }

    setSettingLocation(true);
    setLocationError('');
    const result = await locationCtx?.setManualLocation?.(query);
    setSettingLocation(false);

    if (!result?.success) {
      setLocationError(result?.message || 'Could not set this location.');
      return;
    }

    setManualLocation('');
    setLocationSuggestions([]);
    setLocationMenuOpen(false);
  };

  const handleSelectLocationSuggestion = (suggestion) => {
    if (!suggestion?.address) return;
    setManualLocation(suggestion.address);
    setLocationSuggestions([]);
    setLocationError('');
    setSettingLocation(true);
    locationCtx?.setManualLocation?.(suggestion.address).then((result) => {
      setSettingLocation(false);
      if (!result?.success) {
        setLocationError(result?.message || 'Could not set this location.');
        return;
      }
      setManualLocation('');
      setLocationMenuOpen(false);
      setMobileOpen(false);
    });
  };

  useEffect(() => {
    const query = manualLocation.trim();
    if (query.length < 3) {
      setLocationSuggestions([]);
      setLoadingSuggestions(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingSuggestions(true);
    const timer = window.setTimeout(async () => {
      const results = await searchLocations(query, 6);
      if (!cancelled) {
        setLocationSuggestions(results);
        setLoadingSuggestions(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [manualLocation]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setProductSuggestions([]);
      setLoadingSearchSuggestions(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingSearchSuggestions(true);
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          search: query,
          page: '1',
          limit: '5',
        });
        if (selectedCategory) params.set('category', selectedCategory);
        const response = await api.get(`/products?${params.toString()}`);
        if (!cancelled) {
          setProductSuggestions(getProductSuggestions(response).slice(0, 5));
          setLoadingSearchSuggestions(false);
        }
      } catch {
        if (!cancelled) {
          setProductSuggestions([]);
          setLoadingSearchSuggestions(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory]);

  /* ── Admin Header ── */
  if (isAdminPath) {
    return (
      <>
        <style>{headerStyles}</style>
        <header className="hdr-admin">
          <div className="hdr-container hdr-admin__inner">
            <Link to="/admin/dashboard" className="hdr-logo">
              <img src="/logo-1.png" alt="BuySellAdda" className="hdr-logo__img" />
            </Link>
            <span className="hdr-admin__badge">Admin Panel</span>
          </div>
        </header>
      </>
    );
  }

  /* ── Public Header ── */
  return (
    <>
      <style>{headerStyles}</style>

      <header className="hdr">
        {/* ══ TOP BAR ══ */}
        <div className="hdr-topbar">
          <div className="hdr-container hdr-topbar__inner">

            {/* Logo */}
            <Link to="/" className="hdr-logo">
              <img src="/logo-1.png" alt="BuySellAdda" className="hdr-logo__img" />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hdr-search" ref={searchRef}>
              <div className="hdr-search__cat-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="hdr-search__cat"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                  }}
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat._id || getCategoryValue(cat)} value={getCategoryValue(cat)}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchMenuOpen(e.target.value.trim().length >= 2);
                }}
                onFocus={() => setSearchMenuOpen(searchQuery.trim().length >= 2)}
                placeholder="Search cars, mobiles, furniture…"
                className="hdr-search__input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setProductSuggestions([]);
                    setSearchMenuOpen(false);
                  }}
                  className="hdr-search__clear"
                >
                  <X size={15} />
                </button>
              )}
              <button type="submit" className="hdr-search__btn">
                <Search size={18} />
                <span className="hdr-search__btn-label">Search</span>
              </button>
              {searchMenuOpen && hasSearchSuggestions && (
                <div className="hdr-search-menu">
                  {categorySuggestions.length > 0 && (
                    <div className="hdr-search-section">
                      <p className="hdr-search-section__label">Categories</p>
                      {categorySuggestions.map((cat) => (
                        <button
                          type="button"
                          key={cat._id || getCategoryValue(cat)}
                          onClick={() => goToCategorySuggestion(cat)}
                          className="hdr-search-category"
                        >
                          <Package size={15} />
                          <span>{getCategoryLabel(cat)}</span>
                          <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="hdr-search-section">
                    <p className="hdr-search-section__label">Products</p>
                    {loadingSearchSuggestions ? (
                      <p className="hdr-search-state">Searching products...</p>
                    ) : productSuggestions.length > 0 ? (
                      productSuggestions.map((product) => (
                        <button
                          type="button"
                          key={product._id}
                          onClick={() => goToProductSuggestion(product)}
                          className="hdr-search-product"
                        >
                          <img src={getImageUrl(product.images?.[0])} alt="" />
                          <span className="hdr-search-product__meta">
                            <strong>{product.title || 'Untitled product'}</strong>
                            <small>
                              {product.price ? `Rs ${Number(product.price).toLocaleString('en-IN')}` : 'Price on request'}
                              {product.location ? ` | ${product.location}` : ''}
                            </small>
                          </span>
                        </button>
                      ))
                    ) : (
                      <button type="submit" className="hdr-search-all">
                        <Search size={15} />
                        Search for "{searchQuery.trim()}"
                      </button>
                    )}
                  </div>
                </div>
              )}
            </form>

            {/* Right Actions */}
            <div className="hdr-actions">

              {/* Location */}
              <div className="hdr-location-wrap" ref={locationMenuRef}>
                <button
                  type="button"
                  onClick={() => setLocationMenuOpen((open) => !open)}
                  className={`hdr-location ${locationCtx?.userLocation ? 'hdr-location--active' : ''}`}
                  aria-expanded={locationMenuOpen}
                  title={locationLabel}
                >
                  <MapPin size={13} className="hdr-location__icon" />
                  <span className="hdr-location__text">{locationLabel}</span>
                  <ChevronDown size={12} className={`hdr-location__chevron ${locationMenuOpen ? 'hdr-location__chevron--open' : ''}`} />
                </button>

                {locationMenuOpen && (
                  <div className="hdr-location-menu">
                    <div className="hdr-location-menu__head">
                      <p className="hdr-location-menu__title">Choose location</p>
                      <p className="hdr-location-menu__sub">Nearby ads update automatically.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locationCtx?.loadingLocation}
                      className="hdr-location-current"
                    >
                      <LocateFixed size={15} />
                      {locationCtx?.loadingLocation ? 'Detecting...' : 'Use current location'}
                    </button>
                    <form onSubmit={handleManualLocationSubmit} className="hdr-location-form">
                      <div className="hdr-location-input">
                        <Search size={14} />
                        <input
                          value={manualLocation}
                          onChange={(event) => {
                            setManualLocation(event.target.value);
                            setLocationError('');
                          }}
                          placeholder="City, area, or pincode"
                        />
                      </div>
                      <button type="submit" disabled={settingLocation} className="hdr-location-submit">
                        {settingLocation ? 'Setting...' : 'Set'}
                      </button>
                    </form>
                    {(loadingSuggestions || locationSuggestions.length > 0) && (
                      <div className="hdr-location-suggestions">
                        {loadingSuggestions ? (
                          <p className="hdr-location-suggestions__state">Searching addresses...</p>
                        ) : (
                          locationSuggestions.map((suggestion) => (
                            <button
                              type="button"
                              key={`${suggestion.lat}-${suggestion.lng}-${suggestion.address}`}
                              onClick={() => handleSelectLocationSuggestion(suggestion)}
                              className="hdr-location-suggestion"
                            >
                              <MapPin size={14} />
                              <span>{suggestion.displayName || suggestion.address}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    {locationError && <p className="hdr-location-error">{locationError}</p>}
                    {locationCtx?.userLocation && (
                      <button
                        type="button"
                        onClick={() => {
                          locationCtx.clearLocation();
                          setLocationMenuOpen(false);
                        }}
                        className="hdr-location-clear"
                      >
                        Clear location
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Post Ad */}
              {user?.role === 'user' && (
                <Link to="/create-product" className="hdr-post-btn">
                  <Plus size={16} />
                  <span className="hdr-post-btn__label">Sell</span>
                </Link>
              )}

              {/* Notifications + Chat */}
              {user?.role === 'user' && (
                <>
                  <Link to="/notifications" className="hdr-icon-btn" title="Notifications">
                    <Bell size={19} />
                    {unreadNotificationCount > 0 && (
                      <span className="hdr-badge">{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</span>
                    )}
                  </Link>
                  <Link to="/chats" className="hdr-icon-btn" title="Messages">
                    <MessageCircle size={19} />
                  </Link>
                </>
              )}

              {/* Admin Panel */}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="hdr-admin-btn">
                  <Shield size={15} />
                  <span className="hdr-admin-btn__label">Admin</span>
                </Link>
              )}

              {/* User Menu / Auth */}
              {user ? (
                <div className="hdr-user" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="hdr-user__trigger"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="hdr-user__avatar">
                      <User size={15} />
                    </div>
                    <span className="hdr-user__name">{user.name}</span>
                    <ChevronDown size={13} className={`hdr-user__chevron ${userMenuOpen ? 'hdr-user__chevron--open' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="hdr-dropdown">
                      <div className="hdr-dropdown__header">
                        <p className="hdr-dropdown__name">{user.name}</p>
                        <p className="hdr-dropdown__email">{user.email}</p>
                      </div>
                      <div className="hdr-dropdown__body">
                        <Link to="/my-products" onClick={() => setUserMenuOpen(false)} className="hdr-dropdown__item">
                          <Home size={15} /> My Ads
                        </Link>
                        <Link to="/chats" onClick={() => setUserMenuOpen(false)} className="hdr-dropdown__item">
                          <MessageCircle size={15} /> Messages
                        </Link>
                        <Link to="/notifications" onClick={() => setUserMenuOpen(false)} className="hdr-dropdown__item">
                          <Bell size={15} /> Notifications
                        </Link>
                      </div>
                      <div className="hdr-dropdown__footer">
                        <button onClick={handleLogout} className="hdr-dropdown__logout">
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hdr-auth">
                  <Link to="/login" className="hdr-auth__login">Login</Link>
                  <Link to="/register" className="hdr-auth__signup">Sign Up</Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="hdr-hamburger"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM NAV ══ */}
        <div className="hdr-subnav">
          <div className="hdr-container hdr-subnav__inner">
            <nav className="hdr-subnav__links">
              {[
                { label: 'All Ads', to: '/' },
                ...categoryOptions.slice(0, 6).map((cat) => ({
                  label: getCategoryLabel(cat),
                  to: `/?category=${encodeURIComponent(getCategoryValue(cat))}`,
                })),
              ].map((item) => {
                const isActive = item.to === '/'
                  ? !location.search
                  : location.search.includes(item.to.split('?')[1] || '__none__');
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`hdr-subnav__link ${isActive ? 'hdr-subnav__link--active' : ''}`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* More dropdown */}
              {categoryOptions.length > 6 && (
                <div className="hdr-more">
                  <button className="hdr-more__trigger">
                    More <ChevronDown size={12} />
                  </button>
                  <div className="hdr-more__menu">
                    {categoryOptions.slice(6).map((cat) => (
                      <Link
                        key={cat._id || getCategoryValue(cat)}
                        to={`/?category=${encodeURIComponent(getCategoryValue(cat))}`}
                        className="hdr-more__item"
                      >
                        {getCategoryLabel(cat)}
                        <ChevronRight size={13} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            {user?.role === 'admin' && (
              <button onClick={handleLogout} className="hdr-subnav__logout">
                <LogOut size={13} /> Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══ MOBILE DRAWER ══ */}
      {mobileOpen && (
        <div className="hdr-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="hdr-drawer" onClick={(e) => e.stopPropagation()}>

            {/* Mobile Search */}
            <div className="hdr-drawer__search">
              <form onSubmit={handleSearch} className="hdr-drawer__search-form">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchMenuOpen(e.target.value.trim().length >= 2);
                  }}
                  onFocus={() => setSearchMenuOpen(searchQuery.trim().length >= 2)}
                  placeholder="Search anything…"
                  className="hdr-drawer__search-input"
                  autoFocus
                />
                <button type="submit" className="hdr-drawer__search-btn">
                  <Search size={18} />
                </button>
              </form>
              {searchMenuOpen && hasSearchSuggestions && (
                <div className="hdr-drawer__search-menu">
                  {categorySuggestions.length > 0 && (
                    <div className="hdr-search-section">
                      <p className="hdr-search-section__label">Categories</p>
                      {categorySuggestions.map((cat) => (
                        <button
                          type="button"
                          key={cat._id || getCategoryValue(cat)}
                          onClick={() => goToCategorySuggestion(cat)}
                          className="hdr-search-category"
                        >
                          <Package size={15} />
                          <span>{getCategoryLabel(cat)}</span>
                          <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="hdr-search-section">
                    <p className="hdr-search-section__label">Products</p>
                    {loadingSearchSuggestions ? (
                      <p className="hdr-search-state">Searching products...</p>
                    ) : productSuggestions.length > 0 ? (
                      productSuggestions.map((product) => (
                        <button
                          type="button"
                          key={product._id}
                          onClick={() => goToProductSuggestion(product)}
                          className="hdr-search-product"
                        >
                          <img src={getImageUrl(product.images?.[0])} alt="" />
                          <span className="hdr-search-product__meta">
                            <strong>{product.title || 'Untitled product'}</strong>
                            <small>
                              {product.price ? `Rs ${Number(product.price).toLocaleString('en-IN')}` : 'Price on request'}
                              {product.location ? ` | ${product.location}` : ''}
                            </small>
                          </span>
                        </button>
                      ))
                    ) : (
                      <button type="button" onClick={handleSearch} className="hdr-search-all">
                        <Search size={15} />
                        Search for "{searchQuery.trim()}"
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="hdr-drawer__location">
              <div className="hdr-drawer__location-line">
                <MapPin size={14} className="hdr-drawer__location-icon" />
                <span>{locationLabel}</span>
              </div>
              <div className="hdr-drawer__location-actions">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationCtx?.loadingLocation}
                  className="hdr-drawer__location-btn"
                >
                  <LocateFixed size={14} />
                  {locationCtx?.loadingLocation ? 'Detecting...' : 'Current'}
                </button>
                {locationCtx?.userLocation && (
                  <button type="button" onClick={locationCtx.clearLocation} className="hdr-drawer__location-btn hdr-drawer__location-btn--ghost">
                    Clear
                  </button>
                )}
              </div>
              <form onSubmit={handleManualLocationSubmit} className="hdr-drawer__location-form">
                <input
                  value={manualLocation}
                  onChange={(event) => {
                    setManualLocation(event.target.value);
                    setLocationError('');
                  }}
                  placeholder="Set city, area, or pincode"
                />
                <button type="submit" disabled={settingLocation}>
                  {settingLocation ? '...' : 'Set'}
                </button>
              </form>
              {(loadingSuggestions || locationSuggestions.length > 0) && (
                <div className="hdr-drawer__location-suggestions">
                  {loadingSuggestions ? (
                    <p className="hdr-location-suggestions__state">Searching addresses...</p>
                  ) : (
                    locationSuggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={`${suggestion.lat}-${suggestion.lng}-${suggestion.address}`}
                        onClick={() => handleSelectLocationSuggestion(suggestion)}
                        className="hdr-drawer__location-suggestion"
                      >
                        <MapPin size={14} />
                        <span>{suggestion.displayName || suggestion.address}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {locationError && <p className="hdr-drawer__location-error">{locationError}</p>}
            </div>

            {/* Browse */}
            <div className="hdr-drawer__section">
              <p className="hdr-drawer__section-label">Browse</p>
              <div className="hdr-drawer__grid">
                {[
                  { label: 'All Ads', to: '/' },
                  ...categoryOptions.slice(0, 5).map((cat) => ({
                    label: getCategoryLabel(cat),
                    to: `/?category=${encodeURIComponent(getCategoryValue(cat))}`,
                  })),
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="hdr-drawer__grid-item"
                  >
                    <ChevronRight size={13} className="hdr-drawer__grid-icon" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* All Categories Toggle */}
            <div className="hdr-drawer__section">
              <button
                onClick={() => setMobileCatOpen((o) => !o)}
                className="hdr-drawer__cat-toggle"
              >
                All Categories
                <ChevronDown size={15} className={`hdr-drawer__cat-chevron ${mobileCatOpen ? 'hdr-drawer__cat-chevron--open' : ''}`} />
              </button>
              {mobileCatOpen && (
                <div className="hdr-drawer__cat-list">
                  {categoryOptions.map((cat) => (
                    <Link
                      key={cat._id || getCategoryValue(cat)}
                      to={`/?category=${encodeURIComponent(getCategoryValue(cat))}`}
                      onClick={() => setMobileOpen(false)}
                      className="hdr-drawer__cat-item"
                    >
                      {getCategoryLabel(cat)}
                      <ChevronRight size={13} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Post Ad */}
            {user?.role === 'user' && (
              <div className="hdr-drawer__section">
                <Link
                  to="/create-product"
                  onClick={() => setMobileOpen(false)}
                  className="hdr-drawer__post-btn"
                >
                  <Plus size={16} />
                  Sell
                </Link>
              </div>
            )}

            {/* User / Auth */}
            <div className="hdr-drawer__section hdr-drawer__section--auth">
              {user ? (
                <div className="hdr-drawer__user">
                  <div className="hdr-drawer__user-profile">
                    <div className="hdr-drawer__user-avatar">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="hdr-drawer__user-name">{user.name}</p>
                      <p className="hdr-drawer__user-email">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="hdr-drawer__menu-item hdr-drawer__menu-item--admin">
                      <Shield size={15} /> Admin Panel
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <Link to="/my-products" onClick={() => setMobileOpen(false)} className="hdr-drawer__menu-item">
                      <Home size={15} /> My Ads
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <Link to="/notifications" onClick={() => setMobileOpen(false)} className="hdr-drawer__menu-item">
                      <span className="hdr-drawer__menu-item-left"><Bell size={15} /> Notifications</span>
                      {unreadNotificationCount > 0 && (
                        <span className="hdr-drawer__notif-badge">{unreadNotificationCount}</span>
                      )}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="hdr-drawer__logout">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              ) : (
                <div className="hdr-drawer__auth">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="hdr-drawer__auth-login">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="hdr-drawer__auth-signup">Sign Up</Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const headerStyles = `
  :root {
    --hdr-bg: #ffffff;
    --hdr-border: #edeae5;
    --hdr-bg-sub: #faf9f7;
    --hdr-accent: #d4571a;
    --hdr-accent-hover: #b84816;
    --hdr-accent-light: #fff4ef;
    --hdr-text: #0f0e0c;
    --hdr-text-2: #6b6860;
    --hdr-text-3: #9c9890;
    --hdr-shadow: 0 1px 0 #edeae5, 0 2px 16px rgba(0,0,0,0.06);
    --hdr-radius: 10px;
    --hdr-radius-full: 999px;
    --hdr-t: 0.16s cubic-bezier(0.4,0,0.2,1);
    --hdr-h: 62px;
    --hdr-sub-h: 40px;
  }

  /* ── Base ── */
  .hdr {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--hdr-bg);
    box-shadow: var(--hdr-shadow);
  }

  .hdr-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 16px;
  }
  @media (min-width: 640px) { .hdr-container { padding: 0 20px; } }
  @media (min-width: 1024px) { .hdr-container { padding: 0 40px; } }
  @media (max-width: 639px) {
    :root {
      --hdr-h: 56px;
    }
    .hdr-container {
      padding: 0 12px;
    }
  }

  /* ── Admin ── */
  .hdr-admin {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--hdr-bg);
    border-bottom: 1px solid var(--hdr-border);
    box-shadow: 0 1px 8px rgba(0,0,0,0.05);
  }
  .hdr-admin__inner {
    display: flex;
    align-items: center;
    height: var(--hdr-h);
    gap: 12px;
  }
  .hdr-admin__badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--hdr-text-3);
    background: #f5f4f1;
    border: 1px solid var(--hdr-border);
    padding: 3px 10px;
    border-radius: var(--hdr-radius-full);
  }

  /* ── Logo ── */
  .hdr-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  }
  .hdr-logo__img {
    height: 54px;
    width: auto;
    max-width: 170px;
    object-fit: contain;
  }
  @media (min-width: 1024px) { .hdr-logo__img { height: 60px; max-width: 190px; } }
  @media (max-width: 639px) { .hdr-logo__img { height: 46px; max-width: 138px; } }
  @media (max-width: 360px) { .hdr-logo__img { height: 42px; max-width: 118px; } }

  /* ── Top Bar ── */
  .hdr-topbar {
    background: var(--hdr-bg);
    border-bottom: 1px solid var(--hdr-border);
  }
  .hdr-topbar__inner {
    display: flex;
    align-items: center;
    height: var(--hdr-h);
    gap: 8px;
    min-width: 0;
  }
  @media (min-width: 1024px) { .hdr-topbar__inner { gap: 14px; } }

  /* ── Search ── */
  .hdr-search {
    position: relative;
    display: none;
    flex: 1 1 560px;
    min-width: 280px;
    align-items: stretch;
    height: 46px;
    border: 1.5px solid var(--hdr-border);
    border-radius: var(--hdr-radius);
    overflow: visible;
    background: var(--hdr-bg);
    transition: border-color var(--hdr-t), box-shadow var(--hdr-t);
  }
  .hdr-search:focus-within {
    border-color: var(--hdr-accent);
    box-shadow: 0 0 0 3px rgba(212,87,26,0.10);
  }
  @media (min-width: 1024px) { .hdr-search { display: flex; } }
  @media (min-width: 1200px) { .hdr-search { flex-basis: 680px; } }

  .hdr-search__cat-wrap {
    display: none;
    align-items: center;
    flex: 0 0 116px;
    width: 116px;
    border-right: 1.5px solid var(--hdr-border);
    background: #faf9f7;
  }
  @media (min-width: 1024px) { .hdr-search__cat-wrap { display: flex; } }
  @media (min-width: 1280px) {
    .hdr-search__cat-wrap {
      flex-basis: 126px;
      width: 126px;
    }
  }
  .hdr-search__cat {
    width: 100%;
    min-width: 0;
    font-size: 12px;
    color: var(--hdr-text-2);
    background: transparent;
    padding: 0 23px 0 10px;
    height: 100%;
    border: none;
    outline: none;
    appearance: none;
    cursor: pointer;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-search__input {
    flex: 1;
    padding: 0 16px;
    font-size: 14px;
    color: var(--hdr-text);
    background: transparent;
    border: none;
    outline: none;
    min-width: 0;
  }
  .hdr-search__input::placeholder { color: var(--hdr-text-3); }
  .hdr-search__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    color: var(--hdr-text-3);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color var(--hdr-t);
  }
  .hdr-search__clear:hover { color: var(--hdr-text-2); }
  .hdr-search__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 48px;
    padding: 0 16px;
    background: var(--hdr-accent);
    color: #fff;
    border: none;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    transition: background var(--hdr-t);
    white-space: nowrap;
  }
  .hdr-search__btn:hover { background: var(--hdr-accent-hover); }
  .hdr-search__btn-label { display: none; }
  @media (min-width: 768px) {
    .hdr-search__btn {
      min-width: 94px;
      padding: 0 20px;
    }
    .hdr-search__btn-label { display: inline; }
  }

  /* ── Right Actions ── */
  .hdr-search-menu,
  .hdr-drawer__search-menu {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    right: 0;
    z-index: 75;
    overflow: hidden;
    border: 1px solid var(--hdr-border);
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 22px 52px rgba(17, 24, 39, 0.16);
  }
  .hdr-search-section {
    padding: 9px;
    border-bottom: 1px solid var(--hdr-border);
  }
  .hdr-search-section:last-child { border-bottom: 0; }
  .hdr-search-section__label {
    margin: 0 0 6px;
    padding: 0 3px;
    color: var(--hdr-text-3);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .hdr-search-category,
  .hdr-search-product,
  .hdr-search-all {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 10px;
    border: 0;
    border-radius: 11px;
    background: transparent;
    padding: 9px;
    color: var(--hdr-text-2);
    text-align: left;
    cursor: pointer;
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-search-category:hover,
  .hdr-search-product:hover,
  .hdr-search-all:hover {
    background: var(--hdr-accent-light);
    color: var(--hdr-text);
  }
  .hdr-search-category svg,
  .hdr-search-all svg {
    flex-shrink: 0;
    color: var(--hdr-accent);
  }
  .hdr-search-category span {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13px;
    font-weight: 800;
  }
  .hdr-search-product img {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 10px;
    object-fit: cover;
    background: var(--hdr-bg-sub);
  }
  .hdr-search-product__meta {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 2px;
  }
  .hdr-search-product__meta strong {
    overflow: hidden;
    color: var(--hdr-text);
    font-size: 13px;
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hdr-search-product__meta small {
    overflow: hidden;
    color: var(--hdr-text-3);
    font-size: 11.5px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hdr-search-state {
    margin: 0;
    padding: 10px 9px;
    color: var(--hdr-text-3);
    font-size: 12px;
    font-weight: 750;
  }
  .hdr-search-all {
    color: var(--hdr-accent);
    font-size: 13px;
    font-weight: 850;
  }

  .hdr-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
    flex-shrink: 0;
    min-width: 0;
  }
  @media (min-width: 1024px) { .hdr-actions { margin-left: 0; gap: 8px; } }

  /* Location picker */
  .hdr-location-wrap {
    position: relative;
    display: none;
  }
  @media (min-width: 1024px) { .hdr-location-wrap { display: block; } }

  .hdr-location {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 36px;
    border: 1px solid var(--hdr-border);
    border-radius: var(--hdr-radius-full);
    background: #faf9f7;
    padding: 0 10px;
    color: var(--hdr-text-2);
    font-size: 11.5px;
    font-weight: 700;
    max-width: 190px;
    cursor: pointer;
    transition: background var(--hdr-t), border-color var(--hdr-t), color var(--hdr-t);
  }
  .hdr-location:hover,
  .hdr-location--active {
    border-color: #fddcc8;
    background: var(--hdr-accent-light);
    color: var(--hdr-text);
  }
  .hdr-location__icon {
    color: var(--hdr-accent);
    flex-shrink: 0;
  }
  .hdr-location__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hdr-location__chevron {
    flex-shrink: 0;
    color: var(--hdr-text-2);
    transition: transform var(--hdr-t);
  }
  .hdr-location__chevron--open { transform: rotate(180deg); }

  .hdr-location-menu {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 80;
    width: 320px;
    border: 1px solid var(--hdr-border);
    border-radius: 18px;
    background: #ffffff;
    padding: 14px;
    box-shadow: 0 20px 48px rgba(17, 24, 39, 0.16);
  }
  .hdr-location-menu__head {
    margin-bottom: 11px;
  }
  .hdr-location-menu__title {
    margin: 0;
    color: var(--hdr-text);
    font-size: 14px;
    font-weight: 850;
  }
  .hdr-location-menu__sub {
    margin: 2px 0 0;
    color: var(--hdr-text-3);
    font-size: 12px;
    line-height: 1.35;
  }
  .hdr-location-current {
    display: flex;
    width: 100%;
    height: 40px;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 1px solid #fddcc8;
    border-radius: 13px;
    background: var(--hdr-accent-light);
    color: var(--hdr-accent);
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
  }
  .hdr-location-current:disabled {
    cursor: wait;
    opacity: 0.68;
  }
  .hdr-location-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-top: 10px;
  }
  .hdr-location-input {
    display: flex;
    min-width: 0;
    height: 40px;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--hdr-border);
    border-radius: 13px;
    background: #faf9f7;
    padding: 0 10px;
    color: var(--hdr-text-3);
  }
  .hdr-location-input input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--hdr-text);
    font-size: 13px;
    font-weight: 650;
  }
  .hdr-location-submit {
    min-width: 58px;
    border: 0;
    border-radius: 13px;
    background: var(--hdr-accent);
    color: #ffffff;
    font-size: 13px;
    font-weight: 850;
    cursor: pointer;
  }
  .hdr-location-submit:disabled {
    cursor: wait;
    opacity: 0.7;
  }
  .hdr-location-suggestions {
    display: flex;
    max-height: 220px;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    margin-top: 9px;
    border: 1px solid var(--hdr-border);
    border-radius: 13px;
    background: #ffffff;
    padding: 5px;
  }
  .hdr-location-suggestions__state {
    margin: 0;
    padding: 10px;
    color: var(--hdr-text-3);
    font-size: 12px;
    font-weight: 700;
  }
  .hdr-location-suggestion {
    display: flex;
    width: 100%;
    align-items: flex-start;
    gap: 8px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    padding: 9px;
    color: var(--hdr-text-2);
    text-align: left;
    cursor: pointer;
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-location-suggestion:hover {
    background: var(--hdr-accent-light);
    color: var(--hdr-text);
  }
  .hdr-location-suggestion svg {
    margin-top: 2px;
    flex-shrink: 0;
    color: var(--hdr-accent);
  }
  .hdr-location-suggestion span {
    display: -webkit-box;
    overflow: hidden;
    color: inherit;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .hdr-location-error {
    margin: 8px 2px 0;
    color: #dc2626;
    font-size: 12px;
    font-weight: 700;
  }
  .hdr-location-clear {
    margin-top: 10px;
    border: 0;
    background: transparent;
    color: var(--hdr-text-3);
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* Post Ad */
  .hdr-post-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 82px;
    padding: 9px 14px;
    background: var(--hdr-accent);
    color: #fff;
    font-size: 13px;
    font-weight: 850;
    border-radius: var(--hdr-radius-full);
    text-decoration: none;
    transition: background var(--hdr-t), transform var(--hdr-t), box-shadow var(--hdr-t);
    box-shadow: 0 2px 10px rgba(212,87,26,0.25);
    white-space: nowrap;
  }
  .hdr-post-btn:hover {
    background: var(--hdr-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(212,87,26,0.32);
  }
  .hdr-post-btn__label { display: inline; }
  @media (max-width: 1023px) {
    .hdr-post-btn {
      min-width: 70px;
      height: 38px;
      padding: 0 12px;
      font-size: 12.5px;
    }
  }
  @media (max-width: 380px) {
    .hdr-post-btn {
      min-width: 40px;
      width: 40px;
      height: 40px;
      padding: 0;
    }
    .hdr-post-btn__label { display: none; }
  }

  /* Icon buttons */
  .hdr-icon-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--hdr-radius);
    color: var(--hdr-text-2);
    text-decoration: none;
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-icon-btn:hover { background: var(--hdr-accent-light); color: var(--hdr-accent); }
  @media (max-width: 1023px) {
    .hdr-icon-btn {
      display: none;
    }
  }

  .hdr-badge {
    position: absolute;
    top: -3px;
    right: -3px;
    min-width: 17px;
    height: 17px;
    background: #ef4444;
    border-radius: var(--hdr-radius-full);
    font-size: 9.5px;
    font-weight: 800;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    border: 1.5px solid #fff;
  }

  /* Admin btn */
  .hdr-admin-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 12px;
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    border-radius: var(--hdr-radius);
    text-decoration: none;
    transition: opacity var(--hdr-t);
    box-shadow: 0 2px 8px rgba(124,58,237,0.3);
  }
  .hdr-admin-btn:hover { opacity: 0.9; }
  .hdr-admin-btn__label { display: none; }
  @media (min-width: 640px) { .hdr-admin-btn__label { display: inline; } }
  @media (max-width: 1023px) {
    .hdr-admin-btn {
      display: none;
    }
  }

  /* User Menu */
  .hdr-user { position: relative; }
  @media (max-width: 1023px) {
    .hdr-user {
      display: none;
    }
  }
  .hdr-user__trigger {
    display: flex;
    align-items: center;
    gap: 7px;
    height: 38px;
    padding: 0 10px;
    border-radius: var(--hdr-radius);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background var(--hdr-t);
    color: var(--hdr-text);
  }
  .hdr-user__trigger:hover { background: #f5f4f1; }
  .hdr-user__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--hdr-accent-light);
    border: 1.5px solid #fddcc8;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--hdr-accent);
    flex-shrink: 0;
  }
  .hdr-user__name {
    display: none;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--hdr-text-2);
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (min-width: 1024px) { .hdr-user__name { display: inline; } }
  .hdr-user__chevron {
    display: none;
    color: var(--hdr-text-3);
    transition: transform var(--hdr-t);
  }
  @media (min-width: 1024px) { .hdr-user__chevron { display: block; } }
  .hdr-user__chevron--open { transform: rotate(180deg); }

  /* Dropdown */
  .hdr-dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 210px;
    background: var(--hdr-bg);
    border: 1px solid var(--hdr-border);
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
    z-index: 200;
    overflow: hidden;
    animation: hdr-pop 0.14s ease;
  }
  @keyframes hdr-pop {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  .hdr-dropdown__header {
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--hdr-border);
    background: #faf9f7;
  }
  .hdr-dropdown__name { font-size: 13.5px; font-weight: 700; color: var(--hdr-text); margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hdr-dropdown__email { font-size: 11.5px; color: var(--hdr-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hdr-dropdown__body { padding: 6px 0; }
  .hdr-dropdown__item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 16px;
    font-size: 13px;
    color: var(--hdr-text-2);
    text-decoration: none;
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-dropdown__item:hover { background: var(--hdr-accent-light); color: var(--hdr-accent); }
  .hdr-dropdown__footer { border-top: 1px solid var(--hdr-border); padding: 6px 0; }
  .hdr-dropdown__logout {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 9px 16px;
    font-size: 13px;
    color: #ef4444;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background var(--hdr-t);
    text-align: left;
  }
  .hdr-dropdown__logout:hover { background: #fff5f5; }

  /* Auth */
  .hdr-auth { display: flex; align-items: center; gap: 6px; }
  @media (max-width: 1023px) {
    .hdr-auth {
      display: none;
    }
  }
  .hdr-auth__login {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--hdr-accent);
    text-decoration: none;
    padding: 7px 12px;
    border: 1.5px solid #fddcc8;
    border-radius: var(--hdr-radius);
    transition: background var(--hdr-t), color var(--hdr-t);
    white-space: nowrap;
  }
  .hdr-auth__login:hover { background: var(--hdr-accent-light); }
  .hdr-auth__signup {
    font-size: 12.5px;
    font-weight: 700;
    color: #fff;
    background: var(--hdr-accent);
    text-decoration: none;
    padding: 7px 13px;
    border-radius: var(--hdr-radius);
    transition: background var(--hdr-t);
    white-space: nowrap;
  }
  .hdr-auth__signup:hover { background: var(--hdr-accent-hover); }

  /* Hamburger */
  .hdr-hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: var(--hdr-radius);
    background: transparent;
    border: none;
    color: var(--hdr-text-2);
    cursor: pointer;
    transition: background var(--hdr-t);
  }
  .hdr-hamburger:hover { background: #f5f4f1; }
  @media (min-width: 1024px) { .hdr-hamburger { display: none; } }

  /* ── Sub Nav ── */
  .hdr-subnav {
    display: none;
    background: var(--hdr-bg-sub);
    border-top: 1px solid var(--hdr-border);
  }
  @media (min-width: 1024px) { .hdr-subnav { display: block; } }
  .hdr-subnav__inner {
    display: flex;
    align-items: center;
    height: var(--hdr-sub-h);
    justify-content: space-between;
  }
  .hdr-subnav__links {
    display: flex;
    align-items: center;
    gap: 2px;
    overflow: hidden;
  }
  .hdr-subnav__link {
    padding: 5px 10px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--hdr-text-2);
    text-decoration: none;
    border-radius: 7px;
    white-space: nowrap;
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-subnav__link:hover { background: var(--hdr-accent-light); color: var(--hdr-accent); }
  .hdr-subnav__link--active { background: var(--hdr-accent-light); color: var(--hdr-accent); }
  .hdr-subnav__logout {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--hdr-text-3);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color var(--hdr-t);
    flex-shrink: 0;
    margin-left: 8px;
  }
  .hdr-subnav__logout:hover { color: #ef4444; }

  /* More dropdown */
  .hdr-more { position: relative; }
  .hdr-more__trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--hdr-text-2);
    background: transparent;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    transition: background var(--hdr-t), color var(--hdr-t);
    white-space: nowrap;
  }
  .hdr-more__trigger:hover, .hdr-more:hover .hdr-more__trigger {
    background: var(--hdr-accent-light); color: var(--hdr-accent);
  }
  .hdr-more__menu {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    min-width: 180px;
    background: var(--hdr-bg);
    border: 1px solid var(--hdr-border);
    border-radius: 12px;
    box-shadow: 0 8px 28px rgba(0,0,0,0.10);
    padding: 6px;
    z-index: 200;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    transition: opacity var(--hdr-t), visibility var(--hdr-t), transform var(--hdr-t);
  }
  .hdr-more:hover .hdr-more__menu {
    opacity: 1; visibility: visible; transform: translateY(0);
  }
  .hdr-more__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--hdr-text-2);
    text-decoration: none;
    border-radius: 8px;
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-more__item:hover { background: var(--hdr-accent-light); color: var(--hdr-accent); }

  /* ── Mobile Drawer ── */
  .hdr-drawer-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 99;
    background: rgba(0,0,0,0.25);
    backdrop-filter: blur(2px);
    animation: hdr-fade 0.2s ease;
  }
  @media (min-width: 1024px) { .hdr-drawer-overlay { display: none; } }
  @keyframes hdr-fade { from { opacity: 0 } to { opacity: 1 } }

  .hdr-drawer {
    position: absolute;
    top: var(--hdr-h);
    left: 0;
    right: 0;
    background: var(--hdr-bg);
    border-radius: 0 0 20px 20px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.14);
    max-height: calc(100vh - var(--hdr-h) - 16px);
    overflow-y: auto;
    animation: hdr-slide 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  @media (min-width: 640px) and (max-width: 1023px) {
    .hdr-drawer {
      left: auto;
      width: min(420px, calc(100vw - 24px));
      right: 12px;
      border-radius: 0 0 20px 20px;
    }
  }
  @keyframes hdr-slide {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hdr-drawer__search {
    position: relative;
    padding: 12px 16px;
    border-bottom: 1px solid var(--hdr-border);
  }
  .hdr-drawer__search-menu {
    top: calc(100% - 2px);
    left: 16px;
    right: 16px;
  }
  .hdr-drawer__search-form {
    display: flex;
    min-height: 46px;
    border: 1.5px solid var(--hdr-border);
    border-radius: var(--hdr-radius);
    overflow: hidden;
    transition: border-color var(--hdr-t);
  }
  .hdr-drawer__search-form:focus-within { border-color: var(--hdr-accent); }
  .hdr-drawer__search-input {
    flex: 1;
    padding: 0 14px;
    font-size: 14px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--hdr-text);
  }
  .hdr-drawer__search-input::placeholder { color: var(--hdr-text-3); }
  .hdr-drawer__search-btn {
    min-width: 54px;
    padding: 0 18px;
    background: var(--hdr-accent);
    color: #fff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background var(--hdr-t);
  }
  .hdr-drawer__search-btn:hover { background: var(--hdr-accent-hover); }

  .hdr-drawer__location {
    margin: 10px 16px;
    background: var(--hdr-accent-light);
    border: 1px solid #fddcc8;
    padding: 11px;
    border-radius: var(--hdr-radius);
    font-size: 13px;
    color: var(--hdr-text-2);
  }
  .hdr-drawer__location-line {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 8px;
    color: var(--hdr-text);
    font-weight: 750;
  }
  .hdr-drawer__location-line span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hdr-drawer__location-icon { color: var(--hdr-accent); flex-shrink: 0; }
  .hdr-drawer__location-actions {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .hdr-drawer__location-btn {
    display: inline-flex;
    min-height: 36px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 0;
    border-radius: 11px;
    background: var(--hdr-accent);
    padding: 0 12px;
    color: #ffffff;
    font-size: 12px;
    font-weight: 850;
  }
  .hdr-drawer__location-btn:disabled {
    opacity: 0.68;
  }
  .hdr-drawer__location-btn--ghost {
    background: #ffffff;
    color: var(--hdr-accent);
  }
  .hdr-drawer__location-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    margin-top: 9px;
  }
  .hdr-drawer__location-form input {
    min-width: 0;
    height: 38px;
    border: 1px solid #fddcc8;
    border-radius: 11px;
    background: #ffffff;
    padding: 0 10px;
    color: var(--hdr-text);
    font-size: 13px;
    outline: 0;
  }
  .hdr-drawer__location-form button {
    min-width: 54px;
    border: 0;
    border-radius: 11px;
    background: var(--hdr-accent);
    color: #ffffff;
    font-size: 12px;
    font-weight: 850;
  }
  .hdr-drawer__location-suggestions {
    display: flex;
    max-height: 230px;
    flex-direction: column;
    gap: 5px;
    overflow-y: auto;
    margin-top: 9px;
    border-radius: 12px;
    background: #ffffff;
    padding: 5px;
  }
  .hdr-drawer__location-suggestion {
    display: flex;
    width: 100%;
    align-items: flex-start;
    gap: 8px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    padding: 10px;
    color: var(--hdr-text-2);
    text-align: left;
  }
  .hdr-drawer__location-suggestion svg {
    margin-top: 2px;
    flex-shrink: 0;
    color: var(--hdr-accent);
  }
  .hdr-drawer__location-suggestion span {
    display: -webkit-box;
    overflow: hidden;
    font-size: 12.5px;
    font-weight: 750;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .hdr-drawer__location-error {
    margin: 8px 2px 0;
    color: #dc2626;
    font-size: 12px;
    font-weight: 750;
  }

  .hdr-drawer__section {
    padding: 12px 16px;
    border-bottom: 1px solid var(--hdr-border);
  }
  .hdr-drawer__section:last-child { border-bottom: none; }
  .hdr-drawer__section--auth { }

  .hdr-drawer__section-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hdr-text-3);
    margin-bottom: 8px;
    padding: 0 2px;
  }

  .hdr-drawer__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  .hdr-drawer__grid-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 12px;
    background: #faf9f7;
    border: 1px solid var(--hdr-border);
    border-radius: var(--hdr-radius);
    font-size: 13px;
    font-weight: 500;
    color: var(--hdr-text-2);
    text-decoration: none;
    transition: background var(--hdr-t), color var(--hdr-t), border-color var(--hdr-t);
  }
  .hdr-drawer__grid-item:hover { background: var(--hdr-accent-light); color: var(--hdr-accent); border-color: #fddcc8; }
  .hdr-drawer__grid-icon { color: var(--hdr-text-3); flex-shrink: 0; }

  .hdr-drawer__cat-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 14px;
    background: #faf9f7;
    border: 1px solid var(--hdr-border);
    border-radius: var(--hdr-radius);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--hdr-text-2);
    cursor: pointer;
    transition: background var(--hdr-t);
  }
  .hdr-drawer__cat-toggle:hover { background: #f5f3ef; }
  .hdr-drawer__cat-chevron { transition: transform var(--hdr-t); color: var(--hdr-text-3); }
  .hdr-drawer__cat-chevron--open { transform: rotate(180deg); }
  .hdr-drawer__cat-list {
    margin-top: 6px;
    border: 1px solid var(--hdr-border);
    border-radius: var(--hdr-radius);
    overflow: hidden;
  }
  .hdr-drawer__cat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 13px;
    color: var(--hdr-text-2);
    text-decoration: none;
    border-bottom: 1px solid var(--hdr-border);
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-drawer__cat-item:last-child { border-bottom: none; }
  .hdr-drawer__cat-item:hover { background: var(--hdr-accent-light); color: var(--hdr-accent); }

  .hdr-drawer__post-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 13px;
    background: var(--hdr-accent);
    color: #fff;
    font-size: 14px;
    font-weight: 850;
    border-radius: var(--hdr-radius-full);
    text-decoration: none;
    transition: background var(--hdr-t), transform var(--hdr-t);
    box-shadow: 0 3px 14px rgba(212,87,26,0.3);
  }
  .hdr-drawer__post-btn:hover { background: var(--hdr-accent-hover); transform: translateY(-1px); }

  /* Drawer user */
  .hdr-drawer__user { display: flex; flex-direction: column; gap: 2px; }
  .hdr-drawer__user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: #faf9f7;
    border: 1px solid var(--hdr-border);
    border-radius: var(--hdr-radius);
    margin-bottom: 6px;
  }
  .hdr-drawer__user-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: var(--hdr-accent-light);
    border: 2px solid #fddcc8;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--hdr-accent);
    flex-shrink: 0;
  }
  .hdr-drawer__user-name { font-size: 14px; font-weight: 700; color: var(--hdr-text); margin-bottom: 2px; }
  .hdr-drawer__user-email { font-size: 11.5px; color: var(--hdr-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }

  .hdr-drawer__menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 9px;
    padding: 10px 14px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--hdr-text-2);
    text-decoration: none;
    border-radius: var(--hdr-radius);
    transition: background var(--hdr-t), color var(--hdr-t);
  }
  .hdr-drawer__menu-item:hover { background: var(--hdr-accent-light); color: var(--hdr-accent); }
  .hdr-drawer__menu-item--admin { color: #7c3aed; }
  .hdr-drawer__menu-item--admin:hover { background: #f5f3ff; color: #7c3aed; }
  .hdr-drawer__menu-item-left { display: flex; align-items: center; gap: 9px; }
  .hdr-drawer__notif-badge {
    background: #ef4444;
    color: #fff;
    font-size: 10.5px;
    font-weight: 700;
    border-radius: var(--hdr-radius-full);
    padding: 2px 7px;
  }
  .hdr-drawer__logout {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 10px 14px;
    font-size: 13.5px;
    color: #ef4444;
    background: transparent;
    border: none;
    border-radius: var(--hdr-radius);
    cursor: pointer;
    transition: background var(--hdr-t);
    text-align: left;
  }
  .hdr-drawer__logout:hover { background: #fff5f5; }

  .hdr-drawer__auth { display: flex; gap: 8px; }
  .hdr-drawer__auth-login {
    flex: 1;
    text-align: center;
    padding: 11px;
    font-size: 13.5px;
    font-weight: 700;
    color: var(--hdr-accent);
    border: 2px solid #fddcc8;
    border-radius: var(--hdr-radius);
    text-decoration: none;
    transition: background var(--hdr-t);
  }
  .hdr-drawer__auth-login:hover { background: var(--hdr-accent-light); }
  .hdr-drawer__auth-signup {
    flex: 1;
    text-align: center;
    padding: 11px;
    font-size: 13.5px;
    font-weight: 700;
    color: #fff;
    background: var(--hdr-accent);
    border-radius: var(--hdr-radius);
    text-decoration: none;
    transition: background var(--hdr-t);
  }
  .hdr-drawer__auth-signup:hover { background: var(--hdr-accent-hover); }
`;

export default Header;
