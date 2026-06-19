import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Bell,
  Image,
  Palette,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldAlert,
  Smartphone,
  Upload,
} from 'lucide-react';
import { appConfigApi } from '../services/api';

const defaultConfig = {
  identity: {
    appName: 'BuySellAdda',
    tagline: 'Har Deal, Ek Nayi Shuruaat',
    versionName: '1.0.0',
    versionCode: '1',
    packageName: 'com.dealkro.app',
    buildNumber: '1',
  },
  branding: {
    logoUrl: '',
    appIconUrl: '',
    primaryColor: '#10B981',
    secondaryColor: '#3B82F6',
    accentColor: '#F97316',
    backgroundColor: '#FFFFFF',
  },
  splash: {
    enabled: true,
    title: 'BuySellAdda',
    subtitle: 'Har Deal, Ek Nayi Shuruaat',
    loadingText: 'Loading fresh deals near you',
    backgroundColor: '#FFFFFF',
    logoUrl: '',
    chips: ['Nearby', 'Verified', 'Chat'],
  },
  preview: {
    locationText: 'India',
    searchPlaceholder: 'Search cars, phones, furniture...',
    featuredCategories: ['Electronics', 'Vehicles', 'Property', 'Services'],
  },
  controls: {
    maintenanceMode: false,
    maintenanceMessage: 'App maintenance is in progress. Please try again later.',
    forceUpdate: false,
    minimumVersion: '1.0.0',
    updateMessage: 'Please update the app to continue.',
    playStoreUrl: '',
    appStoreUrl: '',
    autoApproveAds: true,
    autoApproveAfterMinutes: 10,
    freeMonthlyPostLimit: 3,
    dealerMonthlyPostLimit: 30,
    boostedSearchEnabled: true,
  },
  contact: {
    supportEmail: 'support@buyselladda.com',
    supportPhone: '',
    privacyUrl: '/privacy',
    termsUrl: '/terms',
  },
};

const tabs = [
  { key: 'identity', label: 'Identity', icon: Smartphone },
  { key: 'branding', label: 'Branding', icon: Palette },
  { key: 'splash', label: 'Splash', icon: Image },
  { key: 'controls', label: 'Controls', icon: ShieldAlert },
  { key: 'contact', label: 'Contact', icon: Settings2 },
];

const mergeConfig = (config = {}) => ({
  identity: { ...defaultConfig.identity, ...(config.identity || {}) },
  branding: { ...defaultConfig.branding, ...(config.branding || {}) },
  splash: { ...defaultConfig.splash, ...(config.splash || {}) },
  preview: { ...defaultConfig.preview, ...(config.preview || {}) },
  controls: { ...defaultConfig.controls, ...(config.controls || {}) },
  contact: { ...defaultConfig.contact, ...(config.contact || {}) },
});

const TextInput = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
    <input
      type={type}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
    />
  </label>
);

const TextArea = ({ label, value, onChange, rows = 3 }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
    <textarea
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
    />
  </label>
);

const Toggle = ({ label, checked, onChange, helper }) => (
  <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 rounded" />
    <span>
      <span className="block font-bold text-gray-900">{label}</span>
      {helper && <span className="mt-1 block text-sm text-gray-500">{helper}</span>}
    </span>
  </label>
);

const ImagePreview = ({ label, url, fallback = '/logo-1.png' }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <p className="mb-3 text-sm font-bold text-gray-700">{label}</p>
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <img src={url || fallback} alt={label} className="h-full w-full object-contain" />
    </div>
  </div>
);

const toArrayText = (value) => Array.isArray(value) ? value.join(', ') : '';
const fromArrayText = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

const AdminAppControl = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('identity');
  const [config, setConfig] = useState(defaultConfig);

  const { data, isLoading } = useQuery({
    queryKey: ['adminAppConfig'],
    queryFn: appConfigApi.getAdminConfig,
  });

  useEffect(() => {
    if (data) setConfig(mergeConfig(data));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: appConfigApi.updateAdminConfig,
    onSuccess: (saved) => {
      toast.success('Deal app settings saved');
      queryClient.setQueryData(['adminAppConfig'], saved);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save app settings'),
  });

  const updateSection = (section, key, value) => {
    setConfig((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    saveMutation.mutate(config);
  };

  if (isLoading) {
    return <div className="rounded-3xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading Deal app controls...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Smartphone size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deal App Control</h1>
            <p className="text-gray-600">Manage mobile app branding, splash, version metadata, preview content, and runtime controls.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          <Save size={18} />
          {saveMutation.isPending ? 'Saving...' : 'Save App Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tab === item.key ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            {tab === 'identity' && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextInput label="App Name" value={config.identity.appName} onChange={(value) => updateSection('identity', 'appName', value)} />
                <TextInput label="Tagline" value={config.identity.tagline} onChange={(value) => updateSection('identity', 'tagline', value)} />
                <TextInput label="Version Name" value={config.identity.versionName} onChange={(value) => updateSection('identity', 'versionName', value)} />
                <TextInput label="Version Code" value={config.identity.versionCode} onChange={(value) => updateSection('identity', 'versionCode', value)} />
                <TextInput label="Package Name" value={config.identity.packageName} onChange={(value) => updateSection('identity', 'packageName', value)} />
                <TextInput label="Build Number" value={config.identity.buildNumber} onChange={(value) => updateSection('identity', 'buildNumber', value)} />
              </div>
            )}

            {tab === 'branding' && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextInput label="Logo URL" value={config.branding.logoUrl} onChange={(value) => updateSection('branding', 'logoUrl', value)} />
                <TextInput label="App Icon URL" value={config.branding.appIconUrl} onChange={(value) => updateSection('branding', 'appIconUrl', value)} />
                <TextInput label="Primary Color" type="color" value={config.branding.primaryColor} onChange={(value) => updateSection('branding', 'primaryColor', value)} />
                <TextInput label="Secondary Color" type="color" value={config.branding.secondaryColor} onChange={(value) => updateSection('branding', 'secondaryColor', value)} />
                <TextInput label="Accent Color" type="color" value={config.branding.accentColor} onChange={(value) => updateSection('branding', 'accentColor', value)} />
                <TextInput label="Background Color" type="color" value={config.branding.backgroundColor} onChange={(value) => updateSection('branding', 'backgroundColor', value)} />
                <ImagePreview label="Logo Preview" url={config.branding.logoUrl} />
                <ImagePreview label="Icon Preview" url={config.branding.appIconUrl} />
              </div>
            )}

            {tab === 'splash' && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Toggle label="Enable Splash Branding" checked={config.splash.enabled} onChange={(value) => updateSection('splash', 'enabled', value)} helper="Flutter app will use these values on launch screen." />
                <TextInput label="Splash Background" type="color" value={config.splash.backgroundColor} onChange={(value) => updateSection('splash', 'backgroundColor', value)} />
                <TextInput label="Splash Title" value={config.splash.title} onChange={(value) => updateSection('splash', 'title', value)} />
                <TextInput label="Splash Subtitle" value={config.splash.subtitle} onChange={(value) => updateSection('splash', 'subtitle', value)} />
                <TextInput label="Loading Text" value={config.splash.loadingText} onChange={(value) => updateSection('splash', 'loadingText', value)} />
                <TextInput label="Splash Logo URL" value={config.splash.logoUrl} onChange={(value) => updateSection('splash', 'logoUrl', value)} />
                <TextInput label="Splash Chips (comma separated)" value={toArrayText(config.splash.chips)} onChange={(value) => updateSection('splash', 'chips', fromArrayText(value))} />
                <TextInput label="Preview Categories (comma separated)" value={toArrayText(config.preview.featuredCategories)} onChange={(value) => updateSection('preview', 'featuredCategories', fromArrayText(value))} />
                <TextInput label="Preview Location" value={config.preview.locationText} onChange={(value) => updateSection('preview', 'locationText', value)} />
                <TextInput label="Preview Search Placeholder" value={config.preview.searchPlaceholder} onChange={(value) => updateSection('preview', 'searchPlaceholder', value)} />
              </div>
            )}

            {tab === 'controls' && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Toggle label="Maintenance Mode" checked={config.controls.maintenanceMode} onChange={(value) => updateSection('controls', 'maintenanceMode', value)} helper="App can show maintenance message before users continue." />
                <Toggle label="Force Update" checked={config.controls.forceUpdate} onChange={(value) => updateSection('controls', 'forceUpdate', value)} helper="Use minimum version and update message for old builds." />
                <Toggle label="Auto Approve Ads" checked={config.controls.autoApproveAds} onChange={(value) => updateSection('controls', 'autoApproveAds', value)} helper="Eligible pending ads can go live automatically after the review window." />
                <Toggle label="Boosted Ads On Top" checked={config.controls.boostedSearchEnabled} onChange={(value) => updateSection('controls', 'boostedSearchEnabled', value)} helper="Subscription boosted posts appear first in search and category results." />
                <TextArea label="Maintenance Message" value={config.controls.maintenanceMessage} onChange={(value) => updateSection('controls', 'maintenanceMessage', value)} />
                <TextArea label="Update Message" value={config.controls.updateMessage} onChange={(value) => updateSection('controls', 'updateMessage', value)} />
                <TextInput label="Minimum Version" value={config.controls.minimumVersion} onChange={(value) => updateSection('controls', 'minimumVersion', value)} />
                <TextInput label="Auto Approve After Minutes" type="number" value={config.controls.autoApproveAfterMinutes} onChange={(value) => updateSection('controls', 'autoApproveAfterMinutes', Number(value) || 1)} />
                <TextInput label="Free Monthly Post Limit" type="number" value={config.controls.freeMonthlyPostLimit} onChange={(value) => updateSection('controls', 'freeMonthlyPostLimit', Number(value) || 0)} />
                <TextInput label="Dealer Monthly Post Limit" type="number" value={config.controls.dealerMonthlyPostLimit} onChange={(value) => updateSection('controls', 'dealerMonthlyPostLimit', Number(value) || 0)} />
                <TextInput label="Play Store URL" value={config.controls.playStoreUrl} onChange={(value) => updateSection('controls', 'playStoreUrl', value)} />
                <TextInput label="App Store URL" value={config.controls.appStoreUrl} onChange={(value) => updateSection('controls', 'appStoreUrl', value)} />
              </div>
            )}

            {tab === 'contact' && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextInput label="Support Email" value={config.contact.supportEmail} onChange={(value) => updateSection('contact', 'supportEmail', value)} />
                <TextInput label="Support Phone" value={config.contact.supportPhone} onChange={(value) => updateSection('contact', 'supportPhone', value)} />
                <TextInput label="Privacy URL" value={config.contact.privacyUrl} onChange={(value) => updateSection('contact', 'privacyUrl', value)} />
                <TextInput label="Terms URL" value={config.contact.termsUrl} onChange={(value) => updateSection('contact', 'termsUrl', value)} />
              </div>
            )}
          </section>
        </div>

        <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">App Preview</h2>
            <RefreshCw size={17} className="text-gray-400" />
          </div>
          <div className="mx-auto max-w-[300px] rounded-[2rem] border-8 border-gray-900 bg-gray-900 p-2 shadow-2xl">
            <div className="overflow-hidden rounded-[1.4rem]" style={{ backgroundColor: config.splash.backgroundColor || '#fff' }}>
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 flex-1 items-center rounded-lg border border-orange-100 bg-orange-50 px-3 text-xs font-bold text-gray-700">
                    {config.preview.locationText || 'India'}
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white">
                    <Bell size={16} />
                  </div>
                </div>
                <div className="mb-8 flex h-10 items-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-500">
                  <Search size={15} className="mr-2 text-gray-800" />
                  {config.preview.searchPlaceholder || 'Search...'}
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-orange-100 bg-white p-3 shadow-lg">
                    <img src={config.splash.logoUrl || config.branding.logoUrl || '/logo-1.png'} alt="App logo" className="h-full w-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-950">{config.splash.title || config.identity.appName}</h3>
                  <p className="mt-1 text-sm font-bold text-gray-500">{config.splash.subtitle || config.identity.tagline}</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {(config.splash.chips || []).slice(0, 3).map((chip) => (
                      <span key={chip} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-700">{chip}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 h-1.5 rounded-full bg-gray-100">
                  <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: config.branding.accentColor || '#F97316' }} />
                </div>
                <p className="mt-3 text-center text-xs font-bold text-gray-500">{config.splash.loadingText}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <div className="mb-2 flex items-center gap-2 font-bold text-gray-800">
              <Upload size={16} />
              Runtime note
            </div>
            <p>Visible app branding and splash update dynamically. Native launcher icon, package name, and store version metadata are saved here for release control and need a new app build to apply on the phone OS.</p>
          </div>
        </aside>
      </div>
    </form>
  );
};

export default AdminAppControl;
