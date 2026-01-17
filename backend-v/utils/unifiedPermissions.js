/**
 * UNIFIED PERMISSION SYSTEM
 * =========================
 * Single source of truth for all permissions in the application
 * 
 * IMPORTANT: This is the ONLY permission enum that should be used throughout the codebase
 * All controllers, middleware, and routes MUST reference this file for permission checks
 */

// ===== PERMISSION CONSTANTS =====
const PERMISSIONS = {
    // DASHBOARD
    DASHBOARD: 'dashboard',
    PROFILE: 'profile',
    
    // LEAD MANAGEMENT (Fine-grained)
    LEADS: {
        VIEW: 'leads:view',              // View assigned leads
        CREATE: 'leads:create',          // Create new leads
        UPDATE: 'leads:update',          // Update lead information
        DELETE: 'leads:delete',          // Delete leads
        ASSIGN: 'leads:assign',          // Assign leads to other staff
        EXPORT: 'leads:export',          // Export lead data
        MANAGE_ALL: 'leads:manage_all',  // View and manage ALL coach leads (not just assigned)
        MANAGE: 'leads:manage'           // Full lead management
    },
    
    // FUNNEL MANAGEMENT
    FUNNELS: {
        READ: 'funnels:read',
        WRITE: 'funnels:write',
        UPDATE: 'funnels:update',
        DELETE: 'funnels:delete',
        MANAGE: 'funnels:manage',
        VIEW_ANALYTICS: 'funnels:view_analytics',
        EDIT_STAGES: 'funnels:edit_stages',
        MANAGE_STAGES: 'funnels:manage_stages',
        PUBLISH: 'funnels:publish',
        UNPUBLISH: 'funnels:unpublish'
    },
    
    // TASK MANAGEMENT
    TASKS: {
        READ: 'tasks:read',
        WRITE: 'tasks:write',
        UPDATE: 'tasks:update',
        DELETE: 'tasks:delete',
        MANAGE: 'tasks:manage',
        ASSIGN: 'tasks:assign'
    },
    
    // CALENDAR MANAGEMENT
    CALENDAR: {
        READ: 'calendar:read',
        WRITE: 'calendar:write',
        UPDATE: 'calendar:update',
        DELETE: 'calendar:delete',
        MANAGE: 'calendar:manage',
        BOOK: 'calendar:book'
    },
    
    // STAFF MANAGEMENT
    STAFF: {
        READ: 'staff:read',
        WRITE: 'staff:write',
        UPDATE: 'staff:update',
        DELETE: 'staff:delete',
        MANAGE: 'staff:manage'
    },
    
    // PERFORMANCE & ANALYTICS
    PERFORMANCE: {
        READ: 'performance:read',
        WRITE: 'performance:write',
        MANAGE: 'performance:manage'
    },
    
    // FILE MANAGEMENT
    FILES: {
        READ: 'files:read',
        WRITE: 'files:write',
        DELETE: 'files:delete',
        MANAGE: 'files:manage'
    },
    
    // AI SERVICES
    AI: {
        READ: 'ai:read',
        WRITE: 'ai:write',
        MANAGE: 'ai:manage'
    },
    
    // WHATSAPP MESSAGING
    WHATSAPP: {
        READ: 'whatsapp:read',
        WRITE: 'whatsapp:write',
        SEND: 'whatsapp:send',
        MANAGE: 'whatsapp:manage',
        TEMPLATES: 'whatsapp:templates'
    },
    
    // AUTOMATION RULES
    AUTOMATION: {
        READ: 'automation:read',
        WRITE: 'automation:write',
        UPDATE: 'automation:update',
        DELETE: 'automation:delete',
        MANAGE: 'automation:manage',
        EXECUTE: 'automation:execute'
    },
    
    // ADS & CAMPAIGNS
    ADS: {
        READ: 'ads:read',
        WRITE: 'ads:write',
        UPDATE: 'ads:update',
        DELETE: 'ads:delete',
        MANAGE: 'ads:manage',
        PUBLISH: 'ads:publish',
        ANALYTICS: 'ads:analytics'
    },
    
    // APPOINTMENTS
    APPOINTMENTS: {
        READ: 'appointments:read',
        WRITE: 'appointments:write',
        UPDATE: 'appointments:update',
        DELETE: 'appointments:delete',
        MANAGE: 'appointments:manage',
        BOOK: 'appointments:book',
        RESCHEDULE: 'appointments:reschedule'
    },
    
    // PERMISSION REQUESTS
    PERMISSION_REQUESTS: {
        REQUEST: 'permissions:request',
        APPROVE: 'permissions:approve',
        DENY: 'permissions:deny',
        MANAGE: 'permissions:manage'
    },
    
    // SECTION-BASED (Full access permissions)
    MESSAGING: 'messaging',           // WhatsApp & Email messaging
    MARKETING: 'marketing',           // Marketing campaigns & ads
    MLM: 'mlm',                      // MLM network management
    ZOOM: 'zoom',                    // Zoom integration
    PAYMENT_GATEWAY: 'payment_gateway', // Payment gateway setup
    DOMAINS: 'domains',              // Custom domain management
    TEMPLATES: 'templates',          // Message templates
    COURSES: 'courses',              // Course management
    STAFF_MANAGEMENT: 'staff_management', // Staff management
    SUBSCRIPTION: 'subscription'     // Subscription (coach only)
};

// ===== PERMISSION METADATA =====
const PERMISSION_METADATA = {
    // Dashboard & Profile
    [PERMISSIONS.DASHBOARD]: {
        name: 'Dashboard',
        description: 'Access to staff dashboard with assigned tasks and overview',
        category: 'Core',
        alwaysAccessible: true
    },
    [PERMISSIONS.PROFILE]: {
        name: 'Profile',
        description: 'Manage your own profile and settings',
        category: 'Core',
        alwaysAccessible: true
    },
    
    // Lead Permissions
    [PERMISSIONS.LEADS.VIEW]: {
        name: 'View Leads',
        description: 'View assigned leads and their information',
        category: 'Lead Management'
    },
    [PERMISSIONS.LEADS.CREATE]: {
        name: 'Create Leads',
        description: 'Create new leads',
        category: 'Lead Management'
    },
    [PERMISSIONS.LEADS.UPDATE]: {
        name: 'Update Leads',
        description: 'Update lead information and status',
        category: 'Lead Management'
    },
    [PERMISSIONS.LEADS.DELETE]: {
        name: 'Delete Leads',
        description: 'Delete leads from the system',
        category: 'Lead Management'
    },
    [PERMISSIONS.LEADS.ASSIGN]: {
        name: 'Assign Leads',
        description: 'Assign leads to other staff members',
        category: 'Lead Management'
    },
    [PERMISSIONS.LEADS.EXPORT]: {
        name: 'Export Leads',
        description: 'Export lead data to CSV/Excel',
        category: 'Lead Management'
    },
    [PERMISSIONS.LEADS.MANAGE_ALL]: {
        name: 'Manage All Leads',
        description: 'View and manage all coach leads (not just assigned ones)',
        category: 'Lead Management',
        isAdvanced: true
    },
    
    // Other permissions (metadata can be added as needed)
    [PERMISSIONS.MESSAGING]: {
        name: 'WhatsApp & Email',
        description: 'Send messages, manage conversations, and email campaigns',
        category: 'Communication'
    },
    [PERMISSIONS.MARKETING]: {
        name: 'Marketing & Ads',
        description: 'Create and manage marketing campaigns and advertisements',
        category: 'Sales & Marketing'
    },
    [PERMISSIONS.SUBSCRIPTION]: {
        name: 'Subscription',
        description: 'Subscription plans and billing (Coach only)',
        category: 'Admin',
        coachOnly: true
    }
};

// ===== PERMISSION PRESETS =====
const PERMISSION_PRESETS = {
    'Sales Representative': [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.LEADS.VIEW,
        PERMISSIONS.LEADS.CREATE,
        PERMISSIONS.LEADS.UPDATE,
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.CALENDAR,
        PERMISSIONS.MESSAGING,
        PERMISSIONS.PROFILE
    ],
    'Lead Manager': [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.LEADS.VIEW,
        PERMISSIONS.LEADS.CREATE,
        PERMISSIONS.LEADS.UPDATE,
        PERMISSIONS.LEADS.DELETE,
        PERMISSIONS.LEADS.ASSIGN,
        PERMISSIONS.LEADS.EXPORT,
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.CALENDAR,
        PERMISSIONS.MESSAGING,
        PERMISSIONS.PROFILE
    ],
    'Senior Lead Manager': [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.LEADS.VIEW,
        PERMISSIONS.LEADS.CREATE,
        PERMISSIONS.LEADS.UPDATE,
        PERMISSIONS.LEADS.DELETE,
        PERMISSIONS.LEADS.ASSIGN,
        PERMISSIONS.LEADS.EXPORT,
        PERMISSIONS.LEADS.MANAGE_ALL,
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.CALENDAR,
        PERMISSIONS.MESSAGING,
        PERMISSIONS.PROFILE
    ],
    'Marketing Manager': [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.MARKETING,
        PERMISSIONS.LEADS.VIEW,
        PERMISSIONS.LEADS.CREATE,
        PERMISSIONS.AUTOMATION.READ,
        PERMISSIONS.AUTOMATION.WRITE,
        PERMISSIONS.TEMPLATES,
        PERMISSIONS.PROFILE
    ],
    'Full Access': [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.LEADS.VIEW,
        PERMISSIONS.LEADS.CREATE,
        PERMISSIONS.LEADS.UPDATE,
        PERMISSIONS.LEADS.DELETE,
        PERMISSIONS.LEADS.ASSIGN,
        PERMISSIONS.LEADS.EXPORT,
        PERMISSIONS.LEADS.MANAGE_ALL,
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.MESSAGING,
        PERMISSIONS.CALENDAR,
        PERMISSIONS.MARKETING,
        PERMISSIONS.AUTOMATION.READ,
        PERMISSIONS.AUTOMATION.WRITE,
        PERMISSIONS.MLM,
        PERMISSIONS.ZOOM,
        PERMISSIONS.PAYMENT_GATEWAY,
        PERMISSIONS.DOMAINS,
        PERMISSIONS.TEMPLATES,
        PERMISSIONS.COURSES,
        PERMISSIONS.STAFF_MANAGEMENT,
        PERMISSIONS.PROFILE
    ]
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get all valid permissions (flattened)
 */
function getAllValidPermissions() {
    const permissions = [];
    
    function flattenPermissions(obj) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                permissions.push(obj[key]);
            } else if (typeof obj[key] === 'object') {
                flattenPermissions(obj[key]);
            }
        }
    }
    
    flattenPermissions(PERMISSIONS);
    return permissions;
}

/**
 * Check if a permission string is valid
 */
function isValidPermission(permission) {
    const allPermissions = getAllValidPermissions();
    return allPermissions.includes(permission);
}

/**
 * Validate an array of permissions
 */
function validatePermissions(permissions) {
    if (!Array.isArray(permissions)) {
        return { valid: false, invalid: [], error: 'Permissions must be an array' };
    }
    
    const invalid = permissions.filter(p => !isValidPermission(p));
    return {
        valid: invalid.length === 0,
        invalid,
        error: invalid.length > 0 ? `Invalid permissions: ${invalid.join(', ')}` : null
    };
}

/**
 * Check if staff has a specific permission
 */
function hasPermission(staffPermissions, requiredPermission) {
    if (!Array.isArray(staffPermissions)) return false;
    
    // Check if permission is always accessible
    const metadata = PERMISSION_METADATA[requiredPermission];
    if (metadata && metadata.alwaysAccessible) return true;
    
    return staffPermissions.includes(requiredPermission);
}

/**
 * Check if staff has any of the required permissions
 */
function hasAnyPermission(staffPermissions, requiredPermissions) {
    if (!Array.isArray(staffPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.some(permission => hasPermission(staffPermissions, permission));
}

/**
 * Check if staff has all required permissions
 */
function hasAllPermissions(staffPermissions, requiredPermissions) {
    if (!Array.isArray(staffPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.every(permission => hasPermission(staffPermissions, permission));
}

/**
 * Check if staff has a specific lead permission
 */
function hasLeadPermission(staffPermissions, requiredPermission) {
    if (!Array.isArray(staffPermissions)) return false;
    
    // Check if staff has the specific permission
    if (staffPermissions.includes(requiredPermission)) {
        return true;
    }
    
    // Check if staff has MANAGE_ALL which grants all lead permissions
    if (staffPermissions.includes(PERMISSIONS.LEADS.MANAGE_ALL)) {
        return true;
    }
    
    return false;
}

/**
 * Get permission preset by name
 */
function getPermissionPreset(presetName) {
    return PERMISSION_PRESETS[presetName] || [];
}

/**
 * Get available permission presets
 */
function getAvailablePresets() {
    return Object.keys(PERMISSION_PRESETS);
}

/**
 * Get permissions grouped by category
 */
function getPermissionsGroupedByCategory() {
    const grouped = {};
    
    for (const [permission, metadata] of Object.entries(PERMISSION_METADATA)) {
        const category = metadata.category || 'Other';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push({
            permission,
            ...metadata
        });
    }
    
    return grouped;
}

module.exports = {
    PERMISSIONS,
    PERMISSION_METADATA,
    PERMISSION_PRESETS,
    getAllValidPermissions,
    isValidPermission,
    validatePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasLeadPermission,
    getPermissionPreset,
    getAvailablePresets,
    getPermissionsGroupedByCategory
};

