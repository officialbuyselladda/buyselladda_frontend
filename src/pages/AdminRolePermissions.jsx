import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  Edit3,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
  ADMIN_PERMISSION_BY_KEY,
  ADMIN_PERMISSION_SECTIONS,
  ADMIN_PERMISSIONS,
  getAdminPermissionLabel,
} from '../utils/adminPermissions';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  adminPermissions: [],
  isBlocked: false,
};

const PermissionCheckbox = ({ permission, checked, onChange }) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-1 h-4 w-4 rounded"
    />
    <span>
      <span className="block font-bold text-gray-900">{permission.label}</span>
      <span className="mt-1 block text-sm text-gray-500">{permission.description}</span>
    </span>
  </label>
);

const AdminRolePermissions = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: '', status: 'all', page: 1, limit: 10 });
  const [modalMode, setModalMode] = useState(null);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: roleData = { admins: [], total: 0, page: 1, pages: 1 }, isLoading } = useQuery({
    queryKey: ['adminRolePermissions', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: filters.status,
        page: String(filters.page),
        limit: String(filters.limit),
      });
      if (filters.search.trim()) params.set('search', filters.search.trim());
      const res = await api.get(`/admin/role-permissions?${params}`);
      return res.data.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        adminPermissions: form.adminPermissions,
        isBlocked: Boolean(form.isBlocked),
      };

      if (modalMode === 'add') {
        return api.post('/admin/role-permissions', { ...payload, password: form.password });
      }

      const updatePayload = { ...payload };
      if (form.password.trim()) updatePayload.password = form.password;
      return api.put(`/admin/role-permissions/${selectedAdminId}`, updatePayload);
    },
    onSuccess: () => {
      toast.success(modalMode === 'add' ? 'Admin account created' : 'Admin account updated');
      queryClient.invalidateQueries({ queryKey: ['adminRolePermissions'] });
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not save admin account'),
  });

  const deleteMutation = useMutation({
    mutationFn: (adminId) => api.delete(`/admin/role-permissions/${adminId}`),
    onSuccess: () => {
      toast.success('Admin account deleted');
      queryClient.invalidateQueries({ queryKey: ['adminRolePermissions'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const closeModal = () => {
    setModalMode(null);
    setSelectedAdminId(null);
    setForm(emptyForm);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setModalMode('add');
  };

  const openEdit = (adminUser) => {
    setSelectedAdminId(adminUser._id);
    setForm({
      name: adminUser.name || '',
      email: adminUser.email || '',
      password: '',
      phone: adminUser.phone || '',
      adminPermissions: adminUser.adminPermissions?.length ? adminUser.adminPermissions : ['all'],
      isBlocked: Boolean(adminUser.isBlocked),
    });
    setModalMode('edit');
  };

  const togglePermission = (permissionKey, checked) => {
    if (permissionKey === 'all') {
      setForm((prev) => ({ ...prev, adminPermissions: checked ? ['all'] : [] }));
      return;
    }

    setForm((prev) => {
      const current = prev.adminPermissions.filter((item) => item !== 'all');
      return {
        ...prev,
        adminPermissions: checked
          ? [...new Set([...current, permissionKey])]
          : current.filter((item) => item !== permissionKey),
      };
    });
  };

  const submitForm = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    if (modalMode === 'add' && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password && form.password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (!form.adminPermissions.length) {
      toast.error('Select at least one permission');
      return;
    }
    saveMutation.mutate();
  };

  const admins = roleData.admins || [];
  const fullAccess = form.adminPermissions.includes('all');
  const selectedPermissionCount = form.adminPermissions.filter((permission) => permission !== 'all').length;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Role Permissions</h1>
            <p className="text-gray-600">Create admin login accounts and control exactly which admin sections they can manage.</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <Plus size={18} />
          Add Admin
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Search by admin name or email..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading admin accounts...</div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <p className="font-semibold text-gray-900">No admin accounts found</p>
            <p className="text-sm text-gray-500">Create an admin account and assign permissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="p-5">Admin</th>
                  <th className="p-5">Access</th>
                  <th className="p-5">Permissions</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Created</th>
                  <th className="p-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((adminUser) => {
                  const permissions = adminUser.adminPermissions?.length ? adminUser.adminPermissions : ['all'];
                  const isFullAccess = permissions.includes('all');
                  return (
                    <tr key={adminUser._id} className="hover:bg-gray-50">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <UserCog size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{adminUser.name}</p>
                            <p className="text-sm text-gray-500">{adminUser.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isFullAccess ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isFullAccess ? 'Full Access' : 'Limited Access'}
                        </span>
                      </td>
                      <td className="max-w-md p-5">
                        <div className="flex flex-wrap gap-2">
                          {isFullAccess ? (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">All modules</span>
                          ) : permissions.slice(0, 5).map((permission) => (
                            <span key={permission} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                              {getAdminPermissionLabel(permission)}
                            </span>
                          ))}
                          {!isFullAccess && permissions.length > 5 && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">+{permissions.length - 5}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${adminUser.isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {adminUser.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-5 text-sm text-gray-500">{new Date(adminUser.createdAt).toLocaleDateString()}</td>
                      <td className="p-5">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(adminUser)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Edit permissions">
                            <Edit3 size={17} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this admin account?')) deleteMutation.mutate(adminUser._id);
                            }}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            title="Delete admin"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {roleData.pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={filters.page <= 1}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {filters.page} of {roleData.pages}</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page >= roleData.pages}
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
          >
            Next
          </button>
          <span className="text-gray-500">({roleData.total} total)</span>
        </div>
      )}

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={submitForm} className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{modalMode === 'add' ? 'Add Admin Account' : 'Edit Admin Permissions'}</h2>
                <p className="text-sm text-gray-500">Set login details and choose the modules this admin can control.</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Name</span>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Email ID</span>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <KeyRound size={15} />
                  {modalMode === 'add' ? 'Password' : 'New Password'}
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder={modalMode === 'edit' ? 'Leave blank to keep current password' : ''}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-700">Phone</span>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 md:col-span-2">
                <input type="checkbox" checked={form.isBlocked} onChange={(event) => setForm({ ...form, isBlocked: event.target.checked })} className="h-4 w-4 rounded" />
                <span className="font-semibold text-gray-700">Block this admin login</span>
              </label>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-bold text-gray-900">Module Permissions</h3>
                <span className="text-sm font-semibold text-gray-500">{fullAccess ? 'Full platform control' : `${selectedPermissionCount} selected`}</span>
              </div>

              <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <PermissionCheckbox
                  permission={{ key: 'all', label: 'Full Access', description: 'Allow this admin to control every admin panel module' }}
                  checked={fullAccess}
                  onChange={(checked) => togglePermission('all', checked)}
                />
              </div>

              <div className={`space-y-4 ${fullAccess ? 'opacity-50' : ''}`}>
                {ADMIN_PERMISSION_SECTIONS.map((section) => {
                  const sectionPermissions = ADMIN_PERMISSIONS.filter((permission) => permission.section === section);
                  const sectionSelected = sectionPermissions.filter((permission) => form.adminPermissions.includes(permission.key)).length;

                  return (
                    <section key={section} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{section}</h4>
                          <p className="text-sm text-gray-500">Controls linked admin pages and their API access.</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                          {fullAccess ? sectionPermissions.length : sectionSelected}/{sectionPermissions.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {sectionPermissions.map((permission) => (
                          <PermissionCheckbox
                            key={permission.key}
                            permission={ADMIN_PERMISSION_BY_KEY[permission.key] || permission}
                            checked={fullAccess || form.adminPermissions.includes(permission.key)}
                            onChange={(checked) => togglePermission(permission.key, checked)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="rounded-xl border px-5 py-2 font-semibold">Cancel</button>
              <button type="submit" disabled={saveMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white disabled:opacity-60">
                <CheckCircle2 size={17} />
                {saveMutation.isPending ? 'Saving...' : 'Save Admin'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminRolePermissions;
