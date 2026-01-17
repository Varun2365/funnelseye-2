/**
 * Staff Permissions System
 * Defines all available permissions, permission groups, and validation functions
 */

// ===== PERMISSION CONSTANTS =====
const PERMISSIONS = {
    // Lead Management
    LEADS: {
        READ: 'leads:view',        // Changed from 'leads:read' to match section permissions
        WRITE: 'leads:write', 
        UPDATE: 'leads:update',
        DELETE: 'leads:delete',
        MANAGE: 'leads:manage'
    },
    
    // Funnel Management
    FUNNELS: {
        READ: 'funnels:read',
        WRITE: 'funnels:write',
        UPDATE: 'funnels:update',
        DELETE: 'funnels:delete',
        MANAGE: 'funnels:manage',
        // Granular funnel permissions
        VIEW_ANALYTICS: 'funnels:view_analytics',
        EDIT_STAGES: 'funnels:edit_stages',
        MANAGE_STAGES: 'funnels:manage_stages',
        PUBLISH: 'funnels:publish',
        UNPUBLISH: 'funnels:unpublish'
    },
    
    // Task Management
    TASKS: {
        READ: 'tasks:read',
        WRITE: 'tasks:write',
        UPDATE: 'tasks:update',
        DELETE: 'tasks:delete',
        MANAGE: 'tasks:manage',
        ASSIGN: 'tasks:assign'
    },
    
    // Calendar Management
    CALENDAR: {
        READ: 'calendar:read',
        WRITE: 'calendar:write',
        UPDATE: 'calendar:update',
        DELETE: 'calendar:delete',
        MANAGE: 'calendar:manage',
        BOOK: 'calendar:book'
    },
    
    // Staff Management
    STAFF: {
        READ: 'staff:read',
        WRITE: 'staff:write',
        UPDATE: 'staff:update',
        DELETE: 'staff:delete',
        MANAGE: 'staff:manage'
    },
    
    // Performance & Analytics
    PERFORMANCE: {
        READ: 'performance:read',
        WRITE: 'performance:write',
        MANAGE: 'performance:manage'
    },
    
    // File Management
    FILES: {
        READ: 'files:read',
        WRITE: 'files:write',
        DELETE: 'files:delete',
        MANAGE: 'files:manage'
    },
    
    // AI Services
    AI: {
        READ: 'ai:read',
        WRITE: 'ai:write',
        MANAGE: 'ai:manage'
    },
    
    // WhatsApp Management - moved to dustbin/whatsapp-dump/
    // WHATSAPP: {
    //     READ: 'whatsapp:read',
    //     WRITE: 'whatsapp:write',
    //     MANAGE: 'whatsapp:manage'
    // },
    
    // Automation Rules
    AUTOMATION: {
        READ: 'automation:read',
        WRITE: 'automation:write',
        UPDATE: 'automation:update',
        DELETE: 'automation:delete',
        MANAGE: 'automation:manage',
        EXECUTE: 'automation:execute'
    },
    
    // WhatsApp Messaging
    WHATSAPP: {
        READ: 'whatsapp:read',
        WRITE: 'whatsapp:write',
        SEND: 'whatsapp:send',
        MANAGE: 'whatsapp:manage',
        TEMPLATES: 'whatsapp:templates'
    },
    
    // Ads & Campaigns
    ADS: {
        READ: 'ads:read',
        WRITE: 'ads:write',
        UPDATE: 'ads:update',
        DELETE: 'ads:delete',
        MANAGE: 'ads:manage',
        PUBLISH: 'ads:publish',
        ANALYTICS: 'ads:analytics'
    },
    
    // Appointments
    APPOINTMENTS: {
        READ: 'appointments:read',
        WRITE: 'appointments:write',
        UPDATE: 'appointments:update',
        DELETE: 'appointments:delete',
        MANAGE: 'appointments:manage',
        BOOK: 'appointments:book',
        RESCHEDULE: 'appointments:reschedule'
    },
    
    // Permission Requests
    PERMISSIONS: {
        REQUEST: 'permissions:request',
        APPROVE: 'permissions:approve',
        DENY: 'permissions:deny',
        MANAGE: 'permissions:manage'
    }
};

// ===== PERMISSION GROUPS =====
const PERMISSION_GROUPS = {
    'Lead Manager': [
        PERMISSIONS.LEADS.READ,  // This now correctly maps to 'leads:view'
        PERMISSIONS.LEADS.WRITE,
        PERMISSIONS.LEADS.UPDATE,
        PERMISSIONS.LEADS.MANAGE
    ],
    
    'Funnel Editor': [
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.FUNNELS.UPDATE,
        PERMISSIONS.FUNNELS.EDIT_STAGES,
        PERMISSIONS.FUNNELS.VIEW_ANALYTICS
    ],
    
    'Funnel Manager': [
        PERMISSIONS.FUNNELS.READ,
        PERMISSIONS.FUNNELS.WRITE,
        PERMISSIONS.FUNNELS.UPDATE,
        PERMISSIONS.FUNNELS.MANAGE,
        PERMISSIONS.FUNNELS.VIEW_ANALYTICS,
        PERMISSIONS.FUNNELS.EDIT_STAGES,
        PERMISSIONS.FUNNELS.MANAGE_STAGES,
        PERMISSIONS.FUNNELS.PUBLISH,
        PERMISSIONS.FUNNELS.UNPUBLISH
    ],
    
    'Task Manager': [
        PERMISSIONS.TASKS.READ,
        PERMISSIONS.TASKS.WRITE,
        PERMISSIONS.TASKS.UPDATE,
        PERMISSIONS.TASKS.MANAGE,
        PERMISSIONS.TASKS.ASSIGN
    ],
    
    'Calendar Manager': [
        PERMISSIONS.CALENDAR.READ,
        PERMISSIONS.CALENDAR.WRITE,
        PERMISSIONS.CALENDAR.UPDATE,
        PERMISSIONS.CALENDAR.MANAGE,
        PERMISSIONS.CALENDAR.BOOK
    ],
    
    'Staff Manager': [
        PERMISSIONS.STAFF.READ,
        PERMISSIONS.STAFF.WRITE,
        PERMISSIONS.STAFF.UPDATE,
        PERMISSIONS.STAFF.MANAGE
    ],
    
    'Analytics Manager': [
        PERMISSIONS.PERFORMANCE.READ,
        PERMISSIONS.PERFORMANCE.WRITE,
        PERMISSIONS.PERFORMANCE.MANAGE
    ],
    
    'Content Manager': [
        PERMISSIONS.FILES.READ,
        PERMISSIONS.FILES.WRITE,
        PERMISSIONS.FILES.MANAGE,
        PERMISSIONS.AI.READ,
        PERMISSIONS.AI.WRITE
    ],
    
    'Communication Manager': [
            // PERMISSIONS.WHATSAPP.READ, // WhatsApp functionality moved to dustbin/whatsapp-dump/
    // PERMISSIONS.WHATSAPP.WRITE, // WhatsApp functionality moved to dustbin/whatsapp-dump/
    // PERMISSIONS.WHATSAPP.MANAGE, // WhatsApp functionality moved to dustbin/whatsapp-dump/
        PERMISSIONS.AUTOMATION.READ,
        PERMISSIONS.AUTOMATION.WRITE
    ],
    
    'WhatsApp Manager': [
        PERMISSIONS.WHATSAPP.READ,
        PERMISSIONS.WHATSAPP.WRITE,
        PERMISSIONS.WHATSAPP.SEND,
        PERMISSIONS.WHATSAPP.MANAGE,
        PERMISSIONS.WHATSAPP.TEMPLATES
    ],
    
    'Automation Manager': [
        PERMISSIONS.AUTOMATION.READ,
        PERMISSIONS.AUTOMATION.WRITE,
        PERMISSIONS.AUTOMATION.UPDATE,
        PERMISSIONS.AUTOMATION.DELETE,
        PERMISSIONS.AUTOMATION.MANAGE,
        PERMISSIONS.AUTOMATION.EXECUTE
    ],
    
    'Ads Manager': [
        PERMISSIONS.ADS.READ,
        PERMISSIONS.ADS.WRITE,
        PERMISSIONS.ADS.UPDATE,
        PERMISSIONS.ADS.DELETE,
        PERMISSIONS.ADS.MANAGE,
        PERMISSIONS.ADS.PUBLISH,
        PERMISSIONS.ADS.ANALYTICS
    ],
    
    'Appointment Manager': [
        PERMISSIONS.APPOINTMENTS.READ,
        PERMISSIONS.APPOINTMENTS.WRITE,
        PERMISSIONS.APPOINTMENTS.UPDATE,
        PERMISSIONS.APPOINTMENTS.DELETE,
        PERMISSIONS.APPOINTMENTS.MANAGE,
        PERMISSIONS.APPOINTMENTS.BOOK,
        PERMISSIONS.APPOINTMENTS.RESCHEDULE
    ],
    
    'Permission Manager': [
        PERMISSIONS.PERMISSIONS.REQUEST,
        PERMISSIONS.PERMISSIONS.APPROVE,
        PERMISSIONS.PERMISSIONS.DENY,
        PERMISSIONS.PERMISSIONS.MANAGE
    ],
    
    'Full Access': Object.values(PERMISSIONS).flatMap(group => 
        Object.values(group)
    )
};

// ===== PERMISSION VALIDATION FUNCTIONS =====

/**
 * Check if a permission string is valid
 * @param {string} permission - Permission to validate
 * @returns {boolean} - True if valid
 */
function isValidPermission(permission) {
    return Object.values(PERMISSIONS).some(group => 
        Object.values(group).includes(permission)
    );
}

/**
 * Validate an array of permissions
 * @param {string[]} permissions - Array of permissions to validate
 * @returns {Object} - { valid: boolean, invalid: string[] }
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
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string} requiredPermission - Required permission
 * @returns {boolean} - True if staff has permission
 */
function hasPermission(staffPermissions, requiredPermission) {
    if (!Array.isArray(staffPermissions)) return false;
    return staffPermissions.includes(requiredPermission);
}

/**
 * Check if staff has any of the required permissions
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string[]} requiredPermissions - Array of required permissions (any one)
 * @returns {boolean} - True if staff has at least one permission
 */
function hasAnyPermission(staffPermissions, requiredPermissions) {
    if (!Array.isArray(staffPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.some(permission => staffPermissions.includes(permission));
}

/**
 * Check if staff has all required permissions
 * @param {string[]} staffPermissions - Staff's permission array
 * @param {string[]} requiredPermissions - Array of required permissions (all)
 * @returns {boolean} - True if staff has all permissions
 */
function hasAllPermissions(staffPermissions, requiredPermissions) {
    if (!Array.isArray(staffPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.every(permission => staffPermissions.includes(permission));
}

/**
 * Get all available permissions
 * @returns {string[]} - Array of all permissions
 */
function getAllPermissions() {
    return Object.values(PERMISSIONS).flatMap(group => Object.values(group));
}

/**
 * Get permissions by group
 * @param {string} groupName - Name of permission group
 * @returns {string[]} - Array of permissions in group
 */
function getPermissionsByGroup(groupName) {
    return PERMISSION_GROUPS[groupName] || [];
}

/**
 * Get available permission groups
 * @returns {string[]} - Array of available group names
 */
function getAvailableGroups() {
    return Object.keys(PERMISSION_GROUPS);
}

module.exports = {
    PERMISSIONS,
    PERMISSION_GROUPS,
    isValidPermission,
    validatePermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAllPermissions,
    getPermissionsByGroup,
    getAvailableGroups
};
