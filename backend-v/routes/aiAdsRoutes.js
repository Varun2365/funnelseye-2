// D:\PRJ_YCT_Final\routes\aiAdsRoutes.js

const express = require('express');
const router = express.Router();
const {
    generateAdCopy,
    optimizeBudgetAllocation,
    detectAnomalies,
    generateTargetingRecommendations,
    autoOptimizeCampaign,
    getPerformanceInsights,
    createOptimizedCampaign,
    getAIDashboard,
    bulkOptimizeCampaigns,
    generateAdVariations,
    generatePosterImage,
    generatePosterVariations,
    generateMarketingHeadlines,
    generateSocialMediaPost,
    uploadToInstagram,
    generateSocialMediaCampaign,
    getSocialMediaHistory
} = require('../controllers/aiAdsController');

// Protect all routes
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// AI Ad Copy Generation
router.post('/generate-copy', generateAdCopy);

// Campaign Optimization
router.post('/optimize-budget/:campaignId', optimizeBudgetAllocation);
router.post('/auto-optimize/:campaignId', autoOptimizeCampaign);
router.post('/bulk-optimize', bulkOptimizeCampaigns);

// Performance Analysis
router.get('/detect-anomalies/:campaignId', detectAnomalies);
router.get('/performance-insights/:campaignId', getPerformanceInsights);

// Targeting Recommendations
router.post('/targeting-recommendations', generateTargetingRecommendations);

// Campaign Creation
router.post('/create-optimized-campaign', createOptimizedCampaign);

// Dashboard
router.get('/dashboard', getAIDashboard);

// Ad Variations
router.post('/generate-variations', generateAdVariations);

// Social Media Integration Routes
router.post('/generate-poster', generatePosterImage);
router.post('/generate-poster-variations', generatePosterVariations);
router.post('/generate-headlines', generateMarketingHeadlines);
router.post('/generate-social-post', generateSocialMediaPost);
router.post('/upload-to-instagram', uploadToInstagram);
router.post('/generate-campaign', generateSocialMediaCampaign);
router.get('/social-media-history', getSocialMediaHistory);

module.exports = router;
