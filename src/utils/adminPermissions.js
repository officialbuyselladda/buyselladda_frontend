export const ADMIN_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', description: 'View admin dashboard and platform summary' },
  { key: 'analytics', label: 'Analytics', description: 'View charts, reports, and growth data' },
  { key: 'products', label: 'Products', description: 'Manage ads, approve, reject, and delete listings' },
  { key: 'users', label: 'Users', description: 'View, add, edit, block, and delete users' },
  { key: 'userLimits', label: 'Ad Limits', description: 'Control daily, weekend, monthly, and unlimited ad limits' },
  { key: 'chats', label: 'Chats', description: 'View and moderate user conversations' },
  { key: 'reports', label: 'Reports', description: 'Review reported and pending ads' },
  { key: 'supportTickets', label: 'Support Tickets', description: 'Handle customer support requests' },
  { key: 'categories', label: 'Categories', description: 'Create and manage listing categories' },
  { key: 'favorites', label: 'Favorites', description: 'View and manage saved listings' },
  { key: 'notifications', label: 'Notifications', description: 'Create and manage admin notifications' },
  { key: 'moderation', label: 'Moderation', description: 'Access moderation queue and user reports' },
  { key: 'settings', label: 'Settings', description: 'Manage admin panel settings' },
  { key: 'systemSettings', label: 'Website Content', description: 'Edit website content and system pages' },
  { key: 'appControl', label: 'Deal App Control', description: 'Manage mobile app branding, splash, version, and runtime controls' },
  { key: 'adminRoles', label: 'Role Permissions', description: 'Create admin accounts and assign permissions' },
];

export const hasAdminPermission = (user, permission) => {
  if (!user || user.role !== 'admin') return false;
  const permissions = Array.isArray(user.adminPermissions) ? user.adminPermissions : [];
  return permissions.length === 0 || permissions.includes('all') || permissions.includes(permission);
};

export const getFirstAllowedAdminPath = (user) => {
  const fallbackMap = {
    dashboard: '/admin/dashboard',
    analytics: '/admin/analytics',
    products: '/admin/products',
    users: '/admin/users',
    userLimits: '/admin/user-limits',
    chats: '/admin/chats',
    reports: '/admin/reports',
    supportTickets: '/admin/support-tickets',
    categories: '/admin/categories',
    favorites: '/admin/favorites',
    notifications: '/admin/notifications',
    moderation: '/admin/moderation',
    settings: '/admin/settings',
    systemSettings: '/admin/system-settings',
    appControl: '/admin/app-control',
    adminRoles: '/admin/role-permissions',
  };

  const firstPermission = ADMIN_PERMISSIONS.find((item) => hasAdminPermission(user, item.key));
  return fallbackMap[firstPermission?.key] || '/admin/dashboard';
};
