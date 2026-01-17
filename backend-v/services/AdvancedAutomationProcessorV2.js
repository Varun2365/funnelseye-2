const AutomationRule = require('../schema/AutomationRule');
const AutomationRunV2 = require('../schema/AutomationRunV2');
const advancedMessageQueue = require('./advancedMessageQueueService');
const aiAutomationService = require('./aiAutomationService');
const { emailService } = require('./actionExecutorService');
const logger = require('../utils/logger');
const crypto = require('crypto');

class AdvancedAutomationProcessorV2 {
    constructor() {
        this.workerId = `worker_${crypto.randomBytes(8).toString('hex')}`;
        this.processingRuns = new Map();
        this.heartbeatInterval = null;

        // Node executors and evaluators
        this.nodeExecutors = new Map();
        this.conditionEvaluators = new Map();

        this.setupNodeExecutors();
        this.setupConditionEvaluators();
        this.startHeartbeat();
        this.startActionQueueProcessor();
    }

    // Setup node executors
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

    // Generate unique run ID
    generateRunId(automationRuleId, leadId, funnelId = null) {
        const components = [automationRuleId.toString(), leadId.toString()];
        if (funnelId) components.push(funnelId.toString());
        components.push(Date.now().toString());
        components.push(Math.random().toString(36).substr(2, 9));

        return crypto.createHash('sha256')
            .update(components.join('_'))
            .digest('hex')
            .substr(0, 32);
    }

    // Start automation run with proper isolation
    async startAutomation(automationRuleId, triggerData, coachId) {
        try {
            const automationRule = await AutomationRule.findById(automationRuleId);
            if (!automationRule) {
                throw new Error(`Automation rule not found: ${automationRuleId}`);
            }

            const leadId = triggerData.leadId;
            const funnelId = triggerData.funnelId;

            // Generate unique run ID
            const runId = this.generateRunId(automationRuleId, leadId, funnelId);

            // Check for existing run to prevent duplicates
            const existingRun = await AutomationRunV2.findOne({
                automationRuleId,
                leadId,
                status: { $in: ['initializing', 'running', 'waiting_for_reply', 'waiting_for_delay', 'waiting_for_condition'] }
            });

            if (existingRun) {
                logger.warn(`[AUTOMATION_V2] Run already exists for automation ${automationRuleId}, lead ${leadId}`);
                return existingRun;
            }

            // Create new run with isolation
            const automationRun = new AutomationRunV2({
                runId,
                automationRuleId,
                funnelId,
                leadId,
                coachId,
                triggerEvent: triggerData.event || 'manual_trigger',
                triggerData,
                status: 'initializing',
                graphState: {
                    nodes: automationRule.nodes,
                    edges: automationRule.edges,
                    viewport: automationRule.viewport
                },
                progress: {
                    totalNodes: automationRule.nodes.length
                },
                context: triggerData,
                variables: {}
            });

            await automationRun.save();

            logger.info(`[AUTOMATION_V2] Created isolated run: ${runId} for automation ${automationRuleId}, lead ${leadId}`);

            // Start processing from trigger node
            await this.queueAutomationStep(runId, this.findStartingNode(automationRule.nodes).id, {});

            return automationRun;

        } catch (error) {
            logger.error('[AUTOMATION_V2] Error starting automation:', error);
            throw error;
        }
    }

    // Find starting node (trigger node)
    findStartingNode(nodes) {
        return nodes.find(node => node.type === 'trigger') || nodes[0];
    }

    // Queue automation step with concurrency control
    async queueAutomationStep(runId, nodeId, context = {}) {
        try {
            const actionId = `action_${runId}_${nodeId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

            // Add to action queue atomically
            const automationRun = await AutomationRunV2.findOneAndUpdate(
                { runId },
                {
                    $push: {
                        actionQueue: {
                            actionId,
                            nodeId,
                            stepId: nodeId, // For compatibility
                            type: 'process_node',
                            priority: 5,
                            status: 'queued',
                            config: { context },
                            scheduledFor: new Date(),
                            createdAt: new Date()
                        }
                    },
                    lastActivityAt: new Date()
                },
                { new: true }
            );

            if (!automationRun) {
                throw new Error(`Automation run not found: ${runId}`);
            }

            // Queue for processing
            await advancedMessageQueue.publishToQueue('automation_actions_v2', {
                runId,
                actionId,
                nodeId,
                context
            }, { priority: 5 });

            logger.info(`[AUTOMATION_V2] Queued step: ${runId} -> ${nodeId}`);

        } catch (error) {
            logger.error(`[AUTOMATION_V2] Error queuing step:`, error);
            throw error;
        }
    }

    // Process automation step with locking
    async processAutomationStep(runId, actionId, nodeId, context = {}) {
        let automationRun = null;
        let lockAcquired = false;

        try {
            // Find and lock the automation run
            automationRun = await AutomationRunV2.findOne({ runId });

            if (!automationRun) {
                throw new Error(`Automation run not found: ${runId}`);
            }

            // Acquire lock
            const lockedRun = await automationRun.acquireLock(this.workerId);
            if (!lockedRun) {
                logger.warn(`[AUTOMATION_V2] Could not acquire lock for run: ${runId}`);
                // Re-queue for later
                setTimeout(() => {
                    this.queueAutomationStep(runId, nodeId, context);
                }, 5000);
                return;
            }

            lockAcquired = true;
            automationRun = lockedRun;

            // Mark action as processing
            await AutomationRunV2.findOneAndUpdate(
                { runId, 'actionQueue.actionId': actionId },
                {
                    $set: {
                        'actionQueue.$.status': 'processing',
                        'actionQueue.$.processingNode': this.workerId
                    }
                }
            );

            logger.info(`[AUTOMATION_V2] Processing step with lock: ${runId} -> ${nodeId}`);

            // Execute the node
            const result = await this.executeNode(automationRun, nodeId, context);

            // Update execution history
            await AutomationRunV2.findOneAndUpdate(
                { runId },
                {
                    $push: {
                        executionHistory: {
                            nodeId,
                            stepId: nodeId,
                            action: 'process_node',
                            status: result.success ? 'completed' : 'failed',
                            startedAt: new Date(),
                            completedAt: new Date(),
                            result: result,
                            error: result.error
                        }
                    },
                    $set: {
                        currentNodeId: nodeId,
                        lastActivityAt: new Date(),
                        status: result.success ? 'running' : 'failed'
                    },
                    $inc: {
                        'progress.completedNodes': 1,
                        'metrics.processingTime': result.duration || 0
                    }
                }
            );

            // Mark action as completed
            await AutomationRunV2.findOneAndUpdate(
                { runId, 'actionQueue.actionId': actionId },
                {
                    $set: {
                        'actionQueue.$.status': 'completed',
                        'actionQueue.$.result': result,
                        'actionQueue.$.completedAt': new Date()
                    }
                }
            );

            // Determine next nodes
            const nextNodes = this.determineNextNodes(automationRun.graphState.nodes, automationRun.graphState.edges, nodeId, result);

            if (nextNodes.length === 0) {
                // End of automation
                await this.completeAutomation(runId);
            } else {
                // Queue next nodes
                for (const nextNode of nextNodes) {
                    await this.queueAutomationStep(runId, nextNode.id, { ...context, previousResult: result });
                }
            }

            // Release lock
            await automationRun.releaseLock();
            lockAcquired = false;

        } catch (error) {
            logger.error(`[AUTOMATION_V2] Error processing step:`, error);

            // Mark action as failed
            if (automationRun) {
                await AutomationRunV2.findOneAndUpdate(
                    { runId, 'actionQueue.actionId': actionId },
                    {
                        $set: {
                            'actionQueue.$.status': 'failed',
                            'actionQueue.$.error': error.message,
                            'actionQueue.$.completedAt': new Date()
                        },
                        $inc: { 'actionQueue.$.retryCount': 1 }
                    }
                );

                // Add to error log
                await AutomationRunV2.findOneAndUpdate(
                    { runId },
                    {
                        $push: {
                            errorLogs: {
                                nodeId,
                                stepId: nodeId,
                                error: error.message,
                                timestamp: new Date()
                            }
                        },
                        $set: {
                            status: 'failed',
                            lastActivityAt: new Date()
                        }
                    }
                );
            }

            if (lockAcquired && automationRun) {
                await automationRun.releaseLock();
            }

            throw error;
        }
    }

    // Execute node with proper error handling
    async executeNode(automationRun, nodeId, context) {
        const startTime = Date.now();

        try {
            const node = automationRun.graphState.nodes.find(n => n.id === nodeId);
            if (!node) {
                throw new Error(`Node not found: ${nodeId}`);
            }

            const executor = this.nodeExecutors.get(node.type);
            if (!executor) {
                throw new Error(`Unknown node type: ${node.type}`);
            }

            const result = await executor(automationRun, node, context);
            const duration = Date.now() - startTime;

            return { ...result, duration };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                duration: Date.now() - startTime
            };
        }
    }

    // Node execution methods (simplified versions)
    async executeTriggerNode(automationRun, node, context) {
        // Trigger nodes just validate conditions and proceed
        return { success: true, triggerData: automationRun.triggerData };
    }

    async executeActionNode(automationRun, node, context) {
        const { actionType, config } = node.data;

        switch (actionType) {
            case 'send_whatsapp_message':
                return await this.executeSendWhatsAppMessage(automationRun, config);
            case 'send_email_message':
                return await this.executeSendEmailMessage(automationRun, config);
            case 'wait_delay':
                return await this.executeWaitDelay(automationRun, config);
            case 'call_webhook':
                return await this.executeCallWebhook(automationRun, config);
            default:
                throw new Error(`Unknown action type: ${actionType}`);
        }
    }

    async executeConditionNode(automationRun, node, context) {
        const { conditionType, field, operator, value } = node.data;

        const evaluator = this.conditionEvaluators.get(operator);
        if (!evaluator) {
            throw new Error(`Unknown condition operator: ${operator}`);
        }

        const conditionMet = await evaluator(field, value, automationRun, context);
        return { success: true, conditionMet };
    }

    async executeDelayNode(automationRun, node, context) {
        const { delay } = node.data;
        const delayMs = (delay || 60) * 1000;

        // Schedule next execution
        setTimeout(async () => {
            await this.queueAutomationStep(automationRun.runId, node.id, context);
        }, delayMs);

        // Set status to waiting
        await AutomationRunV2.findOneAndUpdate(
            { runId: automationRun.runId },
            { status: 'waiting_for_delay' }
        );

        return { success: true, delayed: true, delayMs };
    }

    async executeReplyHandlerNode(automationRun, node, context) {
        const { expectedReplies, timeout } = node.data;

        // Add reply handler
        await AutomationRunV2.findOneAndUpdate(
            { runId: automationRun.runId },
            {
                status: 'waiting_for_reply',
                $push: {
                    activeReplyHandlers: {
                        nodeId: node.id,
                        stepId: node.id,
                        expectedReplies: expectedReplies || [],
                        timeoutAt: new Date(Date.now() + (timeout || 24) * 60 * 60 * 1000)
                    }
                }
            }
        );

        return { success: true, waitingForReply: true };
    }

    async executeMessageValidationNode(automationRun, node, context) {
        try {
            const { validationRules, expectedContent } = node.data;

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

    async executeWebhookNode(automationRun, node, context) {
        try {
            const { url, method, headers, body } = node.data.config || {};

            if (!url) {
                throw new Error('Webhook URL is required');
            }

            const axios = require('axios');
            const response = await axios({
                method: method || 'POST',
                url,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                data: body || automationRun.context,
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

    async executeEndNode(automationRun, node, context) {
        return { success: true, completed: true };
    }

    // Action execution helpers
    async executeSendWhatsAppMessage(automationRun, config) {
        const messageData = {
            type: 'whatsapp',
            to: automationRun.context?.leadData?.phone,
            message: config.message,
            templateId: config.templateId,
            template: config.template,
            leadId: automationRun.leadId,
            automationRunId: automationRun.runId,
            sequenceId: automationRun.automationRuleId
        };

        await advancedMessageQueue.sendMessage(messageData, 8);

        await AutomationRunV2.findOneAndUpdate(
            { runId: automationRun.runId },
            { $inc: { 'metrics.messagesSent': 1 } }
        );

        return { success: true, messageType: 'whatsapp', queued: true };
    }

    async executeSendEmailMessage(automationRun, config) {
        const messageData = {
            type: 'email',
            to: automationRun.context?.leadData?.email,
            subject: config.subject,
            html: config.html,
            text: config.text,
            leadId: automationRun.leadId,
            automationRunId: automationRun.runId,
            sequenceId: automationRun.automationRuleId
        };

        await advancedMessageQueue.sendMessage(messageData, 7);

        await AutomationRunV2.findOneAndUpdate(
            { runId: automationRun.runId },
            { $inc: { 'metrics.messagesSent': 1 } }
        );

        return { success: true, messageType: 'email', queued: true };
    }

    async executeWaitDelay(automationRun, config) {
        const delay = config.delay || 60;
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
        return { success: true, waited: delay };
    }

    async executeCallWebhook(automationRun, config) {
        const { url, method, headers, body } = config;

        const axios = require('axios');
        const response = await axios({
            method: method || 'POST',
            url,
            headers: { 'Content-Type': 'application/json', ...headers },
            data: body || automationRun.context,
            timeout: 30000
        });

        return { success: true, webhookResponse: response.data };
    }

    // Helper methods for message validation
    getLatestReply(automationRun) {
        if (!automationRun.messageLogs || automationRun.messageLogs.length === 0) {
            return null;
        }

        // Get the most recent reply
        const replies = automationRun.messageLogs
            .filter(log => log.repliedAt)
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
        return parseFloat(fieldValue) < parseFloat(value2);
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
        const leadId = automationRun.leadId;
        if (!leadId) return false;

        const Lead = require('../schema/Lead');
        const lead = await Lead.findById(leadId);
        return lead && lead.tags && lead.tags.includes(value);
    }

    async evaluateNoTag(field, value, automationRun, context) {
        const leadId = automationRun.leadId;
        if (!leadId) return true;

        const Lead = require('../schema/Lead');
        const lead = await Lead.findById(leadId);
        return !lead || !lead.tags || !lead.tags.includes(value);
    }

    // Helper methods
    async getFieldValue(field, automationRun, context) {
        switch (field) {
            case 'latest_reply':
                return context.latestReply || this.getLatestReply(automationRun) || '';
            case 'reply_count':
                return automationRun.messageLogs.filter(log => log.repliedAt).length;
            default:
                return automationRun.variables[field] || automationRun.context[field] || '';
        }
    }

    getLatestReply(automationRun) {
        const replies = automationRun.messageLogs
            .filter(log => log.repliedAt)
            .sort((a, b) => new Date(b.repliedAt) - new Date(a.repliedAt));
        return replies.length > 0 ? replies[0].replyContent : null;
    }

    determineNextNodes(nodes, edges, currentNodeId, result) {
        const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);
        const nextNodes = [];

        for (const edge of outgoingEdges) {
            if (this.evaluateEdgeCondition(edge, result)) {
                const targetNode = nodes.find(n => n.id === edge.target);
                if (targetNode) nextNodes.push(targetNode);
            }
        }

        return nextNodes;
    }

    evaluateEdgeCondition(edge, result) {
        if (!edge.condition) return true;

        const { field, operator, value } = edge.condition;
        switch (field) {
            case 'success':
                return result.success === (value === 'true');
            case 'condition_met':
                return result.conditionMet === (value === 'true');
            default:
                return true;
        }
    }

    async completeAutomation(runId) {
        await AutomationRunV2.findOneAndUpdate(
            { runId },
            {
                status: 'completed',
                completedAt: new Date(),
                lastActivityAt: new Date()
            }
        );
        logger.info(`[AUTOMATION_V2] Completed automation: ${runId}`);
    }

    // Handle incoming replies
    async processReply(automationRunId, replyContent, replyType = 'text') {
        try {
            // Find automation run by lead ID or run ID
            const automationRun = await AutomationRunV2.findOne({
                $or: [
                    { runId: automationRunId },
                    { leadId: automationRunId }
                ],
                status: 'waiting_for_reply'
            });

            if (!automationRun) {
                logger.warn(`[AUTOMATION_V2] No waiting automation run found for reply: ${automationRunId}`);
                return;
            }

            // Acquire lock
            const lockedRun = await automationRun.acquireLock(this.workerId);
            if (!lockedRun) {
                logger.warn(`[AUTOMATION_V2] Could not acquire lock for reply processing: ${automationRun.runId}`);
                return;
            }

            // Analyze reply
            const analysis = await aiAutomationService.analyzeReply(replyContent, automationRun.context);

            // Add reply to message log
            await AutomationRunV2.findOneAndUpdate(
                { runId: automationRun.runId },
                {
                    $push: {
                        messageLogs: {
                            messageId: `reply_${Date.now()}`,
                            stepId: automationRun.currentNodeId,
                            nodeId: automationRun.currentNodeId,
                            channel: 'whatsapp', // Assume WhatsApp for now
                            type: 'inbound',
                            status: 'replied',
                            repliedAt: new Date(),
                            replyContent,
                            replyType,
                            aiAnalysis: analysis
                        }
                    },
                    $inc: {
                        'metrics.repliesReceived': 1,
                        'metrics.aiDecisionsMade': 1
                    },
                    lastActivityAt: new Date()
                }
            );

            // Find matching reply handler
            const replyHandler = automationRun.activeReplyHandlers.find(handler =>
                handler.expectedReplies.some(expected =>
                    this.matchesReply(replyContent, expected, analysis)
                )
            );

            if (replyHandler) {
                // Continue with next node
                await this.queueAutomationStep(
                    automationRun.runId,
                    replyHandler.nodeId,
                    { latestReply: replyContent, analysis }
                );

                // Remove reply handler
                await AutomationRunV2.findOneAndUpdate(
                    { runId: automationRun.runId },
                    {
                        $pull: { activeReplyHandlers: { nodeId: replyHandler.nodeId } },
                        status: 'running'
                    }
                );
            }

            // Release lock
            await automationRun.releaseLock();

        } catch (error) {
            logger.error('[AUTOMATION_V2] Error processing reply:', error);
            throw error;
        }
    }

    matchesReply(replyContent, expectedReply, analysis) {
        const content = replyContent.toLowerCase();
        const expected = expectedReply.toLowerCase();

        // Direct text match
        if (content.includes(expected)) return true;

        // Intent-based matching
        switch (expected) {
            case 'yes':
                return analysis.intent === 'yes' || analysis.intent === 'confirm';
            case 'no':
                return analysis.intent === 'no' || analysis.intent === 'decline';
            default:
                return false;
        }
    }

    // Action queue processor
    startActionQueueProcessor() {
        setInterval(async () => {
            try {
                // Find pending actions
                const pendingActions = await AutomationRunV2.aggregate([
                    { $match: { 'actionQueue.status': 'queued' } },
                    { $unwind: '$actionQueue' },
                    { $match: { 'actionQueue.status': 'queued', 'actionQueue.scheduledFor': { $lte: new Date() } } },
                    { $sort: { 'actionQueue.priority': -1, 'actionQueue.createdAt': 1 } },
                    { $limit: 10 }
                ]);

                for (const action of pendingActions) {
                    try {
                        await this.processAutomationStep(
                            action.runId,
                            action.actionQueue.actionId,
                            action.actionQueue.nodeId,
                            action.actionQueue.config.context || {}
                        );
                    } catch (error) {
                        logger.error(`[AUTOMATION_V2] Action queue processing error:`, error);
                    }
                }
            } catch (error) {
                logger.error('[AUTOMATION_V2] Action queue processor error:', error);
            }
        }, 5000); // Process every 5 seconds
    }

    // Heartbeat to maintain locks
    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            try {
                // Update lock expiration for runs this worker is processing
                await AutomationRunV2.updateMany(
                    { processingWorker: this.workerId, lockExpiresAt: { $gt: new Date() } },
                    { lockExpiresAt: new Date(Date.now() + 300000) } // 5 minutes
                );
            } catch (error) {
                logger.error('[AUTOMATION_V2] Heartbeat error:', error);
            }
        }, 60000); // Every minute
    }

    // Cleanup method
    async shutdown() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Release all locks held by this worker
        try {
            await AutomationRunV2.updateMany(
                { processingWorker: this.workerId },
                { $unset: { lockToken: 1, lockExpiresAt: 1, processingWorker: 1 } }
            );
        } catch (error) {
            logger.error('[AUTOMATION_V2] Error releasing locks during shutdown:', error);
        }
    }

    // Public API methods
    async triggerAutomation(eventType, data, coachId) {
        // Find matching automation rules
        const automationRules = await AutomationRule.find({
            coachId,
            triggerEvent: eventType,
            isActive: true
        });

        const results = [];
        for (const rule of automationRules) {
            try {
                const run = await this.startAutomation(rule._id, data, coachId);
                results.push(run);
            } catch (error) {
                logger.error(`[AUTOMATION_V2] Error starting automation ${rule._id}:`, error);
            }
        }

        return results;
    }
}

module.exports = new AdvancedAutomationProcessorV2();
