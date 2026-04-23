import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import { MessageSquare, User, Clock, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const mockChats = [
  {
    id: '1',
    title: 'John Doe - Product Inquiry',
    participants: 'John Doe, You',
    lastMessage: 'Interested in your iPhone 14 Pro',
    lastUpdated: '2024-10-20 14:30',
    status: 'active',
    unread: 3,
    userId: 'user1'
  },
  {
    id: '2',
    title: 'Sarah Wilson - Price Negotiation',
    participants: 'Sarah Wilson, You',
    lastMessage: 'Can you lower the price to 25k?',
    lastUpdated: '2024-10-20 13:45',
    status: 'active',
    unread: 0,
    userId: 'user2'
  },
  {
    id: '3',
    title: 'Mike Johnson - Spam Report',
    participants: 'Mike Johnson, You',
    lastMessage: '[Reported as spam]',
    lastUpdated: '2024-10-20 12:15',
    status: 'reported',
    unread: 1,
    userId: 'user3'
  }
];

const AdminChats = () => {
  const [filters, setFilters] = useState({ status: 'all', search: '', page: 1 });
  const [selectedChats, setSelectedChats] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingChat, setDeletingChat] = useState(null);

  const { data: chatsData = { chats: mockChats, total: mockChats.length } } = useQuery({
    queryKey: ['adminChats', filters],
    queryFn: () => {
      // Real API: api.get('/admin/chats', { params: filters })
      return new Promise(resolve => setTimeout(() => resolve({ data: { data: chatsData } }), 500));
    },
    placeholderData: { chats: [], total: 0 }
  });

  const chats = chatsData.chats || [];

  const columns = [
    {
      header: 'Chat',
      key: 'title',
      render: (row) => (
        <div className="font-semibold text-gray-900 hover:text-primary-600">
          {row.title}
        </div>
      )
    },
    {
      header: 'Participants',
      render: (row) => (
        <span className="text-gray-700">{row.participants}</span>
      )
    },
    {
      header: 'Last Message',
      key: 'lastMessage',
      className: 'max-w-md'
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Last Updated',
      key: 'lastUpdated'
    },
    {
      header: 'Unread',
      render: (row) => row.unread > 0 ? (
        <span className="font-semibold text-primary-600">{row.unread}</span>
      ) : (
        <span className="text-gray-400">0</span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-xl">
            <Eye size={18} />
          </button>
          <button className="p-2 hover:bg-red-50 rounded-xl text-red-600">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const handleDelete = (chatId) => {
    setDeletingChat(chatId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    toast.success('Chat deleted');
    setShowDeleteModal(false);
    setDeletingChat(null);
    // Real delete: mutation
  };

  const bulkDelete = () => handleDelete();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MessageSquare size={40} className="text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Chats</h1>
          <p className="text-gray-600">{chats.length} conversations</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={chats}
        enableSelection
        selectedRows={selectedChats}
        onSelectionChange={setSelectedChats}
        filters={filters}
        onFilterChange={setFilters}
        actions={[
          {
            label: 'Delete Selected',
            icon: <Trash2 size={18} />,
            onClick: () => bulkDelete()
          }
        ]}
        pagination={{
          page: 1,
          pages: 1,
          total: chats.length
        }}
        onPageChange={() => {}}
        emptyState="No chats found"
        className="shadow-2xl"
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Chat?"
        message="This action cannot be undone. All messages will be permanently removed."
        confirmText="Delete Chat"
        danger
        loading={false}
      />
    </div>
  );
};

export default AdminChats;

