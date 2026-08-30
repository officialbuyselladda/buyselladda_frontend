import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FileText, Layout, Save, Settings } from 'lucide-react';
import { contentApi } from '../services/api';

const pageLabels = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  help: 'Help',
  safety: 'Safety',
  support: 'Support',
};

const emptyContent = {
  footer: {
    brandName: 'BuySellAdda',
    logoUrl: '/logo-1.png',
    tagline: 'Har Deal, Ek Nayi Shuruaat',
    trustTitle: '',
    trustSubtitle: '',
    bannerButtonText: '',
    bannerButtonPath: '',
    copyrightText: '',
    columns: [],
    bottomLinks: [],
    popularCities: [],
    socialLinks: [],
    appButtons: [],
  },
  pages: {},
};

const formatJson = (value) => JSON.stringify(value || [], null, 2);

const parseJsonArray = (label, value) => {
  try {
    const parsed = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) throw new Error(`${label} must be an array`);
    return parsed;
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
};

const TextInput = ({ label, value, onChange, placeholder }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
    <input
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
    />
  </label>
);

const TextArea = ({ label, value, onChange, rows = 4, placeholder }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
    <textarea
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
    />
  </label>
);

const AdminSystemSettings = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('footer');
  const [content, setContent] = useState(emptyContent);
  const [jsonDrafts, setJsonDrafts] = useState({
    columns: '[]',
    bottomLinks: '[]',
    popularCities: '[]',
    socialLinks: '[]',
    appButtons: '[]',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['adminContent'],
    queryFn: contentApi.getAdminContent,
  });

  useEffect(() => {
    if (!data) return;
    setContent({
      footer: { ...emptyContent.footer, ...(data.footer || {}) },
      pages: data.pages || {},
    });
    setJsonDrafts({
      columns: formatJson(data.footer?.columns),
      bottomLinks: formatJson(data.footer?.bottomLinks),
      popularCities: formatJson(data.footer?.popularCities),
      socialLinks: formatJson(data.footer?.socialLinks),
      appButtons: formatJson(data.footer?.appButtons),
    });
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: contentApi.updateAdminContent,
    onSuccess: (saved) => {
      toast.success('Website content saved');
      queryClient.setQueryData(['adminContent'], saved);
      queryClient.invalidateQueries({ queryKey: ['siteContent'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to save content');
    },
  });

  const pageKeys = useMemo(() => Object.keys(pageLabels), []);

  const updateFooter = (key, value) => {
    setContent((current) => ({
      ...current,
      footer: {
        ...current.footer,
        [key]: value,
      },
    }));
  };

  const updatePage = (pageKey, key, value) => {
    setContent((current) => ({
      ...current,
      pages: {
        ...current.pages,
        [pageKey]: {
          ...(current.pages?.[pageKey] || {}),
          [key]: value,
        },
      },
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...content,
        footer: {
          ...content.footer,
          columns: parseJsonArray('Footer columns', jsonDrafts.columns),
          bottomLinks: parseJsonArray('Bottom links', jsonDrafts.bottomLinks),
          popularCities: parseJsonArray('Popular cities', jsonDrafts.popularCities),
          socialLinks: parseJsonArray('Social links', jsonDrafts.socialLinks),
          appButtons: parseJsonArray('App buttons', jsonDrafts.appButtons),
        },
      };
      saveMutation.mutate(payload);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading website content...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Settings size={40} className="text-emerald-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Website Content</h1>
            <p className="text-gray-600">Control footer and policy pages from admin panel</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          <Save size={18} />
          {saveMutation.isPending ? 'Saving...' : 'Save Content'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        <button type="button" onClick={() => setTab('footer')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tab === 'footer' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
          <Layout size={16} />
          Footer
        </button>
        {pageKeys.map((pageKey) => (
          <button key={pageKey} type="button" onClick={() => setTab(pageKey)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tab === pageKey ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FileText size={16} />
            {pageLabels[pageKey]}
          </button>
        ))}
      </div>

      {tab === 'footer' ? (
        <div className="grid grid-cols-1 gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl lg:grid-cols-2">
          <TextInput label="Brand name" value={content.footer.brandName} onChange={(value) => updateFooter('brandName', value)} />
          <TextInput label="Logo URL" value={content.footer.logoUrl} onChange={(value) => updateFooter('logoUrl', value)} />
          <TextArea label="Tagline" value={content.footer.tagline} onChange={(value) => updateFooter('tagline', value)} rows={3} />
          <TextInput label="Copyright text" value={content.footer.copyrightText} onChange={(value) => updateFooter('copyrightText', value)} />
          <TextInput label="Trust banner title" value={content.footer.trustTitle} onChange={(value) => updateFooter('trustTitle', value)} />
          <TextInput label="Trust banner subtitle" value={content.footer.trustSubtitle} onChange={(value) => updateFooter('trustSubtitle', value)} />
          <TextInput label="Banner button text" value={content.footer.bannerButtonText} onChange={(value) => updateFooter('bannerButtonText', value)} />
          <TextInput label="Banner button path" value={content.footer.bannerButtonPath} onChange={(value) => updateFooter('bannerButtonPath', value)} />
          <TextArea label="Footer columns JSON" value={jsonDrafts.columns} onChange={(value) => setJsonDrafts((current) => ({ ...current, columns: value }))} rows={12} />
          <TextArea label="Bottom links JSON" value={jsonDrafts.bottomLinks} onChange={(value) => setJsonDrafts((current) => ({ ...current, bottomLinks: value }))} rows={8} />
          <TextArea label="Popular cities JSON" value={jsonDrafts.popularCities} onChange={(value) => setJsonDrafts((current) => ({ ...current, popularCities: value }))} rows={8} />
          <TextArea label="Social links JSON" value={jsonDrafts.socialLinks} onChange={(value) => setJsonDrafts((current) => ({ ...current, socialLinks: value }))} rows={8} />
          <TextArea label="App buttons JSON" value={jsonDrafts.appButtons} onChange={(value) => setJsonDrafts((current) => ({ ...current, appButtons: value }))} rows={8} />
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-bold text-gray-800">JSON examples</p>
            <p className="mt-2">Links use: <code>{'{"label":"Privacy","path":"/privacy"}'}</code></p>
            <p>Social/app external links use: <code>{'{"label":"Instagram","url":"https://..." }'}</code></p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TextInput label="Page title" value={content.pages?.[tab]?.title} onChange={(value) => updatePage(tab, 'title', value)} />
            <TextInput label="Accent color" value={content.pages?.[tab]?.accent} onChange={(value) => updatePage(tab, 'accent', value)} placeholder="emerald, orange, blue, red" />
            <TextInput label="Last updated text" value={content.pages?.[tab]?.updatedText} onChange={(value) => updatePage(tab, 'updatedText', value)} />
            <TextArea label="Subtitle" value={content.pages?.[tab]?.subtitle} onChange={(value) => updatePage(tab, 'subtitle', value)} rows={3} />
          </div>
          <div className="mt-6 space-y-4">
            {(content.pages?.[tab]?.sections || []).map((section, index) => (
              <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-bold text-gray-800">Section {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => updatePage(tab, 'sections', content.pages[tab].sections.filter((_, sectionIndex) => sectionIndex !== index))}
                    className="rounded-lg px-3 py-1 text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
                <TextInput
                  label="Heading"
                  value={section.heading}
                  onChange={(value) => {
                    const sections = [...content.pages[tab].sections];
                    sections[index] = { ...sections[index], heading: value };
                    updatePage(tab, 'sections', sections);
                  }}
                />
                <div className="mt-3">
                  <TextArea
                    label="Body"
                    value={section.body}
                    rows={5}
                    onChange={(value) => {
                      const sections = [...content.pages[tab].sections];
                      sections[index] = { ...sections[index], body: value };
                      updatePage(tab, 'sections', sections);
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updatePage(tab, 'sections', [...(content.pages?.[tab]?.sections || []), { heading: 'New Section', body: 'Write content here.' }])}
              className="rounded-2xl border border-dashed border-emerald-300 px-5 py-3 font-bold text-emerald-700 hover:bg-emerald-50"
            >
              Add Section
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default AdminSystemSettings;
