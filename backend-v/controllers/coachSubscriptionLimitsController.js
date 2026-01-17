const SubscriptionLimitsMiddleware = require('../middleware/subscriptionLimits');
const asyncHandler = require('../middleware/async');

/**
 * Coach Subscription Limits Controller
 * Provides endpoints for coaches to check their subscription limits and usage
 */
class CoachSubscriptionLimitsController {

    /**
     * Get coach's subscription limits and current usage
     * @route GET /api/coach/subscription-limits
     * @access Private (Coach)
     */
    getSubscriptionLimits = asyncHandler(async (req, res) => {
        const coachId = req.user._id || req.coachId;
        
        if (!coachId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const limitsInfo = await SubscriptionLimitsMiddleware.getCoachLimitsInfo(coachId);
        
        res.json({
            success: true,
            data: limitsInfo
        });
    });

    /**
     * Check specific limit before performing an action
     * @route POST /api/coach/check-limit
     * @access Private (Coach)
     */
    checkLimit = asyncHandler(async (req, res) => {
        const coachId = req.user._id || req.coachId;
        const { limitType } = req.body;
        
        if (!coachId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!limitType) {
            return res.status(400).json({
                success: false,
                message: 'limitType is required'
            });
        }

        let limitCheck;
        
        switch (limitType) {
            case 'funnels':
                limitCheck = await SubscriptionLimitsMiddleware.checkFunnelLimit(coachId);
                break;
            case 'staff':
                limitCheck = await SubscriptionLimitsMiddleware.checkStaffLimit(coachId);
                break;
            case 'campaigns':
                limitCheck = await SubscriptionLimitsMiddleware.checkCampaignLimit(coachId);
                break;
            case 'emailCredits':
                limitCheck = await SubscriptionLimitsMiddleware.checkCreditLimit(coachId, 'emailCredits');
                break;
            case 'smsCredits':
                limitCheck = await SubscriptionLimitsMiddleware.checkCreditLimit(coachId, 'smsCredits');
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid limitType. Supported types: funnels, staff, leads, campaigns, emailCredits, smsCredits'
                });
        }

        res.json({
            success: true,
            data: {
                limitType,
                ...limitCheck
            }
        });
    });

    /**
     * Check feature access
     * @route POST /api/coach/check-feature
     * @access Private (Coach)
     */
    checkFeatureAccess = asyncHandler(async (req, res) => {
        const coachId = req.user._id || req.coachId;
        const { featureName } = req.body;
        
        if (!coachId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!featureName) {
            return res.status(400).json({
                success: false,
                message: 'featureName is required'
            });
        }

        const accessCheck = await SubscriptionLimitsMiddleware.checkFeatureAccess(coachId, featureName);
        
        res.json({
            success: true,
            data: {
                featureName,
                ...accessCheck
            }
        });
    });
}

module.exports = new CoachSubscriptionLimitsController();
