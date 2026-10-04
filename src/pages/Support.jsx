import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock, HelpCircle, LifeBuoy, MessageSquare, Send } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const categories = [
  { value: 'account', label: 'Account' },
  { value: 'ad', label: 'Ad / Listing' },
  { value: 'payment', label: 'Payment' },
  { value: 'chat', label: 'Chat' },
  { value: 'safety', label: 'Safety' },
  { value: 'technical', label: 'Technical' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusStyles = {
  open: 'bg-blue-50 text-blue-700 border-blue-100',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
  waiting_user: 'bg-purple-50 text-purple-700 border-purple-100',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  closed: 'bg-gray-100 text-gray-700 border-gray-200',
};

const labelize = (value) => String(value || '').replace(/_/g, ' ');
const getSupportSenderName = (message) => message?.senderRole === 'admin' ? 'BuySellAdda' : 'You';

const Support = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    relatedProduct: '',
    contactEmail: user?.email || '',
    message: '',
  });

  const { data = { tickets: [] }, isLoading } = useQuery({
    queryKey: ['mySupportTickets'],
    queryFn: () => api.get('/support/my?limit=20').then((res) => res.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/support', payload),
    onSuccess: (res) => {
      toast.success(`Ticket ${res.data.data.ticketNumber} created`);
      setForm({
        subject: '',
        category: 'technical',
        priority: 'medium',
        relatedProduct: '',
        contactEmail: user?.email || '',
        message: '',
      });
      queryClient.invalidateQueries({ queryKey: ['mySupportTickets'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create ticket'),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      relatedProduct: form.relatedProduct.trim() || null,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
              <LifeBuoy size={18} />
              Customer Support
            </div>
            <h1 className="text-3xl font-black text-gray-950 sm:text-4xl">Create a support ticket</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Share your issue with our team. You can track status and BuySellAdda replies from this page.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            Logged in as {user?.email}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-black text-gray-950">
              <MessageSquare size={22} className="text-orange-600" />
              Tell us what happened
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Subject</label>
                <input
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                  required
                  minLength={5}
                  maxLength={140}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Example: My ad image is not showing"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(event) => setForm({ ...form, priority: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Ad ID</label>
                  <input
                    value={form.relatedProduct}
                    onChange={(event) => setForm({ ...form, relatedProduct: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Reply email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => setForm({ ...form, contactEmail: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Issue details</label>
                <textarea
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  required
                  minLength={10}
                  rows={7}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none resize-vertical focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe the issue clearly. Add product link, error message, payment reference, or steps to reproduce if available."
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <Send size={18} />
                {createMutation.isPending ? 'Creating ticket...' : 'Create Ticket'}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black text-gray-950">
                <HelpCircle size={20} className="text-orange-600" />
                What happens next
              </h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <p className="flex gap-2"><CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" /> Your ticket goes to the BuySellAdda support queue.</p>
                <p className="flex gap-2"><Clock className="h-5 w-5 flex-shrink-0 text-amber-600" /> Team updates status as open, in progress, waiting, or resolved.</p>
                <p className="flex gap-2"><AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600" /> Keep your ticket number for follow-up.</p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="text-xl font-black text-gray-950">Your tickets</h2>
          </div>
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading tickets...</div>
          ) : data.tickets.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No support tickets yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.tickets.map((ticket) => (
                <article key={ticket._id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold text-orange-700">{ticket.ticketNumber}</p>
                      <h3 className="mt-1 font-bold text-gray-950">{ticket.subject}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {labelize(ticket.category)} | {labelize(ticket.priority)} priority | {new Date(ticket.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyles[ticket.status] || statusStyles.open}`}>
                      {labelize(ticket.status)}
                    </span>
                  </div>
                  {ticket.messages?.length > 0 && (
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      <span className="font-bold text-gray-800">
                        {getSupportSenderName(ticket.messages[ticket.messages.length - 1])}:
                      </span>{' '}
                      {ticket.messages[ticket.messages.length - 1].message}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Support;
