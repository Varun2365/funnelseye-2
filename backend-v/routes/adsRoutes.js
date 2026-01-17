const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');
const { 
    unifiedCoachAuth,
    requireAdsPermission,
    filterResourcesByPermission
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');

// Apply unified authentication and resource filtering
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('ads'));

// Campaign management routes
router.get('/', requireAdsPermission('read'), adsController.listCampaigns);
router.post('/create', requireAdsPermission('write'), adsController.createCampaign);
router.post('/sync', requireAdsPermission('manage'), adsController.syncCampaigns);
router.put('/:campaignId', requireAdsPermission('update'), adsController.updateCampaign);
router.post('/:campaignId/pause', requireAdsPermission('manage'), adsController.pauseCampaign);
router.post('/:campaignId/resume', requireAdsPermission('manage'), adsController.resumeCampaign);
router.get('/:campaignId/analytics', requireAdsPermission('analytics'), adsController.getCampaignAnalytics);

// New routes for complete URL campaign creation
router.post('/upload-image', requireAdsPermission('write'), adsController.uploadImage);
router.post('/:campaignId/ad-sets', requireAdsPermission('write'), adsController.createAdSet);
router.post('/:campaignId/creatives', requireAdsPermission('write'), adsController.createAdCreative);
router.post('/:campaignId/ads', requireAdsPermission('write'), adsController.createAd);
router.get('/:campaignId/ad-sets', requireAdsPermission('read'), adsController.listAdSets);
router.get('/:campaignId/creatives', requireAdsPermission('read'), adsController.listAdCreatives);
router.get('/:campaignId/ads', requireAdsPermission('read'), adsController.listAds);

// All-in-one URL campaign creation
router.post('/create-url-campaign', requireAdsPermission('write'), adsController.createUrlCampaign);

module.exports = router;
