const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyAdminToken, checkAdminPermission } = require('../middleware/adminAuth');

// Test AI service connection
router.get('/test-connection', aiController.testConnection);

// Get available AI models
router.get('/models', aiController.getAvailableModels);

// Generate marketing copy
router.post('/generate-marketing-copy', aiController.generateMarketingCopy);

// Generate headlines and CTAs
router.post('/generate-headlines', aiController.generateHeadlines);

// Generate social media posts
router.post('/generate-social-post', aiController.generateSocialPost);

// Analyze sentiment
router.post('/analyze-sentiment', aiController.analyzeSentiment);

// Generate contextual response
router.post('/generate-contextual-response', aiController.generateContextualResponse);

// Generate SOP
router.post('/generate-sop', aiController.generateSOP);

// Generate lead insights
router.post('/generate-lead-insights', aiController.generateLeadInsights);

// Optimize content
router.post('/optimize-content', aiController.optimizeContent);

// Generic chat completion
router.post('/chat-completion', aiController.chatCompletion);

// ===== OPENROUTER SETTINGS ROUTES (Admin Only) =====

// @route   GET /api/ai/openrouter/settings
// @desc    Get OpenRouter API settings
// @access  Private (Admin)
router.get('/openrouter/settings',
    verifyAdminToken,
    checkAdminPermission('systemSettings'),
    aiController.getOpenRouterSettings
);

// @route   PUT /api/ai/openrouter/settings
// @desc    Update OpenRouter API key
// @access  Private (Admin)
router.put('/openrouter/settings',
    verifyAdminToken,
    checkAdminPermission('systemSettings'),
    aiController.updateOpenRouterSettings
);

// @route   GET /api/ai/openrouter/usage
// @desc    Get OpenRouter API usage statistics
// @access  Private (Admin)
router.get('/openrouter/usage',
    verifyAdminToken,
    checkAdminPermission('viewAnalytics'),
    aiController.getOpenRouterUsage
);

// @route   GET /api/ai/openrouter/balance
// @desc    Get OpenRouter account balance
// @access  Private (Admin)
router.get('/openrouter/balance',
    verifyAdminToken,
    checkAdminPermission('viewAnalytics'),
    aiController.getOpenRouterBalance
);

// @route   POST /api/ai/openrouter/test
// @desc    Test OpenRouter API connection
// @access  Private (Admin)
router.post('/openrouter/test',
    verifyAdminToken,
    checkAdminPermission('systemSettings'),
    aiController.testOpenRouterConnection
);

// @route   GET /api/ai/openrouter/models
// @desc    Get available models with pricing from OpenRouter
// @access  Private (Admin)
router.get('/openrouter/models',
    verifyAdminToken,
    checkAdminPermission('viewAnalytics'),
    aiController.getOpenRouterModels
);

// @route   GET /api/ai/logs
// @desc    Get AI request logs
// @access  Private (Admin)
router.get('/logs',
    verifyAdminToken,
    checkAdminPermission('viewAnalytics'),
    aiController.getAIRequestLogs
);

// @route   GET /api/ai/logs/:logId
// @desc    Get AI request log by ID
// @access  Private (Admin)
router.get('/logs/:logId',
    verifyAdminToken,
    checkAdminPermission('viewAnalytics'),
    aiController.getAIRequestLogById
);

// @route   POST /api/ai/request
// @desc    Make an AI request (high concurrency)
// @access  Private (Admin)
router.post('/request',
    verifyAdminToken,
    checkAdminPermission('systemSettings'),
    aiController.makeAIRequest
);

module.exports = router;
