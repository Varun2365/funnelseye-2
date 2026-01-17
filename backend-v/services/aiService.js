const axios = require('axios');

class AIService {
    constructor() {
        this.openaiApiKey = process.env.OPENAI_API_KEY;
        this.openrouterApiKey = process.env.OPENROUTER_API_KEY;
        this.openaiBaseUrl = 'https://api.openai.com/v1';
        this.openrouterBaseUrl = 'https://openrouter.ai/api/v1';
        
        // Model configurations
        this.models = {
            openai: {
                gpt4: 'gpt-4',
                gpt4Turbo: 'gpt-4-turbo-preview',
                gpt35: 'gpt-3.5-turbo',
                gpt35Turbo: 'gpt-3.5-turbo-16k'
            },
            openrouter: {
                gpt4: 'openai/gpt-4',
                gpt4Turbo: 'openai/gpt-4-turbo-preview',
                gpt35: 'openai/gpt-3.5-turbo',
                gpt35Turbo: 'openai/gpt-3.5-turbo-16k',
                claude: 'anthropic/claude-3-sonnet',
                gemini: 'google/gemini-pro',
                llama: 'meta-llama/llama-2-70b-chat'
            }
        };
        
        this.defaultModel = 'gpt-3.5-turbo';
        this.maxRetries = 3;
        this.retryDelay = 1000;
    }

    // Get the best available API configuration
    getApiConfig() {
        if (this.openaiApiKey) {
            return {
                provider: 'openai',
                apiKey: this.openaiApiKey,
                baseURL: this.openaiBaseUrl,
                models: this.models.openai
            };
        } else if (this.openrouterApiKey) {
            return {
                provider: 'openrouter',
                apiKey: this.openrouterApiKey,
                baseURL: this.openrouterBaseUrl,
                models: this.models.openrouter
            };
        }
        throw new Error('No AI API key configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY');
    }

    // Generic chat completion method
    async chatCompletion(messages, options = {}) {
        const config = this.getApiConfig();
        const {
            model = this.defaultModel,
            temperature = 0.7,
            maxTokens = 1000,
            retries = this.maxRetries
        } = options;

        const payload = {
            model: config.models[model] || model,
            messages,
            temperature,
            max_tokens: maxTokens,
            stream: false
        };

        // Add OpenRouter specific headers
        const headers = {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
        };

        if (config.provider === 'openrouter') {
            headers['HTTP-Referer'] = process.env.APP_URL || 'https://funnelseye.com';
            headers['X-Title'] = 'FunnelsEye AI Service';
        }

        try {
            const response = await axios.post(
                `${config.baseURL}/chat/completions`,
                payload,
                { headers, timeout: 30000 }
            );

            return {
                success: true,
                content: response.data.choices[0].message.content,
                usage: response.data.usage,
                model: response.data.model,
                provider: config.provider
            };
        } catch (error) {
            if (retries > 0 && this.isRetryableError(error)) {
                await this.delay(this.retryDelay);
                return this.chatCompletion(messages, { ...options, retries: retries - 1 });
            }
            
            throw new Error(`AI API Error: ${error.response?.data?.error?.message || error.message}`);
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

        return this.chatCompletion(messages, {
            temperature: options.temperature || 0.8,
            maxTokens: options.maxTokens || 500,
            model: options.model || 'gpt-3.5-turbo'
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
            const response = await this.chatCompletion(messages, {
                temperature: 0.3,
                maxTokens: 200,
                model: 'gpt-3.5-turbo'
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

        return this.chatCompletion(messages, {
            temperature: 0.7,
            maxTokens: 150,
            model: 'gpt-3.5-turbo'
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

        return this.chatCompletion(messages, {
            temperature: 0.5,
            maxTokens: 800,
            model: 'gpt-3.5-turbo'
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

        return this.chatCompletion(messages, {
            temperature: 0.6,
            maxTokens: 600,
            model: 'gpt-3.5-turbo'
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

        return this.chatCompletion(messages, {
            temperature: 0.7,
            maxTokens: 500,
            model: 'gpt-3.5-turbo'
        });
    }

    // Check if error is retryable
    isRetryableError(error) {
        const retryableStatuses = [429, 500, 502, 503, 504];
        const retryableMessages = ['rate limit', 'timeout', 'server error', 'internal error'];
        
        return (
            retryableStatuses.includes(error.response?.status) ||
            retryableMessages.some(msg => 
                error.message.toLowerCase().includes(msg) ||
                error.response?.data?.error?.message?.toLowerCase().includes(msg)
            )
        );
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get available models
    getAvailableModels() {
        const config = this.getApiConfig();
        return {
            provider: config.provider,
            models: config.models,
            defaultModel: this.defaultModel
        };
    }

    // Test API connection
    async testConnection() {
        try {
            const config = this.getApiConfig();
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
}

module.exports = new AIService();
