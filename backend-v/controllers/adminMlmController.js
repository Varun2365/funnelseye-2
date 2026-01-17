const asyncHandler = require('../middleware/async');
const { AdminSystemSettings, Coach, Payment, MlmCommissionDistribution } = require('../schema');

// ===== MLM COMMISSION MANAGEMENT =====

/**
 * @desc    Get MLM commission structure
 * @route   GET /api/admin/mlm/commission-structure
 * @access  Private (Admin)
 */
exports.getCommissionStructure = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('paymentSystem.mlmCommissionStructure paymentSystem.commissionEligibility');
        
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'MLM settings not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                commissionStructure: settings.paymentSystem.mlmCommissionStructure,
                eligibilityRules: settings.paymentSystem.commissionEligibility
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
 * @desc    Update MLM commission structure
 * @route   PUT /api/admin/mlm/commission-structure
 * @access  Private (Admin)
 */
exports.updateCommissionStructure = asyncHandler(async (req, res) => {
    try {
        const { commissionStructure, eligibilityRules } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'paymentSystem.mlmCommissionStructure': commissionStructure,
                    'paymentSystem.commissionEligibility': eligibilityRules
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
            message: 'MLM commission structure updated successfully',
            data: {
                commissionStructure: settings.paymentSystem.mlmCommissionStructure,
                eligibilityRules: settings.paymentSystem.commissionEligibility
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
 * @desc    Get MLM performance analytics
 * @route   GET /api/admin/mlm/analytics
 * @access  Private (Admin)
 */
exports.getMlmAnalytics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        // Get commission distributions
        const commissionStats = await MlmCommissionDistribution.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCommissions: { $sum: '$amount' },
                    totalDistributions: { $count: {} },
                    averageCommission: { $avg: '$amount' }
                }
            }
        ]);

        // Get coach performance
        const coachPerformance = await Coach.aggregate([
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'coachId',
                    as: 'payments'
                }
            },
            {
                $addFields: {
                    totalRevenue: { $sum: '$payments.amount' },
                    paymentCount: { $size: '$payments' }
                }
            },
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    totalRevenue: 1,
                    paymentCount: 1,
                    level: 1,
                    teamSize: 1
                }
            },
            {
                $sort: { totalRevenue: -1 }
            },
            {
                $limit: 20
            }
        ]);

        // Get level-wise statistics
        const levelStats = await Coach.aggregate([
            {
                $group: {
                    _id: '$level',
                    count: { $sum: 1 },
                    averageRevenue: { $avg: '$totalRevenue' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                commissionStats: commissionStats[0] || {
                    totalCommissions: 0,
                    totalDistributions: 0,
                    averageCommission: 0
                },
                coachPerformance,
                levelStats,
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting MLM analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving MLM analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Get pending payouts
 * @route   GET /api/admin/mlm/pending-payouts
 * @access  Private (Admin)
 */
exports.getPendingPayouts = asyncHandler(async (req, res) => {
    try {
        const pendingPayouts = await MlmCommissionDistribution.find({
            status: 'pending',
            amount: { $gte: 50 } // Minimum payout threshold
        }).populate('coachId', 'firstName lastName email');

        res.status(200).json({
            success: true,
            data: pendingPayouts
        });
    } catch (error) {
        console.error('Error getting pending payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving pending payouts',
            error: error.message
        });
    }
});

/**
 * @desc    Process payouts
 * @route   POST /api/admin/mlm/process-payouts
 * @access  Private (Admin)
 */
exports.processPayouts = asyncHandler(async (req, res) => {
    try {
        const { payoutIds, payoutMethod } = req.body;

        if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Payout IDs are required'
            });
        }

        // Update payout status
        const result = await MlmCommissionDistribution.updateMany(
            { _id: { $in: payoutIds } },
            {
                $set: {
                    status: 'processing',
                    payoutMethod,
                    processedAt: new Date()
                }
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} payouts marked for processing`,
            data: { processedCount: result.modifiedCount }
        });
    } catch (error) {
        console.error('Error processing payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing payouts',
            error: error.message
        });
    }
});

/**
 * @desc    Get commission eligibility report
 * @route   GET /api/admin/mlm/eligibility-report
 * @access  Private (Admin)
 */
exports.getEligibilityReport = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('paymentSystem.commissionEligibility');
        
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: 'MLM settings not found'
            });
        }

        const eligibilityRules = settings.paymentSystem.commissionEligibility;

        // Get coaches and check eligibility
        const coaches = await Coach.find({}).select('firstName lastName email level performanceRating activeDays teamSize monthlyRevenue subscriptionStatus');

        const eligibilityReport = coaches.map(coach => {
            const isEligible = (
                coach.level >= eligibilityRules.minimumCoachLevel &&
                coach.performanceRating >= eligibilityRules.minimumPerformanceRating &&
                coach.activeDays >= eligibilityRules.minimumActiveDays &&
                coach.teamSize >= eligibilityRules.minimumTeamSize &&
                coach.monthlyRevenue >= eligibilityRules.minimumMonthlyRevenue &&
                (!eligibilityRules.requireActiveSubscription || coach.subscriptionStatus === 'active')
            );

            return {
                coachId: coach._id,
                name: `${coach.firstName} ${coach.lastName}`,
                email: coach.email,
                level: coach.level,
                performanceRating: coach.performanceRating,
                activeDays: coach.activeDays,
                teamSize: coach.teamSize,
                monthlyRevenue: coach.monthlyRevenue,
                subscriptionStatus: coach.subscriptionStatus,
                isEligible,
                reasons: !isEligible ? getEligibilityReasons(coach, eligibilityRules) : []
            };
        });

        res.status(200).json({
            success: true,
            data: {
                eligibilityReport,
                eligibilityRules
            }
        });
    } catch (error) {
        console.error('Error getting eligibility report:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving eligibility report',
            error: error.message
        });
    }
});

// Helper function to get eligibility reasons
function getEligibilityReasons(coach, rules) {
    const reasons = [];
    
    if (coach.level < rules.minimumCoachLevel) {
        reasons.push(`Level ${coach.level} is below minimum required level ${rules.minimumCoachLevel}`);
    }
    if (coach.performanceRating < rules.minimumPerformanceRating) {
        reasons.push(`Performance rating ${coach.performanceRating} is below minimum ${rules.minimumPerformanceRating}`);
    }
    if (coach.activeDays < rules.minimumActiveDays) {
        reasons.push(`Active days ${coach.activeDays} is below minimum ${rules.minimumActiveDays}`);
    }
    if (coach.teamSize < rules.minimumTeamSize) {
        reasons.push(`Team size ${coach.teamSize} is below minimum ${rules.minimumTeamSize}`);
    }
    if (coach.monthlyRevenue < rules.minimumMonthlyRevenue) {
        reasons.push(`Monthly revenue $${coach.monthlyRevenue} is below minimum $${rules.minimumMonthlyRevenue}`);
    }
    if (rules.requireActiveSubscription && coach.subscriptionStatus !== 'active') {
        reasons.push('Active subscription is required');
    }
    
    return reasons;
}
