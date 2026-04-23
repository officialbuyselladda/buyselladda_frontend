import React from 'react';
import { X } from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?', 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  loading = false,
  danger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 font-semibold rounded-xl transition-all flex items-center gap-2 ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
            } disabled:opacity-50`}
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

