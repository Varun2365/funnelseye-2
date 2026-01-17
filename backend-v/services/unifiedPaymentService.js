const UnifiedPaymentTransaction = require('../schema/UnifiedPaymentTransaction');
const GlobalPaymentSettings = require('../schema/GlobalPaymentSettings');
const User = require('../schema/User');
const Subscription = require('../schema/Subscription');
const logger = require('../utils/logger');

class UnifiedPaymentService {
    
    constructor() {
        this.settings = null;
        this.initializeSettings();
    }

    /**
     * Initialize global payment settings
     */
    async initializeSettings() {
        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Database connection timeout')), 5000);
            });

            const settingsPromise = GlobalPaymentSettings.findOne();
            
            this.settings = await Promise.race([settingsPromise, timeoutPromise]);
            
            if (!this.settings) {
                // Create default settings if none exist
                // Razorpay fields are optional and can be added later via admin panel
                const defaultSettings = {
                    commission: {
                        mlmLevels: [
                            { level: 1, percentage: 10, isActive: true },
                            { level: 2, percentage: 5, isActive: true },
                            { level: 3, percentage: 3, isActive: true }
                        ],
                        directCommission: { percentage: 70, isActive: true },
                        minimumPayoutAmount: 500
                    },
                    platformFee: { percentage: 10, isActive: true },
                    payout: {
                        instantPayout: { isEnabled: true, fee: 50 },
                        monthlyPayout: { isEnabled: true, dayOfMonth: 5 }
                    }
                };
                
                // Add razorpay config from environment variables if available
                if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
                    defaultSettings.razorpay = {
                        keyId: process.env.RAZORPAY_KEY_ID,
                        keySecret: process.env.RAZORPAY_KEY_SECRET,
                        isActive: true
                    };
                }
                
                this.settings = await GlobalPaymentSettings.create(defaultSettings);
            } else {
                // Check if existing settings are missing razorpay fields but env vars are available
                if ((!this.settings.razorpay || !this.settings.razorpay.keyId || !this.settings.razorpay.keySecret) 
                    && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
                    // Update with environment variables if available
                    if (!this.settings.razorpay) {
                        this.settings.razorpay = {};
                    }
                    this.settings.razorpay.keyId = process.env.RAZORPAY_KEY_ID;
                    this.settings.razorpay.keySecret = process.env.RAZORPAY_KEY_SECRET;
                    this.settings.razorpay.isActive = true;
                    
                    await this.settings.save();
                    logger.info('[UnifiedPaymentService] Updated settings with razorpay credentials from environment variables');
                }
            }
            // logger.info('[UnifiedPaymentService] Settings initialized');
        } catch (error) {
            logger.error('[UnifiedPaymentService] Error initializing settings:', error);
            // Set default settings to prevent further errors
            this.settings = {
                commission: {
                    mlmLevels: [
                        { level: 1, percentage: 10, isActive: true },
                        { level: 2, percentage: 5, isActive: true },
                        { level: 3, percentage: 3, isActive: true }
                    ],
                    directCommission: { percentage: 70, isActive: true },
                    minimumPayoutAmount: 500
                },
                platformFee: { percentage: 10, isActive: true },
                payout: {
                    instantPayout: { isEnabled: true, fee: 50 },
                    monthlyPayout: { isEnabled: true, dayOfMonth: 5 }
                },
                razorpay: {
                    keyId: process.env.RAZORPAY_KEY_ID || null,
                    keySecret: process.env.RAZORPAY_KEY_SECRET || null,
                    isActive: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
                }
            };
        }
    }

    /**
     * Create unified payment session
     * @param {Object} paymentData - Payment data
     * @returns {Object} Payment session details
     */
    async createPaymentSession(paymentData) {
        try {
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
                checkoutPage,
                metadata = {}
            } = paymentData;

            // Calculate fees and commissions (use checkout page business logic if available)
            const calculations = await this.calculateFeesAndCommissions({
                transactionType,
                grossAmount,
                coachId,
                mlmLevel,
                sponsorId,
                checkoutPage
            });

            // Create transaction record
            const transaction = new UnifiedPaymentTransaction({
                transactionType,
                grossAmount,
                netAmount: calculations.netAmount,
                currency: checkoutPage?.configuration?.payment?.currency || 'INR',
                platformFee: calculations.platformFee,
                commissionAmount: calculations.commissionAmount,
                taxAmount: calculations.taxAmount,
                tdsAmount: calculations.tdsAmount,
                gstAmount: calculations.gstAmount,
                sender: {
                    id: senderId,
                    type: senderType
                },
                receiver: {
                    id: receiverId,
                    type: receiverType
                },
                product: {
                    id: productId,
                    type: productType,
                    name: productName,
                    description: productDescription,
                    coachId
                },
                mlm: {
                    level: mlmLevel,
                    sponsorId,
                    commissionPercentage: calculations.mlmCommissionPercentage
                },
                gateway: {
                    name: gateway
                },
                checkoutPage,
                metadata
            });

            await transaction.save();

            // Create payment session with gateway
            const session = await this.createGatewaySession(transaction, gateway, checkoutPage);

            return {
                transactionId: transaction.transactionId,
                orderId: transaction.orderId,
                session,
                transaction: transaction
            };

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error creating payment session:', error);
            throw error;
        }
    }

    /**
     * Calculate fees and commissions
     */
    async calculateFeesAndCommissions(data) {
        const { transactionType, grossAmount, coachId, mlmLevel, sponsorId, checkoutPage } = data;
        
        let platformFee = 0;
        let commissionAmount = 0;
        let mlmCommissionPercentage = 0;
        let taxAmount = 0;
        let tdsAmount = 0;
        let gstAmount = 0;

        // Calculate platform fee (use checkout page settings if available)
        if (checkoutPage?.businessLogic?.commission?.commissionType === 'fixed') {
            platformFee = checkoutPage.businessLogic.commission.commissionValue || 0;
        } else if (this.settings.platformFee.isPercentageBased) {
            platformFee = (grossAmount * this.settings.platformFee.percentage) / 100;
        } else {
            platformFee = this.settings.platformFee.fixedAmount;
        }

        // Calculate commission based on transaction type
        switch (transactionType) {
            case 'course_purchase':
            case 'product_purchase':
                commissionAmount = (grossAmount * this.settings.commission.directCommission.percentage) / 100;
                break;
            
            case 'mlm_commission':
                if (mlmLevel && this.settings.commission.mlmLevels[mlmLevel - 1]) {
                    mlmCommissionPercentage = this.settings.commission.mlmLevels[mlmLevel - 1].percentage;
                    commissionAmount = (grossAmount * mlmCommissionPercentage) / 100;
                }
                break;
        }

        // Calculate taxes (use checkout page settings if available)
        if (checkoutPage?.businessLogic?.tax?.enableGST) {
            gstAmount = (grossAmount * checkoutPage.businessLogic.tax.gstPercentage) / 100;
        } else if (this.settings.tax.gst.isEnabled) {
            gstAmount = (grossAmount * this.settings.tax.gst.percentage) / 100;
        }

        if (checkoutPage?.businessLogic?.tax?.enableTDS && grossAmount >= checkoutPage.businessLogic.tax.tdsThreshold) {
            tdsAmount = (grossAmount * checkoutPage.businessLogic.tax.tdsPercentage) / 100;
        } else if (this.settings.tax.tds.isEnabled && grossAmount >= this.settings.tax.tds.threshold) {
            tdsAmount = (grossAmount * this.settings.tax.tds.percentage) / 100;
        }

        taxAmount = gstAmount + tdsAmount;

        const netAmount = grossAmount - platformFee - commissionAmount - taxAmount;

        return {
            platformFee,
            commissionAmount,
            mlmCommissionPercentage,
            taxAmount,
            tdsAmount,
            gstAmount,
            netAmount
        };
    }

    /**
     * Create gateway session
     */
    async createGatewaySession(transaction, gateway, checkoutPage) {
        // This would integrate with actual payment gateways
        // For now, return mock session data with checkout page integration
        
        // Generate redirect URL if checkout page is provided
        let redirectUrl = `https://payment.funnelseye.com/pay/${transaction.transactionId}`;
        
        if (checkoutPage?.pageId) {
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            redirectUrl = `${baseUrl}/checkout/${checkoutPage.pageId}?transactionId=${transaction.transactionId}`;
        }

        return {
            gateway,
            sessionId: `session_${Date.now()}`,
            paymentUrl: redirectUrl,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            checkoutPage: checkoutPage ? {
                pageId: checkoutPage.pageId,
                configuration: checkoutPage.configuration
            } : null
        };
    }

    /**
     * Process payment completion
     */
    async processPaymentCompletion(transactionId, gatewayResponse) {
        try {
            const transaction = await UnifiedPaymentTransaction.findOne({ transactionId });
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Update transaction status
            transaction.status = 'completed';
            transaction.completedAt = new Date();
            transaction.gateway.response = gatewayResponse;
            transaction.gateway.transactionId = gatewayResponse.transactionId;

            await transaction.save();

            // Execute post-transaction actions
            await this.executePostTransactionActions(transaction);

            return transaction;

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error processing payment completion:', error);
            throw error;
        }
    }

    /**
     * Execute post-transaction actions
     */
    async executePostTransactionActions(transaction) {
        const actions = this.settings.automation.postPaymentActions;

        try {
            // Update coach earnings
            if (actions.updateCoachEarnings && transaction.commissionAmount > 0) {
                await this.updateCoachEarnings(transaction);
            }

            // Add course to client
            if (actions.addCourseToClient && 
                (transaction.transactionType === 'course_purchase' || transaction.transactionType === 'product_purchase')) {
                await this.addCourseToClient(transaction);
            }

            // Trigger automation rules
            if (actions.triggerAutomationRules) {
                await this.triggerAutomationRules(transaction);
            }

            // Send notifications
            if (actions.sendEmailNotification) {
                await this.sendEmailNotification(transaction);
            }

            // WhatsApp functionality moved to dustbin/whatsapp-dump/
            // if (actions.sendWhatsAppNotification) {
            //     await this.sendWhatsAppNotification(transaction);
            // }

            // Update post-transaction actions status
            transaction.postTransactionActions = {
                emailSent: actions.sendEmailNotification,
                // whatsappSent: actions.sendWhatsAppNotification, // WhatsApp functionality moved to dustbin/whatsapp-dump/
                automationTriggered: actions.triggerAutomationRules,
                courseAdded: actions.addCourseToClient,
                earningsUpdated: actions.updateCoachEarnings
            };

            await transaction.save();

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error executing post-transaction actions:', error);
        }
    }

    /**
     * Update coach earnings
     */
    async updateCoachEarnings(transaction) {
        try {
            const coach = await User.findById(transaction.product.coachId);
            if (!coach) return;

            // Update coach's earnings
            coach.earnings = (coach.earnings || 0) + transaction.commissionAmount;
            coach.totalSales = (coach.totalSales || 0) + transaction.grossAmount;
            
            await coach.save();

            logger.info(`[UnifiedPaymentService] Updated earnings for coach ${coach._id}: +${transaction.commissionAmount}`);

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error updating coach earnings:', error);
        }
    }

    /**
     * Add course to client
     */
    async addCourseToClient(transaction) {
        try {
            const client = await User.findById(transaction.sender.id);
            if (!client) return;

            // Add course to client's purchased courses
            if (!client.purchasedCourses) {
                client.purchasedCourses = [];
            }

            client.purchasedCourses.push({
                courseId: transaction.product.id,
                purchasedAt: transaction.completedAt,
                transactionId: transaction.transactionId
            });

            await client.save();

            logger.info(`[UnifiedPaymentService] Added course ${transaction.product.id} to client ${client._id}`);

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error adding course to client:', error);
        }
    }

    /**
     * Trigger automation rules
     */
    async triggerAutomationRules(transaction) {
        try {
            // This would integrate with your automation system
            // For now, just log the event
            logger.info(`[UnifiedPaymentService] Triggering automation rules for transaction ${transaction.transactionId}`);

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error triggering automation rules:', error);
        }
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(transaction) {
        try {
            // This would integrate with your email service
            logger.info(`[UnifiedPaymentService] Sending email notification for transaction ${transaction.transactionId}`);

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error sending email notification:', error);
        }
    }

    /**
     * Send WhatsApp notification
     */
    async sendWhatsAppNotification(transaction) {
        try {
            // WhatsApp functionality moved to dustbin/whatsapp-dump/
            logger.info(`[UnifiedPaymentService] WhatsApp functionality moved to dustbin/whatsapp-dump/`);
            throw new Error('WhatsApp functionality moved to dustbin/whatsapp-dump/');

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error sending WhatsApp notification:', error);
        }
    }

    /**
     * Process instant payout
     */
    async processInstantPayout(coachId, amount, payoutMethod, destination) {
        try {
            if (!this.settings.payout.instantPayout.isEnabled) {
                throw new Error('Instant payout is disabled');
            }

            if (amount < this.settings.payout.instantPayout.minimumAmount) {
                throw new Error(`Minimum amount for instant payout is ${this.settings.payout.instantPayout.minimumAmount}`);
            }

            if (amount > this.settings.payout.instantPayout.maximumAmount) {
                throw new Error(`Maximum amount for instant payout is ${this.settings.payout.instantPayout.maximumAmount}`);
            }

            const payoutFee = this.settings.payout.instantPayout.fee;
            const netAmount = amount - payoutFee;

            // Create payout transaction
            const transaction = new UnifiedPaymentTransaction({
                transactionType: 'instant_payout',
                grossAmount: amount,
                netAmount: netAmount,
                sender: {
                    id: 'central_account', // Central account ID
                    type: 'system'
                },
                receiver: {
                    id: coachId,
                    type: 'coach'
                },
                payout: {
                    method: payoutMethod,
                    destination,
                    isInstant: true,
                    fee: payoutFee
                },
                status: 'processing'
            });

            await transaction.save();

            // Process payout with gateway
            const payoutResult = await this.processPayoutWithGateway(transaction);

            if (payoutResult.success) {
                transaction.status = 'completed';
                transaction.completedAt = new Date();
                await transaction.save();
            } else {
                transaction.status = 'failed';
                await transaction.save();
                throw new Error(payoutResult.error);
            }

            return transaction;

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error processing instant payout:', error);
            throw error;
        }
    }

    /**
     * Process payout with gateway
     */
    async processPayoutWithGateway(transaction) {
        // This would integrate with actual payout gateways (UPI, Bank Transfer, etc.)
        // For now, return mock success
        return {
            success: true,
            gatewayTransactionId: `payout_${Date.now()}`,
            message: 'Payout processed successfully'
        };
    }

    /**
     * Get commission calculator data
     */
    async getCommissionCalculatorData(amount, coachId, mlmLevel) {
        try {
            const calculations = await this.calculateFeesAndCommissions({
                transactionType: 'course_purchase',
                grossAmount: amount,
                coachId,
                mlmLevel
            });

            return {
                grossAmount: amount,
                platformFee: calculations.platformFee,
                commissionAmount: calculations.commissionAmount,
                taxAmount: calculations.taxAmount,
                netAmount: calculations.netAmount,
                mlmLevels: this.settings.commission.mlmLevels,
                platformFeePercentage: this.settings.platformFee.percentage,
                directCommissionPercentage: this.settings.commission.directCommission.percentage
            };

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error getting commission calculator data:', error);
            throw error;
        }
    }

    /**
     * Get transaction statistics
     */
    async getTransactionStatistics(filters = {}) {
        try {
            const matchStage = {};
            
            if (filters.startDate) {
                matchStage.initiatedAt = { $gte: new Date(filters.startDate) };
            }
            if (filters.endDate) {
                matchStage.initiatedAt = { ...matchStage.initiatedAt, $lte: new Date(filters.endDate) };
            }
            if (filters.transactionType) {
                matchStage.transactionType = filters.transactionType;
            }
            if (filters.status) {
                matchStage.status = filters.status;
            }

            const stats = await UnifiedPaymentTransaction.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalTransactions: { $sum: 1 },
                        totalAmount: { $sum: '$grossAmount' },
                        totalCommissions: { $sum: '$commissionAmount' },
                        totalPlatformFees: { $sum: '$platformFee' },
                        totalTaxes: { $sum: '$taxAmount' }
                    }
                }
            ]);

            return stats[0] || {
                totalTransactions: 0,
                totalAmount: 0,
                totalCommissions: 0,
                totalPlatformFees: 0,
                totalTaxes: 0
            };

        } catch (error) {
            logger.error('[UnifiedPaymentService] Error getting transaction statistics:', error);
            throw error;
        }
    }

    /**
     * Get payment statistics
     */
    async getPaymentStatistics() {
        try {
            const totalTransactions = await UnifiedPaymentTransaction.countDocuments();
            const successfulTransactions = await UnifiedPaymentTransaction.countDocuments({ status: 'completed' });
            const totalAmount = await UnifiedPaymentTransaction.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$grossAmount' } } }
            ]);

            const monthlyStats = await UnifiedPaymentTransaction.aggregate([
                { 
                    $match: { 
                        status: 'completed',
                        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                    } 
                },
                { $group: { _id: null, total: { $sum: '$grossAmount' }, count: { $sum: 1 } } }
            ]);

            return {
                totalTransactions,
                successfulTransactions,
                totalAmount: totalAmount[0]?.total || 0,
                successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
                thisMonthRevenue: monthlyStats[0]?.total || 0,
                thisMonthTransactions: monthlyStats[0]?.count || 0
            };
        } catch (error) {
            logger.error('[UnifiedPaymentService] Error getting statistics:', error);
            throw error;
        }
    }

    /**
     * Process refund
     */
    async processRefund(transactionId, refundData) {
        try {
            const transaction = await UnifiedPaymentTransaction.findOne({ transactionId });
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            if (transaction.status !== 'completed') {
                throw new Error('Transaction is not completed');
            }

            // Create refund transaction
            const refundTransaction = new UnifiedPaymentTransaction({
                transactionId: `REFUND_${Date.now()}`,
                orderId: `REFUND_${transaction.orderId}`,
                referenceId: `REFUND_${transaction.referenceId}`,
                transactionType: 'refund',
                grossAmount: refundData.amount || transaction.grossAmount,
                senderId: transaction.receiverId,
                senderType: transaction.receiverType,
                receiverId: transaction.senderId,
                receiverType: transaction.senderType,
                productId: transaction.productId,
                productType: transaction.productType,
                productName: `Refund: ${transaction.productName}`,
                productDescription: `Refund for ${transaction.productDescription}`,
                coachId: transaction.coachId,
                status: 'pending',
                gateway: transaction.gateway,
                metadata: {
                    ...transaction.metadata,
                    originalTransactionId: transaction.transactionId,
                    refundReason: refundData.reason,
                    refundAmount: refundData.amount || transaction.grossAmount
                }
            });

            await refundTransaction.save();

            // Update original transaction
            transaction.status = 'refunded';
            transaction.metadata = {
                ...transaction.metadata,
                refundTransactionId: refundTransaction.transactionId,
                refundReason: refundData.reason
            };
            await transaction.save();

            return refundTransaction;
        } catch (error) {
            logger.error('[UnifiedPaymentService] Error processing refund:', error);
            throw error;
        }
    }

    /**
     * Get all payments with pagination and filters
     */
    async getAllPayments(options = {}) {
        try {
            const { page = 1, limit = 20, status, transactionType } = options;
            const skip = (page - 1) * limit;

            const matchStage = {};
            if (status) matchStage.status = status;
            if (transactionType) matchStage.transactionType = transactionType;

            const transactions = await UnifiedPaymentTransaction.find(matchStage)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('senderId', 'name email')
                .populate('receiverId', 'name email')
                .populate('coachId', 'name email');

            const total = await UnifiedPaymentTransaction.countDocuments(matchStage);

            return {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('[UnifiedPaymentService] Error getting all payments:', error);
            throw error;
        }
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(id, status, notes) {
        try {
            const transaction = await UnifiedPaymentTransaction.findById(id);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            transaction.status = status;
            if (notes) {
                transaction.metadata = {
                    ...transaction.metadata,
                    adminNotes: notes,
                    statusUpdatedAt: new Date()
                };
            }

            await transaction.save();
            return transaction;
        } catch (error) {
            logger.error('[UnifiedPaymentService] Error updating payment status:', error);
            throw error;
        }
    }

    /**
     * Delete payment
     */
    async deletePayment(id) {
        try {
            const transaction = await UnifiedPaymentTransaction.findById(id);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Only allow deletion of pending or failed transactions
            if (['completed', 'refunded'].includes(transaction.status)) {
                throw new Error('Cannot delete completed or refunded transactions');
            }

            await UnifiedPaymentTransaction.findByIdAndDelete(id);
            return true;
        } catch (error) {
            logger.error('[UnifiedPaymentService] Error deleting payment:', error);
            throw error;
        }
    }
}

module.exports = new UnifiedPaymentService();
