// D:\PRJ_YCT_Final\workers\worker_message_processor.js
// Worker to process queued WhatsApp and Email messages

const amqp = require('amqplib');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const messageQueueService = require('../services/messageQueueService');
const centralWhatsAppService = require('../services/centralWhatsAppService');
const emailConfigService = require('../services/emailConfigService');
const WhatsAppMessage = require('../schema/WhatsAppMessage');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye';

// Initialize message processor worker
const initMessageProcessorWorker = async () => {
    try {
        logger.info('[MESSAGE_WORKER] Initializing message processor worker...');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        logger.info('[MESSAGE_WORKER] Connected to MongoDB');

        // Connect to RabbitMQ
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        logger.info('[MESSAGE_WORKER] Connected to RabbitMQ');

        // Ensure queues exist with same options as messageQueueService
        const queues = {
            whatsapp: 'whatsapp_messages',
            email: 'email_messages',
            bulk: 'bulk_messages'
        };

        const queueOptions = {
            durable: true,
            arguments: {
                'x-message-ttl': 86400000, // 24 hours TTL (must match messageQueueService)
                'x-max-retries': 3
            }
        };

        for (const [name, queueName] of Object.entries(queues)) {
            let currentChannel = channel;
            try {
                await currentChannel.assertQueue(queueName, queueOptions);
            } catch (error) {
                // If queue exists with different arguments (406), delete and recreate
                if (error.code === 406) {
                    logger.warn(`[MESSAGE_WORKER] Queue ${queueName} exists with different arguments. Fixing it...`);
                    
                    // Channel may be closed after 406 error, recreate it
                    try {
                        if (currentChannel) {
                            await currentChannel.close().catch(() => {});
                        }
                    } catch (closeError) {
                        // Ignore
                    }
                    currentChannel = await connection.createChannel();
                    channel = currentChannel; // Update main channel reference
                    
                    // Delete and recreate the queue
                    try {
                        await currentChannel.deleteQueue(queueName, { ifEmpty: false }).catch(() => {});
                        await new Promise(resolve => setTimeout(resolve, 200));
                        await currentChannel.assertQueue(queueName, queueOptions);
                    } catch (retryError) {
                        logger.error(`[MESSAGE_WORKER] Failed to fix queue ${queueName}:`, retryError);
                        throw retryError;
                    }
                } else {
                    throw error;
                }
            }
        }

        // Set prefetch to process one message at a time (prevent overwhelming)
        await channel.prefetch(1);

        // Process WhatsApp messages
        channel.consume(queues.whatsapp, async (msg) => {
            if (msg) {
                try {
                    const queueMessage = JSON.parse(msg.content.toString());
                    logger.info(`[MESSAGE_WORKER] 📥 Received WhatsApp message from queue - Recipient: ${queueMessage.data?.to}, Queue: ${queues.whatsapp}`);

                    const messageData = queueMessage.data;
                    
                    // Process the message
                    const result = await processWhatsAppMessage(messageData);

                    // Acknowledge message
                    channel.ack(msg);
                    logger.info(`[MESSAGE_WORKER] WhatsApp message processed successfully: ${messageData.to}`);
                } catch (error) {
                    logger.error(`[MESSAGE_WORKER] Error processing WhatsApp message:`, error);
                    
                    // Check if this is a permanent error that shouldn't be retried
                    const isPermanentError = isPermanentWhatsAppError(error);
                    
                    if (isPermanentError) {
                        // Permanent error - remove from queue immediately
                        logger.error(`[MESSAGE_WORKER] Permanent error detected - removing WhatsApp message from queue: ${error.message}`);
                        channel.ack(msg); // Acknowledge to remove from queue
                        return;
                    }
                    
                    // Handle retries for temporary errors
                    let queueMessage;
                    try {
                        queueMessage = JSON.parse(msg.content.toString());
                    } catch (parseError) {
                        logger.error(`[MESSAGE_WORKER] Failed to parse queue message for retry:`, parseError);
                        channel.nack(msg, false, false); // Reject and don't requeue
                        return;
                    }
                    
                    const currentRetries = queueMessage.retries || 0;
                    const recipient = queueMessage.data?.to || 'unknown';
                    const errorMessage = error.message || 'Unknown error';
                    
                    if (currentRetries < 2) { // Max 2 retries (total 3 attempts)
                        // Requeue with delay (exponential backoff)
                        const newRetries = currentRetries + 1;
                        const delay = Math.pow(2, newRetries) * 1000;
                        logger.warn(`[MESSAGE_WORKER] Requeuing WhatsApp message (retry ${newRetries}/2): ${recipient}`);
                        
                        // Update the message with new retry count and republish
                        queueMessage.retries = newRetries;
                        
                        setTimeout(async () => {
                            try {
                                // Ack the old message and publish a new one with updated retry count
                                channel.ack(msg);
                                await channel.sendToQueue(
                                    'whatsapp_messages',
                                    Buffer.from(JSON.stringify(queueMessage)),
                                    { persistent: true }
                                );
                            } catch (requeueError) {
                                logger.error(`[MESSAGE_WORKER] Failed to requeue message:`, requeueError);
                            }
                        }, delay);
                    } else {
                        // Max retries reached, reject and don't requeue
                        logger.error(`[MESSAGE_WORKER] WhatsApp message failed after ${currentRetries + 1} attempts: ${recipient}`);
                        logger.error(`[MESSAGE_WORKER] Final error: ${errorMessage}`);
                        channel.ack(msg); // Acknowledge to remove from queue after max retries
                    }
                }
            }
        }, { noAck: false });

        // Process Email messages
        channel.consume(queues.email, async (msg) => {
            if (msg) {
                try {
                    const queueMessage = JSON.parse(msg.content.toString());
                    logger.info(`[MESSAGE_WORKER] Processing Email message: ${queueMessage.data?.to}`);

                    const messageData = queueMessage.data;
                    
                    // Process the message
                    const result = await processEmailMessage(messageData);

                    // Acknowledge message
                    channel.ack(msg);
                    logger.info(`[MESSAGE_WORKER] Email message processed successfully: ${messageData.to}`);
                } catch (error) {
                    logger.error(`[MESSAGE_WORKER] Error processing Email message:`, error);
                    
                    // Handle retries
                    const queueMessage = JSON.parse(msg.content.toString());
                    queueMessage.retries = (queueMessage.retries || 0) + 1;
                    
                    if (queueMessage.retries < 3) {
                        const delay = Math.pow(2, queueMessage.retries) * 1000;
                        logger.warn(`[MESSAGE_WORKER] Requeuing Email message (retry ${queueMessage.retries}): ${messageData.to}`);
                        
                        setTimeout(() => {
                            channel.nack(msg, false, true);
                        }, delay);
                    } else {
                        logger.error(`[MESSAGE_WORKER] Email message failed after ${queueMessage.retries} retries: ${messageData.to}`);
                        channel.nack(msg, false, false);
                    }
                }
            }
        }, { noAck: false });

        // Process Bulk messages
        channel.consume(queues.bulk, async (msg) => {
            if (msg) {
                try {
                    const queueMessage = JSON.parse(msg.content.toString());
                    logger.info(`[MESSAGE_WORKER] Processing Bulk messages: ${queueMessage.data?.recipients?.length || queueMessage.data?.contacts?.length || 0} recipients`);

                    const bulkData = queueMessage.data;
                    
                    // Process bulk messages
                    const results = await processBulkMessages(bulkData);

                    // Acknowledge message
                    channel.ack(msg);
                    logger.info(`[MESSAGE_WORKER] Bulk messages processed: ${results.success?.length || 0} success, ${results.failed?.length || 0} failed`);
                } catch (error) {
                    logger.error(`[MESSAGE_WORKER] Error processing Bulk messages:`, error);
                    
                    // Handle retries
                    const queueMessage = JSON.parse(msg.content.toString());
                    queueMessage.retries = (queueMessage.retries || 0) + 1;
                    
                    if (queueMessage.retries < 3) {
                        const delay = Math.pow(2, queueMessage.retries) * 1000;
                        logger.warn(`[MESSAGE_WORKER] Requeuing Bulk messages (retry ${queueMessage.retries})`);
                        
                        setTimeout(() => {
                            channel.nack(msg, false, true);
                        }, delay);
                    } else {
                        logger.error(`[MESSAGE_WORKER] Bulk messages failed after ${queueMessage.retries} retries`);
                        channel.nack(msg, false, false);
                    }
                }
            }
        }, { noAck: false });

        logger.info('[MESSAGE_WORKER] Message processor worker started and listening for messages...');

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            logger.info('[MESSAGE_WORKER] Shutting down gracefully...');
            await channel.close();
            await connection.close();
            await mongoose.connection.close();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            logger.info('[MESSAGE_WORKER] Shutting down gracefully...');
            await channel.close();
            await connection.close();
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        logger.error('[MESSAGE_WORKER] Failed to initialize worker:', error);
        process.exit(1);
    }
};

// Check if error is permanent (shouldn't be retried)
function isPermanentWhatsAppError(error) {
    // Check error code
    if (error.code === 'TOKEN_EXPIRED' || error.code === 'OAUTH_ERROR' || error.code === 'TEMPLATE_NOT_FOUND') {
        return true;
    }
    
    // Check error message for permanent error indicators
    const errorMessage = (error.message || '').toLowerCase();
    const permanentErrorPatterns = [
        'session has expired',
        'error validating access token',
        'token_expired',
        'invalid token',
        'token expired',
        'template name does not exist',
        'template not found',
        'not approved',
        'invalid phone number',
        'recipient not valid',
        'phone number not valid',
        'invalid recipient',
        'number of parameters does not match',
        'parameter format does not match',
        'requires',
        'parameters but only',
        'please provide all required parameters'
    ];
    
    if (permanentErrorPatterns.some(pattern => errorMessage.includes(pattern))) {
        return true;
    }
    
    // Check for OAuth errors in response
    if (error.response?.data?.error?.code === 190 || 
        error.response?.data?.error?.error_subcode === 463) {
        return true; // Token expired error
    }
    
    // Check for template errors (Meta error codes)
    // 132000 = Parameter count mismatch
    // 132001 = Template not found
    // 132005 = Template format not correct
    const metaErrorCode = error.response?.data?.error?.code || error.originalError?.error?.code;
    if (metaErrorCode === 132000 || metaErrorCode === 132001 || metaErrorCode === 132005) {
        return true;
    }
    
    // Check for other permanent OAuth errors
    if (error.response?.data?.error?.type === 'OAuthException' &&
        (error.response?.data?.error?.code === 190 || 
         error.response?.data?.error?.code === 102 ||
         error.response?.data?.error?.code >= 132000 && error.response?.data?.error?.code <= 132099)) {
        return true; // Invalid or expired token / template errors
    }
    
    return false;
}

// Process WhatsApp message
async function processWhatsAppMessage(messageData) {
    try {
        let result;
        
        const messagePayload = {
            to: messageData.to,
            type: messageData.type || 'text',
            message: messageData.message || messageData.text,
            templateId: messageData.templateId, // Meta template ID (e.g., "1934990210683335")
            templateName: messageData.templateName,
            templateParameters: messageData.templateParameters || messageData.parameters || [],
            template: messageData.template, // Template object if provided (with name and language)
            mediaUrl: messageData.mediaUrl,
            caption: messageData.caption,
            coachId: messageData.coachId || messageData.adminId || null
        };

        result = await centralWhatsAppService.sendMessage(messagePayload);

        if (!result || !result.success) {
            const errorMessage = result?.error || 'Failed to send WhatsApp message';
            let error;
            
            // If original error is available, use it; otherwise create new error
            if (result?.originalError && result.originalError instanceof Error) {
                error = result.originalError;
            } else {
                error = new Error(errorMessage);
            }
            
            // Preserve error code if available in result
            if (result?.errorCode) {
                error.code = result.errorCode;
            }
            
            // Preserve response data if available
            if (result?.originalError?.response) {
                error.response = result.originalError.response;
            }
            
            // Check if error message indicates permanent error
            if (!error.code && (errorMessage.includes('TOKEN_EXPIRED') || 
                errorMessage.includes('Session has expired') ||
                errorMessage.includes('Error validating access token'))) {
                error.code = 'TOKEN_EXPIRED';
            }
            
            throw error;
        }

        // Create message record if coachId or adminId is provided
        const senderId = messageData.coachId || messageData.adminId;
        const senderType = messageData.isAdmin || messageData.adminId ? 'admin' : 'coach';
        
        if (senderId && result.messageId && result.wamid) {
            try {
                const conversationId = WhatsAppMessage.createConversationId(senderId, messageData.to);
                
                // Convert templateParameters to array of strings
                let templateParamsArray = [];
                if (messageData.templateParameters || messageData.parameters) {
                    const params = messageData.templateParameters || messageData.parameters;
                    if (Array.isArray(params)) {
                        templateParamsArray = params.map(v => String(v));
                    } else if (typeof params === 'object') {
                        templateParamsArray = Object.values(params).filter(v => v != null).map(v => String(v));
                    }
                }
                
                const messageRecord = new WhatsAppMessage({
                    messageId: result.messageId,
                    wamid: result.wamid,
                    senderId: senderId,
                    senderType: senderType,
                    recipientPhone: messageData.to,
                    messageType: messageData.type || 'text',
                    content: {
                        text: messageData.message || messageData.text,
                        templateName: messageData.templateName,
                        templateParameters: templateParamsArray,
                        mediaUrl: messageData.mediaUrl,
                        caption: messageData.caption
                    },
                    conversationId: conversationId,
                    leadId: messageData.leadId,
                    creditsUsed: messageData.isAdmin ? 0 : 1 // Admin messages don't use credits
                });

                await messageRecord.save();
            } catch (dbError) {
                logger.error('[MESSAGE_WORKER] Error saving WhatsApp message record:', dbError);
                // Don't throw - message was sent successfully
            }
        }

        return result;
    } catch (error) {
        logger.error(`[MESSAGE_WORKER] WhatsApp message processing error:`, error);
        throw error;
    }
}

// Process Email message
async function processEmailMessage(messageData) {
    try {
        const mailOptions = {
            to: messageData.to,
            subject: messageData.subject,
            html: messageData.body || messageData.html,
            text: messageData.text || messageData.body,
            cc: messageData.cc,
            bcc: messageData.bcc,
            attachments: messageData.attachments || []
        };

        const result = await emailConfigService.sendEmail(mailOptions);
        return result;
    } catch (error) {
        logger.error(`[MESSAGE_WORKER] Email message processing error:`, error);
        throw error;
    }
}

// Process Bulk messages
async function processBulkMessages(bulkData) {
    try {
        const MessageTemplate = require('../schema/MessageTemplate');
        const templateService = require('../services/templateService');
        const Lead = require('../schema/Lead');
        
        const results = {
            success: [],
            failed: [],
            total: 0
        };

        const recipients = bulkData.recipients || bulkData.contacts || [];
        results.total = recipients.length;

        const defaultMessageType = bulkData.messageType || 'whatsapp';
        const delay = bulkData.delay || 1000; // Default 1 second delay between messages

        // Get template if needed (for template messages)
        let template = null;
        if (bulkData.templateId) {
            try {
                template = await MessageTemplate.findById(bulkData.templateId);
            } catch (error) {
                logger.warn(`[MESSAGE_WORKER] Template not found: ${bulkData.templateId}`);
            }
        }

        // Process each recipient
        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];
            const to = recipient.phone || recipient.email || recipient.to;
            const messageType = recipient.messageType || defaultMessageType;

            try {
                if (messageType === 'whatsapp') {
                    let messageContent = bulkData.message;
                    let templateName = bulkData.templateName;
                    
                    // Handle template rendering for each recipient
                    if (bulkData.type === 'template' && template) {
                        try {
                            // Use leadData from recipient if available, otherwise fetch it
                            let leadData = recipient.leadData || {};
                            if (recipient.leadId && !recipient.leadData) {
                                const lead = await Lead.findById(recipient.leadId);
                                if (lead) {
                                    leadData = templateService.extractLeadData(lead);
                                }
                            }
                            
                            // Merge template parameters with lead data
                            const allParameters = { 
                                ...leadData, 
                                ...(bulkData.templateParameters || bulkData.parameters || {})
                            };
                            
                            // Render template
                            const renderedTemplate = template.renderTemplate(allParameters);
                            messageContent = renderedTemplate.body;
                            templateName = template.name;
                        } catch (templateError) {
                            logger.error(`[MESSAGE_WORKER] Error rendering template for ${to}:`, templateError);
                            results.failed.push({ recipient: to, error: 'Template rendering failed' });
                            continue;
                        }
                    }

                    const messagePayload = {
                        to: to,
                        type: bulkData.type || 'text',
                        message: messageContent,
                        text: messageContent,
                        templateName: templateName,
                        templateParameters: bulkData.templateParameters || bulkData.parameters || [],
                        parameters: Array.isArray(bulkData.templateParameters || bulkData.parameters) 
                            ? (bulkData.templateParameters || bulkData.parameters)
                            : Object.values(bulkData.templateParameters || bulkData.parameters || {}),
                        mediaUrl: bulkData.mediaUrl,
                        caption: bulkData.caption,
                        coachId: bulkData.coachId || bulkData.adminId || null,
                        adminId: bulkData.adminId || null,
                        isAdmin: bulkData.isAdmin || false,
                        leadId: recipient.leadId
                    };

                    const result = await centralWhatsAppService.sendMessage(messagePayload);
                    
                    if (result && result.success) {
                        results.success.push({ recipient: to, messageId: result.messageId, wamid: result.wamid });
                    } else {
                        results.failed.push({ recipient: to, error: result?.error || 'Unknown error' });
                    }
                } else if (messageType === 'email') {
                    const mailOptions = {
                        to: to,
                        subject: bulkData.subject,
                        html: bulkData.body || bulkData.html,
                        text: bulkData.text || bulkData.body
                    };

                    const result = await emailConfigService.sendEmail(mailOptions);
                    results.success.push({ recipient: to, messageId: result.messageId });
                }

                // Add delay between messages (except for last one)
                if (i < recipients.length - 1 && delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                logger.error(`[MESSAGE_WORKER] Error processing recipient ${to}:`, error);
                results.failed.push({ recipient: to, error: error.message });
            }
        }

        logger.info(`[MESSAGE_WORKER] Bulk processing complete: ${results.success.length} success, ${results.failed.length} failed`);
        return results;
    } catch (error) {
        logger.error(`[MESSAGE_WORKER] Bulk message processing error:`, error);
        throw error;
    }
}

// Export for use in main.js
module.exports = { initMessageProcessorWorker };

// If run directly, start the worker
if (require.main === module) {
    initMessageProcessorWorker().catch(error => {
        logger.error('[MESSAGE_WORKER] Worker failed to start:', error);
        process.exit(1);
    });
}

