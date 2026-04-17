import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Search, Filter, Users, User, Shield, Mail, Phone, Trash2, Edit3, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ role: 'all', search: '' });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers', filters],
    queryFn: () => {
      const params = new URLSearchParams(filters);
      return api.get(`/admin/users?${params}`).then(res => res.data.data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const handleDelete = (userId) => {
    if (confirm('Delete this user and all their data?')) {
      deleteMutation.mutate(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Users size={36} className="text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-600">{users.length} users • {filters.role} filter</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent md:w-auto"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-6 text-left font-semibold text-gray-900">User</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Email</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Role</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Phone</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Products</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Joined</th>
                    <th className="p-6 text-left font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{u.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-full">{u.email}</div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6">
                        {u.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No phone</span>
                        )}
                      </td>
                      <td className="p-6">
                        <span className="font-semibold">{u.productCount || 0}</span>
                      </td>
                      <td className="p-6 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDelete(u._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors" title="Edit">
                            <Edit3 size={18} />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="View Profile">
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          Showing users with {filters.role} filter
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

