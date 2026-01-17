const AutomationRule = require('../schema/AutomationRule');
const AutomationRun = require('../schema/automationRun');
const advancedMessageQueue = require('./advancedMessageQueueService');
const aiAutomationService = require('./aiAutomationService');
const centralWhatsAppService = require('./centralWhatsAppService');
const { emailService } = require('./actionExecutorService');
const logger = require('../utils/logger');

class AdvancedAutomationProcessor {
    constructor() {
        this.runningAutomations = new Map();
        this.nodeExecutors = new Map();
        this.conditionEvaluators = new Map();

        this.setupNodeExecutors();
        this.setupConditionEvaluators();
    }

    // Setup node executors for different node types
    setupNodeExecutors() {
        this.nodeExecutors.set('trigger', this.executeTriggerNode.bind(this));
        this.nodeExecutors.set('action', this.executeActionNode.bind(this));
        this.nodeExecutors.set('condition', this.executeConditionNode.bind(this));
        this.nodeExecutors.set('delay', this.executeDelayNode.bind(this));
        this.nodeExecutors.set('messageValidation', this.executeMessageValidationNode.bind(this));
        this.nodeExecutors.set('replyHandler', this.executeReplyHandlerNode.bind(this));
        this.nodeExecutors.set('webhook', this.executeWebhookNode.bind(this));
        this.nodeExecutors.set('end', this.executeEndNode.bind(this));
    }

    // Setup condition evaluators
    setupConditionEvaluators() {
        this.conditionEvaluators.set('equals', this.evaluateEquals.bind(this));
        this.conditionEvaluators.set('not_equals', this.evaluateNotEquals.bind(this));
        this.conditionEvaluators.set('contains', this.evaluateContains.bind(this));
        this.conditionEvaluators.set('not_contains', this.evaluateNotContains.bind(this));
        this.conditionEvaluators.set('greater_than', this.evaluateGreaterThan.bind(this));
        this.conditionEvaluators.set('less_than', this.evaluateLessThan.bind(this));
        this.conditionEvaluators.set('is_empty', this.evaluateIsEmpty.bind(this));
        this.conditionEvaluators.set('is_not_empty', this.evaluateIsNotEmpty.bind(this));
        this.conditionEvaluators.set('message_reply_yes', this.evaluateMessageReplyYes.bind(this));
        this.conditionEvaluators.set('message_reply_no', this.evaluateMessageReplyNo.bind(this));
        this.conditionEvaluators.set('has_tag', this.evaluateHasTag.bind(this));
        this.conditionEvaluators.set('no_tag', this.evaluateNoTag.bind(this));
    }

    // Main processing method
    async processAutomationStep(automationRunId, nodeId, context = {}) {
        try {
            logger.info(`[ADVANCED_AUTOMATION] Processing step: ${automationRunId}, node: ${nodeId}`);

            // Get automation run and rule
            const automationRun = await AutomationRun.findById(automationRunId).populate('sequenceId');
            if (!automationRun) {
                throw new Error(`Automation run not found: ${automationRunId}`);
            }

            const automationRule = automationRun.sequenceId;
            if (!automationRule) {
                throw new Error(`Automation rule not found for run: ${automationRunId}`);
            }

            // Find the node
            const node = automationRule.nodes.find(n => n.id === nodeId);
            if (!node) {
                throw new Error(`Node not found: ${nodeId}`);
            }

            // Execute the node
            const result = await this.executeNode(node, automationRun, context);

            // Update automation run
            await this.updateAutomationRun(automationRunId, {
                currentNode: nodeId,
                lastExecutedAt: new Date(),
                $push: {
                    executionHistory: {
                        nodeId,
                        nodeType: node.type,
                        executedAt: new Date(),
                        result: result.success,
                        error: result.error
                    }
                }
            });

            // Determine next nodes based on result
            const nextNodes = this.determineNextNodes(node, automationRule.edges, result);

            // Queue next nodes for execution
            for (const nextNode of nextNodes) {
                await this.queueNextNode(automationRunId, nextNode.id, {
                    ...context,
                    previousResult: result
                });
            }

            // Check if automation is complete
            if (nextNodes.length === 0 || nextNodes.some(n => n.type === 'end')) {
                await this.completeAutomation(automationRunId);
            }

            return result;

        } catch (error) {
            logger.error(`[ADVANCED_AUTOMATION] Error processing step:`, error);
            await this.failAutomation(automationRunId, error.message);
            throw error;
        }
    }

    // Node execution methods
    async executeTriggerNode(node, automationRun, context) {
        try {
            logger.info(`[ADVANCED_AUTOMATION] Executing trigger node: ${node.id}`);

            // Trigger nodes are entry points, they validate conditions and proceed
            const conditionsMet = await this.evaluateNodeConditions(node, automationRun);

            return {
                success: true,
                conditionsMet,
                triggerData: automationRun.context?.triggerData
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async executeActionNode(node, automationRun, context) {
        try {
            const { actionType, config, delay } = node.data;

            logger.info(`[ADVANCED_AUTOMATION] Executing action node: ${node.id}, type: ${actionType}`);

            // Apply delay if specified
            if (delay && delay > 0) {
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            }

            // Execute action based on type
            switch (actionType) {
                case 'send_whatsapp_message':
                    return await this.executeSendWhatsAppMessage(node, automationRun, config);

                case 'send_email_message':
                    return await this.executeSendEmailMessage(node, automationRun, config);

                case 'wait_delay':
                    return await this.executeWaitDelay(node, automationRun, config);

                case 'call_webhook':
                    return await this.executeCallWebhook(node, automationRun, config);

                case 'update_lead_score':
                    return await this.executeUpdateLeadScore(node, automationRun, config);

                case 'add_lead_tag':
                    return await this.executeAddLeadTag(node, automationRun, config);

                case 'create_task':
                    return await this.executeCreateTask(node, automationRun, config);

                default:
                    throw new Error(`Unknown action type: ${actionType}`);
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async executeConditionNode(node, automationRun, context) {
        try {
            const { conditionType, field, operator, value } = node.data;

            logger.info(`[ADVANCED_AUTOMATION] Executing condition node: ${node.id}`);

            // Evaluate the condition
            const evaluator = this.conditionEvaluators.get(operator);
            if (!evaluator) {
                throw new Error(`Unknown condition operator: ${operator}`);
            }

            const conditionMet = await evaluator(field, value, automationRun, context);

            return {
                success: true,
                conditionMet,
                conditionType,
                field,
                operator,
                value
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async executeDelayNode(node, automationRun, context) {
        try {
            const { delay } = node.data;
            const delayMs = (delay || 60) * 1000;

            logger.info(`[ADVANCED_AUTOMATION] Executing delay node: ${node.id}, delay: ${delayMs}ms`);

            // Update automation run status
            await AutomationRun.findByIdAndUpdate(automationRun._id, {
                status: 'waiting',
                nextExecutionAt: new Date(Date.now() + delayMs)
            });

            // Schedule next execution
            setTimeout(async () => {
                await AutomationRun.findByIdAndUpdate(automationRun._id, {
                    status: 'running',
                    $unset: { nextExecutionAt: 1 }
                });

                // Continue with next nodes
                const nextNodes = this.determineNextNodes(node, automationRun.sequenceId.edges, { success: true });
                for (const nextNode of nextNodes) {
                    await this.queueNextNode(automationRun._id, nextNode.id, context);
                }
            }, delayMs);

            return {
                success: true,
                delayed: true,
                delayMs
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async executeMessageValidationNode(node, automationRun, context) {
        try {
            const { validationRules, expectedContent } = node.data;

            logger.info(`[ADVANCED_AUTOMATION] Executing message validation node: ${node.id}`);

            // Get the latest reply from context or automation run
            const latestReply = context.latestReply || this.getLatestReply(automationRun);

            if (!latestReply) {
                return {
                    success: false,
                    error: 'No reply message found for validation'
                };
            }

            // Validate the message content
            const validationResult = await this.validateMessageContent(latestReply, validationRules, expectedContent);

            return {
                success: true,
                validationPassed: validationResult.passed,
                validationDetails: validationResult.details
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async executeReplyHandlerNode(node, automationRun, context) {
        try {
            const { expectedReplies, timeout } = node.data;

            logger.info(`[ADVANCED_AUTOMATION] Executing reply handler node: ${node.id}`);

            // Set up reply waiting
            await AutomationRun.findByIdAndUpdate(automationRun._id, {
                status: 'waiting_for_reply',
                replyTimeoutAt: new Date(Date.now() + (timeout || 24) * 60 * 60 * 1000), // Default 24 hours
                expectedReplies: expectedReplies || []
            });

            return {
                success: true,
                waitingForReply: true,
                expectedReplies,
                timeout: timeout || 24
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async executeWebhookNode(node, automationRun, context) {
        try {
            const { url, method, headers, body } = node.data.config || {};

            logger.info(`[ADVANCED_AUTOMATION] Executing webhook node: ${node.id}`);

            if (!url) {
                throw new Error('Webhook URL is required');
            }

            // Make HTTP request
            const axios = require('axios');
            const response = await axios({
                method: method || 'POST',
                url,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                data: body || {
                    automationId: automationRun._id,
                    context: automationRun.context
                },
                timeout: 30000
            });

            return {
                success: true,
                webhookResponse: {
                    status: response.status,
                    data: response.data
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Webhook failed: ${error.message}`
            };
        }
    }

    async executeEndNode(node, automationRun, context) {
        logger.info(`[ADVANCED_AUTOMATION] Executing end node: ${node.id}`);

        return {
            success: true,
            completed: true
        };
    }

    // Action execution helpers
    async executeSendWhatsAppMessage(node, automationRun, config) {
        const { message, templateId, template } = config;

        const messageData = {
            type: 'whatsapp',
            to: automationRun.context?.leadData?.phone,
            message,
            templateId,
            template,
            leadId: automationRun.context?.leadData?._id,
            automationRunId: automationRun._id,
            sequenceId: automationRun.sequenceId._id
        };

        await advancedMessageQueue.sendMessage(messageData, 8);

        return {
            success: true,
            messageType: 'whatsapp',
            queued: true
        };
    }

    async executeSendEmailMessage(node, automationRun, config) {
        const { subject, html, text } = config;

        const messageData = {
            type: 'email',
            to: automationRun.context?.leadData?.email,
            subject,
            html,
            text,
            leadId: automationRun.context?.leadData?._id,
            automationRunId: automationRun._id,
            sequenceId: automationRun.sequenceId._id
        };

        await advancedMessageQueue.sendMessage(messageData, 7);

        return {
            success: true,
            messageType: 'email',
            queued: true
        };
    }

    async executeWaitDelay(node, automationRun, config) {
        const delay = config.delay || 60; // Default 60 seconds
        await new Promise(resolve => setTimeout(resolve, delay * 1000));

        return {
            success: true,
            waited: delay
        };
    }

    async executeCallWebhook(node, automationRun, config) {
        // Reuse webhook execution logic
        return await this.executeWebhookNode(node, automationRun, {});
    }

    async executeUpdateLeadScore(node, automationRun, config) {
        const Lead = require('../schema/Lead');
        const { score } = config;

        await Lead.findByIdAndUpdate(automationRun.context?.leadData?._id, {
            score: score,
            lastUpdated: new Date()
        });

        return {
            success: true,
            updatedField: 'score',
            newValue: score
        };
    }

    async executeAddLeadTag(node, automationRun, config) {
        const Lead = require('../schema/Lead');
        const { tag } = config;

        await Lead.findByIdAndUpdate(automationRun.context?.leadData?._id, {
            $addToSet: { tags: tag },
            lastUpdated: new Date()
        });

        return {
            success: true,
            addedTag: tag
        };
    }

    async executeCreateTask(node, automationRun, config) {
        const Task = require('../schema/Task');
        const { title, description, assignedTo, priority } = config;

        const task = new Task({
            title,
            description,
            assignedTo: assignedTo || automationRun.coachId,
            relatedTo: {
                type: 'lead',
                id: automationRun.context?.leadData?._id
            },
            priority: priority || 'medium',
            createdBy: automationRun.coachId,
            automationId: automationRun._id
        });

        await task.save();

        return {
            success: true,
            taskId: task._id,
            created: true
        };
    }

    // Condition evaluators
    async evaluateEquals(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return fieldValue === value;
    }

    async evaluateNotEquals(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return fieldValue !== value;
    }

    async evaluateContains(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return fieldValue && fieldValue.includes && fieldValue.includes(value);
    }

    async evaluateNotContains(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return !fieldValue || !fieldValue.includes || !fieldValue.includes(value);
    }

    async evaluateGreaterThan(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return parseFloat(fieldValue) > parseFloat(value);
    }

    async evaluateLessThan(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return parseFloat(fieldValue) < parseFloat(value);
    }

    async evaluateIsEmpty(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return !fieldValue || fieldValue === '';
    }

    async evaluateIsNotEmpty(field, value, automationRun, context) {
        const fieldValue = await this.getFieldValue(field, automationRun, context);
        return fieldValue && fieldValue !== '';
    }

    async evaluateMessageReplyYes(field, value, automationRun, context) {
        const latestReply = context.latestReply || this.getLatestReply(automationRun);
        if (!latestReply) return false;

        const analysis = await aiAutomationService.analyzeReply(latestReply, automationRun.context);
        return analysis.intent === 'yes' || analysis.intent === 'confirm';
    }

    async evaluateMessageReplyNo(field, value, automationRun, context) {
        const latestReply = context.latestReply || this.getLatestReply(automationRun);
        if (!latestReply) return false;

        const analysis = await aiAutomationService.analyzeReply(latestReply, automationRun.context);
        return analysis.intent === 'no' || analysis.intent === 'decline';
    }

    async evaluateHasTag(field, value, automationRun, context) {
        const leadId = automationRun.context?.leadData?._id;
        if (!leadId) return false;

        const Lead = require('../schema/Lead');
        const lead = await Lead.findById(leadId);
        return lead && lead.tags && lead.tags.includes(value);
    }

    async evaluateNoTag(field, value, automationRun, context) {
        const leadId = automationRun.context?.leadData?._id;
        if (!leadId) return true;

        const Lead = require('../schema/Lead');
        const lead = await Lead.findById(leadId);
        return !lead || !lead.tags || !lead.tags.includes(value);
    }

    // Helper methods
    async getFieldValue(field, automationRun, context) {
        switch (field) {
            case 'lead_score':
                const Lead = require('../schema/Lead');
                const lead = await Lead.findById(automationRun.context?.leadData?._id);
                return lead?.score || 0;

            case 'lead_status':
                return automationRun.context?.leadData?.status || '';

            case 'last_reply':
                return context.latestReply || this.getLatestReply(automationRun) || '';

            case 'reply_count':
                return automationRun.repliesReceived || 0;

            default:
                return automationRun.context?.[field] || '';
        }
    }

    getLatestReply(automationRun) {
        if (!automationRun.messageLogs || automationRun.messageLogs.length === 0) {
            return null;
        }

        // Get the most recent reply
        const replies = automationRun.messageLogs
            .filter(log => log.replyContent)
            .sort((a, b) => new Date(b.repliedAt) - new Date(a.repliedAt));

        return replies.length > 0 ? replies[0].replyContent : null;
    }

    async validateMessageContent(content, rules, expectedContent) {
        let passed = true;
        const details = [];

        for (const rule of rules) {
            switch (rule) {
                case 'contains_text':
                    if (expectedContent && !content.toLowerCase().includes(expectedContent.toLowerCase())) {
                        passed = false;
                        details.push(`Does not contain expected text: ${expectedContent}`);
                    }
                    break;

                case 'is_numeric':
                    if (isNaN(content)) {
                        passed = false;
                        details.push('Content is not numeric');
                    }
                    break;

                case 'is_email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(content)) {
                        passed = false;
                        details.push('Content is not a valid email');
                    }
                    break;

                case 'min_length':
                    if (content.length < 10) { // Default minimum
                        passed = false;
                        details.push('Content is too short');
                    }
                    break;
            }
        }

        return { passed, details };
    }

    async evaluateNodeConditions(node, automationRun) {
        // Evaluate conditions attached to the node
        if (!node.data.conditions || node.data.conditions.length === 0) {
            return true; // No conditions means always proceed
        }

        for (const condition of node.data.conditions) {
            const evaluator = this.conditionEvaluators.get(condition.operator);
            if (!evaluator) continue;

            const result = await evaluator(condition.field, condition.value, automationRun, {});
            if (!result) return false;
        }

        return true;
    }

    determineNextNodes(currentNode, edges, result) {
        // Find outgoing edges from current node
        const outgoingEdges = edges.filter(edge => edge.source === currentNode.id);

        const nextNodes = [];

        for (const edge of outgoingEdges) {
            // Check if edge condition is met
            if (this.evaluateEdgeCondition(edge, result)) {
                // Find the target node
                const targetNode = edges.find(e => e.id === edge.target)?.data;
                if (targetNode) {
                    nextNodes.push(targetNode);
                }
            }
        }

        return nextNodes;
    }

    evaluateEdgeCondition(edge, result) {
        if (!edge.condition) return true; // No condition means always proceed

        const { field, operator, value } = edge.condition;

        // Evaluate based on result
        switch (field) {
            case 'success':
                return result.success === (value === 'true');

            case 'condition_met':
                return result.conditionMet === (value === 'true');

            case 'validation_passed':
                return result.validationPassed === (value === 'true');

            default:
                return true;
        }
    }

    async queueNextNode(automationRunId, nodeId, context) {
        // Queue the next node for processing
        await advancedMessageQueue.publishToQueue('automation_triggers_v2', {
            automationRunId,
            nodeId,
            context,
            queuedAt: new Date()
        }, { priority: 8 });
    }

    async updateAutomationRun(runId, updates) {
        await AutomationRun.findByIdAndUpdate(runId, updates);
    }

    async completeAutomation(runId) {
        await AutomationRun.findByIdAndUpdate(runId, {
            status: 'completed',
            completedAt: new Date()
        });

        logger.info(`[ADVANCED_AUTOMATION] Automation completed: ${runId}`);
    }

    async failAutomation(runId, error) {
        await AutomationRun.findByIdAndUpdate(runId, {
            status: 'failed',
            error: error,
            failedAt: new Date()
        });

        logger.error(`[ADVANCED_AUTOMATION] Automation failed: ${runId}, error: ${error}`);
    }

    // Public API methods
    async startAutomation(automationId, triggerData, coachId) {
        try {
            const automation = await AutomationRule.findById(automationId);
            if (!automation) {
                throw new Error('Automation not found');
            }

            // Create automation run
            const automationRun = new AutomationRun({
                sequenceId: automationId,
                coachId: coachId,
                status: 'running',
                context: triggerData,
                startedAt: new Date()
            });

            await automationRun.save();

            // Find starting node (trigger node)
            const startNode = automation.nodes.find(node => node.type === 'trigger');
            if (startNode) {
                await this.queueNextNode(automationRun._id, startNode.id, {
                    triggerData,
                    startTime: new Date()
                });
            }

            return automationRun;
        } catch (error) {
            logger.error('[ADVANCED_AUTOMATION] Error starting automation:', error);
            throw error;
        }
    }

    async processReply(automationRunId, replyContent, replyType = 'text') {
        try {
            // Update automation run with reply
            await AutomationRun.findByIdAndUpdate(automationRunId, {
                $push: {
                    messageLogs: {
                        replyContent,
                        repliedAt: new Date(),
                        replyType
                    }
                },
                $inc: { repliesReceived: 1 },
                lastActivityAt: new Date()
            });

            // Continue automation with reply context
            const automationRun = await AutomationRun.findById(automationRunId).populate('sequenceId');
            if (automationRun && automationRun.status === 'waiting_for_reply') {
                // Find current node and continue
                const currentNode = automationRun.sequenceId.nodes.find(n => n.id === automationRun.currentNode);
                if (currentNode) {
                    await this.processAutomationStep(automationRunId, currentNode.id, {
                        latestReply: replyContent,
                        replyType
                    });
                }
            }
        } catch (error) {
            logger.error('[ADVANCED_AUTOMATION] Error processing reply:', error);
            throw error;
        }
    }
}

module.exports = new AdvancedAutomationProcessor();
