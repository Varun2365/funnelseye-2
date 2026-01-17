const express = require('express');
const router = express.Router();

// Import controllers
const adminProductController = require('../controllers/adminProductController');
const coachSellablePlanController = require('../controllers/coachSellablePlanController');
const razorpayPaymentController = require('../controllers/razorpayPaymentController');
const checkoutPageController = require('../controllers/checkoutPageController');
const unifiedPaymentController = require('../controllers/unifiedPaymentController');
const centralPaymentController = require('../controllers/centralPaymentController');
const coachPaymentController = require('../controllers/coachPaymentController');
const payoutController = require('../controllers/payoutController');

// Import middleware
const { protect } = require('../middleware/auth');
const { verifyAdminToken } = require('../middleware/adminAuth');

// ==================== ADMIN PRODUCT ROUTES ====================

/**
 * @route   POST /api/paymentsv1/admin/products
 * @desc    Create a new admin product
 * @access  Private (Admin)
 */
router.post('/admin/products', verifyAdminToken, adminProductController.createProduct);

/**
 * @route   GET /api/paymentsv1/admin/products
 * @desc    Get all admin products
 * @access  Private (Admin)
 */
router.get('/admin/products', verifyAdminToken, adminProductController.getAllProducts);

/**
 * @route   GET /api/paymentsv1/admin/products/available-for-coaches
 * @desc    Get products available for coaches
 * @access  Private (Admin)
 */
router.get('/admin/products/available-for-coaches', verifyAdminToken, adminProductController.getProductsForCoaches);

/**
 * @route   GET /api/paymentsv1/admin/products/:productId
 * @desc    Get admin product by ID
 * @access  Private (Admin)
 */
router.get('/admin/products/:productId', verifyAdminToken, adminProductController.getProductById);

/**
 * @route   PUT /api/paymentsv1/admin/products/:productId
 * @desc    Update admin product
 * @access  Private (Admin)
 */
router.put('/admin/products/:productId', verifyAdminToken, adminProductController.updateProduct);

/**
 * @route   DELETE /api/paymentsv1/admin/products/:productId
 * @desc    Delete admin product
 * @access  Private (Admin)
 */
router.delete('/admin/products/:productId', verifyAdminToken, adminProductController.deleteProduct);

/**
 * @route   GET /api/paymentsv1/admin/products/:productId/stats
 * @desc    Get product statistics
 * @access  Private (Admin)
 */
router.get('/admin/products/:productId/stats', verifyAdminToken, adminProductController.getProductStats);

/**
 * @route   PUT /api/paymentsv1/admin/products/:productId/status
 * @desc    Update product status
 * @access  Private (Admin)
 */
router.put('/admin/products/:productId/status', verifyAdminToken, adminProductController.updateProductStatus);

// ==================== COACH SELLABLE PLAN ROUTES ====================

/**
 * @route   POST /api/paymentsv1/coach/plans
 * @desc    Create a new coach sellable plan
 * @access  Private (Coach)
 */
router.post('/coach/plans', protect, coachSellablePlanController.createPlan);

/**
 * @route   GET /api/paymentsv1/coach/plans
 * @desc    Get coach's sellable plans
 * @access  Private (Coach)
 */
router.get('/coach/plans', protect, coachSellablePlanController.getCoachPlans);

/**
 * @route   GET /api/paymentsv1/coach/plans/stats
 * @desc    Get coach's plan statistics
 * @access  Private (Coach)
 */
router.get('/coach/plans/stats', protect, coachSellablePlanController.getCoachPlanStats);

/**
 * @route   GET /api/paymentsv1/coach/plans/:planId
 * @desc    Get coach sellable plan by ID
 * @access  Private (Coach)
 */
router.get('/coach/plans/:planId', protect, coachSellablePlanController.getPlanById);

/**
 * @route   PUT /api/paymentsv1/coach/plans/:planId
 * @desc    Update coach sellable plan
 * @access  Private (Coach)
 */
router.put('/coach/plans/:planId', protect, coachSellablePlanController.updatePlan);

/**
 * @route   DELETE /api/paymentsv1/coach/plans/:planId
 * @desc    Delete coach sellable plan
 * @access  Private (Coach)
 */
router.delete('/coach/plans/:planId', protect, coachSellablePlanController.deletePlan);

/**
 * @route   PUT /api/paymentsv1/coach/plans/:planId/status
 * @desc    Update coach sellable plan status
 * @access  Private (Coach)
 */
router.put('/coach/plans/:planId/status', protect, coachSellablePlanController.updatePlanStatus);

// ==================== PUBLIC PLAN ROUTES ====================

/**
 * @route   GET /api/paymentsv1/public/plans
 * @desc    Get public sellable plans
 * @access  Public
 */
router.get('/public/plans', coachSellablePlanController.getPublicPlans);

/**
 * @route   GET /api/paymentsv1/public/plans/:planId/details
 * @desc    Get plan details for purchase
 * @access  Public
 */
router.get('/public/plans/:planId/details', coachSellablePlanController.getPlanForPurchase);

// ==================== RAZORPAY PAYMENT ROUTES ====================

/**
 * @route   POST /api/paymentsv1/payments/create-razorpay-order
 * @desc    Create Razorpay order
 * @access  Public
 */
router.post('/payments/create-razorpay-order', razorpayPaymentController.createRazorpayOrder);

/**
 * @route   POST /api/paymentsv1/payments/coach-plan/create-order
 * @desc    Create Razorpay order for coach plan purchase
 * @access  Public
 */
router.post('/payments/coach-plan/create-order', razorpayPaymentController.createCoachPlanOrder);

/**
 * @route   POST /api/paymentsv1/payments/subscription/create-order
 * @desc    Create Razorpay order for platform subscription
 * @access  Public
 */
router.post('/payments/subscription/create-order', razorpayPaymentController.createSubscriptionOrder);

/**
 * @route   POST /api/paymentsv1/payments/verify
 * @desc    Verify Razorpay payment
 * @access  Public
 */
router.post('/payments/verify', razorpayPaymentController.verifyPayment);

/**
 * @route   GET /api/paymentsv1/payments/:paymentId
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/payments/:paymentId', protect, razorpayPaymentController.getPaymentById);

/**
 * @route   GET /api/paymentsv1/payments/user/:userId
 * @desc    Get payments by user
 * @access  Private
 */
router.get('/payments/user/:userId', protect, razorpayPaymentController.getPaymentsByUser);

/**
 * @route   POST /api/paymentsv1/payments/:paymentId/refund
 * @desc    Process refund
 * @access  Private (Admin/Coach)
 */
router.post('/payments/:paymentId/refund', protect, razorpayPaymentController.processRefund);

/**
 * @route   POST /api/paymentsv1/payments/webhook
 * @desc    Handle Razorpay webhook
 * @access  Public (Razorpay)
 */
router.post('/payments/webhook', razorpayPaymentController.handleWebhook);

// ==================== CHECKOUT PAGE ROUTES ====================

/**
 * @route   GET /api/paymentsv1/checkout/coach-plan/:planId
 * @desc    Get checkout page data for coach plan
 * @access  Public
 */
router.get('/checkout/coach-plan/:planId', checkoutPageController.getCoachPlanCheckoutData);

/**
 * @route   GET /api/paymentsv1/checkout/subscription
 * @desc    Get checkout page data for platform subscription
 * @access  Public
 */
router.get('/checkout/subscription', checkoutPageController.getSubscriptionCheckoutData);

/**
 * @route   POST /api/paymentsv1/checkout/complete
 * @desc    Process checkout completion
 * @access  Public
 */
router.post('/checkout/complete', checkoutPageController.processCheckoutCompletion);

/**
 * @route   GET /api/paymentsv1/checkout/payment-history/:userId
 * @desc    Get payment history for user
 * @access  Private
 */
router.get('/checkout/payment-history/:userId', protect, checkoutPageController.getPaymentHistory);

/**
 * @route   POST /api/paymentsv1/checkout/generate-url
 * @desc    Generate checkout page URL
 * @access  Public
 */
router.post('/checkout/generate-url', checkoutPageController.generateCheckoutUrl);

// ==================== PAYMENT RECEIVING ROUTES ====================
// These routes handle money coming INTO the platform

/**
 * @route   POST /api/paymentsv1/receiving/create-razorpay-order
 * @desc    Create Razorpay order for receiving payments
 * @access  Public
 */
router.post('/receiving/create-razorpay-order', razorpayPaymentController.createRazorpayOrder);

/**
 * @route   POST /api/paymentsv1/receiving/coach-plan/create-order
 * @desc    Create Razorpay order for coach plan purchase
 * @access  Public
 */
router.post('/receiving/coach-plan/create-order', razorpayPaymentController.createCoachPlanOrder);

/**
 * @route   POST /api/paymentsv1/receiving/subscription/create-order
 * @desc    Create Razorpay order for platform subscription
 * @access  Public
 */
router.post('/receiving/subscription/create-order', razorpayPaymentController.createSubscriptionOrder);

/**
 * @route   POST /api/paymentsv1/receiving/verify
 * @desc    Verify Razorpay payment
 * @access  Public
 */
router.post('/receiving/verify', razorpayPaymentController.verifyPayment);

/**
 * @route   POST /api/paymentsv1/receiving/webhook
 * @desc    Handle Razorpay webhook
 * @access  Public (Razorpay)
 */
router.post('/receiving/webhook', razorpayPaymentController.handleWebhook);

/**
 * @route   POST /api/paymentsv1/receiving/unified/create-session
 * @desc    Create unified payment session for receiving money
 * @access  Public
 */
router.post('/receiving/unified/create-session', unifiedPaymentController.createPaymentSession);

/**
 * @route   POST /api/paymentsv1/receiving/unified/course-purchase
 * @desc    Process course purchase payment
 * @access  Public
 */
router.post('/receiving/unified/course-purchase', unifiedPaymentController.processCoursePurchase);

/**
 * @route   POST /api/paymentsv1/receiving/unified/subscription-payment
 * @desc    Process subscription payment
 * @access  Public
 */
router.post('/receiving/unified/subscription-payment', unifiedPaymentController.processSubscriptionPayment);

/**
 * @route   POST /api/paymentsv1/receiving/unified/webhook/:gateway
 * @desc    Handle unified payment webhook
 * @access  Public
 */
router.post('/receiving/unified/webhook/:gateway', unifiedPaymentController.processWebhook);

/**
 * @route   POST /api/paymentsv1/receiving/central/create-session
 * @desc    Create central payment session
 * @access  Public
 */
router.post('/receiving/central/create-session', centralPaymentController.createPaymentSession);

/**
 * @route   POST /api/paymentsv1/receiving/central/webhook/:gateway
 * @desc    Handle central payment webhook
 * @access  Public
 */
router.post('/receiving/central/webhook/:gateway', centralPaymentController.processWebhook);

/**
 * @route   GET /api/paymentsv1/receiving/checkout/coach-plan/:planId
 * @desc    Get checkout page data for coach plan
 * @access  Public
 */
router.get('/receiving/checkout/coach-plan/:planId', checkoutPageController.getCoachPlanCheckoutData);

/**
 * @route   GET /api/paymentsv1/receiving/checkout/subscription
 * @desc    Get checkout page data for platform subscription
 * @access  Public
 */
router.get('/receiving/checkout/subscription', checkoutPageController.getSubscriptionCheckoutData);

/**
 * @route   POST /api/paymentsv1/receiving/checkout/complete
 * @desc    Process checkout completion
 * @access  Public
 */
router.post('/receiving/checkout/complete', checkoutPageController.processCheckoutCompletion);

/**
 * @route   POST /api/paymentsv1/receiving/checkout/generate-url
 * @desc    Generate checkout page URL
 * @access  Public
 */
router.post('/receiving/checkout/generate-url', checkoutPageController.generateCheckoutUrl);

/**
 * @route   GET /api/paymentsv1/receiving/health
 * @desc    Health check for payment receiving system
 * @access  Public
 */
router.get('/receiving/health', (req, res) => {
    res.json({
        success: true,
        message: 'Payment Receiving System is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            razorpay: '/api/paymentsv1/receiving/create-razorpay-order',
            unified: '/api/paymentsv1/receiving/unified/create-session',
            central: '/api/paymentsv1/receiving/central/create-session',
            checkout: '/api/paymentsv1/receiving/checkout'
        }
    });
});

// ==================== PAYMENT SENDING ROUTES ====================
// These routes handle money going OUT of the platform (payouts to coaches)

/**
 * @route   POST /api/paymentsv1/sending/instant-payout
 * @desc    Process instant payout to coach
 * @access  Private (Coach/Admin)
 */
router.post('/sending/instant-payout', protect, unifiedPaymentController.processInstantPayout);

/**
 * @route   POST /api/paymentsv1/sending/request-payout
 * @desc    Request payout from coach earnings
 * @access  Private (Coach)
 */
router.post('/sending/request-payout', protect, coachPaymentController.requestPayout);

/**
 * @route   POST /api/paymentsv1/sending/process-payout
 * @desc    Process payout request (Admin)
 * @access  Private (Admin)
 */
router.post('/sending/process-payout', verifyAdminToken, coachPaymentController.processPayout);

/**
 * @route   POST /api/paymentsv1/sending/bulk-payouts
 * @desc    Process bulk payouts for multiple coaches
 * @access  Private (Admin)
 */
router.post('/sending/bulk-payouts', verifyAdminToken, coachPaymentController.processBulkPayouts);

/**
 * @route   POST /api/paymentsv1/sending/automatic-payouts
 * @desc    Process automatic payouts based on schedule
 * @access  Private (Admin)
 */
router.post('/sending/automatic-payouts', verifyAdminToken, payoutController.processAutomaticPayouts);

// ==================== RAZORPAY PAYOUT ROUTES ====================

/**
 * @route   POST /api/paymentsv1/sending/setup-razorpay-coach/:coachId
 * @desc    Setup coach for Razorpay payouts (create contact and fund account)
 * @access  Private (Admin)
 */
router.post('/sending/setup-razorpay-coach/:coachId', verifyAdminToken, payoutController.setupRazorpayCoach);

/**
 * @route   POST /api/paymentsv1/sending/razorpay-payout
 * @desc    Process single Razorpay payout to a coach
 * @access  Private (Admin)
 */
router.post('/sending/razorpay-payout', verifyAdminToken, payoutController.processRazorpayPayout);

/**
 * @route   POST /api/paymentsv1/sending/monthly-razorpay-payouts
 * @desc    Process monthly automatic Razorpay payouts for all eligible coaches
 * @access  Private (Admin)
 */
router.post('/sending/monthly-razorpay-payouts', verifyAdminToken, payoutController.processMonthlyRazorpayPayouts);

/**
 * @route   POST /api/paymentsv1/sending/monthly-mlm-commission-payouts
 * @desc    Process monthly MLM commission payouts for all coaches
 * @access  Private (Admin)
 */
router.post('/sending/monthly-mlm-commission-payouts', verifyAdminToken, payoutController.processMonthlyMlmCommissionPayouts);

/**
 * @route   GET /api/paymentsv1/sending/mlm-commission-summary/:coachId
 * @desc    Get MLM commission summary for a specific coach
 * @access  Private (Admin)
 */
router.get('/sending/mlm-commission-summary/:coachId', verifyAdminToken, payoutController.getMlmCommissionSummary);

/**
 * @route   POST /api/paymentsv1/admin/update-mlm-commission-settings
 * @desc    Update MLM commission settings (levels and percentages)
 * @access  Private (Admin)
 */
router.post('/admin/update-mlm-commission-settings', verifyAdminToken, payoutController.updateMlmCommissionSettings);

/**
 * @route   GET /api/paymentsv1/admin/mlm-commission-settings
 * @desc    Get current MLM commission settings
 * @access  Private (Admin)
 */
router.get('/admin/mlm-commission-settings', verifyAdminToken, payoutController.getMlmCommissionSettings);

/**
 * @route   GET /api/paymentsv1/sending/razorpay-payout-status/:payoutId
 * @desc    Get Razorpay payout status
 * @access  Private (Admin)
 */
router.get('/sending/razorpay-payout-status/:payoutId', verifyAdminToken, payoutController.getRazorpayPayoutStatus);

/**
 * @route   POST /api/paymentsv1/sending/sync-razorpay-status/:payoutId
 * @desc    Sync Razorpay payout status with database
 * @access  Private (Admin)
 */
router.post('/sending/sync-razorpay-status/:payoutId', verifyAdminToken, payoutController.syncRazorpayPayoutStatus);

/**
 * @route   POST /api/paymentsv1/admin/razorpay-config
 * @desc    Update Razorpay configuration settings
 * @access  Private (Admin)
 */
router.post('/admin/razorpay-config', verifyAdminToken, payoutController.updateRazorpayConfig);

/**
 * @route   POST /api/paymentsv1/admin/setup-coach-payment-collection/:coachId
 * @desc    Setup coach payment collection (UPI/Bank details)
 * @access  Private (Admin)
 */
router.post('/admin/setup-coach-payment-collection/:coachId', verifyAdminToken, payoutController.setupCoachPaymentCollection);

/**
 * @route   GET /api/paymentsv1/admin/razorpay-status
 * @desc    Check Razorpay configuration and initialization status
 * @access  Private (Admin)
 */
router.get('/admin/razorpay-status', verifyAdminToken, payoutController.getRazorpayStatus);

/**
 * @route   GET /api/paymentsv1/admin/test-razorpay
 * @desc    Test Razorpay module functionality
 * @access  Private (Admin)
 */
router.get('/admin/test-razorpay', verifyAdminToken, payoutController.testRazorpayModule);

/**
 * @route   GET /api/paymentsv1/sending/payout-history/:coachId
 * @desc    Get payout history for a coach
 * @access  Private (Coach/Admin)
 */
router.get('/sending/payout-history/:coachId', protect, coachPaymentController.getPayoutHistory);

/**
 * @route   GET /api/paymentsv1/sending/pending-payouts
 * @desc    Get all pending payout requests
 * @access  Private (Admin)
 */
router.get('/sending/pending-payouts', verifyAdminToken, coachPaymentController.getPendingPayouts);

/**
 * @route   GET /api/paymentsv1/sending/payout-statistics
 * @desc    Get payout statistics
 * @access  Private (Admin)
 */
router.get('/sending/payout-statistics', verifyAdminToken, coachPaymentController.getPayoutStatistics);

/**
 * @route   PUT /api/paymentsv1/sending/payout/:payoutId/status
 * @desc    Update payout status
 * @access  Private (Admin)
 */
router.put('/sending/payout/:payoutId/status', verifyAdminToken, coachPaymentController.updatePayoutStatus);

/**
 * @route   POST /api/paymentsv1/sending/payout/:payoutId/cancel
 * @desc    Cancel a payout request
 * @access  Private (Coach/Admin)
 */
router.post('/sending/payout/:payoutId/cancel', protect, coachPaymentController.cancelPayout);

/**
 * @route   GET /api/paymentsv1/sending/coach-earnings/:coachId
 * @desc    Get coach earnings summary
 * @access  Private (Coach/Admin)
 */
router.get('/sending/coach-earnings/:coachId', protect, coachPaymentController.getCoachEarnings);

/**
 * @route   GET /api/paymentsv1/sending/available-balance/:coachId
 * @desc    Get coach's available balance for payout
 * @access  Private (Coach/Admin)
 */
router.get('/sending/available-balance/:coachId', protect, coachPaymentController.getAvailableBalance);

/**
 * @route   POST /api/paymentsv1/sending/setup-payout-method
 * @desc    Setup payout method for coach
 * @access  Private (Coach)
 */
router.post('/sending/setup-payout-method', protect, coachPaymentController.setupPayoutMethod);

/**
 * @route   GET /api/paymentsv1/sending/payout-methods/:coachId
 * @desc    Get coach's payout methods
 * @access  Private (Coach/Admin)
 */
router.get('/sending/payout-methods/:coachId', protect, coachPaymentController.getPayoutMethods);

/**
 * @route   PUT /api/paymentsv1/sending/payout-method/:methodId
 * @desc    Update payout method
 * @access  Private (Coach)
 */
router.put('/sending/payout-method/:methodId', protect, coachPaymentController.updatePayoutMethod);

/**
 * @route   DELETE /api/paymentsv1/sending/payout-method/:methodId
 * @desc    Delete payout method
 * @access  Private (Coach)
 */
router.delete('/sending/payout-method/:methodId', protect, coachPaymentController.deletePayoutMethod);

/**
 * @route   GET /api/paymentsv1/sending/health
 * @desc    Health check for payment sending system
 * @access  Public
 */
router.get('/sending/health', (req, res) => {
    res.json({
        success: true,
        message: 'Payment Sending System is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            instantPayout: '/api/paymentsv1/sending/instant-payout',
            requestPayout: '/api/paymentsv1/sending/request-payout',
            bulkPayouts: '/api/paymentsv1/sending/bulk-payouts',
            payoutHistory: '/api/paymentsv1/sending/payout-history'
        }
    });
});

// ==================== HEALTH CHECK ====================

/**
 * @route   GET /api/paymentsv1/health
 * @desc    Health check for payment system
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Payment System v1 is healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            adminProducts: '/api/paymentsv1/admin/products',
            coachPlans: '/api/paymentsv1/coach/plans',
            publicPlans: '/api/paymentsv1/public/plans',
            payments: '/api/paymentsv1/payments',
            checkout: '/api/paymentsv1/checkout',
            receiving: '/api/paymentsv1/receiving',
            sending: '/api/paymentsv1/sending'
        }
    });
});

module.exports = router;
