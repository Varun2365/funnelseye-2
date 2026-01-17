const mongoose = require('mongoose');
const CoachSellablePlan = require('../schema/CoachSellablePlan');
const AdminProduct = require('../schema/AdminProduct');
const RazorpayPayment = require('../schema/RazorpayPayment');
const logger = require('../utils/logger');

// Use registered User model
const User = mongoose.model('User');

class CheckoutPageController {
    
    /**
     * Get checkout page data for coach plan
     * GET /api/paymentsv1/checkout/coach-plan/:planId
     */
    async getCoachPlanCheckoutData(req, res) {
        try {
            const { planId } = req.params;
            const { customerId, customerEmail, customerPhone } = req.query;
            
            logger.info(`[CheckoutPageController] Getting checkout data for coach plan: ${planId}`);
            
            // Get plan details
            const plan = await CoachSellablePlan.findOne({ 
                _id: planId, 
                status: 'active', 
                isPublic: true 
            })
                .populate('coachId', 'name email profilePicture')
                .populate('adminProductId', 'name description category productType features coverImage');
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found or not available for purchase'
                });
            }
            
            // Increment view count
            await CoachSellablePlan.findByIdAndUpdate(plan._id, { $inc: { viewCount: 1 } });
            
            // Prepare checkout data
            const checkoutData = {
                plan: {
                    _id: plan._id,
                    title: plan.title,
                    description: plan.description,
                    shortDescription: plan.shortDescription,
                    price: plan.price,
                    currency: plan.currency,
                    originalPrice: plan.originalPrice,
                    discountPercentage: plan.discountPercentage,
                    discountedPrice: plan.discountedPrice,
                    coverImage: plan.coverImage || plan.adminProductId?.coverImage,
                    features: [
                        ...(plan.adminProductId?.features || []),
                        ...(plan.additionalFeatures || [])
                    ],
                    contentFiles: [
                        ...(plan.adminProductId?.contentFiles || []),
                        ...(plan.additionalContentFiles || [])
                    ],
                    videoContent: [
                        ...(plan.adminProductId?.videoContent || []),
                        ...(plan.additionalVideoContent || [])
                    ]
                },
                coach: {
                    coachId: plan.coachId._id,
                    name: plan.coachId.name,
                    email: plan.coachId.email,
                    profilePicture: plan.coachId.profilePicture
                },
                product: {
                    productId: plan.adminProductId?._id,
                    name: plan.adminProductId?.name,
                    category: plan.adminProductId?.category,
                    productType: plan.adminProductId?.productType
                },
                pricing: {
                    basePrice: plan.adminProductId?.basePrice,
                    coachPrice: plan.price,
                    currency: plan.currency,
                    savings: plan.originalPrice ? plan.originalPrice - plan.price : 0
                },
                terms: {
                    termsAndConditions: plan.customTermsAndConditions || plan.adminProductId?.termsAndConditions,
                    refundPolicy: plan.customRefundPolicy || plan.adminProductId?.refundPolicy
                },
                customer: {
                    customerId: customerId,
                    customerEmail: customerEmail,
                    customerPhone: customerPhone
                },
                razorpay: {
                    keyId: process.env.RAZORPAY_KEY_ID,
                    currency: plan.currency
                }
            };
            
            res.json({
                success: true,
                data: checkoutData
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error getting coach plan checkout data:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout data',
                error: error.message
            });
        }
    }
    
    /**
     * Get checkout page data for platform subscription
     * GET /api/paymentsv1/checkout/subscription
     */
    async getSubscriptionCheckoutData(req, res) {
        try {
            const { coachId, subscriptionPlan, billingCycle, amount } = req.query;
            
            logger.info(`[CheckoutPageController] Getting checkout data for subscription`);
            
            // Validate required parameters
            if (!coachId || !subscriptionPlan || !billingCycle || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'coachId, subscriptionPlan, billingCycle, and amount are required'
                });
            }
            
            // Get coach details
            const coach = await User.findById(coachId);
            if (!coach) {
                return res.status(404).json({
                    success: false,
                    message: 'Coach not found'
                });
            }
            
            // Prepare subscription checkout data
            const checkoutData = {
                subscription: {
                    plan: subscriptionPlan,
                    billingCycle: billingCycle,
                    amount: parseFloat(amount),
                    currency: 'INR',
                    description: `${billingCycle} subscription for ${subscriptionPlan} plan`
                },
                coach: {
                    coachId: coach._id,
                    name: coach.name,
                    email: coach.email,
                    profilePicture: coach.profilePicture
                },
                features: this.getSubscriptionFeatures(subscriptionPlan),
                terms: {
                    termsAndConditions: this.getSubscriptionTerms(),
                    refundPolicy: this.getSubscriptionRefundPolicy()
                },
                razorpay: {
                    keyId: process.env.RAZORPAY_KEY_ID,
                    currency: 'INR'
                }
            };
            
            res.json({
                success: true,
                data: checkoutData
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error getting subscription checkout data:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting subscription checkout data',
                error: error.message
            });
        }
    }
    
    /**
     * Process checkout completion
     * POST /api/paymentsv1/checkout/complete
     */
    async processCheckoutCompletion(req, res) {
        try {
            const { 
                orderId, 
                paymentId, 
                signature, 
                planId, 
                customerId, 
                customerEmail, 
                customerPhone,
                businessType 
            } = req.body;
            
            logger.info(`[CheckoutPageController] Processing checkout completion`);
            
            // Validate required fields
            if (!orderId || !paymentId || !signature) {
                return res.status(400).json({
                    success: false,
                    message: 'orderId, paymentId, and signature are required'
                });
            }
            
            // Get payment record
            const payment = await RazorpayPayment.findOne({ razorpayOrderId: orderId });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment record not found'
                });
            }
            
            // Verify payment status
            if (payment.status !== 'captured') {
                return res.status(400).json({
                    success: false,
                    message: 'Payment not captured yet'
                });
            }
            
            // Prepare completion data based on business type
            let completionData = {
                paymentId: payment.razorpayPaymentId,
                orderId: payment.razorpayOrderId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                businessType: payment.businessType
            };
            
            if (payment.businessType === 'coach_plan_purchase') {
                const plan = await CoachSellablePlan.findById(payment.planId).populate('coachId');
                completionData.plan = {
                    planId: plan.planId,
                    title: plan.title,
                    coach: {
                        name: plan.coachId.name,
                        email: plan.coachId.email
                    }
                };
                completionData.access = {
                    contentFiles: [
                        ...(plan.adminProductId?.contentFiles || []),
                        ...(plan.additionalContentFiles || [])
                    ],
                    videoContent: [
                        ...(plan.adminProductId?.videoContent || []),
                        ...(plan.additionalVideoContent || [])
                    ]
                };
            } else if (payment.businessType === 'platform_subscription') {
                completionData.subscription = {
                    plan: payment.productName,
                    coachId: payment.coachId
                };
            }
            
            res.json({
                success: true,
                message: 'Checkout completed successfully',
                data: completionData
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error processing checkout completion:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing checkout completion',
                error: error.message
            });
        }
    }
    
    /**
     * Get payment history for user
     * GET /api/paymentsv1/checkout/payment-history/:userId
     */
    async getPaymentHistory(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20, businessType } = req.query;
            
            logger.info(`[CheckoutPageController] Getting payment history for user: ${userId}`);
            
            // Build query
            const query = { userId };
            if (businessType) query.businessType = businessType;
            
            // Execute query with pagination
            const skip = (page - 1) * limit;
            const payments = await RazorpayPayment.find(query)
                .populate('coachId', 'name email')
                .populate('planId', 'title price')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await RazorpayPayment.countDocuments(query);
            
            // Format payment history
            const paymentHistory = payments.map(payment => ({
                paymentId: payment.razorpayPaymentId,
                orderId: payment.razorpayOrderId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                businessType: payment.businessType,
                productName: payment.productName,
                productDescription: payment.productDescription,
                createdAt: payment.createdAt,
                capturedAt: payment.capturedAt,
                coach: payment.coachId ? {
                    name: payment.coachId.name,
                    email: payment.coachId.email
                } : null,
                plan: payment.planId ? {
                    title: payment.planId.title,
                    price: payment.planId.price
                } : null
            }));
            
            res.json({
                success: true,
                data: paymentHistory,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPayments: total,
                    hasNextPage: skip + payments.length < total,
                    hasPrevPage: page > 1
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error getting payment history:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting payment history',
                error: error.message
            });
        }
    }
    
    /**
     * Generate checkout page URL
     * POST /api/paymentsv1/checkout/generate-url
     */
    async generateCheckoutUrl(req, res) {
        try {
            const { planId, businessType, coachId, subscriptionPlan, billingCycle, amount } = req.body;
            
            logger.info(`[CheckoutPageController] Generating checkout URL`);
            
            let checkoutUrl;
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            
            if (businessType === 'coach_plan_purchase' && planId) {
                checkoutUrl = `${baseUrl}/checkout/coach-plan/${planId}`;
            } else if (businessType === 'platform_subscription' && coachId && subscriptionPlan && billingCycle && amount) {
                const params = new URLSearchParams({
                    coachId,
                    subscriptionPlan,
                    billingCycle,
                    amount
                });
                checkoutUrl = `${baseUrl}/checkout/subscription?${params.toString()}`;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parameters for checkout URL generation'
                });
            }
            
            res.json({
                success: true,
                data: {
                    checkoutUrl,
                    businessType,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error generating checkout URL:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating checkout URL',
                error: error.message
            });
        }
    }
    
    /**
     * Get subscription features based on plan
     */
    getSubscriptionFeatures(plan) {
        const features = {
            basic: [
                'Access to basic coaching tools',
                'Up to 10 clients',
                'Basic analytics',
                'Email support'
            ],
            professional: [
                'Access to all coaching tools',
                'Up to 50 clients',
                'Advanced analytics',
                'Priority support',
                'Custom branding',
                'API access'
            ],
            enterprise: [
                'Access to all features',
                'Unlimited clients',
                'Advanced analytics & reporting',
                '24/7 priority support',
                'Custom branding',
                'Full API access',
                'White-label solution',
                'Dedicated account manager'
            ]
        };
        
        return features[plan.toLowerCase()] || features.basic;
    }
    
    /**
     * Get subscription terms
     */
    getSubscriptionTerms() {
        return `
        By subscribing to our platform, you agree to:
        1. Use the service in accordance with our terms of service
        2. Maintain the confidentiality of your account credentials
        3. Not share your account with unauthorized users
        4. Comply with all applicable laws and regulations
        5. Pay subscription fees on time
        
        We reserve the right to suspend or terminate accounts that violate these terms.
        `;
    }
    
    /**
     * Get subscription refund policy
     */
    getSubscriptionRefundPolicy() {
        return `
        Refund Policy:
        1. Monthly subscriptions: Refunds available within 7 days of initial purchase
        2. Annual subscriptions: Refunds available within 30 days of initial purchase
        3. No refunds for partial months/years already used
        4. Refunds processed within 5-10 business days
        5. Contact support for refund requests
        
        Refunds are processed to the original payment method.
        `;
    }
    
    /**
     * Get checkout page by ID (for existing routes compatibility)
     * GET /api/checkout-pages/:pageId
     */
    async getCheckoutPage(req, res) {
        try {
            const { pageId } = req.params;
            
            logger.info(`[CheckoutPageController] Getting checkout page: ${pageId}`);
            
            // For now, return a simple response since we're using the new payment system
            res.json({
                success: true,
                message: 'Checkout page system migrated to Payment System V1',
                data: {
                    pageId: pageId,
                    redirectUrl: `/api/paymentsv1/checkout/coach-plan/${pageId}`,
                    note: 'Please use the new Payment System V1 endpoints'
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error getting checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout page',
                error: error.message
            });
        }
    }
    
    /**
     * Get checkout page categories (for existing routes compatibility)
     * GET /api/checkout-pages/categories
     */
    async getCheckoutPageCategories(req, res) {
        try {
            logger.info('[CheckoutPageController] Getting checkout page categories');
            
            res.json({
                success: true,
                message: 'Checkout page categories retrieved successfully',
                data: [
                    'coach_plan_purchase',
                    'platform_subscription',
                    'mlm_commission',
                    'coach_payout',
                    'refund',
                    'other'
                ]
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error getting checkout page categories:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout page categories',
                error: error.message
            });
        }
    }
    
    /**
     * Create checkout page (for existing routes compatibility)
     * POST /api/checkout-pages
     */
    async createCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Creating checkout page');
            
            res.json({
                success: true,
                message: 'Checkout page creation migrated to Payment System V1',
                data: {
                    note: 'Please use the new Payment System V1 endpoints for creating checkout pages',
                    newEndpoints: [
                        'POST /api/paymentsv1/admin/products',
                        'POST /api/paymentsv1/coach/plans'
                    ]
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error creating checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating checkout page',
                error: error.message
            });
        }
    }
    
    /**
     * Get all checkout pages (for existing routes compatibility)
     * GET /api/checkout-pages
     */
    async getAllCheckoutPages(req, res) {
        try {
            logger.info('[CheckoutPageController] Getting all checkout pages');
            
            res.json({
                success: true,
                message: 'Checkout pages migrated to Payment System V1',
                data: {
                    note: 'Please use the new Payment System V1 endpoints',
                    newEndpoints: [
                        'GET /api/paymentsv1/public/plans',
                        'GET /api/paymentsv1/coach/plans'
                    ]
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error getting all checkout pages:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting all checkout pages',
                error: error.message
            });
        }
    }
    
    /**
     * Update checkout page (for existing routes compatibility)
     * PUT /api/checkout-pages/:pageId
     */
    async updateCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Updating checkout page');
            
            res.json({
                success: true,
                message: 'Checkout page updates migrated to Payment System V1',
                data: {
                    note: 'Please use the new Payment System V1 endpoints for updating pages',
                    newEndpoints: [
                        'PUT /api/paymentsv1/coach/plans/:planId',
                        'PUT /api/paymentsv1/admin/products/:productId'
                    ]
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error updating checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating checkout page',
                error: error.message
            });
        }
    }
    
    /**
     * Delete checkout page (for existing routes compatibility)
     * DELETE /api/checkout-pages/:pageId
     */
    async deleteCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Deleting checkout page');
            
            res.json({
                success: true,
                message: 'Checkout page deletion migrated to Payment System V1',
                data: {
                    note: 'Please use the new Payment System V1 endpoints for deleting pages',
                    newEndpoints: [
                        'DELETE /api/paymentsv1/coach/plans/:planId',
                        'DELETE /api/paymentsv1/admin/products/:productId'
                    ]
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error deleting checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting checkout page',
                error: error.message
            });
        }
    }
    
    /**
     * Duplicate checkout page (for existing routes compatibility)
     * POST /api/checkout-pages/:pageId/duplicate
     */
    async duplicateCheckoutPage(req, res) {
        try {
            logger.info('[CheckoutPageController] Duplicating checkout page');
            
            res.json({
                success: true,
                message: 'Checkout page duplication migrated to Payment System V1',
                data: {
                    note: 'Please use the new Payment System V1 endpoints for duplicating pages',
                    newEndpoints: [
                        'POST /api/paymentsv1/coach/plans (create new plan)',
                        'POST /api/paymentsv1/admin/products (create new product)'
                    ]
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error duplicating checkout page:', error);
            res.status(500).json({
                success: false,
                message: 'Error duplicating checkout page',
                error: error.message
            });
        }
    }
    
    /**
     * Get checkout page statistics (for existing routes compatibility)
     * GET /api/checkout-pages/:pageId/stats
     */
    async getCheckoutPageStats(req, res) {
        try {
            logger.info('[CheckoutPageController] Getting checkout page statistics');
            
            res.json({
                success: true,
                message: 'Checkout page statistics migrated to Payment System V1',
                data: {
                    note: 'Please use the new Payment System V1 endpoints for statistics',
                    newEndpoints: [
                        'GET /api/paymentsv1/coach/plans/stats',
                        'GET /api/paymentsv1/admin/products/:productId/stats'
                    ]
                }
            });
            
        } catch (error) {
            logger.error('[CheckoutPageController] Error getting checkout page statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting checkout page statistics',
                error: error.message
            });
        }
    }
}

// Create controller instance and bind all methods
const controller = new CheckoutPageController();

module.exports = {
    getCoachPlanCheckoutData: controller.getCoachPlanCheckoutData.bind(controller),
    getSubscriptionCheckoutData: controller.getSubscriptionCheckoutData.bind(controller),
    processCheckoutCompletion: controller.processCheckoutCompletion.bind(controller),
    getPaymentHistory: controller.getPaymentHistory.bind(controller),
    generateCheckoutUrl: controller.generateCheckoutUrl.bind(controller),
    // Existing routes compatibility methods
    getCheckoutPage: controller.getCheckoutPage.bind(controller),
    getCheckoutPageCategories: controller.getCheckoutPageCategories.bind(controller),
    createCheckoutPage: controller.createCheckoutPage.bind(controller),
    getAllCheckoutPages: controller.getAllCheckoutPages.bind(controller),
    updateCheckoutPage: controller.updateCheckoutPage.bind(controller),
    deleteCheckoutPage: controller.deleteCheckoutPage.bind(controller),
    duplicateCheckoutPage: controller.duplicateCheckoutPage.bind(controller),
    getCheckoutPageStats: controller.getCheckoutPageStats.bind(controller)
};