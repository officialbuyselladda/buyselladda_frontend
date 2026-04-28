import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import { cn, CATEGORIES } from '../utils';
import {
  Search, Menu, ChevronDown, MapPin, LogOut, Shield,
  MessageCircle, Plus, X, User, Bell, ChevronRight, Home
} from 'lucide-react';

/* ── Utility: close on outside click ── */
const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
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

  const userMenuRef = useRef(null);
  useOutsideClick(userMenuRef, () => setUserMenuOpen(false));

  const isAdminPath = location.pathname.startsWith('/admin') && !location.pathname.endsWith('/admin/login');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/?${params.toString()}`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  /* ── Admin Header ── */
  if (isAdminPath) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link to="/admin/dashboard">
            <img src="https://i.ibb.co/d4v1q3jZ/logo.jpg" alt="DealKro" className="h-14 w-auto object-contain" />
          </Link>
          <span className="ml-3 text-xs font-bold text-gray-400 tracking-widest uppercase">Admin</span>
        </div>
      </header>
    );
  }

  /* ── Public Header ── */
  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">

        {/* ══ TOP BAR ══ */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center h-14 sm:h-16 gap-2 sm:gap-3">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="https://i.ibb.co/d4v1q3jZ/logo.jpg"
                alt="DealKro"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>

            {/* ── Search Bar (hidden on xs, shown md+) ── */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 items-stretch rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-orange-400 transition-colors bg-white shadow-sm"
            >
              <div className="hidden md:flex items-center border-r border-gray-200 bg-gray-50">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs sm:text-sm text-gray-700 bg-transparent pl-3 pr-8 py-2.5 outline-none appearance-none cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat._id || cat} value={cat.slug || cat}>
                      {cat.name || cat}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cars, mobiles, furniture..."
                className="flex-1 px-3 sm:px-4 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400 bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 sm:px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center gap-1.5 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>

            {/* ── Right Actions ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0 flex-shrink-0">

              {/* Location (md+) */}
              {locationCtx?.userLocation && (
                <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg max-w-[110px] xl:max-w-[140px]">
                  <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  <span className="truncate">{locationCtx.userAddress || 'Your location'}</span>
                </div>
              )}

              {/* Post Ad Button */}
              {user?.role === 'user' && (
                <Link
                  to="/create-product"
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-orange-200 hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline whitespace-nowrap">Post Free Ad</span>
                </Link>
              )}

              {/* Chat */}
              {user?.role === 'user' && (
                <Link
                  to="/chats"
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-orange-500 transition-colors relative"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
              )}

              {/* Admin Panel */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition shadow-md"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* User Menu / Auth */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="hidden md:inline text-xs font-semibold text-gray-700 max-w-[80px] truncate">{user.name}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform hidden md:block", userMenuOpen && "rotate-180")} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/my-ads"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <Home className="w-4 h-4" /> My Ads
                      </Link>
                      <Link
                        to="/chats"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" /> Messages
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-500 px-2.5 sm:px-3 py-1.5 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs sm:text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM NAV (Desktop) ══ */}
        <div className="hidden sm:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="h-10 flex items-center gap-1">

              {/* Quick Links */}
              {[
                { label: 'All Ads', to: '/' },
                { label: 'Mobiles', to: '/?category=mobiles' },
                { label: 'Cars', to: '/?category=cars' },
                { label: 'Bikes', to: '/?category=bikes' },
                { label: 'Electronics', to: '/?category=electronics' },
                { label: 'Furniture', to: '/?category=furniture' },
                { label: 'Books', to: '/?category=books' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors',
                    location.search.includes(item.to.split('?')[1] || '__none__') || (item.to === '/' && !location.search)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  )}
                >
                  {item.label}
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative group ml-1">
                <button className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  More <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-xl border border-gray-100 rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  {CATEGORIES.slice(3).map(cat => (
                    <Link
                      key={cat._id || cat}
                      to={`/?category=${cat.slug || cat}`}
                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                    >
                      {cat.name || cat}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Logout shortcut for admin */}
              {user?.role === 'admin' && (
                <button
                  onClick={handleLogout}
                  className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* ══ MOBILE MENU DRAWER ══ */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex flex-col">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />

          {/* Drawer */}
          <div className="relative bg-white w-full mt-14 rounded-b-3xl shadow-2xl pb-6 z-10 max-h-[85vh] overflow-y-auto">

            {/* Mobile Search */}
            <div className="p-3 border-b border-gray-100">
              <form onSubmit={handleSearch} className="flex items-stretch rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-orange-400 transition-colors">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anything..."
                  className="flex-1 px-3 py-2.5 text-sm text-gray-900 outline-none bg-white"
                  autoFocus
                />
                <button type="submit" className="px-4 bg-orange-500 text-white">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Location */}
            {locationCtx?.userLocation && (
              <div className="mx-3 mt-3 flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-2.5 rounded-xl">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-700 truncate">{locationCtx.userAddress || 'Your location'}</span>
              </div>
            )}

            {/* Quick Links */}
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Browse</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'All Ads', to: '/' },
                  { label: 'Mobiles', to: '/?category=mobiles' },
                  { label: 'Cars', to: '/?category=cars' },
                  { label: 'Electronics', to: '/?category=electronics' },
                  { label: 'Furniture', to: '/?category=furniture' },
                  { label: 'Books', to: '/?category=books' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-orange-50 rounded-xl text-sm text-gray-700 hover:text-orange-600 font-medium transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* All Categories Toggle */}
            <div className="px-3 pt-2">
              <button
                onClick={() => setMobileCatOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700"
              >
                All Categories
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", mobileCatOpen && "rotate-180")} />
              </button>
              {mobileCatOpen && (
                <div className="mt-1 rounded-xl border border-gray-100 overflow-hidden">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat._id || cat}
                      to={`/?category=${cat.slug || cat}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-b border-gray-50 last:border-0 transition-colors"
                    >
                      {cat.name || cat}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Post Ad */}
            {user?.role === 'user' && (
              <div className="px-3 pt-4">
                <Link
                  to="/create-product"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-orange-100"
                >
                  <Plus className="w-4 h-4" />
                  Post Free Ad
                </Link>
              </div>
            )}

            {/* User / Auth */}
            <div className="px-3 pt-3 border-t border-gray-100 mt-3">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl mb-2">
                    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-purple-600 font-semibold hover:bg-purple-50 rounded-xl">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-bold text-orange-600 border-2 border-orange-300 rounded-xl hover:bg-orange-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;