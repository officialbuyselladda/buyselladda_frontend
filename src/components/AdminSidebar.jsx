import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasAdminPermission } from '../utils/adminPermissions';
import {
  Shield, LayoutDashboard, Package, Users, MessagesSquare,
  Flag, BarChart3, Folder, Heart, Bell, ShieldAlert,
  LogOut, ChevronLeft, ChevronRight, User, Settings, FileText, LifeBuoy, Gauge, Smartphone
} from 'lucide-react';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      label: 'Overview',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics' },
      ],
    },
    {
      label: 'Management',
      items: [
        { path: '/admin/products', label: 'Products (Ads)', icon: Package, badge: '12', badgeColor: 'green', permission: 'products' },
        { path: '/admin/users', label: 'Users', icon: Users, permission: 'users' },
        { path: '/admin/user-limits', label: 'Ad Limits', icon: Gauge, permission: 'userLimits' },
        { path: '/admin/chats', label: 'Chats', icon: MessagesSquare, permission: 'chats' },
        { path: '/admin/reports', label: 'Reports', icon: Flag, badge: '3', badgeColor: 'red', permission: 'reports' },
        { path: '/admin/support-tickets', label: 'Support Tickets', icon: LifeBuoy, permission: 'supportTickets' },
        { path: '/admin/categories', label: 'Categories', icon: Folder, permission: 'categories' },
      ],
    },
    {
      label: 'Engage',
      items: [
        { path: '/admin/favorites', label: 'Favorites', icon: Heart, permission: 'favorites' },
        { path: '/admin/notifications', label: 'Notifications', icon: Bell, permission: 'notifications' },
        { path: '/admin/moderation', label: 'Moderation', icon: ShieldAlert, permission: 'moderation' },
      ],
    },
    {
      label: 'System',
      items: [
        { path: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings' },
        { path: '/admin/system-settings', label: 'Website Content', icon: FileText, permission: 'systemSettings' },
        { path: '/admin/app-control', label: 'Deal App Control', icon: Smartphone, permission: 'appControl' },
        { path: '/admin/role-permissions', label: 'Role Permissions', icon: ShieldAlert, permission: 'adminRoles' },
      ],
    },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/logo-1.png" alt="BuySellAdda" className="h-full w-full object-contain" />
        </div>
        {!isCollapsed && (
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">BuySellAdda</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Har Deal, Ek Nayi Shuruaat</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200">
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter((item) => hasAdminPermission(user, item.permission));
          if (!visibleItems.length) return null;

          return (
          <div key={si} className={si > 0 ? 'mt-2' : ''}>
            {!isCollapsed && (
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 pt-3 pb-1">
                {section.label}
              </p>
            )}
            {si > 0 && isCollapsed && <div className="h-px bg-gray-100 mx-2 my-2" />}
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : ''}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all ${
                    isActive ? 'bg-emerald-100' : 'group-hover:bg-gray-100'
                  }`}>
                    <item.icon size={16} />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className={`text-[13.5px] font-medium flex-1 ${isActive ? 'font-semibold' : ''}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.badgeColor === 'red'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {/* Tooltip when collapsed */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
        })}
      </nav>

      {/* User Info */}
      <div className="flex-shrink-0 px-2.5 py-3 border-t border-gray-100">
        <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
          {!isCollapsed && <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
        </div>

        <button
          onClick={handleLogout}
          className={`mt-1 w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="text-[13px] font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle - Desktop */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex items-center justify-center w-full py-2 border-t border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm"
      >
        <Shield size={18} className="text-emerald-600" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — Desktop fixed, Mobile slide-in */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 shadow-sm transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:flex`}
      >
        {sidebarContent}
      </aside>

      {/* Spacer for desktop layout */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-64'}`} />
    </>
  );
};

export default AdminSidebar;
