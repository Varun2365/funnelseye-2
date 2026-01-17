const CoachPayment = require('../schema/CoachPayment');
const CoachTransaction = require('../schema/CoachTransaction');
const GlobalPaymentSettings = require('../schema/GlobalPaymentSettings');
const User = require('../schema/User');
const logger = require('../utils/logger');

// ===== COACH PAYMENT COLLECTION SETTINGS =====

/**
 * @route   POST /api/coach-payments/setup-payment-collection
 * @desc    Setup payment collection settings for a coach
 * @access  Private (Coach/Admin)
 */
exports.setupPaymentCollection = async (req, res) => {
    try {
        const { upiId, bankAccount, paymentCollectionMethod } = req.body;
        const coachId = req.user.role === 'admin' ? req.body.coachId : req.user._id;

        // Validate required fields
        if (!upiId && !bankAccount) {
            return res.status(400).json({
                success: false,
                message: 'Either UPI ID or bank account details are required'
            });
        }

        if (paymentCollectionMethod === 'bank_transfer' && (!bankAccount?.accountNumber || !bankAccount?.ifscCode)) {
            return res.status(400).json({
                success: false,
                message: 'Bank account number and IFSC code are required for bank transfer method'
            });
        }

        // Find and update coach
        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Update payment collection settings
        coach.paymentCollection = {
            upiId: upiId || null,
            bankAccount: bankAccount || null,
            isPaymentCollectionEnabled: true,
            paymentCollectionMethod: paymentCollectionMethod || 'upi'
        };

        await coach.save();

        res.status(200).json({
            success: true,
            message: 'Payment collection settings updated successfully',
            data: {
                paymentCollection: coach.paymentCollection
            }
        });
    } catch (error) {
        console.error('Error setting up payment collection:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting up payment collection',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/payment-settings
 * @desc    Get coach's payment collection settings
 * @access  Private (Coach/Admin)
 */
exports.getPaymentSettings = async (req, res) => {
    try {
        const coachId = req.user.role === 'admin' ? req.params.coachId : req.user._id;

        const coach = await User.findById(coachId).select('paymentCollection');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                paymentCollection: coach.paymentCollection
            }
        });
    } catch (error) {
        console.error('Error fetching payment settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment settings',
            error: error.message
        });
    }
};

// ===== COACH PAYMENTS =====

/**
 * @route   POST /api/coach-payments/create-payment
 * @desc    Create a new payment for a coach (Admin only)
 * @access  Private (Admin)
 */
exports.createPayment = async (req, res) => {
    try {
        const { coachId, amount, currency, paymentType, description, reference, metadata, notes } = req.body;

        // Validate required fields
        if (!coachId || !amount || !paymentType || !description) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: coachId, amount, paymentType, description'
            });
        }

        // Check if coach exists and has payment collection enabled
        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        if (!coach.paymentCollection?.isPaymentCollectionEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Coach has not enabled payment collection'
            });
        }

        // Create payment
        const payment = new CoachPayment({
            coachId,
            amount,
            currency: currency || 'INR',
            paymentMethod: 'centralized_system',
            paymentType,
            description,
            reference,
            metadata,
            notes,
            createdBy: req.user._id,
            processingDetails: {
                initiatedAt: new Date()
            }
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/my-payments
 * @desc    Get coach's payment history
 * @access  Private (Coach)
 */
exports.getMyPayments = async (req, res) => {
    try {
        const { status, paymentType, page = 1, limit = 20 } = req.query;
        const coachId = req.user._id;

        let query = { coachId };
        
        if (status) {
            query.status = status;
        }
        
        if (paymentType) {
            query.paymentType = paymentType;
        }

        const skip = (page - 1) * limit;
        
        const payments = await CoachPayment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CoachPayment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/coach/:coachId
 * @desc    Get specific coach's payments (Admin only)
 * @access  Private (Admin)
 */
exports.getCoachPayments = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { status, paymentType, page = 1, limit = 20 } = req.query;

        let query = { coachId };
        
        if (status) {
            query.status = status;
        }
        
        if (paymentType) {
            query.paymentType = paymentType;
        }

        const skip = (page - 1) * limit;
        
        const payments = await CoachPayment.find(query)
            .populate('coachId', 'name email company')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CoachPayment.countDocuments(query);

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            data: payments
        });
    } catch (error) {
        console.error('Error fetching coach payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coach payments',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/coach-payments/:paymentId/process
 * @desc    Process a payment (Admin only)
 * @access  Private (Admin)
 */
exports.processPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { action, transactionId, notes } = req.body;

        const payment = await CoachPayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        switch (action) {
            case 'process':
                await payment.markAsProcessed(req.user._id);
                break;
            case 'complete':
                await payment.markAsCompleted(transactionId);
                break;
            case 'fail':
                if (!notes) {
                    return res.status(400).json({
                        success: false,
                        message: 'Failure reason is required'
                    });
                }
                await payment.markAsFailed(notes);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action. Use: process, complete, or fail'
                });
        }

        res.status(200).json({
            success: true,
            message: `Payment ${action}ed successfully`,
            data: payment
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payment',
            error: error.message
        });
    }
};

// ===== PAYMENT ANALYTICS =====

/**
 * @route   GET /api/coach-payments/analytics
 * @desc    Get payment analytics for a coach
 * @access  Private (Coach/Admin)
 */
exports.getPaymentAnalytics = async (req, res) => {
    try {
        const coachId = req.user.role === 'admin' ? req.params.coachId : req.user._id;
        const { period } = req.query;

        let periodFilter = null;
        if (period === 'month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodFilter = { startDate: startOfMonth, endDate: endOfMonth };
        } else if (period === 'year') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            periodFilter = { startDate: startOfYear, endDate: endOfYear };
        }

        const stats = await CoachPayment.getCoachPaymentStats(coachId, periodFilter);

        // Get recent payments
        const recentPayments = await CoachPayment.find({ coachId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('amount status paymentType createdAt');

        res.status(200).json({
            success: true,
            data: {
                stats,
                recentPayments,
                period: periodFilter
            }
        });
    } catch (error) {
        console.error('Error fetching payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment analytics',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/coach-payments/admin/analytics
 * @desc    Get overall payment analytics (Admin only)
 * @access  Private (Admin)
 */
exports.getAdminPaymentAnalytics = async (req, res) => {
    try {
        const { period } = req.query;

        let periodFilter = null;
        if (period === 'month') {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            periodFilter = { startDate: startOfMonth, endDate: endOfMonth };
        } else if (period === 'year') {
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            periodFilter = { startDate: startOfYear, endDate: endOfYear };
        }

        let query = {};
        if (periodFilter) {
            query.createdAt = {
                $gte: periodFilter.startDate,
                $lte: periodFilter.endDate
            };
        }

        const stats = await CoachPayment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const totalStats = await CoachPayment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    uniqueCoaches: { $addToSet: '$coachId' }
                }
            }
        ]);

        const result = {
            totalPayments: totalStats[0]?.totalPayments || 0,
            totalAmount: totalStats[0]?.totalAmount || 0,
            uniqueCoaches: totalStats[0]?.uniqueCoaches?.length || 0,
            byStatus: {},
            period: periodFilter
        };

        stats.forEach(stat => {
            result.byStatus[stat._id] = {
                count: stat.count,
                amount: stat.totalAmount
            };
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching admin payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin payment analytics',
            error: error.message
        });
    }
};

// ==================== NEW PAYOUT AND TRANSACTION FUNCTIONS ====================

/**
 * @route   POST /api/payments/sending/request-payout
 * @desc    Request payout from coach earnings
 * @access  Private (Coach)
 */
exports.requestPayout = async (req, res) => {
    try {
        const { amount, payoutMethod, notes } = req.body;
        const coachId = req.user._id;

        // Validate required fields
        if (!amount || !payoutMethod) {
            return res.status(400).json({
                success: false,
                message: 'Amount and payout method are required'
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

        // Check if coach has payout method configured
        if (!coach.paymentCollection || !coach.paymentCollection.isPaymentCollectionEnabled) {
            return res.status(400).json({
                success: false,
                message: 'Please setup your payout method first'
            });
        }

        // Get available balance
        const availableBalance = await exports.getAvailableBalanceAmount(coachId);
        
        if (amount > availableBalance) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Available: ₹${availableBalance}`
            });
        }

        // Get payment settings
        const settings = await GlobalPaymentSettings.findOne();
        const minimumPayout = settings?.commission?.minimumPayoutAmount || 500;
        
        if (amount < minimumPayout) {
            return res.status(400).json({
                success: false,
                message: `Minimum payout amount is ₹${minimumPayout}`
            });
        }

        // Create payout request transaction
        const payoutId = `PAYOUT_REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const payoutTransaction = new CoachTransaction({
            transactionId: payoutId,
            coachId: coachId,
            transactionType: 'payout_requested',
            direction: 'outgoing',
            grossAmount: amount,
            netAmount: amount,
            currency: 'INR',
            payoutInfo: {
                payoutId: payoutId,
                payoutMethod: payoutMethod,
                destination: coach.paymentCollection,
                initiatedAt: new Date()
            },
            status: 'pending',
            notes: notes,
            metadata: {
                source: 'coach_request',
                requestedBy: coachId
            }
        });

        await payoutTransaction.save();

        logger.info(`[CoachPaymentController] Payout request created: ${payoutId} for coach: ${coachId}`);

        res.status(201).json({
            success: true,
            message: 'Payout request submitted successfully',
            data: {
                payoutId: payoutId,
                amount: amount,
                status: 'pending',
                estimatedProcessingTime: '1-3 business days'
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error requesting payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error requesting payout',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/payments/sending/process-payout
 * @desc    Process payout request (Admin)
 * @access  Private (Admin)
 */
exports.processPayout = async (req, res) => {
    try {
        const { payoutId, action, notes } = req.body; // action: 'approve' or 'reject'

        if (!payoutId || !action) {
            return res.status(400).json({
                success: false,
                message: 'Payout ID and action are required'
            });
        }

        const payoutTransaction = await CoachTransaction.findOne({
            transactionId: payoutId,
            transactionType: 'payout_requested',
            status: 'pending'
        });

        if (!payoutTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Payout request not found'
            });
        }

        if (action === 'approve') {
            // Process the payout
            const payoutController = require('./payoutController');
            const payoutResult = await payoutController.processSinglePayout({
                coachId: payoutTransaction.coachId,
                amount: payoutTransaction.grossAmount,
                currency: payoutTransaction.currency,
                payoutType: 'manual',
                payoutMethod: payoutTransaction.payoutInfo.payoutMethod,
                destination: payoutTransaction.payoutInfo.destination,
                metadata: {
                    source: 'admin_approval',
                    originalPayoutId: payoutId,
                    adminNotes: notes
                }
            });

            if (payoutResult.success) {
                payoutTransaction.status = 'processing';
                payoutTransaction.notes = notes;
                payoutTransaction.updatedBy = req.user._id;
                await payoutTransaction.save();

                res.json({
                    success: true,
                    message: 'Payout approved and processing',
                    data: payoutResult
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Payout processing failed',
                    error: payoutResult.message
                });
            }
        } else if (action === 'reject') {
            payoutTransaction.status = 'cancelled';
            payoutTransaction.notes = notes;
            payoutTransaction.updatedBy = req.user._id;
            await payoutTransaction.save();

            res.json({
                success: true,
                message: 'Payout request rejected',
                data: {
                    payoutId: payoutId,
                    status: 'cancelled'
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid action. Use "approve" or "reject"'
            });
        }

    } catch (error) {
        logger.error('[CoachPaymentController] Error processing payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payout',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/payments/sending/payout-history/:coachId
 * @desc    Get payout history for a coach
 * @access  Private (Coach/Admin)
 */
exports.getPayoutHistory = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;
        
        // Check if user can access this coach's data
        if (req.user.role !== 'admin' && req.user._id.toString() !== coachId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Build query
        const query = {
            coachId: coachId,
            transactionType: { $in: ['payout_requested', 'payout_processing', 'payout_completed', 'payout_failed', 'payout_cancelled'] }
        };

        if (status) query.status = status;
        if (startDate && endDate) {
            query.transactionDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const payouts = await CoachTransaction.find(query)
            .sort({ transactionDate: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('transactionId transactionType grossAmount netAmount currency status transactionDate payoutInfo notes');

        const total = await CoachTransaction.countDocuments(query);

        res.json({
            success: true,
            data: payouts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalPayouts: total,
                hasNextPage: skip + payouts.length < total,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error getting payout history:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting payout history',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/payments/sending/coach-earnings/:coachId
 * @desc    Get coach earnings summary
 * @access  Private (Coach/Admin)
 */
exports.getCoachEarnings = async (req, res) => {
    try {
        const { coachId } = req.params;
        const { period = 'current' } = req.query;
        
        // Check if user can access this coach's data
        if (req.user.role !== 'admin' && req.user._id.toString() !== coachId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get period dates
        const startDate = getPeriodStartDate(period);
        const endDate = getPeriodEndDate(period);

        // Get earnings summary
        const earnings = await CoachTransaction.getCoachEarningsSummary(coachId, startDate, endDate);
        
        // Get payout summary
        const payouts = await CoachTransaction.getCoachPayoutSummary(coachId, startDate, endDate);
        
        // Get available balance
        const availableBalance = earnings.totalEarnings - payouts.totalPayouts;

        res.json({
            success: true,
            data: {
                period: {
                    startDate: startDate,
                    endDate: endDate,
                    label: period
                },
                earnings: {
                    totalEarnings: earnings.totalEarnings,
                    totalTransactions: earnings.totalTransactions,
                    totalFeesPaid: earnings.totalFeesPaid,
                    breakdown: earnings.breakdown
                },
                payouts: {
                    totalPayouts: payouts.totalPayouts,
                    payoutCount: payouts.payoutCount,
                    totalFees: payouts.totalFees
                },
                availableBalance: availableBalance
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error getting coach earnings:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting coach earnings',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/payments/sending/available-balance/:coachId
 * @desc    Get coach's available balance for payout
 * @access  Private (Coach/Admin)
 */
exports.getAvailableBalance = async (req, res) => {
    try {
        const { coachId } = req.params;
        
        // Check if user can access this coach's data
        if (req.user.role !== 'admin' && req.user._id.toString() !== coachId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const availableBalance = await exports.getAvailableBalanceAmount(coachId);

        res.json({
            success: true,
            data: {
                availableBalance: availableBalance,
                currency: 'INR',
                coachId: coachId
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error getting available balance:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting available balance',
            error: error.message
        });
    }
};

/**
 * Helper function to get available balance amount
 */
exports.getAvailableBalanceAmount = async (coachId) => {
    try {
        // Get all earnings
        const earnings = await CoachTransaction.getCoachEarningsSummary(coachId);
        
        // Get all payouts
        const payouts = await CoachTransaction.getCoachPayoutSummary(coachId);
        
        return earnings.totalEarnings - payouts.totalPayouts;
    } catch (error) {
        logger.error('[CoachPaymentController] Error calculating available balance:', error);
        return 0;
    }
};

/**
 * @route   POST /api/payments/sending/bulk-payouts
 * @desc    Process bulk payouts for multiple coaches
 * @access  Private (Admin)
 */
exports.processBulkPayouts = async (req, res) => {
    try {
        const { coachIds, payoutMethod, notes } = req.body;

        if (!coachIds || !Array.isArray(coachIds) || coachIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Coach IDs array is required'
            });
        }

        const results = [];
        
        for (const coachId of coachIds) {
            try {
                // Get coach's available balance
                const availableBalance = await exports.getAvailableBalanceAmount(coachId);
                
                if (availableBalance > 0) {
                    // Create payout request for each coach
                    const payoutTransaction = new CoachTransaction({
                        transactionId: `BULK_PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        coachId: coachId,
                        transactionType: 'payout_requested',
                        direction: 'outgoing',
                        grossAmount: availableBalance,
                        netAmount: availableBalance,
                        currency: 'INR',
                        payoutInfo: {
                            payoutId: `BULK_PAYOUT_${Date.now()}_${coachId}`,
                            payoutMethod: payoutMethod || 'upi',
                            initiatedAt: new Date()
                        },
                        status: 'pending',
                        notes: notes || 'Bulk payout request',
                        metadata: {
                            source: 'admin_bulk_payout',
                            requestedBy: req.user._id
                        }
                    });

                    await payoutTransaction.save();
                    
                    results.push({
                        coachId: coachId,
                        success: true,
                        amount: availableBalance,
                        payoutId: payoutTransaction.transactionId
                    });
                } else {
                    results.push({
                        coachId: coachId,
                        success: false,
                        message: 'No available balance'
                    });
                }
            } catch (error) {
                logger.error(`[CoachPaymentController] Error processing bulk payout for coach ${coachId}:`, error);
                results.push({
                    coachId: coachId,
                    success: false,
                    message: error.message
                });
            }
        }

        res.json({
            success: true,
            message: 'Bulk payouts processed',
            data: {
                totalProcessed: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                results: results
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error processing bulk payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing bulk payouts',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/payments/sending/payout/:payoutId/status
 * @desc    Update payout status
 * @access  Private (Admin)
 */
exports.updatePayoutStatus = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { status, notes } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const payoutTransaction = await CoachTransaction.findOne({
            transactionId: payoutId,
            transactionType: { $in: ['payout_requested', 'payout_processing', 'payout_completed', 'payout_failed'] }
        });

        if (!payoutTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Payout not found'
            });
        }

        payoutTransaction.status = status;
        payoutTransaction.notes = notes;
        payoutTransaction.updatedBy = req.user._id;

        if (status === 'completed') {
            payoutTransaction.completedAt = new Date();
        } else if (status === 'failed') {
            payoutTransaction.failedAt = new Date();
        }

        await payoutTransaction.save();

        res.json({
            success: true,
            message: 'Payout status updated successfully',
            data: {
                payoutId: payoutId,
                status: status,
                updatedAt: payoutTransaction.updatedAt
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error updating payout status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payout status',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/payments/sending/payout/:payoutId/cancel
 * @desc    Cancel a payout request
 * @access  Private (Coach/Admin)
 */
exports.cancelPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { reason } = req.body;

        const payoutTransaction = await CoachTransaction.findOne({
            transactionId: payoutId,
            transactionType: 'payout_requested',
            status: 'pending'
        });

        if (!payoutTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Payout request not found or already processed'
            });
        }

        // Check if user can cancel this payout
        if (req.user.role !== 'admin' && req.user._id.toString() !== payoutTransaction.coachId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        payoutTransaction.status = 'cancelled';
        payoutTransaction.notes = reason || 'Cancelled by user';
        payoutTransaction.updatedBy = req.user._id;

        await payoutTransaction.save();

        res.json({
            success: true,
            message: 'Payout request cancelled successfully',
            data: {
                payoutId: payoutId,
                status: 'cancelled'
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error cancelling payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling payout',
            error: error.message
        });
    }
};

/**
 * @route   POST /api/payments/sending/setup-payout-method
 * @desc    Setup payout method for coach
 * @access  Private (Coach)
 */
exports.setupPayoutMethod = async (req, res) => {
    try {
        const { payoutMethod, upiId, bankAccount } = req.body;
        const coachId = req.user._id;

        if (!payoutMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payout method is required'
            });
        }

        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Update payment collection settings
        coach.paymentCollection = {
            ...coach.paymentCollection,
            paymentCollectionMethod: payoutMethod,
            upiId: upiId || coach.paymentCollection?.upiId,
            bankAccount: bankAccount || coach.paymentCollection?.bankAccount,
            isPaymentCollectionEnabled: true
        };

        await coach.save();

        res.json({
            success: true,
            message: 'Payout method setup successfully',
            data: {
                payoutMethod: payoutMethod,
                paymentCollection: coach.paymentCollection
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error setting up payout method:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting up payout method',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/payments/sending/payout-methods/:coachId
 * @desc    Get coach's payout methods
 * @access  Private (Coach/Admin)
 */
exports.getPayoutMethods = async (req, res) => {
    try {
        const { coachId } = req.params;
        
        // Check if user can access this coach's data
        if (req.user.role !== 'admin' && req.user._id.toString() !== coachId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const coach = await User.findById(coachId).select('paymentCollection');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        res.json({
            success: true,
            data: {
                payoutMethods: coach.paymentCollection || {},
                isEnabled: coach.paymentCollection?.isPaymentCollectionEnabled || false
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error getting payout methods:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting payout methods',
            error: error.message
        });
    }
};

/**
 * @route   PUT /api/payments/sending/payout-method/:methodId
 * @desc    Update payout method
 * @access  Private (Coach)
 */
exports.updatePayoutMethod = async (req, res) => {
    try {
        const { methodId } = req.params;
        const { payoutMethod, upiId, bankAccount } = req.body;
        const coachId = req.user._id;

        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Update payment collection settings
        coach.paymentCollection = {
            ...coach.paymentCollection,
            paymentCollectionMethod: payoutMethod || coach.paymentCollection?.paymentCollectionMethod,
            upiId: upiId || coach.paymentCollection?.upiId,
            bankAccount: bankAccount || coach.paymentCollection?.bankAccount
        };

        await coach.save();

        res.json({
            success: true,
            message: 'Payout method updated successfully',
            data: {
                paymentCollection: coach.paymentCollection
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error updating payout method:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payout method',
            error: error.message
        });
    }
};

/**
 * @route   DELETE /api/payments/sending/payout-method/:methodId
 * @desc    Delete payout method
 * @access  Private (Coach)
 */
exports.deletePayoutMethod = async (req, res) => {
    try {
        const { methodId } = req.params;
        const coachId = req.user._id;

        const coach = await User.findById(coachId);
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Disable payment collection
        coach.paymentCollection = {
            ...coach.paymentCollection,
            isPaymentCollectionEnabled: false
        };

        await coach.save();

        res.json({
            success: true,
            message: 'Payout method deleted successfully',
            data: {
                paymentCollection: coach.paymentCollection
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error deleting payout method:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting payout method',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/payments/sending/pending-payouts
 * @desc    Get all pending payout requests
 * @access  Private (Admin)
 */
exports.getPendingPayouts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const query = {
            transactionType: 'payout_requested',
            status: 'pending'
        };

        const skip = (page - 1) * limit;
        const pendingPayouts = await CoachTransaction.find(query)
            .populate('coachId', 'name email phone')
            .sort({ transactionDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await CoachTransaction.countDocuments(query);

        res.json({
            success: true,
            data: pendingPayouts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalPending: total,
                hasNextPage: skip + pendingPayouts.length < total,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error getting pending payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting pending payouts',
            error: error.message
        });
    }
};

/**
 * @route   GET /api/payments/sending/payout-statistics
 * @desc    Get payout statistics
 * @access  Private (Admin)
 */
exports.getPayoutStatistics = async (req, res) => {
    try {
        const { period = 'current' } = req.query;
        
        const startDate = getPeriodStartDate(period);
        const endDate = getPeriodEndDate(period);

        const stats = await CoachTransaction.aggregate([
            {
                $match: {
                    transactionType: { $in: ['payout_requested', 'payout_completed', 'payout_failed'] },
                    transactionDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$grossAmount' }
                }
            }
        ]);

        const totalStats = await CoachTransaction.aggregate([
            {
                $match: {
                    transactionType: { $in: ['payout_requested', 'payout_completed', 'payout_failed'] },
                    transactionDate: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPayouts: { $sum: 1 },
                    totalAmount: { $sum: '$grossAmount' },
                    uniqueCoaches: { $addToSet: '$coachId' }
                }
            }
        ]);

        const result = {
            period: { startDate, endDate, label: period },
            totalPayouts: totalStats[0]?.totalPayouts || 0,
            totalAmount: totalStats[0]?.totalAmount || 0,
            uniqueCoaches: totalStats[0]?.uniqueCoaches?.length || 0,
            byStatus: {}
        };

        stats.forEach(stat => {
            result.byStatus[stat._id] = {
                count: stat.count,
                amount: stat.totalAmount
            };
        });

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('[CoachPaymentController] Error getting payout statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting payout statistics',
            error: error.message
        });
    }
};

// Helper functions for period calculation
function getPeriodStartDate(period) {
    const now = new Date();
    
    switch (period) {
        case 'current':
            return new Date(now.getFullYear(), now.getMonth(), 1);
        case 'previous':
            return new Date(now.getFullYear(), now.getMonth() - 1, 1);
        case 'last30days':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'last90days':
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case 'year':
            return new Date(now.getFullYear(), 0, 1);
        default:
            return new Date(now.getFullYear(), now.getMonth(), 1);
    }
}

function getPeriodEndDate(period) {
    const now = new Date();
    
    switch (period) {
        case 'current':
            return new Date(now.getFullYear(), now.getMonth() + 1, 0);
        case 'previous':
            return new Date(now.getFullYear(), now.getMonth(), 0);
        case 'last30days':
        case 'last90days':
        case 'year':
            return now;
        default:
            return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
}
