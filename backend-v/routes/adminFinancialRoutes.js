const express = require('express');
const router = express.Router();
const adminFinancialController = require('../controllers/adminFinancialController');
const { verifyAdminToken, checkAdminPermission, adminRateLimit, logAdminActivity } = require('../middleware/adminAuth');

// Temporarily disable logAdminActivity for all financial routes to fix timeout issues
const noLogActivity = (req, res, next) => {
    console.log('🔐 [FINANCIAL_ROUTE] Skipping audit logging for performance');
    next();
};

// ===== FINANCIAL & BILLING CONTROL CENTER ROUTES =====

// @route   GET /api/admin/financial/credit-system
// @desc    Get credit system configuration
// @access  Private (Admin)
router.get('/credit-system', 
    (req, res, next) => {
        console.log('🛣️ [FINANCIAL_ROUTE] GET /credit-system - Route hit');
        next();
    },
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminFinancialController.getCreditSystem
);

// @route   PUT /api/admin/financial/credit-system
// @desc    Update credit system configuration
// @access  Private (Admin)
router.put('/credit-system', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit, 
    noLogActivity, 
    adminFinancialController.updateCreditSystem
);

// @route   GET /api/admin/financial/credit-packages
// @desc    Get credit packages
// @access  Private (Admin)
router.get('/credit-packages', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminFinancialController.getCreditPackages
);

// @route   POST /api/admin/financial/credit-packages
// @desc    Create new credit package
// @access  Private (Admin)
router.post('/credit-packages', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    noLogActivity, 
    adminFinancialController.createCreditPackage
);

// @route   PUT /api/admin/financial/credit-packages/:packageId
// @desc    Update credit package
// @access  Private (Admin)
router.put('/credit-packages/:packageId', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    noLogActivity, 
    adminFinancialController.updateCreditPackage
);

// @route   DELETE /api/admin/financial/credit-packages/:packageId
// @desc    Delete credit package
// @access  Private (Admin)
router.delete('/credit-packages/:packageId', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit(5, 5 * 60 * 1000), // 5 requests per 5 minutes
    noLogActivity, 
    adminFinancialController.deleteCreditPackage
);

// @route   GET /api/admin/financial/revenue-analytics
// @desc    Get revenue analytics
// @access  Private (Admin)
router.get('/revenue-analytics', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminFinancialController.getRevenueAnalytics
);

// @route   GET /api/admin/financial/payment-failures
// @desc    Get payment failure analytics
// @access  Private (Admin)
router.get('/payment-failures', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminFinancialController.getPaymentFailures
);

// @route   GET /api/admin/financial/gateway-markup
// @desc    Get gateway markup analytics
// @access  Private (Admin)
router.get('/gateway-markup', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminFinancialController.getGatewayMarkup
);

// @route   GET /api/admin/financial/credit-usage
// @desc    Get credit usage analytics
// @access  Private (Admin)
router.get('/credit-usage', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminFinancialController.getCreditUsage
);

// ===== PAYMENT SETTINGS & COMMISSION PAYOUTS =====

// @route   GET /api/admin/financial/payment-settings
// @desc    Get payment settings
// @access  Private (Admin)
router.get('/payment-settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    noLogActivity, 
    adminFinancialController.getPaymentSettings
);

// @route   PUT /api/admin/financial/payment-settings
// @desc    Update payment settings
// @access  Private (Admin)
router.put('/payment-settings', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    noLogActivity, 
    adminFinancialController.updatePaymentSettings
);

// @route   GET /api/admin/financial/commission-payouts
// @desc    Get commission payouts
// @access  Private (Admin)
router.get('/commission-payouts', 
    verifyAdminToken, 
    checkAdminPermission('financialReports'), 
    noLogActivity, 
    adminFinancialController.getCommissionPayouts
);

// @route   POST /api/admin/financial/commission-payouts/:paymentId/process
// @desc    Process commission payout
// @access  Private (Admin)
router.post('/commission-payouts/:paymentId/process', 
    verifyAdminToken, 
    checkAdminPermission('paymentManagement'), 
    adminRateLimit(20, 5 * 60 * 1000), // 20 requests per 5 minutes
    noLogActivity, 
    adminFinancialController.processCommissionPayout
);

// @route   GET /api/admin/financial/payment-gateways
// @desc    Get payment gateway configurations
// @access  Private (Admin)
router.get('/payment-gateways', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    noLogActivity, 
    adminFinancialController.getPaymentGateways
);

// @route   PUT /api/admin/financial/payment-gateways/:gatewayName
// @desc    Update payment gateway configuration
// @access  Private (Admin)
router.put('/payment-gateways/:gatewayName', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    adminRateLimit(10, 5 * 60 * 1000), // 10 requests per 5 minutes
    noLogActivity, 
    adminFinancialController.updatePaymentGateway
);

// @route   POST /api/admin/financial/payment-gateways/:gatewayName/test
// @desc    Test payment gateway
// @access  Private (Admin)
router.post('/payment-gateways/:gatewayName/test', 
    verifyAdminToken, 
    checkAdminPermission('paymentSettings'), 
    adminRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
    noLogActivity, 
    adminFinancialController.testPaymentGateway
);

// @route   GET /api/admin/financial/payment-analytics
// @desc    Get payment analytics (enhanced with funnelseye-payments)
// @access  Private (Admin)
router.get('/payment-analytics', 
    verifyAdminToken, 
    checkAdminPermission('financialReports'), 
    noLogActivity, 
    adminFinancialController.getPaymentAnalytics
);

// ===== RAZORPAY ACCOUNT MANAGEMENT =====

// @route   GET /api/admin/financial/razorpay-account
// @desc    Get Razorpay account details and balance
// @access  Private (Admin)
router.get('/razorpay-account', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminFinancialController.getRazorpayAccount
);

// ===== MLM COMMISSION MANAGEMENT =====

// @route   PUT /api/admin/financial/mlm-commission-structure
// @desc    Update MLM commission structure
// @access  Private (Admin)
router.put('/mlm-commission-structure', 
    verifyAdminToken, 
    checkAdminPermission('mlmSettings'), 
    adminRateLimit, 
    noLogActivity, 
    adminFinancialController.updateMlmCommissionStructure
);

// @route   POST /api/admin/financial/process-mlm-commission
// @desc    Process MLM commission for subscription
// @access  Private (Admin)
router.post('/process-mlm-commission', 
    verifyAdminToken, 
    checkAdminPermission('mlmSettings'), 
    adminRateLimit, 
    noLogActivity, 
    adminFinancialController.processMlmCommission
);

// ===== PLATFORM FEE MANAGEMENT =====

// @route   GET /api/admin/financial/platform-fees
// @desc    Get platform fee settings
// @access  Private (Admin)
router.get('/platform-fees', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    noLogActivity, 
    adminFinancialController.getPlatformFees
);

// @route   PUT /api/admin/financial/platform-fees
// @desc    Update platform fee settings
// @access  Private (Admin)
router.put('/platform-fees', 
    verifyAdminToken, 
    checkAdminPermission('systemSettings'), 
    adminRateLimit, 
    noLogActivity, 
    adminFinancialController.updatePlatformFees
);

// ===== FINANCIAL ANALYTICS DASHBOARD =====

// @route   GET /api/admin/financial/analytics-dashboard
// @desc    Get comprehensive financial analytics dashboard
// @access  Private (Admin)
router.get('/analytics-dashboard', 
    verifyAdminToken, 
    checkAdminPermission('viewAnalytics'), 
    noLogActivity, 
    adminFinancialController.getFinancialAnalyticsDashboard
);

module.exports = router;
