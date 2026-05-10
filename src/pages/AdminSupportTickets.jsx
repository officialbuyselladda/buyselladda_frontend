import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Clock3, LifeBuoy, MessageSquare, Search, Send, UserRound } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_user', label: 'Waiting User' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const categories = ['all', 'account', 'ad', 'payment', 'chat', 'safety', 'technical', 'other'];

const statusStyles = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  waiting_user: 'bg-purple-50 text-purple-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-gray-100 text-gray-700',
};

const priorityStyles = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-red-50 text-red-700',
};

const labelize = (value) => String(value || '').replace(/_/g, ' ');

const AdminSupportTickets = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all', search: '', page: 1, limit: 10 });
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState({ status: 'in_progress', priority: 'medium', adminNote: '', reply: '' });

  const { data = { tickets: [], counts: {}, total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminSupportTickets', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/support/admin/tickets?${params}`);
      return res.data.data;
    },
  });

  const selectedTicket = useMemo(
    () => data.tickets.find((ticket) => ticket._id === selected) || null,
    [data.tickets, selected]
  );

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/support/admin/tickets/${id}`, payload),
    onSuccess: (res) => {
      toast.success('Ticket updated');
      queryClient.invalidateQueries({ queryKey: ['adminSupportTickets'] });
      setSelected(res.data.data._id);
      setEditor((prev) => ({ ...prev, reply: '' }));
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update ticket'),
  });

  const openTicket = (ticket) => {
    setSelected(ticket._id);
    setEditor({
      status: ticket.status,
      priority: ticket.priority,
      adminNote: ticket.adminNote || '',
      reply: '',
    });
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    if (!selectedTicket) return;
    updateMutation.mutate({
      id: selectedTicket._id,
      payload: editor,
    });
  };

  const statCards = [
    { label: 'Open', value: data.counts.open || 0, icon: AlertCircle, color: 'text-blue-600 bg-blue-50' },
    { label: 'In Progress', value: data.counts.in_progress || 0, icon: Clock3, color: 'text-amber-600 bg-amber-50' },
    { label: 'Waiting User', value: data.counts.waiting_user || 0, icon: MessageSquare, color: 'text-purple-600 bg-purple-50' },
    { label: 'Resolved', value: data.counts.resolved || 0, icon: LifeBuoy, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            <LifeBuoy size={18} />
            Support Desk
          </div>
          <h1 className="text-3xl font-black text-gray-950">Customer Complaints</h1>
          <p className="mt-1 text-gray-600">Review, reply, prioritize, and resolve user support tickets.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">
          {data.total} tickets in current view
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
              <Icon size={22} />
            </div>
            <p className="text-3xl font-black text-gray-950">{value}</p>
            <p className="text-sm font-semibold text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Search ticket number, subject, email, or message..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500">
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500">
            {priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className="rounded-xl border border-gray-200 px-4 py-3 capitalize outline-none focus:ring-2 focus:ring-emerald-500">
            {categories.map((category) => <option key={category} value={category}>{labelize(category)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading tickets...</div>
          ) : data.tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No support tickets found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.tickets.map((ticket) => (
                <button
                  key={ticket._id}
                  type="button"
                  onClick={() => openTicket(ticket)}
                  className={`block w-full p-5 text-left transition hover:bg-gray-50 ${selected === ticket._id ? 'bg-emerald-50/60' : ''}`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-emerald-700">{ticket.ticketNumber}</p>
                      <h3 className="mt-1 truncate font-bold text-gray-950">{ticket.subject}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {ticket.user?.name || 'User'} | {ticket.user?.email || ticket.contactEmail} | {new Date(ticket.updatedAt).toLocaleString()}
                      </p>
                      {ticket.messages?.length > 0 && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {ticket.messages[ticket.messages.length - 1].message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[ticket.status] || statusStyles.open}`}>{labelize(ticket.status)}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${priorityStyles[ticket.priority] || priorityStyles.medium}`}>{ticket.priority}</span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold capitalize text-gray-700">{labelize(ticket.category)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:sticky xl:top-5 xl:self-start">
          {!selectedTicket ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-gray-500">
              <LifeBuoy size={48} className="mb-4 text-gray-300" />
              <p className="font-semibold">Select a ticket to manage it</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <p className="font-mono text-xs font-bold text-emerald-700">{selectedTicket.ticketNumber}</p>
                <h2 className="mt-1 text-xl font-black text-gray-950">{selectedTicket.subject}</h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <UserRound size={16} />
                  {selectedTicket.user?.name || 'User'} | {selectedTicket.user?.email || selectedTicket.contactEmail}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Status</label>
                  <select value={editor.status} onChange={(event) => setEditor({ ...editor, status: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:ring-2 focus:ring-emerald-500">
                    {statusOptions.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Priority</label>
                  <select value={editor.priority} onChange={(event) => setEditor({ ...editor, priority: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:ring-2 focus:ring-emerald-500">
                    {priorityOptions.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Internal admin note</label>
                <textarea
                  value={editor.adminNote}
                  onChange={(event) => setEditor({ ...editor, adminNote: event.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 outline-none resize-vertical focus:ring-2 focus:ring-emerald-500"
                  placeholder="Visible only to admins"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Reply to user</label>
                <textarea
                  value={editor.reply}
                  onChange={(event) => setEditor({ ...editor, reply: event.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 outline-none resize-vertical focus:ring-2 focus:ring-emerald-500"
                  placeholder="Write an update or resolution message"
                />
              </div>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={18} />
                {updateMutation.isPending ? 'Updating...' : 'Update Ticket'}
              </button>

              <div className="max-h-[360px] space-y-3 overflow-y-auto border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-950">Conversation</h3>
                {selectedTicket.messages?.map((message) => (
                  <div key={message._id} className={`rounded-xl p-3 ${message.senderRole === 'admin' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold capitalize text-gray-600">{message.senderRole}</span>
                      <span className="text-[11px] text-gray-400">{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm text-gray-700">{message.message}</p>
                  </div>
                ))}
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminSupportTickets;
