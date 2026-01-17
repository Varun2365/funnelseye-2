const { protect, authorizeCoach } = require('./auth');
const StaffPermissionMiddleware = require('./staffPermissionMiddleware');
const { SECTIONS } = require('../utils/sectionPermissions');

/**
 * Unified Coach Authentication Middleware
 * Handles both coach and staff access to coach routes with proper permission checking
 * 
 * Flow:
 * 1. Authenticate user (coach or staff)
 * 2. If staff, check permissions and coach context
 * 3. If coach, allow full access
 * 4. Set appropriate context for controllers
 */

/**
 * Main unified authentication middleware
 * This replaces the need for separate coach and staff routes
 */
const unifiedCoachAuth = () => {
    return [
        protect, // Basic authentication
        authorizeCoach('coach', 'staff'), // Allow both coaches and staff
        StaffPermissionMiddleware.ensureCoachDataAccess() // Ensure staff can only access their coach's data
    ];
};

/**
 * Middleware to check specific permissions for staff
 * Coaches bypass permission checks (they have full access)
 * @param {string|string[]} requiredPermissions - Required permissions
 * @param {string} action - Action type (read, write, update, delete, manage)
 */
const requirePermission = (requiredPermissions, action = 'read') => {
    return [
        protect,
        authorizeCoach('coach', 'staff'),
        StaffPermissionMiddleware.ensureCoachDataAccess(),
        StaffPermissionMiddleware.checkPermission(requiredPermissions, action)
    ];
};

/**
 * Check if user can access a specific resource
 * Staff can only access resources belonging to their coach
 * Coaches can access their own resources
 */
const checkResourceOwnership = () => {
    return async (req, res, next) => {
        try {
            // If user is coach, they own all their resources
            if (req.role === 'coach') {
                return next();
            }

            // For staff, ensure they can only access their coach's resources
            if (req.role === 'staff') {
                // The coachId is already set in the auth middleware
                // Additional resource-specific checks can be added here
                return next();
            }

            next();
        } catch (error) {
            console.error('[UnifiedCoachAuth] Error in checkResourceOwnership:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking resource ownership'
            });
        }
    };
};

/**
 * Filter resources based on user permissions and context
 * Staff see only permitted resources, coaches see all their resources
 */
const filterResourcesByPermission = (resourceType) => {
    return async (req, res, next) => {
        try {
            // If user is coach, no filtering needed
            if (req.role === 'coach') {
                return next();
            }

            // For staff, add filtering context to request
            if (req.role === 'staff') {
                req.resourceFilter = {
                    type: resourceType,
                    coachId: req.coachId,
                    staffPermissions: req.staffInfo?.permissions || [],
                    filterByPermission: true
                };
            }

            next();
        } catch (error) {
            console.error('[UnifiedCoachAuth] Error in filterResourcesByPermission:', error);
            return res.status(500).json({
                success: false,
                message: 'Error filtering resources'
            });
        }
    };
};

/**
 * Specific permission checkers for different resource types
 */

// Lead Management
const requireLeadPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.LEADS.VIEW :        // VIEW instead of READ
        action === 'write' ? SECTIONS.LEADS.CREATE :     // CREATE for write operations
        action === 'update' ? SECTIONS.LEADS.UPDATE :
        action === 'delete' ? SECTIONS.LEADS.DELETE :
        action === 'manage' ? SECTIONS.LEADS.MANAGE :
        SECTIONS.LEADS.VIEW,                             // Default to VIEW
        action
    );
};

// Funnel Management
const requireFunnelPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.FUNNELS.VIEW :
        action === 'write' ? SECTIONS.FUNNELS.CREATE :
        action === 'update' ? SECTIONS.FUNNELS.UPDATE :
        action === 'delete' ? SECTIONS.FUNNELS.DELETE :
        action === 'publish' ? SECTIONS.FUNNELS.PUBLISH :
        action === 'unpublish' ? SECTIONS.FUNNELS.UNPUBLISH :
        action === 'analytics' ? SECTIONS.FUNNELS.VIEW_ANALYTICS :
        action === 'manage_stages' ? SECTIONS.FUNNELS.MANAGE :
        SECTIONS.FUNNELS.MANAGE,
        action
    );
};

// Task Management (Dashboard-related)
const requireTaskPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.DASHBOARD.VIEW :
        action === 'write' ? SECTIONS.DASHBOARD.VIEW :
        action === 'update' ? SECTIONS.DASHBOARD.VIEW :
        action === 'delete' ? SECTIONS.DASHBOARD.VIEW :
        action === 'assign' ? SECTIONS.DASHBOARD.VIEW :
        SECTIONS.DASHBOARD.VIEW,
        action
    );
};

// Ads Management (Marketing)
const requireAdsPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.MARKETING.VIEW :
        action === 'write' ? SECTIONS.MARKETING.CREATE_CAMPAIGN :
        action === 'update' ? SECTIONS.MARKETING.UPDATE_CAMPAIGN :
        action === 'delete' ? SECTIONS.MARKETING.DELETE_CAMPAIGN :
        action === 'publish' ? SECTIONS.MARKETING.MANAGE :
        action === 'analytics' ? SECTIONS.MARKETING.VIEW_ANALYTICS :
        SECTIONS.MARKETING.MANAGE,
        action
    );
};

// WhatsApp Management (Messaging)
const requireWhatsAppPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.MESSAGING.VIEW :
        action === 'write' ? SECTIONS.MESSAGING.SEND :
        action === 'send' ? SECTIONS.MESSAGING.SEND :
        action === 'reply' ? SECTIONS.MESSAGING.REPLY :
        action === 'delete' ? SECTIONS.MESSAGING.DELETE :
        action === 'templates' ? SECTIONS.TEMPLATES.VIEW :
        SECTIONS.MESSAGING.MANAGE,
        action
    );
};

// Automation Management
const requireAutomationPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.AUTOMATION.VIEW :
        action === 'write' ? SECTIONS.AUTOMATION.CREATE :
        action === 'update' ? SECTIONS.AUTOMATION.UPDATE :
        action === 'delete' ? SECTIONS.AUTOMATION.DELETE :
        action === 'execute' ? SECTIONS.AUTOMATION.EXECUTE :
        SECTIONS.AUTOMATION.MANAGE,
        action
    );
};

// Calendar/Appointment Management
const requireCalendarPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.CALENDAR.VIEW :
        action === 'write' ? SECTIONS.CALENDAR.CREATE :
        action === 'update' ? SECTIONS.CALENDAR.UPDATE :
        action === 'delete' ? SECTIONS.CALENDAR.DELETE :
        action === 'book' ? SECTIONS.CALENDAR.BOOK :
        action === 'reschedule' ? SECTIONS.CALENDAR.RESCHEDULE :
        SECTIONS.CALENDAR.MANAGE,
        action
    );
};

// Performance/Analytics (Dashboard)
const requirePerformancePermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.DASHBOARD.VIEW :
        action === 'write' ? SECTIONS.DASHBOARD.VIEW :
        SECTIONS.DASHBOARD.VIEW,
        action
    );
};

// File Management (not in new structure, use dashboard)
const requireFilePermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.DASHBOARD.VIEW :
        action === 'write' ? SECTIONS.DASHBOARD.VIEW :
        action === 'delete' ? SECTIONS.DASHBOARD.VIEW :
        SECTIONS.DASHBOARD.VIEW,
        action
    );
};

// AI Features (not in new structure, use dashboard)
const requireAIPermission = (action = 'read') => {
    return requirePermission(
        action === 'read' ? SECTIONS.DASHBOARD.VIEW :
        action === 'write' ? SECTIONS.DASHBOARD.VIEW :
        SECTIONS.DASHBOARD.VIEW,
        action
    );
};

/**
 * Dashboard access permission checker
 * @param {string} section - Dashboard section (overview, leads, funnels, etc.)
 */
const requireDashboardPermission = (section = 'overview') => {
    return [
        protect,
        authorizeCoach('coach', 'staff'),
        StaffPermissionMiddleware.ensureCoachDataAccess(),
        StaffPermissionMiddleware.checkDashboardPermission(section)
    ];
};

/**
 * Get user context for controllers
 * Returns information about whether user is coach or staff with permissions
 */
const getUserContext = (req) => {
    return {
        userId: req.userId,
        coachId: req.coachId,
        role: req.role,
        isCoach: req.role === 'coach',
        isStaff: req.role === 'staff',
        staffInfo: req.staffInfo || null,
        permissions: req.staffInfo?.permissions || [],
        resourceFilter: req.resourceFilter || null
    };
};

/**
 * Helper function to check if staff has specific permission
 * @param {Object} req - Request object
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if staff has permission or user is coach
 */
const hasStaffPermission = (req, permission) => {
    if (req.role === 'coach') return true;
    if (req.role === 'staff') {
        return req.staffInfo?.permissions?.includes(permission) || false;
    }
    return false;
};

/**
 * Helper function to get coach ID for database queries
 * Returns the actual coach ID regardless of whether user is coach or staff
 * @param {Object} req - Request object
 * @returns {mongoose.Types.ObjectId|String} - Coach ID (preserves ObjectId type)
 */
const getCoachId = (req) => {
    // Return as-is to preserve ObjectId type for MongoDB queries
    // This ensures proper matching with ObjectId fields in database
    return req.coachId;
};

module.exports = {
    unifiedCoachAuth,
    requirePermission,
    checkResourceOwnership,
    filterResourcesByPermission,
    
    // Specific permission checkers
    requireLeadPermission,
    requireFunnelPermission,
    requireTaskPermission,
    requireAdsPermission,
    requireWhatsAppPermission,
    requireAutomationPermission,
    requireCalendarPermission,
    requirePerformancePermission,
    requireFilePermission,
    requireAIPermission,
    requireDashboardPermission,
    
    // Helper functions
    getUserContext,
    hasStaffPermission,
    getCoachId
};
