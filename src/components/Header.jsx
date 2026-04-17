import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { LocationContext } from '../context/LocationContext';
import { cn, CATEGORIES } from '../utils';
import { Search, Menu, ChevronDown, MapPin, LogOut, Shield, MessageCircle } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationCtx = useContext(LocationContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar - Logo Search Categories Location */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 lg:h-16">
            <Link to="/" className="text-2xl lg:text-3xl font-black">
              DealKro
            </Link>

            {/* Search Bar */}
            <div className="flex-1 mx-6 lg:mx-12">
              <form onSubmit={handleSearch} className="flex bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
                <button className="p-3">
                  <Search size={20} />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cars, mobiles, clothes, furniture and more..."
                  className="flex-1 px-4 py-3 text-gray-900 outline-none bg-transparent placeholder-gray-400 text-sm lg:text-base"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 text-gray-900 bg-transparent outline-none border-l border-white/20"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button type="submit" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold">
                  Find
                </button>
              </form>
            </div>

            {/* Location & Post */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {locationCtx?.userLocation && (
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
                  <MapPin size={14} />
                  <span>{locationCtx.userAddress || 'Your location'}</span>
                </div>
              )}
{user?.role === 'user' && (
              <Link
                to="/create-product"
                className="px-4 lg:px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                <span className="hidden lg:inline">Post Free Ad</span>
              </Link>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="h-12 flex items-center">
            {/* Desktop Nav */}
            <div className="hidden lg:flex space-x-1">
              <Link to="/" className="px-3 py-2 text-xs font-semibold rounded hover:bg-orange-50">BUY</Link>
              <div className="relative group">
                <button className="px-3 py-2 text-xs font-semibold rounded flex items-center gap-1 hover:bg-orange-50">
                  MOBILES
                  <ChevronDown size={14} />
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white shadow-2xl border rounded-xl p-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">iPhone</Link>
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">Samsung</Link>
                  <Link to="/" className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-lg">OnePlus</Link>
                </div>
              </div>
              <Link to="/" className="px-3 py-2 text-xs font-semibold rounded hover:bg-orange-50">BICYCLES</Link>
              <Link to="/" className="px-3 py-2 text-xs font-semibold rounded hover:bg-orange-50">BOOKS</Link>
              <Link to="/" className="px-3 py-2 text-xs font-semibold rounded hover:bg-orange-50">CLOTHES</Link>
              {CATEGORIES.slice(0,5).map(cat => (
                <Link key={cat} to="/" className="px-3 py-2 text-xs font-semibold rounded hover:bg-orange-50 whitespace-nowrap">{cat}</Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="ml-auto flex items-center space-x-2">
{user ? (
                user.role === 'admin' ? (
                  <>
                    <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
                      <Shield size={16} />
                      <span>Admin Panel</span>
                    </Link>
                    <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg" title="Logout">
                      <LogOut size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/chats" className="p-2 hover:bg-gray-100 rounded-lg">
                      <MessageCircle size={18} />
                    </Link>
                    <span className="text-xs font-semibold hidden md:inline">{user.name}</span>
                    <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
                      <LogOut size={18} />
                    </button>
                  </>
                )
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold text-orange-600 hover:text-orange-500 px-3 py-1 border border-orange-600 rounded hover:bg-orange-50">
                    Login
                  </Link>
                  <Link to="/register" className="text-sm font-semibold bg-orange-600 text-white px-4 py-1 rounded hover:bg-orange-700">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden p-4 border-t bg-white">
        <button className="ml-auto flex items-center gap-2 text-orange-600 font-semibold">
          <Menu size={20} />
          Browse Categories
        </button>
      </div>
    </header>
  );
};

export default Header;