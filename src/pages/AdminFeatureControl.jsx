import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import AdminDynamicControlPage from './AdminDynamicControlPage';

const defaults = {
  chatEnabled: true,
  favoritesEnabled: true,
  notificationsEnabled: true,
  locationRequired: false,
  guestBrowsingEnabled: true,
  imageUploadEnabled: true,
  sellerCallEnabled: true,
  reportListingEnabled: true,
  maxImagesPerAd: 8,
  minPrice: 0,
  maxPrice: 100000000,
};

const fields = [
  { key: 'chatEnabled', label: 'Chat enabled', type: 'toggle', help: 'Allow buyers and sellers to message.' },
  { key: 'favoritesEnabled', label: 'Favorites enabled', type: 'toggle', help: 'Allow users to save ads.' },
  { key: 'notificationsEnabled', label: 'Notifications enabled', type: 'toggle', help: 'Allow app notification surfaces.' },
  { key: 'locationRequired', label: 'Require location', type: 'toggle', help: 'Require user location before browsing/posting.' },
  { key: 'guestBrowsingEnabled', label: 'Guest browsing', type: 'toggle', help: 'Allow browsing without login.' },
  { key: 'imageUploadEnabled', label: 'Image upload', type: 'toggle', help: 'Enable listing image upload.' },
  { key: 'sellerCallEnabled', label: 'Seller call button', type: 'toggle', help: 'Expose phone-call action on listings.' },
  { key: 'reportListingEnabled', label: 'Report listing', type: 'toggle', help: 'Expose report/flag action.' },
  { key: 'maxImagesPerAd', label: 'Max images per ad', type: 'number' },
  { key: 'minPrice', label: 'Minimum listing price', type: 'number' },
  { key: 'maxPrice', label: 'Maximum listing price', type: 'number' },
];

const AdminFeatureControl = () => (
  <AdminDynamicControlPage
    configKey="features"
    title="Feature Flags"
    description="Turn marketplace features on/off and control posting limits from admin."
    icon={SlidersHorizontal}
    fields={fields}
    defaults={defaults}
  />
);

export default AdminFeatureControl;
