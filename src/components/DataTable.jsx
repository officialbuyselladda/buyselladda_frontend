import React from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const DataTable = ({
  columns,
  data,
  loading = false,
  onRowClick,
  enableSelection = false,
  selectedRows = [],
  onSelectionChange,
  actions,
  filters = {},
  onFilterChange,
  pagination,
  onPageChange,
  emptyState = 'No data found',
  className = ''
}) => {
  const hasPagination = pagination && pagination.total > 0;

  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 ${className}`}>
      {/* Header with bulk actions */}
      {enableSelection && selectedRows.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="font-semibold text-gray-900">
              {selectedRows.length} selected
            </span>
            {actions && actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center gap-2 text-sm"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters/Search */}
      {(filters || actions) && (
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search */}
            {filters.search !== false && (
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search || ''}
                  onChange={(e) => onFilterChange?.({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
            {/* Filters */}
            {filters.select && (
              <select
                value={filters.select || ''}
                onChange={(e) => onFilterChange?.({ ...filters, select: e.target.value })}
                className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {filters.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {/* Custom actions */}
            <div className="flex gap-2 ml-auto">
              {actions}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-500 font-medium">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-gray-200 rounded-b-3xl">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              {columns[0]?.icon || <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{emptyState}</h3>
            <p className="text-gray-500">Try adjusting filters or search</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {enableSelection && <th className="p-6 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>}
                {columns.map((col, idx) => (
                  <th key={idx} className="p-6 text-left font-semibold text-gray-900">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {enableSelection && (
                    <td className="p-6">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onSelectionChange([...selectedRows, row.id]);
                          } else {
                            onSelectionChange(selectedRows.filter(id => id !== row.id));
                          }
                        }}
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`p-6 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {hasPagination && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-3 py-2 text-sm font-medium">Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

