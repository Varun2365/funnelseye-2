const express = require('express');
const router = express.Router();
const coachSubscriptionLimitsController = require('../controllers/coachSubscriptionLimitsController');
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('subscription'));

/**
 * @route   GET /api/coach/subscription-limits
 * @desc    Get coach's subscription limits and current usage
 * @access  Private (Coach)
 */
router.get('/subscription-limits', requirePermission('subscription:read'), coachSubscriptionLimitsController.getSubscriptionLimits);

/**
 * @route   POST /api/coach/check-limit
 * @desc    Check specific limit before performing an action
 * @access  Private (Coach)
 * @body    { "limitType": "funnels|staff|leads|emailCredits|smsCredits" }
 */
router.post('/check-limit', requirePermission('subscription:read'), coachSubscriptionLimitsController.checkLimit);

/**
 * @route   POST /api/coach/check-feature
 * @desc    Check feature access
 * @access  Private (Coach)
 * @body    { "featureName": "aiFeatures|customDomain|apiAccess|..." }
 */
router.post('/check-feature', requirePermission('subscription:read'), coachSubscriptionLimitsController.checkFeatureAccess);

module.exports = router;
