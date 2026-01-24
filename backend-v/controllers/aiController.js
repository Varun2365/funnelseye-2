const aiService = require('../services/aiService');
const asyncHandler = require('../middleware/async');
// Import models to ensure they're registered before populate operations
const models = require('../schema');
const AdminUser = models.AdminUser;

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

// ===== OPENROUTER SETTINGS CONTROLLERS =====

const AdminSystemSettings = require('../schema/AdminSystemSettings');
const axios = require('axios');

// Get OpenRouter settings
exports.getOpenRouterSettings = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        const openrouterConfig = settings?.aiServices?.openrouter || {
            enabled: false,
            apiKey: '',
            baseUrl: 'https://openrouter.ai/api/v1',
            defaultModel: 'openai/gpt-3.5-turbo'
        };

        // Don't send the full API key, only show if it exists
        res.json({
            success: true,
            data: {
                enabled: openrouterConfig.enabled || false,
                apiKey: openrouterConfig.apiKey ? '***' + openrouterConfig.apiKey.slice(-4) : '',
                hasApiKey: !!openrouterConfig.apiKey,
                baseUrl: openrouterConfig.baseUrl || 'https://openrouter.ai/api/v1',
                defaultModel: openrouterConfig.defaultModel || 'openai/gpt-3.5-turbo'
            }
        });
    } catch (error) {
        console.error('Error getting OpenRouter settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get OpenRouter settings',
            error: error.message
        });
    }
});

// Update OpenRouter settings
exports.updateOpenRouterSettings = asyncHandler(async (req, res) => {
    try {
        const { apiKey, enabled, defaultModel } = req.body;

        if (!apiKey && enabled) {
            return res.status(400).json({
                success: false,
                message: 'API key is required when enabling OpenRouter'
            });
        }

        let settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        
        if (!settings) {
            settings = new AdminSystemSettings({ settingId: 'global' });
        }

        if (!settings.aiServices) {
            settings.aiServices = {};
        }

        if (!settings.aiServices.openrouter) {
            settings.aiServices.openrouter = {
                enabled: false,
                apiKey: '',
                baseUrl: 'https://openrouter.ai/api/v1',
                defaultModel: 'openai/gpt-3.5-turbo'
            };
        }

        // Update settings
        // Only update API key if it's provided and not empty
        if (apiKey !== undefined && apiKey !== null && apiKey.trim() !== '') {
            settings.aiServices.openrouter.apiKey = apiKey.trim();
        } else if (apiKey === '') {
            // If explicitly set to empty string, clear it
            settings.aiServices.openrouter.apiKey = '';
        }
        if (enabled !== undefined) {
            settings.aiServices.openrouter.enabled = enabled;
        }
        if (defaultModel !== undefined) {
            settings.aiServices.openrouter.defaultModel = defaultModel;
        }

        await settings.save();

        // Update environment variable for aiService
        if (apiKey) {
            process.env.OPENROUTER_API_KEY = apiKey;
            aiService.openrouterApiKey = apiKey;
        }

        res.json({
            success: true,
            message: 'OpenRouter settings updated successfully',
            data: {
                enabled: settings.aiServices.openrouter.enabled,
                hasApiKey: !!settings.aiServices.openrouter.apiKey,
                apiKey: settings.aiServices.openrouter.apiKey ? '***' + settings.aiServices.openrouter.apiKey.slice(-4) : '',
                defaultModel: settings.aiServices.openrouter.defaultModel || 'openai/gpt-3.5-turbo'
            }
        });
    } catch (error) {
        console.error('Error updating OpenRouter settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update OpenRouter settings',
            error: error.message
        });
    }
});

// Get OpenRouter usage statistics
exports.getOpenRouterUsage = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const apiKey = settings?.aiServices?.openrouter?.apiKey;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'OpenRouter API key not configured'
            });
        }

        // OpenRouter doesn't have a direct usage endpoint, but we can check recent requests
        // For now, we'll return a placeholder structure
        // In production, you might want to track usage in your database
        
        res.json({
            success: true,
            data: {
                message: 'Usage tracking coming soon. Track your usage at https://openrouter.ai/activity',
                note: 'OpenRouter provides usage statistics in their dashboard'
            }
        });
    } catch (error) {
        console.error('Error getting OpenRouter usage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get OpenRouter usage',
            error: error.message
        });
    }
});

// Get OpenRouter account balance
exports.getOpenRouterBalance = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const apiKey = settings?.aiServices?.openrouter?.apiKey;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'OpenRouter API key not configured'
            });
        }

        // OpenRouter API - Get account balance using credits endpoint
        try {
            // First, verify the key and get account info
            const keyResponse = await axios.get('https://openrouter.ai/api/v1/auth/key', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': process.env.APP_URL || 'https://funnelseye.com',
                    'X-Title': 'FunnelsEye AI Service'
                },
                timeout: 10000
            });

            // Get credits/balance from the credits endpoint
            let credits = null;
            let usage = null;
            let keyValid = true;
            
            try {
                const creditsResponse = await axios.get('https://openrouter.ai/api/v1/credits', {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': process.env.APP_URL || 'https://funnelseye.com',
                        'X-Title': 'FunnelsEye AI Service'
                    },
                    timeout: 10000
                });

                console.log('[OpenRouter Balance] Credits response data:', JSON.stringify(creditsResponse.data, null, 2));

                // Extract credits from the response
                // OpenRouter returns: { "data": { "total_credits": 10, "total_usage": 0.00004185 } }
                if (creditsResponse.data?.data?.total_credits !== undefined) {
                    credits = creditsResponse.data.data.total_credits;
                } else if (creditsResponse.data?.data?.credits !== undefined) {
                    credits = creditsResponse.data.data.credits;
                } else if (creditsResponse.data?.credits !== undefined) {
                    credits = creditsResponse.data.credits;
                } else if (creditsResponse.data?.data?.balance !== undefined) {
                    credits = creditsResponse.data.data.balance;
                } else if (creditsResponse.data?.balance !== undefined) {
                    credits = creditsResponse.data.balance;
                }

                // Extract usage if available
                if (creditsResponse.data?.data?.total_usage !== undefined) {
                    usage = creditsResponse.data.data.total_usage;
                } else if (creditsResponse.data?.data?.usage !== undefined) {
                    usage = creditsResponse.data.data.usage;
                } else if (creditsResponse.data?.usage !== undefined) {
                    usage = creditsResponse.data.usage;
                }
            } catch (creditsError) {
                console.warn('[OpenRouter Balance] Credits endpoint error:', creditsError.response?.data || creditsError.message);
                // If credits endpoint fails, still return key validation info
                if (creditsError.response?.status === 401) {
                    keyValid = false;
                }
            }

            const balanceData = {
                keyValid: keyValid,
                label: keyResponse.data?.label || keyResponse.data?.data?.label || 'API Key',
                credits: credits,
                usage: usage,
                dashboardUrl: 'https://openrouter.ai/activity'
            };

            console.log('[OpenRouter Balance] Final balance data:', JSON.stringify(balanceData, null, 2));

            res.json({
                success: true,
                data: balanceData
            });
        } catch (apiError) {
            if (apiError.response?.status === 401) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid API key',
                    data: {
                        keyValid: false
                    }
                });
            }
            throw apiError;
        }
    } catch (error) {
        console.error('Error getting OpenRouter balance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OpenRouter API key',
            error: error.message
        });
    }
});

// Test OpenRouter connection
exports.testOpenRouterConnection = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const apiKey = settings?.aiServices?.openrouter?.apiKey;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'OpenRouter API key not configured'
            });
        }

        // Test with a simple chat completion
        const testResult = await aiService.chatCompletion([
            { role: 'user', content: 'Say "Connection successful" if you can read this.' }
        ], {
            model: 'openai/gpt-3.5-turbo',
            maxTokens: 20
        });

        res.json({
            success: true,
            message: 'OpenRouter connection successful',
            data: {
                provider: testResult.provider,
                model: testResult.model,
                response: testResult.content
            }
        });
    } catch (error) {
        console.error('Error testing OpenRouter connection:', error);
        res.status(500).json({
            success: false,
            message: 'OpenRouter connection test failed',
            error: error.message
        });
    }
});

// Get OpenRouter models with pricing
exports.getOpenRouterModels = asyncHandler(async (req, res) => {
    try {
        const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
        const apiKey = settings?.aiServices?.openrouter?.apiKey;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'OpenRouter API key not configured'
            });
        }

        // Fetch models from OpenRouter API
        const response = await axios.get('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.APP_URL || 'https://funnelseye.com',
                'X-Title': 'FunnelsEye AI Service'
            },
            timeout: 10000
        });

        // Format models data
        const models = response.data.data || [];
        
        // Helper function to detect model capabilities
        const detectCapabilities = (model) => {
            const capabilities = [];
            const idLower = (model.id || '').toLowerCase();
            const nameLower = (model.name || '').toLowerCase();
            const descLower = (model.description || '').toLowerCase();
            const combined = `${idLower} ${nameLower} ${descLower}`;
            
            // Check for multimodal capabilities
            if (combined.includes('vision') || combined.includes('image') || 
                combined.includes('multimodal') || combined.includes('gpt-4-vision') ||
                combined.includes('claude-3') || combined.includes('claude-3.5') ||
                combined.includes('gemini-pro-vision') || combined.includes('llava')) {
                capabilities.push('image');
            }
            
            if (combined.includes('video') || combined.includes('gpt-4o') || 
                combined.includes('gpt-4-turbo')) {
                capabilities.push('video');
            }
            
            if (combined.includes('audio') || combined.includes('whisper') ||
                combined.includes('tts') || combined.includes('speech')) {
                capabilities.push('audio');
            }
            
            // If no specific capabilities detected, assume text
            if (capabilities.length === 0) {
                capabilities.push('text');
            }
            
            return capabilities;
        };
        
        const formattedModels = models
            .filter(model => model.id && model.pricing)
            .map(model => {
                const capabilities = detectCapabilities(model);
                return {
                    id: model.id,
                    name: model.name || model.id,
                    description: model.description || '',
                    contextLength: model.context_length || 0,
                    pricing: {
                        prompt: model.pricing?.prompt || '0',
                        completion: model.pricing?.completion || '0'
                    },
                    architecture: model.architecture || {},
                    topProvider: model.top_provider || {},
                    capabilities: capabilities // Array of capabilities: ['text'], ['text', 'image'], etc.
                };
            })
            .sort((a, b) => {
                // Sort by name
                return a.name.localeCompare(b.name);
            });

        res.json({
            success: true,
            data: formattedModels
        });
    } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch OpenRouter models',
            error: error.message
        });
    }
});

// Get AI request logs
exports.getAIRequestLogs = asyncHandler(async (req, res) => {
    try {
        const AIRequestLog = require('../schema/AIRequestLog');
        const {
            page = 1,
            limit = 50,
            userId,
            model,
            status,
            startDate,
            endDate,
            search
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        const filter = {};
        if (userId) filter.userId = userId;
        if (model) filter.model = { $regex: model, $options: 'i' };
        if (status && status.trim() !== '') {
            filter.status = status.trim();
        }
        if (startDate || endDate) {
            filter.requestedAt = {};
            if (startDate) filter.requestedAt.$gte = new Date(startDate);
            if (endDate) filter.requestedAt.$lte = new Date(endDate);
        }
        if (search) {
            filter.$or = [
                { model: { $regex: search, $options: 'i' } },
                { userEmail: { $regex: search, $options: 'i' } },
                { prompt: { $regex: search, $options: 'i' } }
            ];
        }

        // Get logs with pagination
        const logs = await AIRequestLog.find(filter)
            .sort({ requestedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'email name role')
            .lean();

        // Get total count
        const total = await AIRequestLog.countDocuments(filter);

        // Get summary stats
        const stats = await AIRequestLog.getStats({
            userId,
            model,
            status,
            startDate,
            endDate
        });

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                },
                stats
            }
        });
    } catch (error) {
        console.error('Error fetching AI request logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch AI request logs',
            error: error.message
        });
    }
});

// Get AI request log by ID
exports.getAIRequestLogById = asyncHandler(async (req, res) => {
    try {
        const AIRequestLog = require('../schema/AIRequestLog');
        const { logId } = req.params;

        const log = await AIRequestLog.findById(logId)
            .populate('userId', 'email name role')
            .lean();

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'AI request log not found'
            });
        }

        res.json({
            success: true,
            data: log
        });
    } catch (error) {
        console.error('Error fetching AI request log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch AI request log',
            error: error.message
        });
    }
});

// Make AI request (high concurrency support - non-blocking)
exports.makeAIRequest = asyncHandler(async (req, res) => {
    try {
        const { prompt, model } = req.body;
        const userId = req.admin?._id;
        const userEmail = req.admin?.email;
        const userRole = req.admin?.role;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        // Get user info for logging
        // Only pass model if explicitly provided - otherwise use default from database
        const options = {
            userId: userId,
            userEmail: userEmail,
            userRole: userRole
        };
        
        // Only include model if it's explicitly provided and not empty
        if (model && model.trim() !== '') {
            options.model = model.trim();
        }
        // If model is not provided, chatCompletion will use the default model from database

        // Make the AI request (this will be logged automatically by aiService)
        // This is non-blocking and can handle thousands of concurrent requests
        const result = await aiService.chatCompletion(
            [{ role: 'user', content: prompt.trim() }],
            options
        );

        if (result.success) {
            res.json({
                success: true,
                data: {
                    response: result.content,
                    model: result.model,
                    usage: result.usage
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'AI request failed',
                error: result.error || 'Unknown error'
            });
        }
    } catch (error) {
        console.error('Error making AI request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to make AI request',
            error: error.message
        });
    }
});