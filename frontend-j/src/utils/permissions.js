// Permission checking utilities for staff access control
// Based on backend permission system

import { isCoach, isStaff, getStaffPermissions } from './authUtils';

/**
 * Permission constants matching backend
 * These should match the backend PERMISSIONS in utils/unifiedPermissions.js
 */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD: {
    VIEW: 'dashboard:view'
  },
  
  // Leads
  LEADS: {
    VIEW: 'leads:view',
    CREATE: 'leads:create',
    UPDATE: 'leads:update',
    DELETE: 'leads:delete',
    MANAGE: 'leads:manage'
  },
  
  // Funnels
  FUNNELS: {
    VIEW: 'funnels:view',
    CREATE: 'funnels:create',
    UPDATE: 'funnels:update',
    DELETE: 'funnels:delete',
    MANAGE: 'funnels:manage',
    VIEW_ANALYTICS: 'funnels:view_analytics',
    EDIT_STAGES: 'funnels:edit_stages',
    MANAGE_STAGES: 'funnels:manage_stages',
    PUBLISH: 'funnels:publish',
    UNPUBLISH: 'funnels:unpublish'
  },
  
  // Tasks
  TASKS: {
    VIEW: 'tasks:view',
    CREATE: 'tasks:create',
    UPDATE: 'tasks:update',
    DELETE: 'tasks:delete',
    MANAGE: 'tasks:manage',
    ASSIGN: 'tasks:assign'
  },
  
  // Calendar/Appointments
  CALENDAR: {
    VIEW: 'calendar:view',
    CREATE: 'calendar:create',
    UPDATE: 'calendar:update',
    DELETE: 'calendar:delete',
    MANAGE: 'calendar:manage',
    BOOK: 'calendar:book',
    RESCHEDULE: 'calendar:reschedule'
  },
  
  // Marketing/Ads
  MARKETING: {
    VIEW: 'marketing:view',
    CREATE_CAMPAIGN: 'marketing:create_campaign',
    UPDATE_CAMPAIGN: 'marketing:update_campaign',
    DELETE_CAMPAIGN: 'marketing:delete_campaign',
    MANAGE: 'marketing:manage',
    VIEW_ANALYTICS: 'marketing:view_analytics'
  },
  
  // Messaging/WhatsApp
  MESSAGING: {
    VIEW: 'messaging:view',
    SEND: 'messaging:send',
    REPLY: 'messaging:reply',
    DELETE: 'messaging:delete',
    MANAGE: 'messaging:manage'
  },
  
  // Automation
  AUTOMATION: {
    VIEW: 'automation:view',
    CREATE: 'automation:create',
    UPDATE: 'automation:update',
    DELETE: 'automation:delete',
    MANAGE: 'automation:manage',
    EXECUTE: 'automation:execute'
  },
  
  // Performance/Analytics
  PERFORMANCE: {
    VIEW: 'performance:view',
    MANAGE: 'performance:manage'
  },
  
  // Staff Management
  STAFF: {
    VIEW: 'staff:view',
    CREATE: 'staff:create',
    UPDATE: 'staff:update',
    DELETE: 'staff:delete',
    MANAGE: 'staff:manage'
  },
  
  // Files
  FILES: {
    VIEW: 'files:view',
    CREATE: 'files:create',
    DELETE: 'files:delete',
    MANAGE: 'files:manage'
  },
  
  // AI Features
  AI: {
    VIEW: 'ai:view',
    CREATE: 'ai:create',
    MANAGE: 'ai:manage'
  }
};

/**
 * Check if user has a specific permission
 * Coaches always have all permissions
 * @param {Object} authState - Redux auth state
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (authState, permission) => {
  // Coaches have all permissions
  if (isCoach(authState)) {
    return true;
  }
  
  // Staff need explicit permission
  if (isStaff(authState)) {
    const permissions = getStaffPermissions(authState);
    return permissions.includes(permission);
  }
  
  // Unknown role, no permission
  return false;
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} authState - Redux auth state
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (authState, permissions) => {
  if (isCoach(authState)) return true;
  if (!isStaff(authState)) return false;
  
  const staffPermissions = getStaffPermissions(authState);
  return permissions.some(perm => staffPermissions.includes(perm));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} authState - Redux auth state
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (authState, permissions) => {
  if (isCoach(authState)) return true;
  if (!isStaff(authState)) return false;
  
  const staffPermissions = getStaffPermissions(authState);
  return permissions.every(perm => staffPermissions.includes(perm));
};

/**
 * Check if user can access a dashboard section
 * @param {Object} authState - Redux auth state
 * @param {string} section - Dashboard section name
 * @returns {boolean}
 */
export const canAccessSection = (authState, section) => {
  if (isCoach(authState)) return true;
  if (!isStaff(authState)) return false;
  
  const sectionPermissions = {
    'overview': [PERMISSIONS.DASHBOARD.VIEW],
    'leads': [PERMISSIONS.LEADS.VIEW],
    'funnels': [PERMISSIONS.FUNNELS.VIEW],
    'tasks': [PERMISSIONS.TASKS.VIEW],
    'calendar': [PERMISSIONS.CALENDAR.VIEW],
    'appointments': [PERMISSIONS.CALENDAR.VIEW],
    'marketing': [PERMISSIONS.MARKETING.VIEW],
    'ads': [PERMISSIONS.MARKETING.VIEW],
    'whatsapp': [PERMISSIONS.MESSAGING.VIEW],
    'automation': [PERMISSIONS.AUTOMATION.VIEW],
    'team': [PERMISSIONS.STAFF.VIEW],
    'performance': [PERMISSIONS.PERFORMANCE.VIEW],
    'financial': [PERMISSIONS.PERFORMANCE.VIEW],
    'files': [PERMISSIONS.FILES.VIEW],
    'ai': [PERMISSIONS.AI.VIEW],
    'courses': [PERMISSIONS.DASHBOARD.VIEW], // Courses fall under dashboard
    'subscription': [PERMISSIONS.DASHBOARD.VIEW] // Subscription management
  };
  
  const requiredPermissions = sectionPermissions[section] || [PERMISSIONS.DASHBOARD.VIEW];
  return hasAnyPermission(authState, requiredPermissions);
};

/**
 * Get user context for display purposes
 * @param {Object} authState - Redux auth state
 * @returns {Object} User context object
 */
export const getUserContext = (authState) => {
  return {
    isCoach: isCoach(authState),
    isStaff: isStaff(authState),
    role: getUserRole(authState),
    permissions: getStaffPermissions(authState),
    userId: getUserId(authState),
    coachId: getCoachId(authState)
  };
};

