import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gray-50">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Right Side */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header with Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main
          data-scroll-container="page"
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
