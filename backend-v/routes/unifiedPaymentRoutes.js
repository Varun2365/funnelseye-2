const express = require('express');
const router = express.Router();
const unifiedPaymentController = require('../controllers/unifiedPaymentController');
const { protect } = require('../middleware/auth');
const { verifyAdminToken } = require('../middleware/adminAuth');

// ==================== PUBLIC ROUTES ====================

/**
 * Health check
 * GET /api/unified-payments/health
 */
router.get('/health', unifiedPaymentController.healthCheck);

/**
 * Process webhook (no auth required)
 * POST /api/unified-payments/webhook/:gateway
 */
router.post('/webhook/:gateway', unifiedPaymentController.processWebhook);

// ==================== AUTHENTICATED ROUTES ====================

/**
 * Create unified payment session
 * POST /api/unified-payments/create-session
 */
router.post('/create-session', protect, unifiedPaymentController.createPaymentSession);

/**
 * Process course purchase
 * POST /api/unified-payments/course-purchase
 */
router.post('/course-purchase', protect, unifiedPaymentController.processCoursePurchase);

/**
 * Process platform subscription payment
 * POST /api/unified-payments/subscription-payment
 */
router.post('/subscription-payment', protect, unifiedPaymentController.processSubscriptionPayment);

/**
 * Process instant payout
 * POST /api/unified-payments/instant-payout
 */
router.post('/instant-payout', protect, unifiedPaymentController.processInstantPayout);

/**
 * Get commission calculator data
 * GET /api/unified-payments/commission-calculator
 */
router.get('/commission-calculator', protect, unifiedPaymentController.getCommissionCalculator);

/**
 * Get transaction by ID
 * GET /api/unified-payments/transaction/:transactionId
 */
router.get('/transaction/:transactionId', protect, unifiedPaymentController.getTransactionById);

/**
 * Get transactions by user
 * GET /api/unified-payments/user/:userId
 */
router.get('/user/:userId', protect, unifiedPaymentController.getTransactionsByUser);

/**
 * Get transaction statistics
 * GET /api/unified-payments/statistics
 */
router.get('/statistics', protect, unifiedPaymentController.getTransactionStatistics);

// ==================== ADMIN ROUTES ====================

/**
 * Get global payment settings
 * GET /api/unified-payments/settings
 */
router.get('/settings', verifyAdminToken, unifiedPaymentController.getGlobalSettings);

/**
 * Update global payment settings
 * PUT /api/unified-payments/settings
 */
router.put('/settings', verifyAdminToken, unifiedPaymentController.updateGlobalSettings);

// ==================== API DOCUMENTATION ====================

/**
 * API documentation
 * GET /api/unified-payments/docs
 */
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'Unified Payment System API Documentation',
        version: '1.0.0',
        endpoints: {
            // Public Endpoints
            'GET /health': {
                description: 'Health check endpoint',
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        status: 'string',
                        settingsConfigured: 'boolean',
                        totalTransactions: 'number',
                        timestamp: 'string',
                        version: 'string'
                    }
                }
            },
            'POST /webhook/:gateway': {
                description: 'Process payment webhook from gateway',
                params: {
                    gateway: 'string (required) - razorpay, stripe, paypal'
                },
                body: 'webhook data from gateway',
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'transaction object'
                }
            },

            // Authenticated Endpoints
            'POST /create-session': {
                description: 'Create unified payment session',
                auth: 'JWT token required',
                body: {
                    transactionType: 'string (required) - course_purchase, product_purchase, subscription_payment, mlm_commission, instant_payout, monthly_payout, refund, adjustment',
                    grossAmount: 'number (required)',
                    senderId: 'string (required)',
                    senderType: 'string (required) - customer, coach, admin, system',
                    receiverId: 'string (required)',
                    receiverType: 'string (required) - customer, coach, admin, system, central_account',
                    productId: 'string (optional)',
                    productType: 'string (optional) - course, book, service, subscription, commission, other',
                    productName: 'string (optional)',
                    productDescription: 'string (optional)',
                    coachId: 'string (optional)',
                    mlmLevel: 'number (optional)',
                    sponsorId: 'string (optional)',
                    gateway: 'string (optional, default: razorpay)',
                    metadata: 'object (optional)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        transactionId: 'string',
                        orderId: 'string',
                        session: 'object',
                        transaction: 'object'
                    }
                }
            },
            'POST /course-purchase': {
                description: 'Process course purchase (simplified)',
                auth: 'JWT token required',
                body: {
                    courseId: 'string (required)',
                    clientId: 'string (required)',
                    coachId: 'string (required)',
                    amount: 'number (required)',
                    gateway: 'string (optional, default: razorpay)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'payment session object'
                }
            },
            'POST /subscription-payment': {
                description: 'Process platform subscription payment',
                auth: 'JWT token required',
                body: {
                    coachId: 'string (required)',
                    subscriptionPlan: 'string (required)',
                    amount: 'number (required)',
                    billingCycle: 'string (required) - one_time, monthly, quarterly, yearly',
                    gateway: 'string (optional, default: razorpay)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'payment session object'
                }
            },
            'POST /instant-payout': {
                description: 'Process instant payout to coach',
                auth: 'JWT token required',
                body: {
                    coachId: 'string (required)',
                    amount: 'number (required)',
                    payoutMethod: 'string (required) - upi, bank_transfer, paytm, phonepe, google_pay',
                    destination: 'object (required) - payout destination details'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'payout transaction object'
                }
            },
            'GET /commission-calculator': {
                description: 'Get commission calculator data',
                auth: 'JWT token required',
                query: {
                    amount: 'number (required)',
                    coachId: 'string (optional)',
                    mlmLevel: 'number (optional)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        grossAmount: 'number',
                        platformFee: 'number',
                        commissionAmount: 'number',
                        taxAmount: 'number',
                        netAmount: 'number',
                        mlmLevels: 'array',
                        platformFeePercentage: 'number',
                        directCommissionPercentage: 'number'
                    }
                }
            },
            'GET /transaction/:transactionId': {
                description: 'Get transaction by ID',
                auth: 'JWT token required',
                params: {
                    transactionId: 'string (required)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'transaction object'
                }
            },
            'GET /user/:userId': {
                description: 'Get transactions by user',
                auth: 'JWT token required',
                params: {
                    userId: 'string (required)'
                },
                query: {
                    page: 'number (optional, default: 1)',
                    limit: 'number (optional, default: 10)',
                    transactionType: 'string (optional)',
                    status: 'string (optional)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        transactions: 'array',
                        pagination: 'object'
                    }
                }
            },
            'GET /statistics': {
                description: 'Get transaction statistics',
                auth: 'JWT token required',
                query: {
                    startDate: 'string (optional) - ISO date',
                    endDate: 'string (optional) - ISO date',
                    transactionType: 'string (optional)',
                    status: 'string (optional)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        totalTransactions: 'number',
                        totalAmount: 'number',
                        totalCommissions: 'number',
                        totalPlatformFees: 'number',
                        totalTaxes: 'number'
                    }
                }
            },

            // Admin Endpoints
            'GET /settings': {
                description: 'Get global payment settings',
                auth: 'Admin JWT token required',
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'global payment settings object'
                }
            },
            'PUT /settings': {
                description: 'Update global payment settings',
                auth: 'Admin JWT token required',
                body: 'global payment settings update object',
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'updated global payment settings object'
                }
            }
        },
        transactionTypes: [
            'course_purchase',      // Client buying coach's course
            'product_purchase',      // Client buying coach's product
            'subscription_payment',  // Coach paying platform subscription
            'mlm_commission',        // MLM commission payout
            'instant_payout',        // Instant payout to coach
            'monthly_payout',        // Monthly payout to coach
            'refund',               // Refund transaction
            'adjustment'            // Manual adjustment
        ],
        userTypes: [
            'customer',     // End customer
            'coach',        // Coach/creator
            'admin',        // System admin
            'system',       // System process
            'central_account' // Central payment account
        ],
        supportedGateways: [
            'razorpay',
            'stripe',
            'paypal',
            'bank_transfer',
            'upi',
            'manual'
        ],
        payoutMethods: [
            'upi',
            'bank_transfer',
            'paytm',
            'phonepe',
            'google_pay'
        ],
        features: [
            'Unified payment interface',
            'Global payment settings',
            'Commission calculator',
            'Instant payouts',
            'Monthly payouts',
            'MLM commission distribution',
            'Tax calculation (GST, TDS)',
            'Post-transaction automation',
            'Multi-gateway support',
            'Comprehensive reporting'
        ],
        flowExamples: {
            'Course Purchase': {
                description: 'Client buys coach course',
                flow: [
                    'Client initiates course purchase',
                    'Money goes to central account',
                    'Platform fee deducted',
                    'Commission calculated for coach',
                    'Course added to client account',
                    'Coach earnings updated',
                    'Notifications sent',
                    'Automations triggered'
                ]
            },
            'Subscription Payment': {
                description: 'Coach pays platform subscription',
                flow: [
                    'Coach initiates subscription payment',
                    'Money goes to central account',
                    'Subscription activated',
                    'Payment recorded',
                    'Notifications sent'
                ]
            },
            'Instant Payout': {
                description: 'Coach requests instant payout',
                flow: [
                    'Coach requests instant payout',
                    'Payout fee calculated',
                    'Money transferred to coach',
                    'Transaction recorded',
                    'Confirmation sent'
                ]
            }
        }
    });
});

/**
 * Get payment statistics
 * GET /api/unified-payments/statistics
 */
router.get('/statistics', protect, unifiedPaymentController.getTransactionStatistics);

/**
 * Process refund
 * POST /api/unified-payments/refund/:transactionId
 */
router.post('/refund/:transactionId', protect, unifiedPaymentController.processRefund);

/**
 * Get checkout page redirect URL
 * GET /api/unified-payments/checkout/:pageId
 */
router.get('/checkout/:pageId', unifiedPaymentController.getCheckoutPageRedirect);

/**
 * Process payment completion from frontend
 * POST /api/unified-payments/checkout/complete
 */
router.post('/checkout/complete', unifiedPaymentController.processCheckoutCompletion);

// ==================== ADMIN ROUTES ====================

/**
 * Get all payments (Admin)
 * GET /api/unified-payments/admin/payments
 */
router.get('/admin/payments', verifyAdminToken, unifiedPaymentController.getAllPayments);

/**
 * Update payment status (Admin)
 * PUT /api/unified-payments/admin/payment/:id/status
 */
router.put('/admin/payment/:id/status', verifyAdminToken, unifiedPaymentController.updatePaymentStatus);

/**
 * Delete payment (Admin)
 * DELETE /api/unified-payments/admin/payment/:id
 */
router.delete('/admin/payment/:id', verifyAdminToken, unifiedPaymentController.deletePayment);

module.exports = router;
