const WhatsAppCredit = require('../schema/WhatsAppCredit');
const asyncHandler = require('../middleware/async');

// @desc    Get coach's credit balance
// @route   GET /api/messagingv1/credits/balance
// @access  Private (Coach)
exports.getCreditBalance = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        res.status(200).json({
            success: true,
            data: {
                balance: credits.balance,
                package: credits.package,
                usage: credits.usage,
                status: credits.status,
                expiresAt: credits.expiresAt,
                autoRenew: credits.autoRenew,
                remainingCredits: credits.remainingCredits,
                usagePercentage: credits.usagePercentage
            }
        });
        
    } catch (error) {
        console.error('❌ [CREDITS] getCreditBalance - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit balance',
            error: error.message
        });
    }
});

// @desc    Purchase credits
// @route   POST /api/messagingv1/credits/purchase
// @access  Private (Coach)
exports.purchaseCredits = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        const { packageId, paymentReference } = req.body;
        
        // Define credit packages
        const packages = {
            'starter': { name: 'Starter Pack', credits: 500, price: 9.99 },
            'professional': { name: 'Professional Pack', credits: 2000, price: 29.99 },
            'business': { name: 'Business Pack', credits: 5000, price: 59.99 },
            'enterprise': { name: 'Enterprise Pack', credits: 10000, price: 99.99 }
        };
        
        const selectedPackage = packages[packageId];
        if (!selectedPackage) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package selected'
            });
        }
        
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        // Add credits
        await credits.addCredits(
            selectedPackage.credits,
            `Purchased ${selectedPackage.name}`,
            paymentReference
        );
        
        // Update package info
        credits.package = {
            name: selectedPackage.name,
            credits: selectedPackage.credits,
            price: selectedPackage.price,
            currency: 'USD'
        };
        await credits.save();
        
        res.status(200).json({
            success: true,
            message: `Successfully purchased ${selectedPackage.name}`,
            data: {
                creditsAdded: selectedPackage.credits,
                newBalance: credits.balance,
                package: credits.package
            }
        });
        
    } catch (error) {
        console.error('❌ [CREDITS] purchaseCredits - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to purchase credits',
            error: error.message
        });
    }
});

// @desc    Get credit transactions
// @route   GET /api/messagingv1/credits/transactions
// @access  Private (Coach)
exports.getCreditTransactions = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        
        const credits = await WhatsAppCredit.findOne({ coachId });
        if (!credits) {
            return res.status(404).json({
                success: false,
                message: 'No credit account found'
            });
        }
        
        // Paginate transactions
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const transactions = credits.transactions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(startIndex, endIndex);
        
        res.status(200).json({
            success: true,
            data: {
                transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(credits.transactions.length / limit),
                    totalTransactions: credits.transactions.length,
                    hasNext: endIndex < credits.transactions.length,
                    hasPrev: startIndex > 0
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [CREDITS] getCreditTransactions - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit transactions',
            error: error.message
        });
    }
});

// @desc    Get available credit packages
// @route   GET /api/messagingv1/credits/packages
// @access  Public
exports.getCreditPackages = asyncHandler(async (req, res) => {
    try {
        const packages = [
            {
                id: 'starter',
                name: 'Starter Pack',
                credits: 500,
                price: 9.99,
                currency: 'USD',
                description: 'Perfect for small businesses',
                features: ['500 WhatsApp messages', 'Basic analytics', 'Email support']
            },
            {
                id: 'professional',
                name: 'Professional Pack',
                credits: 2000,
                price: 29.99,
                currency: 'USD',
                description: 'Ideal for growing businesses',
                features: ['2000 WhatsApp messages', 'Advanced analytics', 'Priority support', 'Bulk messaging']
            },
            {
                id: 'business',
                name: 'Business Pack',
                credits: 5000,
                price: 59.99,
                currency: 'USD',
                description: 'For established businesses',
                features: ['5000 WhatsApp messages', 'Full analytics', '24/7 support', 'API access', 'Custom templates']
            },
            {
                id: 'enterprise',
                name: 'Enterprise Pack',
                credits: 10000,
                price: 99.99,
                currency: 'USD',
                description: 'For large enterprises',
                features: ['10000 WhatsApp messages', 'Enterprise analytics', 'Dedicated support', 'Full API access', 'White-label options']
            }
        ];
        
        res.status(200).json({
            success: true,
            data: packages
        });
        
    } catch (error) {
        console.error('❌ [CREDITS] getCreditPackages - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get credit packages',
            error: error.message
        });
    }
});

// @desc    Check if user can send message
// @route   GET /api/messagingv1/credits/check
// @access  Private (Coach)
exports.checkCanSendMessage = asyncHandler(async (req, res) => {
    try {
        const coachId = req.user.id;
        
        const credits = await WhatsAppCredit.getOrCreateCredits(coachId);
        
        const canSend = credits.canSendMessage();
        
        res.status(200).json({
            success: true,
            data: {
                canSend,
                balance: credits.balance,
                status: credits.status,
                message: canSend ? 'You can send messages' : 'Insufficient credits or account suspended'
            }
        });
        
    } catch (error) {
        console.error('❌ [CREDITS] checkCanSendMessage - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check message eligibility',
            error: error.message
        });
    }
});

// @desc    Get system credit rates
// @route   GET /api/messagingv1/admin/credit-rates
// @access  Private (Admin)
exports.getSystemCreditRates = asyncHandler(async (req, res) => {
    try {
        // Define system credit rates
        const creditRates = {
            text: 1,
            image: 2,
            video: 3,
            document: 2,
            audio: 2,
            template: 1,
            bulk: 0.5 // Bulk messages get 50% discount
        };

        // Define credit packages
        const packages = {
            'starter': { name: 'Starter Pack', credits: 500, price: 9.99, pricePerCredit: 0.02 },
            'professional': { name: 'Professional Pack', credits: 2000, price: 29.99, pricePerCredit: 0.015 },
            'business': { name: 'Business Pack', credits: 5000, price: 59.99, pricePerCredit: 0.012 },
            'enterprise': { name: 'Enterprise Pack', credits: 10000, price: 99.99, pricePerCredit: 0.01 }
        };

        res.status(200).json({
            success: true,
            data: {
                creditRates,
                packages,
                settings: {
                    currency: 'USD',
                    minimumPurchase: 500,
                    maximumPurchase: 50000,
                    autoRenewDiscount: 0.1 // 10% discount for auto-renew
                }
            }
        });
        
    } catch (error) {
        console.error('❌ [CREDITS] getSystemCreditRates - Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get system credit rates',
            error: error.message
        });
    }
});