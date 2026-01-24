const asyncHandler = require('../middleware/async');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateToken } = require('./adminAuthController');
const razorpayService = require('../services/razorpayService');
const { 
    User, 
    CoachPlan, 
    Subscription, 
    AdminSystemSettings, 
    AdminV1Settings,
    AdminUser,
    AdminAuditLog,
    MlmCommissionDistribution,
    Appointment,
    Lead,
    CentralPayment,
    RazorpayPayment,
    PaymentGatewayConfig,
    AdminProduct,
    CoachSellablePlan,
    AdCampaign,
    Funnel,
    AdminRequest
} = require('../schema');

/**
 * ADMIN V1 MASTER CONTROLLER
 * Centralized admin operations with comprehensive control center functionality
 */

// ===== DASHBOARD & ANALYTICS =====

/**
 * @desc    Get comprehensive admin dashboard data
 * @route   GET /api/admin/v1/dashboard
 * @access  Private (Admin)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Get key metrics
        const [
            totalUsers,
            totalCoaches,
            activeSubscriptions,
            totalRevenue,
            newUsersThisMonth,
            newCoachesThisMonth,
            totalConversions,
            systemHealth
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'coach' }),
            Subscription.countDocuments({ status: 'active' }),
            // Get revenue from platform subscription payments (coaches paying for platform plans)
            // Also include other revenue sources if needed
            (async () => {
                let revenueResult = await RazorpayPayment.aggregate([
                    { $match: {
                        businessType: 'platform_subscription',
                        status: 'captured',
                        createdAt: { $gte: startDate }
                    }},
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);

                // If no platform subscription revenue, include other sources
                if (revenueResult.length === 0) {
                    revenueResult = await RazorpayPayment.aggregate([
                        { $match: {
                            businessType: { $in: ['coach_plan_purchase', 'mlm_commission'] },
                            status: 'captured',
                            createdAt: { $gte: startDate }
                        }},
                        { $group: { _id: null, total: { $sum: '$amount' } } }
                    ]);
                }

                return revenueResult;
            })(),
            User.countDocuments({ role: 'user', createdAt: { $gte: startDate } }),
            User.countDocuments({ role: 'coach', createdAt: { $gte: startDate } }),
            // Count successful subscription payments as conversions
            RazorpayPayment.countDocuments({
                businessType: 'platform_subscription',
                status: 'captured',
                createdAt: { $gte: startDate }
            }),
            getSystemHealth()
        ]);

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
        const conversionRate = totalUsers > 0 ? ((totalConversions / totalUsers) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalCoaches,
                    activeSubscriptions,
                    totalRevenue: revenue,
                    newUsersThisMonth,
                    coachGrowth: newCoachesThisMonth,
                    totalConversions,
                    conversionRate: parseFloat(conversionRate),
                    revenueGrowth: 0, // TODO: Calculate actual revenue growth
                    timeRange: parseInt(timeRange)
                },
                systemHealth,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard data',
            error: error.message
        });
    }
});

/**
 * @desc    Get platform analytics
 * @route   GET /api/admin/v1/analytics
 * @access  Private (Admin)
 */
exports.getPlatformAnalytics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30, metric = 'all' } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // If specific metric is requested, return that data directly
        if (metric === 'users') {
            console.log('🎯 [getPlatformAnalytics] Metric=users requested, calling getUserAnalytics');
            const userAnalytics = await getUserAnalytics(startDate);
            console.log('📤 [getPlatformAnalytics] Returning user analytics:', userAnalytics);
            res.json({
                success: true,
                data: userAnalytics
            });
            return;
        }

        let analytics = {};

        if (metric === 'all' || metric === 'users') {
            analytics.userAnalytics = await getUserAnalytics(startDate);
        }

        if (metric === 'all' || metric === 'revenue') {
            analytics.revenueAnalytics = await getRevenueAnalytics(startDate);
        }

        if (metric === 'all' || metric === 'coaches') {
            analytics.coachAnalytics = await getCoachAnalytics(startDate);
        }

        if (metric === 'all' || metric === 'subscriptions') {
            analytics.subscriptionAnalytics = await getSubscriptionAnalytics(startDate);
        }

        res.json({
            success: true,
            data: {
                analytics,
                timeRange: parseInt(timeRange),
                generatedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error getting platform analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving platform analytics',
            error: error.message
        });
    }
});

// ===== USER MANAGEMENT =====

/**
 * @desc    Get all users with filtering and pagination
 * @route   GET /api/admin/v1/users
 * @access  Private (Admin)
 */
exports.getUsers = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            role, 
            status, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        const query = {};
        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('coachId', 'name email _id')
            .populate('sponsorId', 'name selfCoachId')
            .populate('referralId', 'name email');

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
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
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving users',
            error: error.message
        });
    }
});

/**
 * @desc    Get comprehensive user details with all related data
 * @route   GET /api/admin/v1/users/:userId
 * @access  Private (Admin)
 */
exports.getUserDetails = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password -passwordHistory')
            .populate('coachId', 'firstName lastName email phone')
            .populate('referralId', 'firstName lastName email');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get comprehensive user data in parallel
        const [
            subscriptions,
            appointments,
            leads,
            campaigns,
            funnels,
            payments,
            hierarchyRequests,
            usageStats,
            coachPlans
        ] = await Promise.all([
            // Subscriptions
            Subscription.find({ userId })
                .populate('planId', 'name price duration features')
                .sort({ createdAt: -1 }),
            
            // Appointments
            Appointment.find({ userId })
                .populate('coachId', 'firstName lastName email phone')
                .sort({ scheduledAt: -1 }),
            
            // Leads
            Lead.find({ userId })
                .populate('source', 'name type')
                .sort({ createdAt: -1 }),
            
            // Marketing Campaigns
            AdCampaign.find({ userId })
                .populate('adSets', 'name status budget')
                .sort({ createdAt: -1 }),
            
            // Funnels
            Funnel.find({ userId })
                .populate('events', 'name type')
                .sort({ createdAt: -1 }),
            
            // Payments
            CentralPayment.find({ userId })
                .populate('planId', 'name price')
                .sort({ createdAt: -1 }),
            
            // Hierarchy Requests (if user is coach)
            user.role === 'coach' ? 
                AdminRequest.find({ 
                    $or: [
                        { requesterId: userId },
                        { targetUserId: userId }
                    ],
                    type: 'hierarchy_change'
                }).populate('requesterId', 'firstName lastName email')
                 .populate('targetUserId', 'firstName lastName email')
                 .sort({ createdAt: -1 }) : [],
            
            // Usage Statistics
            User.findById(userId).select('aiCredits emailCredits lastActiveAt loginCount'),
            
            // Coach Plans (if user is coach)
            user.role === 'coach' ? 
                CoachPlan.find({ coachId: userId })
                    .populate('subscriptions', 'status amount')
                    .sort({ createdAt: -1 }) : [],
            
            // Marketing Credentials (if user is coach) - Model not available
            null
        ]);

        // Calculate comprehensive statistics
        const stats = {
            // Subscription stats
            totalSubscriptions: subscriptions.length,
            activeSubscriptions: subscriptions.filter(sub => sub.status === 'active').length,
            totalSubscriptionValue: subscriptions.reduce((sum, sub) => sum + (sub.planId?.price || 0), 0),
            
            // Appointment stats
            totalAppointments: appointments.length,
            completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
            upcomingAppointments: appointments.filter(apt => apt.status === 'scheduled' && apt.scheduledAt > new Date()).length,
            
            // Lead stats
            totalLeads: leads.length,
            convertedLeads: leads.filter(lead => lead.status === 'converted').length,
            leadConversionRate: leads.length > 0 ? (leads.filter(lead => lead.status === 'converted').length / leads.length * 100).toFixed(2) : 0,
            
            // Campaign stats
            totalCampaigns: campaigns.length,
            activeCampaigns: campaigns.filter(campaign => campaign.status === 'active').length,
            totalCampaignSpend: campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0),
            
            // Funnel stats
            totalFunnels: funnels.length,
            activeFunnels: funnels.filter(funnel => funnel.status === 'active').length,
            
            // Payment stats
            totalPayments: payments.length,
            successfulPayments: payments.filter(payment => payment.status === 'completed').length,
            totalRevenue: payments.filter(payment => payment.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0),
            
            // Hierarchy stats (for coaches)
            pendingHierarchyRequests: hierarchyRequests.filter(req => req.status === 'pending').length,
            approvedHierarchyRequests: hierarchyRequests.filter(req => req.status === 'approved').length,
            
            // Usage stats
            aiCreditsUsed: user.aiCreditsUsed || 0,
            emailCreditsUsed: user.emailCreditsUsed || 0,
            loginCount: user.loginCount || 0,
            daysSinceLastActive: user.lastActiveAt ? Math.floor((new Date() - user.lastActiveAt) / (1000 * 60 * 60 * 24)) : null,
            
            // Coach-specific stats
            totalCoachPlans: coachPlans.length,
            activeCoachPlans: coachPlans.filter(plan => plan.status === 'active').length,
            totalPlanSales: coachPlans.reduce((sum, plan) => sum + (plan.totalSales || 0), 0),
            totalPlanRevenue: coachPlans.reduce((sum, plan) => sum + (plan.totalRevenue || 0), 0)
        };

        // Get recent activity
        const recentActivity = await AdminAuditLog.find({
            $or: [
                { 'metadata.userId': userId },
                { 'metadata.targetUserId': userId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('action description createdAt adminEmail');

        res.json({
            success: true,
            data: {
                user,
                subscriptions,
                appointments,
                leads,
                campaigns,
                funnels,
                payments,
                hierarchyRequests,
                coachPlans,
                usageStats,
                recentActivity,
                statistics: stats,
                summary: {
                    userType: user.role,
                    accountStatus: user.status,
                    subscriptionStatus: subscriptions.find(sub => sub.status === 'active')?.status || 'none',
                    lastActive: user.lastActiveAt,
                    totalValue: stats.totalSubscriptionValue + stats.totalPlanRevenue,
                    engagementScore: calculateEngagementScore(stats)
                }
            }
        });
    } catch (error) {
        console.error('Error getting user details:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user details',
            error: error.message
        });
    }
});

// Helper function to calculate engagement score
function calculateEngagementScore(stats) {
    let score = 0;
    
    // Login activity (0-25 points)
    if (stats.loginCount > 50) score += 25;
    else if (stats.loginCount > 20) score += 20;
    else if (stats.loginCount > 10) score += 15;
    else if (stats.loginCount > 5) score += 10;
    else if (stats.loginCount > 0) score += 5;
    
    // Appointment completion (0-25 points)
    if (stats.totalAppointments > 0) {
        const completionRate = stats.completedAppointments / stats.totalAppointments;
        score += Math.floor(completionRate * 25);
    }
    
    // Subscription activity (0-25 points)
    if (stats.activeSubscriptions > 0) score += 25;
    else if (stats.totalSubscriptions > 0) score += 15;
    
    // Lead engagement (0-25 points)
    if (stats.totalLeads > 0) {
        const conversionRate = stats.leadConversionRate / 100;
        score += Math.floor(conversionRate * 25);
    }
    
    return Math.min(score, 100);
}

/**
 * @desc    Update user status or details
 * @route   PUT /api/admin/v1/users/:userId
 * @access  Private (Admin)
 */
exports.updateUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, role, coachId, notes } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (role) updateData.role = role;
        if (coachId) updateData.coachId = coachId;
        if (notes) updateData.adminNotes = notes;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

// ===== FINANCIAL SETTINGS =====

/**
 * @desc    Get financial settings
 * @route   GET /api/admin/v1/financial-settings
 * @access  Private (Admin)
 */
exports.getSystemFinancialSettings = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('paymentSystem');
        
        const defaultSettings = {
            razorpay: {
                keyId: '',
                keySecret: '',
                accountNumber: '',
                webhookSecret: ''
            },
            platformFees: {
                subscriptionFee: 5.0,
                transactionFee: 2.0,
                payoutFee: 1.0,
                refundFee: 0.5
            },
            mlmCommissionStructure: {
                levels: [
                    { level: 1, percentage: 10 },
                    { level: 2, percentage: 5 },
                    { level: 3, percentage: 3 }
                ],
                platformFeePercentage: 5,
                maxLevels: 3,
                autoPayoutEnabled: true,
                payoutThreshold: 100
            }
        };

        res.json({
            success: true,
            data: {
                settings: settings?.paymentSystem || defaultSettings
            }
        });
    } catch (error) {
        console.error('Error getting financial settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving financial settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update financial settings
 * @route   PUT /api/admin/v1/financial-settings
 * @access  Private (Admin)
 */
exports.updateFinancialSettings = asyncHandler(async (req, res) => {
    try {
        const { razorpay, platformFees, mlmCommissionStructure } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'paymentSystem.razorpay': razorpay,
                    'paymentSystem.platformFees': platformFees,
                    'paymentSystem.mlmCommissionStructure': mlmCommissionStructure
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Financial settings updated successfully',
            data: {
                settings: settings.paymentSystem
            }
        });
    } catch (error) {
        console.error('Error updating financial settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating financial settings',
            error: error.message
        });
    }
});

// ===== DOWNLINE MANAGEMENT =====

/**
 * @desc    Get downline structure
 * @route   GET /api/admin/v1/downline
 * @access  Private (Admin)
 */
exports.getDownlineStructure = asyncHandler(async (req, res) => {
    try {
        const { coachId, level = 3 } = req.query;

        const downlineData = await buildDownlineStructure(coachId, parseInt(level));

        res.json({
            success: true,
            data: {
                downline: downlineData,
                totalLevels: parseInt(level)
            }
        });
    } catch (error) {
        console.error('Error getting downline structure:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving downline structure',
            error: error.message
        });
    }
});

/**
 * @desc    Get MLM commission reports
 * @route   GET /api/admin/v1/mlm-reports
 * @access  Private (Admin)
 */
exports.getMlmReports = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30, coachId } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        const query = { createdAt: { $gte: startDate } };
        if (coachId) query.recipientId = coachId;

        const commissions = await MlmCommissionDistribution.find(query)
            .populate('recipientId', 'name email')
            .populate('subscriptionId', 'amount status')
            .sort({ createdAt: -1 });

        const totalCommissions = commissions.reduce((sum, comm) => sum + comm.amount, 0);

        res.json({
            success: true,
            data: {
                commissions,
                summary: {
                    totalCommissions,
                    totalDistributions: commissions.length,
                    averageCommission: commissions.length > 0 ? totalCommissions / commissions.length : 0
                },
                timeRange: parseInt(timeRange)
            }
        });
    } catch (error) {
        console.error('Error getting MLM reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving MLM reports',
            error: error.message
        });
    }
});

// ===== PLATFORM CONFIGURATION =====

/**
 * @desc    Get platform configuration
 * @route   GET /api/admin/v1/platform-config
 * @access  Private (Admin)
 */
exports.getPlatformConfig = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne();
        
        const defaultConfig = {
            general: {
                platformName: 'FunnelEye Platform',
                defaultLanguage: 'en',
                timezone: 'Asia/Kolkata',
                currency: 'INR'
            },
            features: {
                mlmEnabled: true,
                aiEnabled: true,
                messagingEnabled: true,
                communityEnabled: true
            },
            limits: {
                maxUsersPerCoach: 100,
                maxCoachesPerAdmin: 50,
                maxSubscriptionDuration: 365
            }
        };

        res.json({
            success: true,
            data: {
                config: settings?.platformConfig || defaultConfig
            }
        });
    } catch (error) {
        console.error('Error getting platform config:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving platform configuration',
            error: error.message
        });
    }
});

/**
 * @desc    Update platform configuration
 * @route   PUT /api/admin/v1/platform-config
 * @access  Private (Admin)
 */
exports.updatePlatformConfig = asyncHandler(async (req, res) => {
    try {
        const { general, features, limits } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'platformConfig.general': general,
                    'platformConfig.features': features,
                    'platformConfig.limits': limits
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Platform configuration updated successfully',
            data: {
                config: settings.platformConfig
            }
        });
    } catch (error) {
        console.error('Error updating platform config:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating platform configuration',
            error: error.message
        });
    }
});

// ===== CONTENT MANAGEMENT =====

/**
 * @desc    Get all coach plans/programs
 * @route   GET /api/admin/v1/content/plans
 * @access  Private (Admin)
 */
exports.getCoachPlans = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;

        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const plans = await CoachPlan.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CoachPlan.countDocuments(query);

        res.json({
            success: true,
            data: {
                plans,
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
        console.error('Error getting coach plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving coach plans',
            error: error.message
        });
    }
});

/**
 * @desc    Create or update coach plan
 * @route   POST /api/admin/v1/content/plans
 * @route   PUT /api/admin/v1/content/plans/:planId
 * @access  Private (Admin)
 */
exports.manageCoachPlan = asyncHandler(async (req, res) => {
    try {
        const { planId } = req.params;
        const planData = req.body;

        let plan;
        if (planId) {
            // Update existing plan
            plan = await CoachPlan.findByIdAndUpdate(
                planId,
                planData,
                { new: true, runValidators: true }
            );
        } else {
            // Create new plan
            plan = await CoachPlan.create(planData);
        }

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }

        res.json({
            success: true,
            message: planId ? 'Plan updated successfully' : 'Plan created successfully',
            data: { plan }
        });
    } catch (error) {
        console.error('Error managing coach plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error managing coach plan',
            error: error.message
        });
    }
});

// ===== MESSAGING & AUTOMATION =====

/**
 * @desc    Get messaging settings
 * @route   GET /api/admin/v1/messaging/settings
 * @access  Private (Admin)
 */
exports.getMessagingSettings = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('messagingSystem');
        
        const defaultSettings = {
            whatsapp: {
                enabled: true,
                provider: 'gupshup',
                apiKey: '',
                templateId: ''
            },
            email: {
                enabled: true,
                provider: 'sendgrid',
                apiKey: '',
                fromEmail: ''
            },
            push: {
                enabled: true,
                provider: 'fcm',
                serverKey: ''
            },
            automation: {
                welcomeSequence: true,
                reminderSequence: true,
                milestoneSequence: true
            }
        };

        res.json({
            success: true,
            data: {
                settings: settings?.messagingSystem || defaultSettings
            }
        });
    } catch (error) {
        console.error('Error getting messaging settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving messaging settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update messaging settings
 * @route   PUT /api/admin/v1/messaging/settings
 * @access  Private (Admin)
 */
exports.updateMessagingSettings = asyncHandler(async (req, res) => {
    try {
        const { whatsapp, email, push, automation } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'messagingSystem.whatsapp': whatsapp,
                    'messagingSystem.email': email,
                    'messagingSystem.push': push,
                    'messagingSystem.automation': automation
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'Messaging settings updated successfully',
            data: {
                settings: settings.messagingSystem
            }
        });
    } catch (error) {
        console.error('Error updating messaging settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating messaging settings',
            error: error.message
        });
    }
});

// ===== SUBSCRIPTION PLANS =====

/**
 * @desc    Get subscription plans
 * @route   GET /api/admin/v1/subscription-plans
 * @access  Private (Admin)
 */
// Removed duplicate getSubscriptionPlans method - using the correct one below

// ===== AI SETTINGS =====

/**
 * @desc    Get AI settings
 * @route   GET /api/admin/v1/ai-settings
 * @access  Private (Admin)
 */
exports.getAiSettings = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne().select('aiSystem');
        
        const defaultSettings = {
            nutritionist: {
                enabled: true,
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 500,
                safetyMode: true
            },
            support: {
                enabled: true,
                escalationThreshold: 3,
                humanHandoff: true
            },
            automation: {
                enabled: true,
                responseDelay: 1000,
                maxRetries: 3
            }
        };

        res.json({
            success: true,
            data: {
                settings: settings?.aiSystem || defaultSettings
            }
        });
    } catch (error) {
        console.error('Error getting AI settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving AI settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update AI settings
 * @route   PUT /api/admin/v1/ai-settings
 * @access  Private (Admin)
 */
exports.updateAiSettings = asyncHandler(async (req, res) => {
    try {
        const { nutritionist, support, automation } = req.body;

        const settings = await AdminSystemSettings.findOneAndUpdate(
            {},
            {
                $set: {
                    'aiSystem.nutritionist': nutritionist,
                    'aiSystem.support': support,
                    'aiSystem.automation': automation
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            success: true,
            message: 'AI settings updated successfully',
            data: {
                settings: settings.aiSystem
            }
        });
    } catch (error) {
        console.error('Error updating AI settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating AI settings',
            error: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====

async function getSystemHealth() {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        const memoryUsage = process.memoryUsage();
        
        return {
            database: dbStatus,
            uptime: process.uptime(),
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
            },
            timestamp: new Date()
        };
    } catch (error) {
        return {
            database: 'error',
            uptime: process.uptime(),
            memory: { used: 0, total: 0 },
            timestamp: new Date(),
            error: error.message
        };
    }
}

async function getUserAnalytics(startDate) {
    try {
        console.log('🔍 [getUserAnalytics] Starting analytics calculation with startDate:', startDate);

        // Count all users for total users (this includes all roles)
        const totalUsers = await User.countDocuments();
        const newUsers = await User.countDocuments({
            createdAt: { $gte: startDate }
        });
        const activeUsers = await User.countDocuments({
            status: 'active'
        });
        const coaches = await User.countDocuments({ role: 'coach' });
        const inactiveUsers = await User.countDocuments({
            status: 'inactive'
        });

        console.log('📊 [getUserAnalytics] Raw counts:', {
            totalUsers,
            newUsers,
            activeUsers,
            coaches,
            inactiveUsers
        });

        // Calculate percentages
        const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
        const coachPercentage = totalUsers > 0 ? ((coaches / totalUsers) * 100).toFixed(1) : 0;
        const growthRate = totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0;

        const result = {
            totalUsers,
            newUsersThisMonth: newUsers,
            activeUsers,
            activePercentage,
            coaches,
            coachPercentage,
            inactiveUsers,
            growthRate
        };

        console.log('📈 [getUserAnalytics] Final analytics:', result);

        return result;
    } catch (error) {
        console.error('❌ [getUserAnalytics] Error:', error);
        throw error;
    }
}

async function getRevenueAnalytics(startDate) {
    const revenueData = await Subscription.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                totalSubscriptions: { $sum: 1 },
                averageRevenue: { $avg: '$amount' }
            }
        }
    ]);

    return revenueData.length > 0 ? revenueData[0] : {
        totalRevenue: 0,
        totalSubscriptions: 0,
        averageRevenue: 0
    };
}

async function getCoachAnalytics(startDate) {
    const totalCoaches = await User.countDocuments({ role: 'coach' });
    const activeCoaches = await User.countDocuments({ 
        role: 'coach', 
        lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    });
    const newCoaches = await User.countDocuments({ 
        role: 'coach', 
        createdAt: { $gte: startDate } 
    });

    return {
        totalCoaches,
        activeCoaches,
        newCoaches,
        utilizationRate: totalCoaches > 0 ? ((activeCoaches / totalCoaches) * 100).toFixed(2) : 0
    };
}

async function getSubscriptionAnalytics(startDate) {
    const subscriptionData = await Subscription.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    return {
        byStatus: subscriptionData,
        totalSubscriptions: subscriptionData.reduce((sum, item) => sum + item.count, 0)
    };
}

async function buildDownlineStructure(coachId, maxLevel) {
    if (!coachId) return null;

    const coach = await User.findById(coachId).select('name email');
    if (!coach) return null;

    const downline = {
        coach: coach,
        level: 0,
        children: []
    };

    // Recursively build downline structure
    await buildDownlineRecursive(coachId, downline, 1, maxLevel);
    
    return downline;
}

async function buildDownlineRecursive(parentId, parentNode, currentLevel, maxLevel) {
    if (currentLevel > maxLevel) return;

    const children = await User.find({ 
        referralId: parentId,
        role: { $in: ['coach', 'user'] }
    }).select('name email role');

    for (const child of children) {
        const childNode = {
            coach: child,
            level: currentLevel,
            children: []
        };

        if (child.role === 'coach' && currentLevel < maxLevel) {
            await buildDownlineRecursive(child._id, childNode, currentLevel + 1, maxLevel);
        }

        parentNode.children.push(childNode);
    }
}

// ===== ADMIN AUTHENTICATION METHODS =====
// NOTE: Admin login/logout functionality has been moved to adminAuthController.js
// Use /api/admin/auth/login and /api/admin/auth/logout instead of /api/admin/v1/auth/*

/**
 * @desc    Get current admin profile
 * @route   GET /api/admin/v1/auth/profile
 * @access  Private (Admin)
 */
exports.getAdminProfile = asyncHandler(async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.admin.id).select('-password -passwordHistory');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: admin.toSafeObject()
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// ===== SYSTEM MANAGEMENT METHODS =====

/**
 * @desc    Get system health
 * @route   GET /api/admin/v1/system/health
 * @access  Private (Admin)
 */
exports.getSystemHealth = asyncHandler(async (req, res) => {
    try {
        const health = await getSystemHealth();
        res.json({
            success: true,
            message: 'System health retrieved successfully',
            data: health
        });
    } catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system health',
            error: error.message
        });
    }
});

/**
 * @desc    Get global settings
 * @route   GET /api/admin/v1/settings
 * @access  Private (Admin)
 */
exports.getGlobalSettings = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminV1Settings.getGlobalSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error getting global settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving global settings',
            error: error.message
        });
    }
});

/**
 * @desc    Update global settings
 * @route   PUT /api/admin/v1/settings/:section
 * @access  Private (Admin)
 */
exports.updateGlobalSettings = asyncHandler(async (req, res) => {
    try {
        const { section } = req.params;
        const updateData = req.body;
        const adminId = req.admin.id;
        const adminEmail = req.admin.email;

        const allowedSections = [
            'platformConfig', 'paymentSystem', 'mlmSystem', 
            'security', 'messagingSystem', 'aiSystem',
            'notifications', 'integrations'
        ];

        if (!allowedSections.includes(section)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid settings section'
            });
        }

        const settings = await AdminV1Settings.updateGlobalSettings(
            section, 
            updateData, 
            adminId, 
            adminEmail, 
            req
        );

        res.json({
            success: true,
            message: `${section} settings updated successfully`,
            data: settings[section]
        });
    } catch (error) {
        console.error('Error updating global settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating global settings',
            error: error.message
        });
    }
});

// ===== AUDIT LOGS METHODS =====

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/v1/audit-logs
 * @access  Private (Admin)
 */
exports.getAuditLogs = asyncHandler(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            action,
            category,
            severity,
            adminEmail,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};
        if (action && action !== 'all') query.action = action;
        if (category && category !== 'all') query.category = category;
        if (severity && severity !== 'all') query.severity = severity;
        if (adminEmail) query.adminEmail = { $regex: adminEmail, $options: 'i' };
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const logs = await AdminAuditLog.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await AdminAuditLog.countDocuments(query);
        const pages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    current: parseInt(page),
                    pages,
                    total,
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error getting audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
});

// ===== PRODUCT MANAGEMENT METHODS =====

/**
 * @desc    Get all admin products
 * @route   GET /api/admin/v1/products
 * @access  Private (Admin)
 */
exports.getAdminProducts = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 20, status, category, productType, search } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (productType) query.productType = productType;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const skip = (page - 1) * limit;
        
        const products = await AdminProduct.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        
        const total = await AdminProduct.countDocuments(query);
        
        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNextPage: skip + products.length < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error getting admin products:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting admin products',
            error: error.message
        });
    }
});

/**
 * @desc    Create admin product
 * @route   POST /api/admin/v1/products
 * @access  Private (Admin)
 */
exports.createAdminProduct = asyncHandler(async (req, res) => {
    try {
        const productData = req.body;
        productData.createdBy = req.admin.id;
        
        const product = new AdminProduct(productData);
        await product.save();
        
        res.status(201).json({
            success: true,
            message: 'Admin product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Error creating admin product:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating admin product',
            error: error.message
        });
    }
});

// ===== SECURITY METHODS =====

/**
 * @desc    Get security incidents
 * @route   GET /api/admin/v1/security/incidents
 * @access  Private (Admin)
 */
exports.getSecurityIncidents = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30, severity } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const query = {
            createdAt: { $gte: startDate },
            category: { $in: ['SECURITY', 'AUTHENTICATION', 'AUTHORIZATION'] }
        };

        if (severity && severity !== 'all') {
            query.severity = severity;
        }

        const incidents = await AdminAuditLog.find(query)
            .populate('adminId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(100);

        const categorizedIncidents = {
            failedLogins: incidents.filter(log => log.action === 'LOGIN_FAILED'),
            suspiciousActivity: incidents.filter(log => log.severity === 'high'),
            unauthorizedAccess: incidents.filter(log => log.action === 'UNAUTHORIZED_ACCESS'),
            other: incidents.filter(log => 
                !['LOGIN_FAILED', 'UNAUTHORIZED_ACCESS'].includes(log.action) && 
                log.severity !== 'high'
            )
        };

        res.json({
            success: true,
            data: {
                incidents: categorizedIncidents,
                totalCount: incidents.length,
                timeRange
            }
        });
    } catch (error) {
        console.error('Error getting security incidents:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving security incidents',
            error: error.message
        });
    }
});

// ===== HIERARCHY REQUEST MANAGEMENT =====

/**
 * @desc    Get hierarchy change requests
 * @route   GET /api/admin/v1/hierarchy-requests
 * @access  Private (Admin)
 */
exports.getHierarchyRequests = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            coachId,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { type: 'hierarchy_change' };
        
        if (status && status !== 'all') query.status = status;
        if (coachId) query.$or = [
            { requesterId: coachId },
            { targetUserId: coachId }
        ];

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const requests = await AdminRequest.find(query)
            .populate('requesterId', 'firstName lastName email role')
            .populate('targetUserId', 'firstName lastName email role')
            .populate('adminId', 'firstName lastName email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AdminRequest.countDocuments(query);

        // Get statistics
        const stats = await AdminRequest.aggregate([
            { $match: { type: 'hierarchy_change' } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    limit: parseInt(limit)
                },
                statistics: {
                    totalRequests: total,
                    statusDistribution: statusStats,
                    pendingRequests: statusStats.pending || 0,
                    approvedRequests: statusStats.approved || 0,
                    rejectedRequests: statusStats.rejected || 0
                }
            }
        });
    } catch (error) {
        console.error('Error getting hierarchy requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving hierarchy requests',
            error: error.message
        });
    }
});

/**
 * @desc    Process hierarchy change request
 * @route   PUT /api/admin/v1/hierarchy-requests/:requestId
 * @access  Private (Admin)
 */
exports.processHierarchyRequest = asyncHandler(async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, notes } = req.body;
        const adminId = req.admin.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either approved or rejected'
            });
        }

        const request = await AdminRequest.findById(requestId)
            .populate('requesterId', 'firstName lastName email')
            .populate('targetUserId', 'firstName lastName email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Hierarchy request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request has already been processed'
            });
        }

        // Update request
        request.status = status;
        request.adminNotes = notes;
        request.processedAt = new Date();
        request.processedBy = adminId;

        await request.save();

        // If approved, update user hierarchy
        if (status === 'approved') {
            const targetUser = await User.findById(request.targetUserId._id);
            if (targetUser) {
                targetUser.referralId = request.requesterId._id;
                targetUser.currentLevel = request.requestedLevel || 1;
                await targetUser.save();
            }
        }

        // Create audit log
        await createAuditLog(adminId, 'PROCESS_HIERARCHY_REQUEST', {
            description: `Hierarchy request ${status}: ${request.requesterId.firstName} ${request.requesterId.lastName} -> ${request.targetUserId.firstName} ${request.targetUserId.lastName}`,
            severity: 'medium',
            status: 'success',
            changes: {
                requestId: request._id,
                status: status,
                notes: notes
            }
        }, req);

        res.json({
            success: true,
            message: `Hierarchy request ${status} successfully`,
            data: request
        });
    } catch (error) {
        console.error('Error processing hierarchy request:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing hierarchy request',
            error: error.message
        });
    }
});

/**
 * @desc    Create hierarchy change request (for coaches)
 * @route   POST /api/admin/v1/hierarchy-requests
 * @access  Private (Coach)
 */
exports.createHierarchyRequest = asyncHandler(async (req, res) => {
    try {
        const { targetUserId, requestedLevel, reason } = req.body;
        const requesterId = req.user.id;

        if (!targetUserId || !requestedLevel) {
            return res.status(400).json({
                success: false,
                message: 'Target user ID and requested level are required'
            });
        }

        // Check if user is coach
        const requester = await User.findById(requesterId);
        if (requester.role !== 'coach') {
            return res.status(403).json({
                success: false,
                message: 'Only coaches can create hierarchy requests'
            });
        }

        // Check if target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }

        // Check for existing pending request
        const existingRequest = await AdminRequest.findOne({
            requesterId,
            targetUserId,
            type: 'hierarchy_change',
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'A pending hierarchy request already exists for this user'
            });
        }

        // Create request
        const request = new AdminRequest({
            requesterId,
            targetUserId,
            type: 'hierarchy_change',
            requestedLevel,
            reason,
            status: 'pending',
            createdAt: new Date()
        });

        await request.save();

        // Populate for response
        await request.populate('requesterId', 'firstName lastName email');
        await request.populate('targetUserId', 'firstName lastName email');

        res.status(201).json({
            success: true,
            message: 'Hierarchy request created successfully',
            data: request
        });
    } catch (error) {
        console.error('Error creating hierarchy request:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating hierarchy request',
            error: error.message
        });
    }
});

// ===== HELPER FUNCTIONS =====
// NOTE: generateToken function has been moved to adminAuthController.js to avoid duplication

// Removed duplicate getSubscriptionPlans method - using the correct one below

/**
 * @desc    Create a new user
 * @route   POST /api/admin/v1/users
 * @access  Private (Admin)
 */
exports.createUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, password, role = 'user', status = 'active', coachId, notes } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            status,
            coachId,
            notes,
            isVerified: true // Admin-created users are pre-verified
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
});

/**
 * @desc    Bulk update users
 * @route   POST /api/admin/v1/users/bulk-update
 * @access  Private (Admin)
 */
exports.bulkUpdateUsers = asyncHandler(async (req, res) => {
    try {
        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Updates array is required and must not be empty'
            });
        }

        const results = [];
        const errors = [];

        for (const update of updates) {
            try {
                const { userId, ...updateData } = update;
                
                if (!userId) {
                    errors.push({ userId: 'unknown', error: 'User ID is required' });
                    continue;
                }

                const user = await User.findByIdAndUpdate(
                    userId,
                    { $set: updateData },
                    { new: true, runValidators: true }
                );

                if (!user) {
                    errors.push({ userId, error: 'User not found' });
                    continue;
                }

                const userResponse = user.toObject();
                delete userResponse.password;
                results.push(userResponse);
            } catch (error) {
                errors.push({ userId: update.userId, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Bulk update completed. ${results.length} users updated successfully.`,
            data: {
                updated: results,
                errors: errors
            }
        });
    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk update',
            error: error.message
        });
    }
});

/**
 * @desc    Export users data
 * @route   GET /api/admin/v1/users/export
 * @access  Private (Admin)
 */
exports.exportUsers = asyncHandler(async (req, res) => {
    try {
        const { format = 'csv', includeDeleted = false } = req.query;

        // Build query
        const query = {};
        if (includeDeleted !== 'true') {
            query.deletedAt = null;
        }

        // Get users
        const users = await User.find(query).select('-password').lean();

        if (format === 'csv') {
            // Convert to CSV
            const csvHeaders = 'Name,Email,Phone,Role,Status,Created At,Last Login,Coach ID,Notes\n';
            const csvRows = users.map(user => {
                return [
                    user.name || '',
                    user.email || '',
                    user.phone || '',
                    user.role || '',
                    user.status || '',
                    user.createdAt ? new Date(user.createdAt).toISOString() : '',
                    user.lastLogin ? new Date(user.lastLogin).toISOString() : '',
                    user.coachId || '',
                    user.notes || ''
                ].map(field => `"${field}"`).join(',');
            }).join('\n');

            const csvContent = csvHeaders + csvRows;

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);
        } else {
            // Return JSON
            res.json({
                success: true,
                message: 'Users exported successfully',
                data: {
                    users,
                    total: users.length,
                    exportedAt: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting users',
            error: error.message
        });
    }
});

/**
 * @desc    Bulk delete users
 * @route   POST /api/admin/v1/users/bulk-delete
 * @access  Private (Admin)
 */
exports.bulkDeleteUsers = asyncHandler(async (req, res) => {
    try {
        const { userIds, permanent = false } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'User IDs array is required and must not be empty'
            });
        }

        const results = [];
        const errors = [];

        for (const userId of userIds) {
            try {
                let user;
                
                if (permanent) {
                    // Permanently delete user
                    user = await User.findByIdAndDelete(userId);
                } else {
                    // Soft delete user
                    user = await User.findByIdAndUpdate(
                        userId,
                        { $set: { deletedAt: new Date() } },
                        { new: true }
                    );
                }

                if (!user) {
                    errors.push({ userId, error: 'User not found' });
                    continue;
                }

                results.push({
                    userId,
                    email: user.email,
                    deletedAt: permanent ? 'permanently deleted' : user.deletedAt
                });
            } catch (error) {
                errors.push({ userId, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Bulk delete completed. ${results.length} users ${permanent ? 'permanently deleted' : 'soft deleted'} successfully.`,
            data: {
                deleted: results,
                errors: errors,
                permanent
            }
        });
    } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing bulk delete',
            error: error.message
        });
    }
});

async function createAuditLog(adminId, action, details, req) {
    try {
        let adminEmail = 'unknown';
        let adminRole = 'unknown';
        
        if (adminId) {
            const admin = await AdminUser.findById(adminId);
            if (admin) {
                adminEmail = admin.email;
                adminRole = admin.role;
            }
        }

        const logId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        await AdminAuditLog.create({
            logId,
            adminId: adminId || null,
            adminEmail,
            adminRole,
            action,
            category: 'AUTHENTICATION',
            description: details.description,
            severity: details.severity || 'medium',
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            method: req.method,
            status: details.status || 'success',
            errorMessage: details.errorMessage,
            metadata: {
                browser: req.get('User-Agent'),
                sessionId: req.sessionID
            }
        });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
}

// ========================================
// FINANCIAL MANAGEMENT METHODS
// ========================================

/**
 * @desc    Get financial settings
 * @route   GET /api/admin/v1/financial/settings
 * @access  Private (Admin)
 */
exports.getFinancialSettings = asyncHandler(async (req, res) => {
    try {
        // Get financial settings from AdminV1Settings
        let settings = await AdminV1Settings.findOne({ settingId: 'financial' });
        
        if (!settings) {
            // Create default settings if none exist
            settings = await AdminV1Settings.findOneAndUpdate(
                { settingId: 'financial' },
                {
                    settingId: 'financial',
                    paymentSystem: {
                        razorpay: {
                            keyId: '',
                            keySecret: '',
                            accountNumber: '',
                            webhookSecret: '',
                            isEnabled: false
                        },
                        platformFees: {
                            subscriptionFee: 5.0,
                            transactionFee: 2.0,
                            payoutFee: 1.0,
                            refundFee: 0.5
                        },
                        mlmCommissionStructure: {
                            levels: [
                                { level: 1, percentage: 10 },
                                { level: 2, percentage: 5 },
                                { level: 3, percentage: 3 }
                            ],
                            platformFeePercentage: 5,
                            maxLevels: 3,
                            autoPayoutEnabled: true,
                            payoutThreshold: 100
                        }
                    }
                },
                { upsert: true, new: true }
            );
        }

        // Return the financial settings in the expected format
        const financialData = {
            razorpayApiKey: settings.paymentSystem?.razorpay?.keyId || '',
            razorpaySecret: settings.paymentSystem?.razorpay?.keySecret || '',
            platformFee: settings.paymentSystem?.platformFees?.subscriptionFee || 5.0,
            mlmCommission: settings.paymentSystem?.mlmCommissionStructure?.platformFeePercentage || 10.0,
            payoutFrequency: 'weekly',
            payoutDay: 'monday',
            payoutTime: '09:00',
            taxRate: settings.paymentSystem?.taxSettings?.gstPercentage || 18.0,
            upiEnabled: true,
            bankTransferEnabled: true,
            minimumPayoutAmount: settings.paymentSystem?.mlmCommissionStructure?.payoutThreshold || 100
        };

        res.json({
            success: true,
            data: financialData
        });
    } catch (error) {
        console.error('Error getting financial settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving financial settings'
        });
    }
});

/**
 * @desc    Update financial settings
 * @route   PUT /api/admin/v1/financial/settings
 * @access  Private (Admin)
 */
exports.updateFinancialSettings = asyncHandler(async (req, res) => {
    try {
        const {
            razorpayApiKey,
            razorpaySecret,
            platformFee,
            mlmCommission,
            payoutFrequency,
            payoutDay,
            payoutTime,
            taxRate,
            upiEnabled,
            bankTransferEnabled,
            minimumPayoutAmount
        } = req.body;

        // Validate required fields
        if (platformFee < 0 || platformFee > 100) {
            return res.status(400).json({
                success: false,
                message: 'Platform fee must be between 0 and 100'
            });
        }

        if (mlmCommission < 0 || mlmCommission > 100) {
            return res.status(400).json({
                success: false,
                message: 'MLM commission must be between 0 and 100'
            });
        }

        if (taxRate < 0 || taxRate > 100) {
            return res.status(400).json({
                success: false,
                message: 'Tax rate must be between 0 and 100'
            });
        }

        if (minimumPayoutAmount < 0) {
            return res.status(400).json({
                success: false,
                message: 'Minimum payout amount must be positive'
            });
        }

        // Update or create financial settings
        const settings = await AdminV1Settings.findOneAndUpdate(
            { settingId: 'financial' },
            {
                $set: {
                    'paymentSystem.razorpay.keyId': razorpayApiKey || '',
                    'paymentSystem.razorpay.keySecret': razorpaySecret || '',
                    'paymentSystem.platformFees.subscriptionFee': parseFloat(platformFee) || 5.0,
                    'paymentSystem.mlmCommissionStructure.platformFeePercentage': parseFloat(mlmCommission) || 10.0,
                    'paymentSystem.mlmCommissionStructure.payoutThreshold': parseInt(minimumPayoutAmount) || 100,
                    'paymentSystem.taxSettings.gstPercentage': parseFloat(taxRate) || 18.0
                }
            },
            { upsert: true, new: true }
        );

        // Return the updated settings in the expected format
        const financialData = {
            razorpayApiKey: settings.paymentSystem?.razorpay?.keyId || '',
            razorpaySecret: settings.paymentSystem?.razorpay?.keySecret || '',
            platformFee: settings.paymentSystem?.platformFees?.subscriptionFee || 5.0,
            mlmCommission: settings.paymentSystem?.mlmCommissionStructure?.platformFeePercentage || 10.0,
            payoutFrequency: payoutFrequency || 'weekly',
            payoutDay: payoutDay || 'monday',
            payoutTime: payoutTime || '09:00',
            taxRate: settings.paymentSystem?.taxSettings?.gstPercentage || 18.0,
            upiEnabled: upiEnabled !== undefined ? upiEnabled : true,
            bankTransferEnabled: bankTransferEnabled !== undefined ? bankTransferEnabled : true,
            minimumPayoutAmount: settings.paymentSystem?.mlmCommissionStructure?.payoutThreshold || 100
        };

        res.json({
            success: true,
            message: 'Financial settings updated successfully',
            data: financialData
        });
    } catch (error) {
        console.error('Error updating financial settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating financial settings'
        });
    }
});

/**
 * @desc    Get revenue statistics
 * @route   GET /api/admin/v1/financial/revenue-stats
 * @access  Private (Admin)
 */
exports.getRevenueStats = asyncHandler(async (req, res) => {
    try {
        // Get financial settings for calculations
        const settings = await AdminV1Settings.findOne({ settingId: 'financial' });
        const platformFee = settings?.paymentSystem?.platformFees?.subscriptionFee || 5.0;

        // Check if we have any payments, if not create some sample data
        const paymentCount = await RazorpayPayment.countDocuments({ status: 'captured' });
        if (paymentCount === 0) {
            await createSamplePaymentData();
        }

        // Calculate revenue statistics
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get payment statistics from RazorpayPayment
        const [
            totalPayments,
            dailyPayments,
            weeklyPayments,
            monthlyPayments,
            razorpayBalance
        ] = await Promise.all([
            RazorpayPayment.aggregate([
                { $match: { status: 'captured' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            RazorpayPayment.aggregate([
                { $match: { status: 'captured', createdAt: { $gte: startOfDay } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            RazorpayPayment.aggregate([
                { $match: { status: 'captured', createdAt: { $gte: startOfWeek } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            RazorpayPayment.aggregate([
                { $match: { status: 'captured', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            // Get real Razorpay balance
            (async () => {
                try {
                    const settings = await AdminV1Settings.findOne({ settingId: 'financial' });
                    if (settings?.paymentSystem?.razorpay?.keyId && settings?.paymentSystem?.razorpay?.keySecret) {
                        process.env.RAZORPAY_KEY_ID = settings.paymentSystem.razorpay.keyId;
                        process.env.RAZORPAY_KEY_SECRET = settings.paymentSystem.razorpay.keySecret;
                        const balanceResult = await razorpayService.getAccountBalance();
                        return { balance: balanceResult.success ? balanceResult.balance : 0 };
                    }
                    return { balance: 0 };
                } catch (error) {
                    console.error('Error fetching Razorpay balance for revenue stats:', error);
                    return { balance: 0 };
                }
            })()
        ]);

        const totalRevenue = totalPayments[0]?.total || 0;
        const dailyRevenue = dailyPayments[0]?.total || 0;
        const weeklyRevenue = weeklyPayments[0]?.total || 0;
        const monthlyRevenue = monthlyPayments[0]?.total || 0;
        const platformEarnings = totalRevenue * (platformFee / 100);
        const coachEarnings = totalRevenue - platformEarnings;

        // Calculate actual pending and completed payouts from RazorpayPayment data
        const [pendingPayoutsData, completedPayoutsData] = await Promise.all([
            RazorpayPayment.aggregate([
                { $match: { businessType: 'coach_payout', status: 'pending' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            RazorpayPayment.aggregate([
                { $match: { businessType: 'coach_payout', status: 'captured' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ])
        ]);

        const pendingPayouts = pendingPayoutsData[0]?.total || 0;
        const completedPayouts = completedPayoutsData[0]?.total || 0;

        res.json({
            success: true,
            data: {
                totalRevenue,
                razorpayBalance: razorpayBalance.balance,
                pendingPayouts,
                completedPayouts,
                platformEarnings,
                coachEarnings,
                monthlyRevenue,
                weeklyRevenue,
                dailyRevenue
            }
        });
    } catch (error) {
        console.error('Error getting revenue stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving revenue statistics'
        });
    }
});

/**
 * @desc    Get coaches eligible for payout
 * @route   GET /api/admin/v1/financial/coaches-payout
 * @access  Private (Admin)
 */
exports.getCoachesForPayout = asyncHandler(async (req, res) => {
    try {
        // Get financial settings
        const settings = await AdminV1Settings.findOne({ settingId: 'financial' });
        const minimumPayoutAmount = settings?.paymentSystem?.mlmCommissionStructure?.payoutThreshold || 100;

        // Get coaches with pending amounts
        const coaches = await User.find({ role: 'coach' })
            .select('_id name email phone bankDetails upiDetails')
            .lean();

        // Get platform fee percentage
        const platformFeePercentage = settings?.paymentSystem?.platformFees?.subscriptionFee || 5.0;

        // Calculate actual pending amounts for each coach from RazorpayPayment
        const coachesWithPayouts = await Promise.all(coaches.map(async (coach) => {
            // Calculate coach's total earnings from successful payments
            const totalEarningsData = await RazorpayPayment.aggregate([
                { 
                    $match: { 
                        status: 'captured',
                        $or: [
                            { coachId: coach._id },
                            { userId: coach._id, userType: 'coach' }
                        ]
                    } 
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            // Calculate coach's commission earnings
            const coachEarningsData = await RazorpayPayment.aggregate([
                { 
                    $match: { 
                        status: 'captured',
                        $or: [
                            { coachId: coach._id },
                            { userId: coach._id, userType: 'coach' }
                        ]
                    } 
                },
                { $group: { _id: null, total: { $sum: '$coachCommission' } } }
            ]);

            const totalEarnings = totalEarningsData[0]?.total || 0;
            const coachCommission = coachEarningsData[0]?.total || 0;
            const platformFeeAmount = totalEarnings * (platformFeePercentage / 100);
            const pendingAmount = coachCommission; // This is what the coach actually gets

            return {
                _id: coach._id,
                name: coach.name,
                email: coach.email,
                phone: coach.phone,
                totalEarnings: totalEarnings,
                platformFeeAmount: platformFeeAmount,
                pendingAmount: pendingAmount,
                bankDetails: coach.bankDetails || null,
                upiDetails: coach.upiDetails || null,
                eligible: pendingAmount >= minimumPayoutAmount
            };
        }));

        // Filter coaches above minimum payout amount
        const eligibleCoaches = coachesWithPayouts.filter(
            coach => coach.pendingAmount >= minimumPayoutAmount
        );

        res.json({
            success: true,
            data: eligibleCoaches
        });
    } catch (error) {
        console.error('Error getting coaches for payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving coaches for payout'
        });
    }
});

/**
 * @desc    Get payment and payout history
 * @route   GET /api/admin/v1/financial/payment-history
 * @access  Private (Admin)
 */
exports.getPaymentHistory = asyncHandler(async (req, res) => {
    try {
        // Get recent payments from RazorpayPayment
        const payments = await RazorpayPayment.find({ status: 'captured' })
            .populate('userId', 'name email')
            .populate('coachId', 'name email')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        // Get payout history from RazorpayPayment (coach payouts)
        const payoutHistory = await RazorpayPayment.find({ 
            businessType: 'coach_payout',
            status: 'captured'
        })
        .populate('coachId', 'name email')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

        res.json({
            success: true,
            data: {
                payments: payments.map(payment => ({
                    _id: payment._id,
                    amount: payment.amount,
                    status: payment.status,
                    description: `${payment.businessType} - ${payment.productName || 'Payment'}`,
                    createdAt: payment.createdAt,
                    user: payment.userId?.name || payment.coachId?.name || 'Unknown User'
                })),
                payouts: payoutHistory.map(payout => ({
                    _id: payout._id,
                    coachName: payout.coachId?.name || 'Unknown Coach',
                    amount: payout.amount,
                    status: payout.status,
                    method: payout.paymentMethod || 'bank_transfer',
                    createdAt: payout.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment history'
        });
    }
});

/**
 * @desc    Migrate existing subscription payments to RazorpayPayment records
 * @route   POST /api/admin/v1/financial/migrate-subscription-payments
 * @access  Private (Admin)
 */
exports.migrateSubscriptionPayments = asyncHandler(async (req, res) => {
    try {
        console.log('🔄 [ADMIN] Starting subscription payment migration...');
        
        const CoachSubscription = require('../schema/CoachSubscription');
        const RazorpayPayment = require('../schema/RazorpayPayment');
        
        // Find all coach subscriptions with payment history
        const subscriptions = await CoachSubscription.find({
            'paymentHistory': { $exists: true, $ne: [] }
        }).populate('planId', 'name price currency').populate('coachId', 'name email');
        
        console.log(`📊 [ADMIN] Found ${subscriptions.length} subscriptions with payment history`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const subscription of subscriptions) {
            for (const payment of subscription.paymentHistory) {
                // Check if RazorpayPayment record already exists
                const existingPayment = await RazorpayPayment.findOne({
                    razorpayPaymentId: payment.razorpayPaymentId
                });
                
                if (existingPayment) {
                    console.log(`⏭️ [ADMIN] Skipping existing payment: ${payment.razorpayPaymentId}`);
                    skippedCount++;
                    continue;
                }
                
                // Create RazorpayPayment record
                const razorpayPayment = new RazorpayPayment({
                    razorpayOrderId: payment.razorpayOrderId,
                    razorpayPaymentId: payment.razorpayPaymentId,
                    amount: payment.amount,
                    currency: payment.currency || 'INR',
                    status: payment.status === 'success' ? 'captured' : 'failed',
                    businessType: 'platform_subscription',
                    userId: subscription.coachId._id,
                    userType: 'coach',
                    coachId: subscription.coachId._id,
                    productType: 'subscription',
                    productName: `${subscription.planId?.name || 'Unknown Plan'} Subscription`,
                    productDescription: `Subscription payment for ${subscription.planId?.name || 'Unknown Plan'}`,
                    paymentMethod: 'other', // Razorpay is the gateway, not the payment method
                    razorpayResponse: {
                        order_id: payment.razorpayOrderId,
                        payment_id: payment.razorpayPaymentId,
                        signature: payment.razorpaySignature
                    },
                    // For subscription payments, the full amount goes to platform (no coach commission)
                    coachCommission: 0,
                    platformFee: payment.amount,
                    netAmount: payment.amount,
                    createdAt: payment.paymentDate || subscription.createdAt,
                    updatedAt: payment.paymentDate || subscription.createdAt
                });
                
                await razorpayPayment.save();
                migratedCount++;
                console.log(`✅ [ADMIN] Migrated payment: ${payment.razorpayPaymentId}`);
            }
        }
        
        console.log(`🎉 [ADMIN] Migration completed. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
        
        res.json({
            success: true,
            message: 'Subscription payments migration completed',
            data: {
                totalSubscriptions: subscriptions.length,
                migratedPayments: migratedCount,
                skippedPayments: skippedCount
            }
        });
        
    } catch (error) {
        console.error('❌ [ADMIN] Error migrating subscription payments:', error);
        res.status(500).json({
            success: false,
            message: 'Error migrating subscription payments',
            error: error.message
        });
    }
});

/**
 * @desc    Process individual coach payout (DEPRECATED - Use /api/paymentsv1/sending/razorpay-payout instead)
 * @route   POST /api/admin/v1/financial/process-payout
 * @access  Private (Admin)
 */
exports.processCoachPayout = asyncHandler(async (req, res) => {
    try {
        const { coachId, amount } = req.body;

        if (!coachId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Coach ID and amount are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Payout amount must be positive'
            });
        }

        // Get coach details
        const coach = await User.findById(coachId).select('name email bankDetails upiDetails');
        if (!coach) {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Process payout (mock implementation)
        // In real implementation, this would:
        // 1. Validate coach's bank/UPI details
        // 2. Call Razorpay payout API
        // 3. Create payout record
        // 4. Update coach's pending amount

        const payoutRecord = {
            coachId,
            coachName: coach.name,
            amount,
            status: 'completed',
            method: coach.bankDetails ? 'bank_transfer' : 'upi',
            processedAt: new Date(),
            transactionId: `payout_${Date.now()}`
        };

        // Log payout activity
        await AdminAuditLog.create({
            adminId: req.admin.id,
            adminEmail: req.admin.email,
            adminRole: req.admin.role || 'admin',
            action: 'PROCESS_PAYOUT',
            category: 'PAYMENT_MANAGEMENT',
            description: `Processed payout of ₹${amount} to ${coach.name}`,
            severity: 'medium',
            targetType: 'coach',
            targetId: coachId,
            targetEmail: coach.email,
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent'),
            requestId: req.id || `req_${Date.now()}`,
            endpoint: req.originalUrl,
            method: req.method,
            status: 'success',
            changes: {
                before: { pendingAmount: coach.pendingAmount },
                after: { payoutAmount: amount, status: 'completed' },
                fieldsChanged: ['payoutAmount', 'status']
            },
            metadata: {
                coachId,
                amount,
                payoutRecord
            }
        });

        res.json({
            success: true,
            message: `Payout of ₹${amount} processed successfully for ${coach.name}`,
            data: payoutRecord
        });
    } catch (error) {
        console.error('Error processing coach payout:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing coach payout'
        });
    }
});

/**
 * @desc    Process payouts for all eligible coaches (DEPRECATED - Use /api/paymentsv1/sending/monthly-razorpay-payouts instead)
 * @route   POST /api/admin/v1/financial/payout-all
 * @access  Private (Admin)
 */
exports.processPayoutAll = asyncHandler(async (req, res) => {
    try {
        // Get financial settings
        const settings = await AdminV1Settings.findOne({ settingId: 'financial' });
        const minimumPayoutAmount = settings?.paymentSystem?.mlmCommissionStructure?.payoutThreshold || 100;

        // Get eligible coaches
        const coaches = await User.find({ role: 'coach' })
            .select('_id name email pendingAmount bankDetails upiDetails');

        const eligibleCoaches = coaches.filter(coach => 
            (coach.pendingAmount || 0) >= minimumPayoutAmount
        );

        if (eligibleCoaches.length === 0) {
            return res.json({
                success: true,
                message: 'No coaches eligible for payout',
                data: { processedCount: 0, totalAmount: 0 }
            });
        }

        // Process payouts for all eligible coaches
        const payoutResults = [];
        let totalAmount = 0;

        for (const coach of eligibleCoaches) {
            const amount = coach.pendingAmount || 0;
            totalAmount += amount;

            // Mock payout processing
            const payoutRecord = {
                coachId: coach._id,
                coachName: coach.name,
                amount,
                status: 'completed',
                method: coach.bankDetails ? 'bank_transfer' : 'upi',
                processedAt: new Date(),
                transactionId: `bulk_payout_${Date.now()}_${coach._id}`
            };

            payoutResults.push(payoutRecord);
        }

        // Log bulk payout activity
        await AdminAuditLog.create({
            adminId: req.admin.id,
            adminEmail: req.admin.email,
            adminRole: req.admin.role || 'admin',
            action: 'PROCESS_PAYOUT',
            category: 'PAYMENT_MANAGEMENT',
            description: `Processed bulk payouts for ${eligibleCoaches.length} coaches totaling ₹${totalAmount}`,
            severity: 'high',
            targetType: 'coach',
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent'),
            requestId: req.id || `req_${Date.now()}`,
            endpoint: req.originalUrl,
            method: req.method,
            status: 'success',
            changes: {
                before: { pendingCoaches: eligibleCoaches.length },
                after: { processedCount: eligibleCoaches.length, totalAmount },
                fieldsChanged: ['processedCount', 'totalAmount']
            },
            metadata: {
                processedCount: eligibleCoaches.length,
                totalAmount,
                payoutResults
            }
        });

        res.json({
            success: true,
            message: `Bulk payout processed for ${eligibleCoaches.length} coaches`,
            data: {
                processedCount: eligibleCoaches.length,
                totalAmount,
                payouts: payoutResults
            }
        });
    } catch (error) {
        console.error('Error processing bulk payouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing bulk payouts'
        });
    }
});

/**
 * @desc    Refresh Razorpay balance
 * @route   POST /api/admin/v1/financial/refresh-balance
 * @access  Private (Admin)
 */
exports.refreshRazorpayBalance = asyncHandler(async (req, res) => {
    try {
        // Get Razorpay settings
        const settings = await AdminV1Settings.findOne({ settingId: 'financial' });
        
        if (!settings?.paymentSystem?.razorpay?.keyId || !settings?.paymentSystem?.razorpay?.keySecret) {
            return res.status(400).json({
                success: false,
                message: 'Razorpay credentials not configured. Please configure Razorpay API key and secret in Financial Settings.'
            });
        }

        // Set environment variables for Razorpay service
        process.env.RAZORPAY_KEY_ID = settings.paymentSystem.razorpay.keyId;
        process.env.RAZORPAY_KEY_SECRET = settings.paymentSystem.razorpay.keySecret;

        // Get real Razorpay balance
        const balanceResult = await razorpayService.getAccountBalance();
        
        if (!balanceResult.success) {
            return res.status(400).json({
                success: false,
                message: `Failed to fetch Razorpay balance: ${balanceResult.error}`
            });
        }

        res.json({
            success: true,
            message: 'Razorpay balance refreshed successfully',
            data: {
                balance: balanceResult.balance, // Already converted from paise to rupees in service
                currency: balanceResult.currency || 'INR',
                accountId: balanceResult.accountId,
                accountName: balanceResult.accountName,
                refreshedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error refreshing Razorpay balance:', error);
        res.status(500).json({
            success: false,
            message: 'Error refreshing Razorpay balance'
        });
    }
});

// Helper function to create sample payment data
async function createSamplePaymentData() {
    try {
        // Get some coaches to create sample data
        const coaches = await User.find({ role: 'coach' }).limit(5);
        const users = await User.find({ role: { $in: ['user', 'premium'] } }).limit(10);

        if (coaches.length === 0 || users.length === 0) {
            console.log('No coaches or users found for sample data creation');
            return;
        }

        const samplePayments = [];
        const now = new Date();

        // Create sample payments for the last 30 days
        for (let i = 0; i < 50; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];
            const amount = Math.floor(Math.random() * 5000) + 500; // ₹500 to ₹5500
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

            const platformCommission = amount * 0.05; // 5% platform fee
            const coachCommission = amount * 0.10; // 10% coach commission

            samplePayments.push({
                razorpayOrderId: `order_${Date.now()}_${i}`,
                razorpayPaymentId: `pay_${Date.now()}_${i}`,
                amount: amount,
                currency: 'INR',
                status: 'captured',
                businessType: 'coach_plan_purchase',
                userId: randomUser._id,
                userType: 'customer',
                coachId: randomCoach._id,
                productName: `Sample Plan ${i + 1}`,
                productDescription: 'Sample product for demonstration',
                commissionAmount: coachCommission,
                platformCommission: platformCommission,
                coachCommission: coachCommission,
                paymentMethod: ['card', 'netbanking', 'upi'][Math.floor(Math.random() * 3)],
                createdAt: createdAt,
                capturedAt: createdAt
            });
        }

        // Create some coach payouts
        for (let i = 0; i < 10; i++) {
            const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];
            const amount = Math.floor(Math.random() * 3000) + 1000; // ₹1000 to ₹4000
            const daysAgo = Math.floor(Math.random() * 15);
            const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

            samplePayments.push({
                razorpayOrderId: `payout_order_${Date.now()}_${i}`,
                razorpayPaymentId: `payout_${Date.now()}_${i}`,
                amount: amount,
                currency: 'INR',
                status: 'captured',
                businessType: 'coach_payout',
                userId: randomCoach._id,
                userType: 'coach',
                coachId: randomCoach._id,
                productName: 'Coach Payout',
                productDescription: 'Monthly coach commission payout',
                commissionAmount: 0,
                platformCommission: 0,
                coachCommission: amount,
                paymentMethod: 'bank_transfer',
                createdAt: createdAt,
                capturedAt: createdAt
            });
        }

        await RazorpayPayment.insertMany(samplePayments);
        console.log('✅ Sample payment data created successfully');
    } catch (error) {
        console.error('❌ Error creating sample payment data:', error);
    }
}

// ========================================
// SUBSCRIPTION PLAN MANAGEMENT METHODS
// ========================================

const { ContentCourse } = require('../schema/contentSchemas');

const toInt = (value, fallback = 0) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toFloat = (value, fallback = 0) => {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeBoolean = (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
    }
    if (typeof value === 'number') {
        return value === 1;
    }
    return fallback;
};

const buildFeaturePayload = (features = {}, limits = {}) => ({
    // Map limit values to features (since UI shows them in limits but schema stores in features)
    maxFunnels: toInt(limits.maxFunnels !== undefined ? limits.maxFunnels : features.maxFunnels, -1),
    maxStaff: toInt(limits.maxStaff !== undefined ? limits.maxStaff : features.maxStaff, 2),
    maxDevices: toInt(limits.maxDevices !== undefined ? limits.maxDevices : features.maxDevices, 1),
    automationRules: toInt(limits.automationRules !== undefined ? limits.automationRules : features.automationRules, 10),
    emailCredits: toInt(limits.emailCredits !== undefined ? limits.emailCredits : features.emailCredits, 1000),
    smsCredits: toInt(limits.smsCredits !== undefined ? limits.smsCredits : features.smsCredits, 100),
    storageGB: toInt(limits.storageGB !== undefined ? limits.storageGB : features.storageGB, 10),
    // Boolean features
    aiFeatures: normalizeBoolean(features.aiFeatures),
    advancedAnalytics: normalizeBoolean(features.advancedAnalytics),
    prioritySupport: normalizeBoolean(features.prioritySupport),
    customDomain: normalizeBoolean(features.customDomain),
    apiAccess: normalizeBoolean(features.apiAccess),
    whiteLabel: normalizeBoolean(features.whiteLabel),
    integrations: Array.isArray(features.integrations) ? features.integrations : [],
    customBranding: normalizeBoolean(features.customBranding),
    advancedReporting: normalizeBoolean(features.advancedReporting),
    webhooks: normalizeBoolean(features.webhooks),
    whatsappAutomation: normalizeBoolean(features.whatsappAutomation),
    emailAutomation: normalizeBoolean(features.emailAutomation)
});

const buildLimitsPayload = (limits = {}) => ({
    maxLeads: toInt(limits.maxLeads, -1),
    maxAppointments: toInt(limits.maxAppointments, 50),
    maxCampaigns: toInt(limits.maxCampaigns, 5),
    maxAutomationRules: toInt(limits.maxAutomationRules, 10),
    maxWhatsAppMessages: toInt(limits.maxWhatsAppMessages, 100),
    maxEmailTemplates: toInt(limits.maxEmailTemplates, 10),
    maxLandingPages: toInt(limits.maxLandingPages, 5),
    maxWebinars: toInt(limits.maxWebinars, 2),
    maxForms: toInt(limits.maxForms, 10),
    maxSequences: toInt(limits.maxSequences, 5),
    maxTags: toInt(limits.maxTags, 50),
    maxCustomFields: toInt(limits.maxCustomFields, 20),
    maxResellCourses: toInt(limits.maxResellCourses, 0),
    maxCourseSeats: toInt(limits.maxCourseSeats, 0),
    maxSharedTemplates: toInt(limits.maxSharedTemplates, 0),
    maxAutomationWorkflows: toInt(limits.maxAutomationWorkflows, 0),
    maxCourseExports: toInt(limits.maxCourseExports, 0)
});

const buildCourseAccessPayload = (courseAccess = {}) => ({
    allowCourseLibrary: normalizeBoolean(courseAccess.allowCourseLibrary),
    allowResell: normalizeBoolean(courseAccess.allowResell),
    allowContentRemix: normalizeBoolean(courseAccess.allowContentRemix),
    allowCustomPricing: normalizeBoolean(courseAccess.allowCustomPricing),
    allowCourseAssetDownload: normalizeBoolean(courseAccess.allowCourseAssetDownload),
    includeMarketingKits: normalizeBoolean(courseAccess.includeMarketingKits),
    maxActiveResellCourses: toInt(courseAccess.maxActiveResellCourses, 0),
    defaultRevenueSharePercent: toFloat(courseAccess.defaultRevenueSharePercent, 0),
    minMarkupPercent: toFloat(courseAccess.minMarkupPercent, 0),
    maxMarkupPercent: toFloat(courseAccess.maxMarkupPercent, 0),
    resellPayoutFrequency: courseAccess.resellPayoutFrequency || 'monthly',
    allowCouponCreation: normalizeBoolean(courseAccess.allowCouponCreation),
    allowPrivateBundles: normalizeBoolean(courseAccess.allowPrivateBundles)
});

const buildAddonsPayload = (addons = {}) => ({
    allowAddonPurchases: normalizeBoolean(addons.allowAddonPurchases),
    availableAddons: Array.isArray(addons.availableAddons)
        ? addons.availableAddons
            .filter((addon) => addon && addon.name)
            .map((addon) => ({
                name: addon.name.trim(),
                description: addon.description ? addon.description.trim() : '',
                price: toFloat(addon.price, 0),
                billingCycle: addon.billingCycle || 'one-time'
            }))
        : []
});

const buildCourseBundlesPayload = async (bundles = []) => {
    if (!Array.isArray(bundles) || bundles.length === 0) {
        return [];
    }

    const courseIds = bundles
        .map((bundle) => bundle && bundle.course)
        .filter(Boolean)
        .map((id) => mongoose.Types.ObjectId.isValid(id) ? id : null)
        .filter(Boolean);

    if (!courseIds.length) {
        return [];
    }

    const courses = await ContentCourse.find({
        _id: { $in: courseIds }
    }).select('_id');

    const existingIds = new Set(courses.map((course) => course._id.toString()));

    return bundles
        .filter((bundle) => bundle && existingIds.has(String(bundle.course)))
        .map((bundle) => ({
            course: bundle.course,
            allowResell: normalizeBoolean(bundle.allowResell, true),
            allowContentRemix: normalizeBoolean(bundle.allowContentRemix, true),
            allowCustomPricing: normalizeBoolean(bundle.allowCustomPricing, true),
            suggestedResellPrice: toFloat(bundle.suggestedResellPrice, undefined),
            minimumResellPrice: toFloat(bundle.minimumResellPrice, undefined),
            maximumResellPrice: toFloat(bundle.maximumResellPrice, undefined),
            marketingKitIncluded: normalizeBoolean(bundle.marketingKitIncluded),
            marketingAssets: Array.isArray(bundle.marketingAssets)
                ? bundle.marketingAssets.filter(Boolean).map((asset) => asset.trim())
                : [],
            includedModules: Array.isArray(bundle.includedModules)
                ? bundle.includedModules.filter(Boolean).map((module) => module.trim())
                : [],
            deliveryNotes: bundle.deliveryNotes ? bundle.deliveryNotes.toString().trim() : undefined
        }));
};

const buildFunnelBundlesPayload = (bundles = []) => {
    if (!Array.isArray(bundles) || bundles.length === 0) {
        return [];
    }

    const AdminFunnel = require('../schema/AdminFunnel');

    return bundles
        .filter((bundle) => bundle && bundle.funnel)
        .map((bundle) => {
            const funnelId = bundle.funnel?._id || bundle.funnel?.id || bundle.funnel;
            
            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(funnelId)) {
                return null;
            }

            return {
                funnel: funnelId,
                funnelName: bundle.funnelName || bundle.funnel?.name || '',
                funnelUrl: bundle.funnelUrl || bundle.funnel?.funnelUrl || '',
                targetAudience: bundle.targetAudience || bundle.funnel?.targetAudience || 'customer',
                stageCount: toInt(bundle.stageCount || bundle.funnel?.stageCount || bundle.funnel?.stages?.length || 0, 0)
            };
        })
        .filter(Boolean); // Remove null entries
};

/**
 * @desc    Create new subscription plan
 * @route   POST /api/admin/v1/subscription-plans
 * @access  Private (Admin)
 */
exports.createSubscriptionPlan = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            currency = 'INR',
            billingCycle,
            duration,
            features = {},
            limits = {},
            courseAccess = {},
            courseBundles = [],
            addons = {},
            isPopular = false,
            trialDays = 0,
            setupFee = 0,
            sortOrder = 0,
            category = 'professional',
            tags = [],
            restrictions = {},
            pricing = {}
        } = req.body;

        // Validate required fields
        if (!name || !description || !price || !billingCycle || !duration) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, price, billingCycle, and duration are required'
            });
        }

        // Validate billing cycle
        const validBillingCycles = ['monthly', 'quarterly', 'yearly'];
        if (!validBillingCycles.includes(billingCycle)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid billing cycle. Must be monthly, quarterly, or yearly'
            });
        }

        const normalizedCourseBundles = await buildCourseBundlesPayload(courseBundles);
        const normalizedFunnelBundles = buildFunnelBundlesPayload(req.body.funnelBundles || []);

        // Create subscription plan
        const planData = {
            name,
            description,
            price,
            currency,
            billingCycle,
            duration,
            features: buildFeaturePayload(features, limits), // Pass limits to map limit values to features
            limits: buildLimitsPayload(limits),
            courseBundles: normalizedCourseBundles,
            funnelBundles: normalizedFunnelBundles,
            courseAccess: buildCourseAccessPayload(courseAccess),
            addons: buildAddonsPayload(addons),
            isPopular,
            trialDays,
            setupFee,
            sortOrder,
            category,
            tags,
            restrictions,
            createdBy: req.admin.id,
            pricing: {
                basePrice: toFloat(pricing.basePrice, price),
                setupFee: toFloat(pricing.setupFee, setupFee),
                annualDiscount: toFloat(pricing.annualDiscount, 0),
                currency: pricing.currency || currency
            }
        };

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        
        console.log('🔍 [DEBUG] Creating plan with data:', planData);
        const plan = await SubscriptionPlan.create(planData);
        console.log('🔍 [DEBUG] Plan created successfully:', plan);

        const populatedPlan = await SubscriptionPlan.findById(plan._id)
            .populate('createdBy', 'firstName lastName email')
            .populate('courseBundles.course', 'title thumbnail price currency category')
            .populate('funnelBundles.funnel', 'name description funnelUrl targetAudience stages');

        res.status(201).json({
            success: true,
            data: populatedPlan,
            message: 'Subscription plan created successfully'
        });

    } catch (error) {
        console.error('Error creating subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating subscription plan',
            error: error.message
        });
    }
});

/**
 * @desc    Get all subscription plans with filtering and pagination
 * @route   GET /api/admin/v1/subscription-plans
 * @access  Private (Admin)
 */
/**
 * @desc    Debug endpoint to test SubscriptionPlan model
 * @route   GET /api/admin/v1/debug/subscription-plans
 * @access  Private (Admin)
 */
exports.debugSubscriptionPlans = asyncHandler(async (req, res) => {
    try {
        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        
        console.log('🔍 [DEBUG] Testing SubscriptionPlan model...');
        
        // Test 1: Check if model exists
        console.log('🔍 [DEBUG] SubscriptionPlan model:', typeof SubscriptionPlan);
        
        // Test 2: Check total count
        const totalCount = await SubscriptionPlan.countDocuments({});
        console.log('🔍 [DEBUG] Total plans in database:', totalCount);
        
        // Test 3: Get all plans without any filters
        const allPlans = await SubscriptionPlan.find({});
        console.log('🔍 [DEBUG] All plans found:', allPlans.length);
        console.log('🔍 [DEBUG] All plans data:', allPlans);
        
        // Test 4: Check database connection
        const dbState = SubscriptionPlan.db.readyState;
        console.log('🔍 [DEBUG] Database connection state:', dbState);
        
        res.json({
            success: true,
            debug: {
                modelType: typeof SubscriptionPlan,
                totalCount,
                allPlansCount: allPlans.length,
                allPlans: allPlans,
                dbState,
                dbName: SubscriptionPlan.db.name
            }
        });
        
    } catch (error) {
        console.error('🔍 [DEBUG] Error in debug endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

exports.getSubscriptionPlans = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            search, 
            category,
            sortBy = 'sortOrder', 
            sortOrder = 'asc' 
        } = req.query;

        const query = {};
        
        // Only add status filter if it's a valid value
        if (status && status !== 'all' && status !== 'undefined') {
            query.isActive = status === 'active';
        }
        
        // Only add category filter if it's a valid value
        if (category && category !== 'all' && category !== 'undefined') {
            query.category = category;
        }
        
        // Only add search filter if search term exists and is not empty
        if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        
        console.log('🔍 [DEBUG] Query parameters:', query);
        console.log('🔍 [DEBUG] Sort parameters:', sort);
        console.log('🔍 [DEBUG] Pagination:', { page, limit, skip: (page - 1) * limit });
        
        // Check total count first
        const totalCount = await SubscriptionPlan.countDocuments({});
        console.log('🔍 [DEBUG] Total plans in database:', totalCount);
        
        const plans = await SubscriptionPlan.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .populate('courseBundles.course', 'title thumbnail price currency category')
            .populate('funnelBundles.funnel', 'name description funnelUrl targetAudience stages')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        console.log('🔍 [DEBUG] Found plans:', plans.length);
        console.log('🔍 [DEBUG] Plans data:', plans);

        const total = await SubscriptionPlan.countDocuments(query);
        console.log('🔍 [DEBUG] Total matching query:', total);

        res.json({
            success: true,
            data: {
                plans,
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
        console.error('Error getting subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving subscription plans',
            error: error.message
        });
    }
});

/**
 * @desc    Get specific subscription plan by ID
 * @route   GET /api/admin/v1/subscription-plans/:planId
 * @access  Private (Admin)
 */
exports.getSubscriptionPlanById = asyncHandler(async (req, res) => {
    try {
        const { planId } = req.params;

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        const plan = await SubscriptionPlan.findById(planId)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .populate('courseBundles.course', 'title thumbnail price currency category')
            .populate('funnelBundles.funnel', 'name description funnelUrl targetAudience stages');

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        res.json({
            success: true,
            data: plan
        });

    } catch (error) {
        console.error('Error getting subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving subscription plan',
            error: error.message
        });
    }
});

/**
 * @desc    Update subscription plan
 * @route   PUT /api/admin/v1/subscription-plans/:planId
 * @access  Private (Admin)
 */
exports.updateSubscriptionPlan = asyncHandler(async (req, res) => {
    try {
        const { planId } = req.params;
        const {
            name,
            description,
            price,
            currency,
            billingCycle,
            duration,
            features,
            limits,
            courseAccess,
            courseBundles,
            addons,
            isPopular,
            trialDays,
            setupFee,
            sortOrder,
            category,
            tags,
            isActive,
            restrictions,
            pricing
        } = req.body;

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        const plan = await SubscriptionPlan.findById(planId);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }
        
        if (name !== undefined) plan.name = name;
        if (description !== undefined) plan.description = description;
        if (price !== undefined) plan.price = toFloat(price, plan.price);
        if (currency !== undefined) plan.currency = currency;
        if (billingCycle !== undefined) plan.billingCycle = billingCycle;
        if (duration !== undefined) plan.duration = toInt(duration, plan.duration);
        if (features !== undefined || limits !== undefined) {
            // Merge existing features/limits with new ones, and map limit values to features
            const mergedFeatures = { ...plan.features, ...(features || {}) };
            const mergedLimits = { ...plan.limits, ...(limits || {}) };
            plan.features = buildFeaturePayload(mergedFeatures, mergedLimits);
            plan.limits = buildLimitsPayload(mergedLimits);
        }
        if (courseAccess !== undefined) plan.courseAccess = buildCourseAccessPayload({ ...plan.courseAccess, ...courseAccess });
        if (addons !== undefined) plan.addons = buildAddonsPayload(addons);
        if (courseBundles !== undefined) {
            plan.courseBundles = await buildCourseBundlesPayload(courseBundles);
        }
        if (req.body.funnelBundles !== undefined) {
            plan.funnelBundles = buildFunnelBundlesPayload(req.body.funnelBundles);
        }
        if (isPopular !== undefined) plan.isPopular = normalizeBoolean(isPopular);
        if (trialDays !== undefined) plan.trialDays = toInt(trialDays, plan.trialDays);
        if (setupFee !== undefined) plan.setupFee = toFloat(setupFee, plan.setupFee);
        if (sortOrder !== undefined) plan.sortOrder = toInt(sortOrder, plan.sortOrder);
        if (category !== undefined) plan.category = category;
        if (tags !== undefined) plan.tags = Array.isArray(tags) ? tags : plan.tags;
        if (isActive !== undefined) plan.isActive = normalizeBoolean(isActive, plan.isActive);
        if (restrictions !== undefined) plan.restrictions = restrictions;

        if (!plan.pricing) {
            plan.pricing = {};
        }

        const pricingPayload = pricing || {};
        if (pricingPayload.basePrice !== undefined || price !== undefined) {
            plan.pricing.basePrice = toFloat(pricingPayload.basePrice, plan.price);
        }
        if (pricingPayload.setupFee !== undefined || setupFee !== undefined) {
            plan.pricing.setupFee = toFloat(pricingPayload.setupFee, plan.setupFee);
        }
        if (pricingPayload.annualDiscount !== undefined) {
            plan.pricing.annualDiscount = toFloat(pricingPayload.annualDiscount, plan.pricing.annualDiscount || 0);
        }
        if (pricingPayload.currency !== undefined || currency !== undefined) {
            plan.pricing.currency = pricingPayload.currency || plan.currency;
        }

        plan.updatedBy = req.admin.id;

        await plan.save();

        const populatedPlan = await SubscriptionPlan.findById(planId)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .populate('courseBundles.course', 'title thumbnail price currency category')
            .populate('funnelBundles.funnel', 'name description funnelUrl targetAudience stages');

        res.json({
            success: true,
            data: populatedPlan,
            message: 'Subscription plan updated successfully'
        });

    } catch (error) {
        console.error('Error updating subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subscription plan',
            error: error.message
        });
    }
});

/**
 * @desc    Delete subscription plan
 * @route   DELETE /api/admin/v1/subscription-plans/:planId
 * @access  Private (Admin)
 */
exports.deleteSubscriptionPlan = asyncHandler(async (req, res) => {
    try {
        const { planId } = req.params;

        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
        }

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        const CoachSubscription = require('../schema/CoachSubscription');

        // Check if plan exists first
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        // Check if any coaches are subscribed to this plan
        const activeSubscriptions = await CoachSubscription.countDocuments({
            planId: planId,
            status: { $in: ['active', 'trial'] }
        });

        if (activeSubscriptions > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete plan. ${activeSubscriptions} coaches are currently subscribed to this plan.`
            });
        }

        // Delete the plan
        await SubscriptionPlan.findByIdAndDelete(planId);

        res.json({
            success: true,
            message: 'Subscription plan deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting subscription plan',
            error: error.message
        });
    }
});

/**
 * @desc    Toggle subscription plan active status
 * @route   PUT /api/admin/v1/subscription-plans/:planId/toggle-status
 * @access  Private (Admin)
 */
exports.toggleSubscriptionPlanStatus = asyncHandler(async (req, res) => {
    try {
        const { planId } = req.params;

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        const plan = await SubscriptionPlan.findById(planId);

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found'
            });
        }

        plan.isActive = !plan.isActive;
        plan.updatedBy = req.admin.id;
        await plan.save();

        res.json({
            success: true,
            data: {
                planId: plan._id,
                isActive: plan.isActive
            },
            message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Error toggling plan status:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling plan status',
            error: error.message
        });
    }
});

/**
 * @desc    Duplicate subscription plan
 * @route   POST /api/admin/v1/subscription-plans/:planId/duplicate
 * @access  Private (Admin)
 */
exports.duplicateSubscriptionPlan = asyncHandler(async (req, res) => {
    try {
        const { planId } = req.params;
        const { name, price } = req.body;

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        const originalPlan = await SubscriptionPlan.findById(planId);

        if (!originalPlan) {
            return res.status(404).json({
                success: false,
                message: 'Original subscription plan not found'
            });
        }

        // Create duplicate plan
        const duplicateData = originalPlan.toObject();
        delete duplicateData._id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;

        duplicateData.name = name || `${originalPlan.name} (Copy)`;
        duplicateData.price = price || originalPlan.price;
        duplicateData.isActive = false; // Start as inactive
        duplicateData.isPopular = false; // Reset popular status
        duplicateData.createdBy = req.admin.id;
        duplicateData.updatedBy = req.admin.id;

        const duplicatedPlan = await SubscriptionPlan.create(duplicateData);

        res.status(201).json({
            success: true,
            data: duplicatedPlan,
            message: 'Subscription plan duplicated successfully'
        });

    } catch (error) {
        console.error('Error duplicating subscription plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error duplicating subscription plan',
            error: error.message
        });
    }
});

/**
 * @desc    Get subscription plan analytics
 * @route   GET /api/admin/v1/subscription-plans/analytics
 * @access  Private (Admin)
 */
exports.getSubscriptionPlanAnalytics = asyncHandler(async (req, res) => {
    try {
        const { timeRange = 30 } = req.query;
        const days = parseInt(timeRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        const CoachSubscription = require('../schema/CoachSubscription');

        // Get plan statistics
        const totalPlans = await SubscriptionPlan.countDocuments();
        const activePlans = await SubscriptionPlan.countDocuments({ isActive: true });

        // Get subscription statistics
        const totalSubscriptions = await CoachSubscription.countDocuments();
        const activeSubscriptions = await CoachSubscription.countDocuments({
            status: { $in: ['active', 'trial'] }
        });

        // Get recent subscriptions
        const recentSubscriptions = await CoachSubscription.find({
            createdAt: { $gte: startDate }
        }).populate('planId', 'name price').populate('coachId', 'name email');

        // Get plan popularity
        const planPopularity = await CoachSubscription.aggregate([
            {
                $match: { status: { $in: ['active', 'trial'] } }
            },
            {
                $group: {
                    _id: '$planId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'subscriptionplans',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            {
                $unwind: '$plan'
            },
            {
                $project: {
                    planName: '$plan.name',
                    planPrice: '$plan.price',
                    subscriberCount: '$count'
                }
            },
            {
                $sort: { subscriberCount: -1 }
            }
        ]);

        // Calculate revenue
        const revenueData = await CoachSubscription.aggregate([
            {
                $match: {
                    status: { $in: ['active', 'trial'] },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $lookup: {
                    from: 'subscriptionplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            {
                $unwind: '$plan'
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$plan.price' },
                    averageRevenue: { $avg: '$plan.price' }
                }
            }
        ]);

        const analytics = {
            plans: {
                total: totalPlans,
                active: activePlans,
                inactive: totalPlans - activePlans
            },
            subscriptions: {
                total: totalSubscriptions,
                active: activeSubscriptions,
                inactive: totalSubscriptions - activeSubscriptions
            },
            recentSubscriptions: recentSubscriptions.slice(0, 10),
            planPopularity,
            revenue: revenueData[0] || { totalRevenue: 0, averageRevenue: 0 },
            timeRange: days
        };

        res.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Error getting subscription analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting subscription analytics',
            error: error.message
        });
    }
});

/**
 * @desc    Subscribe coach to plan (admin action)
 * @route   POST /api/admin/v1/subscription-plans/subscribe-coach
 * @access  Private (Admin)
 */
exports.subscribeCoachToPlan = asyncHandler(async (req, res) => {
    try {
        const { coachId, planId, startDate, notes } = req.body;

        if (!coachId || !planId) {
            return res.status(400).json({
                success: false,
                message: 'Coach ID and Plan ID are required'
            });
        }

        const User = require('../schema/User');
        const SubscriptionPlan = require('../schema/SubscriptionPlan');
        const CoachSubscription = require('../schema/CoachSubscription');

        // Verify coach exists
        const coach = await User.findById(coachId);
        if (!coach || coach.role !== 'coach') {
            return res.status(404).json({
                success: false,
                message: 'Coach not found'
            });
        }

        // Verify plan exists and is active
        const plan = await SubscriptionPlan.findById(planId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Subscription plan not found or inactive'
            });
        }

        // Check if coach already has an active subscription
        const existingSubscription = await CoachSubscription.findOne({
            coachId,
            status: { $in: ['active', 'trial'] }
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: 'Coach already has an active subscription'
            });
        }

        // Calculate subscription dates
        const subscriptionStartDate = startDate ? new Date(startDate) : new Date();
        const subscriptionEndDate = new Date(subscriptionStartDate);

        switch (plan.billingCycle) {
            case 'monthly':
                subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.duration);
                break;
            case 'quarterly':
                subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + (plan.duration * 3));
                break;
            case 'yearly':
                subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + plan.duration);
                break;
        }

        // Create subscription
        const subscription = await CoachSubscription.create({
            coachId,
            planId,
            status: 'active',
            currentPeriod: {
                startDate: subscriptionStartDate,
                endDate: subscriptionEndDate
            },
            billing: {
                amount: plan.price,
                currency: plan.currency,
                billingCycle: plan.billingCycle,
                nextBillingDate: subscriptionEndDate,
                paymentStatus: 'paid'
            },
            features: plan.features,
            limits: plan.limits,
            adminNotes: notes,
            createdBy: req.admin.id
        });

        res.status(201).json({
            success: true,
            data: subscription,
            message: 'Coach subscribed successfully'
        });

    } catch (error) {
        console.error('Error subscribing coach:', error);
        res.status(500).json({
            success: false,
            message: 'Error subscribing coach',
            error: error.message
        });
    }
});

// ===== ADDITIONAL SUBSCRIPTION MANAGEMENT METHODS =====

/**
 * @desc    Get all coach subscriptions with filtering
 * @route   GET /api/admin/v1/subscriptions
 * @access  Private (Admin)
 */
exports.getAllSubscriptions = asyncHandler(async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            coachId, 
            planId, 
            startDate, 
            endDate,
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;

        const query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (coachId) {
            query.coachId = coachId;
        }
        
        if (planId) {
            query.planId = planId;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const CoachSubscription = require('../schema/CoachSubscription');
        
        const subscriptions = await CoachSubscription.find(query)
            .populate('coachId', 'name email phone')
            .populate('planId', 'name price billingCycle')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CoachSubscription.countDocuments(query);

        res.json({
            success: true,
            data: {
                subscriptions,
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
        console.error('Error getting all subscriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving subscriptions',
            error: error.message
        });
    }
});

/**
 * @desc    Get specific subscription details
 * @route   GET /api/admin/v1/subscriptions/:id
 * @access  Private (Admin)
 */
exports.getSubscriptionDetails = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const CoachSubscription = require('../schema/CoachSubscription');
        
        const subscription = await CoachSubscription.findById(id)
            .populate('coachId', 'name email phone createdAt')
            .populate('planId', 'name description price billingCycle features limits')
            .populate('paymentHistory.paymentId', 'amount currency status createdAt');
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        
        res.json({
            success: true,
            data: subscription
        });
        
    } catch (error) {
        console.error('Error getting subscription details:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving subscription details',
            error: error.message
        });
    }
});

/**
 * @desc    Cancel coach subscription (Admin)
 * @route   POST /api/admin/v1/subscriptions/:id/cancel
 * @access  Private (Admin)
 */
exports.cancelCoachSubscription = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { reason = 'Admin cancelled subscription' } = req.body;
        
        const CoachSubscription = require('../schema/CoachSubscription');
        
        const subscription = await CoachSubscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        
        if (subscription.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Subscription is already cancelled'
            });
        }
        
        // Update subscription status
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancellationReason = reason;
        subscription.cancelledBy = req.admin._id;
        
        await subscription.save();
        
        // Log the action
        const AdminAuditLog = require('../schema/AdminAuditLog');
        await AdminAuditLog.create({
            adminId: req.admin._id,
            action: 'cancel_subscription',
            targetType: 'subscription',
            targetId: id,
            details: {
                subscriptionId: id,
                coachId: subscription.coachId,
                reason: reason
            },
            severity: 'medium'
        });
        
        res.json({
            success: true,
            message: 'Subscription cancelled successfully',
            data: subscription
        });
        
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription',
            error: error.message
        });
    }
});

/**
 * @desc    Renew coach subscription (Admin)
 * @route   POST /api/admin/v1/subscriptions/:id/renew
 * @access  Private (Admin)
 */
exports.renewCoachSubscription = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { duration = 1 } = req.body; // duration in months
        
        const CoachSubscription = require('../schema/CoachSubscription');
        
        const subscription = await CoachSubscription.findById(id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        
        if (subscription.status === 'active') {
            // Extend existing active subscription
            const currentEndDate = new Date(subscription.endDate);
            subscription.endDate = new Date(currentEndDate.getTime() + (duration * 30 * 24 * 60 * 60 * 1000));
        } else {
            // Reactivate cancelled/expired subscription
            subscription.status = 'active';
            subscription.startDate = new Date();
            subscription.endDate = new Date(Date.now() + (duration * 30 * 24 * 60 * 60 * 1000));
            subscription.reactivatedAt = new Date();
            subscription.reactivatedBy = req.admin._id;
        }
        
        subscription.lastRenewedAt = new Date();
        subscription.renewedBy = req.admin._id;
        
        await subscription.save();
        
        // Log the action
        const AdminAuditLog = require('../schema/AdminAuditLog');
        await AdminAuditLog.create({
            adminId: req.admin._id,
            action: 'renew_subscription',
            targetType: 'subscription',
            targetId: id,
            details: {
                subscriptionId: id,
                coachId: subscription.coachId,
                duration: duration
            },
            severity: 'low'
        });
        
        res.json({
            success: true,
            message: 'Subscription renewed successfully',
            data: subscription
        });
        
    } catch (error) {
        console.error('Error renewing subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error renewing subscription',
            error: error.message
        });
    }
});

/**
 * @desc    Get revenue trends from subscription payments
 * @route   GET /api/admin/v1/revenue-trends
 * @access  Private (Admin)
 */
exports.getRevenueTrends = asyncHandler(async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        // Get revenue data from platform subscription payments (coaches paying for platform plans)
        // Also include other revenue sources if platform_subscription is empty
        let revenueData = await RazorpayPayment.aggregate([
            {
                $match: {
                    businessType: 'platform_subscription',
                    status: 'captured',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    revenue: { $sum: '$amount' },
                    transactions: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // If no platform subscription data, try other revenue sources
        if (revenueData.length === 0) {
            console.log('No platform subscription data found, trying alternative revenue sources...');
            revenueData = await RazorpayPayment.aggregate([
                {
                    $match: {
                        businessType: { $in: ['coach_plan_purchase', 'mlm_commission'] },
                        status: 'captured',
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$createdAt'
                            }
                        },
                        revenue: { $sum: '$amount' },
                        transactions: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id': 1 }
                }
            ]);
        }

        console.log(`Revenue trends data found: ${revenueData.length} records`);

        // Format data for frontend chart
        const chartData = revenueData.map(item => ({
            date: item._id,
            revenue: item.revenue, // Keep in rupees (already converted in aggregation)
            transactions: item.transactions
        }));

        console.log(`Revenue trends API response: ${chartData.length} data points`);
        console.log('Sample data point:', chartData[0]);

        // If no real data, generate sample data for demonstration
        let finalChartData = chartData;
        if (chartData.length === 0) {
            console.log('No real revenue data found, generating sample data...');
            const sampleData = [];
            const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // Generate some realistic sample data
                const baseRevenue = period === '7d' ? 5000 : period === '30d' ? 15000 : 25000;
                const revenue = baseRevenue + Math.random() * baseRevenue * 0.5;
                const transactions = Math.floor(revenue / 1500) + Math.floor(Math.random() * 5);

                sampleData.push({
                    date: dateStr,
                    revenue: Math.round(revenue),
                    transactions: transactions
                });
            }

            finalChartData = sampleData;
        }

        res.json({
            success: true,
            message: 'Revenue trends retrieved successfully',
            data: {
                revenueTrends: finalChartData,
                period,
                totalRevenue: finalChartData.reduce((sum, item) => sum + item.revenue, 0),
                totalTransactions: finalChartData.reduce((sum, item) => sum + item.transactions, 0),
                isSampleData: chartData.length === 0 // Flag to indicate if this is sample data
            }
        });

    } catch (error) {
        console.error('Error getting revenue trends:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving revenue trends',
            error: error.message
        });
    }
});

/**
 * @desc    Debug endpoint to check payment data
 * @route   GET /api/admin/v1/debug-payments
 * @access  Private (Admin)
 */
exports.debugPayments = asyncHandler(async (req, res) => {
    try {
        const payments = await RazorpayPayment.find({})
            .select('businessType status amount createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        const businessTypes = await RazorpayPayment.aggregate([
            { $group: { _id: '$businessType', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            message: 'Payment debug data retrieved',
            data: {
                recentPayments: payments,
                businessTypes: businessTypes
            }
        });
    } catch (error) {
        console.error('Error getting payment debug data:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment debug data',
            error: error.message
        });
    }
});

/**
 * @desc    Get top performing coaches
 * @route   GET /api/admin/v1/top-coaches
 * @access  Private (Admin)
 */
exports.getTopPerformingCoaches = asyncHandler(async (req, res) => {
    try {
        const { limit = 10, period = '30d' } = req.query;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        // Get top coaches based on revenue and student count
        const topCoaches = await User.aggregate([
            {
                $match: {
                    role: 'coach',
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: 'razorpay_payments',
                    localField: '_id',
                    foreignField: 'coachId',
                    as: 'payments',
                    pipeline: [
                        {
                            $match: {
                                createdAt: { $gte: startDate, $lte: endDate },
                                status: 'captured'
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: '_id',
                    foreignField: 'coachId',
                    as: 'subscriptions',
                    pipeline: [
                        {
                            $match: {
                                createdAt: { $gte: startDate, $lte: endDate },
                                status: 'active'
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    revenue: {
                        $sum: {
                            $map: {
                                input: '$payments',
                                as: 'payment',
                                in: { $divide: ['$$payment.amount', 100] } // Convert paise to rupees
                            }
                        }
                    },
                    students: { $size: '$subscriptions' }
                }
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    revenue: 1,
                    students: 1,
                    performance: {
                        $add: ['$revenue', { $multiply: ['$students', 10] }] // Simple performance score
                    }
                }
            },
            {
                $sort: { performance: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.json({
            success: true,
            message: 'Top performing coaches retrieved successfully',
            data: {
                coaches: topCoaches,
                period,
                totalCoaches: topCoaches.length
            }
        });

    } catch (error) {
        console.error('Error getting top coaches:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving top coaches',
            error: error.message
        });
    }
});

/**
 * @desc    Get system health with refresh capability
 * @route   GET /api/admin/v1/system-health
 * @access  Private (Admin)
 */
exports.getSystemHealth = asyncHandler(async (req, res) => {
    try {
        const os = require('os');
        const process = require('process');

        // Get system metrics
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);

        // Convert bytes to GB
        const totalMemoryGB = Math.round(totalMemory / (1024 * 1024 * 1024));
        const usedMemoryGB = Math.round(usedMemory / (1024 * 1024 * 1024));

        // CPU usage (simplified)
        const cpus = os.cpus();
        const cpuCores = cpus.length;
        const cpuUsage = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total) * 100;
        }, 0) / cpus.length;

        // Uptime
        const uptime = process.uptime();

        // Database connection check
        let dbConnected = false;
        try {
            await mongoose.connection.db.admin().ping();
            dbConnected = true;
        } catch (error) {
            dbConnected = false;
        }

        // API response time (mock - would need actual measurement)
        const responseTime = Math.random() * 50 + 10; // 10-60ms random for demo

        const systemHealth = {
            status: dbConnected ? 'healthy' : 'error',
            database: {
                connected: dbConnected,
                collections: mongoose.connection.db ? (await mongoose.connection.db.listCollections().toArray()).length : 0
            },
            performance: {
                cpu: Math.round(cpuUsage),
                cpuCores: cpuCores,
                memory: memoryUsagePercent,
                memoryUsed: usedMemoryGB,
                totalMemory: totalMemoryGB,
                uptime: uptime,
                responseTime: Math.round(responseTime)
            },
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'System health retrieved successfully',
            data: systemHealth
        });

    } catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving system health',
            error: error.message
        });
    }
});