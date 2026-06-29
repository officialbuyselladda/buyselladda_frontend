import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Save, RefreshCw } from 'lucide-react';
import { appConfigApi } from '../services/api';

const readValue = (value, fallback) => {
  if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
  if (typeof fallback === 'boolean') return Boolean(value);
  if (typeof fallback === 'number') return Number.isFinite(Number(value)) ? Number(value) : fallback;
  return value ?? fallback ?? '';
};

const InputField = ({ field, value, onChange }) => {
  if (field.type === 'toggle') {
    return (
      <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 rounded" />
        <span>
          <span className="block font-bold text-gray-900">{field.label}</span>
          {field.help && <span className="mt-1 block text-sm text-gray-500">{field.help}</span>}
        </span>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</span>
        <textarea value={value || ''} onChange={(event) => onChange(event.target.value)} rows={field.rows || 4} className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50" />
      </label>
    );
  }

  if (field.type === 'tags') {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</span>
        <input
          value={Array.isArray(value) ? value.join(', ') : ''}
          onChange={(event) => onChange(event.target.value.split(',').map((item) => item.trim()).filter(Boolean))}
          placeholder="Comma separated values"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
        />
      </label>
    );
  }

  if (field.type === 'json') {
    return (
      <label className="block md:col-span-2">
        <span className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</span>
        <textarea
          value={JSON.stringify(value || [], null, 2)}
          onChange={(event) => {
            try {
              const parsed = JSON.parse(event.target.value || '[]');
              onChange(Array.isArray(parsed) ? parsed : []);
            } catch (_) {
              onChange(value);
            }
          }}
          rows={field.rows || 8}
          className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
        />
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</span>
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(event) => onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
      />
    </label>
  );
};

const AdminDynamicControlPage = ({ configKey, title, description, icon: Icon, fields, defaults, preview }) => {
  const queryClient = useQueryClient();
  const [fullConfig, setFullConfig] = useState(null);
  const [draft, setDraft] = useState(defaults);

  const { data, isLoading } = useQuery({
    queryKey: ['adminAppConfig'],
    queryFn: appConfigApi.getAdminConfig,
  });

  useEffect(() => {
    if (!data) return;
    setFullConfig(data);
    const section = data[configKey] || {};
    setDraft(Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, readValue(section[key], fallback)])));
  }, [configKey, data, defaults]);

  const saveMutation = useMutation({
    mutationFn: (payload) => appConfigApi.updateAdminConfig(payload),
    onSuccess: (saved) => {
      toast.success(`${title} saved`);
      queryClient.setQueryData(['adminAppConfig'], saved);
      setFullConfig(saved);
    },
    onError: (error) => toast.error(error.response?.data?.message || `Could not save ${title.toLowerCase()}`),
  });

  const chips = useMemo(() => fields.filter((field) => field.type === 'toggle').map((field) => ({ label: field.label, enabled: Boolean(draft[field.key]) })), [draft, fields]);

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const handleSave = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      ...(fullConfig || {}),
      [configKey]: draft,
    });
  };

  if (isLoading) {
    return <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading {title.toLowerCase()}...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Icon size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        <button type="submit" disabled={saveMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60">
          <Save size={18} />
          {saveMutation.isPending ? 'Saving...' : 'Save Controls'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <InputField key={field.key} field={field} value={draft[field.key]} onChange={(value) => updateDraft(field.key, value)} />
            ))}
          </div>
        </section>

        <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Live Control Summary</h2>
            <RefreshCw size={17} className="text-gray-400" />
          </div>
          {preview ? preview(draft) : (
            <div className="space-y-3">
              {chips.map((chip) => (
                <div key={chip.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                  <span className="font-semibold text-gray-700">{chip.label}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${chip.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                    {chip.enabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </form>
  );
};

export default AdminDynamicControlPage;
