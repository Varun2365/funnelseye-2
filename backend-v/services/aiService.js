const axios = require('axios');
const crypto = require('crypto');

class AIService {
    constructor() {
        this.openrouterBaseUrl = 'https://openrouter.ai/api/v1';
        
        // OpenRouter model configurations
        this.models = {
                gpt4: 'openai/gpt-4',
                gpt4Turbo: 'openai/gpt-4-turbo-preview',
                gpt35: 'openai/gpt-3.5-turbo',
                gpt35Turbo: 'openai/gpt-3.5-turbo-16k',
                claude: 'anthropic/claude-3-sonnet',
                gemini: 'google/gemini-pro',
                llama: 'meta-llama/llama-2-70b-chat'
        };
        
        this.defaultModel = 'openai/gpt-3.5-turbo';
        this.maxRetries = 0; // Disable automatic retries to prevent duplicate charges
        this.retryDelay = 1000;
        
        // Request deduplication: track in-flight requests to prevent duplicates
        this.inFlightRequests = new Map();
    }

    // Get OpenRouter API configuration from database
    async getApiConfig() {
        // ALWAYS check database - this is the only source of truth
        let defaultModel = this.defaultModel;
        let openrouterApiKey = null;
        
        try {
            const AdminSystemSettings = require('../schema/AdminSystemSettings');
            const settings = await AdminSystemSettings.findOne({ settingId: 'global' });
            
            console.log('[AIService] Database settings check:', {
                hasSettings: !!settings,
                hasOpenRouter: !!settings?.aiServices?.openrouter,
                enabled: settings?.aiServices?.openrouter?.enabled,
                hasApiKey: !!settings?.aiServices?.openrouter?.apiKey,
                apiKeyLength: settings?.aiServices?.openrouter?.apiKey?.length,
                defaultModel: settings?.aiServices?.openrouter?.defaultModel
            });
            
            if (settings?.aiServices?.openrouter) {
                // Check if OpenRouter is enabled
                if (!settings.aiServices.openrouter.enabled) {
                    throw new Error('OpenRouter is not enabled in database settings. Please enable OpenRouter and configure the API key in the AI Features settings.');
                }
                
                // Get API key from database - THIS IS THE ONLY SOURCE
                openrouterApiKey = settings.aiServices.openrouter.apiKey;
                // Only use if it's a valid non-empty string
                if (!openrouterApiKey || typeof openrouterApiKey !== 'string' || openrouterApiKey.trim() === '') {
                    console.error('[AIService] ❌ OpenRouter enabled but API key is missing or invalid in database');
                    throw new Error('OpenRouter is enabled but no valid API key is configured in the database. Please set the API key in settings.');
                }
                
                // Get default model from settings
                if (settings.aiServices.openrouter.defaultModel) {
                    defaultModel = settings.aiServices.openrouter.defaultModel;
                }
            } else {
                throw new Error('OpenRouter settings not found in database. Please configure OpenRouter in the AI Features settings.');
            }
        } catch (error) {
            // If it's our custom error, re-throw it
            if (error.message.includes('OpenRouter') || error.message.includes('API key')) {
                throw error;
            }
            console.error('[AIService] ❌ Error loading settings from database:', error.message);
            throw new Error(`Failed to load OpenRouter settings from database: ${error.message}. Please check your database connection.`);
        }

        // Validate API key - must be a non-empty string
        if (!openrouterApiKey || typeof openrouterApiKey !== 'string' || openrouterApiKey.trim() === '') {
            throw new Error('OpenRouter API key is missing or invalid in the database. Please set the API key in settings.');
        }
        
        const trimmedKey = openrouterApiKey.trim();
        
        // Validate default model exists
        if (!defaultModel || defaultModel.trim() === '') {
            console.warn('[AIService] ⚠️  No default model set in database, using fallback');
            defaultModel = this.defaultModel;
        }
        
        console.log(`[AIService] ✅ Using OpenRouter API key from database (length: ${trimmedKey.length})`);
        console.log(`[AIService] ✅ Using default model from database: ${defaultModel}`);
        
            return {
                provider: 'openrouter',
            apiKey: trimmedKey,
                baseURL: this.openrouterBaseUrl,
            models: this.models,
            defaultModel: defaultModel.trim()
            };
    }

    // Generic chat completion method
    async chatCompletion(messages, options = {}) {
        const config = await this.getApiConfig();
        
        // Validate API key
        if (!config.apiKey || config.apiKey.trim() === '') {
            throw new Error(`AI API Error: No API key configured for ${config.provider}. Please configure the API key in settings.`);
        }
        
        const {
            temperature = 0.7,
            maxTokens = 1000,
            retries = options.retries !== undefined ? options.retries : this.maxRetries // Allow override but default to 0
        } = options;

        // Always use the default model from database config
        // Only use model from options if explicitly provided AND it's not undefined/null/empty
        let modelToUse;
        // Always use default model from database unless explicitly overridden
        if (options.model && options.model.trim() !== '') {
            modelToUse = options.model.trim();
            console.log(`[AIService] Using explicitly provided model: ${modelToUse}`);
        } else {
            // Use the default model from database
            modelToUse = config.defaultModel || this.defaultModel;
            console.log(`[AIService] Using default model from database: ${modelToUse}`);
        }

        // OpenRouter uses model IDs directly (e.g., 'openai/gpt-3.5-turbo')
        const modelForRequest = modelToUse;

        const payload = {
            model: modelForRequest,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: false
        };

        // Use ONLY the API key from config (which comes from database)
        const apiKey = config.apiKey.trim();
        if (!apiKey || apiKey === '') {
            throw new Error(`AI API Error: OpenRouter API key is empty. Please configure a valid API key in settings.`);
        }
        
        // Validate that we're using the correct model format for OpenRouter
        if (!modelForRequest.includes('/') && !modelForRequest.includes(':')) {
            console.warn(`[AIService] ⚠️  Warning: Model "${modelForRequest}" doesn't look like an OpenRouter model ID (should be like 'openai/gpt-3.5-turbo')`);
        }
        
        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_URL || 'https://funnelseye.com',
            'X-Title': 'FunnelsEye AI Service'
        };
        
        console.log(`[AIService] Making OpenRouter request to ${config.baseURL}/chat/completions with model: ${modelForRequest}`);
        console.log(`[AIService] Using API key from database (length: ${apiKey.length})`);

        const startTime = Date.now();
        const requestId = crypto.randomUUID();
        let logData = null;

        try {
            const response = await axios.post(
                `${config.baseURL}/chat/completions`,
                payload,
                { headers, timeout: 30000 }
            );

            const duration = Date.now() - startTime;
            const usage = response.data.usage || {};
            const content = response.data.choices[0].message.content;
            
            // Calculate pricing - try to get from response first, then use defaults
            let promptPrice = 0;
            let completionPrice = 0;
            
            // OpenRouter includes pricing in the response
            if (response.data.usage?.prompt_tokens && response.data.usage?.completion_tokens) {
                // Try to get pricing from response if available
                if (response.data.usage.prompt_cost !== undefined) {
                    promptPrice = response.data.usage.prompt_cost;
                } else {
                    promptPrice = this.calculatePromptPrice(modelToUse, usage.prompt_tokens || 0);
                }
                
                if (response.data.usage.completion_cost !== undefined) {
                    completionPrice = response.data.usage.completion_cost;
                } else {
                    completionPrice = this.calculateCompletionPrice(modelToUse, usage.completion_tokens || 0);
                }
            } else {
                // Fallback to calculated pricing
                promptPrice = this.calculatePromptPrice(modelToUse, usage.prompt_tokens || 0);
                completionPrice = this.calculateCompletionPrice(modelToUse, usage.completion_tokens || 0);
            }
            
            const totalCost = promptPrice + completionPrice;

            // Prepare log data
            logData = {
                requestId,
                userId: options.userId || null,
                userEmail: options.userEmail || null,
                userRole: options.userRole || null,
                provider: config.provider,
                model: response.data.model,
                modelId: modelToUse,
                requestType: 'chat',
                endpoint: `${config.baseURL}/chat/completions`,
                promptTokens: usage.prompt_tokens || 0,
                completionTokens: usage.completion_tokens || 0,
                totalTokens: usage.total_tokens || 0,
                promptPrice,
                completionPrice,
                totalCost,
                currency: 'USD',
                prompt: messages.map(m => m.content).join('\n'),
                promptLength: JSON.stringify(messages).length,
                response: content,
                responseLength: content ? content.length : 0,
                status: 'success',
                statusCode: response.status,
                duration,
                metadata: {
                    temperature,
                    maxTokens,
                    modelUsed: modelToUse
                },
                requestedAt: new Date(startTime),
                completedAt: new Date()
            };

            // Log the request asynchronously (don't block the response)
            this.logRequest(logData).catch(err => {
                console.error('Failed to log AI request:', err);
            });

            return {
                success: true,
                content,
                usage: response.data.usage,
                model: response.data.model,
                provider: config.provider,
                requestId
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            
            // Detailed error logging for debugging
            console.error('========== AI REQUEST ERROR ==========');
            console.error('[AIService] Error Type:', error.constructor.name);
            console.error('[AIService] Error Message:', error.message);
            console.error('[AIService] Error Code:', error.code);
            console.error('[AIService] Response Status:', error.response?.status);
            console.error('[AIService] Response Status Text:', error.response?.statusText);
            console.error('[AIService] Response Headers:', JSON.stringify(error.response?.headers || {}, null, 2));
            console.error('[AIService] Response Data:', JSON.stringify(error.response?.data || {}, null, 2));
            console.error('[AIService] Request URL:', `${config.baseURL}/chat/completions`);
            console.error('[AIService] Request Model:', modelForRequest);
            console.error('[AIService] Request Payload:', JSON.stringify(payload, null, 2));
            console.error('[AIService] Provider:', config.provider);
            console.error('======================================');
            
            // Log error
            logData = {
                requestId,
                userId: options.userId || null,
                userEmail: options.userEmail || null,
                userRole: options.userRole || null,
                provider: config.provider,
                model: modelToUse,
                modelId: modelToUse,
                requestType: 'chat',
                endpoint: `${config.baseURL}/chat/completions`,
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
                promptPrice: 0,
                completionPrice: 0,
                totalCost: 0,
                currency: 'USD',
                prompt: messages.map(m => m.content).join('\n'),
                promptLength: JSON.stringify(messages).length,
                status: error.response?.status === 429 ? 'rate_limited' : 
                       error.code === 'ECONNABORTED' ? 'timeout' : 'error',
                statusCode: error.response?.status || null,
                errorMessage: error.response?.data?.error?.message || error.message,
                duration,
                metadata: {
                    temperature,
                    maxTokens,
                    errorCode: error.code,
                    fullError: JSON.stringify(error.response?.data || {})
                },
                requestedAt: new Date(startTime),
                completedAt: new Date()
            };

            this.logRequest(logData).catch(err => {
                console.error('Failed to log AI request error:', err);
            });

            // Only retry if explicitly allowed and error is retryable
            // This prevents duplicate charges on permanent failures
            if (retries > 0 && this.isRetryableError(error)) {
                console.log(`[AIService] Retrying request (${retries} retries remaining) due to retryable error`);
                await this.delay(this.retryDelay);
                return this.chatCompletion(messages, { ...options, retries: retries - 1 });
            }
            
            // Extract detailed error message
            let errorMsg = 'Unknown error';
            const responseData = error.response?.data;
            
            // Try to extract the actual error from nested structures
            if (responseData?.error?.metadata?.raw) {
                // OpenRouter sometimes nests the real error in metadata.raw
                try {
                    const rawError = JSON.parse(responseData.error.metadata.raw);
                    if (rawError.error) {
                        errorMsg = rawError.error;
                    } else if (rawError.message) {
                        errorMsg = rawError.message;
                    }
                } catch (e) {
                    // If parsing fails, use the raw string
                    errorMsg = responseData.error.metadata.raw;
                }
            } else if (responseData?.error?.message) {
                errorMsg = responseData.error.message;
            } else if (responseData?.message) {
                errorMsg = responseData.message;
            } else if (responseData) {
                errorMsg = JSON.stringify(responseData);
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            const statusCode = error.response?.status;
            
            // Provide user-friendly error messages for common status codes
            if (statusCode === 402) {
                errorMsg = `Payment Required: ${errorMsg}. Please check your OpenRouter account balance and API key spending limits.`;
            } else if (statusCode === 401) {
                errorMsg = `Unauthorized: ${errorMsg}. Please check your API key.`;
            } else if (statusCode === 403) {
                errorMsg = `Forbidden: ${errorMsg}. You may not have permission to use this model or API key.`;
            } else if (statusCode === 404) {
                // Check if it's a data policy issue with free models
                if (errorMsg.toLowerCase().includes('data policy') || errorMsg.toLowerCase().includes('free model publication')) {
                    errorMsg = `Data Policy Error: ${errorMsg}\n\nFree models require allowing data publication. Please:\n1. Go to https://openrouter.ai/settings/privacy\n2. Enable "Allow free model publication"\n3. Or switch to a paid model in your settings.`;
                } else {
                    errorMsg = `Not Found: ${errorMsg}. The model or endpoint may not exist.`;
                }
            } else if (statusCode === 429) {
                errorMsg = `Rate Limited: ${errorMsg}. Please try again later.`;
            }
            
            console.error(`[AIService] Request failed (non-retryable): Status=${statusCode}, Error=${errorMsg}`);
            
            throw new Error(`AI API Error: ${errorMsg}`);
        }
    }

    // AI Copy Agent - Generate marketing copy
    async generateMarketingCopy(prompt, options = {}) {
        const messages = [
            {
                role: 'system',
                content: `You are an expert marketing copywriter specializing in fitness, coaching, and business growth. 
                Generate compelling, conversion-focused copy that resonates with the target audience. 
                Focus on benefits, emotional triggers, and clear calls-to-action.`
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        // Don't pass model - let chatCompletion use default from database
        return this.chatCompletion(messages, {
            temperature: options.temperature || 0.8,
            maxTokens: options.maxTokens || 500,
            ...(options.model && { model: options.model }) // Only pass model if explicitly provided
        });
    }

    // Generate headlines and CTAs
    async generateHeadlines(product, targetAudience, count = 5) {
        const prompt = `Generate ${count} compelling marketing headlines for a ${product} targeting ${targetAudience}. 
        Make them attention-grabbing, benefit-focused, and optimized for conversions. 
        Include emotional triggers and urgency where appropriate.`;

        return this.generateMarketingCopy(prompt, { maxTokens: 300 });
    }

    // Generate social media posts
    async generateSocialPost(coachName, niche, offer, targetAudience) {
        const prompt = `Create a compelling social media post for ${coachName}, a ${niche} coach offering ${offer}. 
        Target audience: ${targetAudience}. 
        Make it engaging, include relevant hashtags, and end with a clear call-to-action. 
        Keep it under 280 characters for Twitter compatibility.`;

        return this.generateMarketingCopy(prompt, { maxTokens: 200 });
    }

            // Sentiment Analysis for messages (WhatsApp functionality moved to dustbin/whatsapp-dump/)
    async analyzeSentiment(message) {
        const messages = [
            {
                role: 'system',
                content: `You are an expert in sentiment analysis. Analyze the emotional tone and intent of the given message. 
                Return a JSON response with: sentiment (positive/negative/neutral), confidence (0-1), 
                emotions (array of detected emotions), and intent (what the person wants/needs).`
            },
            {
                role: 'user',
                content: `Analyze the sentiment of this message: "${message}"`
            }
        ];

        try {
            // Don't pass model - let chatCompletion use default from database
            const response = await this.chatCompletion(messages, {
                temperature: 0.3,
                maxTokens: 200
            });

            // Try to parse JSON response
            try {
                const parsed = JSON.parse(response.content);
                return {
                    success: true,
                    ...parsed,
                    rawResponse: response.content
                };
            } catch (parseError) {
                // If JSON parsing fails, extract sentiment manually
                return this.extractSentimentFromText(response.content, message);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                sentiment: 'neutral',
                confidence: 0.5,
                emotions: [],
                intent: 'unknown'
            };
        }
    }

    // Extract sentiment from AI response text
    extractSentimentFromText(aiResponse, originalMessage) {
        const response = aiResponse.toLowerCase();
        let sentiment = 'neutral';
        let confidence = 0.5;
        let emotions = [];
        let intent = 'unknown';

        // Basic sentiment detection
        if (response.includes('positive') || response.includes('happy') || response.includes('excited')) {
            sentiment = 'positive';
            confidence = 0.7;
        } else if (response.includes('negative') || response.includes('angry') || response.includes('frustrated')) {
            sentiment = 'negative';
            confidence = 0.7;
        }

        // Extract emotions
        const emotionKeywords = ['happy', 'excited', 'interested', 'frustrated', 'confused', 'angry', 'sad', 'anxious'];
        emotions = emotionKeywords.filter(emotion => response.includes(emotion));

        // Extract intent
        if (response.includes('question') || response.includes('ask')) {
            intent = 'question';
        } else if (response.includes('complaint') || response.includes('problem')) {
            intent = 'complaint';
        } else if (response.includes('interest') || response.includes('want')) {
            intent = 'interest';
        }

        return {
            success: true,
            sentiment,
            confidence,
            emotions,
            intent,
            rawResponse: aiResponse
        };
    }

    // Generate personalized responses based on sentiment
    async generateContextualResponse(userMessage, sentiment, context = {}) {
        const messages = [
            {
                role: 'system',
                content: `You are a helpful AI assistant for a fitness coaching business. 
                Generate a contextual response based on the user's message and detected sentiment. 
                Be empathetic, helpful, and guide them toward the next step in their journey. 
                Keep responses conversational and under 150 characters.`
            },
            {
                role: 'user',
                content: `User message: "${userMessage}"
                Detected sentiment: ${sentiment}
                Context: ${JSON.stringify(context)}
                
                Generate an appropriate response.`
            }
        ];

        // Don't pass model - let chatCompletion use default from database
        return this.chatCompletion(messages, {
            temperature: 0.7,
            maxTokens: 150
        });
    }

    // Generate SOP (Standard Operating Procedure)
    async generateSOP(taskType, context) {
        const prompt = `Create a detailed Standard Operating Procedure (SOP) for ${taskType} in the context of ${context}. 
        Include step-by-step instructions, best practices, common pitfalls to avoid, and quality checkpoints. 
        Make it practical and actionable for team members to follow.`;

        const messages = [
            {
                role: 'system',
                content: `You are an expert in business process optimization and SOP creation. 
                Create clear, actionable, and comprehensive standard operating procedures.`
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        // Don't pass model - let chatCompletion use default from database
        return this.chatCompletion(messages, {
            temperature: 0.5,
            maxTokens: 800
        });
    }

    // Generate lead qualification insights
    async generateLeadInsights(leadData) {
        const prompt = `Analyze this lead data and provide insights:
        ${JSON.stringify(leadData, null, 2)}
        
        Provide:
        1. Lead quality score (1-10)
        2. Key insights about the lead
        3. Recommended next steps
        4. Potential objections to prepare for
        5. Best approach strategy`;

        const messages = [
            {
                role: 'system',
                content: `You are an expert sales and lead qualification specialist. 
                Analyze lead data and provide actionable insights for sales teams.`
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        // Don't pass model - let chatCompletion use default from database
        return this.chatCompletion(messages, {
            temperature: 0.6,
            maxTokens: 600
        });
    }

    // Content optimization suggestions
    async optimizeContent(content, targetAudience, goal) {
        const prompt = `Optimize this content for ${targetAudience} with the goal of ${goal}:
        
        Original content:
        "${content}"
        
        Provide:
        1. Optimized version
        2. Key improvements made
        3. A/B testing suggestions
        4. Performance optimization tips`;

        const messages = [
            {
                role: 'system',
                content: `You are an expert content optimizer and conversion rate specialist. 
                Help improve content effectiveness and engagement.`
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        // Don't pass model - let chatCompletion use default from database
        return this.chatCompletion(messages, {
            temperature: 0.7,
            maxTokens: 500
        });
    }

    // Check if error is retryable
    isRetryableError(error) {
        // Only retry on network errors, timeouts, or specific server errors
        // NEVER retry on client errors (4xx) as they indicate invalid requests
        const status = error.response?.status;
        
        // Don't retry on client errors (4xx) - these are permanent failures
        if (status && status >= 400 && status < 500) {
            return false;
        }
        
        // Only retry on specific server errors or network issues
        const retryableStatuses = [429, 500, 502, 503, 504];
        const retryableMessages = ['rate limit', 'timeout', 'network', 'econnrefused', 'etimedout'];
        
        // Check for network errors (no response)
        if (!error.response && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED')) {
            return true;
        }
        
        return (
            retryableStatuses.includes(status) ||
            retryableMessages.some(msg => 
                error.message.toLowerCase().includes(msg) ||
                (error.response?.data?.error?.message?.toLowerCase() || '').includes(msg)
            )
        );
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get available models
    async getAvailableModels() {
        const config = await this.getApiConfig();
        return {
            provider: config.provider,
            models: config.models,
            defaultModel: config.defaultModel || this.defaultModel
        };
    }

    // Test API connection
    async testConnection() {
        try {
            const config = await this.getApiConfig();
            const response = await this.chatCompletion([
                { role: 'user', content: 'Hello, this is a test message.' }
            ], { maxTokens: 10 });
            
            return {
                success: true,
                provider: config.provider,
                model: response.model,
                message: 'API connection successful'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'API connection failed'
            };
        }
    }

    // Calculate prompt price based on model and tokens (OpenRouter models only)
    calculatePromptPrice(model, tokens) {
        // Default pricing per 1M tokens (approximate) for OpenRouter models
        const pricing = {
            'openai/gpt-4': 30.0,
            'openai/gpt-4-turbo': 10.0,
            'openai/gpt-4-turbo-preview': 10.0,
            'openai/gpt-3.5-turbo': 0.5,
            'openai/gpt-3.5-turbo-16k': 0.5,
            'anthropic/claude-3-sonnet': 3.0,
            'anthropic/claude-3-opus': 15.0,
            'google/gemini-pro': 0.5,
            'google/gemini-2.0-flash-lite-001': 0.1,
            'meta-llama/llama-2-70b-chat': 0.7
        };
        
        const pricePerMillion = pricing[model] || 1.0;
        return (pricePerMillion / 1000000) * tokens;
    }

    // Calculate completion price based on model and tokens (OpenRouter models only)
    calculateCompletionPrice(model, tokens) {
        // Default pricing per 1M tokens (approximate) for OpenRouter models
        const pricing = {
            'openai/gpt-4': 60.0,
            'openai/gpt-4-turbo': 30.0,
            'openai/gpt-4-turbo-preview': 30.0,
            'openai/gpt-3.5-turbo': 1.5,
            'openai/gpt-3.5-turbo-16k': 1.5,
            'anthropic/claude-3-sonnet': 15.0,
            'anthropic/claude-3-opus': 75.0,
            'google/gemini-pro': 1.5,
            'google/gemini-2.0-flash-lite-001': 0.1,
            'meta-llama/llama-2-70b-chat': 2.0
        };
        
        const pricePerMillion = pricing[model] || 2.0;
        return (pricePerMillion / 1000000) * tokens;
    }

    // Log AI request to database
    async logRequest(logData) {
        try {
            const AIRequestLog = require('../schema/AIRequestLog');
            await AIRequestLog.create(logData);
        } catch (error) {
            console.error('Error logging AI request:', error);
            // Don't throw - logging failures shouldn't break the main flow
        }
    }
}

module.exports = new AIService();
