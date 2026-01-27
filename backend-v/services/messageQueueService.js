const amqp = require('amqplib');
const logger = require('../utils/logger');

class MessageQueueService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            whatsapp: 'whatsapp_messages',
            email: 'email_messages',
            bulk: 'bulk_messages',
            scheduled: 'scheduled_messages'
        };
        this.isConnected = false;
    }

    // Initialize RabbitMQ connection
    async initialize() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
            
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            
            // Declare queues
            await this.declareQueues();
            
            // Setup error handling
            this.connection.on('error', (err) => {
                logger.error('[MESSAGE_QUEUE] Connection error:', err);
                this.isConnected = false;
            });
            
            this.connection.on('close', () => {
                logger.warn('[MESSAGE_QUEUE] Connection closed');
                this.isConnected = false;
            });
            
            this.isConnected = true;
            
            return true;
        } catch (error) {
            logger.error('[MESSAGE_QUEUE] Failed to initialize:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Declare all required queues
    async declareQueues() {
        const queueOptions = {
            durable: true,
            arguments: {
                'x-message-ttl': 86400000, // 24 hours TTL
                'x-max-retries': 3
            }
        };

        for (const [name, queueName] of Object.entries(this.queues)) {
            try {
                // Ensure channel is valid before operations
                if (!this.channel || this.channel.connection === null) {
                    this.channel = await this.connection.createChannel();
                    logger.info(`[MESSAGE_QUEUE] Channel recreated before processing ${queueName}`);
                }

                // Try to assert queue directly - this will create it if it doesn't exist
                // If it fails with 406 (wrong arguments), we'll delete and recreate
                try {
                    await this.channel.assertQueue(queueName, queueOptions);
                } catch (assertError) {
                    // If we get 406, queue exists with wrong arguments - delete and recreate
                    if (assertError.code === 406) {
                        logger.warn(`[MESSAGE_QUEUE] Queue ${queueName} exists with different arguments. Deleting and recreating...`);
                        
                        // Channel may be closed after error, recreate it
                        try {
                            if (this.channel) {
                                await this.channel.close().catch(() => {});
                            }
                        } catch (closeError) {
                            // Ignore
                        }
                        this.channel = await this.connection.createChannel();
                        
                        // Delete the queue
                        try {
                            await this.channel.deleteQueue(queueName, { ifEmpty: false });
                            logger.info(`[MESSAGE_QUEUE] Deleted existing queue: ${queueName}`);
                            // Small delay to ensure deletion is processed
                            await new Promise(resolve => setTimeout(resolve, 200));
                        } catch (deleteError) {
                            // If queue doesn't exist (404), that's fine - just continue
                            if (deleteError.code !== 404) {
                                logger.error(`[MESSAGE_QUEUE] Error deleting queue ${queueName}:`, deleteError);
                                throw deleteError;
                            }
                        }
                        
                        // Recreate with correct arguments
                        await this.channel.assertQueue(queueName, queueOptions);
                    } else if (assertError.code === 404) {
                        // This shouldn't happen with assertQueue (it creates if doesn't exist)
                        // But if it does, just retry once with a fresh channel
                        logger.warn(`[MESSAGE_QUEUE] Unexpected 404 for ${queueName}, retrying...`);
                        try {
                            if (this.channel) {
                                await this.channel.close().catch(() => {});
                            }
                        } catch (closeError) {
                            // Ignore
                        }
                        this.channel = await this.connection.createChannel();
                        await this.channel.assertQueue(queueName, queueOptions);
                    } else {
                        // Other errors - try to recreate channel and retry once
                        logger.warn(`[MESSAGE_QUEUE] Error asserting queue ${queueName}: ${assertError.message}, retrying...`);
                        try {
                            if (this.channel) {
                                await this.channel.close().catch(() => {});
                            }
                        } catch (closeError) {
                            // Ignore
                        }
                        this.channel = await this.connection.createChannel();
                        await this.channel.assertQueue(queueName, queueOptions);
                    }
                }
                
            } catch (error) {
                logger.error(`[MESSAGE_QUEUE] Error declaring queue ${queueName}:`, error);
                
                // If channel was closed due to error, recreate it
                if (error.code === 406 || error.code === 404 || !this.channel || this.channel.connection === null) {
                    try {
                        if (this.channel) {
                            await this.channel.close().catch(() => {});
                        }
                        this.channel = await this.connection.createChannel();
                        logger.info(`[MESSAGE_QUEUE] Channel recreated after error`);
                        
                        // Retry queue creation once
                        try {
                            // Check if queue exists first
                            let queueExists = false;
                            try {
                                await this.channel.checkQueue(queueName);
                                queueExists = true;
                            } catch (checkError) {
                                if (checkError.code === 404) {
                                    queueExists = false;
                                } else {
                                    throw checkError;
                                }
                            }
                            
                            // Try to delete if exists (handle 404 gracefully)
                            if (queueExists) {
                                try {
                                    await this.channel.deleteQueue(queueName, { ifEmpty: false });
                                    await new Promise(resolve => setTimeout(resolve, 200));
                                    logger.info(`[MESSAGE_QUEUE] Deleted queue ${queueName} before recreation`);
                                } catch (deleteError) {
                                    // Ignore if queue doesn't exist (might have been deleted)
                                    if (deleteError.code !== 404) throw deleteError;
                                }
                            }
                            
                            // Create queue
                            await this.channel.assertQueue(queueName, queueOptions);
                            logger.info(`[MESSAGE_QUEUE] Queue ${queueName} successfully created after retry`);
                        } catch (retryError) {
                            logger.error(`[MESSAGE_QUEUE] Failed to create queue ${queueName} after retry:`, retryError);
                            throw retryError;
                        }
                    } catch (channelError) {
                        logger.error(`[MESSAGE_QUEUE] Failed to recreate channel:`, channelError);
                        throw error; // Throw original error
                    }
                } else {
                    throw error;
                }
            }
        }
    }

    // Send message to queue
    async sendMessage(queueName, message, options = {}) {
        try {
            logger.info(`[MESSAGE_QUEUE] 📤 sendMessage called - Queue: ${queueName}, Connected: ${this.isConnected}`);
            
            if (!this.isConnected) {
                logger.info(`[MESSAGE_QUEUE] 🔄 Not connected, initializing...`);
                await this.initialize();
                logger.info(`[MESSAGE_QUEUE] ✅ Initialization complete. Connected: ${this.isConnected}`);
            }

            if (!this.channel) {
                logger.error(`[MESSAGE_QUEUE] ❌ Channel is null after initialization`);
                return false;
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));
            const publishOptions = {
                persistent: true,
                timestamp: Date.now(),
                ...options
            };

            logger.info(`[MESSAGE_QUEUE] 📨 Sending to queue "${queueName}"...`);
            const success = this.channel.sendToQueue(queueName, messageBuffer, publishOptions);
            
            if (success) {
                logger.info(`[MESSAGE_QUEUE] ✅ Message sent to queue "${queueName}" - Type: ${message.type || message.messageType || 'unknown'}, Recipient: ${message.data?.to || 'N/A'}`);
                
                // Log queue stats after sending
                try {
                    const queueInfo = await this.channel.checkQueue(queueName);
                    logger.info(`[MESSAGE_QUEUE] 📊 Queue "${queueName}" stats - Messages: ${queueInfo.messageCount}, Consumers: ${queueInfo.consumerCount}`);
                } catch (statsError) {
                    logger.warn(`[MESSAGE_QUEUE] ⚠️ Could not get queue stats: ${statsError.message}`);
                }
                
                return true;
            } else {
                logger.error(`[MESSAGE_QUEUE] ❌ Failed to send message to ${queueName} - channel buffer full or connection issue`);
                return false;
            }
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] ❌ Exception in sendMessage to ${queueName}:`, error);
            logger.error(`[MESSAGE_QUEUE] Error stack:`, error.stack);
            return false;
        }
    }

    // Queue WhatsApp message for processing
    async queueWhatsAppMessage(messageData) {
        try {
            logger.info(`[MESSAGE_QUEUE] 🔄 Attempting to queue WhatsApp message for: ${messageData.to}`);
            
            const message = {
                type: 'whatsapp',
                messageType: 'whatsapp',
                data: messageData,
                timestamp: new Date(),
                retries: 0,
                status: 'queued'
            };

            const queued = await this.sendMessage(this.queues.whatsapp, message);
            if (queued) {
                logger.info(`[MESSAGE_QUEUE] ✅ WhatsApp message queued successfully: ${messageData.to}`);
            } else {
                logger.error(`[MESSAGE_QUEUE] ❌ Failed to queue WhatsApp message: ${messageData.to}`);
            }
            return queued;
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] ❌ Exception in queueWhatsAppMessage for ${messageData.to}:`, error);
            return false;
        }
    }

    // Queue email message for processing
    async queueEmailMessage(messageData) {
        const message = {
            type: 'email',
            messageType: 'email',
            data: messageData,
            timestamp: new Date(),
            retries: 0,
            status: 'queued'
        };

        const queued = await this.sendMessage(this.queues.email, message);
        if (queued) {
            logger.info(`[MESSAGE_QUEUE] Email message queued: ${messageData.to}`);
        }
        return queued;
    }

    // Queue bulk messages (can contain both WhatsApp and email)
    async queueBulkMessages(bulkData) {
        const message = {
            type: 'bulk',
            messageType: bulkData.messageType || 'mixed', // whatsapp, email, or mixed
            data: bulkData,
            timestamp: new Date(),
            retries: 0,
            status: 'queued'
        };

        const queued = await this.sendMessage(this.queues.bulk, message);
        if (queued) {
            logger.info(`[MESSAGE_QUEUE] Bulk messages queued: ${bulkData.recipients?.length || bulkData.contacts?.length || 0} recipients`);
        }
        return queued;
    }

    // Legacy methods for backward compatibility
    async sendWhatsAppMessage(messageData) {
        return await this.queueWhatsAppMessage(messageData);
    }

    async sendEmailMessage(messageData) {
        return await this.queueEmailMessage(messageData);
    }

    async sendBulkMessages(bulkData) {
        return await this.queueBulkMessages(bulkData);
    }

    // Schedule message for later delivery
    async scheduleMessage(messageData, delayMs) {
        const message = {
            type: 'scheduled',
            data: messageData,
            scheduledFor: new Date(Date.now() + delayMs),
            timestamp: new Date(),
            retries: 0
        };

        return await this.sendMessage(this.queues.scheduled, message, {
            expiration: delayMs.toString()
        });
    }

    // Consume messages from queue
    async consumeMessages(queueName, callback, options = {}) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const consumeOptions = {
                noAck: false,
                ...options
            };

            await this.channel.consume(queueName, async (msg) => {
                if (msg) {
                    try {
                        const message = JSON.parse(msg.content.toString());
                        await callback(message, msg);
                    } catch (error) {
                        logger.error(`[MESSAGE_QUEUE] Error processing message:`, error);
                        this.channel.nack(msg, false, false); // Reject and don't requeue
                    }
                }
            }, consumeOptions);

            logger.info(`[MESSAGE_QUEUE] Started consuming from ${queueName}`);
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] Error setting up consumer:`, error);
        }
    }

    // Setup message processors
    async setupProcessors() {
        // WhatsApp message processor
        await this.consumeMessages(this.queues.whatsapp, async (message, msg) => {
            try {
                await this.processWhatsAppMessage(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] WhatsApp message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });

        // Email message processor
        await this.consumeMessages(this.queues.email, async (message, msg) => {
            try {
                await this.processEmailMessage(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] Email message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });

        // Bulk message processor
        await this.consumeMessages(this.queues.bulk, async (message, msg) => {
            try {
                await this.processBulkMessages(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] Bulk message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });

        // Scheduled message processor
        await this.consumeMessages(this.queues.scheduled, async (message, msg) => {
            try {
                await this.processScheduledMessage(message.data);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('[MESSAGE_QUEUE] Scheduled message processing failed:', error);
                this.handleMessageError(message, msg, error);
            }
        });
    }

    // Process WhatsApp message (called by worker)
    async processWhatsAppMessage(messageData) {
        const centralWhatsAppService = require('./centralWhatsAppService');
        
        try {
            let result;
            
            // Use sendMessage method which handles all types
            const messagePayload = {
                to: messageData.to,
                type: messageData.type || 'text',
                message: messageData.message || messageData.text,
                templateId: messageData.templateId, // Meta template ID (e.g., "1934990210683335")
                templateName: messageData.templateName,
                templateParameters: messageData.templateParameters || messageData.parameters || [],
                mediaUrl: messageData.mediaUrl,
                caption: messageData.caption,
                coachId: messageData.coachId || null
            };

            result = await centralWhatsAppService.sendMessage(messagePayload);

            if (result && result.success) {
                logger.info(`[MESSAGE_QUEUE] WhatsApp message processed successfully: ${messageData.to}`);
                return result;
            } else {
                throw new Error(result?.error || 'Failed to send WhatsApp message');
            }
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] WhatsApp message processing error:`, error);
            throw error;
        }
    }

    // Process email message (called by worker)
    async processEmailMessage(messageData) {
        const emailConfigService = require('./emailConfigService');
        
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
            
            logger.info(`[MESSAGE_QUEUE] Email message processed successfully: ${messageData.to}`);
            return result;
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] Email message processing error:`, error);
            throw error;
        }
    }

    // Process bulk messages (called by worker)
    async processBulkMessages(bulkData) {
        try {
            const centralWhatsAppService = require('./centralWhatsAppService');
            const emailConfigService = require('./emailConfigService');
            
            const results = {
                success: [],
                failed: [],
                total: 0
            };

            const recipients = bulkData.recipients || bulkData.contacts || [];
            results.total = recipients.length;

            // Process each recipient
            for (const recipient of recipients) {
                try {
                    const to = recipient.phone || recipient.email || recipient.to;
                    const messageType = bulkData.messageType || recipient.messageType || 'whatsapp';

                    if (messageType === 'whatsapp') {
                        const messagePayload = {
                            to: to,
                            type: bulkData.type || 'text',
                            message: bulkData.message,
                            templateName: bulkData.templateName,
                            templateParameters: bulkData.templateParameters || bulkData.parameters || [],
                            mediaUrl: bulkData.mediaUrl,
                            caption: bulkData.caption,
                            coachId: bulkData.coachId
                        };

                        const result = await centralWhatsAppService.sendMessage(messagePayload);
                        
                        if (result && result.success) {
                            results.success.push({ recipient: to, result });
                        } else {
                            results.failed.push({ recipient: to, error: result?.error || 'Unknown error' });
                        }

                        // Add delay between messages to avoid rate limiting
                        if (bulkData.delay) {
                            await new Promise(resolve => setTimeout(resolve, bulkData.delay));
                        }
                    } else if (messageType === 'email') {
                        const mailOptions = {
                            to: to,
                            subject: bulkData.subject,
                            html: bulkData.body || bulkData.html,
                            text: bulkData.text || bulkData.body
                        };

                        const result = await emailConfigService.sendEmail(mailOptions);
                        results.success.push({ recipient: to, result });

                        // Add delay between messages
                        if (bulkData.delay) {
                            await new Promise(resolve => setTimeout(resolve, bulkData.delay));
                        }
                    }
                } catch (error) {
                    const to = recipient.phone || recipient.email || recipient.to;
                    results.failed.push({ recipient: to, error: error.message });
                }
            }

            logger.info(`[MESSAGE_QUEUE] Bulk messages processed: ${results.success.length} success, ${results.failed.length} failed`);
            return results;
        } catch (error) {
            logger.error(`[MESSAGE_QUEUE] Bulk message processing error:`, error);
            throw error;
        }
    }

    // Process scheduled message
    async processScheduledMessage(messageData) {
        // Check if it's time to send
        if (new Date() >= new Date(messageData.scheduledFor)) {
            if (messageData.type === 'whatsapp') {
                await this.processWhatsAppMessage(messageData);
            } else if (messageData.type === 'email') {
                await this.processEmailMessage(messageData);
            }
        } else {
            // Re-schedule for later
            const delayMs = new Date(messageData.scheduledFor) - new Date();
            await this.scheduleMessage(messageData, delayMs);
        }
    }

    // Handle message processing errors
    handleMessageError(message, msg, error) {
        message.retries = (message.retries || 0) + 1;
        
        if (message.retries < 3) {
            // Requeue with delay
            setTimeout(() => {
                this.channel.nack(msg, false, true);
            }, Math.pow(2, message.retries) * 1000); // Exponential backoff
        } else {
            // Dead letter queue or log error
            logger.error(`[MESSAGE_QUEUE] Message failed after ${message.retries} retries:`, error);
            this.channel.nack(msg, false, false);
        }
    }

    // Get queue statistics
    async getQueueStats() {
        try {
            const stats = {};
            
            for (const [name, queueName] of Object.entries(this.queues)) {
                const queueInfo = await this.channel.checkQueue(queueName);
                stats[name] = {
                    name: queueName,
                    messageCount: queueInfo.messageCount,
                    consumerCount: queueInfo.consumerCount
                };
            }
            
            return stats;
        } catch (error) {
            logger.error('[MESSAGE_QUEUE] Error getting queue stats:', error);
            return null;
        }
    }

    // Close connection
    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
            logger.info('[MESSAGE_QUEUE] Connection closed');
        } catch (error) {
            logger.error('[MESSAGE_QUEUE] Error closing connection:', error);
        }
    }
}

module.exports = new MessageQueueService();
