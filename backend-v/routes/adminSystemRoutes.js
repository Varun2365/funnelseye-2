const express = require('express');
const router = express.Router();
const adminSystemController = require('../controllers/adminSystemController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== ADMIN SYSTEM ROUTES =====

// @route   GET /api/admin/system/dashboard
// @desc    Get system dashboard data
// @access  Private (Admin)
router.get('/dashboard', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'),
    logAdminActivity('VIEW_DASHBOARD'),
    adminSystemController.getDashboard
);

// @route   GET /api/admin/system/health
// @desc    Get system health status
// @access  Private (Admin)
router.get('/health', 
    verifyAdminToken, 
    checkAdminPermission('systemLogs'),
    logAdminActivity('VIEW_SYSTEM_HEALTH'),
    adminSystemController.getSystemHealth
);

// @route   GET /api/admin/system/settings
// @desc    Get system settings
// @access  Private (Admin)
router.get('/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'),
    logAdminActivity('VIEW_SYSTEM_SETTINGS'),
    adminSystemController.getSystemSettings
);

// @route   PUT /api/admin/system/settings
// @desc    Update system settings
// @access  Private (Admin)
router.put('/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_SYSTEM_SETTINGS'),
    adminSystemController.updateSystemSettings
);

// @route   PATCH /api/admin/system/settings/:section
// @desc    Update specific settings section
// @access  Private (Admin)
router.patch('/settings/:section', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'),
    adminRateLimit(20, 5 * 60 * 1000), // 20 requests per 5 minutes
    logAdminActivity('UPDATE_SYSTEM_SETTINGS_SECTION'),
    adminSystemController.updateSettingsSection
);

// @route   POST /api/admin/system/maintenance
// @desc    Toggle maintenance mode
// @access  Private (Admin)
router.post('/maintenance', 
    verifyAdminToken, 
    checkAdminPermission('maintenanceMode'),
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity('TOGGLE_MAINTENANCE_MODE'),
    adminSystemController.toggleMaintenanceMode
);

// @route   GET /api/admin/system/logs
// @desc    Get system logs
// @access  Private (Admin)
router.get('/logs', 
    verifyAdminToken, 
    checkAdminPermission('systemLogs'),
    logAdminActivity('VIEW_SYSTEM_LOGS'),
    adminSystemController.getSystemLogs
);

// @route   DELETE /api/admin/system/logs
// @desc    Clear old system logs
// @access  Private (Admin)
router.delete('/logs', 
    verifyAdminToken, 
    checkAdminPermission('systemLogs'),
    adminRateLimit(5, 60 * 60 * 1000), // 5 requests per hour
    logAdminActivity('CLEAR_SYSTEM_LOGS'),
    adminSystemController.clearSystemLogs
);

// @route   GET /api/admin/system/analytics
// @desc    Get system analytics
// @access  Private (Admin)
router.get('/analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'),
    logAdminActivity('VIEW_SYSTEM_ANALYTICS'),
    adminSystemController.getSystemAnalytics
);

// @route   GET /api/admin/system/analytics/export
// @desc    Export system analytics
// @access  Private (Admin)
router.get('/analytics/export', 
    verifyAdminToken, 
    checkAdminPermission('exportData'),
    adminRateLimit(5, 60 * 60 * 1000), // 5 requests per hour
    logAdminActivity('EXPORT_SYSTEM_ANALYTICS'),
    adminSystemController.exportSystemAnalytics
);

module.exports = router;
