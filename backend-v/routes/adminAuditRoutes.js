const express = require('express');
const router = express.Router();
const adminAuditController = require('../controllers/adminAuditController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== ADMIN AUDIT LOGS ROUTES =====

// @route   GET /api/admin/audit-logs
// @desc    Get audit logs with filtering and pagination
// @access  Private (Admin)
router.get('/', 
    verifyAdminToken, 
    checkAdminPermission('systemLogs'),
    logAdminActivity('VIEW_AUDIT_LOGS'),
    adminAuditController.getAuditLogs
);

// @route   GET /api/admin/audit-logs/export
// @desc    Export audit logs
// @access  Private (Admin)
router.get('/export', 
    verifyAdminToken, 
    checkAdminPermission('exportData'),
    adminRateLimit(5, 60 * 60 * 1000), // 5 requests per hour
    logAdminActivity('EXPORT_AUDIT_LOGS'),
    adminAuditController.exportAuditLogs
);

// @route   GET /api/admin/audit-logs/:id
// @desc    Get specific audit log details
// @access  Private (Admin)
router.get('/:id', 
    verifyAdminToken, 
    checkAdminPermission('systemLogs'),
    logAdminActivity('VIEW_AUDIT_LOG_DETAILS'),
    adminAuditController.getAuditLogById
);

module.exports = router;
