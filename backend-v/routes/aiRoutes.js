const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

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

module.exports = router;
