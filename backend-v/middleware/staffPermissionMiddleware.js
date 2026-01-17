const { hasPermission, hasAnyPermission, hasAllPermissions, PERMISSIONS } = require('../utils/unifiedPermissions');
const Staff = require('../schema/Staff');
const logger = require('../utils/logger');

/**
 * Staff Permission Middleware
 * Checks if staff members have the required permissions to access coach routes
 * This allows staff to use the same frontend and APIs as coaches with proper permission control
 */

class StaffPermissionMiddleware {
    
    /**
     * Check if user has required permission for a specific action
     * @param {string|string[]} requiredPermissions - Single permission or array of permissions
     * @param {string} action - Action type (read, write, update, delete, manage)
     * @returns {Function} - Express middleware function
     */
    static checkPermission(requiredPermissions, action = 'read') {
        return async (req, res, next) => {
            try {
                // If user is not staff, skip permission check (coach/admin have full access)
                if (req.role !== 'staff') {
                    return next();
                }

                // Get staff user with permissions
                const staff = await Staff.findById(req.userId).select('permissions isActive coachId');
                
                if (!staff) {
                    return res.status(404).json({
                        success: false,
                        message: 'Staff member not found'
                    });
                }

                if (!staff.isActive) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff account is inactive'
                    });
                }

                // Ensure staff can only access their coach's data
                if (staff.coachId.toString() !== req.coachId.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied: You can only access your coach\'s data'
                    });
                }

                const staffPermissions = staff.permissions || [];
                let hasRequiredPermission = false;

                // Check permissions based on type
                if (typeof requiredPermissions === 'string') {
                    hasRequiredPermission = hasPermission(staffPermissions, requiredPermissions);
                } else if (Array.isArray(requiredPermissions)) {
                    // If array, check if staff has any of the required permissions
                    hasRequiredPermission = hasAnyPermission(staffPermissions, requiredPermissions);
                }

                if (!hasRequiredPermission) {
                    return res.status(403).json({
                        success: false,
                        message: `Insufficient permissions. Required: ${Array.isArray(requiredPermissions) ? requiredPermissions.join(' or ') : requiredPermissions}`,
                        error: 'INSUFFICIENT_PERMISSIONS',
                        requiredPermissions: Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions],
                        staffPermissions: staffPermissions,
                        action: action
                    });
                }

                // Add staff info to request for use in controllers
                req.staffInfo = {
                    staffId: staff._id,
                    coachId: staff.coachId,
                    permissions: staffPermissions
                };

                next();

            } catch (error) {
                logger.error('[StaffPermissionMiddleware] Error checking permissions:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error checking staff permissions'
                });
            }
        };
    }

    /**
     * Check if staff has permission to manage leads
     */
    static checkLeadPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.LEADS.READ,
            'write': PERMISSIONS.LEADS.WRITE,
            'update': PERMISSIONS.LEADS.UPDATE,
            'delete': PERMISSIONS.LEADS.DELETE,
            'manage': PERMISSIONS.LEADS.MANAGE
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.LEADS.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage funnels
     */
    static checkFunnelPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.FUNNELS.READ,
            'write': PERMISSIONS.FUNNELS.WRITE,
            'update': PERMISSIONS.FUNNELS.UPDATE,
            'delete': PERMISSIONS.FUNNELS.DELETE,
            'manage': PERMISSIONS.FUNNELS.MANAGE,
            'view_analytics': PERMISSIONS.FUNNELS.VIEW_ANALYTICS,
            'edit_stages': PERMISSIONS.FUNNELS.EDIT_STAGES,
            'manage_stages': PERMISSIONS.FUNNELS.MANAGE_STAGES,
            'publish': PERMISSIONS.FUNNELS.PUBLISH,
            'unpublish': PERMISSIONS.FUNNELS.UNPUBLISH
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.FUNNELS.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage tasks
     */
    static checkTaskPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.TASKS.READ,
            'write': PERMISSIONS.TASKS.WRITE,
            'update': PERMISSIONS.TASKS.UPDATE,
            'delete': PERMISSIONS.TASKS.DELETE,
            'manage': PERMISSIONS.TASKS.MANAGE,
            'assign': PERMISSIONS.TASKS.ASSIGN
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.TASKS.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage calendar/appointments
     */
    static checkCalendarPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.CALENDAR.READ,
            'write': PERMISSIONS.CALENDAR.WRITE,
            'update': PERMISSIONS.CALENDAR.UPDATE,
            'delete': PERMISSIONS.CALENDAR.DELETE,
            'manage': PERMISSIONS.CALENDAR.MANAGE,
            'book': PERMISSIONS.CALENDAR.BOOK
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.CALENDAR.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage appointments
     */
    static checkAppointmentPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.APPOINTMENTS.READ,
            'write': PERMISSIONS.APPOINTMENTS.WRITE,
            'update': PERMISSIONS.APPOINTMENTS.UPDATE,
            'delete': PERMISSIONS.APPOINTMENTS.DELETE,
            'manage': PERMISSIONS.APPOINTMENTS.MANAGE,
            'book': PERMISSIONS.APPOINTMENTS.BOOK,
            'reschedule': PERMISSIONS.APPOINTMENTS.RESCHEDULE
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.APPOINTMENTS.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage ads/campaigns
     */
    static checkAdsPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.ADS.READ,
            'write': PERMISSIONS.ADS.WRITE,
            'update': PERMISSIONS.ADS.UPDATE,
            'delete': PERMISSIONS.ADS.DELETE,
            'manage': PERMISSIONS.ADS.MANAGE,
            'publish': PERMISSIONS.ADS.PUBLISH,
            'analytics': PERMISSIONS.ADS.ANALYTICS
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.ADS.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage WhatsApp
     */
    static checkWhatsAppPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.WHATSAPP.READ,
            'write': PERMISSIONS.WHATSAPP.WRITE,
            'send': PERMISSIONS.WHATSAPP.SEND,
            'manage': PERMISSIONS.WHATSAPP.MANAGE,
            'templates': PERMISSIONS.WHATSAPP.TEMPLATES
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.WHATSAPP.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage automation
     */
    static checkAutomationPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.AUTOMATION.READ,
            'write': PERMISSIONS.AUTOMATION.WRITE,
            'update': PERMISSIONS.AUTOMATION.UPDATE,
            'delete': PERMISSIONS.AUTOMATION.DELETE,
            'manage': PERMISSIONS.AUTOMATION.MANAGE,
            'execute': PERMISSIONS.AUTOMATION.EXECUTE
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.AUTOMATION.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to view performance/analytics
     */
    static checkPerformancePermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.PERFORMANCE.READ,
            'write': PERMISSIONS.PERFORMANCE.WRITE,
            'manage': PERMISSIONS.PERFORMANCE.MANAGE
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.PERFORMANCE.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage files
     */
    static checkFilePermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.FILES.READ,
            'write': PERMISSIONS.FILES.WRITE,
            'delete': PERMISSIONS.FILES.DELETE,
            'manage': PERMISSIONS.FILES.MANAGE
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.FILES.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to use AI features
     */
    static checkAIPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.AI.READ,
            'write': PERMISSIONS.AI.WRITE,
            'manage': PERMISSIONS.AI.MANAGE
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.AI.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to manage staff (for staff management features)
     */
    static checkStaffManagementPermission(action = 'read') {
        const permissionMap = {
            'read': PERMISSIONS.STAFF.READ,
            'write': PERMISSIONS.STAFF.WRITE,
            'update': PERMISSIONS.STAFF.UPDATE,
            'delete': PERMISSIONS.STAFF.DELETE,
            'manage': PERMISSIONS.STAFF.MANAGE
        };

        const requiredPermission = permissionMap[action] || PERMISSIONS.STAFF.READ;
        return this.checkPermission(requiredPermission, action);
    }

    /**
     * Check if staff has permission to access dashboard sections
     * This is a general permission check for dashboard access
     */
    static checkDashboardPermission(section = 'overview') {
        const sectionPermissions = {
            'overview': [PERMISSIONS.PERFORMANCE.READ],
            'leads': [PERMISSIONS.LEADS.READ],
            'funnels': [PERMISSIONS.FUNNELS.READ],
            'tasks': [PERMISSIONS.TASKS.READ],
            'calendar': [PERMISSIONS.CALENDAR.READ, PERMISSIONS.APPOINTMENTS.READ],
            'appointments': [PERMISSIONS.APPOINTMENTS.READ],
            'marketing': [PERMISSIONS.ADS.READ, PERMISSIONS.WHATSAPP.READ],
            'ads': [PERMISSIONS.ADS.READ],
            'whatsapp': [PERMISSIONS.WHATSAPP.READ],
            'automation': [PERMISSIONS.AUTOMATION.READ],
            'team': [PERMISSIONS.STAFF.READ],
            'performance': [PERMISSIONS.PERFORMANCE.READ],
            'financial': [PERMISSIONS.PERFORMANCE.READ], // Financial data is part of performance
            'files': [PERMISSIONS.FILES.READ],
            'ai': [PERMISSIONS.AI.READ]
        };

        const requiredPermissions = sectionPermissions[section] || [PERMISSIONS.PERFORMANCE.READ];
        return this.checkPermission(requiredPermissions, 'read');
    }

    /**
     * Middleware to ensure staff can only access their coach's data
     * This should be used on all coach routes
     */
    static ensureCoachDataAccess() {
        return async (req, res, next) => {
            try {
                // If user is not staff, skip this check
                if (req.role !== 'staff') {
                    return next();
                }

                // Get staff user
                const staff = await Staff.findById(req.userId).select('coachId isActive');
                
                if (!staff || !staff.isActive) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff access denied'
                    });
                }

                // Ensure staff can only access their coach's data
                if (staff.coachId.toString() !== req.coachId.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied: You can only access your coach\'s data'
                    });
                }

                // Add staff info to request
                req.staffInfo = {
                    staffId: staff._id,
                    coachId: staff.coachId
                };

                next();

            } catch (error) {
                logger.error('[StaffPermissionMiddleware] Error in ensureCoachDataAccess:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error validating staff access'
                });
            }
        };
    }

    /**
     * Get staff permissions for a specific user
     * Useful for frontend to show/hide features based on permissions
     */
    static async getStaffPermissions(staffId) {
        try {
            const staff = await Staff.findById(staffId).select('permissions isActive coachId');
            
            if (!staff || !staff.isActive) {
                return null;
            }

            return {
                permissions: staff.permissions || [],
                coachId: staff.coachId,
                isActive: staff.isActive
            };
        } catch (error) {
            logger.error('[StaffPermissionMiddleware] Error getting staff permissions:', error);
            return null;
        }
    }
}

module.exports = StaffPermissionMiddleware;
