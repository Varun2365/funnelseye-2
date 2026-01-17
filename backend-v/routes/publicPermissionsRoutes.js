const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/async');
const { 
    SECTIONS,
    SECTION_METADATA,
    PERMISSION_PRESETS,
    getAllValidPermissions,
    getSectionsGroupedByCategory,
    getAvailablePresets 
} = require('../utils/sectionPermissions');

/**
 * Get all available permissions (PUBLIC ROUTE)
 * This route shows all permissions that can be assigned to staff
 * @route GET /api/public/permissions
 * @access Public
 */
router.get('/permissions', asyncHandler(async (req, res) => {
    // Get all permissions grouped by category
    const groupedPermissions = getSectionsGroupedByCategory();
    
    // Get all valid permissions (flat list)
    const allPermissions = getAllValidPermissions();
    
    // Get available presets
    const presetNames = getAvailablePresets();
    const presets = {};
    
    for (const presetName of presetNames) {
        presets[presetName] = {
            name: presetName,
            permissions: PERMISSION_PRESETS[presetName],
            permissionCount: PERMISSION_PRESETS[presetName].length,
            description: `${presetName} role preset`
        };
    }
    
    // Format permissions by category
    const permissionsByCategory = {};
    
    for (const [category, sections] of Object.entries(groupedPermissions)) {
        permissionsByCategory[category] = {
            category: category,
            permissions: sections.map(s => ({
                permission: s.section,
                name: s.name,
                description: s.description,
                icon: s.icon || '📋',
                alwaysAccessible: s.alwaysAccessible || false,
                coachOnly: s.coachOnly || false,
                isAdvanced: s.isAdvanced || false
            }))
        };
    }
    
    res.json({
        success: true,
        data: {
            totalPermissions: allPermissions.length,
            totalCategories: Object.keys(permissionsByCategory).length,
            totalPresets: presetNames.length,
            categories: permissionsByCategory,
            presets: presets,
            allPermissions: allPermissions
        }
    });
}));

/**
 * Get permission presets (PUBLIC ROUTE)
 * @route GET /api/public/permissions/presets
 * @access Public
 */
router.get('/permissions/presets', asyncHandler(async (req, res) => {
    const presetNames = getAvailablePresets();
    const presets = {};
    
    for (const presetName of presetNames) {
        presets[presetName] = {
            name: presetName,
            permissions: PERMISSION_PRESETS[presetName],
            permissionCount: PERMISSION_PRESETS[presetName].length,
            description: `${presetName} role - ${PERMISSION_PRESETS[presetName].length} permissions`,
            
            // Add categorized permissions
            categorized: {}
        };
        
        // Group permissions by their prefix
        PERMISSION_PRESETS[presetName].forEach(perm => {
            const category = perm.split(':')[0];
            if (!presets[presetName].categorized[category]) {
                presets[presetName].categorized[category] = [];
            }
            presets[presetName].categorized[category].push(perm);
        });
    }
    
    res.json({
        success: true,
        data: {
            totalPresets: presetNames.length,
            presets: presets,
            presetNames: presetNames
        }
    });
}));

module.exports = router;

