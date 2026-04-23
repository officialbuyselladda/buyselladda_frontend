import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { Flag, User, Package, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const mockReports = [
  { id: '1', type: 'product', title: 'Fake iPhone listing', reporter: 'user1@gmail.com', status: 'pending', date: '2024-10-20', details: 'Suspicious seller with multiple reports' },
  { id: '2', type: 'user', title: 'Spam account', reporter: 'user2@gmail.com', status: 'investigating', date: '2024-10-19', details: 'Sending spam messages' },
  { id: '3', type: 'product', title: 'Duplicate listing', reporter: 'user3@gmail.com', status: 'resolved', date: '2024-10-18', details: 'Identical product posted twice' },
];

const AdminReports = () => {
  const [filters, setFilters] = useState({ status: 'all', search: '', page: 1 });
  const [selectedReports, setSelectedReports] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const columns = [
    { header: 'Report', render: (row) => (
      <div>
        <span className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-full text-xs font-semibold">
          <span className={row.type === 'product' ? 'text-orange-600' : 'text-blue-600'}>
            {row.type === 'product' ? <Package size={14} /> : <User size={14} />}
          </span>
          {row.title}
        </span>
      </div>
    )},
    { header: 'Reported By', key: 'reporter' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Date', key: 'date' },
    { header: 'Details', key: 'details', className: 'max-w-lg' },
    { header: 'Actions', render: (row) => (
      <div className="flex gap-2">
        <button className="p-2 text-accent-600 hover:bg-accent-50 rounded-xl">
          <CheckCircle size={18} />
        </button>
        <button className="p-2 text-red-600 hover:bg-red-50 rounded-xl">
          <Trash2 size={18} />
        </button>
      </div>
    )}
  ];

  const handleResolve = () => toast.success('Report resolved');
  const handleBulkResolve = () => toast.success(`${selectedReports.length} reports resolved`);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Flag size={40} className="text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
            Reports & Violations
          </h1>
          <p className="text-gray-600">Manage user reports and violations ({mockReports.length} active)</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mockReports}
        enableSelection
        selectedRows={selectedReports}
        onSelectionChange={setSelectedReports}
        filters={filters}
        onFilterChange={setFilters}
        actions={[
          {
            label: 'Resolve Selected',
            icon: <CheckCircle size={18} />,
            onClick: handleBulkResolve
          }
        ]}
        pagination={{ page: 1, pages: 1, total: mockReports.length }}
        emptyState="No reports found. Great job team!"
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleResolve}
        onClose={() => setShowDeleteModal(false)}
        title="Resolve Report"
        message="Marking this as resolved will close the case."
        danger={false}
      />
    </div>
  );
};

export default AdminReports;

