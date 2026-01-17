const CoachSubscription = require('../schema/CoachSubscription');
const logger = require('../utils/logger');

/**
 * Middleware to check if coach has active subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkSubscription = async (req, res, next) => {
    try {
        // Skip subscription check for certain routes
        const skipRoutes = [
            '/api/auth/login',
            '/api/auth/register',
            '/api/subscriptions',
            '/api/paymentsv1/payments/coach-plan/create-order',
            '/api/paymentsv1/payments/verify'
        ];
        
        if (skipRoutes.some(route => req.path.startsWith(route))) {
            return next();
        }
        
        // Only check for authenticated users
        if (!req.user || !req.user._id) {
            return next();
        }
        
        const coachId = req.user._id;
        
        // Check if coach has active subscription
        const subscription = await CoachSubscription.findOne({
            coachId,
            status: { $in: ['active', 'trial'] }
        }).populate('planId');
        
        if (!subscription) {
            return res.status(403).json({
                success: false,
                message: 'Active subscription required',
                error: 'SUBSCRIPTION_REQUIRED',
                subscriptionRequired: true
            });
        }
        
        // Check if subscription is expired
        const now = new Date();
        if (subscription.endDate < now) {
            // Update subscription status to expired
            subscription.status = 'expired';
            await subscription.save();
            
            return res.status(403).json({
                success: false,
                message: 'Subscription expired',
                error: 'SUBSCRIPTION_EXPIRED',
                subscriptionRequired: true
            });
        }
        
        // Add subscription info to request
        req.subscription = subscription;
        req.planLimits = subscription.planId.limits;
        
        // Check plan limits for specific operations
        if (req.method === 'POST') {
            await checkPlanLimits(req, res, next);
        } else {
            next();
        }
        
    } catch (error) {
        logger.error('[SubscriptionCheck] Error checking subscription:', error);
        next(); // Continue without subscription check if there's an error
    }
};

/**
 * Check plan limits for specific operations
 */
const checkPlanLimits = async (req, res, next) => {
    try {
        const { planLimits } = req;
        const coachId = req.user._id;
        
        // Check student limit
        if (req.path.includes('/leads') && planLimits.maxStudents !== -1) {
            const Lead = require('../schema/Lead');
            const studentCount = await Lead.countDocuments({ coachId });
            
            if (studentCount >= planLimits.maxStudents) {
                return res.status(403).json({
                    success: false,
                    message: `Student limit reached. Upgrade your plan to add more students.`,
                    error: 'STUDENT_LIMIT_REACHED',
                    currentLimit: planLimits.maxStudents,
                    currentCount: studentCount
                });
            }
        }
        
        // Check funnel limit
        if (req.path.includes('/funnels') && planLimits.maxPlans !== -1) {
            const Funnel = require('../schema/Funnel');
            const funnelCount = await Funnel.countDocuments({ coachId });
            
            if (funnelCount >= planLimits.maxPlans) {
                return res.status(403).json({
                    success: false,
                    message: `Funnel limit reached. Upgrade your plan to create more funnels.`,
                    error: 'FUNNEL_LIMIT_REACHED',
                    currentLimit: planLimits.maxPlans,
                    currentCount: funnelCount
                });
            }
        }
        
        next();
        
    } catch (error) {
        logger.error('[SubscriptionCheck] Error checking plan limits:', error);
        next();
    }
};

/**
 * Middleware to check if coach has trial subscription
 */
const checkTrialSubscription = async (req, res, next) => {
    try {
        if (!req.user || !req.user._id) {
            return next();
        }
        
        const coachId = req.user._id;
        
        const subscription = await CoachSubscription.findOne({
            coachId,
            status: 'trial'
        });
        
        if (subscription) {
            req.isTrialUser = true;
            req.trialEndDate = subscription.trialEndDate;
        }
        
        next();
        
    } catch (error) {
        logger.error('[SubscriptionCheck] Error checking trial subscription:', error);
        next();
    }
};

/**
 * Middleware to add subscription info to response
 */
const addSubscriptionInfo = (req, res, next) => {
    if (req.subscription) {
        res.locals.subscription = {
            plan: req.subscription.planId.name,
            status: req.subscription.status,
            endDate: req.subscription.endDate,
            isTrial: req.subscription.status === 'trial',
            limits: req.planLimits
        };
    }
    next();
};

module.exports = {
    checkSubscription,
    checkTrialSubscription,
    addSubscriptionInfo
};