const aiService = require('../services/aiService');
const asyncHandler = require('../middleware/async');

// Test AI service connection
exports.testConnection = asyncHandler(async (req, res) => {
    const result = await aiService.testConnection();
    res.json(result);
});

// Get available AI models
exports.getAvailableModels = asyncHandler(async (req, res) => {
    const models = aiService.getAvailableModels();
    res.json({
        success: true,
        data: models
    });
});

// Generate marketing copy
exports.generateMarketingCopy = asyncHandler(async (req, res) => {
    const { prompt, temperature, maxTokens, model } = req.body;
    
    if (!prompt) {
        return res.status(400).json({
            success: false,
            message: 'Prompt is required'
        });
    }

    const result = await aiService.generateMarketingCopy(prompt, {
        temperature,
        maxTokens,
        model
    });

    res.json({
        success: true,
        data: result
    });
});

// Generate headlines and CTAs
exports.generateHeadlines = asyncHandler(async (req, res) => {
    const { product, targetAudience, count } = req.body;
    
    if (!product || !targetAudience) {
        return res.status(400).json({
            success: false,
            message: 'Product and targetAudience are required'
        });
    }

    const result = await aiService.generateHeadlines(product, targetAudience, count);
    
    res.json({
        success: true,
        data: result
    });
});

// Generate social media posts
exports.generateSocialPost = asyncHandler(async (req, res) => {
    const { coachName, niche, offer, targetAudience } = req.body;
    
    if (!coachName || !niche || !offer || !targetAudience) {
        return res.status(400).json({
            success: false,
            message: 'coachName, niche, offer, and targetAudience are required'
        });
    }

    const result = await aiService.generateSocialPost(coachName, niche, offer, targetAudience);
    
    res.json({
        success: true,
        data: result
    });
});

// Analyze sentiment
exports.analyzeSentiment = asyncHandler(async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({
            success: false,
            message: 'Message is required'
        });
    }

    const result = await aiService.analyzeSentiment(message);
    
    res.json({
        success: true,
        data: result
    });
});

// Generate contextual response
exports.generateContextualResponse = asyncHandler(async (req, res) => {
    const { userMessage, sentiment, context } = req.body;
    
    if (!userMessage || !sentiment) {
        return res.status(400).json({
            success: false,
            message: 'userMessage and sentiment are required'
        });
    }

    const result = await aiService.generateContextualResponse(userMessage, sentiment, context);
    
    res.json({
        success: true,
        data: result
    });
});

// Generate SOP
exports.generateSOP = asyncHandler(async (req, res) => {
    const { taskType, context } = req.body;
    
    if (!taskType || !context) {
        return res.status(400).json({
            success: false,
            message: 'taskType and context are required'
        });
    }

    const result = await aiService.generateSOP(taskType, context);
    
    res.json({
        success: true,
        data: result
    });
});

// Generate lead insights
exports.generateLeadInsights = asyncHandler(async (req, res) => {
    const { leadData } = req.body;
    
    if (!leadData) {
        return res.status(400).json({
            success: false,
            message: 'leadData is required'
        });
    }

    const result = await aiService.generateLeadInsights(leadData);
    
    res.json({
        success: true,
        data: result
    });
});

// Optimize content
exports.optimizeContent = asyncHandler(async (req, res) => {
    const { content, targetAudience, goal } = req.body;
    
    if (!content || !targetAudience || !goal) {
        return res.status(400).json({
            success: false,
            message: 'content, targetAudience, and goal are required'
        });
    }

    const result = await aiService.optimizeContent(content, targetAudience, goal);
    
    res.json({
        success: true,
        data: result
    });
});

// Generic chat completion
exports.chatCompletion = asyncHandler(async (req, res) => {
    const { messages, model, temperature, maxTokens } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
            success: false,
            message: 'messages array is required'
        });
    }

    const result = await aiService.chatCompletion(messages, {
        model,
        temperature,
        maxTokens
    });
    
    res.json({
        success: true,
        data: result
    });
});
