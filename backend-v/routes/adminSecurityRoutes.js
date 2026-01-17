const express = require('express');
const router = express.Router();
const adminSecurityController = require('../controllers/adminSecurityController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== SECURITY & COMPLIANCE CENTER ROUTES =====

// @route   GET /api/admin/security/settings
// @desc    Get security settings
// @access  Private (Admin)
router.get('/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    logAdminActivity('VIEW_SECURITY_SETTINGS'), 
    adminSecurityController.getSecuritySettings
);

// @route   PUT /api/admin/security/settings
// @desc    Update security settings
// @access  Private (Admin)
router.put('/settings', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_SECURITY_SETTINGS'), 
    adminSecurityController.updateSecuritySettings
);

// @route   GET /api/admin/security/active-sessions
// @desc    Get active sessions
// @access  Private (Admin)
router.get('/active-sessions', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    logAdminActivity('VIEW_ACTIVE_SESSIONS'), 
    adminSecurityController.getActiveSessions
);

// @route   DELETE /api/admin/security/sessions/:sessionId
// @desc    Terminate session
// @access  Private (Admin)
router.delete('/sessions/:sessionId', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('TERMINATE_SESSION'), 
    adminSecurityController.terminateSession
);

// @route   GET /api/admin/security/incidents
// @desc    Get security incidents
// @access  Private (Admin)
router.get('/incidents', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity('VIEW_SECURITY_INCIDENTS'), 
    adminSecurityController.getSecurityIncidents
);

// @route   GET /api/admin/security/threat-summary
// @desc    Get threat detection summary
// @access  Private (Admin)
router.get('/threat-summary', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity('VIEW_THREAT_SUMMARY'), 
    adminSecurityController.getThreatSummary
);

// @route   PUT /api/admin/security/mfa/:adminId
// @desc    Enable/disable MFA for admin
// @access  Private (Admin)
router.put('/mfa/:adminId', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    logAdminActivity('UPDATE_MFA_STATUS'), 
    adminSecurityController.updateMfaStatus
);

// @route   GET /api/admin/security/compliance
// @desc    Get compliance report
// @access  Private (Admin)
router.get('/compliance', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity('VIEW_COMPLIANCE_REPORT'), 
    adminSecurityController.getComplianceReport
);

module.exports = router;
