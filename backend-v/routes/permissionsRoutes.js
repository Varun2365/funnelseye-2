const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { PERMISSIONS, getPermissionsGroupedByCategory } = require('../utils/unifiedPermissions');

/**
 * Get all available permissions
 * @route GET /api/permissions
 * @access Private (Any authenticated user)
 */
router.get('/', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                permissions: PERMISSIONS,
                permissionGroups: PERMISSION_GROUPS,
                metadata: {
                    totalPermissions: Object.values(PERMISSIONS).flatMap(group => Object.values(group)).length,
                    totalGroups: Object.keys(PERMISSION_GROUPS).length,
                    lastUpdated: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions'
        });
    }
});

/**
 * Get permission groups only
 * @route GET /api/permissions/groups
 * @access Private (Any authenticated user)
 */
router.get('/groups', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                permissionGroups: PERMISSION_GROUPS,
                metadata: {
                    totalGroups: Object.keys(PERMISSION_GROUPS).length,
                    lastUpdated: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Error fetching permission groups:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching permission groups'
        });
    }
});

/**
 * Get permissions for a specific section
 * @route GET /api/permissions/section/:section
 * @access Private (Any authenticated user)
 */
router.get('/section/:section', protect, async (req, res) => {
    try {
        const { section } = req.params;
        const sectionPermissions = PERMISSIONS[section.toUpperCase()];
        
        if (!sectionPermissions) {
            return res.status(404).json({
                success: false,
                message: `Section '${section}' not found`
            });
        }

        res.json({
            success: true,
            data: {
                section: section.toLowerCase(),
                permissions: sectionPermissions,
                metadata: {
                    totalPermissions: Object.keys(sectionPermissions).length,
                    lastUpdated: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Error fetching section permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching section permissions'
        });
    }
});

module.exports = router;
