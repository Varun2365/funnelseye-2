const express = require('express');
const router = express.Router();
const centralPaymentController = require('../controllers/centralPaymentController');
const { protect } = require('../middleware/auth');
const { verifyAdminToken } = require('../middleware/adminAuth');

// ==================== PUBLIC ROUTES ====================

/**
 * Create payment session
 * POST /api/funnelseye-payments/create-session
 */
router.post('/create-session', protect, centralPaymentController.createPaymentSession);

/**
 * Get payment by ID
 * GET /api/funnelseye-payments/payment/:paymentId
 */
router.get('/payment/:paymentId', protect, centralPaymentController.getPaymentById);

/**
 * Get payments by user
 * GET /api/funnelseye-payments/user/:userId
 */
router.get('/user/:userId', protect, centralPaymentController.getPaymentsByUser);

/**
 * Process payment webhook
 * POST /api/funnelseye-payments/webhook/:gateway
 */
router.post('/webhook/:gateway', centralPaymentController.processWebhook);

/**
 * Refund payment
 * POST /api/funnelseye-payments/refund/:paymentId
 */
router.post('/refund/:paymentId', protect, centralPaymentController.refundPayment);

/**
 * Get payment statistics
 * GET /api/funnelseye-payments/stats
 */
router.get('/stats', protect, centralPaymentController.getPaymentStats);

// ==================== ADMIN ROUTES ====================

/**
 * Get all payments (admin)
 * GET /api/funnelseye-payments/admin/payments
 */
router.get('/admin/payments', verifyAdminToken, centralPaymentController.getAllPayments);

/**
 * Update payment status (admin)
 * PUT /api/funnelseye-payments/admin/payment/:paymentId/status
 */
router.put('/admin/payment/:paymentId/status', verifyAdminToken, centralPaymentController.updatePaymentStatus);

/**
 * Get payment gateway configurations (admin)
 * GET /api/funnelseye-payments/admin/gateways
 */
router.get('/admin/gateways', verifyAdminToken, centralPaymentController.getGatewayConfigs);

/**
 * Create payment gateway configuration (admin)
 * POST /api/funnelseye-payments/admin/gateway
 */
router.post('/admin/gateway', verifyAdminToken, centralPaymentController.createGatewayConfig);

/**
 * Update payment gateway configuration (admin)
 * PUT /api/funnelseye-payments/admin/gateway/:gatewayName
 */
router.put('/admin/gateway/:gatewayName', verifyAdminToken, centralPaymentController.updateGatewayConfig);

/**
 * Delete payment gateway configuration (admin)
 * DELETE /api/funnelseye-payments/admin/gateway/:gatewayName
 */
router.delete('/admin/gateway/:gatewayName', verifyAdminToken, centralPaymentController.deleteGatewayConfig);

/**
 * Test payment gateway (admin)
 * POST /api/funnelseye-payments/admin/gateway/:gatewayName/test
 */
router.post('/admin/gateway/:gatewayName/test', verifyAdminToken, centralPaymentController.testGateway);

// ==================== HEALTH CHECK ====================

/**
 * Health check endpoint
 * GET /api/funnelseye-payments/health
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Funnelseye Payments API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ==================== API DOCUMENTATION ====================

/**
 * API documentation endpoint
 * GET /api/funnelseye-payments/docs
 */
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'Funnelseye Payments API Documentation',
        endpoints: {
            // Public Endpoints
            'POST /create-session': {
                description: 'Create a new payment session',
                body: {
                    amount: 'number (required)',
                    currency: 'string (default: INR)',
                    paymentMethod: 'string (required)',
                    businessType: 'string (required)',
                    userId: 'string (required)',
                    userType: 'string (required)',
                    gateway: 'string (default: razorpay)',
                    productId: 'string (optional)',
                    productType: 'string (optional)',
                    productName: 'string (optional)',
                    billingAddress: 'object (optional)',
                    commissionAmount: 'number (optional)',
                    commissionPercentage: 'number (optional)',
                    mlmLevel: 'number (optional)',
                    sponsorId: 'string (optional)',
                    subscriptionId: 'string (optional)',
                    metadata: 'object (optional)',
                    notes: 'string (optional)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        paymentId: 'string',
                        orderId: 'string',
                        session: 'object',
                        payment: 'object'
                    }
                }
            },
            'GET /payment/:paymentId': {
                description: 'Get payment details by ID',
                params: {
                    paymentId: 'string (required)'
                },
                response: {
                    success: 'boolean',
                    data: 'payment object'
                }
            },
            'GET /user/:userId': {
                description: 'Get payments by user ID',
                params: {
                    userId: 'string (required)'
                },
                query: {
                    userType: 'string (optional)',
                    status: 'string (optional)',
                    businessType: 'string (optional)',
                    page: 'number (optional, default: 1)',
                    limit: 'number (optional, default: 10)'
                },
                response: {
                    success: 'boolean',
                    data: 'array of payments',
                    pagination: 'object'
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
                    data: 'webhook processing result'
                }
            },
            'POST /refund/:paymentId': {
                description: 'Refund a payment',
                params: {
                    paymentId: 'string (required)'
                },
                body: {
                    refundAmount: 'number (required)',
                    reason: 'string (required)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'refund result'
                }
            },
            'GET /stats': {
                description: 'Get payment statistics',
                query: {
                    startDate: 'string (optional) - ISO date',
                    endDate: 'string (optional) - ISO date',
                    businessType: 'string (optional)',
                    status: 'string (optional)',
                    gateway: 'string (optional)'
                },
                response: {
                    success: 'boolean',
                    data: 'statistics object'
                }
            },
            // Admin Endpoints
            'GET /admin/payments': {
                description: 'Get all payments (admin only)',
                query: {
                    page: 'number (optional, default: 1)',
                    limit: 'number (optional, default: 20)',
                    status: 'string (optional)',
                    businessType: 'string (optional)',
                    gateway: 'string (optional)',
                    userId: 'string (optional)',
                    startDate: 'string (optional) - ISO date',
                    endDate: 'string (optional) - ISO date'
                },
                response: {
                    success: 'boolean',
                    data: 'array of payments',
                    pagination: 'object'
                }
            },
            'PUT /admin/payment/:paymentId/status': {
                description: 'Update payment status (admin only)',
                params: {
                    paymentId: 'string (required)'
                },
                body: {
                    status: 'string (required)',
                    notes: 'string (optional)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'updated payment object'
                }
            },
            'GET /admin/gateways': {
                description: 'Get payment gateway configurations (admin only)',
                response: {
                    success: 'boolean',
                    data: 'array of gateway configs'
                }
            },
            'POST /admin/gateway': {
                description: 'Create payment gateway configuration (admin only)',
                body: {
                    gatewayName: 'string (required)',
                    isEnabled: 'boolean (optional)',
                    isActive: 'boolean (optional)',
                    priority: 'number (optional)',
                    config: 'object (optional)',
                    description: 'string (optional)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'gateway config object'
                }
            },
            'PUT /admin/gateway/:gatewayName': {
                description: 'Update payment gateway configuration (admin only)',
                params: {
                    gatewayName: 'string (required)'
                },
                body: 'gateway config update data',
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'updated gateway config object'
                }
            },
            'DELETE /admin/gateway/:gatewayName': {
                description: 'Delete payment gateway configuration (admin only)',
                params: {
                    gatewayName: 'string (required)'
                },
                response: {
                    success: 'boolean',
                    message: 'string'
                }
            },
            'POST /admin/gateway/:gatewayName/test': {
                description: 'Test payment gateway (admin only)',
                params: {
                    gatewayName: 'string (required)'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'test result object'
                }
            }
        },
        businessTypes: [
            'product_purchase',
            'subscription',
            'commission',
            'mlm_payout',
            'service_payment',
            'refund',
            'adjustment'
        ],
        paymentStatuses: [
            'pending',
            'processing',
            'completed',
            'failed',
            'cancelled',
            'refunded',
            'partially_refunded'
        ],
        supportedGateways: [
            'razorpay',
            'stripe',
            'paypal',
            'bank_transfer',
            'manual'
        ],
        supportedPaymentMethods: [
            'card',
            'upi',
            'netbanking',
            'wallet',
            'bank_transfer',
            'paypal',
            'apple_pay',
            'google_pay'
        ],
        supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
        features: [
            'Multi-gateway support',
            'Automatic tax calculation (GST, TDS)',
            'Commission management',
            'MLM payout processing',
            'Subscription billing',
            'Refund processing',
            'Webhook support',
            'Admin dashboard',
            'Payment analytics',
            'Gateway health monitoring'
        ]
    });
});

module.exports = router;
