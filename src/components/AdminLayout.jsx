import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Right Side */}
      <div className="flex-1 flex flex-col">

        {/* Header with Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main
          data-scroll-container="page"
          className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 overflow-y-auto"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
