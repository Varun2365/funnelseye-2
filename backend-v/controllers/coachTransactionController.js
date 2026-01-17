const CoachTransaction = require('../schema/CoachTransaction');
const GlobalPaymentSettings = require('../schema/GlobalPaymentSettings');
const User = require('../schema/User');
const logger = require('../utils/logger');

class CoachTransactionController {
    
    /**
     * Get coach transaction dashboard
     * GET /api/coach-transactions/dashboard/:coachId
     */
    async getCoachDashboard(req, res) {
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
            const startDate = this.getPeriodStartDate(period);
            const endDate = this.getPeriodEndDate(period);

            // Get comprehensive dashboard data
            const [
                earnings,
                payouts,
                recentTransactions,
                transactionStats,
                platformFees,
                availableBalance
            ] = await Promise.all([
                this.getEarningsSummary(coachId, startDate, endDate),
                this.getPayoutSummary(coachId, startDate, endDate),
                this.getRecentTransactions(coachId, 10),
                this.getTransactionStats(coachId, startDate, endDate),
                this.getPlatformFeesSummary(coachId, startDate, endDate),
                this.getAvailableBalance(coachId)
            ]);

            res.json({
                success: true,
                data: {
                    period: {
                        startDate: startDate,
                        endDate: endDate,
                        label: period
                    },
                    summary: {
                        totalEarnings: earnings.totalEarnings,
                        totalPayouts: payouts.totalPayouts,
                        availableBalance: availableBalance,
                        totalFeesPaid: earnings.totalFeesPaid + payouts.totalFees,
                        netProfit: earnings.totalEarnings - payouts.totalPayouts - (earnings.totalFeesPaid + payouts.totalFees)
                    },
                    earnings: earnings,
                    payouts: payouts,
                    platformFees: platformFees,
                    recentTransactions: recentTransactions,
                    transactionStats: transactionStats,
                    charts: {
                        earningsByType: earnings.breakdown,
                        monthlyTrend: await this.getMonthlyTrend(coachId, 6),
                        payoutHistory: await this.getPayoutHistoryChart(coachId, 6)
                    }
                }
            });

        } catch (error) {
            logger.error('[CoachTransactionController] Error getting coach dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting coach dashboard',
                error: error.message
            });
        }
    }

    /**
     * Get coach transaction history
     * GET /api/coach-transactions/history/:coachId
     */
    async getTransactionHistory(req, res) {
        try {
            const { coachId } = req.params;
            const { 
                page = 1, 
                limit = 20, 
                transactionType, 
                direction, 
                status, 
                startDate, 
                endDate,
                sortBy = 'transactionDate',
                sortOrder = 'desc'
            } = req.query;
            
            // Check if user can access this coach's data
            if (req.user.role !== 'admin' && req.user._id.toString() !== coachId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Build query
            const query = { coachId: coachId };
            
            if (transactionType) query.transactionType = transactionType;
            if (direction) query.direction = direction;
            if (status) query.status = status;
            if (startDate && endDate) {
                query.transactionDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute query with pagination
            const skip = (page - 1) * limit;
            const transactions = await CoachTransaction.find(query)
                .populate('productInfo.productId', 'name')
                .populate('productInfo.planId', 'title')
                .populate('productInfo.customerId', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const total = await CoachTransaction.countDocuments(query);

            res.json({
                success: true,
                data: transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalTransactions: total,
                    hasNextPage: skip + transactions.length < total,
                    hasPrevPage: page > 1
                },
                filters: {
                    transactionType,
                    direction,
                    status,
                    startDate,
                    endDate,
                    sortBy,
                    sortOrder
                }
            });

        } catch (error) {
            logger.error('[CoachTransactionController] Error getting transaction history:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting transaction history',
                error: error.message
            });
        }
    }

    /**
     * Get transaction details
     * GET /api/coach-transactions/transaction/:transactionId
     */
    async getTransactionDetails(req, res) {
        try {
            const { transactionId } = req.params;

            const transaction = await CoachTransaction.findOne({ transactionId })
                .populate('coachId', 'name email')
                .populate('productInfo.productId', 'name description')
                .populate('productInfo.planId', 'title description')
                .populate('productInfo.customerId', 'name email phone')
                .populate('commissionDetails.sponsorId', 'name email');

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }

            // Check if user can access this transaction
            if (req.user.role !== 'admin' && req.user._id.toString() !== transaction.coachId._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.json({
                success: true,
                data: transaction
            });

        } catch (error) {
            logger.error('[CoachTransactionController] Error getting transaction details:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting transaction details',
                error: error.message
            });
        }
    }

    /**
     * Get earnings summary
     */
    async getEarningsSummary(coachId, startDate, endDate) {
        try {
            const earnings = await CoachTransaction.getCoachEarningsSummary(coachId, startDate, endDate);
            
            // Get detailed breakdown by product type
            const productBreakdown = await CoachTransaction.aggregate([
                {
                    $match: {
                        coachId: new mongoose.Types.ObjectId(coachId),
                        direction: 'incoming',
                        status: 'completed',
                        transactionType: { $in: ['commission_earned', 'direct_sale', 'mlm_commission', 'referral_bonus', 'performance_bonus'] },
                        transactionDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$productInfo.productType',
                        totalAmount: { $sum: '$netAmount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$netAmount' }
                    }
                }
            ]);

            return {
                ...earnings,
                productBreakdown: productBreakdown
            };
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting earnings summary:', error);
            return {
                totalEarnings: 0,
                totalTransactions: 0,
                totalFeesPaid: 0,
                breakdown: [],
                productBreakdown: []
            };
        }
    }

    /**
     * Get payout summary
     */
    async getPayoutSummary(coachId, startDate, endDate) {
        try {
            const payouts = await CoachTransaction.getCoachPayoutSummary(coachId, startDate, endDate);
            
            // Get payout method breakdown
            const methodBreakdown = await CoachTransaction.aggregate([
                {
                    $match: {
                        coachId: new mongoose.Types.ObjectId(coachId),
                        direction: 'outgoing',
                        transactionType: { $in: ['payout_received', 'payout_completed'] },
                        transactionDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$payoutInfo.payoutMethod',
                        totalAmount: { $sum: '$netAmount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$netAmount' }
                    }
                }
            ]);

            return {
                ...payouts,
                methodBreakdown: methodBreakdown
            };
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting payout summary:', error);
            return {
                totalPayouts: 0,
                payoutCount: 0,
                totalFees: 0,
                methodBreakdown: []
            };
        }
    }

    /**
     * Get recent transactions
     */
    async getRecentTransactions(coachId, limit = 10) {
        try {
            return await CoachTransaction.find({ coachId: coachId })
                .populate('productInfo.productId', 'name')
                .populate('productInfo.planId', 'title')
                .populate('productInfo.customerId', 'name')
                .sort({ transactionDate: -1 })
                .limit(limit)
                .select('transactionId transactionType direction grossAmount netAmount currency status transactionDate productInfo');
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting recent transactions:', error);
            return [];
        }
    }

    /**
     * Get transaction statistics
     */
    async getTransactionStats(coachId, startDate, endDate) {
        try {
            const stats = await CoachTransaction.aggregate([
                {
                    $match: {
                        coachId: new mongoose.Types.ObjectId(coachId),
                        transactionDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            type: '$transactionType',
                            direction: '$direction'
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$netAmount' },
                        avgAmount: { $avg: '$netAmount' }
                    }
                }
            ]);

            return stats;
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting transaction stats:', error);
            return [];
        }
    }

    /**
     * Get platform fees summary
     */
    async getPlatformFeesSummary(coachId, startDate, endDate) {
        try {
            const fees = await CoachTransaction.aggregate([
                {
                    $match: {
                        coachId: new mongoose.Types.ObjectId(coachId),
                        transactionDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPlatformFees: { $sum: '$fees.platformFee' },
                        totalProcessingFees: { $sum: '$fees.processingFee' },
                        totalPayoutFees: { $sum: '$fees.payoutFee' },
                        totalTaxAmount: { $sum: '$fees.taxAmount' },
                        totalFees: { $sum: '$fees.totalFees' }
                    }
                }
            ]);

            return fees[0] || {
                totalPlatformFees: 0,
                totalProcessingFees: 0,
                totalPayoutFees: 0,
                totalTaxAmount: 0,
                totalFees: 0
            };
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting platform fees:', error);
            return {
                totalPlatformFees: 0,
                totalProcessingFees: 0,
                totalPayoutFees: 0,
                totalTaxAmount: 0,
                totalFees: 0
            };
        }
    }

    /**
     * Get available balance
     */
    async getAvailableBalance(coachId) {
        try {
            const earnings = await CoachTransaction.getCoachEarningsSummary(coachId);
            const payouts = await CoachTransaction.getCoachPayoutSummary(coachId);
            return earnings.totalEarnings - payouts.totalPayouts;
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting available balance:', error);
            return 0;
        }
    }

    /**
     * Get monthly trend
     */
    async getMonthlyTrend(coachId, months = 6) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const trend = await CoachTransaction.aggregate([
                {
                    $match: {
                        coachId: new mongoose.Types.ObjectId(coachId),
                        direction: 'incoming',
                        status: 'completed',
                        transactionType: { $in: ['commission_earned', 'direct_sale', 'mlm_commission', 'referral_bonus', 'performance_bonus'] },
                        transactionDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$transactionDate' },
                            month: { $month: '$transactionDate' }
                        },
                        totalEarnings: { $sum: '$netAmount' },
                        transactionCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            return trend;
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting monthly trend:', error);
            return [];
        }
    }

    /**
     * Get payout history chart
     */
    async getPayoutHistoryChart(coachId, months = 6) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const payoutHistory = await CoachTransaction.aggregate([
                {
                    $match: {
                        coachId: new mongoose.Types.ObjectId(coachId),
                        direction: 'outgoing',
                        transactionType: { $in: ['payout_received', 'payout_completed'] },
                        transactionDate: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$transactionDate' },
                            month: { $month: '$transactionDate' }
                        },
                        totalPayouts: { $sum: '$netAmount' },
                        payoutCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            return payoutHistory;
        } catch (error) {
            logger.error('[CoachTransactionController] Error getting payout history chart:', error);
            return [];
        }
    }

    /**
     * Export transaction data
     * GET /api/coach-transactions/export/:coachId
     */
    async exportTransactions(req, res) {
        try {
            const { coachId } = req.params;
            const { format = 'csv', startDate, endDate, transactionType } = req.query;
            
            // Check if user can access this coach's data
            if (req.user.role !== 'admin' && req.user._id.toString() !== coachId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            // Build query
            const query = { coachId: coachId };
            if (transactionType) query.transactionType = transactionType;
            if (startDate && endDate) {
                query.transactionDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const transactions = await CoachTransaction.find(query)
                .populate('productInfo.productId', 'name')
                .populate('productInfo.planId', 'title')
                .populate('productInfo.customerId', 'name email')
                .sort({ transactionDate: -1 });

            if (format === 'csv') {
                // Generate CSV
                const csv = this.generateCSV(transactions);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="coach-transactions-${coachId}-${Date.now()}.csv"`);
                res.send(csv);
            } else {
                res.json({
                    success: true,
                    data: transactions,
                    count: transactions.length
                });
            }

        } catch (error) {
            logger.error('[CoachTransactionController] Error exporting transactions:', error);
            res.status(500).json({
                success: false,
                message: 'Error exporting transactions',
                error: error.message
            });
        }
    }

    /**
     * Generate CSV from transactions
     */
    generateCSV(transactions) {
        const headers = [
            'Transaction ID',
            'Date',
            'Type',
            'Direction',
            'Amount',
            'Currency',
            'Status',
            'Product Name',
            'Customer Name',
            'Fees',
            'Net Amount',
            'Notes'
        ];

        const rows = transactions.map(txn => [
            txn.transactionId,
            txn.transactionDate.toISOString().split('T')[0],
            txn.transactionType,
            txn.direction,
            txn.grossAmount,
            txn.currency,
            txn.status,
            txn.productInfo?.productName || txn.productInfo?.planId?.title || '',
            txn.productInfo?.customerName || '',
            txn.fees?.totalFees || 0,
            txn.netAmount,
            txn.notes || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        return csvContent;
    }

    /**
     * Helper functions for period calculation
     */
    getPeriodStartDate(period) {
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

    getPeriodEndDate(period) {
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
}

// Create controller instance and bind all methods
const controller = new CoachTransactionController();

module.exports = {
    getCoachDashboard: controller.getCoachDashboard.bind(controller),
    getTransactionHistory: controller.getTransactionHistory.bind(controller),
    getTransactionDetails: controller.getTransactionDetails.bind(controller),
    exportTransactions: controller.exportTransactions.bind(controller)
};
