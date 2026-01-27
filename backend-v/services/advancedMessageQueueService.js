const amqp = require('amqplib');
const logger = require('../utils/logger');
const AutomationRun = require('../schema/automationRun');
const MessagingSequence = require('../schema/messagingSequence');
const centralWhatsAppService = require('./centralWhatsAppService');
const { emailService } = require('./actionExecutorService');

class AdvancedMessageQueueService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.replyChannel = null;
        this.isConnected = false;
        this.replyListeners = new Map();
        this.processingWorkers = new Map();

        // Enhanced queue configuration for high throughput
        this.queues = {
            whatsapp: 'whatsapp_messages_v2',
            email: 'email_messages_v2',
            bulk: 'bulk_messages_v2',
            scheduled: 'scheduled_messages_v2',
            replies: 'message_replies_v2',
            automation: 'automation_triggers_v2',
            automation_actions: 'automation_actions_v2',
            priority: 'priority_messages_v2'
        };

        this.queueOptions = {
            durable: true,
            arguments: {
                'x-message-ttl': 86400000, // 24 hours TTL
                'x-max-retries': 5,
                'x-dead-letter-exchange': 'dlx_messages',
                'x-dead-letter-routing-key': 'failed_messages'
            }
        };

        this.priorityQueueOptions = {
            durable: true,
            arguments: {
                'x-message-ttl': 3600000, // 1 hour TTL for priority
                'x-max-priority': 10,
                'x-max-retries': 3
            }
        };
    }

    // Initialize RabbitMQ connection with enhanced error handling
    async initialize() {
        try {
            const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

            // Main connection for message processing
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();

            // Separate channel for reply processing
            this.replyChannel = await this.connection.createChannel();

            // Setup error handling
            this.setupErrorHandling();

            // Declare all queues
            await this.declareQueues();

            // Setup reply listeners
            await this.setupReplyListeners();

            // Start processing workers
            await this.startProcessingWorkers();

            this.isConnected = true;

            return true;
        } catch (error) {
            logger.error('[ADVANCED_MQ] Failed to initialize:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Enhanced error handling
    setupErrorHandling() {
        this.connection.on('error', (err) => {
            logger.error('[ADVANCED_MQ] Connection error:', err);
            this.isConnected = false;
            this.reconnect();
        });

        this.connection.on('close', () => {
            logger.warn('[ADVANCED_MQ] Connection closed');
            this.isConnected = false;
            this.reconnect();
        });

        // Channel error handling
        this.channel.on('error', (err) => {
            logger.error('[ADVANCED_MQ] Channel error:', err);
        });

        this.replyChannel.on('error', (err) => {
            logger.error('[ADVANCED_MQ] Reply channel error:', err);
        });
    }

    // Auto-reconnection logic
    async reconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = setTimeout(async () => {
            logger.info('[ADVANCED_MQ] Attempting to reconnect...');
            try {
                await this.initialize();
            } catch (error) {
                logger.error('[ADVANCED_MQ] Reconnection failed:', error);
                // Exponential backoff
                this.reconnectTimeout = setTimeout(() => this.reconnect(), 30000);
            }
        }, 5000);
    }

    // Declare all queues with proper configuration
    async declareQueues() {
        // Declare dead letter exchange
        await this.channel.assertExchange('dlx_messages', 'direct', { durable: true });
        await this.channel.assertQueue('failed_messages', { durable: true });
        await this.channel.bindQueue('failed_messages', 'dlx_messages', 'failed_messages');

        // Declare main queues
        for (const [name, queueName] of Object.entries(this.queues)) {
            try {
                const options = name === 'priority' ? this.priorityQueueOptions : this.queueOptions;

                // Try to assert queue directly - this will create it if it doesn't exist
                // If it fails with 406 (wrong arguments), we'll delete and recreate
                try {
                    await this.channel.assertQueue(queueName, options);
                } catch (assertError) {
                    // If we get 406, queue exists with wrong arguments - delete and recreate
                    if (assertError.code === 406) {
                        logger.warn(`[ADVANCED_MQ] Queue ${queueName} exists with different arguments. Deleting and recreating...`);

                        // Delete the queue
                        try {
                            await this.channel.deleteQueue(queueName, { ifEmpty: false });
                            logger.info(`[ADVANCED_MQ] Deleted existing queue: ${queueName}`);

                            // Small delay to ensure deletion is processed
                            await new Promise(resolve => setTimeout(resolve, 200));

                            // Recreate with correct arguments
                            await this.channel.assertQueue(queueName, options);
                            logger.info(`[ADVANCED_MQ] Recreated queue: ${queueName}`);
                        } catch (deleteError) {
                            logger.error(`[ADVANCED_MQ] Error deleting/recreating queue ${queueName}:`, deleteError);
                            throw deleteError;
                        }
                    } else {
                        // Re-throw other errors
                        throw assertError;
                    }
                }
            } catch (error) {
                logger.error(`[ADVANCED_MQ] Failed to declare queue ${queueName}:`, error);
                throw error;
            }
        }
    }

    // Setup reply listeners for different message types
    async setupReplyListeners() {
        // WhatsApp reply listener
        await this.setupWhatsAppReplyListener();

        // Email reply listener
        await this.setupEmailReplyListener();

        // Automation trigger listener
        await this.setupAutomationTriggerListener();

        // Automation actions listener
        await this.setupAutomationActionsListener();
    }

    // WhatsApp reply listener
    async setupWhatsAppReplyListener() {
        // Queue already declared in declareQueues(), just consume
        // Consume WhatsApp replies
        this.replyChannel.consume(this.queues.replies, async (msg) => {
            if (msg) {
                try {
                    const replyData = JSON.parse(msg.content.toString());
                    await this.processWhatsAppReply(replyData);
                    this.replyChannel.ack(msg);
                } catch (error) {
                    logger.error('[ADVANCED_MQ] Error processing WhatsApp reply:', error);
                    this.replyChannel.nack(msg, false, false);
                }
            }
        }, { noAck: false });
    }

    // Email reply listener
    async setupEmailReplyListener() {
        // Email replies are typically handled by webhooks, but we can poll or listen
        // This is a placeholder for email reply processing
    }

    // Automation trigger listener
    async setupAutomationTriggerListener() {
        // Queue already declared in declareQueues(), just consume
        this.replyChannel.consume(this.queues.automation, async (msg) => {
            if (msg) {
                try {
                    const triggerData = JSON.parse(msg.content.toString());
                    await this.processAutomationTrigger(triggerData);
                    this.replyChannel.ack(msg);
                } catch (error) {
                    logger.error('[ADVANCED_MQ] Error processing automation trigger:', error);
                    this.replyChannel.nack(msg, false, false);
                }
            }
        }, { noAck: false });
    }

    // Automation actions listener
    async setupAutomationActionsListener() {
        // Queue already declared in declareQueues(), just consume
        this.replyChannel.consume(this.queues.automation_actions, async (msg) => {
            if (msg) {
                try {
                    const actionData = JSON.parse(msg.content.toString());
                    await this.processAutomationAction(actionData);
                    this.replyChannel.ack(msg);
                } catch (error) {
                    logger.error('[ADVANCED_MQ] Error processing automation action:', error);
                    this.replyChannel.nack(msg, false, false);
                }
            }
        }, { noAck: false });
    }

    // Start processing workers for different message types
    async startProcessingWorkers() {
        // WhatsApp message worker
        this.startWorker('whatsapp', this.processWhatsAppMessage.bind(this));

        // Email message worker
        this.startWorker('email', this.processEmailMessage.bind(this));

        // Bulk message worker
        this.startWorker('bulk', this.processBulkMessage.bind(this));

        // Automation actions worker
        this.startWorker('automation_actions', this.processAutomationAction.bind(this), 5);

        // Priority message worker
        this.startWorker('priority', this.processPriorityMessage.bind(this));
    }

    // Generic worker starter
    async startWorker(queueName, processorFunction, concurrency = 10) {
        const queue = this.queues[queueName];
        if (!queue) return;

        // Prefetch for high throughput
        await this.channel.prefetch(concurrency);

        this.processingWorkers.set(queueName, true);

        this.channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    const messageData = JSON.parse(msg.content.toString());
                    await processorFunction(messageData);
                    this.channel.ack(msg);
                } catch (error) {
                    logger.error(`[ADVANCED_MQ] Error processing ${queueName} message:`, error);
                    // Send to dead letter queue after retries
                    this.channel.nack(msg, false, false);
                }
            }
        }, { noAck: false });
    }

    // Message processors
    async processWhatsAppMessage(messageData) {
        try {
            const { to, message, templateId, template, leadId, automationRunId, sequenceId } = messageData;

            // Send message via WhatsApp
            const result = await centralWhatsAppService.sendMessage({
                to,
                message,
                templateId,
                template,
                leadId
            });

            // Update automation run if applicable
            if (automationRunId) {
                await this.updateAutomationRun(automationRunId, {
                    status: 'message_sent',
                    messageSid: result.messageId,
                    sentAt: new Date()
                });
            }

            // Track for reply handling
            if (automationRunId && sequenceId) {
                await this.trackMessageForReply(automationRunId, result.messageId, 'whatsapp');
            }

            logger.info(`[ADVANCED_MQ] WhatsApp message processed: ${result.messageId}`);
        } catch (error) {
            logger.error('[ADVANCED_MQ] WhatsApp message processing failed:', error);
            throw error;
        }
    }

    async processEmailMessage(messageData) {
        try {
            const { to, subject, html, text, leadId, automationRunId, sequenceId } = messageData;

            // Send email
            const result = await emailService.sendEmail({
                to,
                subject,
                body: html || text,
                attachments: []
            });

            // Update automation run
            if (automationRunId) {
                await this.updateAutomationRun(automationRunId, {
                    status: 'email_sent',
                    messageId: result.messageId,
                    sentAt: new Date()
                });
            }

            // Track for reply handling
            if (automationRunId && sequenceId) {
                await this.trackMessageForReply(automationRunId, result.messageId, 'email');
            }

            logger.info(`[ADVANCED_MQ] Email message processed: ${result.messageId}`);
        } catch (error) {
            logger.error('[ADVANCED_MQ] Email message processing failed:', error);
            throw error;
        }
    }

    async processBulkMessage(bulkData) {
        try {
            const { messages, batchId, priority = 5 } = bulkData;

            // Process messages in parallel with controlled concurrency
            const batchSize = 50; // Process 50 messages at a time
            for (let i = 0; i < messages.length; i += batchSize) {
                const batch = messages.slice(i, i + batchSize);
                await Promise.all(batch.map(msg => this.routeMessage(msg, priority)));
                // Small delay between batches to prevent overwhelming
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            logger.info(`[ADVANCED_MQ] Bulk message batch processed: ${batchId}`);
        } catch (error) {
            logger.error('[ADVANCED_MQ] Bulk message processing failed:', error);
            throw error;
        }
    }

    async processPriorityMessage(messageData) {
        try {
            const { type, data, priority } = messageData;

            // Route based on type with high priority
            await this.routeMessage({ ...data, type }, priority);

            logger.info(`[ADVANCED_MQ] Priority message processed with priority: ${priority}`);
        } catch (error) {
            logger.error('[ADVANCED_MQ] Priority message processing failed:', error);
            throw error;
        }
    }

    // Reply processors
    async processWhatsAppReply(replyData) {
        try {
            const { from, messageId, content, timestamp, automationRunId } = replyData;

            // Find the original message and automation run
            const automationRun = await AutomationRun.findOne({
                _id: automationRunId,
                'messageLogs.messageId': messageId
            });

            if (!automationRun) {
                logger.warn(`[ADVANCED_MQ] No automation run found for reply: ${messageId}`);
                return;
            }

            // Analyze reply content
            const analysis = await this.analyzeReplyContent(content, automationRun);

            // Update automation run with reply
            await AutomationRun.findByIdAndUpdate(automationRunId, {
                $push: {
                    messageLogs: {
                        messageId: `reply_${Date.now()}`,
                        replyContent: content,
                        repliedAt: new Date(timestamp * 1000),
                        aiAnalysis: analysis
                    }
                },
                $inc: { repliesReceived: 1 },
                lastActivityAt: new Date()
            });

            // Trigger next automation step based on reply analysis
            await this.processReplyBasedAction(automationRunId, analysis, content);

            logger.info(`[ADVANCED_MQ] WhatsApp reply processed for automation: ${automationRunId}`);
        } catch (error) {
            logger.error('[ADVANCED_MQ] WhatsApp reply processing failed:', error);
            throw error;
        }
    }

    async processAutomationTrigger(triggerData) {
        try {
            const { eventType, data, coachId } = triggerData;

            // Find automations that match this trigger
            const automations = await this.findMatchingAutomations(eventType, data, coachId);

            // Start automation runs for each matching automation
            for (const automation of automations) {
                await this.startAutomationRun(automation, data);
            }

            logger.info(`[ADVANCED_MQ] Automation trigger processed: ${eventType}`);
        } catch (error) {
            logger.error('[ADVANCED_MQ] Automation trigger processing failed:', error);
            throw error;
        }
    }

    // Process automation action
    async processAutomationAction(actionData) {
        try {
            const { runId, actionId, nodeId, context } = actionData;

            const advancedAutomationProcessorV2 = require('./AdvancedAutomationProcessorV2');
            await advancedAutomationProcessorV2.processAutomationStep(runId, actionId, nodeId, context);

            logger.info(`[ADVANCED_MQ] Automation action processed: ${runId} -> ${nodeId}`);
        } catch (error) {
            logger.error('[ADVANCED_MQ] Automation action processing failed:', error);
            throw error;
        }
    }

    // Helper methods
    async routeMessage(message, priority = 5) {
        const { type, ...data } = message;

        switch (type) {
            case 'whatsapp':
                await this.publishToQueue(this.queues.whatsapp, data, { priority });
                break;
            case 'email':
                await this.publishToQueue(this.queues.email, data, { priority });
                break;
            case 'bulk':
                await this.publishToQueue(this.queues.bulk, data, { priority });
                break;
            default:
                await this.publishToQueue(this.queues.scheduled, data, { priority });
        }
    }

    async publishToQueue(queueName, data, options = {}) {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        const messageBuffer = Buffer.from(JSON.stringify(data));
        await this.channel.sendToQueue(queueName, messageBuffer, {
            persistent: true,
            priority: options.priority || 5,
            timestamp: Date.now(),
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
    }

    async analyzeReplyContent(content, automationRun) {
        // Use AI service to analyze reply content
        const aiService = require('./aiAutomationService');

        try {
            return await aiService.analyzeReply(content, {
                automationId: automationRun._id,
                sequenceId: automationRun.sequenceId,
                leadData: automationRun.context?.leadData
            });
        } catch (error) {
            logger.error('[ADVANCED_MQ] AI analysis failed:', error);
            // Return basic analysis
            return {
                sentiment: 'neutral',
                intent: 'unknown',
                confidence: 0.5,
                keywords: [],
                requiresAction: false
            };
        }
    }

    async processReplyBasedAction(automationRunId, analysis, content) {
        // Find the automation and determine next action based on reply
        const automationRun = await AutomationRun.findById(automationRunId)
            .populate('sequenceId');

        if (!automationRun || !automationRun.sequenceId) return;

        const sequence = automationRun.sequenceId;
        const currentStep = automationRun.currentStep || 0;

        // Find next step based on reply analysis
        const nextStep = this.determineNextStep(sequence, currentStep, analysis, content);

        if (nextStep) {
            // Queue the next message/action
            await this.queueNextAutomationStep(automationRunId, nextStep);
        }
    }

    determineNextStep(sequence, currentStep, analysis, content) {
        if (!sequence.steps || sequence.steps.length <= currentStep + 1) return null;

        const nextStep = sequence.steps[currentStep + 1];

        // Apply conditional logic based on reply analysis
        if (nextStep.conditions) {
            for (const condition of nextStep.conditions) {
                if (this.evaluateCondition(condition, analysis, content)) {
                    return nextStep;
                }
            }
            return null; // No conditions met
        }

        return nextStep;
    }

    evaluateCondition(condition, analysis, content) {
        const { field, operator, value } = condition;

        let fieldValue;
        switch (field) {
            case 'sentiment':
                fieldValue = analysis.sentiment;
                break;
            case 'intent':
                fieldValue = analysis.intent;
                break;
            case 'content':
                fieldValue = content.toLowerCase();
                break;
            case 'confidence':
                fieldValue = analysis.confidence;
                break;
            default:
                fieldValue = analysis[field];
        }

        switch (operator) {
            case 'equals':
                return fieldValue === value;
            case 'contains':
                return fieldValue && fieldValue.includes && fieldValue.includes(value);
            case 'greater_than':
                return parseFloat(fieldValue) > parseFloat(value);
            case 'less_than':
                return parseFloat(fieldValue) < parseFloat(value);
            default:
                return false;
        }
    }

    async queueNextAutomationStep(automationRunId, nextStep) {
        // Queue the next step for processing
        const stepData = {
            automationRunId,
            stepId: nextStep.stepId,
            action: nextStep,
            type: nextStep.stepType
        };

        await this.publishToQueue(this.queues.automation, stepData, { priority: 8 });
    }

    async findMatchingAutomations(eventType, data, coachId) {
        // Find automations that match the trigger event
        const AutomationRule = require('../schema/AutomationRule');

        return await AutomationRule.find({
            coachId,
            triggerEvent: eventType,
            isActive: true
        });
    }

    async startAutomationRun(automation, triggerData) {
        // Create and start a new automation run
        const automationRun = new AutomationRun({
            sequenceId: automation._id,
            coachId: automation.coachId,
            status: 'running',
            context: {
                triggerData,
                leadData: triggerData.lead,
                userData: triggerData.user
            },
            startedAt: new Date()
        });

        await automationRun.save();

        // Queue the first step
        if (automation.nodes && automation.nodes.length > 0) {
            const firstNode = automation.nodes.find(node => node.type === 'trigger');
            if (firstNode) {
                await this.queueNextAutomationStep(automationRun._id, firstNode.data);
            }
        }

        return automationRun;
    }

    async updateAutomationRun(runId, updates) {
        await AutomationRun.findByIdAndUpdate(runId, updates);
    }

    async trackMessageForReply(automationRunId, messageId, type) {
        // Store message tracking for reply correlation
        await AutomationRun.findByIdAndUpdate(automationRunId, {
            $push: {
                messageLogs: {
                    messageId,
                    type,
                    sentAt: new Date(),
                    awaitingReply: true
                }
            }
        });
    }

    // Public API methods
    async sendMessage(messageData, priority = 5) {
        await this.routeMessage(messageData, priority);
    }

    async sendBulkMessages(messages, batchId) {
        await this.publishToQueue(this.queues.bulk, {
            messages,
            batchId,
            timestamp: Date.now()
        }, { priority: 3 });
    }

    async triggerAutomation(eventType, data, coachId) {
        await this.publishToQueue(this.queues.automation, {
            eventType,
            data,
            coachId,
            timestamp: Date.now()
        }, { priority: 9 });
    }

    async processIncomingReply(replyData) {
        await this.publishToQueue(this.queues.replies, replyData, { priority: 10 });
    }

    // Health check
    getHealthStatus() {
        return {
            connected: this.isConnected,
            queues: Object.keys(this.queues),
            workers: Array.from(this.processingWorkers.keys()),
            uptime: process.uptime()
        };
    }

    // Graceful shutdown
    async shutdown() {
        logger.info('[ADVANCED_MQ] Shutting down...');

        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.replyChannel) {
                await this.replyChannel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
            logger.info('[ADVANCED_MQ] Shutdown complete');
        } catch (error) {
            logger.error('[ADVANCED_MQ] Error during shutdown:', error);
        }
    }
}

module.exports = new AdvancedMessageQueueService();
