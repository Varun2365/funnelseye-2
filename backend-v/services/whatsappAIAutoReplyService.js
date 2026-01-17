const aiService = require('./aiService');
const WhatsAppAIKnowledge = require('../schema/WhatsAppAIKnowledge');
const WhatsAppInbox = require('../schema/WhatsAppInbox');
const WhatsAppMessage = require('../schema/WhatsAppMessage');
const centralWhatsAppService = require('./centralWhatsAppService');

class WhatsAppAIAutoReplyService {
    constructor() {
        this.isProcessing = false;
        this.processingQueue = [];
    }

    /**
     * Process incoming message and generate AI reply
     * @param {Object} messageData - Incoming message data
     * @returns {Promise<Object>} - AI reply data
     */
    async processIncomingMessage(messageData) {
        try {
            console.log('🤖 [AI_AUTO_REPLY] Processing incoming message:', messageData.messageId);

            // Get active AI knowledge base
            const knowledgeBase = await this.getActiveKnowledgeBase();
            if (!knowledgeBase) {
                console.log('🤖 [AI_AUTO_REPLY] No active knowledge base found');
                return null;
            }

            // Check if auto-reply is enabled
            if (!knowledgeBase.responseSettings.autoReplyEnabled) {
                console.log('🤖 [AI_AUTO_REPLY] Auto-reply is disabled');
                return null;
            }

            // Check business hours
            if (knowledgeBase.businessHours.enabled && !this.isWithinBusinessHours(knowledgeBase.businessHours)) {
                console.log('🤖 [AI_AUTO_REPLY] Outside business hours');
                return {
                    type: 'after_hours',
                    message: knowledgeBase.businessHours.afterHoursMessage,
                    isAutoReply: true
                };
            }

            // Check for specific auto-reply rules first
            const ruleResponse = await this.checkAutoReplyRules(messageData, knowledgeBase);
            if (ruleResponse) {
                console.log('🤖 [AI_AUTO_REPLY] Matched auto-reply rule');
                return ruleResponse;
            }

            // Generate AI response
            const aiResponse = await this.generateAIResponse(messageData, knowledgeBase);
            
            // Update knowledge base stats
            await this.updateKnowledgeBaseStats(knowledgeBase._id, true);

            return aiResponse;

        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error processing message:', error);
            await this.updateKnowledgeBaseStats(knowledgeBase?._id, false);
            return null;
        }
    }

    /**
     * Get active AI knowledge base
     * @returns {Promise<Object>} - Active knowledge base
     */
    async getActiveKnowledgeBase() {
        try {
            const knowledgeBase = await WhatsAppAIKnowledge.findOne({
                isActive: true,
                isDefault: true
            });

            if (!knowledgeBase) {
                // Fallback to any active knowledge base
                return await WhatsAppAIKnowledge.findOne({ isActive: true });
            }

            return knowledgeBase;
        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error getting knowledge base:', error);
            return null;
        }
    }

    /**
     * Check auto-reply rules
     * @param {Object} messageData - Message data
     * @param {Object} knowledgeBase - Knowledge base
     * @returns {Promise<Object|null>} - Rule response or null
     */
    async checkAutoReplyRules(messageData, knowledgeBase) {
        try {
            const messageText = messageData.content?.text?.toLowerCase() || '';
            
            // Sort rules by priority (higher priority first)
            const sortedRules = knowledgeBase.autoReplyRules
                .filter(rule => rule.isActive)
                .sort((a, b) => b.priority - a.priority);

            for (const rule of sortedRules) {
                const trigger = rule.trigger.toLowerCase();
                let matches = false;

                switch (rule.condition) {
                    case 'contains':
                        matches = messageText.includes(trigger);
                        break;
                    case 'equals':
                        matches = messageText === trigger;
                        break;
                    case 'starts_with':
                        matches = messageText.startsWith(trigger);
                        break;
                    case 'regex':
                        try {
                            const regex = new RegExp(trigger, 'i');
                            matches = regex.test(messageText);
                        } catch (e) {
                            console.error('Invalid regex pattern:', trigger);
                        }
                        break;
                }

                if (matches) {
                    return {
                        type: 'rule_response',
                        message: rule.response,
                        isAutoReply: true,
                        ruleId: rule._id
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error checking rules:', error);
            return null;
        }
    }

    /**
     * Generate AI response using OpenAI
     * @param {Object} messageData - Message data
     * @param {Object} knowledgeBase - Knowledge base
     * @returns {Promise<Object>} - AI response
     */
    async generateAIResponse(messageData, knowledgeBase) {
        try {
            const messageText = messageData.content?.text || '';
            const senderName = messageData.senderName || 'Customer';

            // Build context for AI
            const context = this.buildAIContext(knowledgeBase, messageData);
            
            // Create prompt for AI
            const prompt = this.createAIPrompt(knowledgeBase, messageText, senderName, context);

            // Generate response using AI service
            const aiResponse = await aiService.generateResponse(prompt, {
                temperature: 0.7,
                maxTokens: knowledgeBase.responseSettings.maxLength,
                stop: ['\n\n', 'Human:', 'Assistant:']
            });

            if (!aiResponse || !aiResponse.content) {
                throw new Error('No response generated by AI');
            }

            let responseText = aiResponse.content.trim();

            // Apply tone and formatting
            responseText = this.formatResponse(responseText, knowledgeBase.responseSettings);

            return {
                type: 'ai_response',
                message: responseText,
                isAutoReply: true,
                confidence: aiResponse.confidence || 0.8,
                prompt: prompt,
                response: responseText
            };

        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error generating AI response:', error);
            throw error;
        }
    }

    /**
     * Build AI context from knowledge base
     * @param {Object} knowledgeBase - Knowledge base
     * @param {Object} messageData - Message data
     * @returns {Object} - Context object
     */
    buildAIContext(knowledgeBase, messageData) {
        const businessInfo = knowledgeBase.businessInfo;
        
        return {
            companyName: businessInfo.companyName || 'Our Company',
            services: businessInfo.services || [],
            products: businessInfo.products || [],
            pricing: businessInfo.pricing || 'Contact us for pricing',
            contactInfo: businessInfo.contactInfo || '',
            website: businessInfo.website || '',
            socialMedia: businessInfo.socialMedia || [],
            senderPhone: messageData.senderPhone,
            senderName: messageData.senderName || 'Customer',
            messageTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };
    }

    /**
     * Create AI prompt
     * @param {Object} knowledgeBase - Knowledge base
     * @param {String} messageText - Message text
     * @param {String} senderName - Sender name
     * @param {Object} context - Context object
     * @returns {String} - AI prompt
     */
    createAIPrompt(knowledgeBase, messageText, senderName, context) {
        const systemPrompt = knowledgeBase.systemPrompt;
        const maxLength = knowledgeBase.responseSettings.maxLength;
        const tone = knowledgeBase.responseSettings.tone;

        return `${systemPrompt}

BUSINESS INFORMATION:
- Company: ${context.companyName}
- Services: ${context.services.join(', ')}
- Products: ${context.products.join(', ')}
- Pricing: ${context.pricing}
- Contact: ${context.contactInfo}
- Website: ${context.website}

RESPONSE GUIDELINES:
- Keep responses under ${maxLength} characters
- Use a ${tone} tone
- Be helpful and informative
- Don't mention you're an AI
- Keep responses conversational and natural
- Use emojis sparingly but appropriately
- If you don't know something, suggest contacting us directly

CUSTOMER MESSAGE: "${messageText}"
CUSTOMER NAME: ${senderName}
CURRENT TIME: ${context.messageTime}

Respond naturally as a helpful customer service representative:`;
    }

    /**
     * Format response based on settings
     * @param {String} response - Raw response
     * @param {Object} settings - Response settings
     * @returns {String} - Formatted response
     */
    formatResponse(response, settings) {
        let formattedResponse = response;

        // Remove AI-like phrases
        const aiPhrases = [
            'I am an AI',
            'I\'m an AI',
            'As an AI',
            'I cannot',
            'I\'m sorry, but I',
            'I don\'t have the ability',
            'I\'m not able to'
        ];

        aiPhrases.forEach(phrase => {
            formattedResponse = formattedResponse.replace(new RegExp(phrase, 'gi'), '');
        });

        // Add emojis if enabled
        if (settings.includeEmojis) {
            // Add appropriate emojis based on content
            if (formattedResponse.includes('thank')) {
                formattedResponse = formattedResponse.replace(/thank/gi, '🙏 thank');
            }
            if (formattedResponse.includes('help')) {
                formattedResponse = formattedResponse.replace(/help/gi, '🤝 help');
            }
        }

        return formattedResponse.trim();
    }

    /**
     * Check if current time is within business hours
     * @param {Object} businessHours - Business hours config
     * @returns {Boolean} - Is within business hours
     */
    isWithinBusinessHours(businessHours) {
        if (!businessHours.enabled) return true;

        const now = new Date();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const currentTime = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            timeZone: businessHours.timezone 
        }).substring(0, 5);

        const todaySchedule = businessHours.schedule.find(
            schedule => schedule.day === currentDay && schedule.isActive
        );

        if (!todaySchedule) return false;

        return currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
    }

    /**
     * Update knowledge base statistics
     * @param {String} knowledgeId - Knowledge base ID
     * @param {Boolean} success - Whether the reply was successful
     */
    async updateKnowledgeBaseStats(knowledgeId, success) {
        try {
            if (!knowledgeId) return;

            const updateData = {
                'stats.totalReplies': 1,
                'stats.lastUsed': new Date()
            };

            if (success) {
                // Calculate success rate (simplified)
                const knowledgeBase = await WhatsAppAIKnowledge.findById(knowledgeId);
                const currentRate = knowledgeBase?.stats?.successRate || 0;
                updateData['stats.successRate'] = Math.min(currentRate + 1, 100);
            }

            await WhatsAppAIKnowledge.findByIdAndUpdate(knowledgeId, {
                $inc: { 'stats.totalReplies': 1 },
                $set: {
                    'stats.lastUsed': new Date(),
                    ...(success && { 'stats.successRate': Math.min((knowledgeBase?.stats?.successRate || 0) + 1, 100) })
                }
            });

        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error updating stats:', error);
        }
    }

    /**
     * Send AI reply via WhatsApp
     * @param {Object} messageData - Original message data
     * @param {Object} aiResponse - AI response data
     * @returns {Promise<Object>} - Send result
     */
    async sendAIReply(messageData, aiResponse) {
        try {
            console.log('🤖 [AI_AUTO_REPLY] Sending AI reply:', aiResponse.message);

            // Send message via central WhatsApp service
            const sendResult = await centralWhatsAppService.sendMessage({
                to: messageData.senderPhone,
                message: aiResponse.message,
                type: 'text'
            });

            // Create inbox record for the reply
            const inboxRecord = new WhatsAppInbox({
                messageId: `ai_reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                wamid: sendResult.wamid,
                senderPhone: messageData.recipientPhone, // Our phone number
                recipientPhone: messageData.senderPhone,
                conversationId: messageData.conversationId,
                messageType: 'text',
                content: {
                    text: aiResponse.message
                },
                direction: 'outbound',
                status: 'sent',
                sentAt: new Date(),
                aiProcessed: true,
                aiReply: {
                    generated: true,
                    messageId: messageData.messageId,
                    prompt: aiResponse.prompt,
                    response: aiResponse.message,
                    confidence: aiResponse.confidence,
                    processedAt: new Date()
                },
                userId: messageData.userId,
                userType: messageData.userType,
                threadId: messageData.threadId,
                category: 'ai_reply',
                priority: 'low',
                isAutoReply: true
            });

            await inboxRecord.save();

            // Also create WhatsAppMessage record for tracking
            const messageRecord = new WhatsAppMessage({
                messageId: inboxRecord.messageId,
                wamid: sendResult.wamid,
                senderId: messageData.userId,
                senderType: 'system',
                recipientPhone: messageData.senderPhone,
                conversationId: messageData.conversationId,
                messageType: 'text',
                content: {
                    text: aiResponse.message
                },
                status: 'sent',
                sentAt: new Date(),
                creditsUsed: 1,
                metadata: {
                    aiGenerated: true,
                    originalMessageId: messageData.messageId,
                    confidence: aiResponse.confidence
                }
            });

            await messageRecord.save();

            return {
                success: true,
                messageId: inboxRecord.messageId,
                wamid: sendResult.wamid,
                aiResponse: aiResponse
            };

        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error sending AI reply:', error);
            throw error;
        }
    }

    /**
     * Process webhook message for auto-reply
     * @param {Object} webhookData - Webhook data from Meta
     * @returns {Promise<Object>} - Processing result
     */
    async processWebhookMessage(webhookData) {
        try {
            console.log('🤖 [AI_AUTO_REPLY] Processing webhook message');

            // Extract message data from webhook
            const messageData = this.extractMessageFromWebhook(webhookData);
            if (!messageData) {
                console.log('🤖 [AI_AUTO_REPLY] No valid message data found in webhook');
                return { success: false, reason: 'No valid message data' };
            }

            // Check if this is an inbound message
            if (messageData.direction !== 'inbound') {
                console.log('🤖 [AI_AUTO_REPLY] Not an inbound message, skipping');
                return { success: false, reason: 'Not inbound message' };
            }

            // Create inbox record for incoming message
            const inboxRecord = new WhatsAppInbox({
                messageId: messageData.messageId,
                wamid: messageData.wamid,
                senderPhone: messageData.senderPhone,
                senderName: messageData.senderName,
                recipientPhone: messageData.recipientPhone,
                conversationId: messageData.conversationId,
                messageType: messageData.messageType,
                content: messageData.content,
                direction: 'inbound',
                status: 'delivered',
                sentAt: messageData.sentAt,
                userId: messageData.userId,
                userType: messageData.userType,
                threadId: messageData.threadId,
                category: 'inbound'
            });

            await inboxRecord.save();

            // Process for AI auto-reply
            const aiResponse = await this.processIncomingMessage(messageData);
            
            if (aiResponse && aiResponse.isAutoReply) {
                // Send AI reply
                const sendResult = await this.sendAIReply(messageData, aiResponse);
                
                return {
                    success: true,
                    aiReplySent: true,
                    messageId: sendResult.messageId,
                    aiResponse: aiResponse
                };
            }

            return {
                success: true,
                aiReplySent: false,
                reason: 'No auto-reply generated'
            };

        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error processing webhook:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Extract message data from webhook
     * @param {Object} webhookData - Webhook data
     * @returns {Object|null} - Extracted message data
     */
    extractMessageFromWebhook(webhookData) {
        try {
            // This would need to be implemented based on Meta's webhook format
            // For now, returning a placeholder structure
            return {
                messageId: webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id,
                wamid: webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id,
                senderPhone: webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from,
                senderName: webhookData.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name,
                recipientPhone: webhookData.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id,
                conversationId: webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from,
                messageType: 'text',
                content: {
                    text: webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body
                },
                direction: 'inbound',
                sentAt: new Date(webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.timestamp * 1000),
                userId: null, // Would need to be determined based on business logic
                userType: 'admin',
                threadId: webhookData.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from
            };
        } catch (error) {
            console.error('🤖 [AI_AUTO_REPLY] Error extracting message from webhook:', error);
            return null;
        }
    }
}

module.exports = new WhatsAppAIAutoReplyService();
