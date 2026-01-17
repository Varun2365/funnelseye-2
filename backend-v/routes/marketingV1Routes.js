// D:\PRJ_YCT_Final\routes\marketingV1Routes.js

const express = require('express');
const router = express.Router();
const { 
    unifiedCoachAuth, 
    requirePermission, 
    checkResourceOwnership,
    filterResourcesByPermission 
} = require('../middleware/unifiedCoachAuth');
const { updateLastActive } = require('../middleware/activityMiddleware');
const {
    // Credentials Management
    getMetaSetupSteps,
    getOpenAISetupSteps,
    setupMetaCredentials,
    verifyMetaCredentials,
    getMetaAccountInfo,
    initiateMetaOAuth,
    handleMetaOAuthCallback,
    setupOpenAICredentials,
    getCredentialsStatus,
    getDetailedMetaCredentials,
    disconnectMeta,
    getCurrencyPreference,
    saveCurrencyPreference,
    
    // Campaign Analysis & Management
    getCampaignAnalysis,
    getCampaignInsights,
    getCampaignMetrics,
    getCampaignAudienceInsights,
    getCampaignRecommendations,
    createCampaign,
    updateCampaign,
    pauseCampaign,
    resumeCampaign,
    deleteCampaign,
    duplicateCampaign,
    
    // AI-Powered Features
    generateAICopy,
    generateAITargeting,
    optimizeCampaignWithAI,
    generateAICreatives,
    getAIPerformanceInsights,
    generateAIStrategy,
    
    // Dashboard & Analytics
    getMarketingDashboard,
    getCampaignPerformanceSummary,
    exportCampaignData,
    
    // Automation & Scheduling
    scheduleCampaign,
    setupCampaignAutomation,
    getAutomationStatus
} = require('../controllers/marketingV1Controller');

// ===== PUBLIC ROUTES (No Authentication Required) =====

// Meta OAuth callback routes (Public - for redirects from Meta)
router.get('/credentials/meta/oauth/callback', handleMetaOAuthCallback);
router.post('/credentials/meta/oauth/callback', handleMetaOAuthCallback);

// Apply unified authentication and resource filtering to all protected routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('ads'));

// ===== CREDENTIALS MANAGEMENT =====

// Get Meta API setup steps
router.get('/credentials/meta/setup-steps', requirePermission('ads:read'), getMetaSetupSteps);

// Get OpenAI setup steps
router.get('/credentials/openai/setup-steps', requirePermission('ads:read'), getOpenAISetupSteps);

// Setup Meta API credentials
router.post('/credentials/meta', requirePermission('ads:manage'), setupMetaCredentials);

// Verify Meta API credentials
router.post('/credentials/meta/verify', requirePermission('ads:manage'), verifyMetaCredentials);

// Get Meta account information
router.get('/credentials/meta/account-info', requirePermission('ads:read'), getMetaAccountInfo);

// Meta OAuth initiate endpoint (requires authentication)
router.post('/credentials/meta/oauth/initiate', requirePermission('ads:manage'), initiateMetaOAuth);

// Setup OpenAI credentials
router.post('/credentials/openai', requirePermission('ads:manage'), setupOpenAICredentials);

// Get marketing credentials status
router.get('/credentials/status', requirePermission('ads:read'), getCredentialsStatus);

// Get detailed Meta credentials
router.get('/credentials/meta/detailed', requirePermission('ads:read'), getDetailedMetaCredentials);

// Disconnect Meta account
router.delete('/credentials/meta', requirePermission('ads:manage'), disconnectMeta);

// ===== PREFERENCES =====

// Get currency preference
router.get('/preferences/currency', requirePermission('ads:read'), getCurrencyPreference);

// Save currency preference
router.post('/preferences/currency', requirePermission('ads:manage'), saveCurrencyPreference);

// ===== CAMPAIGN ANALYSIS & MANAGEMENT =====

// Get comprehensive campaign analysis
router.get('/campaigns/analysis', requirePermission('ads:analytics'), getCampaignAnalysis);

// Get detailed campaign insights
router.get('/campaigns/:campaignId/insights', requirePermission('ads:analytics'), getCampaignInsights);

// Get campaign performance metrics
router.get('/campaigns/:campaignId/metrics', requirePermission('ads:analytics'), getCampaignMetrics);

// Get campaign audience insights
router.get('/campaigns/:campaignId/audience-insights', requirePermission('ads:analytics'), getCampaignAudienceInsights);

// Get campaign optimization recommendations
router.get('/campaigns/:campaignId/recommendations', requirePermission('ads:analytics'), getCampaignRecommendations);

// Create new campaign with AI assistance
router.post('/campaigns/create', requirePermission('ads:write'), createCampaign);

// Update campaign settings
router.put('/campaigns/:campaignId', requirePermission('ads:update'), updateCampaign);

// Pause campaign
router.post('/campaigns/:campaignId/pause', requirePermission('ads:manage'), pauseCampaign);

// Resume campaign
router.post('/campaigns/:campaignId/resume', requirePermission('ads:manage'), resumeCampaign);

// Delete campaign
router.delete('/campaigns/:campaignId', requirePermission('ads:delete'), deleteCampaign);

// Duplicate campaign
router.post('/campaigns/:campaignId/duplicate', requirePermission('ads:write'), duplicateCampaign);

// ===== AI-POWERED FEATURES =====

// Generate AI-powered ad copy
router.post('/ai/generate-copy', requirePermission('ai:write'), generateAICopy);

// Generate AI-powered targeting recommendations
router.post('/ai/targeting-recommendations', requirePermission('ai:write'), generateAITargeting);

// Optimize campaign with AI
router.post('/ai/optimize-campaign/:campaignId', requirePermission('ai:write'), optimizeCampaignWithAI);

// Generate AI-powered creative variations
router.post('/ai/generate-creatives', requirePermission('ai:write'), generateAICreatives);

// Get AI-powered performance insights
router.get('/ai/performance-insights/:campaignId', requirePermission('ai:read'), getAIPerformanceInsights);

// Generate AI-powered marketing strategy
router.post('/ai/generate-strategy', requirePermission('ai:write'), generateAIStrategy);

// ===== DASHBOARD & ANALYTICS =====

// Get marketing dashboard data
router.get('/dashboard', requirePermission('ads:analytics'), getMarketingDashboard);

// Get campaign performance summary
router.get('/campaigns/performance-summary', requirePermission('ads:analytics'), getCampaignPerformanceSummary);

// Export campaign data
router.get('/campaigns/export', requirePermission('ads:analytics'), exportCampaignData);

// ===== AUTOMATION & SCHEDULING =====

// Schedule campaign
router.post('/campaigns/:campaignId/schedule', requirePermission('ads:manage'), scheduleCampaign);

// Set up campaign automation rules
router.post('/campaigns/:campaignId/automation', requirePermission('ads:manage'), setupCampaignAutomation);

// Get automation status
router.get('/campaigns/:campaignId/automation/status', requirePermission('ads:read'), getAutomationStatus);

module.exports = router;
