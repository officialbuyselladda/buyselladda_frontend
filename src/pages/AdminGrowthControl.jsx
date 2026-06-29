import React from 'react';
import { Megaphone } from 'lucide-react';
import AdminDynamicControlPage from './AdminDynamicControlPage';

const defaults = {
  referralEnabled: false,
  welcomeOfferEnabled: false,
  welcomeOfferText: 'Post your first ad for free.',
  featuredAdsEnabled: true,
  promotedBannerTitle: 'Boost your listing',
  promotedBannerSubtitle: 'Reach more buyers with premium visibility.',
  campaignBanners: [],
};

const fields = [
  { key: 'referralEnabled', label: 'Referral program', type: 'toggle', help: 'Enable referral campaign controls.' },
  { key: 'welcomeOfferEnabled', label: 'Welcome offer', type: 'toggle', help: 'Show first-user promotional message.' },
  { key: 'featuredAdsEnabled', label: 'Featured ads', type: 'toggle', help: 'Allow promoted/featured placements.' },
  { key: 'welcomeOfferText', label: 'Welcome offer text', type: 'textarea', rows: 3 },
  { key: 'promotedBannerTitle', label: 'Promoted banner title' },
  { key: 'promotedBannerSubtitle', label: 'Promoted banner subtitle', type: 'textarea', rows: 3 },
  { key: 'campaignBanners', label: 'Campaign banners JSON', type: 'json', rows: 8 },
];

const AdminGrowthControl = () => (
  <AdminDynamicControlPage
    configKey="growth"
    title="Growth Control"
    description="Manage offers, referral switches, promoted banners, and campaign surfaces."
    icon={Megaphone}
    fields={fields}
    defaults={defaults}
    preview={(draft) => (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-orange-50 p-5">
        <p className="text-xs font-bold uppercase text-orange-700">Promotion</p>
        <h3 className="mt-2 text-xl font-black text-gray-950">{draft.promotedBannerTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-600">{draft.promotedBannerSubtitle}</p>
        {draft.welcomeOfferEnabled && <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm">{draft.welcomeOfferText}</div>}
      </div>
    )}
  />
);

export default AdminGrowthControl;
