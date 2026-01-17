const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== ADMIN USER MANAGEMENT ROUTES =====

// @route   GET /api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin)
router.get('/', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    logAdminActivity('VIEW_USERS'),
    adminUserController.getUsers
);

// @route   GET /api/admin/users/analytics
// @desc    Get user analytics
// @access  Private (Admin)
router.get('/analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'),
    logAdminActivity('VIEW_USER_ANALYTICS'),
    adminUserController.getUserAnalytics
);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/:id', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    logAdminActivity('VIEW_USER_DETAILS'),
    adminUserController.getUserById
);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/:id', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(20, 5 * 60 * 1000), // 20 requests per 5 minutes
    logAdminActivity('UPDATE_USER'),
    adminUserController.updateUser
);

// @route   PATCH /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.patch('/:id/status', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_USER_STATUS'),
    adminUserController.updateUserStatus
);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin)
router.delete('/:id', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity('DELETE_USER'),
    adminUserController.deleteUser
);

// @route   PATCH /api/admin/users/:id/restore
// @desc    Restore soft-deleted user
// @access  Private (Admin)
router.patch('/:id/restore', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity('RESTORE_USER'),
    adminUserController.restoreUser
);

// @route   POST /api/admin/users/bulk-update
// @desc    Bulk update users
// @access  Private (Admin)
router.post('/bulk-update', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity('BULK_UPDATE_USERS'),
    adminUserController.bulkUpdateUsers
);

// @route   GET /api/admin/users/export
// @desc    Export users data
// @access  Private (Admin)
router.get('/export', 
    verifyAdminToken, 
    checkAdminPermission('exportData'),
    adminRateLimit(5, 60 * 60 * 1000), // 5 requests per hour
    logAdminActivity('EXPORT_USERS'),
    adminUserController.exportUsers
);

// @route   POST /api/admin/users
// @desc    Create new user
// @access  Private (Admin)
router.post('/', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('CREATE_USER'),
    adminUserController.createUser
);

// @route   POST /api/admin/users/bulk-delete
// @desc    Bulk delete users
// @access  Private (Admin)
router.post('/bulk-delete', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(3, 15 * 60 * 1000), // 3 requests per 15 minutes
    logAdminActivity('BULK_DELETE_USERS'),
    adminUserController.bulkDeleteUsers
);

module.exports = router;
