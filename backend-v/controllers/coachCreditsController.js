const asyncHandler = require('../middleware/async');
const { Coach, AdminV1Settings } = require('../schema');
const WhatsAppMessage = require('../schema/WhatsAppMessage');

// @desc    Get coach's credit balance from user schema
// @route   GET /api/central-messaging/v1/coach/credits/balance
// @access  Private (Coach)
exports.getCreditBalance = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;

        // Get coach data
        const coach = await Coach.findById(coachId).select('credits messagingCredits');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Get system currency setting
        const systemSettings = await AdminV1Settings.findOne({ settingId: 'global' }).select('system.defaultCurrency');
        const currency = systemSettings?.system?.defaultCurrency || 'INR';

        // Get usage statistics from WhatsAppMessage collection
        const usageStats = await WhatsAppMessage.aggregate([
            {
                $match: {
                    senderId: coachId,
                    senderType: 'coach',
                    status: 'sent'
                }
            },
            {
                $group: {
                    _id: null,
                    totalMessagesSent: { $sum: 1 },
                    totalCreditsUsed: { $sum: '$creditsUsed' }
                }
            }
        ]);

        const usage = usageStats[0] || { totalMessagesSent: 0, totalCreditsUsed: 0 };

        // Create credit packages based on currency (10 credits per rupee)
        const creditPackages = [
            { id: 'starter', name: 'Starter Pack', credits: 500, price: currency === 'INR' ? 50 : 5.99, currency },
            { id: 'professional', name: 'Professional Pack', credits: 2000, price: currency === 'INR' ? 200 : 23.99, currency },
            { id: 'business', name: 'Business Pack', credits: 5000, price: currency === 'INR' ? 500 : 59.99, currency },
            { id: 'enterprise', name: 'Enterprise Pack', credits: 10000, price: currency === 'INR' ? 1000 : 119.99, currency },
        ];

        res.status(200).json({
            success: true,
            data: {
                balance: coach.credits,
                package: { name: 'Standard Plan' },
                usage: {
                    creditsUsed: usage.totalCreditsUsed,
                    totalMessagesSent: usage.totalMessagesSent
                },
                remainingCredits: coach.credits,
                usagePercentage: usage.totalCreditsUsed > 0 ?
                    Math.round((usage.totalCreditsUsed / (usage.totalCreditsUsed + coach.credits)) * 100) : 0,
                currency,
                creditPackages
            }
        });

    } catch (error) {
        console.error('❌ [COACH_CREDITS] getCreditBalance - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit balance',
            error: error.message
        });
    }
});

// @desc    Check if coach can send messages
// @route   GET /api/central-messaging/v1/coach/credits/check
// @access  Private (Coach)
exports.checkCanSendMessage = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        const { count = 1 } = req.query;

        const coach = await Coach.findById(coachId).select('credits');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        const canSend = coach.credits >= count;

        res.status(200).json({
            success: true,
            data: {
                canSend,
                balance: coach.credits,
                required: count,
                remainingAfter: coach.credits - count
            }
        });

    } catch (error) {
        console.error('❌ [COACH_CREDITS] checkCanSendMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check credit balance',
            error: error.message
        });
    }
});

// @desc    Deduct credits after successful message send
// @route   POST /api/central-messaging/v1/coach/credits/deduct
// @access  Private (Coach)
exports.deductCredits = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        const { amount = 1, description = 'Message sent' } = req.body;

        const coach = await Coach.findById(coachId).select('credits');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        if (coach.credits < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient credits',
                data: {
                    balance: coach.credits,
                    required: amount
                }
            });
        }

        // Deduct credits
        coach.credits -= amount;
        await coach.save();

        console.log(`✅ [COACH_CREDITS] Deducted ${amount} credit(s) for coach ${coachId}. New balance: ${coach.credits}`);

        res.status(200).json({
            success: true,
            message: `Successfully deducted ${amount} credit(s)`,
            data: {
                creditsDeducted: amount,
                newBalance: coach.credits,
                description
            }
        });

    } catch (error) {
        console.error('❌ [COACH_CREDITS] deductCredits - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deduct credits',
            error: error.message
        });
    }
});

// @desc    Purchase credits with Razorpay
// @route   POST /api/central-messaging/v1/coach/credits/purchase
// @access  Private (Coach)
exports.purchaseCredits = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        const { packageId } = req.body;

        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: 'Package ID is required'
            });
        }

        // Get system currency
        const systemSettings = await AdminV1Settings.findOne({ settingId: 'global' }).select('system.defaultCurrency');
        const currency = systemSettings?.system?.defaultCurrency || 'INR';

        // Define credit packages (10 credits per rupee)
        const packages = {
            'starter': { name: 'Starter Pack', credits: 500, price: currency === 'INR' ? 50 : 5.99 },
            'professional': { name: 'Professional Pack', credits: 2000, price: currency === 'INR' ? 200 : 23.99 },
            'business': { name: 'Business Pack', credits: 5000, price: currency === 'INR' ? 500 : 59.99 },
            'enterprise': { name: 'Enterprise Pack', credits: 10000, price: currency === 'INR' ? 1000 : 119.99 },
        };

        const selectedPackage = packages[packageId];
        if (!selectedPackage) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package selected'
            });
        }

        // Create Razorpay order
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const orderOptions = {
            amount: Math.round(selectedPackage.price * 100), // Convert to paise/smallest currency unit
            currency: currency,
            receipt: `c_${Date.now()}`, // Short receipt: c_timestamp (max 40 chars)
            notes: {
                coachId: coachId,
                packageId: packageId,
                credits: selectedPackage.credits,
                type: 'credit_purchase'
            }
        };

        const razorpayOrder = await razorpay.orders.create(orderOptions);

        res.status(200).json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                package: selectedPackage,
                razorpayKey: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error('❌ [COACH_CREDITS] purchaseCredits - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
});

// @desc    Verify credit purchase payment
// @route   POST /api/central-messaging/v1/coach/credits/verify-payment
// @access  Private (Coach)
exports.verifyCreditPayment = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            packageId
        } = req.body;

        // Verify Razorpay signature
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Verify payment with Razorpay API
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status !== 'captured') {
            return res.status(400).json({
                success: false,
                message: 'Payment not captured'
            });
        }

        // Get system currency
        const systemSettings = await AdminV1Settings.findOne({ settingId: 'global' }).select('system.defaultCurrency');
        const currency = systemSettings?.system?.defaultCurrency || 'INR';

        // Define credit packages
        const packages = {
            'starter': { name: 'Starter Pack', credits: 500, price: currency === 'INR' ? 50 : 5.99 },
            'professional': { name: 'Professional Pack', credits: 2000, price: currency === 'INR' ? 200 : 23.99 },
            'business': { name: 'Business Pack', credits: 5000, price: currency === 'INR' ? 500 : 59.99 },
            'enterprise': { name: 'Enterprise Pack', credits: 10000, price: currency === 'INR' ? 1000 : 119.99 },
        };

        const selectedPackage = packages[packageId];
        if (!selectedPackage) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package selected'
            });
        }

        // Add credits to coach
        const coach = await Coach.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        coach.credits += selectedPackage.credits;
        await coach.save();

        res.status(200).json({
            success: true,
            message: `Successfully purchased ${selectedPackage.name} and added ${selectedPackage.credits} credits`,
            data: {
                creditsAdded: selectedPackage.credits,
                newBalance: coach.credits,
                package: selectedPackage,
                paymentId: razorpay_payment_id
            }
        });

    } catch (error) {
        console.error('❌ [COACH_CREDITS] verifyCreditPayment - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
});

// @desc    Get credit transaction history (from WhatsAppMessage collection)
// @route   GET /api/central-messaging/v1/coach/credits/transactions
// @access  Private (Coach)
exports.getCreditTransactions = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const messages = await WhatsAppMessage.find({
            senderId: coachId,
            senderType: 'coach',
            status: 'sent'
        })
        .sort({ sentAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('sentAt creditsUsed recipientPhone content status')
        .populate('leadId', 'name phone');

        const transactions = messages.map(msg => ({
            id: msg._id,
            date: msg.sentAt,
            type: 'usage',
            amount: -msg.creditsUsed,
            description: `Message sent to ${msg.leadId?.name || msg.recipientPhone}`,
            recipient: msg.leadId?.name || msg.recipientPhone,
            creditsUsed: msg.creditsUsed
        }));

        const total = await WhatsAppMessage.countDocuments({
            senderId: coachId,
            senderType: 'coach',
            status: 'sent'
        });

        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ [COACH_CREDITS] getCreditTransactions - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit transactions',
            error: error.message
        });
    }
});
