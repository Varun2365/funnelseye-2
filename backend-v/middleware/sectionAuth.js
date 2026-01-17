/**
 * Section-Based Authentication Middleware
 * Simplified permission system where staff get full access to sections
 */

const jwt = require('jsonwebtoken');
const User = require('../schema/User');
const Staff = require('../schema/Staff');
const { 
    hasSection, 
    isCoachOnly, 
    getSectionForRoute,
    SECTIONS,
    SECTION_METADATA 
} = require('../utils/sectionPermissions');

/**
 * Unified authentication for both coach and staff
 * Populates req.user, req.coachId, req.userId, req.userContext
 */
const unifiedSectionAuth = () => {
    return async (req, res, next) => {
        try {
            let token;

            // Extract token from Authorization header
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized to access this route'
                });
            }

            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Fetch user
                const user = await User.findById(decoded.id).select('-password');

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not found'
                    });
                }

                // Check if user is staff
                if (user.role === 'staff') {
                    const staff = await Staff.findById(user._id);
                    
                    if (!staff) {
                        return res.status(401).json({
                            success: false,
                            message: 'Staff record not found'
                        });
                    }

                    if (!staff.isActive) {
                        return res.status(403).json({
                            success: false,
                            message: 'Staff account is inactive'
                        });
                    }

                    // Set request properties for staff
                    req.user = user;
                    req.coachId = staff.coachId;
                    req.userId = user._id;
                    req.staffId = user._id;
                    req.role = 'staff';
                    req.sections = staff.permissions || []; // Reuse permissions field for sections
                    req.userContext = {
                        isStaff: true,
                        userId: user._id.toString(),
                        coachId: staff.coachId.toString(),
                        sections: staff.permissions || [],
                        name: user.name,
                        email: user.email
                    };
                } else if (user.role === 'coach') {
                    // Set request properties for coach
                    req.user = user;
                    req.coachId = user._id;
                    req.userId = user._id;
                    req.role = 'coach';
                    req.sections = Object.values(SECTIONS); // Coach has all sections
                    req.userContext = {
                        isStaff: false,
                        userId: user._id.toString(),
                        coachId: user._id.toString(),
                        sections: Object.values(SECTIONS),
                        name: user.name,
                        email: user.email
                    };
                } else {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. Only coaches and staff can access this route.'
                    });
                }

                next();
            } catch (error) {
                console.error('Token verification error:', error);
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized to access this route'
                });
            }
        } catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error during authentication'
            });
        }
    };
};

/**
 * Require specific section access
 * @param {string} requiredSection - Section that user must have access to
 */
const requireSection = (requiredSection) => {
    return (req, res, next) => {
        // Coach always has access (except subscription check is handled separately)
        if (req.role === 'coach') {
            return next();
        }

        // Check if section is coach-only
        if (isCoachOnly(requiredSection)) {
            return res.status(403).json({
                success: false,
                message: 'This section is only accessible to coaches',
                section: requiredSection
            });
        }

        // Check if staff has section access
        if (!hasSection(req.sections, requiredSection)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this section',
                section: requiredSection,
                requiredSection: SECTION_METADATA[requiredSection]?.name || requiredSection
            });
        }

        next();
    };
};

/**
 * Filter resources by section access
 * Automatically determines section from route and checks access
 */
const filterBySection = () => {
    return (req, res, next) => {
        // Coach always has access
        if (req.role === 'coach') {
            return next();
        }

        // Determine section from route
        const section = getSectionForRoute(req.path);
        
        if (!section) {
            // If we can't determine section, allow access
            // (Public routes or routes that don't need section checking)
            return next();
        }

        // Check if section is coach-only
        if (isCoachOnly(section)) {
            return res.status(403).json({
                success: false,
                message: 'This section is only accessible to coaches',
                section: section
            });
        }

        // Check if staff has section access
        if (!hasSection(req.sections, section)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this section',
                section: section,
                requiredSection: SECTION_METADATA[section]?.name || section
            });
        }

        next();
    };
};

/**
 * Block subscription access for staff
 * Returns "permission not found" message
 */
const blockSubscriptionForStaff = () => {
    return (req, res, next) => {
        if (req.role === 'staff') {
            return res.status(403).json({
                success: false,
                message: 'Permission not found. Subscription management is only available to coaches.',
                section: SECTIONS.SUBSCRIPTION
            });
        }
        next();
    };
};

/**
 * Get user context helper
 * @param {Object} req - Request object
 * @returns {Object} - User context
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
 * Check if user has section access
 * @param {Object} req - Request object
 * @param {string} section - Section to check
 * @returns {boolean} - True if has access
 */
function hasSectionAccess(req, section) {
    if (req.role === 'coach') return true;
    return hasSection(req.sections || [], section);
}

/**
 * Get coach ID for queries
 * @param {Object} req - Request object
 * @returns {string} - Coach ID
 */
function getCoachId(req) {
    return req.coachId;
}

/**
 * Filter response data based on section access
 * @param {Object} req - Request object
 * @param {Object} data - Response data
 * @param {string} section - Section to check
 * @returns {Object} - Filtered data or "No data found" message
 */
function filterResponseBySection(req, data, section) {
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

module.exports = {
    unifiedSectionAuth,
    requireSection,
    filterBySection,
    blockSubscriptionForStaff,
    getUserContext,
    hasSectionAccess,
    getCoachId,
    filterResponseBySection
};

