const asyncHandler = require('../middleware/async');
const razorpayService = require('../services/razorpayService');
const { User, CoachPlan, Subscription, MlmCommissionDistribution, PlatformFee } = require('../schema');
const { getUserContext } = require('../middleware/unifiedCoachAuth');
const mongoose = require('mongoose');

/**
 * Coach Financial Management Controller
 * Handles revenue tracking, payouts, MLM commissions, and Razorpay integration
 */
class CoachFinancialController {

    /**
     * @desc    Get coach revenue analytics
     * @route   GET /api/coach/financial/revenue
     * @access  Private (Coach)
     */
    getRevenue = asyncHandler(async (req, res) => {
        try {
            const coachId = req.coachId;
            const { timeRange = 30, period = 'daily' } = req.query;
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange));

            // Get subscription revenue
            const subscriptions = await Subscription.find({
                coachId: coachId,
                status: 'active',
                createdAt: { $gte: startDate }
            }).populate('planId', 'name price');

            // Calculate revenue metrics
            const totalRevenue = subscriptions.reduce((sum, sub) => sum + (sub.planId?.price || 0), 0);
            const monthlyRecurringRevenue = subscriptions
                .filter(sub => sub.billingCycle === 'monthly')
                .reduce((sum, sub) => sum + (sub.planId?.price || 0), 0);
            
            const yearlyRecurringRevenue = subscriptions
                .filter(sub => sub.billingCycle === 'yearly')
                .reduce((sum, sub) => sum + (sub.planId?.price || 0), 0);

            // Get revenue by period
            const revenueByPeriod = await this.calculateRevenueByPeriod(coachId, startDate, period);
            
            // Get commission earned
            const commissions = await MlmCommissionDistribution.find({
                recipientId: coachId,
                createdAt: { $gte: startDate }
            });

            const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0);

            res.json({
                success: true,
                data: {
                    revenue: {
                        total: totalRevenue,
                        monthly: monthlyRecurringRevenue,
                        yearly: yearlyRecurringRevenue,
                        byPeriod: revenueByPeriod
                    },
                    commissions: {
                        total: totalCommissions,
                        count: commissions.length,
                        breakdown: commissions
                    },
                    metrics: {
                        totalSubscriptions: subscriptions.length,
                        averageRevenuePerSubscription: subscriptions.length > 0 ? totalRevenue / subscriptions.length : 0,
                        timeRange: parseInt(timeRange),
                        period: period
                    }
                }
            });
        } catch (error) {
            console.error('Error getting coach revenue:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving revenue data',
                error: error.message
            });
        }
    });

    /**
     * @desc    Get payment history
     * @route   GET /api/coach/financial/payments
     * @access  Private (Coach)
     */
    getPaymentHistory = asyncHandler(async (req, res) => {
        try {
            const coachId = req.coachId;
            const { page = 1, limit = 20, status, from, to } = req.query;
            
            const query = { coachId };
            if (status) query.status = status;
            if (from || to) {
                query.createdAt = {};
                if (from) query.createdAt.$gte = new Date(from);
                if (to) query.createdAt.$lte = new Date(to);
            }

            const subscriptions = await Subscription.find(query)
                .populate('planId', 'name price')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Subscription.countDocuments(query);

            res.json({
                success: true,
                data: {
                    payments: subscriptions.map(sub => ({
                        id: sub._id,
                        amount: sub.planId?.price || 0,
                        status: sub.status,
                        paymentMethod: sub.paymentMethod,
                        createdAt: sub.createdAt,
                        plan: sub.planId?.name,
                        customer: {
                            name: sub.userId?.name,
                            email: sub.userId?.email
                        },
                        razorpayPaymentId: sub.razorpayPaymentId
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        hasNext: page * limit < total,
                        hasPrev: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Error getting payment history:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving payment history',
                error: error.message
            });
        }
    });

    /**
     * @desc    Get Razorpay account balance
     * @route   GET /api/coach/financial/balance
     * @access  Private (Coach)
     */
    getAccountBalance = asyncHandler(async (req, res) => {
        try {
            const balanceResult = await razorpayService.getAccountBalance();
            
            if (!balanceResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Error fetching account balance',
                    error: balanceResult.error
                });
            }

            res.json({
                success: true,
                data: {
                    balance: balanceResult.balance,
                    currency: balanceResult.currency,
                    accountId: balanceResult.accountId,
                    accountName: balanceResult.accountName,
                    availableForPayout: balanceResult.balance.available || 0
                }
            });
        } catch (error) {
            console.error('Error getting account balance:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving account balance',
                error: error.message
            });
        }
    });

    /**
     * @desc    Create manual payout
     * @route   POST /api/coach/financial/payout
     * @access  Private (Coach)
     */
    createManualPayout = asyncHandler(async (req, res) => {
        try {
            const { amount, payoutMethod, upiId, bankAccount, notes } = req.body;
            const coachId = req.coachId;

            if (!amount || !payoutMethod) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount and payout method are required'
                });
            }

            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
            }

            // Check account balance
            const balanceResult = await razorpayService.getAccountBalance();
            if (!balanceResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Unable to verify account balance',
                    error: balanceResult.error
                });
            }

            const availableBalance = balanceResult.balance.available || 0;
            if (amount > availableBalance) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance for payout',
                    availableBalance: availableBalance
                });
            }

            // Create payout
            let payoutResult;
            if (payoutMethod === 'UPI') {
                if (!upiId) {
                    return res.status(400).json({
                        success: false,
                        message: 'UPI ID is required for UPI payout'
                    });
                }
                payoutResult = await razorpayService.createUPIPayout({
                    amount,
                    upiId,
                    purpose: 'Manual Payout',
                    notes: notes || `Manual payout for coach ${coachId}`,
                    referenceId: `MANUAL_${coachId}_${Date.now()}`
                });
            } else if (payoutMethod === 'BANK') {
                if (!bankAccount || !bankAccount.accountNumber || !bankAccount.ifscCode) {
                    return res.status(400).json({
                        success: false,
                        message: 'Bank account details are required for bank payout'
                    });
                }
                payoutResult = await razorpayService.createBankPayout({
                    amount,
                    bankAccount,
                    purpose: 'Manual Payout',
                    notes: notes || `Manual payout for coach ${coachId}`,
                    referenceId: `MANUAL_${coachId}_${Date.now()}`
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payout method. Use UPI or BANK'
                });
            }

            if (!payoutResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Payout creation failed',
                    error: payoutResult.error
                });
            }

            res.json({
                success: true,
                message: 'Payout created successfully',
                data: {
                    payoutId: payoutResult.payoutId,
                    amount: payoutResult.amount,
                    status: payoutResult.status,
                    payoutMethod: payoutMethod,
                    createdAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error creating manual payout:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating payout',
                error: error.message
            });
        }
    });

    /**
     * @desc    Get payout history
     * @route   GET /api/coach/financial/payouts
     * @access  Private (Coach)
     */
    getPayoutHistory = asyncHandler(async (req, res) => {
        try {
            const { page = 1, limit = 20, status, from, to } = req.query;
            
            const filters = {
                count: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit)
            };
            
            if (from) filters.from = Math.floor(new Date(from).getTime() / 1000);
            if (to) filters.to = Math.floor(new Date(to).getTime() / 1000);
            if (status) filters.status = status;

            const payoutsResult = await razorpayService.getAllPayouts(filters);
            
            if (!payoutsResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Error fetching payout history',
                    error: payoutsResult.error
                });
            }

            res.json({
                success: true,
                data: {
                    payouts: payoutsResult.payouts.map(payout => ({
                        id: payout.id,
                        amount: payout.amount / 100,
                        status: payout.status,
                        mode: payout.mode,
                        purpose: payout.purpose,
                        createdAt: new Date(payout.created_at * 1000),
                        processedAt: payout.processed_at ? new Date(payout.processed_at * 1000) : null,
                        referenceId: payout.reference_id,
                        narration: payout.narration
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(payoutsResult.totalCount / limit),
                        totalItems: payoutsResult.totalCount,
                        hasNext: page * limit < payoutsResult.totalCount,
                        hasPrev: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Error getting payout history:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving payout history',
                error: error.message
            });
        }
    });

    /**
     * @desc    Get refund history
     * @route   GET /api/coach/financial/refunds
     * @access  Private (Coach)
     */
    getRefundHistory = asyncHandler(async (req, res) => {
        try {
            const coachId = req.coachId;
            const { page = 1, limit = 20, status } = req.query;
            
            // Get subscriptions with refunds
            const subscriptions = await Subscription.find({
                coachId: coachId,
                refundStatus: { $exists: true, $ne: null }
            })
            .populate('planId', 'name price')
            .populate('userId', 'name email')
            .sort({ updatedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

            const total = await Subscription.countDocuments({
                coachId: coachId,
                refundStatus: { $exists: true, $ne: null }
            });

            res.json({
                success: true,
                data: {
                    refunds: subscriptions.map(sub => ({
                        id: sub._id,
                        amount: sub.refundAmount || 0,
                        status: sub.refundStatus,
                        reason: sub.refundReason,
                        refundId: sub.razorpayRefundId,
                        createdAt: sub.refundCreatedAt,
                        originalPayment: {
                            amount: sub.planId?.price || 0,
                            plan: sub.planId?.name,
                            customer: {
                                name: sub.userId?.name,
                                email: sub.userId?.email
                            }
                        }
                    })),
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        hasNext: page * limit < total,
                        hasPrev: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Error getting refund history:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving refund history',
                error: error.message
            });
        }
    });

    /**
     * @desc    Set automatic payout settings
     * @route   PUT /api/coach/financial/payout-settings
     * @access  Private (Coach)
     */
    updatePayoutSettings = asyncHandler(async (req, res) => {
        try {
            const coachId = req.coachId;
            const { 
                autoPayoutEnabled, 
                payoutMethod, 
                upiId, 
                bankAccount, 
                minimumAmount,
                payoutFrequency,
                commissionPercentage
            } = req.body;

            // Update coach's payout settings
            const coach = await User.findByIdAndUpdate(
                coachId,
                {
                    $set: {
                        'payoutSettings.autoPayoutEnabled': autoPayoutEnabled,
                        'payoutSettings.payoutMethod': payoutMethod,
                        'payoutSettings.upiId': upiId,
                        'payoutSettings.bankAccount': bankAccount,
                        'payoutSettings.minimumAmount': minimumAmount || 100,
                        'payoutSettings.payoutFrequency': payoutFrequency || 'weekly',
                        'payoutSettings.commissionPercentage': commissionPercentage || 0
                    }
                },
                { new: true, runValidators: true }
            );

            if (!coach) {
                return res.status(404).json({
                    success: false,
                    message: 'Coach not found'
                });
            }

            res.json({
                success: true,
                message: 'Payout settings updated successfully',
                data: {
                    payoutSettings: coach.payoutSettings
                }
            });
        } catch (error) {
            console.error('Error updating payout settings:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating payout settings',
                error: error.message
            });
        }
    });

    /**
     * @desc    Get MLM commission structure
     * @route   GET /api/coach/financial/mlm-commission
     * @access  Private (Coach)
     */
    getMlmCommissionStructure = asyncHandler(async (req, res) => {
        try {
            const coachId = req.coachId;
            
            // Get MLM commission structure from system settings
            const AdminSystemSettings = require('../schema/AdminSystemSettings');
            const settings = await AdminSystemSettings.findOne().select('paymentSystem.mlmCommissionStructure');
            
            if (!settings || !settings.paymentSystem?.mlmCommissionStructure) {
                return res.status(404).json({
                    success: false,
                    message: 'MLM commission structure not configured'
                });
            }

            const commissionStructure = settings.paymentSystem.mlmCommissionStructure;
            
            // Get coach's commission history
            const commissions = await MlmCommissionDistribution.find({
                recipientId: coachId
            }).sort({ createdAt: -1 }).limit(50);

            res.json({
                success: true,
                data: {
                    commissionStructure: {
                        levels: commissionStructure.levels,
                        platformFeePercentage: commissionStructure.platformFeePercentage,
                        maxLevels: commissionStructure.maxLevels
                    },
                    commissionHistory: commissions,
                    totalCommissionsEarned: commissions.reduce((sum, comm) => sum + comm.amount, 0)
                }
            });
        } catch (error) {
            console.error('Error getting MLM commission structure:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving MLM commission structure',
                error: error.message
            });
        }
    });

    /**
     * @desc    Payout to another coach
     * @route   POST /api/coach/financial/payout-to-coach
     * @access  Private (Coach)
     */
    payoutToCoach = asyncHandler(async (req, res) => {
        try {
            const { targetCoachId, amount, notes } = req.body;
            const coachId = req.coachId;

            if (!targetCoachId || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Target coach ID and amount are required'
                });
            }

            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
            }

            // Verify target coach exists
            const targetCoach = await User.findById(targetCoachId);
            if (!targetCoach || targetCoach.role !== 'coach') {
                return res.status(404).json({
                    success: false,
                    message: 'Target coach not found'
                });
            }

            // Check if target coach has payout settings
            if (!targetCoach.payoutSettings?.autoPayoutEnabled) {
                return res.status(400).json({
                    success: false,
                    message: 'Target coach has not enabled automatic payouts'
                });
            }

            // Create payout to target coach
            const payoutData = {
                coachId: targetCoachId,
                amount,
                upiId: targetCoach.payoutSettings.upiId,
                bankAccount: targetCoach.payoutSettings.bankAccount,
                purpose: 'Coach to Coach Payout',
                notes: notes || `Payout from coach ${coachId} to coach ${targetCoachId}`
            };

            const payoutMethod = targetCoach.payoutSettings.payoutMethod;
            const payoutResult = await razorpayService.processAutomaticPayout(payoutData, payoutMethod);

            if (!payoutResult.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Payout to coach failed',
                    error: payoutResult.error
                });
            }

            res.json({
                success: true,
                message: 'Payout to coach created successfully',
                data: {
                    payoutId: payoutResult.payoutId,
                    amount: payoutResult.amount,
                    targetCoach: {
                        id: targetCoach._id,
                        name: targetCoach.name,
                        email: targetCoach.email
                    },
                    status: payoutResult.status
                }
            });
        } catch (error) {
            console.error('Error creating payout to coach:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating payout to coach',
                error: error.message
            });
        }
    });

    /**
     * Helper method to calculate revenue by period
     */
    async calculateRevenueByPeriod(coachId, startDate, period) {
        try {
            const subscriptions = await Subscription.find({
                coachId: coachId,
                status: 'active',
                createdAt: { $gte: startDate }
            }).populate('planId', 'price');

            const revenueByPeriod = {};
            const periodMap = {
                daily: 24 * 60 * 60 * 1000,
                weekly: 7 * 24 * 60 * 60 * 1000,
                monthly: 30 * 24 * 60 * 60 * 1000
            };

            const periodMs = periodMap[period] || periodMap.daily;

            subscriptions.forEach(sub => {
                const periodKey = new Date(Math.floor(sub.createdAt.getTime() / periodMs) * periodMs);
                const key = periodKey.toISOString().split('T')[0];
                
                if (!revenueByPeriod[key]) {
                    revenueByPeriod[key] = 0;
                }
                revenueByPeriod[key] += sub.planId?.price || 0;
            });

            return Object.entries(revenueByPeriod).map(([date, amount]) => ({
                date,
                amount
            })).sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch (error) {
            console.error('Error calculating revenue by period:', error);
            return [];
        }
    }
}

module.exports = new CoachFinancialController();
