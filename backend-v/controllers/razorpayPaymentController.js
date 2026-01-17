const Razorpay = require('razorpay');
const RazorpayPayment = require('../schema/RazorpayPayment');
const CoachSellablePlan = require('../schema/CoachSellablePlan');
const AdminProduct = require('../schema/AdminProduct');
const User = require('../schema/User');
const crypto = require('crypto');
const logger = require('../utils/logger');
const rabbitmqProducer = require('../services/rabbitmqProducer');

class RazorpayPaymentController {
    
    constructor() {
        // Check if Razorpay credentials are available
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            logger.warn('[RazorpayPaymentController] Razorpay credentials not found in environment variables');
            logger.warn('[RazorpayPaymentController] Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
            this.razorpay = null;
            return;
        }
        
        // Initialize Razorpay with environment variables
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        
        logger.info('[RazorpayPaymentController] Razorpay initialized successfully');
    }
    
    /**
     * Check if Razorpay is properly initialized
     */
    checkRazorpayInitialized(res) {
        if (!this.razorpay) {
            res.status(500).json({
                success: false,
                message: 'Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables'
            });
            return false;
        }
        return true;
    }
    
    /**
     * Create Razorpay order
     * POST /api/paymentsv1/payments/create-razorpay-order
     */
    async createRazorpayOrder(req, res) {
        try {
            logger.info('[RazorpayPaymentController] Creating Razorpay order');
            
            // Check if Razorpay is initialized
            if (!this.checkRazorpayInitialized(res)) return;
            
            const { amount, currency = 'INR', receipt } = req.body;
            
            // Validate required fields
            if (!amount) {
                return res.status(400).json({
                    success: false,
                    message: 'amount is required'
                });
            }
            
            // Create Razorpay order
            const orderOptions = {
                amount: parseInt(amount),
                currency: currency,
                receipt: receipt || `order_${Date.now()}`
            };
            
            const razorpayOrder = await this.razorpay.orders.create(orderOptions);
            
            logger.info(`[RazorpayPaymentController] Order created: ${razorpayOrder.id}`);
            
            res.json({
                success: true,
                message: 'Order created successfully',
                data: {
                    razorpay_order_id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    receipt: razorpayOrder.receipt,
                    status: razorpayOrder.status,
                    created_at: razorpayOrder.created_at
                }
            });
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error creating Razorpay order:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating order',
                error: error.message
            });
        }
    }

    /**
     * Create Razorpay order for coach plan purchase
     * POST /api/paymentsv1/payments/coach-plan/create-order
     */
    async createCoachPlanOrder(req, res) {
        try {
            logger.info('[RazorpayPaymentController] Creating order for coach plan purchase');
            
            // Check if Razorpay is initialized
            if (!this.checkRazorpayInitialized(res)) return;
            
            const { planId, customerId, customerEmail, customerPhone } = req.body;
            
            // Validate required fields
            if (!planId || !customerId) {
                return res.status(400).json({
                    success: false,
                    message: 'planId and customerId are required'
                });
            }
            
            // Get plan details
            const plan = await CoachSellablePlan.findOne({ 
                _id: planId, 
                status: 'active', 
                isPublic: true 
            }).populate('coachId adminProductId');
            
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found or not available for purchase'
                });
            }
            
            // Calculate amount in paise (Razorpay expects amount in smallest currency unit)
            const amountInPaise = Math.round(plan.price * 100);
            
            // Create Razorpay order
            const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
            const receiptId = `CP${timestamp}`; // Coach Plan + timestamp (max 10 chars)
            
            const orderOptions = {
                amount: amountInPaise,
                currency: plan.currency,
                receipt: receiptId,
                notes: {
                    planId: plan._id.toString(),
                    coachId: plan.coachId._id.toString(),
                    customerId: customerId,
                    businessType: 'coach_plan_purchase',
                    fullReceipt: `coach_plan_${planId}_${Date.now()}` // Store full receipt in notes
                }
            };
            
            const razorpayOrder = await this.razorpay.orders.create(orderOptions);
            
            // Create payment record
            const payment = new RazorpayPayment({
                razorpayOrderId: razorpayOrder.id,
                amount: plan.price,
                currency: plan.currency,
                status: 'created',
                businessType: 'coach_plan_purchase',
                userId: customerId,
                userType: 'customer',
                planId: plan._id,
                productType: 'coach_plan',
                productName: plan.title,
                productDescription: plan.description,
                coachId: plan.coachId._id,
                razorpayResponse: razorpayOrder
            });
            
            await payment.save();
            
            logger.info(`[RazorpayPaymentController] Order created: ${razorpayOrder.id}`);
            
            // Create redirect URL for payment
            const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:8080';
            const redirectUrl = `${baseUrl}/checkout/payment?orderId=${razorpayOrder.id}&planId=${plan._id}&amount=${razorpayOrder.amount}&currency=${razorpayOrder.currency}`;
            
            res.json({
                success: true,
                message: 'Order created successfully',
                data: {
                    orderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    key: process.env.RAZORPAY_KEY_ID,
                    redirectUrl: redirectUrl, // ✅ Payment redirect link
                    plan: {
                        _id: plan._id,
                        title: plan.title,
                        price: plan.price,
                        currency: plan.currency,
                        coach: {
                            name: plan.coachId.name,
                            email: plan.coachId.email
                        }
                    }
                }
            });
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error creating coach plan order:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating order',
                error: error.message
            });
        }
    }
    
    /**
     * Create Razorpay order for platform subscription
     * POST /api/paymentsv1/payments/subscription/create-order
     */
    async createSubscriptionOrder(req, res) {
        try {
            logger.info('[RazorpayPaymentController] Creating order for platform subscription');
            
            // Check if Razorpay is initialized
            if (!this.checkRazorpayInitialized(res)) return;
            
            const { coachId, subscriptionPlan, amount, billingCycle, customerEmail, customerPhone } = req.body;
            
            // Validate required fields
            if (!coachId || !subscriptionPlan || !amount || !billingCycle) {
                return res.status(400).json({
                    success: false,
                    message: 'coachId, subscriptionPlan, amount, and billingCycle are required'
                });
            }
            
            // Verify coach exists
            const coach = await User.findById(coachId);
            if (!coach) {
                return res.status(404).json({
                    success: false,
                    message: 'Coach not found'
                });
            }
            
            // Calculate amount in paise
            const amountInPaise = Math.round(amount * 100);
            
            // Create Razorpay order
            const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
            const receiptId = `SUB${timestamp}`; // Subscription + timestamp (max 11 chars)
            
            const orderOptions = {
                amount: amountInPaise,
                currency: 'INR',
                receipt: receiptId,
                notes: {
                    coachId: coachId,
                    subscriptionPlan: subscriptionPlan,
                    billingCycle: billingCycle,
                    businessType: 'platform_subscription',
                    fullReceipt: `subscription_${coachId}_${Date.now()}` // Store full receipt in notes
                }
            };
            
            const razorpayOrder = await this.razorpay.orders.create(orderOptions);
            
            // Create payment record
            const payment = new RazorpayPayment({
                razorpayOrderId: razorpayOrder.id,
                amount: amount,
                currency: 'INR',
                status: 'created',
                businessType: 'platform_subscription',
                userId: coachId,
                userType: 'coach',
                productType: 'subscription',
                productName: `${subscriptionPlan} Subscription`,
                productDescription: `${billingCycle} subscription for ${subscriptionPlan}`,
                coachId: coachId,
                razorpayResponse: razorpayOrder
            });
            
            await payment.save();
            
            logger.info(`[RazorpayPaymentController] Subscription order created: ${razorpayOrder.id}`);
            
            // Create redirect URL for subscription payment
            const baseUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
            const redirectUrl = `${baseUrl}/checkout/subscription?orderId=${razorpayOrder.id}&plan=${subscriptionPlan}&billingCycle=${billingCycle}&amount=${razorpayOrder.amount}&currency=${razorpayOrder.currency}`;
            
            res.json({
                success: true,
                message: 'Subscription order created successfully',
                data: {
                    orderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    key: process.env.RAZORPAY_KEY_ID,
                    redirectUrl: redirectUrl, // ✅ Subscription payment redirect link
                    subscription: {
                        plan: subscriptionPlan,
                        billingCycle: billingCycle,
                        amount: amount,
                        coach: {
                            name: coach.name,
                            email: coach.email
                        }
                    }
                }
            });
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error creating subscription order:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating subscription order',
                error: error.message
            });
        }
    }
    
    /**
     * Verify payment and update status
     * POST /api/paymentsv1/payments/verify
     */
    async verifyPayment(req, res) {
        try {
            logger.info('[RazorpayPaymentController] Verifying payment');
            
            // Check if Razorpay is initialized
            if (!this.checkRazorpayInitialized(res)) return;
            
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            
            // Validate required fields
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'
                });
            }
            
            // Verify signature
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');
            
            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid signature'
                });
            }
            
            // Get payment record
            const payment = await RazorpayPayment.findOne({ razorpayOrderId: razorpay_order_id });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment record not found'
                });
            }
            
            // Update payment status
            payment.razorpayPaymentId = razorpay_payment_id;
            payment.razorpaySignature = razorpay_signature;
            payment.status = 'captured';
            payment.capturedAt = new Date();
            
            // Get Razorpay payment details
            const razorpayPaymentDetails = await this.razorpay.payments.fetch(razorpay_payment_id);
            payment.razorpayResponse = razorpayPaymentDetails;
            payment.paymentMethod = razorpayPaymentDetails.method;
            payment.bank = razorpayPaymentDetails.bank;
            payment.wallet = razorpayPaymentDetails.wallet;
            payment.vpa = razorpayPaymentDetails.vpa;
            
            await payment.save();
            
            // Process payment based on business type
            await this.processPaymentSuccess(payment);
            
            logger.info(`[RazorpayPaymentController] Payment verified successfully: ${razorpay_payment_id}`);
            
            res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    paymentId: razorpay_payment_id,
                    status: 'captured',
                    amount: payment.amount,
                    currency: payment.currency
                }
            });
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error verifying payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error verifying payment',
                error: error.message
            });
        }
    }
    
    /**
     * Process successful payment
     */
    async processPaymentSuccess(payment) {
        try {
            switch (payment.businessType) {
                case 'coach_plan_purchase':
                    await this.processCoachPlanPurchase(payment);
                    break;
                case 'platform_subscription':
                    await this.processPlatformSubscription(payment);
                    break;
                case 'mlm_commission':
                    await this.processMlmCommission(payment);
                    break;
                default:
                    logger.warn(`[RazorpayPaymentController] Unknown business type: ${payment.businessType}`);
            }
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error processing payment success:', error);
        }
    }
    
    /**
     * Process coach plan purchase
     */
    async processCoachPlanPurchase(payment) {
        try {
            const plan = await CoachSellablePlan.findById(payment.planId).populate('coachId adminProductId');
            if (!plan) {
                logger.error(`[RazorpayPaymentController] Plan not found: ${payment.planId}`);
                return;
            }
            
            // Update plan sales
            plan.totalSales += 1;
            plan.totalRevenue += payment.amount;
            
            // Calculate commissions
            const adminProduct = plan.adminProductId;
            const platformCommissionPercentage = adminProduct.commissionSettings.platformCommissionPercentage;
            const coachCommissionPercentage = adminProduct.commissionSettings.coachCommissionPercentage;
            
            const platformCommission = (payment.amount * platformCommissionPercentage) / 100;
            const coachCommission = (payment.amount * coachCommissionPercentage) / 100;
            
            plan.commissionEarned += coachCommission;
            plan.platformCommissionPaid += platformCommission;
            
            await plan.save();
            
            // Update admin product stats
            adminProduct.totalSales += 1;
            adminProduct.totalRevenue += payment.amount;
            await adminProduct.save();
            
            // Send notifications
            await this.sendPurchaseNotifications(payment, plan);
            
            // Update payment record with commission details
            payment.commissionAmount = coachCommission;
            payment.platformCommission = platformCommission;
            payment.coachCommission = coachCommission;
            await payment.save();
            
            logger.info(`[RazorpayPaymentController] Coach plan purchase processed: ${plan._id}`);
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error processing coach plan purchase:', error);
        }
    }
    
    /**
     * Process platform subscription
     */
    async processPlatformSubscription(payment) {
        try {
            // Here you would typically create or update a subscription record
            // For now, we'll just log the successful payment
            logger.info(`[RazorpayPaymentController] Platform subscription processed: ${payment.razorpayPaymentId}`);
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error processing platform subscription:', error);
        }
    }
    
    /**
     * Process MLM commission
     */
    async processMlmCommission(payment) {
        try {
            // Here you would typically process MLM commission distribution
            // For now, we'll just log the successful payment
            logger.info(`[RazorpayPaymentController] MLM commission processed: ${payment.razorpayPaymentId}`);
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error processing MLM commission:', error);
        }
    }
    
    /**
     * Get payment by ID
     * GET /api/paymentsv1/payments/:paymentId
     */
    async getPaymentById(req, res) {
        try {
            const { paymentId } = req.params;
            
            logger.info(`[RazorpayPaymentController] Getting payment: ${paymentId}`);
            
            const payment = await RazorpayPayment.findOne({ razorpayPaymentId: paymentId })
                .populate('userId', 'name email')
                .populate('coachId', 'name email')
                .populate('planId', 'title price')
                .populate('productId', 'name price');
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }
            
            res.json({
                success: true,
                data: payment
            });
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error getting payment:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting payment',
                error: error.message
            });
        }
    }
    
    /**
     * Get payments by user
     * GET /api/paymentsv1/payments/user/:userId
     */
    async getPaymentsByUser(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20, status, businessType } = req.query;
            
            logger.info(`[RazorpayPaymentController] Getting payments for user: ${userId}`);
            
            // Build query
            const query = { userId };
            if (status) query.status = status;
            if (businessType) query.businessType = businessType;
            
            // Execute query with pagination
            const skip = (page - 1) * limit;
            const payments = await RazorpayPayment.find(query)
                .populate('coachId', 'name email')
                .populate('planId', 'title price')
                .populate('productId', 'name price')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await RazorpayPayment.countDocuments(query);
            
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
            logger.error('[RazorpayPaymentController] Error getting user payments:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting user payments',
                error: error.message
            });
        }
    }
    
    /**
     * Process refund
     * POST /api/paymentsv1/payments/:paymentId/refund
     */
    async processRefund(req, res) {
        try {
            const { paymentId } = req.params;
            const { amount, reason } = req.body;
            
            logger.info(`[RazorpayPaymentController] Processing refund for payment: ${paymentId}`);
            
            // Check if Razorpay is initialized
            if (!this.checkRazorpayInitialized(res)) return;
            
            const payment = await RazorpayPayment.findOne({ razorpayPaymentId: paymentId });
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }
            
            if (payment.status !== 'captured') {
                return res.status(400).json({
                    success: false,
                    message: 'Only captured payments can be refunded'
                });
            }
            
            // Create Razorpay refund
            const refundAmount = amount ? Math.round(amount * 100) : payment.amount * 100;
            const refundOptions = {
                amount: refundAmount,
                notes: {
                    reason: reason || 'Customer requested refund'
                }
            };
            
            const razorpayRefund = await this.razorpay.payments.refund(paymentId, refundOptions);
            
            // Update payment record
            payment.refunds.push({
                refundId: razorpayRefund.id,
                amount: amount || payment.amount,
                status: razorpayRefund.status,
                reason: reason || 'Customer requested refund'
            });
            
            if (razorpayRefund.status === 'processed') {
                payment.status = 'refunded';
            }
            
            await payment.save();
            
            logger.info(`[RazorpayPaymentController] Refund processed: ${razorpayRefund.id}`);
            
            res.json({
                success: true,
                message: 'Refund processed successfully',
                data: {
                    refundId: razorpayRefund.id,
                    amount: razorpayRefund.amount / 100,
                    status: razorpayRefund.status
                }
            });
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error processing refund:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing refund',
                error: error.message
            });
        }
    }
    
    /**
     * Handle Razorpay webhook
     * POST /api/paymentsv1/payments/webhook
     */
    async handleWebhook(req, res) {
        try {
            const webhookData = req.body;
            const signature = req.headers['x-razorpay-signature'];
            
            logger.info('[RazorpayPaymentController] Processing Razorpay webhook');
            
            // Verify webhook signature
            const body = JSON.stringify(webhookData);
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
                .update(body)
                .digest('hex');
            
            if (expectedSignature !== signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }
            
            // Process webhook based on event type
            switch (webhookData.event) {
                case 'payment.captured':
                    await this.handlePaymentCaptured(webhookData);
                    break;
                case 'payment.failed':
                    await this.handlePaymentFailed(webhookData);
                    break;
                case 'refund.created':
                    await this.handleRefundCreated(webhookData);
                    break;
                default:
                    logger.info(`[RazorpayPaymentController] Unhandled webhook event: ${webhookData.event}`);
            }
            
            res.json({
                success: true,
                message: 'Webhook processed successfully'
            });
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error processing webhook:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing webhook',
                error: error.message
            });
        }
    }
    
    /**
     * Handle payment captured webhook
     */
    async handlePaymentCaptured(webhookData) {
        try {
            const paymentData = webhookData.payload.payment.entity;
            const orderId = paymentData.order_id;
            
            const payment = await RazorpayPayment.findOne({ razorpayOrderId: orderId });
            if (payment) {
                payment.status = 'captured';
                payment.capturedAt = new Date();
                payment.webhookData = webhookData;
                await payment.save();
                
                await this.processPaymentSuccess(payment);
            }
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error handling payment captured:', error);
        }
    }
    
    /**
     * Handle payment failed webhook
     */
    async handlePaymentFailed(webhookData) {
        try {
            const paymentData = webhookData.payload.payment.entity;
            const orderId = paymentData.order_id;
            
            const payment = await RazorpayPayment.findOne({ razorpayOrderId: orderId });
            if (payment) {
                payment.status = 'failed';
                payment.failedAt = new Date();
                payment.errorCode = paymentData.error_code;
                payment.errorDescription = paymentData.error_description;
                payment.webhookData = webhookData;
                await payment.save();
            }
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error handling payment failed:', error);
        }
    }
    
    /**
     * Handle refund created webhook
     */
    async handleRefundCreated(webhookData) {
        try {
            const refundData = webhookData.payload.refund.entity;
            const paymentId = refundData.payment_id;
            
            const payment = await RazorpayPayment.findOne({ razorpayPaymentId: paymentId });
            if (payment) {
                payment.refunds.push({
                    refundId: refundData.id,
                    amount: refundData.amount / 100,
                    status: refundData.status,
                    reason: refundData.notes?.reason || 'Refund processed'
                });
                
                if (refundData.status === 'processed') {
                    payment.status = 'refunded';
                }
                
                await payment.save();
            }
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error handling refund created:', error);
        }
    }
    
    /**
     * Send purchase notifications via RabbitMQ
     */
    async sendPurchaseNotifications(payment, plan) {
        try {
            const customerInfo = payment.customerInfo || {};
            const coach = plan.coachId;
            
            // Prepare notification data
            const notificationData = {
                paymentId: payment._id,
                planId: plan._id,
                planName: plan.title || plan.adminProductId.name,
                coachName: coach.name,
                coachEmail: coach.email,
                customerName: customerInfo.name || 'Customer',
                customerEmail: customerInfo.email || 'customer@example.com',
                customerPhone: customerInfo.phone || '+919876543210',
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.paymentMethod,
                purchaseDate: new Date().toISOString()
            };
            
            // Send email notification to customer
            await rabbitmqProducer.publishEvent('funnelseye_actions', 'send_email', {
                actionType: 'send_email',
                config: {
                    to: customerInfo.email || 'customer@example.com',
                    subject: `Purchase Confirmation - ${plan.title || plan.adminProductId.name}`,
                    template: 'purchase_confirmation',
                    data: notificationData
                },
                payload: notificationData
            });
            
            // Send email notification to coach
            await rabbitmqProducer.publishEvent('funnelseye_actions', 'send_email', {
                actionType: 'send_email',
                config: {
                    to: coach.email,
                    subject: `New Sale - ${plan.title || plan.adminProductId.name}`,
                    template: 'coach_sale_notification',
                    data: notificationData
                },
                payload: notificationData
            });
            
            // Send WhatsApp notification to customer (if phone provided)
            if (customerInfo.phone) {
                const whatsappMessage = `🎉 Purchase Successful!\n\n` +
                    `Plan: ${plan.title || plan.adminProductId.name}\n` +
                    `Amount: ${payment.currency} ${payment.amount}\n` +
                    `Coach: ${coach.name}\n\n` +
                    `Thank you for your purchase! You will receive access details via email shortly.`;
                
                await rabbitmqProducer.publishEvent('funnelseye_actions', 'send_whatsapp_message', {
                    actionType: 'send_whatsapp_message',
                    config: {
                        to: customerInfo.phone,
                        message: whatsappMessage
                    },
                    payload: notificationData
                });
            }
            
            // Send WhatsApp notification to coach
            if (coach.phone) {
                const coachMessage = `💰 New Sale Alert!\n\n` +
                    `Plan: ${plan.title || plan.adminProductId.name}\n` +
                    `Customer: ${customerInfo.name || 'Customer'}\n` +
                    `Amount: ${payment.currency} ${payment.amount}\n` +
                    `Payment Method: ${payment.paymentMethod}\n\n` +
                    `Congratulations on your new sale!`;
                
                await rabbitmqProducer.publishEvent('funnelseye_actions', 'send_whatsapp_message', {
                    actionType: 'send_whatsapp_message',
                    config: {
                        to: coach.phone,
                        message: coachMessage
                    },
                    payload: notificationData
                });
            }
            
            logger.info(`[RazorpayPaymentController] Notifications sent for payment: ${payment._id}`);
            
        } catch (error) {
            logger.error('[RazorpayPaymentController] Error sending notifications:', error);
        }
    }
}

// Create controller instance and bind all methods
const controller = new RazorpayPaymentController();

module.exports = {
    createRazorpayOrder: controller.createRazorpayOrder.bind(controller),
    createCoachPlanOrder: controller.createCoachPlanOrder.bind(controller),
    createSubscriptionOrder: controller.createSubscriptionOrder.bind(controller),
    verifyPayment: controller.verifyPayment.bind(controller),
    getPaymentById: controller.getPaymentById.bind(controller),
    getPaymentsByUser: controller.getPaymentsByUser.bind(controller),
    processRefund: controller.processRefund.bind(controller),
    handleWebhook: controller.handleWebhook.bind(controller)
};
