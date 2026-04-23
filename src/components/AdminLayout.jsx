import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const location = useLocation();

  // Only show for admin paths
  if (!location.pathname.startsWith('/admin')) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header for admin pages */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-4">
            <a href="/admin/dashboard" className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              DealKro Admin
            </a>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300 min-h-screen">
          <main className="p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

