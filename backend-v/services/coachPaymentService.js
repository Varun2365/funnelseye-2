const CoachPayment = require('../schema/CoachPayment');
const User = require('../schema/User');

class CoachPaymentService {
    /**
     * Setup payment collection for a coach
     */
    async setupPaymentCollection(coachId, paymentData) {
        try {
            const coach = await User.findById(coachId);
            if (!coach) {
                return { success: false, error: 'Coach not found' };
            }

            // Validate payment data
            if (!paymentData.upiId && !paymentData.bankAccount) {
                return { success: false, error: 'Either UPI ID or bank account details are required' };
            }

            if (paymentData.paymentCollectionMethod === 'bank_transfer' && 
                (!paymentData.bankAccount?.accountNumber || !paymentData.bankAccount?.ifscCode)) {
                return { success: false, error: 'Bank account number and IFSC code are required for bank transfer method' };
            }

            // Update coach payment collection settings
            coach.paymentCollection = {
                upiId: paymentData.upiId || null,
                bankAccount: paymentData.bankAccount || null,
                isPaymentCollectionEnabled: true,
                paymentCollectionMethod: paymentData.paymentCollectionMethod || 'upi'
            };

            await coach.save();

            return { success: true, data: coach.paymentCollection };
        } catch (error) {
            console.error('Error setting up payment collection:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create a new payment for a coach
     */
    async createPayment(paymentData, adminId) {
        try {
            // Check if coach exists and has payment collection enabled
            const coach = await User.findById(paymentData.coachId);
            if (!coach) {
                return { success: false, error: 'Coach not found' };
            }

            if (!coach.paymentCollection?.isPaymentCollectionEnabled) {
                return { success: false, error: 'Coach has not enabled payment collection' };
            }

            // Create payment
            const payment = new CoachPayment({
                ...paymentData,
                createdBy: adminId,
                processingDetails: {
                    initiatedAt: new Date()
                }
            });

            await payment.save();

            return { success: true, data: payment };
        } catch (error) {
            console.error('Error creating payment:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process a payment (mark as processed, completed, or failed)
     */
    async processPayment(paymentId, action, adminId, additionalData = {}) {
        try {
            const payment = await CoachPayment.findById(paymentId);
            if (!payment) {
                return { success: false, error: 'Payment not found' };
            }

            switch (action) {
                case 'process':
                    await payment.markAsProcessed(adminId);
                    break;
                case 'complete':
                    await payment.markAsCompleted(additionalData.transactionId);
                    break;
                case 'fail':
                    if (!additionalData.notes) {
                        return { success: false, error: 'Failure reason is required' };
                    }
                    await payment.markAsFailed(additionalData.notes);
                    break;
                default:
                    return { success: false, error: 'Invalid action. Use: process, complete, or fail' };
            }

            return { success: true, data: payment };
        } catch (error) {
            console.error('Error processing payment:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get payment statistics for a coach
     */
    async getCoachPaymentStats(coachId, period = null) {
        try {
            const stats = await CoachPayment.getCoachPaymentStats(coachId, period);
            
            // Get recent payments
            const recentPayments = await CoachPayment.find({ coachId })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('amount status paymentType createdAt');

            return { success: true, data: { stats, recentPayments, period } };
        } catch (error) {
            console.error('Error getting payment stats:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get overall payment analytics for admin
     */
    async getAdminPaymentAnalytics(period = null) {
        try {
            let query = {};
            if (period) {
                query.createdAt = {
                    $gte: period.startDate,
                    $lte: period.endDate
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
                period: period
            };

            stats.forEach(stat => {
                result.byStatus[stat._id] = {
                    count: stat.count,
                    amount: stat.totalAmount
                };
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Error getting admin payment analytics:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get pending payments for a coach
     */
    async getPendingPayments(coachId) {
        try {
            const pendingPayments = await CoachPayment.find({
                coachId,
                status: 'pending'
            }).sort({ createdAt: 1 });

            return { success: true, data: pendingPayments };
        } catch (error) {
            console.error('Error getting pending payments:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get overdue payments (pending for more than 7 days)
     */
    async getOverduePayments() {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const overduePayments = await CoachPayment.find({
                status: 'pending',
                createdAt: { $lte: sevenDaysAgo }
            }).populate('coachId', 'name email company');

            return { success: true, data: overduePayments };
        } catch (error) {
            console.error('Error getting overdue payments:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Bulk process payments (for monthly payouts)
     */
    async bulkProcessPayments(paymentIds, action, adminId) {
        try {
            const results = [];
            
            for (const paymentId of paymentIds) {
                const result = await this.processPayment(paymentId, action, adminId);
                results.push({
                    paymentId,
                    success: result.success,
                    error: result.error
                });
            }

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            return {
                success: true,
                data: {
                    total: paymentIds.length,
                    successful,
                    failed,
                    results
                }
            };
        } catch (error) {
            console.error('Error bulk processing payments:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate commission for a coach based on performance
     */
    async calculateCommission(coachId, period) {
        try {
            // This is a placeholder for commission calculation logic
            // You would implement your specific commission calculation here
            const commission = {
                amount: 0,
                breakdown: {
                    leadGeneration: 0,
                    subscriptionReferrals: 0,
                    performanceBonus: 0,
                    mlmCommission: 0
                }
            };

            return { success: true, data: commission };
        } catch (error) {
            console.error('Error calculating commission:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new CoachPaymentService();
