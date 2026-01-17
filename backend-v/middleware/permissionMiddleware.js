/**
 * Permission Middleware for Staff Access Control
 * Handles permission-based access control for staff members
 */

const { hasPermission, hasAnyPermission, hasAllPermissions } = require('../utils/unifiedPermissions');

/**
 * Middleware to check if staff has a specific permission
 * @param {string} requiredPermission - Required permission
 * @returns {Function} - Express middleware function
 */
function requirePermission(requiredPermission) {
    return (req, res, next) => {
        try {
            // Skip permission check for admin/super_admin
            // Check both req.role (for staff) and req.admin.role (for admin)
            if (req.role === 'admin' || req.role === 'super_admin' || 
                req.admin?.role === 'admin' || req.admin?.role === 'super_admin') {
                return next();
            }

            // For coaches, they have full access to their own data
            if (req.role === 'coach') {
                return next();
            }

            // For staff, check permissions
            if (req.role === 'staff') {
                if (!req.staffPermissions || !Array.isArray(req.staffPermissions)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff permissions not found'
                    });
                }

                if (hasPermission(req.staffPermissions, requiredPermission)) {
                    return next();
                }

                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required: ${requiredPermission}`,
                    requiredPermission,
                    currentPermissions: req.staffPermissions
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });

        } catch (error) {
            console.error('Permission middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
}

/**
 * Middleware to check if staff has any of the required permissions
 * @param {string[]} requiredPermissions - Array of required permissions (any one)
 * @returns {Function} - Express middleware function
 */
function requireAnyPermission(requiredPermissions) {
    return (req, res, next) => {
        try {
            // Skip permission check for admin/super_admin
            if (req.role === 'admin' || req.role === 'super_admin') {
                return next();
            }

            // For coaches, they have full access to their own data
            if (req.role === 'coach') {
                return next();
            }

            // For staff, check permissions
            if (req.role === 'staff') {
                if (!req.staffPermissions || !Array.isArray(req.staffPermissions)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff permissions not found'
                    });
                }

                if (hasAnyPermission(req.staffPermissions, requiredPermissions)) {
                    return next();
                }

                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required one of: ${requiredPermissions.join(', ')}`,
                    requiredPermissions,
                    currentPermissions: req.staffPermissions
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });

        } catch (error) {
            console.error('Permission middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
}

/**
 * Middleware to check if staff has all required permissions
 * @param {string[]} requiredPermissions - Array of required permissions (all)
 * @returns {Function} - Express middleware function
 */
function requireAllPermissions(requiredPermissions) {
    return (req, res, next) => {
        try {
            // Skip permission check for admin/super_admin
            if (req.role === 'admin' || req.role === 'super_admin') {
                return next();
            }

            // For coaches, they have full access to their own data
            if (req.role === 'coach') {
                return next();
            }

            // For staff, check permissions
            if (req.role === 'staff') {
                if (!req.staffPermissions || !Array.isArray(req.staffPermissions)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff permissions not found'
                    });
                }

                if (hasAllPermissions(req.staffPermissions, requiredPermissions)) {
                    return next();
                }

                return res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required all: ${requiredPermissions.join(', ')}`,
                    requiredPermissions,
                    currentPermissions: req.staffPermissions
                });
            }

            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });

        } catch (error) {
            console.error('Permission middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
}

/**
 * Middleware to check if staff has permission to access coach's data
 * @param {string} requiredPermission - Required permission
 * @returns {Function} - Express middleware function
 */
function requireCoachAccess(requiredPermission) {
    return (req, res, next) => {
        try {
            // Skip permission check for admin/super_admin
            if (req.role === 'admin' || req.role === 'super_admin') {
                return next();
            }

            // For coaches, they have full access to their own data
            if (req.role === 'coach') {
                return next();
            }

            // For staff, check permissions and coach ownership
            if (req.role === 'staff') {
                if (!req.staffPermissions || !Array.isArray(req.staffPermissions)) {
                    return res.status(403).json({
                        success: false,
                        message: 'Staff permissions not found'
                    });
                }

                // Check if staff has required permission
                if (!hasPermission(req.staffPermissions, requiredPermission)) {
                    return res.status(403).json({
                        success: false,
                        message: `Insufficient permissions. Required: ${requiredPermission}`,
                        requiredPermission,
                        currentPermissions: req.staffPermissions
                    });
                }

                // Check if staff is accessing their own coach's data
                if (req.coachId && req.staffCoachId && req.coachId.toString() !== req.staffCoachId.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied: Can only access own coach\'s data'
                    });
                }

                return next();
            }

            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });

        } catch (error) {
            console.error('Coach access middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
}

/**
 * Middleware to populate staff permissions in request
 * This should be used after authentication middleware
 */
function populateStaffPermissions(req, res, next) {
    try {
        if (req.role === 'staff') {
            // Staff permissions should already be populated by auth middleware
            // This is a safety check
            if (!req.staffPermissions) {
                req.staffPermissions = req.user?.permissions || [];
            }
        }
        next();
    } catch (error) {
        console.error('Populate staff permissions error:', error);
        next();
    }
}

module.exports = {
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireCoachAccess,
    populateStaffPermissions
};
