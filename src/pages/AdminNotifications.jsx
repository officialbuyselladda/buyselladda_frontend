import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Bell, Send, Edit, Trash2, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminNotifications = () => {
  const [filters, setFilters] = useState({ search: '', status: 'all', page: 1 });
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showSendModal, setShowSendModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: notificationsData = { notifications: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminNotifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/notification/admin/list?${params}`);
      return res.data.data;

    },
  });

  const notifications = notificationsData.notifications || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/notifications/${id}`),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries(['adminNotifications']);
    },
  });

  const sendMutation = useMutation({
    mutationFn: (formData) => {
      const data = Object.fromEntries(formData);
      return api.post('/notification/', { 
        user: data.userId, 
        title: data.title, 
        message: data.message, 
        type: 'system' 
      });
    },
    onSuccess: () => {
      toast.success('Notification sent successfully');
      setShowSendModal(false);
      queryClient.invalidateQueries(['adminNotifications']);
    },
  });


  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedNotifications.length} notifications?`)) {
      selectedNotifications.forEach(id => deleteMutation.mutate(id));
      setSelectedNotifications([]);
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      accessor: 'title',
      cell: (notif) => <div className="font-semibold line-clamp-1">{notif.title}</div>,
    },
    {
      key: 'message',
      header: 'Message',
      accessor: 'message',
      cell: (notif) => <p className="line-clamp-2 text-sm">{notif.message}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      cell: (notif) => <StatusBadge status={notif.status} />,
    },
    {
      key: 'recipients',
      header: 'Sent To',
      accessor: 'recipients',
      cell: (notif) => <span>{notif.recipientsCount || 0} users</span>,
    },
    {
      key: 'sentAt',
      header: 'Sent',
      accessor: 'sentAt',
      cell: (notif) => new Date(notif.sentAt).toLocaleString(),
    },
    {
      key: 'actions',
      header: '',
      cell: (notif) => (
        <div className="flex gap-1">
          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
            <Edit size={14} />
          </button>
          <ConfirmationModal title="Delete Notification" onConfirm={() => deleteMutation.mutate(notif._id)}>
            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded">
              <Trash2 size={14} />
            </button>
          </ConfirmationModal>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">{notifications.length} notifications</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBulkDelete} disabled={selectedNotifications.length === 0} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200">
            Delete Selected
          </button>
          <button onClick={() => setShowSendModal(true)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg flex items-center gap-2">
            <Send size={18} />
            Send New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border">
        <DataTable
          columns={columns}
          data={notifications}
          enableSelection
          selectedRows={selectedNotifications}
          onSelectionChange={setSelectedNotifications}
          pagination={{ page: filters.page, pages: notificationsData.pages, total: notificationsData.total }}
          onPageChange={(page) => setFilters(p => ({...p, page}))}
          loading={isLoading}
          emptyState="No notifications. Send your first notification!"
        />
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Send Notification</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                sendMutation.mutate(formData);
              }} className="space-y-4">
              <input name="userId" placeholder="User ID or Email (required)" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" required />
              <input name="title" placeholder="Title" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500" required />

              <textarea name="message" rows="5" placeholder="Message" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 resize-vertical" required />
              <div className="flex gap-3">

                <button type="button" className="flex-1 px-6 py-3 border rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminNotifications;

