import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    pending: { color: 'yellow', bg: 'bg-yellow-100', text: 'bg-yellow-800', label: 'Pending' },
    approved: { color: 'green', bg: 'bg-emerald-100', text: 'bg-emerald-800', label: 'Approved' },
    rejected: { color: 'red', bg: 'bg-red-100', text: 'bg-red-800', label: 'Rejected' },
    active: { color: 'green', bg: 'bg-emerald-100', text: 'bg-emerald-800', label: 'Active' },
    banned: { color: 'red', bg: 'bg-red-100', text: 'bg-red-800', label: 'Banned' },
    reported: { color: 'orange', bg: 'bg-orange-100', text: 'bg-orange-800', label: 'Reported' },
  };

  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

