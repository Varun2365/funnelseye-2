/**
 * Automation Graph Worker
 * 
 * Comprehensive worker for handling graph-based automation rules.
 * Supports multiple trigger nodes, all node types, robust delay handling,
 * and state persistence for coach dashboard visibility.
 * 
 * Features:
 * - RabbitMQ queue system for scalability
 * - Graph traversal from trigger nodes
 * - All node type handling (trigger, action, condition, delay)
 * - Robust delay handling using delayed messages
 * - Execution state persistence
 * - Node configuration handling
 * - Multiple worker process support
 */

const amqp = require('amqplib');
const mongoose = require('mongoose');
const AdminAutomationRule = require('../schema/AdminAutomationRule');
const Lead = require('../schema/Lead');
const { executeAutomationAction } = require('../services/actionExecutorService');
const crypto = require('crypto');

// Configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const AUTOMATION_EXCHANGE = 'funnelseye_automation_graph';
const AUTOMATION_QUEUE = 'funnelseye_automation_graph_queue';
const DELAYED_QUEUE = 'funnelseye_automation_delayed_queue';
const DELAYED_EXCHANGE = 'funnelseye_automation_delayed_exchange';

// Worker ID for tracking
const WORKER_ID = `worker_${crypto.randomBytes(8).toString('hex')}`;

/**
 * Automation Execution State Schema
 * Tracks the state of automation rule execution for each lead
 */
const AutomationExecutionStateSchema = new mongoose.Schema({
  // Identification
  executionId: {
    type: String,
    required: true,
    unique: true
    // Note: unique: true automatically creates an index, no need for index: true
  },
  
  // Relationships
  automationRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminAutomationRule',
    required: true,
    index: true
  },
  
  funnelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminFunnel',
    index: true
  },
  
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true
  },
  
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Trigger information
  triggerNodeId: {
    type: String,
    required: true,
    index: true
  },
  
  triggerEvent: {
    type: String,
    required: true
  },
  
  triggerData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Execution state
  status: {
    type: String,
    enum: ['running', 'waiting_delay', 'waiting_reply', 'completed', 'failed', 'paused', 'cancelled'],
    default: 'running',
    index: true
  },
  
  // Current position in graph
  currentNodeId: {
    type: String,
    index: true
  },
  
  // Visited nodes (to prevent loops)
  visitedNodes: [{
    type: String
  }],
  
  // Completed nodes
  completedNodes: [{
    nodeId: String,
    completedAt: Date,
    result: mongoose.Schema.Types.Mixed
  }],
  
  // Waiting for delay
  delayUntil: Date,
  delayNodeId: String,
  
  // Waiting for reply
  waitingForReply: {
    nodeId: String,
    messageId: String,
    expectedReplies: [String],
    timeoutAt: Date,
    channel: String
  },
  
  // Variables and context
  variables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Execution history
  executionHistory: [{
    nodeId: String,
    nodeType: String,
    action: String,
    status: String,
    startedAt: Date,
    completedAt: Date,
    result: mongoose.Schema.Types.Mixed,
    error: String
  }],
  
  // Error handling
  errorLogs: [{
    nodeId: String,
    error: String,
    timestamp: Date,
    retryCount: Number
  }],
  
  // Metrics
  metrics: {
    nodesProcessed: { type: Number, default: 0 },
    actionsExecuted: { type: Number, default: 0 },
    delaysCompleted: { type: Number, default: 0 },
    conditionsEvaluated: { type: Number, default: 0 },
    errors: { type: Number, default: 0 }
  },
  
  // Timing
  startedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  completedAt: Date,
  
  // Worker tracking
  processingWorker: String,
  lockExpiresAt: Date
  
}, {
  timestamps: true,
  collection: 'automation_execution_states'
});

// Indexes
AutomationExecutionStateSchema.index({ automationRuleId: 1, leadId: 1, triggerNodeId: 1 });
AutomationExecutionStateSchema.index({ status: 1, delayUntil: 1 });
AutomationExecutionStateSchema.index({ status: 1, 'waitingForReply.timeoutAt': 1 });
AutomationExecutionStateSchema.index({ lastActivityAt: 1 });

const AutomationExecutionState = mongoose.models.AutomationExecutionState || 
  mongoose.model('AutomationExecutionState', AutomationExecutionStateSchema);

/**
 * Get next nodes from current node following edges
 */
function getNextNodes(currentNodeId, edges, conditionResult = null) {
  const nextNodes = [];
  
  edges.forEach(edge => {
    if (edge.source === currentNodeId) {
      // For condition nodes, check handle IDs
      if (edge.sourceHandle) {
        // Condition node with true/false paths
        if (edge.sourceHandle === 'true' && conditionResult === true) {
          nextNodes.push(edge.target);
        } else if (edge.sourceHandle === 'false' && conditionResult === false) {
          nextNodes.push(edge.target);
        }
      } else {
        // Regular edge
        nextNodes.push(edge.target);
      }
    }
  });
  
  return nextNodes;
}

/**
 * Evaluate condition node
 */
async function evaluateCondition(node, context, leadData) {
  try {
    const conditionType = node.nodeType || node.data?.conditionType || 'custom';
    const config = node.config || node.data?.config || {};
    
    switch (conditionType) {
      case 'Message Validation':
      case 'message_validation': {
        // Check if waiting for reply
        const expectedReplies = config.expectedReplies || [];
        const receivedReply = context.receivedReply || context.lastMessage;
        
        if (!receivedReply) {
          return { met: false, waiting: true };
        }
        
        const replyText = (receivedReply.text || receivedReply.body || '').toLowerCase();
        const met = expectedReplies.some(expected => 
          replyText.includes(expected.toLowerCase())
        );
        
        return { met, waiting: false };
      }
      
      case 'Lead Status Check':
      case 'lead_status_check': {
        const requiredStatus = config.requiredStatus;
        const met = leadData?.status === requiredStatus;
        return { met, waiting: false };
      }
      
      case 'Lead Score Check':
      case 'lead_score_check': {
        const operator = config.operator || '>=';
        const threshold = config.threshold || 0;
        const score = leadData?.score || 0;
        
        let met = false;
        switch (operator) {
          case '>=': met = score >= threshold; break;
          case '<=': met = score <= threshold; break;
          case '>': met = score > threshold; break;
          case '<': met = score < threshold; break;
          case '==': met = score === threshold; break;
        }
        
        return { met, waiting: false };
      }
      
      case 'Custom':
      default: {
        // Custom condition evaluation
        const condition = config.condition || config.expression;
        if (typeof condition === 'function') {
          const met = await condition(leadData, context);
          return { met, waiting: false };
        }
        // Default to true if no condition specified
        return { met: true, waiting: false };
      }
    }
  } catch (error) {
    console.error(`[AutomationWorker] Error evaluating condition:`, error);
    return { met: false, waiting: false, error: error.message };
  }
}

/**
 * Execute action node
 */
async function executeActionNode(node, executionState, leadData, context) {
  try {
    const actionType = node.nodeType || node.data?.value || node.data?.nodeType;
    const config = node.config || node.data?.config || {};
    
    console.log(`[AutomationWorker] Executing action: ${actionType} for node: ${node.id}`);
    
    // Prepare event payload for action executor
    const eventPayload = {
      relatedDoc: leadData,
      coachId: executionState.coachId,
      leadId: executionState.leadId,
      automationRuleId: executionState.automationRuleId,
      executionId: executionState.executionId,
      context: {
        ...executionState.context,
        ...context,
        currentNodeId: node.id,
        nodeType: node.type
      }
    };
    
    // Execute the action
    await executeAutomationAction({
      actionType,
      config: {
        ...config,
        // Handle messaging channel selection
        channelCategory: config.channelCategory || config.channel || 'meta_whatsapp',
        channelId: config.channelId,
        // Handle reply waiting configuration
        waitForReply: config.waitForReply || false,
        expectedReplies: config.expectedReplies || [],
        replyTimeout: config.replyTimeout || 3600, // seconds
        // Other config options
        ...config
      },
      payload: eventPayload
    });
    
    return {
      success: true,
      actionType,
      executedAt: new Date()
    };
  } catch (error) {
    console.error(`[AutomationWorker] Error executing action node ${node.id}:`, error);
    return {
      success: false,
      error: error.message,
      executedAt: new Date()
    };
  }
}

/**
 * Handle delay node - schedule next execution
 */
async function handleDelayNode(node, executionState, channel) {
  try {
    const delayMinutes = node.data?.delayMinutes || node.config?.delayMinutes || 60;
    const delayMs = delayMinutes * 60 * 1000;
    const delayUntil = new Date(Date.now() + delayMs);
    
    console.log(`[AutomationWorker] Scheduling delay: ${delayMinutes} minutes (${delayMs}ms)`);
    
    // Update execution state to waiting
    await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
      status: 'waiting_delay',
      delayUntil,
      delayNodeId: node.id,
      currentNodeId: node.id,
      lastActivityAt: new Date()
    });
    
    // Schedule delayed message for continuation
    const delayMessage = {
      executionId: executionState.executionId,
      currentNodeId: node.id,
      type: 'continue_after_delay',
      timestamp: Date.now()
    };
    
    // Use RabbitMQ delayed message plugin or schedule
    // For RabbitMQ with delayed message plugin:
    const delayInSeconds = Math.floor(delayMs / 1000);
    
    try {
      // Try to publish with delayed message exchange
      await channel.publish(
        DELAYED_EXCHANGE,
        'delay.continue',
        Buffer.from(JSON.stringify(delayMessage)),
        {
          headers: {
            'x-delay': delayMs // Requires rabbitmq-delayed-message-exchange plugin
          },
          expiration: delayMs.toString() // Fallback if plugin not available
        }
      );
    } catch (error) {
      // Fallback: Use setTimeout and store in database for persistence
      console.log(`[AutomationWorker] Delayed message exchange not available, using setTimeout fallback`);
      
      // Store delay info in execution state
      await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
        delayUntil,
        delayNodeId: node.id,
        delayScheduledAt: new Date()
      });
      
      // Schedule continuation using setTimeout (with persistence check)
      setTimeout(async () => {
        try {
          // Verify delay is still valid
          const currentState = await AutomationExecutionState.findOne({ executionId: executionState.executionId });
          if (currentState && currentState.status === 'waiting_delay' && currentState.delayNodeId === node.id) {
            // Publish continue message
            await channel.publish(
              AUTOMATION_EXCHANGE,
              'delay.continue',
              Buffer.from(JSON.stringify(delayMessage)),
              { persistent: true }
            );
          }
        } catch (err) {
          console.error(`[AutomationWorker] Error in delay setTimeout fallback:`, err);
        }
      }, delayMs);
    }
    
    console.log(`[AutomationWorker] Delay scheduled, will continue after ${delayMinutes} minutes`);
    
    return {
      success: true,
      delayed: true,
      delayMinutes,
      delayUntil
    };
  } catch (error) {
    console.error(`[AutomationWorker] Error handling delay node:`, error);
    throw error;
  }
}

/**
 * Process a single node in the automation graph
 */
async function processNode(node, executionState, automationRule, leadData, context, channel) {
  try {
    console.log(`[AutomationWorker] Processing node: ${node.id} (${node.type})`);
    
    // Check if node already visited (prevent infinite loops)
    if (executionState.visitedNodes.includes(node.id)) {
      console.log(`[AutomationWorker] Node ${node.id} already visited, skipping`);
      return { success: true, skipped: true };
    }
    
    // Update execution state
    await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
      $addToSet: { visitedNodes: node.id },
      currentNodeId: node.id,
      lastActivityAt: new Date(),
      $inc: { 'metrics.nodesProcessed': 1 }
    });
    
    let result = { success: true };
    
    // Handle different node types
    switch (node.type) {
      case 'trigger':
        // Trigger nodes are entry points, just mark as completed
        result = {
          success: true,
          triggerEvent: node.nodeType,
          executedAt: new Date()
        };
        break;
        
      case 'action':
        result = await executeActionNode(node, executionState, leadData, context);
        break;
        
      case 'condition':
        const conditionResult = await evaluateCondition(node, context, leadData);
        if (conditionResult.waiting) {
          // Need to wait for reply
          await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
            status: 'waiting_reply',
            'waitingForReply.nodeId': node.id,
            'waitingForReply.expectedReplies': node.config?.expectedReplies || [],
            'waitingForReply.timeoutAt': new Date(Date.now() + (node.config?.replyTimeout || 3600) * 1000)
          });
          return { success: true, waiting: true };
        }
        result = {
          success: true,
          conditionMet: conditionResult.met,
          executedAt: new Date()
        };
        break;
        
      case 'delay':
        result = await handleDelayNode(node, executionState, channel);
        if (result.delayed) {
          return result; // Delay scheduled, will continue later
        }
        break;
        
      default:
        console.warn(`[AutomationWorker] Unknown node type: ${node.type}`);
        result = { success: true, skipped: true };
    }
    
    // Record execution history
    await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
      $push: {
        executionHistory: {
          nodeId: node.id,
          nodeType: node.type,
          action: node.nodeType || 'unknown',
          status: result.success ? 'completed' : 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          result: result,
          error: result.error || null
        },
        completedNodes: {
          nodeId: node.id,
          completedAt: new Date(),
          result: result
        }
      },
      $inc: {
        'metrics.actionsExecuted': node.type === 'action' ? 1 : 0,
        'metrics.delaysCompleted': node.type === 'delay' ? 1 : 0,
        'metrics.conditionsEvaluated': node.type === 'condition' ? 1 : 0,
        'metrics.errors': result.success ? 0 : 1
      },
      lastActivityAt: new Date()
    });
    
    // Get next nodes
    const nextNodeIds = getNextNodes(
      node.id,
      automationRule.edges,
      result.conditionMet !== undefined ? result.conditionMet : null
    );
    
    if (nextNodeIds.length === 0) {
      // No more nodes, execution complete
      await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
        status: 'completed',
        completedAt: new Date(),
        $unset: { currentNodeId: 1 }
      });
      console.log(`[AutomationWorker] Execution ${executionState.executionId} completed`);
      return { success: true, completed: true };
    }
    
    // Queue next nodes for processing
    for (const nextNodeId of nextNodeIds) {
      const nextNode = automationRule.nodes.find(n => n.id === nextNodeId);
      if (!nextNode) {
        console.warn(`[AutomationWorker] Next node ${nextNodeId} not found`);
        continue;
      }
      
      // Queue next node
      await channel.publish(
        AUTOMATION_EXCHANGE,
        'node.process',
        Buffer.from(JSON.stringify({
          executionId: executionState.executionId,
          nodeId: nextNodeId,
          type: 'process_node'
        }))
      );
    }
    
    return { success: true, nextNodes: nextNodeIds };
    
  } catch (error) {
    console.error(`[AutomationWorker] Error processing node ${node.id}:`, error);
    
    // Record error
    await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
      $push: {
        errorLogs: {
          nodeId: node.id,
          error: error.message,
          timestamp: new Date(),
          retryCount: 0
        }
      },
      $inc: { 'metrics.errors': 1 },
      lastActivityAt: new Date()
    });
    
    throw error;
  }
}

/**
 * Start automation execution from trigger node
 */
async function startAutomationExecution(automationRuleId, triggerNodeId, triggerEvent, triggerData, leadId, funnelId) {
  try {
    // Get automation rule
    const automationRule = await AdminAutomationRule.findById(automationRuleId);
    if (!automationRule || !automationRule.isActive) {
      throw new Error('Automation rule not found or inactive');
    }
    
    // Get lead data
    const lead = await Lead.findById(leadId).populate('coachId');
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    const coachId = lead.coachId?._id || lead.coachId;
    
    // Find trigger node
    const triggerNode = automationRule.nodes.find(n => n.id === triggerNodeId && n.type === 'trigger');
    if (!triggerNode) {
      throw new Error(`Trigger node ${triggerNodeId} not found`);
    }
    
    // Create execution state
    const executionId = `exec_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const executionState = await AutomationExecutionState.create({
      executionId,
      automationRuleId: automationRule._id,
      funnelId: funnelId || automationRule.funnelId,
      leadId: lead._id,
      coachId: coachId,
      triggerNodeId: triggerNode.id,
      triggerEvent,
      triggerData,
      status: 'running',
      currentNodeId: triggerNode.id,
      visitedNodes: [],
      completedNodes: [],
      variables: {},
      context: {
        triggerEvent,
        triggerData,
        leadData: lead.toObject(),
        startedAt: new Date()
      },
      executionHistory: [],
      errorLogs: [],
      metrics: {
        nodesProcessed: 0,
        actionsExecuted: 0,
        delaysCompleted: 0,
        conditionsEvaluated: 0,
        errors: 0
      },
      processingWorker: WORKER_ID
    });
    
    console.log(`[AutomationWorker] Started execution ${executionId} for rule ${automationRule.name}`);
    
    return executionState;
  } catch (error) {
    console.error(`[AutomationWorker] Error starting automation execution:`, error);
    throw error;
  }
}

/**
 * Continue automation after delay
 */
async function continueAfterDelay(executionId, delayNodeId, channel) {
  try {
    const executionState = await AutomationExecutionState.findOne({ executionId });
    if (!executionState) {
      throw new Error(`Execution state ${executionId} not found`);
    }
    
    if (executionState.status !== 'waiting_delay' || executionState.delayNodeId !== delayNodeId) {
      console.log(`[AutomationWorker] Execution ${executionId} is not waiting for delay or delay node mismatch`);
      return;
    }
    
    // Get automation rule
    const automationRule = await AdminAutomationRule.findById(executionState.automationRuleId);
    if (!automationRule) {
      throw new Error('Automation rule not found');
    }
    
    // Get lead data
    const lead = await Lead.findById(executionState.leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    // Update status
    await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
      status: 'running',
      $unset: { delayUntil: 1, delayNodeId: 1 },
      lastActivityAt: new Date()
    });
    
    // Get delay node
    const delayNode = automationRule.nodes.find(n => n.id === delayNodeId);
    if (!delayNode) {
      throw new Error(`Delay node ${delayNodeId} not found`);
    }
    
    // Process delay node completion and continue
    const nextNodeIds = getNextNodes(delayNodeId, automationRule.edges);
    
    for (const nextNodeId of nextNodeIds) {
      const nextNode = automationRule.nodes.find(n => n.id === nextNodeId);
      if (!nextNode) continue;
      
      await channel.publish(
        AUTOMATION_EXCHANGE,
        'node.process',
        Buffer.from(JSON.stringify({
          executionId: executionState.executionId,
          nodeId: nextNodeId,
          type: 'process_node'
        }))
      );
    }
    
    console.log(`[AutomationWorker] Continued execution ${executionId} after delay`);
  } catch (error) {
    console.error(`[AutomationWorker] Error continuing after delay:`, error);
  }
}

/**
 * Handle reply received for waiting condition node
 */
async function handleReplyReceived(executionId, messageData, channel) {
  try {
    const executionState = await AutomationExecutionState.findOne({ 
      executionId,
      status: 'waiting_reply'
    });
    
    if (!executionState || !executionState.waitingForReply) {
      return; // Not waiting for reply
    }
    
    // Get automation rule
    const automationRule = await AdminAutomationRule.findById(executionState.automationRuleId);
    if (!automationRule) {
      throw new Error('Automation rule not found');
    }
    
    // Get condition node
    const conditionNode = automationRule.nodes.find(n => n.id === executionState.waitingForReply.nodeId);
    if (!conditionNode) {
      throw new Error('Condition node not found');
    }
    
    // Update context with received reply
    const updatedContext = {
      ...executionState.context,
      receivedReply: messageData,
      lastMessage: messageData
    };
    
    // Evaluate condition
    const lead = await Lead.findById(executionState.leadId);
    const conditionResult = await evaluateCondition(conditionNode, updatedContext, lead);
    
    // Update execution state
    await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
      status: 'running',
      $unset: { waitingForReply: 1 },
      context: updatedContext,
      lastActivityAt: new Date()
    });
    
    // Continue with next nodes based on condition result
    const nextNodeIds = getNextNodes(
      conditionNode.id,
      automationRule.edges,
      conditionResult.met
    );
    
    for (const nextNodeId of nextNodeIds) {
      const nextNode = automationRule.nodes.find(n => n.id === nextNodeId);
      if (!nextNode) continue;
      
      await channel.publish(
        AUTOMATION_EXCHANGE,
        'node.process',
        Buffer.from(JSON.stringify({
          executionId: executionState.executionId,
          nodeId: nextNodeId,
          type: 'process_node'
        }))
      );
    }
    
    console.log(`[AutomationWorker] Handled reply for execution ${executionId}, condition met: ${conditionResult.met}`);
  } catch (error) {
    console.error(`[AutomationWorker] Error handling reply:`, error);
  }
}

/**
 * Main worker initialization
 */
const initAutomationGraphWorker = async () => {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/FunnelsEye');
    }
    
    // Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Assert exchanges
    await channel.assertExchange(AUTOMATION_EXCHANGE, 'topic', { durable: true });
    await channel.assertExchange(DELAYED_EXCHANGE, 'x-delayed-message', {
      durable: true,
      arguments: { 'x-delayed-type': 'topic' }
    }).catch(() => {
      // Fallback if delayed message plugin not available
      console.warn(`[AutomationGraphWorker] Delayed message exchange plugin not available, using standard exchange`);
      return channel.assertExchange(DELAYED_EXCHANGE, 'topic', { durable: true });
    });
    
    // Assert queues
    const { queue } = await channel.assertQueue(AUTOMATION_QUEUE, { 
      durable: true,
      arguments: {
        'x-message-ttl': 86400000, // 24 hours
        'x-max-priority': 10
      }
    });
    
    await channel.assertQueue(DELAYED_QUEUE, {
      durable: true,
      arguments: {
        'x-message-ttl': 604800000, // 7 days
        'x-dead-letter-exchange': AUTOMATION_EXCHANGE,
        'x-dead-letter-routing-key': 'node.process'
      }
    });
    
    // Bind queues
    await channel.bindQueue(queue, AUTOMATION_EXCHANGE, 'trigger.start');
    await channel.bindQueue(queue, AUTOMATION_EXCHANGE, 'node.process');
    await channel.bindQueue(DELAYED_QUEUE, DELAYED_EXCHANGE, 'delay.continue');
    
    // Consume messages
    channel.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const payload = JSON.parse(msg.content.toString());
        
        if (payload.type === 'trigger.start') {
          // Start new automation execution
          const executionState = await startAutomationExecution(
            payload.automationRuleId,
            payload.triggerNodeId,
            payload.triggerEvent,
            payload.triggerData,
            payload.leadId,
            payload.funnelId
          );
          
          // Process trigger node and continue
          const automationRule = await AdminAutomationRule.findById(payload.automationRuleId);
          const lead = await Lead.findById(payload.leadId);
          
          const triggerNode = automationRule.nodes.find(n => n.id === payload.triggerNodeId);
          await processNode(triggerNode, executionState, automationRule, lead, executionState.context, channel);
          
        } else if (payload.type === 'process_node') {
          // Process a specific node
          const executionState = await AutomationExecutionState.findOne({ executionId: payload.executionId });
          if (!executionState) {
            console.error(`[AutomationGraphWorker] Execution state ${payload.executionId} not found`);
            channel.ack(msg);
            return;
          }
          
          // Acquire lock
          const locked = await AutomationExecutionState.findOneAndUpdate(
            {
              _id: executionState._id,
              $or: [
                { processingWorker: { $exists: false } },
                { processingWorker: executionState.processingWorker },
                { lockExpiresAt: { $lt: new Date() } }
              ]
            },
            {
              processingWorker: WORKER_ID,
              lockExpiresAt: new Date(Date.now() + 300000) // 5 minutes
            }
          );
          
          if (!locked) {
            console.log(`[AutomationGraphWorker] Could not acquire lock for execution ${payload.executionId}`);
            channel.nack(msg, false, true); // Requeue
            return;
          }
          
          const automationRule = await AdminAutomationRule.findById(executionState.automationRuleId);
          const lead = await Lead.findById(executionState.leadId);
          const node = automationRule.nodes.find(n => n.id === payload.nodeId);
          
          if (!node) {
            console.error(`[AutomationGraphWorker] Node ${payload.nodeId} not found`);
            channel.ack(msg);
            return;
          }
          
          await processNode(node, executionState, automationRule, lead, executionState.context, channel);
          
          // Release lock
          await AutomationExecutionState.findByIdAndUpdate(executionState._id, {
            $unset: { processingWorker: 1, lockExpiresAt: 1 }
          });
          
        } else if (payload.type === 'continue_after_delay') {
          // Continue after delay
          await continueAfterDelay(payload.executionId, payload.currentNodeId, channel);
          
        } else if (payload.type === 'reply.received') {
          // Handle reply received
          await handleReplyReceived(payload.executionId, payload.messageData, channel);
        }
        
        channel.ack(msg);
      } catch (error) {
        console.error(`[AutomationGraphWorker:${WORKER_ID}] Error processing message:`, error);
        // Don't requeue on error to prevent infinite loops
        channel.ack(msg);
      }
    }, {
      noAck: false,
      consumerTag: WORKER_ID
    });
    
    // Consume delayed messages
    channel.consume(DELAYED_QUEUE, async (msg) => {
      if (!msg) return;
      
      try {
        const payload = JSON.parse(msg.content.toString());
        
        if (payload.type === 'continue_after_delay') {
          await continueAfterDelay(payload.executionId, payload.currentNodeId, channel);
        }
        
        channel.ack(msg);
      } catch (error) {
        console.error(`[AutomationGraphWorker:${WORKER_ID}] Error processing delayed message:`, error);
        channel.ack(msg);
      }
    }, {
      noAck: false,
      consumerTag: `${WORKER_ID}_delayed`
    });
    
    // Handle connection errors
    connection.on('close', () => {
      console.error(`[AutomationGraphWorker:${WORKER_ID}] Connection closed, reconnecting...`);
      setTimeout(initAutomationGraphWorker, 5000);
    });
    
    connection.on('error', (err) => {
      // Connection error handled silently
    });
    
    // Periodic task to check for delayed executions that need to be continued
    setInterval(async () => {
      try {
        const now = new Date();
        const delayedExecutions = await AutomationExecutionState.find({
          status: 'waiting_delay',
          delayUntil: { $lte: now }
        }).limit(10); // Process 10 at a time
        
        for (const execution of delayedExecutions) {
          try {
            // Verify it's still waiting
            const currentState = await AutomationExecutionState.findOne({
              _id: execution._id,
              status: 'waiting_delay',
              delayUntil: { $lte: now }
            });
            
            if (currentState && currentState.delayNodeId) {
              // Publish continue message
              await channel.publish(
                AUTOMATION_EXCHANGE,
                'delay.continue',
                Buffer.from(JSON.stringify({
                  type: 'continue_after_delay',
                  executionId: execution.executionId,
                  currentNodeId: currentState.delayNodeId
                })),
                { persistent: true }
              );
              
              console.log(`[AutomationGraphWorker:${WORKER_ID}] Triggered continuation for delayed execution ${execution.executionId}`);
            }
          } catch (err) {
            console.error(`[AutomationGraphWorker:${WORKER_ID}] Error processing delayed execution:`, err);
          }
        }
      } catch (error) {
        console.error(`[AutomationGraphWorker:${WORKER_ID}] Error in delay check task:`, error);
      }
    }, 60000); // Check every minute
    
    // Periodic task to check for expired reply waits
    setInterval(async () => {
      try {
        const now = new Date();
        const expiredReplies = await AutomationExecutionState.find({
          status: 'waiting_reply',
          'waitingForReply.timeoutAt': { $lte: now }
        });
        
        for (const execution of expiredReplies) {
          // Mark as failed or continue with default path
          await AutomationExecutionState.findByIdAndUpdate(execution._id, {
            status: 'running',
            $unset: { waitingForReply: 1 },
            $push: {
              errorLogs: {
                nodeId: execution.waitingForReply?.nodeId,
                error: 'Reply timeout expired',
                timestamp: new Date(),
                retryCount: 0
              }
            },
            lastActivityAt: new Date()
          });
          
          console.log(`[AutomationGraphWorker:${WORKER_ID}] Reply timeout expired for execution ${execution.executionId}`);
        }
      } catch (error) {
        console.error(`[AutomationGraphWorker:${WORKER_ID}] Error in reply timeout check:`, error);
      }
    }, 30000); // Check every 30 seconds
    
  } catch (error) {
    console.error(`[AutomationGraphWorker:${WORKER_ID}] Initialization error:`, error);
    setTimeout(initAutomationGraphWorker, 5000);
  }
};

module.exports = initAutomationGraphWorker;
