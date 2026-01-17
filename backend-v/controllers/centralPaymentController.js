const centralPaymentService = require('../services/centralPaymentService');
const PaymentGatewayConfig = require('../schema/PaymentGatewayConfig');
const CentralPayment = require('../schema/CentralPayment');
const logger = require('../utils/logger');

class CentralPaymentController {
    
    /**
     * Create a new payment session
     * POST /api/funnelseye-payments/create-session
     */
    async createPaymentSession(req, res) {
        try {
            logger.info('[CentralPaymentController] Creating payment session');
            
            const {
                amount,
                currency = 'INR',
                paymentMethod,
                businessType,
                productId,
                productType,
                productName,
                productDescription,
                billingAddress,
                userId,
                userType,
                gateway = 'razorpay',
                commissionAmount = 0,
                commissionPercentage = 0,
                mlmLevel = 0,
                sponsorId,
                subscriptionId,
                subscriptionPlan,
                billingCycle,
                metadata,
                notes
            } = req.body;

            // Validate required fields
            if (!amount || !businessType || !userId || !userType || !paymentMethod) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: amount, businessType, userId, userType, paymentMethod'
                });
            }

            // Create payment data
            const paymentData = {
                amount,
                currency,
                paymentMethod,
                businessType,
                productId,
                productType,
                productName,
                productDescription,
                billingAddress,
                userId,
                userType,
                gateway,
                commissionAmount,
                commissionPercentage,
                mlmLevel,
                sponsorId,
                subscriptionId,
                subscriptionPlan,
                billingCycle,
                metadata,
                notes
            };

            // Create payment session
            const result = await centralPaymentService.createPaymentSession(paymentData);

            logger.info(`[CentralPaymentController] Payment session created: ${result.paymentId}`);

            res.status(201).json({
                success: true,
                message: 'Payment session created successfully',
                data: result
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error creating payment session:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating payment session',
                error: error.message
            });
        }
    }

    /**
     * Get payment by ID
     * GET /api/funnelseye-payments/payment/:paymentId
     */
    async getPaymentById(req, res) {
        try {
            const { paymentId } = req.params;
            
            logger.info(`[CentralPaymentController] Getting payment: ${paymentId}`);

            const payment = await centralPaymentService.getPaymentById(paymentId);

            res.json({
                success: true,
                data: payment
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error getting payment:', error);
            res.status(404).json({
                success: false,
                message: 'Payment not found',
                error: error.message
            });
        }
    }

    /**
     * Get payments by user
     * GET /api/funnelseye-payments/user/:userId
     */
    async getPaymentsByUser(req, res) {
        try {
            const { userId } = req.params;
            const { userType, status, businessType, page = 1, limit = 10 } = req.query;
            
            logger.info(`[CentralPaymentController] Getting payments for user: ${userId}`);

            const filters = {};
            if (userType) filters.userType = userType;
            if (status) filters.status = status;
            if (businessType) filters.businessType = businessType;

            const payments = await centralPaymentService.getPaymentsByUser(userId, userType, filters);

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedPayments = payments.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: paginatedPayments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(payments.length / limit),
                    totalPayments: payments.length,
                    hasNextPage: endIndex < payments.length,
                    hasPrevPage: page > 1
                }
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error getting user payments:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting user payments',
                error: error.message
            });
        }
    }

    /**
     * Process payment webhook
     * POST /api/funnelseye-payments/webhook/:gateway
     */
    async processWebhook(req, res) {
        try {
            const { gateway } = req.params;
            const webhookData = req.body;
            
            logger.info(`[CentralPaymentController] Processing ${gateway} webhook`);

            // Verify webhook signature (implement based on gateway)
            const isValid = await this.verifyWebhookSignature(gateway, webhookData, req);
            if (!isValid) {
                logger.warn(`[CentralPaymentController] Invalid webhook signature for ${gateway}`);
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            }

            // Process webhook
            const result = await centralPaymentService.processPaymentWebhook(gateway, webhookData);

            logger.info(`[CentralPaymentController] ${gateway} webhook processed successfully`);

            res.json({
                success: true,
                message: 'Webhook processed successfully',
                data: result
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error processing webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing webhook',
                error: error.message
            });
        }
    }

    /**
     * Verify webhook signature
     */
    async verifyWebhookSignature(gateway, webhookData, req) {
        try {
            switch (gateway) {
                case 'razorpay':
                    // Implement Razorpay webhook signature verification
                    return true; // Placeholder
                    
                case 'stripe':
                    // Implement Stripe webhook signature verification
                    return true; // Placeholder
                    
                case 'paypal':
                    // Implement PayPal webhook signature verification
                    return true; // Placeholder
                    
                default:
                    return false;
            }
        } catch (error) {
            logger.error(`[CentralPaymentController] Error verifying ${gateway} webhook signature:`, error);
            return false;
        }
    }

    /**
     * Refund payment
     * POST /api/funnelseye-payments/refund/:paymentId
     */
    async refundPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const { refundAmount, reason } = req.body;
            
            logger.info(`[CentralPaymentController] Processing refund for payment: ${paymentId}`);

            if (!refundAmount || !reason) {
                return res.status(400).json({
                    success: false,
                    message: 'refundAmount and reason are required'
                });
            }

            const result = await centralPaymentService.refundPayment(paymentId, refundAmount, reason);

            logger.info(`[CentralPaymentController] Payment refunded successfully: ${paymentId}`);

            res.json({
                success: true,
                message: 'Payment refunded successfully',
                data: result
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error refunding payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error refunding payment',
                error: error.message
            });
        }
    }

    /**
     * Get payment statistics
     * GET /api/funnelseye-payments/stats
     */
    async getPaymentStats(req, res) {
        try {
            const { startDate, endDate, businessType, status, gateway } = req.query;
            
            logger.info('[CentralPaymentController] Getting payment statistics');

            const filters = {};
            if (startDate && endDate) {
                filters.paymentDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (businessType) filters.businessType = businessType;
            if (status) filters.status = status;
            if (gateway) filters.gateway = gateway;

            const stats = await centralPaymentService.getPaymentStats(filters);

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error getting payment stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting payment statistics',
                error: error.message
            });
        }
    }

    // ==================== ADMIN FUNCTIONS ====================

    /**
     * Get all payments (admin)
     * GET /api/funnelseye-payments/admin/payments
     */
    async getAllPayments(req, res) {
        try {
            const { page = 1, limit = 20, status, businessType, gateway, userId, startDate, endDate } = req.query;
            
            logger.info('[CentralPaymentController] Admin getting all payments');

            // Build query
            const query = {};
            if (status) query.status = status;
            if (businessType) query.businessType = businessType;
            if (gateway) query.gateway = gateway;
            if (userId) query.userId = userId;
            if (startDate && endDate) {
                query.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            // Execute query with pagination
            const skip = (page - 1) * limit;
            const payments = await CentralPayment.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('userId', 'name email');

            const total = await CentralPayment.countDocuments(query);

            res.json({
                success: true,
                data: payments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPayments: total,
                    hasNextPage: skip + payments.length < total,
                    hasPrevPage: page > 1
                }
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error getting all payments:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting all payments',
                error: error.message
            });
        }
    }

    /**
     * Update payment status (admin)
     * PUT /api/funnelseye-payments/admin/payment/:paymentId/status
     */
    async updatePaymentStatus(req, res) {
        try {
            const { paymentId } = req.params;
            const { status, notes } = req.body;
            
            logger.info(`[CentralPaymentController] Admin updating payment status: ${paymentId} to ${status}`);

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const payment = await CentralPayment.findOne({ paymentId });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Update payment
            payment.status = status;
            if (notes) payment.notes = notes;
            payment.updatedBy = req.user?.id;
            
            if (status === 'completed' && !payment.completedDate) {
                payment.completedDate = new Date();
            }

            await payment.save();

            logger.info(`[CentralPaymentController] Payment status updated: ${paymentId}`);

            res.json({
                success: true,
                message: 'Payment status updated successfully',
                data: payment
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error updating payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating payment status',
                error: error.message
            });
        }
    }

    /**
     * Get payment gateway configurations (admin)
     * GET /api/funnelseye-payments/admin/gateways
     */
    async getGatewayConfigs(req, res) {
        try {
            logger.info('[CentralPaymentController] Admin getting gateway configurations');

            const gateways = await PaymentGatewayConfig.find().sort({ priority: 1 });

            res.json({
                success: true,
                data: gateways
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error getting gateway configs:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting gateway configurations',
                error: error.message
            });
        }
    }

    /**
     * Update payment gateway configuration (admin)
     * PUT /api/funnelseye-payments/admin/gateway/:gatewayName
     */
    async updateGatewayConfig(req, res) {
        try {
            const { gatewayName } = req.params;
            const updateData = req.body;
            
            logger.info(`[CentralPaymentController] Admin updating gateway config: ${gatewayName}`);

            const gateway = await PaymentGatewayConfig.findOne({ gatewayName });
            if (!gateway) {
                return res.status(404).json({
                    success: false,
                    message: 'Gateway not found'
                });
            }

            // Update gateway configuration
            Object.assign(gateway, updateData);
            gateway.updatedBy = req.user?.id;
            await gateway.save();

            // Reinitialize gateways if configuration changed
            if (updateData.isEnabled !== undefined || updateData.isActive !== undefined) {
                await centralPaymentService.initializeGateways();
            }

            logger.info(`[CentralPaymentController] Gateway config updated: ${gatewayName}`);

            res.json({
                success: true,
                message: 'Gateway configuration updated successfully',
                data: gateway
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error updating gateway config:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating gateway configuration',
                error: error.message
            });
        }
    }

    /**
     * Create payment gateway configuration (admin)
     * POST /api/funnelseye-payments/admin/gateway
     */
    async createGatewayConfig(req, res) {
        try {
            const gatewayData = req.body;
            
            logger.info(`[CentralPaymentController] Admin creating gateway config: ${gatewayData.gatewayName}`);

            if (!gatewayData.gatewayName) {
                return res.status(400).json({
                    success: false,
                    message: 'Gateway name is required'
                });
            }

            // Check if gateway already exists
            const existingGateway = await PaymentGatewayConfig.findOne({ gatewayName: gatewayData.gatewayName });
            if (existingGateway) {
                return res.status(400).json({
                    success: false,
                    message: 'Gateway configuration already exists'
                });
            }

            // Create new gateway configuration
            gatewayData.createdBy = req.user?.id;
            const gateway = new PaymentGatewayConfig(gatewayData);
            await gateway.save();

            // Reinitialize gateways
            await centralPaymentService.initializeGateways();

            logger.info(`[CentralPaymentController] Gateway config created: ${gatewayData.gatewayName}`);

            res.status(201).json({
                success: true,
                message: 'Gateway configuration created successfully',
                data: gateway
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error creating gateway config:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating gateway configuration',
                error: error.message
            });
        }
    }

    /**
     * Delete payment gateway configuration (admin)
     * DELETE /api/funnelseye-payments/admin/gateway/:gatewayName
     */
    async deleteGatewayConfig(req, res) {
        try {
            const { gatewayName } = req.params;
            
            logger.info(`[CentralPaymentController] Admin deleting gateway config: ${gatewayName}`);

            const gateway = await PaymentGatewayConfig.findOne({ gatewayName });
            if (!gateway) {
                return res.status(404).json({
                    success: false,
                    message: 'Gateway not found'
                });
            }

            // Check if gateway is active
            if (gateway.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete active gateway. Deactivate first.'
                });
            }

            await PaymentGatewayConfig.deleteOne({ gatewayName });

            // Reinitialize gateways
            await centralPaymentService.initializeGateways();

            logger.info(`[CentralPaymentController] Gateway config deleted: ${gatewayName}`);

            res.json({
                success: true,
                message: 'Gateway configuration deleted successfully'
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error deleting gateway config:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting gateway configuration',
                error: error.message
            });
        }
    }

    /**
     * Test payment gateway (admin)
     * POST /api/funnelseye-payments/admin/gateway/:gatewayName/test
     */
    async testGateway(req, res) {
        try {
            const { gatewayName } = req.params;
            
            logger.info(`[CentralPaymentController] Admin testing gateway: ${gatewayName}`);

            const gateway = await PaymentGatewayConfig.findOne({ gatewayName });
            if (!gateway) {
                return res.status(404).json({
                    success: false,
                    message: 'Gateway not found'
                });
            }

            // Test gateway connectivity
            let testResult;
            try {
                switch (gatewayName) {
                    case 'razorpay':
                        testResult = await this.testRazorpayGateway(gateway);
                        break;
                    case 'stripe':
                        testResult = await this.testStripeGateway(gateway);
                        break;
                    case 'paypal':
                        testResult = await this.testPayPalGateway(gateway);
                        break;
                    default:
                        testResult = { success: true, message: 'Gateway test not implemented' };
                }
            } catch (error) {
                testResult = { success: false, message: error.message };
            }

            // Update gateway health
            gateway.health.lastCheck = new Date();
            gateway.health.isHealthy = testResult.success;
            gateway.health.responseTime = testResult.responseTime || 0;
            if (testResult.success) {
                gateway.health.successRate = Math.min(100, gateway.health.successRate + 1);
            } else {
                gateway.health.errorCount += 1;
            }
            await gateway.save();

            res.json({
                success: true,
                message: 'Gateway test completed',
                data: testResult
            });

        } catch (error) {
            logger.error('[CentralPaymentController] Error testing gateway:', error);
            res.status(500).json({
                success: false,
                message: 'Error testing gateway',
                error: error.message
            });
        }
    }

    /**
     * Test Razorpay gateway
     */
    async testRazorpayGateway(gateway) {
        const startTime = Date.now();
        
        try {
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({
                key_id: gateway.config.razorpay.keyId,
                key_secret: gateway.config.razorpay.keySecret
            });

            // Test API call
            await razorpay.orders.all({ count: 1 });
            
            return {
                success: true,
                message: 'Razorpay gateway is working',
                responseTime: Date.now() - startTime
            };
        } catch (error) {
            return {
                success: false,
                message: `Razorpay test failed: ${error.message}`,
                responseTime: Date.now() - startTime
            };
        }
    }

    /**
     * Test Stripe gateway (placeholder)
     */
    async testStripeGateway(gateway) {
        return { success: false, message: 'Stripe test not implemented yet' };
    }

    /**
     * Test PayPal gateway (placeholder)
     */
    async testPayPalGateway(gateway) {
        return { success: false, message: 'PayPal test not implemented yet' };
    }
}

// Create controller instance and bind all methods
const controller = new CentralPaymentController();

module.exports = {
    createPaymentSession: controller.createPaymentSession.bind(controller),
    getPaymentById: controller.getPaymentById.bind(controller),
    getPaymentsByUser: controller.getPaymentsByUser.bind(controller),
    processWebhook: controller.processWebhook.bind(controller),
    refundPayment: controller.refundPayment.bind(controller),
    getPaymentStats: controller.getPaymentStats.bind(controller),
    getAllPayments: controller.getAllPayments.bind(controller),
    updatePaymentStatus: controller.updatePaymentStatus.bind(controller),
    getGatewayConfigs: controller.getGatewayConfigs.bind(controller),
    createGatewayConfig: controller.createGatewayConfig.bind(controller),
    updateGatewayConfig: controller.updateGatewayConfig.bind(controller),
    deleteGatewayConfig: controller.deleteGatewayConfig.bind(controller),
    testGateway: controller.testGateway.bind(controller)
};
