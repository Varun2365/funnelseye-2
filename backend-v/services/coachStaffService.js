const { getUserContext, hasStaffPermission, getCoachId } = require('../middleware/unifiedCoachAuth');
const { SECTIONS } = require('../utils/sectionPermissions');
const { PERMISSIONS } = require('../utils/unifiedPermissions');

/**
 * Coach-Staff Service
 * Provides helper functions for controllers to handle both coach and staff contexts
 */

class CoachStaffService {
    
    /**
     * Get the appropriate coach ID for database queries
     * @param {Object} req - Request object
     * @returns {string} - Coach ID
     */
    static getCoachIdForQuery(req) {
        return getCoachId(req);
    }

    /**
     * Get user context information
     * @param {Object} req - Request object
     * @returns {Object} - User context
     */
    static getUserContext(req) {
        return getUserContext(req);
    }

    /**
     * Check if user has specific permission
     * @param {Object} req - Request object
     * @param {string} permission - Permission to check
     * @returns {boolean} - True if user has permission
     */
    static hasPermission(req, permission) {
        return hasStaffPermission(req, permission);
    }

    /**
     * Build database query filter for resources
     * Ensures staff only see their coach's resources
     * @param {Object} req - Request object
     * @param {Object} additionalFilters - Additional filters to apply
     * @returns {Object} - Database query filter
     */
    static buildResourceFilter(req, additionalFilters = {}) {
        const coachId = this.getCoachIdForQuery(req);
        const context = this.getUserContext(req);

        // Base filter ensures resources belong to the coach
        const baseFilter = {
            coachId: coachId,
            ...additionalFilters
        };

        // If staff, apply permission-based filtering
        if (context.isStaff) {
            // Add permission-specific filters
            const permissionFilters = this.getPermissionFilters(req, additionalFilters);
            return {
                ...baseFilter,
                ...permissionFilters
            };
        }

        return baseFilter;
    }

    /**
     * Get permission-based filters for staff
     * @param {Object} req - Request object
     * @param {Object} additionalFilters - Additional filters
     * @returns {Object} - Permission-based filters
     */
    static getPermissionFilters(req, additionalFilters = {}) {
        const context = this.getUserContext(req);
        const filters = {};

        if (context.isStaff) {
            // IMPORTANT: Staff can only see leads assigned to them
            // Check if this is a lead-related query
            const isLeadQuery = req.path.includes('/lead') || additionalFilters._isLeadQuery;
            
            if (isLeadQuery) {
                // Staff can only see leads where:
                // 1. assignedTo matches their user ID, OR
                // 2. assignedStaffId matches their user ID (in appointment object)
                // 3. UNLESS they have MANAGE_ALL permission
                if (!this.hasPermission(req, SECTIONS.LEADS.MANAGE_ALL)) {
                    filters.$or = [
                        { assignedTo: context.userId },
                        { 'appointment.assignedStaffId': context.userId }
                    ];
                }
            }

            // If staff doesn't have delete permission, exclude deleted items
            if (!this.hasPermission(req, SECTIONS.LEADS.DELETE)) {
                filters.isDeleted = { $ne: true };
            }

            // Add more permission-based filters as needed
        }

        return filters;
    }

    /**
     * Filter response data based on user permissions
     * @param {Object} req - Request object
     * @param {Object|Array} data - Data to filter
     * @param {string} resourceType - Type of resource (leads, funnels, etc.)
     * @returns {Object|Array} - Filtered data
     */
    static filterResponseData(req, data, resourceType) {
        const context = this.getUserContext(req);

        // If coach, return all data
        if (context.isCoach) {
            return data;
        }

        // If staff, filter based on permissions
        if (context.isStaff) {
            return this.applyStaffDataFilters(req, data, resourceType);
        }

        return data;
    }

    /**
     * Apply staff-specific data filters
     * @param {Object} req - Request object
     * @param {Object|Array} data - Data to filter
     * @param {string} resourceType - Resource type
     * @returns {Object|Array} - Filtered data
     */
    static applyStaffDataFilters(req, data, resourceType) {
        const context = this.getUserContext(req);

        // Handle array of items
        if (Array.isArray(data)) {
            return data.map(item => this.filterSingleItem(req, item, resourceType));
        }

        // Handle single item
        return this.filterSingleItem(req, data, resourceType);
    }

    /**
     * Filter a single item based on staff permissions
     * @param {Object} req - Request object
     * @param {Object} item - Item to filter
     * @param {string} resourceType - Resource type
     * @returns {Object} - Filtered item
     */
    static filterSingleItem(req, item, resourceType) {
        if (!item || typeof item !== 'object') {
            return item;
        }

        const filteredItem = { ...item };

        // Remove sensitive fields based on permissions
        if (!this.hasPermission(req, PERMISSIONS.PERFORMANCE.READ)) {
            // Remove analytics and performance data
            delete filteredItem.analytics;
            delete filteredItem.performance;
            delete filteredItem.revenue;
            delete filteredItem.profit;
        }

        if (!this.hasPermission(req, PERMISSIONS.FILES.MANAGE)) {
            // Remove file management fields
            delete filteredItem.fileAccess;
            delete filteredItem.uploadPermissions;
        }

        // Resource-specific filtering
        switch (resourceType) {
            case 'leads':
                return this.filterLeadData(req, filteredItem);
            case 'funnels':
                return this.filterFunnelData(req, filteredItem);
            case 'ads':
                return this.filterAdsData(req, filteredItem);
            case 'tasks':
                return this.filterTaskData(req, filteredItem);
            case 'appointments':
                return this.filterAppointmentData(req, filteredItem);
            default:
                return filteredItem;
        }
    }

    /**
     * Filter lead data based on permissions
     */
    static filterLeadData(req, lead) {
        const filtered = { ...lead };

        if (!this.hasPermission(req, SECTIONS.LEADS.UPDATE)) {
            // Remove fields that require update permission
            delete filtered.lastContacted;
            delete filtered.notes;
        }

        if (!this.hasPermission(req, SECTIONS.LEADS.DELETE)) {
            // Remove delete-related fields
            delete filtered.deletedAt;
            delete filtered.deletedBy;
        }

        return filtered;
    }

    /**
     * Filter funnel data based on permissions
     */
    static filterFunnelData(req, funnel) {
        const filtered = { ...funnel };

        if (!this.hasPermission(req, SECTIONS.FUNNELS.VIEW_ANALYTICS)) {
            // Remove analytics data
            delete filtered.analytics;
            delete filtered.conversionRates;
            delete filtered.revenue;
        }

        if (!this.hasPermission(req, SECTIONS.FUNNELS.MANAGE)) {
            // Remove stage editing fields
            delete filtered.stagePermissions;
            delete filtered.editableStages;
        }

        return filtered;
    }
    
    /**
     * Build lead query filter that includes assignment check for staff
     * @param {Object} req - Request object
     * @param {Object} additionalFilters - Additional filters
     * @returns {Object} - Complete query filter
     */
    static buildLeadQueryFilter(req, additionalFilters = {}) {
        return this.buildResourceFilter(req, { ...additionalFilters, _isLeadQuery: true });
    }
    
    /**
     * Get messaging contacts filter for staff
     * Staff can message:
     * 1. Leads assigned to them
     * 2. Contacts they have previously messaged with
     * @param {Object} req - Request object
     * @returns {Object} - Messaging contact filter
     */
    static async buildMessagingContactFilter(req) {
        const context = this.getUserContext(req);
        
        if (context.isCoach) {
            // Coaches can message all their leads
            return { coachId: context.coachId };
        }
        
        if (context.isStaff) {
            const WhatsAppMessage = require('../schema/WhatsAppMessage');
            const EmailMessage = require('../schema/EmailMessage');
            
            // Get contacts the staff has previously messaged
            const [whatsappContacts, emailContacts] = await Promise.all([
                WhatsAppMessage.distinct('to', {
                    coachId: context.coachId,
                    senderId: context.userId,
                    senderType: 'staff'
                }),
                EmailMessage.distinct('to', {
                    coachId: context.coachId,
                    senderId: context.userId,
                    senderType: 'staff'
                })
            ]);
            
            const previouslyMessagedContacts = [...new Set([...whatsappContacts, ...emailContacts])];
            
            // Staff can see:
            // 1. Leads assigned to them
            // 2. Contacts they've previously messaged
            return {
                coachId: context.coachId,
                $or: [
                    { assignedTo: context.userId },
                    { 'appointment.assignedStaffId': context.userId },
                    { phone: { $in: previouslyMessagedContacts } },
                    { email: { $in: previouslyMessagedContacts } }
                ]
            };
        }
        
        return { coachId: context.coachId };
    }

    /**
     * Filter ads data based on permissions
     */
    static filterAdsData(req, ad) {
        const filtered = { ...ad };

        if (!this.hasPermission(req, PERMISSIONS.ADS.ANALYTICS)) {
            // Remove analytics data
            delete filtered.analytics;
            delete filtered.performance;
            delete filtered.cost;
        }

        if (!this.hasPermission(req, PERMISSIONS.ADS.UPDATE)) {
            // Remove update-related fields
            delete filtered.lastModified;
            delete filtered.modifiedBy;
        }

        return filtered;
    }

    /**
     * Filter task data based on permissions
     */
    static filterTaskData(req, task) {
        const filtered = { ...task };

        if (!this.hasPermission(req, PERMISSIONS.TASKS.ASSIGN)) {
            // Remove assignment fields
            delete filtered.assignedBy;
            delete filtered.assignmentHistory;
        }

        if (!this.hasPermission(req, PERMISSIONS.TASKS.UPDATE)) {
            // Remove update-related fields
            delete filtered.lastUpdated;
            delete filtered.updatedBy;
        }

        return filtered;
    }

    /**
     * Filter appointment data based on permissions
     */
    static filterAppointmentData(req, appointment) {
        const filtered = { ...appointment };

        if (!this.hasPermission(req, PERMISSIONS.APPOINTMENTS.RESCHEDULE)) {
            // Remove reschedule-related fields
            delete filtered.rescheduleHistory;
            delete filtered.rescheduleCount;
        }

        if (!this.hasPermission(req, PERMISSIONS.APPOINTMENTS.MANAGE)) {
            // Remove management fields
            delete filtered.managementNotes;
            delete filtered.internalNotes;
        }

        return filtered;
    }

    /**
     * Check if user can perform action on resource
     * @param {Object} req - Request object
     * @param {string} action - Action to perform
     * @param {string} resourceType - Type of resource
     * @returns {boolean} - True if action is allowed
     */
    static canPerformAction(req, action, resourceType) {
        const context = this.getUserContext(req);

        // Coaches can perform all actions
        if (context.isCoach) {
            return true;
        }

        // Check specific permissions for staff
        switch (resourceType) {
            case 'leads':
                return this.hasPermission(req, PERMISSIONS.LEADS[action.toUpperCase()] || PERMISSIONS.LEADS.MANAGE);
            case 'funnels':
                return this.hasPermission(req, PERMISSIONS.FUNNELS[action.toUpperCase()] || PERMISSIONS.FUNNELS.MANAGE);
            case 'ads':
                return this.hasPermission(req, PERMISSIONS.ADS[action.toUpperCase()] || PERMISSIONS.ADS.MANAGE);
            case 'tasks':
                return this.hasPermission(req, PERMISSIONS.TASKS[action.toUpperCase()] || PERMISSIONS.TASKS.MANAGE);
            case 'appointments':
                return this.hasPermission(req, PERMISSIONS.APPOINTMENTS[action.toUpperCase()] || PERMISSIONS.APPOINTMENTS.MANAGE);
            default:
                return false;
        }
    }

    /**
     * Get staff permissions for frontend
     * @param {Object} req - Request object
     * @returns {Object} - Staff permissions object
     */
    static getStaffPermissions(req) {
        const context = this.getUserContext(req);

        if (context.isCoach) {
            // Return all permissions for coaches
            return {
                isCoach: true,
                permissions: Object.values(PERMISSIONS).flatMap(group => Object.values(group)),
                canAccessAll: true
            };
        }

        if (context.isStaff) {
            return {
                isStaff: true,
                permissions: context.permissions,
                canAccessAll: false,
                coachId: context.coachId
            };
        }

        return {
            permissions: [],
            canAccessAll: false
        };
    }

    /**
     * Log staff action for audit trail
     * @param {Object} req - Request object
     * @param {string} action - Action performed
     * @param {string} resourceType - Type of resource
     * @param {string} resourceId - ID of resource
     * @param {Object} details - Additional details
     */
    static logStaffAction(req, action, resourceType, resourceId, details = {}) {
        const context = this.getUserContext(req);

        if (context.isStaff) {
            console.log(`[Staff Action] ${context.userId} (Staff) performed ${action} on ${resourceType} ${resourceId}`, {
                staffId: context.userId,
                coachId: context.coachId,
                action,
                resourceType,
                resourceId,
                permissions: context.permissions,
                timestamp: new Date().toISOString(),
                ...details
            });
        }
    }
}

module.exports = CoachStaffService;
