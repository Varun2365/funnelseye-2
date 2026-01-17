const express = require('express');
const router = express.Router();
const adminMlmController = require('../controllers/adminMlmController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// ===== MLM COMMISSION MANAGEMENT ROUTES =====

// @route   GET /api/admin/mlm/commission-structure
// @desc    Get MLM commission structure
// @access  Private (Admin)
router.get('/commission-structure', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    logAdminActivity, 
    adminMlmController.getCommissionStructure
);

// @route   PUT /api/admin/mlm/commission-structure
// @desc    Update MLM commission structure
// @access  Private (Admin)
router.put('/commission-structure', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit, 
    logAdminActivity, 
    adminMlmController.updateCommissionStructure
);

// @route   GET /api/admin/mlm/analytics
// @desc    Get MLM performance analytics
// @access  Private (Admin)
router.get('/analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity, 
    adminMlmController.getMlmAnalytics
);

// @route   GET /api/admin/mlm/pending-payouts
// @desc    Get pending payouts
// @access  Private (Admin)
router.get('/pending-payouts', 
    verifyAdminToken, 
    checkAdminPermission('paymentManagement'), 
    logAdminActivity, 
    adminMlmController.getPendingPayouts
);

// @route   POST /api/admin/mlm/process-payouts
// @desc    Process payouts
// @access  Private (Admin)
router.post('/process-payouts', 
    verifyAdminToken, 
    checkAdminPermission('paymentManagement'), 
    adminRateLimit, 
    logAdminActivity, 
    adminMlmController.processPayouts
);

// @route   GET /api/admin/mlm/eligibility-report
// @desc    Get commission eligibility report
// @access  Private (Admin)
router.get('/eligibility-report', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    logAdminActivity, 
    adminMlmController.getEligibilityReport
);

module.exports = router;
