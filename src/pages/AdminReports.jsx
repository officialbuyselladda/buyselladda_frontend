import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { CheckCircle, Download, Flag, Package, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'all', search: '', page: 1, limit: 10 });

  const { data = { reports: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminReports', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/admin/reports?${params}`);
      return res.data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/products/${id}/approve`),
    onSuccess: () => {
      toast.success('Product approved');
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/products/${id}/reject`),
    onSuccess: () => {
      toast.success('Product rejected');
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    },
  });

  const exportReports = (format) => {
    const params = new URLSearchParams(filters);
    window.open(`/api/admin/reports/export/${format}?${params.toString()}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Flag size={40} className="text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Review Queue</h1>
          <p className="text-gray-600">{data.total} listings needing admin attention</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => exportReports('csv')} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            CSV
          </button>
          <button onClick={() => exportReports('pdf')} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Search reported products..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Review Items</option>
            <option value="pending">Pending</option>
            <option value="suspicious">Suspicious</option>
            <option value="rejected">Declined</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading reports...</div>
        ) : data.reports.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No reports found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-5">Report</th>
                  <th className="p-5">Seller</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="p-5">
                      <div className="flex items-start gap-3">
                        <Package className="mt-0.5 h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-900">{report.title}</p>
                          <p className="text-sm text-gray-500">{report.details}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-700">{report.user?.email || 'Unknown'}</td>
                    <td className="p-5">
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">{report.status}</span>
                    </td>
                    <td className="p-5 text-sm text-gray-500">{new Date(report.date).toLocaleDateString()}</td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        {report.status !== 'approved' && (
                          <button onClick={() => approveMutation.mutate(report.productId)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {report.status !== 'rejected' && (
                          <button onClick={() => rejectMutation.mutate(report.productId)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
