const Razorpay = require('razorpay');
const CentralPayment = require('../schema/CentralPayment');
const PaymentGatewayConfig = require('../schema/PaymentGatewayConfig');
const logger = require('../utils/logger');

class CentralPaymentService {
    constructor() {
        this.gateways = new Map();
        this.initializeGateways();
    }

    /**
     * Initialize payment gateways
     */
    async initializeGateways() {
        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Database connection timeout')), 5000);
            });

            const gatewayConfigsPromise = PaymentGatewayConfig.getActiveGateways();
            const gatewayConfigs = await Promise.race([gatewayConfigsPromise, timeoutPromise]);
            
            for (const config of gatewayConfigs) {
                await this.initializeGateway(config);
            }
            
            logger.info(`[CentralPaymentService] Initialized ${gatewayConfigs.length} payment gateways`);
        } catch (error) {
            logger.error('[CentralPaymentService] Error initializing gateways:', error);
            // Continue without gateways to prevent server crash
            logger.info('[CentralPaymentService] Continuing without gateway initialization');
        }
    }

    /**
     * Initialize a specific gateway
     */
    async initializeGateway(config) {
        try {
            switch (config.gatewayName) {
                case 'razorpay':
                    if (config.config.razorpay.keyId && config.config.razorpay.keySecret) {
                        const razorpay = new Razorpay({
                            key_id: config.config.razorpay.keyId,
                            key_secret: config.config.razorpay.keySecret
                        });
                        this.gateways.set('razorpay', { instance: razorpay, config });
                        logger.info('[CentralPaymentService] Razorpay gateway initialized');
                    }
                    break;
                    
                case 'stripe':
                    // Stripe initialization will be added later
                    logger.info('[CentralPaymentService] Stripe gateway configuration ready');
                    break;
                    
                case 'paypal':
                    // PayPal initialization will be added later
                    logger.info('[CentralPaymentService] PayPal gateway configuration ready');
                    break;
                    
                case 'bank_transfer':
                    this.gateways.set('bank_transfer', { config });
                    logger.info('[CentralPaymentService] Bank transfer gateway initialized');
                    break;
                    
                case 'manual':
                    this.gateways.set('manual', { config });
                    logger.info('[CentralPaymentService] Manual payment gateway initialized');
                    break;
            }
        } catch (error) {
            logger.error(`[CentralPaymentService] Error initializing ${config.gatewayName} gateway:`, error);
        }
    }

    /**
     * Create a payment session
     */
    async createPaymentSession(paymentData) {
        try {
            logger.info(`[CentralPaymentService] Creating payment session for user ${paymentData.userId}`);
            
            // Validate payment data
            const validation = this.validatePaymentData(paymentData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Calculate taxes and fees
            const payment = new CentralPayment(paymentData);
            payment.calculateTaxes();
            
            // Generate order ID
            payment.orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            
            // Save payment record
            await payment.save();
            
            // Create payment session based on gateway
            const session = await this.createGatewaySession(payment);
            
            logger.info(`[CentralPaymentService] Payment session created: ${payment.paymentId}`);
            
            return {
                success: true,
                paymentId: payment.paymentId,
                orderId: payment.orderId,
                session: session,
                payment: payment
            };
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error creating payment session:', error);
            throw error;
        }
    }

    /**
     * Create gateway-specific payment session
     */
    async createGatewaySession(payment) {
        try {
            const gateway = this.gateways.get(payment.gateway);
            if (!gateway) {
                throw new Error(`Gateway ${payment.gateway} not available`);
            }

            switch (payment.gateway) {
                case 'razorpay':
                    return await this.createRazorpaySession(payment, gateway);
                    
                case 'stripe':
                    return await this.createStripeSession(payment, gateway);
                    
                case 'paypal':
                    return await this.createPayPalSession(payment, gateway);
                    
                case 'bank_transfer':
                    return await this.createBankTransferSession(payment, gateway);
                    
                case 'manual':
                    return await this.createManualPaymentSession(payment, gateway);
                    
                default:
                    throw new Error(`Unsupported gateway: ${payment.gateway}`);
            }
        } catch (error) {
            logger.error(`[CentralPaymentService] Error creating gateway session for ${payment.gateway}:`, error);
            throw error;
        }
    }

    /**
     * Create Razorpay payment session
     */
    async createRazorpaySession(payment, gateway) {
        try {
            const razorpay = gateway.instance;
            
            const options = {
                amount: Math.round(payment.totalAmount * 100), // Razorpay expects amount in paise
                currency: payment.currency,
                receipt: payment.orderId,
                payment_capture: 1,
                notes: {
                    paymentId: payment.paymentId,
                    businessType: payment.businessType,
                    userId: payment.userId.toString()
                }
            };

            const order = await razorpay.orders.create(options);
            
            // Update payment with gateway order ID
            payment.gatewayTransactionId = order.id;
            await payment.save();
            
            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt,
                key: gateway.config.config.razorpay.keyId
            };
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error creating Razorpay session:', error);
            throw error;
        }
    }

    /**
     * Create Stripe payment session (placeholder for future)
     */
    async createStripeSession(payment, gateway) {
        // This will be implemented when Stripe is added
        throw new Error('Stripe integration not yet implemented');
    }

    /**
     * Create PayPal payment session (placeholder for future)
     */
    async createPayPalSession(payment, gateway) {
        // This will be implemented when PayPal is added
        throw new Error('PayPal integration not yet implemented');
    }

    /**
     * Create bank transfer session
     */
    async createBankTransferSession(payment, gateway) {
        try {
            const bankConfig = gateway.config.config.bank_transfer;
            
            return {
                type: 'bank_transfer',
                bankDetails: {
                    bankName: bankConfig.bankName,
                    accountNumber: bankConfig.accountNumber,
                    ifscCode: bankConfig.ifscCode,
                    accountHolderName: bankConfig.accountHolderName,
                    branchName: bankConfig.branchName
                },
                amount: payment.totalAmount,
                currency: payment.currency,
                reference: payment.paymentId,
                instructions: 'Please include the reference number in your transfer description'
            };
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error creating bank transfer session:', error);
            throw error;
        }
    }

    /**
     * Create manual payment session
     */
    async createManualPaymentSession(payment, gateway) {
        try {
            const manualConfig = gateway.config.config.manual;
            
            return {
                type: 'manual',
                instructions: manualConfig.instructions,
                contactEmail: manualConfig.contactEmail,
                contactPhone: manualConfig.contactPhone,
                processingTime: manualConfig.processingTime,
                amount: payment.totalAmount,
                currency: payment.currency,
                reference: payment.paymentId
            };
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error creating manual payment session:', error);
            throw error;
        }
    }

    /**
     * Process payment webhook
     */
    async processPaymentWebhook(gateway, webhookData) {
        try {
            logger.info(`[CentralPaymentService] Processing ${gateway} webhook`);
            
            switch (gateway) {
                case 'razorpay':
                    return await this.processRazorpayWebhook(webhookData);
                    
                case 'stripe':
                    return await this.processStripeWebhook(webhookData);
                    
                case 'paypal':
                    return await this.processPayPalWebhook(webhookData);
                    
                default:
                    throw new Error(`Unsupported gateway: ${gateway}`);
            }
        } catch (error) {
            logger.error(`[CentralPaymentService] Error processing ${gateway} webhook:`, error);
            throw error;
        }
    }

    /**
     * Process Razorpay webhook
     */
    async processRazorpayWebhook(webhookData) {
        try {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = webhookData;
            
            // Verify webhook signature
            const gateway = this.gateways.get('razorpay');
            if (!gateway) {
                throw new Error('Razorpay gateway not available');
            }
            
            // Find payment by order ID
            const payment = await CentralPayment.findOne({ 
                gatewayTransactionId: razorpay_order_id 
            });
            
            if (!payment) {
                throw new Error('Payment not found');
            }
            
            // Update payment status
            payment.status = 'completed';
            payment.completedDate = new Date();
            payment.gatewayResponse = webhookData;
            await payment.save();
            
            // Trigger business logic based on payment type
            await this.handlePaymentCompletion(payment);
            
            logger.info(`[CentralPaymentService] Razorpay payment completed: ${payment.paymentId}`);
            
            return { success: true, paymentId: payment.paymentId };
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error processing Razorpay webhook:', error);
            throw error;
        }
    }

    /**
     * Handle payment completion
     */
    async handlePaymentCompletion(payment) {
        try {
            logger.info(`[CentralPaymentService] Handling payment completion for ${payment.paymentId}`);
            
            switch (payment.businessType) {
                case 'product_purchase':
                    await this.handleProductPurchase(payment);
                    break;
                    
                case 'subscription':
                    await this.handleSubscriptionPayment(payment);
                    break;
                    
                case 'commission':
                    await this.handleCommissionPayment(payment);
                    break;
                    
                case 'mlm_payout':
                    await this.handleMlmPayout(payment);
                    break;
                    
                case 'service_payment':
                    await this.handleServicePayment(payment);
                    break;
                    
                default:
                    logger.info(`[CentralPaymentService] No specific handler for business type: ${payment.businessType}`);
            }
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error handling payment completion:', error);
            throw error;
        }
    }

    /**
     * Handle product purchase
     */
    async handleProductPurchase(payment) {
        try {
            logger.info(`[CentralPaymentService] Processing product purchase for payment ${payment.paymentId}`);
            
            // Here you would integrate with your product/inventory system
            // For now, we'll just log the completion
            
            // Example: Update product inventory, send confirmation email, etc.
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error handling product purchase:', error);
            throw error;
        }
    }

    /**
     * Handle subscription payment
     */
    async handleSubscriptionPayment(payment) {
        try {
            logger.info(`[CentralPaymentService] Processing subscription payment for payment ${payment.paymentId}`);
            
            // Here you would integrate with your subscription system
            // For now, we'll just log the completion
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error handling subscription payment:', error);
            throw error;
        }
    }

    /**
     * Handle commission payment
     */
    async handleCommissionPayment(payment) {
        try {
            logger.info(`[CentralPaymentService] Processing commission payment for payment ${payment.paymentId}`);
            
            // Here you would integrate with your MLM/commission system
            // For now, we'll just log the completion
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error handling commission payment:', error);
            throw error;
        }
    }

    /**
     * Handle MLM payout
     */
    async handleMlmPayout(payment) {
        try {
            logger.info(`[CentralPaymentService] Processing MLM payout for payment ${payment.paymentId}`);
            
            // Here you would integrate with your MLM system
            // For now, we'll just log the completion
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error handling MLM payout:', error);
            throw error;
        }
    }

    /**
     * Handle service payment
     */
    async handleServicePayment(payment) {
        try {
            logger.info(`[CentralPaymentService] Processing service payment for payment ${payment.paymentId}`);
            
            // Here you would integrate with your service system
            // For now, we'll just log the completion
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error handling service payment:', error);
            throw error;
        }
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(paymentId) {
        try {
            const payment = await CentralPayment.findOne({ paymentId });
            if (!payment) {
                throw new Error('Payment not found');
            }
            return payment;
        } catch (error) {
            logger.error('[CentralPaymentService] Error getting payment by ID:', error);
            throw error;
        }
    }

    /**
     * Get payments by user
     */
    async getPaymentsByUser(userId, userType, filters = {}) {
        try {
            const query = { userId, userType, ...filters };
            const payments = await CentralPayment.find(query).sort({ createdAt: -1 });
            return payments;
        } catch (error) {
            logger.error('[CentralPaymentService] Error getting payments by user:', error);
            throw error;
        }
    }

    /**
     * Get payment statistics
     */
    async getPaymentStats(filters = {}) {
        try {
            return await CentralPayment.getPaymentStats(filters);
        } catch (error) {
            logger.error('[CentralPaymentService] Error getting payment stats:', error);
            throw error;
        }
    }

    /**
     * Validate payment data
     */
    validatePaymentData(paymentData) {
        const errors = [];
        
        if (!paymentData.amount || paymentData.amount <= 0) {
            errors.push('Invalid amount');
        }
        
        if (!paymentData.userId) {
            errors.push('User ID is required');
        }
        
        if (!paymentData.userType) {
            errors.push('User type is required');
        }
        
        if (!paymentData.businessType) {
            errors.push('Business type is required');
        }
        
        if (!paymentData.gateway) {
            errors.push('Payment gateway is required');
        }
        
        if (!paymentData.paymentMethod) {
            errors.push('Payment method is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Refund payment
     */
    async refundPayment(paymentId, refundAmount, reason) {
        try {
            const payment = await this.getPaymentById(paymentId);
            
            if (payment.status !== 'completed') {
                throw new Error('Payment must be completed to refund');
            }
            
            if (refundAmount > payment.amount) {
                throw new Error('Refund amount cannot exceed payment amount');
            }
            
            // Process refund based on gateway
            const refund = await this.processGatewayRefund(payment, refundAmount, reason);
            
            // Update payment status
            payment.status = refundAmount === payment.amount ? 'refunded' : 'partially_refunded';
            payment.refundDate = new Date();
            payment.metadata = { ...payment.metadata, refund: refund };
            await payment.save();
            
            logger.info(`[CentralPaymentService] Payment ${paymentId} refunded successfully`);
            
            return { success: true, refund };
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error refunding payment:', error);
            throw error;
        }
    }

    /**
     * Process gateway-specific refund
     */
    async processGatewayRefund(payment, refundAmount, reason) {
        try {
            switch (payment.gateway) {
                case 'razorpay':
                    return await this.processRazorpayRefund(payment, refundAmount, reason);
                    
                case 'stripe':
                    return await this.processStripeRefund(payment, refundAmount, reason);
                    
                case 'paypal':
                    return await this.processPayPalRefund(payment, refundAmount, reason);
                    
                default:
                    throw new Error(`Refund not supported for gateway: ${payment.gateway}`);
            }
        } catch (error) {
            logger.error(`[CentralPaymentService] Error processing ${payment.gateway} refund:`, error);
            throw error;
        }
    }

    /**
     * Process Razorpay refund
     */
    async processRazorpayRefund(payment, refundAmount, reason) {
        try {
            const gateway = this.gateways.get('razorpay');
            if (!gateway) {
                throw new Error('Razorpay gateway not available');
            }
            
            const razorpay = gateway.instance;
            
            const refund = await razorpay.payments.refund(payment.gatewayTransactionId, {
                amount: Math.round(refundAmount * 100), // Convert to paise
                speed: 'normal',
                notes: {
                    reason: reason,
                    paymentId: payment.paymentId
                }
            });
            
            return {
                refundId: refund.id,
                amount: refund.amount / 100, // Convert from paise
                status: refund.status,
                gatewayResponse: refund
            };
            
        } catch (error) {
            logger.error('[CentralPaymentService] Error processing Razorpay refund:', error);
            throw error;
        }
    }

    /**
     * Process Stripe refund (placeholder)
     */
    async processStripeRefund(payment, refundAmount, reason) {
        throw new Error('Stripe refund not yet implemented');
    }

    /**
     * Process PayPal refund (placeholder)
     */
    async processPayPalRefund(payment, refundAmount, reason) {
        throw new Error('PayPal refund not yet implemented');
    }
}

module.exports = new CentralPaymentService();
