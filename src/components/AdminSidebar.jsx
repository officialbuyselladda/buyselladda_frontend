import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  LayoutDashboard, 
  Package, 
  Users, 
  MessagesSquare, 
  Flag, 
  BarChart3,
  Folder,
  Heart,
  Bell,
  ShieldAlert,
  LogOut, 
  ChevronLeft,
  ChevronRight,
  User,
  Settings 
} from 'lucide-react';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

const navItems = [
    { 
      path: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      path: '/admin/products', 
      label: 'Products (Ads)', 
      icon: Package 
    },
    { 
      path: '/admin/users', 
      label: 'Users', 
      icon: Users 
    },
    { 
      path: '/admin/chats', 
      label: 'Chats', 
      icon: MessagesSquare 
    },
    { 
      path: '/admin/reports', 
      label: 'Reports', 
      icon: Flag 
    },
    { 
      path: '/admin/analytics', 
      label: 'Analytics', 
      icon: BarChart3 
    },
    { 
      path: '/admin/categories', 
      label: 'Categories', 
      icon: Folder 
    },
    { 
      path: '/admin/favorites', 
      label: 'Favorites', 
      icon: Heart 
    },
    { 
      path: '/admin/notifications', 
      label: 'Notifications', 
      icon: Bell 
    },
    { 
      path: '/admin/moderation', 
      label: 'Moderation', 
      icon: ShieldAlert 
    },
    { 
      path: '/admin/settings', 
      label: 'Settings', 
      icon: Settings 
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white fixed h-screen z-40 transition-all duration-300 lg:translate-x-0 flex flex-col ${
      isCollapsed ? '-translate-x-full lg:w-20' : 'w-64 lg:w-64'
    }`}>

      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-emerald-400" />
          {!isCollapsed && (
            <>
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                DealKro
              </span>
              <span className="text-xl font-bold text-emerald-400">Admin</span>
            </>
          )}
        </div>
      </div>

      {/* Scrollable Nav Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900 mt-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all group hover:bg-emerald-600/20 hover:border-r-4 hover:border-emerald-500 ${
                isActive ? 'bg-emerald-600/30 border-r-4 border-emerald-500' : 'hover:backdrop-blur-sm'
              }`}
            >
              <item.icon size={22} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <span className={`font-semibold transition-all ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info - Sticky Bottom */}
      <div className="flex-shrink-0 px-4 pb-20">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700 border-opacity-50">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{user?.name || 'Admin'}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-600/30 transition-all group"
          >
            <LogOut size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            {!isCollapsed && <span className="font-medium text-slate-300 group-hover:text-white">Logout</span>}
          </button>
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 p-2 rounded-full hover:bg-emerald-600 transition-all lg:hidden"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  );
};

export default AdminSidebar;

