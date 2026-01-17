const unifiedPaymentService = require('../services/unifiedPaymentService');
const GlobalPaymentSettings = require('../schema/GlobalPaymentSettings');
const UnifiedPaymentTransaction = require('../schema/UnifiedPaymentTransaction');
const CheckoutPage = require('../schema/CheckoutPage');
const User = require('../schema/User');

const logger = require('../utils/logger');

class UnifiedPaymentController {

    /**
     * Create unified payment session
     * POST /api/unified-payments/create-session
     */
    async createPaymentSession(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Creating payment session');

            const {
                transactionType,
                grossAmount,
                senderId,
                senderType,
                receiverId,
                receiverType,
                productId,
                productType,
                productName,
                productDescription,
                coachId,
                mlmLevel,
                sponsorId,
                gateway = 'razorpay',
                checkoutPageId,
                metadata = {}
            } = req.body;

            // Validate required fields
            if (!transactionType || !grossAmount || !senderId || !senderType || !receiverId || !receiverType) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: transactionType, grossAmount, senderId, senderType, receiverId, receiverType'
                });
            }

            // Get checkout page configuration if provided
            let checkoutPageConfig = null;
            if (checkoutPageId) {
                const checkoutPage = await CheckoutPage.findOne({ 
                    pageId: checkoutPageId, 
                    status: 'active' 
                });
                
                if (checkoutPage) {
                    checkoutPageConfig = {
                        pageId: checkoutPage.pageId,
                        configuration: checkoutPage.configuration,
                        businessLogic: checkoutPage.businessLogic
                    };
                    
                    // Override gateway if specified in checkout page
                    if (checkoutPage.configuration?.payment?.defaultGateway) {
                        gateway = checkoutPage.configuration.payment.defaultGateway;
                    }
                }
            }

            // Create payment session
            const result = await unifiedPaymentService.createPaymentSession({
                transactionType,
                grossAmount,
                senderId,
                senderType,
                receiverId,
                receiverType,
                productId,
                productType,
                productName,
                productDescription,
                coachId,
                mlmLevel,
                sponsorId,
                gateway,
                checkoutPage: checkoutPageConfig,
                metadata
            });

            logger.info(`[UnifiedPaymentController] Payment session created: ${result.transactionId}`);

            res.status(201).json({
                success: true,
                message: 'Payment session created successfully',
                data: result
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error creating payment session:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating payment session',
                error: error.message
            });
        }
    }

    /**
     * Process course purchase
     * POST /api/unified-payments/course-purchase
     */
    async processCoursePurchase(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Processing course purchase');

            const {
                courseId,
                clientId,
                coachId,
                amount,
                gateway = 'razorpay'
            } = req.body;

            // Validate required fields
            if (!courseId || !clientId || !coachId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: courseId, clientId, coachId, amount'
                });
            }

            // Get course details
            const course = await Product.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            // Get client and coach details
            const client = await User.findById(clientId);
            const coach = await User.findById(coachId);

            if (!client || !coach) {
                return res.status(404).json({
                    success: false,
                    message: 'Client or coach not found'
                });
            }

            // Create payment session for course purchase
            const result = await unifiedPaymentService.createPaymentSession({
                transactionType: 'course_purchase',
                grossAmount: amount,
                senderId: clientId,
                senderType: 'customer',
                receiverId: 'central_account', // Money goes to central account first
                receiverType: 'system',
                productId: courseId,
                productType: 'course',
                productName: course.name,
                productDescription: course.description,
                coachId: coachId,
                gateway,
                metadata: {
                    source: 'web',
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            logger.info(`[UnifiedPaymentController] Course purchase session created: ${result.transactionId}`);

            res.status(201).json({
                success: true,
                message: 'Course purchase session created successfully',
                data: result
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error processing course purchase:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing course purchase',
                error: error.message
            });
        }
    }

    /**
     * Process platform subscription
     * POST /api/unified-payments/subscription-payment
     */
    async processSubscriptionPayment(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Processing subscription payment');

            const {
                coachId,
                subscriptionPlan,
                amount,
                billingCycle,
                gateway = 'razorpay'
            } = req.body;

            // Validate required fields
            if (!coachId || !subscriptionPlan || !amount || !billingCycle) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: coachId, subscriptionPlan, amount, billingCycle'
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

            // Create payment session for subscription
            const result = await unifiedPaymentService.createPaymentSession({
                transactionType: 'subscription_payment',
                grossAmount: amount,
                senderId: coachId,
                senderType: 'coach',
                receiverId: 'central_account', // Money goes to central account
                receiverType: 'system',
                productId: null,
                productType: 'subscription',
                productName: `${subscriptionPlan} Subscription`,
                productDescription: `${billingCycle} subscription for ${subscriptionPlan}`,
                coachId: coachId,
                gateway,
                metadata: {
                    subscriptionPlan,
                    billingCycle,
                    source: 'web',
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            logger.info(`[UnifiedPaymentController] Subscription payment session created: ${result.transactionId}`);

            res.status(201).json({
                success: true,
                message: 'Subscription payment session created successfully',
                data: result
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error processing subscription payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing subscription payment',
                error: error.message
            });
        }
    }

    /**
     * Process instant payout
     * POST /api/unified-payments/instant-payout
     */
    async processInstantPayout(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Processing instant payout');

            const {
                coachId,
                amount,
                payoutMethod,
                destination
            } = req.body;

            // Validate required fields
            if (!coachId || !amount || !payoutMethod || !destination) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: coachId, amount, payoutMethod, destination'
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

            // Process instant payout
            const result = await unifiedPaymentService.processInstantPayout(
                coachId,
                amount,
                payoutMethod,
                destination
            );

            logger.info(`[UnifiedPaymentController] Instant payout processed: ${result.transactionId}`);

            res.status(200).json({
                success: true,
                message: 'Instant payout processed successfully',
                data: result
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error processing instant payout:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing instant payout',
                error: error.message
            });
        }
    }

    /**
     * Get commission calculator data
     * GET /api/unified-payments/commission-calculator
     */
    async getCommissionCalculator(req, res) {
        try {
            const { amount, coachId, mlmLevel } = req.query;

            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount is required'
                });
            }

            const calculatorData = await unifiedPaymentService.getCommissionCalculatorData(
                parseFloat(amount),
                coachId,
                parseInt(mlmLevel)
            );

            res.status(200).json({
                success: true,
                message: 'Commission calculator data retrieved successfully',
                data: calculatorData
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error getting commission calculator data:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting commission calculator data',
                error: error.message
            });
        }
    }

    /**
     * Get global payment settings
     * GET /api/unified-payments/settings
     */
    async getGlobalSettings(req, res) {
        try {
            const settings = await GlobalPaymentSettings.findOne();
            
            if (!settings) {
                return res.status(404).json({
                    success: false,
                    message: 'Global payment settings not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Global payment settings retrieved successfully',
                data: settings
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error getting global settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting global settings',
                error: error.message
            });
        }
    }

    /**
     * Update global payment settings (Admin only)
     * PUT /api/unified-payments/settings
     */
    async updateGlobalSettings(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Updating global payment settings');

            const updateData = req.body;
            const adminId = req.user.id; // From auth middleware

            // Add admin metadata
            updateData.metadata = {
                ...updateData.metadata,
                lastModifiedBy: adminId,
                lastModifiedAt: new Date()
            };

            const settings = await GlobalPaymentSettings.findOneAndUpdate(
                {},
                updateData,
                { new: true, upsert: true }
            );

            logger.info('[UnifiedPaymentController] Global payment settings updated');

            res.status(200).json({
                success: true,
                message: 'Global payment settings updated successfully',
                data: settings
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error updating global settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating global settings',
                error: error.message
            });
        }
    }

    /**
     * Get transaction statistics
     * GET /api/unified-payments/statistics
     */
    async getTransactionStatistics(req, res) {
        try {
            const filters = req.query;
            const stats = await unifiedPaymentService.getTransactionStatistics(filters);

            res.status(200).json({
                success: true,
                message: 'Transaction statistics retrieved successfully',
                data: stats
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error getting transaction statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting transaction statistics',
                error: error.message
            });
        }
    }

    /**
     * Get transaction by ID
     * GET /api/unified-payments/transaction/:transactionId
     */
    async getTransactionById(req, res) {
        try {
            const { transactionId } = req.params;

            const transaction = await UnifiedPaymentTransaction.findOne({ transactionId })
                .populate('sender.id', 'name email')
                .populate('receiver.id', 'name email')
                .populate('product.id', 'name description')
                .populate('product.coachId', 'name email');

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Transaction retrieved successfully',
                data: transaction
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error getting transaction:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting transaction',
                error: error.message
            });
        }
    }

    /**
     * Get transactions by user
     * GET /api/unified-payments/user/:userId
     */
    async getTransactionsByUser(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, transactionType, status } = req.query;

            const matchStage = {
                $or: [
                    { 'sender.id': userId },
                    { 'receiver.id': userId }
                ]
            };

            if (transactionType) {
                matchStage.transactionType = transactionType;
            }

            if (status) {
                matchStage.status = status;
            }

            const transactions = await UnifiedPaymentTransaction.aggregate([
                { $match: matchStage },
                { $sort: { initiatedAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: parseInt(limit) },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'sender.id',
                        foreignField: '_id',
                        as: 'senderDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'receiver.id',
                        foreignField: '_id',
                        as: 'receiverDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'product.id',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                }
            ]);

            const total = await UnifiedPaymentTransaction.countDocuments(matchStage);

            res.status(200).json({
                success: true,
                message: 'User transactions retrieved successfully',
                data: {
                    transactions,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error getting user transactions:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting user transactions',
                error: error.message
            });
        }
    }

    /**
     * Process webhook
     * POST /api/unified-payments/webhook/:gateway
     */
    async processWebhook(req, res) {
        try {
            const { gateway } = req.params;
            const webhookData = req.body;

            logger.info(`[UnifiedPaymentController] Processing ${gateway} webhook`);

            // Verify webhook signature (implement based on gateway)
            // const isValid = await this.verifyWebhookSignature(gateway, webhookData, req.headers);
            // if (!isValid) {
            //     return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            // }

            // Process payment completion
            const transactionId = webhookData.transactionId || webhookData.order_id;
            const result = await unifiedPaymentService.processPaymentCompletion(transactionId, webhookData);

            logger.info(`[UnifiedPaymentController] Webhook processed successfully: ${transactionId}`);

            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
                data: result
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error processing webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing webhook',
                error: error.message
            });
        }
    }

    /**
     * Health check
     * GET /api/unified-payments/health
     */
    async healthCheck(req, res) {
        try {
            const settings = await GlobalPaymentSettings.findOne();
            const totalTransactions = await UnifiedPaymentTransaction.countDocuments();

            res.status(200).json({
                success: true,
                message: 'Unified Payment System is healthy',
                data: {
                    status: 'healthy',
                    settingsConfigured: !!settings,
                    totalTransactions,
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Health check failed:', error);
            res.status(500).json({
                success: false,
                message: 'Health check failed',
                error: error.message
            });
        }
    }

    /**
     * Process refund
     * POST /api/unified-payments/refund/:transactionId
     */
    async processRefund(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Processing refund');
            
            const { transactionId } = req.params;
            const { reason, amount } = req.body;
            
            const refund = await unifiedPaymentService.processRefund(transactionId, {
                reason,
                amount
            });
            
            res.json({
                success: true,
                data: refund
            });
        } catch (error) {
            logger.error('[UnifiedPaymentController] Error processing refund:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process refund',
                error: error.message
            });
        }
    }

    /**
     * Get all payments (Admin)
     * GET /api/unified-payments/admin/payments
     */
    async getAllPayments(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Getting all payments');
            
            const { page = 1, limit = 20, status, transactionType } = req.query;
            
            const payments = await unifiedPaymentService.getAllPayments({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                transactionType
            });
            
            res.json({
                success: true,
                data: payments
            });
        } catch (error) {
            logger.error('[UnifiedPaymentController] Error getting payments:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payments',
                error: error.message
            });
        }
    }

    /**
     * Update payment status (Admin)
     * PUT /api/unified-payments/admin/payment/:id/status
     */
    async updatePaymentStatus(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Updating payment status');
            
            const { id } = req.params;
            const { status, notes } = req.body;
            
            const payment = await unifiedPaymentService.updatePaymentStatus(id, status, notes);
            
            res.json({
                success: true,
                data: payment
            });
        } catch (error) {
            logger.error('[UnifiedPaymentController] Error updating payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment status',
                error: error.message
            });
        }
    }

    /**
     * Delete payment (Admin)
     * DELETE /api/unified-payments/admin/payment/:id
     */
    async deletePayment(req, res) {
        try {
            logger.info('[UnifiedPaymentController] Deleting payment');
            
            const { id } = req.params;
            
            await unifiedPaymentService.deletePayment(id);
            
            res.json({
                success: true,
                message: 'Payment deleted successfully'
            });
        } catch (error) {
            logger.error('[UnifiedPaymentController] Error deleting payment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete payment',
                error: error.message
            });
        }
    }

    /**
     * Get checkout page redirect URL
     * GET /api/unified-payments/checkout/:pageId
     */
    async getCheckoutPageRedirect(req, res) {
        try {
            const { pageId } = req.params;
            const { transactionId } = req.query;

            // Get checkout page
            const checkoutPage = await CheckoutPage.findOne({ 
                pageId, 
                status: 'active' 
            });

            if (!checkoutPage) {
                return res.status(404).json({
                    success: false,
                    message: 'Checkout page not found or inactive'
                });
            }

            // Get transaction if provided
            let transaction = null;
            if (transactionId) {
                transaction = await UnifiedPaymentTransaction.findOne({ transactionId });
                if (!transaction) {
                    return res.status(404).json({
                        success: false,
                        message: 'Transaction not found'
                    });
                }
            }

            // Generate redirect URL
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const redirectUrl = `${baseUrl}/checkout/${pageId}${transactionId ? `?transactionId=${transactionId}` : ''}`;

            res.status(200).json({
                success: true,
                message: 'Checkout page redirect URL generated successfully',
                data: {
                    redirectUrl,
                    checkoutPage: {
                        pageId: checkoutPage.pageId,
                        name: checkoutPage.name,
                        category: checkoutPage.category,
                        configuration: checkoutPage.configuration
                    },
                    transaction: transaction ? {
                        transactionId: transaction.transactionId,
                        status: transaction.status,
                        grossAmount: transaction.grossAmount,
                        currency: transaction.currency
                    } : null
                }
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error getting checkout redirect:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating checkout redirect URL',
                error: error.message
            });
        }
    }

    /**
     * Process payment completion from frontend
     * POST /api/unified-payments/checkout/complete
     */
    async processCheckoutCompletion(req, res) {
        try {
            const { transactionId, paymentData } = req.body;

            if (!transactionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID is required'
                });
            }

            // Process payment completion
            const result = await unifiedPaymentService.processPaymentCompletion(transactionId, paymentData);

            res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    transactionId: result.transactionId,
                    status: result.status,
                    redirectUrl: result.checkoutPage?.configuration?.postPayment?.redirectUrl,
                    successMessage: result.checkoutPage?.configuration?.content?.successMessage
                }
            });

        } catch (error) {
            logger.error('[UnifiedPaymentController] Error processing checkout completion:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing payment completion',
                error: error.message
            });
        }
    }
}

module.exports = new UnifiedPaymentController();
