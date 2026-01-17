const express = require('express');
const router = express.Router();
const adminHierarchyController = require('../controllers/adminHierarchyController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== ADMIN HIERARCHY MANAGEMENT ROUTES =====

// @route   GET /api/admin/hierarchy/requests
// @desc    Get all hierarchy change requests with filtering and pagination
// @access  Private (Admin)
router.get('/requests', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    logAdminActivity('VIEW_HIERARCHY_REQUESTS'),
    adminHierarchyController.getHierarchyRequests
);

// @route   GET /api/admin/hierarchy/requests/:id
// @desc    Get hierarchy request by ID
// @access  Private (Admin)
router.get('/requests/:id', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    logAdminActivity('VIEW_HIERARCHY_REQUEST_DETAILS'),
    adminHierarchyController.getHierarchyRequestById
);

// @route   PUT /api/admin/hierarchy/requests/:id/process
// @desc    Process hierarchy change request
// @access  Private (Admin)
router.put('/requests/:id/process', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('PROCESS_HIERARCHY_REQUEST'),
    adminHierarchyController.processHierarchyRequest
);

// @route   POST /api/admin/hierarchy/requests/bulk-process
// @desc    Bulk process hierarchy requests
// @access  Private (Admin)
router.post('/requests/bulk-process', 
    verifyAdminToken, 
    checkAdminPermission('userManagement'),
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    logAdminActivity('BULK_PROCESS_HIERARCHY_REQUESTS'),
    adminHierarchyController.bulkProcessHierarchyRequests
);

// @route   GET /api/admin/hierarchy/analytics
// @desc    Get hierarchy analytics and statistics
// @access  Private (Admin)
router.get('/analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'),
    logAdminActivity('VIEW_HIERARCHY_ANALYTICS'),
    adminHierarchyController.getHierarchyAnalytics
);

module.exports = router;
