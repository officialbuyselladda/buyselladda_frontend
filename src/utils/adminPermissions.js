export const ADMIN_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', section: 'Overview', path: '/admin/dashboard', description: 'View admin dashboard and platform summary' },
  { key: 'analytics', label: 'Analytics', section: 'Overview', path: '/admin/analytics', description: 'View charts, reports, and growth data' },
  { key: 'products', label: 'Products (Ads)', section: 'Management', path: '/admin/products', description: 'Manage ads, approve, reject, and delete listings' },
  { key: 'users', label: 'Users', section: 'Management', path: '/admin/users', description: 'View, add, edit, block, and delete users' },
  { key: 'userLimits', label: 'Ad Limits', section: 'Management', path: '/admin/user-limits', description: 'Control daily, weekend, monthly, and unlimited ad limits' },
  { key: 'chats', label: 'Chats', section: 'Management', path: '/admin/chats', description: 'View and moderate user conversations' },
  { key: 'reports', label: 'Reports', section: 'Management', path: '/admin/reports', description: 'Review reported and pending ads' },
  { key: 'supportTickets', label: 'Support Tickets', section: 'Management', path: '/admin/support-tickets', description: 'Handle customer support requests' },
  { key: 'categories', label: 'Categories', section: 'Management', path: '/admin/categories', description: 'Create and manage listing categories' },
  { key: 'favorites', label: 'Favorites', section: 'Engage', path: '/admin/favorites', description: 'View and manage saved listings' },
  { key: 'notifications', label: 'Notifications', section: 'Engage', path: '/admin/notifications', description: 'Create and manage admin notifications' },
  { key: 'moderation', label: 'Moderation', section: 'Engage', path: '/admin/moderation', description: 'Access moderation queue and user reports' },
  { key: 'settings', label: 'Settings', section: 'System', path: '/admin/settings', description: 'Manage admin profile and password settings' },
  { key: 'systemSettings', label: 'Website Content', section: 'System', path: '/admin/system-settings', description: 'Edit footer, policy pages, and public website content' },
  { key: 'appControl', label: 'Deal App Control', section: 'System', path: '/admin/app-control', description: 'Manage mobile app branding, splash, version, and runtime controls' },
  { key: 'adminRoles', label: 'Employee Permissions', section: 'System', path: '/admin/role-permissions', description: 'Create employee admin accounts and assign module permissions' },
];

export const ADMIN_PERMISSION_SECTIONS = ['Overview', 'Management', 'Engage', 'System'];

export const ADMIN_PERMISSION_BY_KEY = ADMIN_PERMISSIONS.reduce((permissions, permission) => {
  permissions[permission.key] = permission;
  return permissions;
}, {});

export const ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map((permission) => permission.key);

export const getAdminPermissionLabel = (permission) => {
  if (permission === 'all') return 'Full Access';
  return ADMIN_PERMISSION_BY_KEY[permission]?.label || permission;
};

export const getAdminPermissionPath = (permission) => ADMIN_PERMISSION_BY_KEY[permission]?.path || '/admin/dashboard';

export const hasAdminPermission = (user, permission) => {
  if (!user || user.role !== 'admin') return false;
  const permissions = Array.isArray(user.adminPermissions) ? user.adminPermissions : [];
  return permissions.length === 0 || permissions.includes('all') || permissions.includes(permission);
};

export const getFirstAllowedAdminPath = (user) => {
  const firstPermission = ADMIN_PERMISSIONS.find((item) => hasAdminPermission(user, item.key));
  return firstPermission?.path || '/admin/dashboard';
};

export const getAdminNavSections = (user, iconMap = {}) => {
  return ADMIN_PERMISSION_SECTIONS
    .map((section) => ({
      label: section,
      items: ADMIN_PERMISSIONS
        .filter((permission) => permission.section === section && hasAdminPermission(user, permission.key))
        .map((permission) => ({
          ...permission,
          icon: iconMap[permission.key],
          permission: permission.key,
        })),
    }))
    .filter((section) => section.items.length > 0);
};
