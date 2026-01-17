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
    getCredentials,
    setupMetaAdsCredentials,
    setupOpenAICredentials,
    updatePreferences,
    verifyMetaCredentials,
    verifyOpenAICredentials,
    getMetaAccessToken,
    getOpenAIKey,
    deleteCredentials,
    getSetupStatus
} = require('../controllers/coachMarketingCredentialsController');

// Apply unified authentication and resource filtering to all routes
router.use(unifiedCoachAuth(), updateLastActive, filterResourcesByPermission('marketing'));

// ===== CREDENTIALS MANAGEMENT =====

// Get coach marketing credentials
router.get('/', requirePermission('marketing:read'), getCredentials);

// Get setup status
router.get('/setup-status', requirePermission('marketing:read'), getSetupStatus);

// ===== META ADS CREDENTIALS =====

// Set up Meta Ads credentials
router.post('/meta-ads', requirePermission('marketing:manage'), setupMetaAdsCredentials);

// Verify Meta Ads credentials
router.post('/verify-meta', requirePermission('marketing:manage'), verifyMetaCredentials);

// Get Meta Ads access token (for internal use)
router.get('/meta-token', requirePermission('marketing:read'), getMetaAccessToken);

// ===== OPENAI CREDENTIALS =====

// Set up OpenAI credentials
router.post('/openai', requirePermission('marketing:manage'), setupOpenAICredentials);

// Verify OpenAI credentials
router.post('/verify-openai', requirePermission('marketing:manage'), verifyOpenAICredentials);

// Get OpenAI API key (for internal use)
router.get('/openai-key', requirePermission('marketing:read'), getOpenAIKey);

// ===== PREFERENCES =====

// Update marketing preferences
router.put('/preferences', requirePermission('marketing:manage'), updatePreferences);

// ===== CREDENTIALS MANAGEMENT =====

// Delete all marketing credentials
router.delete('/', requirePermission('marketing:manage'), deleteCredentials);

module.exports = router;

