import React from 'react';
import { Home } from 'lucide-react';
import AdminDynamicControlPage from './AdminDynamicControlPage';

const defaults = {
  heroTitle: 'Buy and sell near you',
  heroSubtitle: 'Find verified local deals, chat safely, and post ads in minutes.',
  heroImageUrl: '',
  showFeaturedCategories: true,
  showRecentAds: true,
  showLocationPrompt: true,
  quickActions: ['Post Ad', 'Browse Categories', 'My Chats'],
  enabledSections: ['featuredCategories', 'nearbyDeals', 'recentAds', 'safetyTips'],
};

const fields = [
  { key: 'heroTitle', label: 'Hero title' },
  { key: 'heroSubtitle', label: 'Hero subtitle', type: 'textarea', rows: 3 },
  { key: 'heroImageUrl', label: 'Hero image URL' },
  { key: 'quickActions', label: 'Quick actions', type: 'tags' },
  { key: 'enabledSections', label: 'Visible home sections', type: 'tags' },
  { key: 'showFeaturedCategories', label: 'Show featured categories', type: 'toggle', help: 'Controls category blocks on home screen.' },
  { key: 'showRecentAds', label: 'Show recent ads', type: 'toggle', help: 'Controls latest ads feed visibility.' },
  { key: 'showLocationPrompt', label: 'Show location prompt', type: 'toggle', help: 'Ask users to select city/location on home.' },
];

const AdminHomeControl = () => (
  <AdminDynamicControlPage
    configKey="homeLayout"
    title="Home Control"
    description="Control homepage and app home-screen hero, quick actions, sections, and location prompts."
    icon={Home}
    fields={fields}
    defaults={defaults}
    preview={(draft) => (
      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-xs font-bold uppercase text-emerald-700">Home preview</p>
        <h3 className="mt-2 text-2xl font-black text-gray-950">{draft.heroTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">{draft.heroSubtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(draft.quickActions || []).map((item) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow-sm">{item}</span>)}
        </div>
      </div>
    )}
  />
);

export default AdminHomeControl;
