const express = require('express');
const router = express.Router();
const checkoutPageController = require('../controllers/checkoutPageController');
const { protect } = require('../middleware/auth');
const { verifyAdminToken } = require('../middleware/adminAuth');

// ==================== PUBLIC ROUTES ====================

/**
 * Get checkout page by ID (public access for active pages)
 * GET /api/checkout-pages/public/:pageId
 */
router.get('/public/:pageId', checkoutPageController.getCheckoutPage);

/**
 * Get checkout page categories
 * GET /api/checkout-pages/categories
 */
router.get('/categories', checkoutPageController.getCheckoutPageCategories);

// ==================== AUTHENTICATED ROUTES ====================

/**
 * Create checkout page
 * POST /api/checkout-pages
 */
router.post('/', protect, checkoutPageController.createCheckoutPage);

/**
 * Get checkout page by ID
 * GET /api/checkout-pages/:pageId
 */
router.get('/:pageId', protect, checkoutPageController.getCheckoutPage);

/**
 * Get all checkout pages (with filters)
 * GET /api/checkout-pages
 */
router.get('/', protect, checkoutPageController.getAllCheckoutPages);

/**
 * Update checkout page
 * PUT /api/checkout-pages/:pageId
 */
router.put('/:pageId', protect, checkoutPageController.updateCheckoutPage);

/**
 * Delete checkout page
 * DELETE /api/checkout-pages/:pageId
 */
router.delete('/:pageId', protect, checkoutPageController.deleteCheckoutPage);

/**
 * Duplicate checkout page
 * POST /api/checkout-pages/:pageId/duplicate
 */
router.post('/:pageId/duplicate', protect, checkoutPageController.duplicateCheckoutPage);

/**
 * Get checkout page statistics
 * GET /api/checkout-pages/:pageId/stats
 */
router.get('/:pageId/stats', protect, checkoutPageController.getCheckoutPageStats);

// ==================== API DOCUMENTATION ====================

/**
 * API documentation
 * GET /api/checkout-pages/docs
 */
router.get('/docs', (req, res) => {
    res.json({
        success: true,
        message: 'Checkout Page System API Documentation',
        version: '1.0.0',
        endpoints: {
            // Public Endpoints
            'GET /public/:pageId': {
                description: 'Get public checkout page by ID',
                params: {
                    pageId: 'string (required) - Unique page identifier'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'checkout page object'
                }
            },
            'GET /categories': {
                description: 'Get available checkout page categories',
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'array of category objects'
                }
            },

            // Authenticated Endpoints
            'POST /': {
                description: 'Create new checkout page',
                auth: 'JWT token required',
                body: {
                    pageId: 'string (required) - Unique page identifier',
                    name: 'string (required) - Page name',
                    description: 'string (optional) - Page description',
                    category: 'string (required) - selling, subscription, donation, membership, service, event, custom',
                    configuration: 'object (optional) - Page configuration settings',
                    businessLogic: 'object (optional) - Business logic settings',
                    status: 'string (optional) - active, inactive, draft, archived',
                    isPublic: 'boolean (optional) - Whether page is publicly accessible',
                    accessControl: 'object (optional) - Access control settings',
                    analytics: 'object (optional) - Analytics settings',
                    seo: 'object (optional) - SEO settings'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'created checkout page object'
                }
            },
            'GET /:pageId': {
                description: 'Get checkout page by ID',
                auth: 'JWT token required',
                params: {
                    pageId: 'string (required) - Unique page identifier'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'checkout page object'
                }
            },
            'GET /': {
                description: 'Get all checkout pages with filters',
                auth: 'JWT token required',
                query: {
                    page: 'number (optional, default: 1)',
                    limit: 'number (optional, default: 10)',
                    category: 'string (optional) - Filter by category',
                    status: 'string (optional) - Filter by status',
                    createdBy: 'string (optional) - Filter by creator',
                    search: 'string (optional) - Search in name, description, pageId'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        checkoutPages: 'array',
                        pagination: 'object'
                    }
                }
            },
            'PUT /:pageId': {
                description: 'Update checkout page',
                auth: 'JWT token required',
                params: {
                    pageId: 'string (required) - Unique page identifier'
                },
                body: 'checkout page update object',
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'updated checkout page object'
                }
            },
            'DELETE /:pageId': {
                description: 'Delete checkout page',
                auth: 'JWT token required',
                params: {
                    pageId: 'string (required) - Unique page identifier'
                },
                response: {
                    success: 'boolean',
                    message: 'string'
                }
            },
            'POST /:pageId/duplicate': {
                description: 'Duplicate checkout page',
                auth: 'JWT token required',
                params: {
                    pageId: 'string (required) - Original page identifier'
                },
                body: {
                    newPageId: 'string (required) - New page identifier',
                    newName: 'string (required) - New page name'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: 'duplicated checkout page object'
                }
            },
            'GET /:pageId/stats': {
                description: 'Get checkout page statistics',
                auth: 'JWT token required',
                params: {
                    pageId: 'string (required) - Unique page identifier'
                },
                response: {
                    success: 'boolean',
                    message: 'string',
                    data: {
                        pageId: 'string',
                        pageName: 'string',
                        category: 'string',
                        status: 'string',
                        stats: {
                            totalTransactions: 'number',
                            totalAmount: 'number',
                            successfulTransactions: 'number',
                            failedTransactions: 'number',
                            pendingTransactions: 'number',
                            conversionRate: 'number'
                        }
                    }
                }
            }
        },
        categories: [
            'selling',           // Product/course selling
            'subscription',      // Platform subscription
            'donation',          // Donation/charity
            'membership',        // Membership fees
            'service',           // Service payments
            'event',             // Event registration
            'custom'             // Custom category
        ],
        configuration: {
            theme: {
                primaryColor: 'string',
                secondaryColor: 'string',
                backgroundColor: 'string',
                textColor: 'string'
            },
            content: {
                title: 'string',
                subtitle: 'string',
                description: 'string',
                successMessage: 'string',
                failureMessage: 'string'
            },
            payment: {
                currency: 'string',
                supportedGateways: 'array',
                defaultGateway: 'string',
                allowMultipleCurrencies: 'boolean',
                showCurrencySelector: 'boolean'
            },
            fields: {
                showName: 'boolean',
                showEmail: 'boolean',
                showPhone: 'boolean',
                showAddress: 'boolean',
                showCompany: 'boolean',
                showTaxId: 'boolean',
                requiredFields: 'array'
            },
            product: {
                showProductImage: 'boolean',
                showProductDescription: 'boolean',
                showQuantitySelector: 'boolean',
                showDiscountCode: 'boolean',
                showTaxBreakdown: 'boolean',
                showCommissionBreakdown: 'boolean'
            },
            security: {
                requireCaptcha: 'boolean',
                requireTermsAcceptance: 'boolean',
                requirePrivacyPolicy: 'boolean',
                showSecurityBadges: 'boolean',
                enableFraudProtection: 'boolean'
            },
            postPayment: {
                redirectUrl: 'string',
                showThankYouPage: 'boolean',
                sendEmailReceipt: 'boolean',
                sendWhatsAppReceipt: 'boolean',
                triggerAutomation: 'boolean',
                addToMailingList: 'boolean'
            }
        },
        businessLogic: {
            commission: {
                enableCommission: 'boolean',
                commissionType: 'string',
                commissionValue: 'number',
                coachId: 'ObjectId'
            },
            tax: {
                enableGST: 'boolean',
                gstPercentage: 'number',
                enableTDS: 'boolean',
                tdsPercentage: 'number',
                tdsThreshold: 'number'
            },
            payout: {
                enableInstantPayout: 'boolean',
                payoutPercentage: 'number',
                payoutDelay: 'number'
            }
        },
        features: [
            'Customizable checkout pages',
            'Multiple categories (selling, subscription, etc.)',
            'Theme customization',
            'Payment gateway configuration',
            'Form field customization',
            'Security settings',
            'Post-payment actions',
            'Analytics and tracking',
            'SEO optimization',
            'Access control',
            'Page duplication',
            'Statistics and reporting'
        ],
        integration: {
            'Unified Payment System': 'Seamless integration with payment processing',
            'Frontend Templates': 'Same UI structure with dynamic configuration',
            'Analytics': 'Conversion tracking and performance metrics',
            'Automation': 'Post-payment automation triggers',
            'Notifications': 'Email and WhatsApp receipt sending'
        }
    });
});

module.exports = router;
