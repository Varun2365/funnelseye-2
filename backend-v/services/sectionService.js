/**
 * Section Service
 * Helper functions for section-based permission operations
 */

const { 
    hasSection, 
    SECTIONS,
    SECTION_METADATA,
    hasLeadPermission,
    canViewAllLeads,
    getLeadPermissions
} = require('../utils/sectionPermissions');

/**
 * Get coach ID for database queries
 * Works for both coach and staff tokens
 */
function getCoachIdForQuery(req) {
    return req.coachId;
}

/**
 * Get user context from request
 */
function getUserContext(req) {
    return req.userContext || {
        isStaff: false,
        userId: req.userId?.toString(),
        coachId: req.coachId?.toString(),
        sections: req.sections || [],
        name: req.user?.name,
        email: req.user?.email
    };
}

/**
 * Check if user has access to a section
 */
function hasSectionAccess(req, section) {
    if (req.role === 'coach') return true;
    return hasSection(req.sections || [], section);
}

/**
 * Filter response data based on section access
 * Returns "No data found" if staff doesn't have access
 */
function filterResponseData(req, data, section) {
    // Coach sees everything
    if (req.role === 'coach') {
        return data;
    }

    // Check if staff has section access
    if (!hasSection(req.sections || [], section)) {
        return { message: 'No data found' };
    }

    return data;
}

/**
 * Log staff action for audit trail
 */
async function logStaffAction(req, action, details = {}) {
    // Only log for staff, not coaches
    if (req.role !== 'staff') return;

    const logEntry = {
        staffId: req.userId,
        coachId: req.coachId,
        action,
        details,
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('user-agent')
    };

    console.log('[Staff Action]', JSON.stringify(logEntry, null, 2));

    // TODO: Store in database if needed
    // await StaffActionLog.create(logEntry);
}

/**
 * Build resource filter for database queries
 * Ensures staff only access their coach's resources
 * For leads, staff only see their assigned leads
 */
function buildResourceFilter(req, additionalFilters = {}) {
    const baseFilter = {
        coachId: req.coachId,
        ...additionalFilters
    };

    // If staff is accessing leads, filter by assigned staff
    if (req.role === 'staff' && req.path && req.path.includes('/leads')) {
        baseFilter.assignedTo = req.userId;
    }

    return baseFilter;
}

/**
 * Build lead-specific filter
 * Staff only see leads assigned to them (unless they have MANAGE_ALL permission)
 */
function buildLeadFilter(req, additionalFilters = {}) {
    const baseFilter = {
        coachId: req.coachId,
        ...additionalFilters
    };

    // Staff only see their assigned leads (unless they have MANAGE_ALL)
    if (req.role === 'staff') {
        // Check if staff has MANAGE_ALL permission
        const hasManageAll = canViewAllLeads(req.sections || []);
        
        if (!hasManageAll) {
            // Staff only see their assigned leads
            baseFilter.assignedTo = req.userId;
        }
        // If hasManageAll, staff can see all coach's leads
    }

    return baseFilter;
}

/**
 * Check if staff has specific lead permission
 * @param {Object} req - Request object
 * @param {string} permission - Lead permission to check
 * @returns {boolean} - True if has permission
 */
function hasLeadPermissionCheck(req, permission) {
    if (req.role === 'coach') return true;
    return hasLeadPermission(req.sections || [], permission);
}

/**
 * Get staff's lead permissions
 * @param {Object} req - Request object
 * @returns {Object} - Lead permissions object
 */
function getStaffLeadPermissions(req) {
    if (req.role === 'coach') {
        return {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canAssign: true,
            canExport: true,
            canManageAll: true
        };
    }
    return getLeadPermissions(req.sections || []);
}

/**
 * Check multiple sections (any one required)
 */
function hasAnySectionAccess(req, sections) {
    if (req.role === 'coach') return true;
    return sections.some(section => hasSection(req.sections || [], section));
}

/**
 * Check multiple sections (all required)
 */
function hasAllSectionAccess(req, sections) {
    if (req.role === 'coach') return true;
    return sections.every(section => hasSection(req.sections || [], section));
}

/**
 * Get accessible sections for user
 */
function getAccessibleSections(req) {
    if (req.role === 'coach') {
        return Object.values(SECTIONS);
    }
    return req.sections || [];
}

/**
 * Get section metadata
 */
function getSectionMetadata(section) {
    return SECTION_METADATA[section] || null;
}

/**
 * Check if section is coach-only
 */
function isCoachOnlySection(section) {
    const metadata = SECTION_METADATA[section];
    return metadata && metadata.coachOnly === true;
}

/**
 * Format "No data found" response
 */
function noDataResponse(section = null) {
    const response = {
        success: true,
        message: 'No data found',
        data: []
    };

    if (section) {
        response.section = section;
        response.hint = 'You may not have permission to view this data';
    }

    return response;
}

/**
 * Format permission denied response
 */
function permissionDeniedResponse(section) {
    return {
        success: false,
        message: 'You do not have permission to access this section',
        section: section,
        sectionName: SECTION_METADATA[section]?.name || section
    };
}

/**
 * Enrich response with user context
 */
function enrichResponseWithContext(req, data) {
    return {
        ...data,
        userContext: getUserContext(req)
    };
}

/**
 * Check if user is staff
 */
function isStaff(req) {
    return req.role === 'staff';
}

/**
 * Check if user is coach
 */
function isCoach(req) {
    return req.role === 'coach';
}

/**
 * Get user ID
 */
function getUserId(req) {
    return req.userId;
}

/**
 * Get staff ID (only for staff)
 */
function getStaffId(req) {
    return req.role === 'staff' ? req.staffId : null;
}

module.exports = {
    // Core functions
    getCoachIdForQuery,
    getUserContext,
    hasSectionAccess,
    filterResponseData,
    logStaffAction,
    buildResourceFilter,
    buildLeadFilter,
    
    // Lead-specific functions
    hasLeadPermissionCheck,
    getStaffLeadPermissions,
    
    // Multi-section checks
    hasAnySectionAccess,
    hasAllSectionAccess,
    getAccessibleSections,
    
    // Metadata and validation
    getSectionMetadata,
    isCoachOnlySection,
    
    // Response helpers
    noDataResponse,
    permissionDeniedResponse,
    enrichResponseWithContext,
    
    // User type checks
    isStaff,
    isCoach,
    getUserId,
    getStaffId
};

