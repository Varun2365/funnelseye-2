const express = require('express');
const router = express.Router();
const pixelTrackingController = require('../controllers/pixelTrackingController');
const stageWiseRetargetingController = require('../controllers/stageWiseRetargetingController');
const { unifiedCoachAuth, requireAdsPermission } = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Public routes (can be called from frontend/website)
router.post('/track', pixelTrackingController.trackPixelEvent);
router.post('/track-batch', pixelTrackingController.trackPixelEventsBatch);

// Protected routes (require authentication)
router.use(unifiedCoachAuth(), updateLastActive);

router.post('/retargeting-audience', requireAdsPermission('write'), pixelTrackingController.createRetargetingAudience);
router.get('/campaign/:campaignId/events', requireAdsPermission('read'), pixelTrackingController.getCampaignPixelEvents);
router.post('/campaign/:campaignId/retry', requireAdsPermission('write'), pixelTrackingController.retryFailedPixelEvents);

// Stage-wise retargeting routes
router.post('/stage-audience', requireAdsPermission('write'), stageWiseRetargetingController.createStageAudience);
router.post('/funnel-segments/:funnelId', requireAdsPermission('write'), stageWiseRetargetingController.createFunnelSegments);
router.get('/recommendations', requireAdsPermission('read'), stageWiseRetargetingController.getRecommendations);

module.exports = router;
