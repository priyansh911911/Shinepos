// Role-based access control configuration
export const ROLES = {
  RESTAURANT_ADMIN: 'RESTAURANT_ADMIN',
  MANAGER: 'MANAGER',
  CHEF: 'CHEF',
  WAITER: 'WAITER',
  CASHIER: 'CASHIER'
};

// Define which pages each role can access
export const rolePermissions = {
  [ROLES.RESTAURANT_ADMIN]: {
    pages: ['dashboard', 'analytics', 'tables', 'staff', 'attendance', 'subscription', 'orders', 'kot', 'inventory', 'add-inventory', 'smart-inventory', 'vendors', 'category', 'menu', 'addons', 'variations', 'reports', 'sales-report', 'item-analysis', 'staff-performance', 'peak-hours', 'tax-reports', 'profit-loss', 'settings'],
    defaultPage: 'dashboard'
  },
  [ROLES.MANAGER]: {
    pages: ['dashboard', 'analytics', 'tables', 'staff', 'attendance', 'orders', 'kot', 'inventory', 'add-inventory', 'smart-inventory', 'vendors', 'category', 'menu', 'addons', 'variations', 'reports', 'sales-report', 'item-analysis', 'staff-performance', 'peak-hours', 'tax-reports', 'profit-loss'],
    pages: ['dashboard', 'analytics', 'tables', 'crm', 'staff', 'attendance', 'subscription', 'orders', 'kot', 'inventory', 'add-inventory', 'smart-inventory', 'vendors', 'category', 'menu', 'addons', 'variations', 'settings'],
    defaultPage: 'dashboard'
  },
  [ROLES.MANAGER]: {
    pages: ['dashboard', 'analytics', 'tables', 'crm', 'staff', 'attendance', 'orders', 'kot', 'inventory', 'add-inventory', 'smart-inventory', 'vendors', 'category', 'menu', 'addons', 'variations'],
    defaultPage: 'dashboard'
  },
  [ROLES.CHEF]: {
    pages: ['dashboard', 'kot', 'orders', 'inventory', 'smart-inventory'],
    defaultPage: 'kot'
  },
  [ROLES.WAITER]: {
    pages: ['dashboard', 'orders', 'tables'],
    defaultPage: 'orders'
  },
  [ROLES.CASHIER]: {
    pages: ['dashboard', 'orders'],
    defaultPage: 'orders'
  }
};

// Check if a role has access to a specific page
export const hasAccess = (userRole, page) => {
  const permissions = rolePermissions[userRole];
  return permissions ? permissions.pages.includes(page) : false;
};

// Get default page for a role
export const getDefaultPage = (userRole) => {
  const permissions = rolePermissions[userRole];
  return permissions ? permissions.defaultPage : 'dashboard';
};

// Get all accessible pages for a role
export const getAccessiblePages = (userRole) => {
  const permissions = rolePermissions[userRole];
  return permissions ? permissions.pages : [];
};
