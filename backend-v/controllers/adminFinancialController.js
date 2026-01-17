const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const razorpayService = require('../services/razorpayService');
const { AdminSystemSettings, Coach, RazorpayPayment, Subscription, CentralPayment, PaymentGatewayConfig, User, MlmCommissionDistribution } = require('../schema');

// ===== FINANCIAL & BILLING CONTROL CENTER =====

/**
 * @desc    Get credit system configuration
 * @route   GET /api/admin/financial/credit-system
 * @access  Private (Admin)
 */
exports.getCreditSystem = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [FINANCIAL_API] getCreditSystem - Starting...');
        console.log('🔄 [FINANCIAL_API] getCreditSystem - Querying AdminSystemSettings...');
        
        const startTime = Date.now();
        const settings = await AdminSystemSettings.findOne().select('paymentSystem.currencies paymentSystem.taxSettings');
        const queryTime = Date.now() - startTime;
        
        console.log(`✅ [FINANCIAL_API] getCreditSystem - Query completed in ${queryTime}ms`);
        console.log('📊 [FINANCIAL_API] getCreditSystem - Settings found:', !!settings);
        
        // Get credit types and pricing
        const creditTypes = {
            aiCredits: { name: 'AI Credits', basePrice: 0.01, markup: 0.005 },
            // whatsappCredits: { name: 'WhatsApp Credits', basePrice: 0.01, markup: 0.003 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            emailCredits: { name: 'Email Credits', basePrice: 0.005, markup: 0.002 }
        };

        const responseData = {
            creditTypes,
            currencies: settings?.paymentSystem?.currencies || { supported: ['USD'], default: 'USD' },
            taxSettings: settings?.paymentSystem?.taxSettings || {}
        };

        console.log('✅ [FINANCIAL_API] getCreditSystem - Preparing response...');
        console.log('📊 [FINANCIAL_API] getCreditSystem - Response data keys:', Object.keys(responseData));

        res.status(200).json({
            success: true,
            data: responseData
        });
        
        console.log('✅ [FINANCIAL_API] getCreditSystem - Response sent successfully');
    } catch (error) {
        console.error('❌ [FINANCIAL_API] getCreditSystem - Error:', error);
        console.error('❌ [FINANCIAL_API] getCreditSystem - Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit system configuration',
            error: error.message
        });
    }
});

/**
 * @desc    Update credit system configuration
 * @route   PUT /api/admin/financial/credit-system
 * @access  Private (Admin)
 */
exports.updateCreditSystem = asyncHandler(async (req, res) => {
    try {
        const { creditTypes, currencies, taxSettings } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'paymentSystem.currencies': currencies,
                    'paymentSystem.taxSettings': taxSettings
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Credit system updated successfully',
            data: {
                creditTypes,
                currencies: settings.paymentSystem.currencies,
                taxSettings: settings.paymentSystem.taxSettings
            }
        });
    } catch (error) {
        console.error('Error updating credit system:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating credit system',
            error: error.message
        });
    }
});

/**
 * @desc    Get credit packages
 * @route   GET /api/admin/financial/credit-packages
 * @access  Private (Admin)
 */
exports.getCreditPackages = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [FINANCIAL_API] getCreditPackages - Starting...');
        
        // This would typically fetch from a CreditPackage schema
        const packages = [
            {
                id: 'starter',
                name: 'Starter Pack',
                aiCredits: 1000,
                // whatsappCredits: 500, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                emailCredits: 1000,
                price: 29.99,
                autoRecharge: false
            },
            {
                id: 'professional',
                name: 'Professional Pack',
                aiCredits: 5000,
                // whatsappCredits: 2500, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                emailCredits: 5000,
                price: 99.99,
                autoRecharge: true,
                rechargeThreshold: 100,
                rechargeAmount: 500
            },
            {
                id: 'enterprise',
                name: 'Enterprise Pack',
                aiCredits: 20000,
                // whatsappCredits: 10000, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                emailCredits: 20000,
                price: 299.99,
                autoRecharge: true,
                rechargeThreshold: 500,
                rechargeAmount: 2000
            }
        ];

        console.log('✅ [FINANCIAL_API] getCreditPackages - Packages prepared:', packages.length);
        console.log('📊 [FINANCIAL_API] getCreditPackages - Package names:', packages.map(p => p.name));

        res.status(200).json({
            success: true,
            data: packages
        });
        
        console.log('✅ [FINANCIAL_API] getCreditPackages - Response sent successfully');
    } catch (error) {
        console.error('❌ [FINANCIAL_API] getCreditPackages - Error:', error);
        console.error('❌ [FINANCIAL_API] getCreditPackages - Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit packages',
            error: error.message
        });
    }
});

/**
 * @desc    Get revenue analytics
 * @route   GET /api/admin/financial/revenue-analytics
 * @access  Private (Admin)
 */
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [FINANCIAL_API] getRevenueAnalytics - Starting...');
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);
        
        console.log('📊 [FINANCIAL_API] getRevenueAnalytics - Time range:', timeRange, 'days');
        console.log('📊 [FINANCIAL_API] getRevenueAnalytics - Start date:', startDate);

        // Get payment analytics
        console.log('🔄 [FINANCIAL_API] getRevenueAnalytics - Querying RazorpayPayment...');
        const paymentStartTime = Date.now();
        const paymentStats = await RazorpayPayment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalPayments: { $count: {} },
                    averagePayment: { $avg: '$amount' }
                }
            }
        ]);
        const paymentQueryTime = Date.now() - paymentStartTime;
        console.log(`✅ [FINANCIAL_API] getRevenueAnalytics - Payment query completed in ${paymentQueryTime}ms`);
        console.log('📊 [FINANCIAL_API] getRevenueAnalytics - Payment stats:', paymentStats);

        // Get subscription analytics
        console.log('🔄 [FINANCIAL_API] getRevenueAnalytics - Querying Subscription...');
        const subscriptionStartTime = Date.now();
        const subscriptionStats = await Subscription.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'active'
                }
            },
            {
                $group: {
                    _id: '$planType',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);
        const subscriptionQueryTime = Date.now() - subscriptionStartTime;
        console.log(`✅ [FINANCIAL_API] getRevenueAnalytics - Subscription query completed in ${subscriptionQueryTime}ms`);

        // Get MRR (Monthly Recurring Revenue)
        console.log('🔄 [FINANCIAL_API] getRevenueAnalytics - Querying MRR...');
        const mrrStartTime = Date.now();
        const mrr = await Subscription.aggregate([
            {
                $match: {
                    status: 'active',
                    nextBillingDate: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    mrr: { $sum: '$amount' }
                }
            }
        ]);
        const mrrQueryTime = Date.now() - mrrStartTime;
        console.log(`✅ [FINANCIAL_API] getRevenueAnalytics - MRR query completed in ${mrrQueryTime}ms`);

        // Get churn analysis
        console.log('🔄 [FINANCIAL_API] getRevenueAnalytics - Querying churn...');
        const churnStartTime = Date.now();
        const churnedSubscriptions = await Subscription.aggregate([
            {
                $match: {
                    status: 'cancelled',
                    updatedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    churnedCount: { $count: {} },
                    churnedRevenue: { $sum: '$amount' }
                }
            }
        ]);
        const churnQueryTime = Date.now() - churnStartTime;
        console.log(`✅ [FINANCIAL_API] getRevenueAnalytics - Churn query completed in ${churnQueryTime}ms`);

        const responseData = {
            paymentStats: paymentStats[0] || {
                totalRevenue: 0,
                totalPayments: 0,
                averagePayment: 0
            },
            subscriptionStats,
            mrr: mrr[0]?.mrr || 0,
            churnStats: churnedSubscriptions[0] || {
                churnedCount: 0,
                churnedRevenue: 0
            },
            timeRange
        };

        console.log('✅ [FINANCIAL_API] getRevenueAnalytics - Preparing response...');
        console.log('📊 [FINANCIAL_API] getRevenueAnalytics - Response data keys:', Object.keys(responseData));

        res.status(200).json({
            success: true,
            data: responseData
        });
        
        console.log('✅ [FINANCIAL_API] getRevenueAnalytics - Response sent successfully');
    } catch (error) {
        console.error('❌ [FINANCIAL_API] getRevenueAnalytics - Error:', error);
        console.error('❌ [FINANCIAL_API] getRevenueAnalytics - Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error retrieving revenue analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment failure analytics
 * @route   GET /api/admin/financial/payment-failures
 * @access  Private (Admin)
 */
exports.getPaymentFailures = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [FINANCIAL_API] getPaymentFailures - Starting...');
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);
        
        console.log('📊 [FINANCIAL_API] getPaymentFailures - Time range:', timeRange, 'days');

        console.log('🔄 [FINANCIAL_API] getPaymentFailures - Querying failed payments...');
        const queryStartTime = Date.now();
        const failedPayments = await RazorpayPayment.aggregate([
            {
                $match: {
                    status: 'failed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$failureReason',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        const queryTime = Date.now() - queryStartTime;
        console.log(`✅ [FINANCIAL_API] getPaymentFailures - Query completed in ${queryTime}ms`);
        console.log('📊 [FINANCIAL_API] getPaymentFailures - Failed payments found:', failedPayments.length);

        const retryAttempts = await RazorpayPayment.aggregate([
            {
                $match: {
                    status: 'pending',
                    retryCount: { $gt: 0 },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRetries: { $sum: '$retryCount' },
                    averageRetries: { $avg: '$retryCount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                failedPayments,
                retryStats: retryAttempts[0] || {
                    totalRetries: 0,
                    averageRetries: 0
                },
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting payment failures:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment failures',
            error: error.message
        });
    }
});

/**
 * @desc    Get gateway markup analytics
 * @route   GET /api/admin/financial/gateway-markup
 * @access  Private (Admin)
 */
exports.getGatewayMarkup = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const gatewayStats = await RazorpayPayment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$gateway',
                    totalAmount: { $sum: '$amount' },
                    totalPayments: { $count: {} },
                    totalFees: { $sum: '$gatewayFee' },
                    averageFee: { $avg: '$gatewayFee' }
                }
            },
            {
                $addFields: {
                    markupPercentage: {
                        $multiply: [
                            { $divide: ['$totalFees', '$totalAmount'] },
                            100
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                gatewayStats,
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting gateway markup:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving gateway markup analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get credit usage analytics
 * @route   GET /api/admin/financial/credit-usage
 * @access  Private (Admin)
 */
exports.getCreditUsage = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get coach credit usage
        const creditUsage = await Coach.aggregate([
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    aiCredits: 1,
                    // whatsappCredits: 1, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                    emailCredits: 1,
                    totalCreditsUsed: {
                        $add: [
                            { $ifNull: ['$aiCreditsUsed', 0] },
                            // { $ifNull: ['$whatsappCreditsUsed', 0] }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                            { $ifNull: ['$emailCreditsUsed', 0] }
                        ]
                    }
                }
            },
            {
                $sort: { totalCreditsUsed: -1 }
            },
            {
                $limit: 50
            }
        ]);

        // Get credit consumption trends
        const consumptionTrends = [
            { date: '2024-01-01', aiCredits: 15000, emailCredits: 12000 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            { date: '2024-01-02', aiCredits: 18000, emailCredits: 14000 }, // WhatsApp functionality moved to dustbin/whatsapp-dump/
            { date: '2024-01-03', aiCredits: 22000, emailCredits: 16000 } // WhatsApp functionality moved to dustbin/whatsapp-dump/
        ];

        res.status(200).json({
            success: true,
            data: {
                creditUsage,
                consumptionTrends,
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting credit usage:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit usage analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment settings
 * @route   GET /api/admin/financial/payment-settings
 * @access  Private (Admin)
 */
exports.getPaymentSettings = asyncHandler(async (req, res) => {
    try {
        let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!settings) {
            // Create default settings
            settings = new AdminSystemSettings({
                settingId: 'global'
            });
            await settings.save();
        }

        // Get payment gateway configurations
        const gateways = await PaymentGatewayConfig.find();

        res.status(200).json({
            success: true,
            message: 'Payment settings retrieved successfully',
            data: {
                paymentSystem: settings.paymentSystem || {},
                gateways: gateways
            }
        });
    } catch (error) {
        console.error('Error getting payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve payment settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update payment settings
 * @route   PUT /api/admin/financial/payment-settings
 * @access  Private (Admin)
 */
exports.updatePaymentSettings = asyncHandler(async (req, res) => {
    try {
        const { paymentSystem } = req.body;
        const adminId = req.admin.id;

        if (!paymentSystem) {
            return res.status(400).json({
                success: false,
                message: 'Payment system data is required'
            });
        }

        let systemSettings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!systemSettings) {
            systemSettings = new AdminSystemSettings({
                settingId: 'global'
            });
        }

        // Store previous settings for audit
        const previousSettings = JSON.parse(JSON.stringify(systemSettings.paymentSystem));

        // Update payment system settings
        systemSettings.paymentSystem = { ...systemSettings.paymentSystem, ...paymentSystem };
        systemSettings.systemStatus.lastUpdated = new Date();
        systemSettings.systemStatus.updatedBy = adminId;

        await systemSettings.save();

        res.status(200).json({
            success: true,
            message: 'Payment settings updated successfully',
            data: {
                paymentSystem: systemSettings.paymentSystem,
                changes: Object.keys(paymentSystem)
            }
        });
    } catch (error) {
        console.error('Error updating payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment settings',
            error: error.message
        });
    }
});

/**
 * @desc    Get commission payouts
 * @route   GET /api/admin/financial/commission-payouts
 * @access  Private (Admin)
 */
exports.getCommissionPayouts = asyncHandler(async (req, res) => {
    try {
        const { status, page = 1, limit = 20, startDate, endDate } = req.query;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = { businessType: 'commission' };
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Get commission payments
        const commissionPayments = await CentralPayment.find(filter)
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const totalCount = await CentralPayment.countDocuments(filter);

        // Calculate summary stats
        const summaryStats = await CentralPayment.aggregate([
            { $match: { businessType: 'commission' } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                commissionPayments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit: parseInt(limit)
                },
                summaryStats
            }
        });
    } catch (error) {
        console.error('Error getting commission payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving commission payouts',
            error: error.message
        });
    }
});

/**
 * @desc    Process commission payout
 * @route   POST /api/admin/financial/commission-payouts/:paymentId/process
 * @access  Private (Admin)
 */
exports.processCommissionPayout = asyncHandler(async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status, notes } = req.body;
        const adminId = req.admin.id;

        const payment = await CentralPayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Commission payment not found'
            });
        }

        if (payment.businessType !== 'commission') {
            return res.status(400).json({
                success: false,
                message: 'This payment is not a commission payment'
            });
        }

        // Update payment status
        payment.status = status;
        payment.adminNotes = notes;
        payment.processedAt = new Date();
        payment.processedBy = adminId;

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Commission payout processed successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error processing commission payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing commission payout',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment gateway configurations
 * @route   GET /api/admin/financial/payment-gateways
 * @access  Private (Admin)
 */
exports.getPaymentGateways = asyncHandler(async (req, res) => {
    try {
        const gateways = await PaymentGatewayConfig.find().sort({ gatewayName: 1 });

        res.status(200).json({
            success: true,
            data: gateways
        });
    } catch (error) {
        console.error('Error getting payment gateways:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment gateways',
            error: error.message
        });
    }
});

/**
 * @desc    Update payment gateway configuration
 * @route   PUT /api/admin/financial/payment-gateways/:gatewayName
 * @access  Private (Admin)
 */
exports.updatePaymentGateway = asyncHandler(async (req, res) => {
    try {
        const { gatewayName } = req.params;
        const { isEnabled, config, feeStructure } = req.body;
        const adminId = req.admin.id;

        const gateway = await PaymentGatewayConfig.findOne({ gatewayName });
        if (!gateway) {
            return res.status(404).json({
                success: false,
                message: 'Payment gateway not found'
            });
        }

        // Update gateway configuration
        if (isEnabled !== undefined) gateway.isEnabled = isEnabled;
        if (config) gateway.config = { ...gateway.config, ...config };
        if (feeStructure) gateway.feeStructure = feeStructure;
        
        gateway.lastUpdated = new Date();
        gateway.updatedBy = adminId;

        await gateway.save();

        res.status(200).json({
            success: true,
            message: 'Payment gateway updated successfully',
            data: gateway
        });
    } catch (error) {
        console.error('Error updating payment gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment gateway',
            error: error.message
        });
    }
});

/**
 * @desc    Test payment gateway
 * @route   POST /api/admin/financial/payment-gateways/:gatewayName/test
 * @access  Private (Admin)
 */
exports.testPaymentGateway = asyncHandler(async (req, res) => {
    try {
        const { gatewayName } = req.params;
        const { testAmount = 100 } = req.body;

        const gateway = await PaymentGatewayConfig.findOne({ gatewayName });
        if (!gateway) {
            return res.status(404).json({
                success: false,
                message: 'Payment gateway not found'
            });
        }

        if (!gateway.isEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Payment gateway is not enabled'
            });
        }

        // Test gateway connection based on type
        let testResult = { success: false, message: 'Gateway test not implemented' };

        switch (gatewayName.toLowerCase()) {
            case 'razorpay':
                // Test Razorpay connection
                const Razorpay = require('razorpay');
                const razorpay = new Razorpay({
                    key_id: gateway.config.keyId,
                    key_secret: gateway.config.keySecret
                });

                try {
                    // Test by creating a test order
                    const testOrder = await razorpay.orders.create({
                        amount: testAmount * 100, // Convert to paise
                        currency: 'INR',
                        receipt: `test_${Date.now()}`
                    });

                    testResult = {
                        success: true,
                        message: 'Razorpay connection successful',
                        testOrderId: testOrder.id
                    };
                } catch (error) {
                    testResult = {
                        success: false,
                        message: 'Razorpay connection failed',
                        error: error.message
                    };
                }
                break;

            case 'stripe':
                // Test Stripe connection
                const stripe = require('stripe')(gateway.config.secretKey);
                
                try {
                    const testPaymentIntent = await stripe.paymentIntents.create({
                        amount: testAmount * 100, // Convert to cents
                        currency: 'usd',
                        description: 'Test payment'
                    });

                    testResult = {
                        success: true,
                        message: 'Stripe connection successful',
                        testPaymentIntentId: testPaymentIntent.id
                    };
                } catch (error) {
                    testResult = {
                        success: false,
                        message: 'Stripe connection failed',
                        error: error.message
                    };
                }
                break;

            default:
                testResult = {
                    success: true,
                    message: `${gatewayName} gateway test completed (no specific test implemented)`
                };
        }

        res.status(200).json({
            success: true,
            data: {
                gatewayName,
                testResult,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Error testing payment gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing payment gateway',
            error: error.message
        });
    }
});

/**
 * @desc    Get payment analytics (enhanced with funnelseye-payments)
 * @route   GET /api/admin/financial/payment-analytics
 * @access  Private (Admin)
 */
exports.getPaymentAnalytics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30, businessType } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Build filter
        const filter = { createdAt: { $gte: startDate } };
        if (businessType) filter.businessType = businessType;

        // Get payment statistics
        const paymentStats = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' }
                }
            }
        ]);

        // Get business type breakdown
        const businessTypeStats = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$businessType',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Get gateway performance
        const gatewayStats = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    successRate: {
                        $avg: {
                            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Get daily trends
        const dailyTrends = await CentralPayment.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                paymentStats,
                businessTypeStats,
                gatewayStats,
                dailyTrends,
                timeRange: parseInt(timeRange)
            }
        });
    } catch (error) {
        console.error('Error getting payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Create new credit package
 * @route   POST /api/admin/financial/credit-packages
 * @access  Private (Admin)
 */
exports.createCreditPackage = asyncHandler(async (req, res) => {
    try {
        const { name, description, credits, price, currency, isActive, features } = req.body;
        const adminId = req.admin.id;

        // Validate required fields
        if (!name || !credits || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name, credits, and price are required'
            });
        }

        // Create credit package in AdminSystemSettings
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'System settings not found'
            });
        }

        const newPackage = {
            id: new mongoose.Types.ObjectId(),
            name,
            description: description || '',
            credits: {
                aiCredits: credits.aiCredits || 0,
                emailCredits: credits.emailCredits || 0
            },
            price: {
                amount: price,
                currency: currency || 'INR'
            },
            isActive: isActive !== undefined ? isActive : true,
            features: features || [],
            createdAt: new Date(),
            createdBy: adminId
        };

        if (!settings.creditPackages) {
            settings.creditPackages = [];
        }
        settings.creditPackages.push(newPackage);

        await settings.save();

        res.status(201).json({
            success: true,
            message: 'Credit package created successfully',
            data: newPackage
        });
    } catch (error) {
        console.error('Error creating credit package:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating credit package',
            error: error.message
        });
    }
});

/**
 * @desc    Update credit package
 * @route   PUT /api/admin/financial/credit-packages/:packageId
 * @access  Private (Admin)
 */
exports.updateCreditPackage = asyncHandler(async (req, res) => {
    try {
        const { packageId } = req.params;
        const updateData = req.body;
        const adminId = req.admin.id;

        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        if (!settings || !settings.creditPackages) {
            return res.status(404).json({
                success: false,
                message: 'Credit packages not found'
            });
        }

        const packageIndex = settings.creditPackages.findIndex(pkg => pkg.id.toString() === packageId);
        if (packageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Credit package not found'
            });
        }

        // Update package
        settings.creditPackages[packageIndex] = {
            ...settings.creditPackages[packageIndex],
            ...updateData,
            updatedAt: new Date(),
            updatedBy: adminId
        };

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Credit package updated successfully',
            data: settings.creditPackages[packageIndex]
        });
    } catch (error) {
        console.error('Error updating credit package:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating credit package',
            error: error.message
        });
    }
});

/**
 * @desc    Delete credit package
 * @route   DELETE /api/admin/financial/credit-packages/:packageId
 * @access  Private (Admin)
 */
exports.deleteCreditPackage = asyncHandler(async (req, res) => {
    try {
        const { packageId } = req.params;

        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        if (!settings || !settings.creditPackages) {
            return res.status(404).json({
                success: false,
                message: 'Credit packages not found'
            });
        }

        const packageIndex = settings.creditPackages.findIndex(pkg => pkg.id.toString() === packageId);
        if (packageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Credit package not found'
            });
        }

        // Remove package
        settings.creditPackages.splice(packageIndex, 1);
        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Credit package deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting credit package:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting credit package',
            error: error.message
        });
    }
});

/**
 * @desc    Get Razorpay account management
 * @route   GET /api/admin/financial/razorpay-account
 * @access  Private (Admin)
 */
exports.getRazorpayAccount = asyncHandler(async (req, res) => {
    try {
        const balanceResult = await razorpayService.getAccountBalance();
        
        if (!balanceResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Error fetching Razorpay account details',
                error: balanceResult.error
            });
        }

        // Get recent transactions
        const recentPayments = await razorpayService.getAllPayments({ count: 10 });
        const recentPayouts = await razorpayService.getAllPayouts({ count: 10 });

        res.json({
            success: true,
            data: {
                account: {
                    id: balanceResult.accountId,
                    name: balanceResult.accountName,
                    balance: balanceResult.balance,
                    currency: balanceResult.currency
                },
                recentActivity: {
                    payments: recentPayments.success ? recentPayments.payments : [],
                    payouts: recentPayouts.success ? recentPayouts.payouts : []
                }
            }
        });
    } catch (error) {
        console.error('Error getting Razorpay account:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving Razorpay account details',
            error: error.message
        });
    }
});

/**
 * @desc    Update MLM commission structure
 * @route   PUT /api/admin/financial/mlm-commission-structure
 * @access  Private (Admin)
 */
exports.updateMlmCommissionStructure = asyncHandler(async (req, res) => {
    try {
        const { 
            levels, 
            platformFeePercentage, 
            maxLevels,
            autoPayoutEnabled,
            payoutThreshold 
        } = req.body;

        if (!levels || !Array.isArray(levels)) {
            return res.status(400).json({
                success: false,
                message: 'Commission levels must be an array'
            });
        }

        if (platformFeePercentage < 0 || platformFeePercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'Platform fee percentage must be between 0 and 100'
            });
        }

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'paymentSystem.mlmCommissionStructure': {
                        levels: levels,
                        platformFeePercentage: platformFeePercentage,
                        maxLevels: maxLevels || levels.length,
                        autoPayoutEnabled: autoPayoutEnabled || false,
                        payoutThreshold: payoutThreshold || 100
                    }
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'MLM commission structure updated successfully',
            data: {
                commissionStructure: settings.paymentSystem.mlmCommissionStructure
            }
        });
    } catch (error) {
        console.error('Error updating MLM commission structure:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating MLM commission structure',
            error: error.message
        });
    }
});

/**
 * @desc    Process MLM commission for subscription
 * @route   POST /api/admin/financial/process-mlm-commission
 * @access  Private (Admin)
 */
exports.processMlmCommission = asyncHandler(async (req, res) => {
    try {
        const { subscriptionId, subscriptionAmount, coachId } = req.body;

        if (!subscriptionId || !subscriptionAmount || !coachId) {
            return res.status(400).json({
                success: false,
                message: 'Subscription ID, amount, and coach ID are required'
            });
        }

        // Get MLM commission structure
        const settings = await AdminSystemSettings.findOne().select('paymentSystem.mlmCommissionStructure');
        if (!settings || !settings.paymentSystem?.mlmCommissionStructure) {
            return res.status(400).json({
                success: false,
                message: 'MLM commission structure not configured'
            });
        }

        const commissionStructure = settings.paymentSystem.mlmCommissionStructure;

        // Get coach hierarchy
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Calculate commission
        const commissionResult = razorpayService.calculateMLMCommission(
            subscriptionAmount,
            commissionStructure,
            coach.currentLevel || 1
        );

        if (!commissionResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Error calculating commission',
                error: commissionResult.error
            });
        }

        // Create commission distribution records
        const commissionDistributions = [];
        for (const commission of commissionResult.commissions) {
            const distribution = await MlmCommissionDistribution.create({
                subscriptionId: subscriptionId,
                recipientId: coachId,
                level: commission.level,
                percentage: commission.percentage,
                amount: commission.amount,
                platformFee: commissionResult.platformFee,
                netAmount: commissionResult.netAmount,
                status: 'pending',
                createdAt: new Date()
            });
            commissionDistributions.push(distribution);
        }

        // Process automatic payout if enabled
        if (commissionStructure.autoPayoutEnabled && commissionResult.totalCommission >= commissionStructure.payoutThreshold) {
            const coachPayoutSettings = coach.payoutSettings;
            if (coachPayoutSettings?.autoPayoutEnabled) {
                const payoutData = {
                    coachId: coachId,
                    amount: commissionResult.totalCommission,
                    upiId: coachPayoutSettings.upiId,
                    bankAccount: coachPayoutSettings.bankAccount,
                    purpose: 'MLM Commission',
                    notes: `Automatic commission payout for subscription ${subscriptionId}`
                };

                const payoutResult = await razorpayService.processAutomaticPayout(
                    payoutData,
                    coachPayoutSettings.payoutMethod
                );

                if (payoutResult.success) {
                    // Update commission distributions with payout info
                    await MlmCommissionDistribution.updateMany(
                        { subscriptionId: subscriptionId },
                        {
                            $set: {
                                status: 'paid',
                                payoutId: payoutResult.payoutId,
                                paidAt: new Date()
                            }
                        }
                    );
                }
            }
        }

        res.json({
            success: true,
            message: 'MLM commission processed successfully',
            data: {
                subscriptionId,
                subscriptionAmount,
                platformFee: commissionResult.platformFee,
                netAmount: commissionResult.netAmount,
                totalCommission: commissionResult.totalCommission,
                commissions: commissionDistributions,
                remainingAmount: commissionResult.remainingAmount
            }
        });
    } catch (error) {
        console.error('Error processing MLM commission:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing MLM commission',
            error: error.message
        });
    }
});

/**
 * @desc    Get platform fee settings
 * @route   GET /api/admin/financial/platform-fees
 * @access  Private (Admin)
 */
exports.getPlatformFees = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('paymentSystem.platformFees');
        
        const defaultFees = {
            subscriptionFee: 5.0, // 5% of subscription
            transactionFee: 2.0, // 2% per transaction
            payoutFee: 1.0, // 1% per payout
            refundFee: 0.5 // 0.5% per refund
        };

        res.json({
            success: true,
            data: {
                platformFees: settings?.paymentSystem?.platformFees || defaultFees,
                currency: 'INR'
            }
        });
    } catch (error) {
        console.error('Error getting platform fees:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving platform fees',
            error: error.message
        });
    }
});

/**
 * @desc    Update platform fee settings
 * @route   PUT /api/admin/financial/platform-fees
 * @access  Private (Admin)
 */
exports.updatePlatformFees = asyncHandler(async (req, res) => {
    try {
        const { subscriptionFee, transactionFee, payoutFee, refundFee } = req.body;

        // Validate fee percentages
        const fees = { subscriptionFee, transactionFee, payoutFee, refundFee };
        for (const [key, value] of Object.entries(fees)) {
            if (value !== undefined && (value < 0 || value > 100)) {
                return res.status(400).json({
                    success: false,
                    message: `${key} must be between 0 and 100`
                });
            }
        }

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'paymentSystem.platformFees': {
                        subscriptionFee: subscriptionFee || 5.0,
                        transactionFee: transactionFee || 2.0,
                        payoutFee: payoutFee || 1.0,
                        refundFee: refundFee || 0.5
                    }
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Platform fees updated successfully',
            data: {
                platformFees: settings.paymentSystem.platformFees
            }
        });
    } catch (error) {
        console.error('Error updating platform fees:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating platform fees',
            error: error.message
        });
    }
});

/**
 * @desc    Get financial analytics dashboard
 * @route   GET /api/admin/financial/analytics-dashboard
 * @access  Private (Admin)
 */
exports.getFinancialAnalyticsDashboard = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Get Razorpay balance
        const balanceResult = await razorpayService.getAccountBalance();

        // Get subscription analytics
        const subscriptions = await Subscription.find({
            createdAt: { $gte: startDate }
        }).populate('planId', 'price').populate('coachId', 'name email');

        const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.planId?.price || 0), 0);
        const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;

        // Get commission analytics
        const commissions = await MlmCommissionDistribution.find({
            createdAt: { $gte: startDate }
        });

        const totalCommissionsPaid = commissions
            .filter(comm => comm.status === 'paid')
            .reduce((sum, comm) => sum + comm.amount, 0);

        // Get payout analytics
        const payoutsResult = await razorpayService.getAllPayouts({
            from: Math.floor(startDate.getTime() / 1000),
            count: 100
        });

        const totalPayouts = payoutsResult.success ? 
            payoutsResult.payouts.reduce((sum, payout) => sum + (payout.amount / 100), 0) : 0;

        // Calculate platform fees collected
        const platformFeesCollected = totalRevenue * 0.05; // Assuming 5% platform fee

        res.json({
            success: true,
            data: {
                overview: {
                    totalRevenue,
                    activeSubscriptions,
                    totalCommissionsPaid,
                    totalPayouts,
                    platformFeesCollected,
                    netProfit: platformFeesCollected - totalCommissionsPaid
                },
                razorpayAccount: balanceResult.success ? {
                    balance: balanceResult.balance,
                    currency: balanceResult.currency,
                    accountName: balanceResult.accountName
                } : null,
                timeRange: parseInt(timeRange),
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Error getting financial analytics dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving financial analytics',
            error: error.message
        });
    }
});
