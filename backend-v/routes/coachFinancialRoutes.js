const express = require('express');
const router = express.Router();
const coachFinancialController = require('../controllers/coachFinancialController');
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('financial'));

// ===== REVENUE & ANALYTICS =====

/**
 * @route GET /api/coach/financial/revenue
 * @desc Get coach revenue analytics
 * @access Private (Coach)
 * @query timeRange (optional): Number of days to analyze (default: 30)
 * @query period (optional): Period for grouping (daily, weekly, monthly)
 * @example GET /api/coach/financial/revenue?timeRange=30&period=daily
 */
router.get('/revenue', requirePermission('performance:read'), coachFinancialController.getRevenue);

/**
 * @route GET /api/coach/financial/payments
 * @desc Get payment history
 * @access Private (Coach/Staff with permission)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query status (optional): Filter by payment status
 * @query from (optional): Start date filter
 * @query to (optional): End date filter
 * @example GET /api/coach/financial/payments?page=1&limit=20&status=active
 */
router.get('/payments', requirePermission('performance:read'), coachFinancialController.getPaymentHistory);

// ===== RAZORPAY BALANCE & ACCOUNT =====

/**
 * @route GET /api/coach/financial/balance
 * @desc Get Razorpay account balance
 * @access Private (Coach)
 * @example GET /api/coach/financial/balance
 */
router.get('/balance', requirePermission('performance:read'), coachFinancialController.getAccountBalance);

// ===== PAYOUT MANAGEMENT =====

/**
 * @route POST /api/coach/financial/payout
 * @desc Create manual payout
 * @access Private (Coach)
 * @body amount: Payout amount
 * @body payoutMethod: UPI or BANK
 * @body upiId: UPI ID (required for UPI payout)
 * @body bankAccount: Bank account details (required for bank payout)
 * @body notes: Optional notes
 * @example POST /api/coach/financial/payout
 * @body {
 *   "amount": 1000,
 *   "payoutMethod": "UPI",
 *   "upiId": "coach@paytm",
 *   "notes": "Monthly payout"
 * }
 */
router.post('/payout', requirePermission('performance:manage'), coachFinancialController.createManualPayout);

/**
 * @route GET /api/coach/financial/payouts
 * @desc Get payout history
 * @access Private (Coach)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query status (optional): Filter by payout status
 * @query from (optional): Start date filter
 * @query to (optional): End date filter
 * @example GET /api/coach/financial/payouts?page=1&limit=20&status=processed
 */
router.get('/payouts', requirePermission('performance:read'), coachFinancialController.getPayoutHistory);

/**
 * @route PUT /api/coach/financial/payout-settings
 * @desc Update automatic payout settings
 * @access Private (Coach)
 * @body autoPayoutEnabled: Enable/disable automatic payouts
 * @body payoutMethod: UPI or BANK
 * @body upiId: UPI ID for automatic payouts
 * @body bankAccount: Bank account for automatic payouts
 * @body minimumAmount: Minimum amount for automatic payout
 * @body payoutFrequency: Frequency of automatic payouts
 * @body commissionPercentage: Commission percentage for MLM
 * @example PUT /api/coach/financial/payout-settings
 * @body {
 *   "autoPayoutEnabled": true,
 *   "payoutMethod": "UPI",
 *   "upiId": "coach@paytm",
 *   "minimumAmount": 500,
 *   "payoutFrequency": "weekly",
 *   "commissionPercentage": 10
 * }
 */
router.put('/payout-settings', requirePermission('performance:manage'), coachFinancialController.updatePayoutSettings);

// ===== MLM COMMISSION MANAGEMENT =====

/**
 * @route GET /api/coach/financial/mlm-commission
 * @desc Get MLM commission structure and history
 * @access Private (Coach)
 * @example GET /api/coach/financial/mlm-commission
 */
router.get('/mlm-commission', requirePermission('performance:read'), coachFinancialController.getMlmCommissionStructure);

// ===== COACH TO COACH PAYOUTS =====

/**
 * @route POST /api/coach/financial/payout-to-coach
 * @desc Payout to another coach
 * @access Private (Coach)
 * @body targetCoachId: ID of the coach to payout to
 * @body amount: Payout amount
 * @body notes: Optional notes
 * @example POST /api/coach/financial/payout-to-coach
 * @body {
 *   "targetCoachId": "coach_id_here",
 *   "amount": 500,
 *   "notes": "Commission payout"
 * }
 */
router.post('/payout-to-coach', requirePermission('performance:manage'), coachFinancialController.payoutToCoach);

// ===== REFUND MANAGEMENT =====

/**
 * @route GET /api/coach/financial/refunds
 * @desc Get refund history
 * @access Private (Coach)
 * @query page (optional): Page number (default: 1)
 * @query limit (optional): Items per page (default: 20)
 * @query status (optional): Filter by refund status
 * @example GET /api/coach/financial/refunds?page=1&limit=20
 */
router.get('/refunds', requirePermission('performance:read'), coachFinancialController.getRefundHistory);

module.exports = router;
