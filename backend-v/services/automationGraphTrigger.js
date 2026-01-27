/**
 * Automation Graph Trigger Service
 * 
 * Service to trigger graph-based automation rules when events occur.
 * Finds matching automation rules and starts execution from trigger nodes.
 */

const amqp = require('amqplib');
const AdminAutomationRule = require('../schema/AdminAutomationRule');
const Lead = require('../schema/Lead');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const AUTOMATION_EXCHANGE = 'funnelseye_automation_graph';
const EVENTS_EXCHANGE = 'funnelseye_events';

let channel = null;
let eventsChannel = null;

/**
 * Initialize RabbitMQ connection for triggering automations
 */
const init = async () => {
  try {
    // Connection for publishing automation triggers
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    await channel.assertExchange(AUTOMATION_EXCHANGE, 'topic', { durable: true });
    
    // Connection for listening to events
    const eventsConnection = await amqp.connect(RABBITMQ_URL);
    eventsChannel = await eventsConnection.createChannel();
    
    await eventsChannel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: true });
    
    // Create queue for listening to events
    const { queue } = await eventsChannel.assertQueue('automation_graph_events', { durable: true });
    
    // Bind to all event types that might trigger automations
    const eventPatterns = [
      'lead_created',
      'lead_status_changed',
      'lead_updated',
      'form_submitted',
      'whatsapp_message_received',
      'whatsapp_message_sent',
      'email_opened',
      'email_clicked',
      'payment_successful',
      'payment_failed',
      'appointment_booked',
      'appointment_cancelled',
      'task_created',
      'task_completed'
    ];
    
    for (const pattern of eventPatterns) {
      await eventsChannel.bindQueue(queue, EVENTS_EXCHANGE, pattern);
    }
    
    // Listen to events
    eventsChannel.consume(queue, async (msg) => {
      if (!msg) return;
      
      try {
        const eventData = JSON.parse(msg.content.toString());
        const eventType = msg.fields.routingKey || eventData.eventName || eventData.eventType;
        
        console.log(`[AutomationGraphTrigger] Received event: ${eventType}`);
        
        // Extract leadId and funnelId from event data
        const leadId = eventData.leadId || eventData.payload?.leadId || eventData.lead?._id || eventData.relatedDoc?._id;
        const funnelId = eventData.funnelId || eventData.payload?.funnelId || eventData.lead?.funnelId;
        const coachId = eventData.coachId || eventData.payload?.coachId || eventData.lead?.coachId;
        
        if (leadId) {
          await triggerAutomationRules(eventType, {
            leadId,
            funnelId,
            coachId,
            ...eventData
          }, funnelId);
        }
        
        eventsChannel.ack(msg);
      } catch (error) {
        console.error('[AutomationGraphTrigger] Error processing event:', error);
        eventsChannel.ack(msg); // Ack to prevent infinite loops
      }
    }, { noAck: false });
    
    connection.on('close', () => {
      console.error('[AutomationGraphTrigger] Connection closed, reconnecting...');
      setTimeout(init, 5000);
    });
    
    eventsConnection.on('close', () => {
      console.error('[AutomationGraphTrigger] Events connection closed, reconnecting...');
      setTimeout(init, 5000);
    });
    
  } catch (error) {
    console.error('[AutomationGraphTrigger] Initialization error:', error);
    setTimeout(init, 5000);
  }
};

/**
 * Trigger automation rules for a given event
 * @param {string} eventType - The event type (e.g., 'lead_created', 'whatsapp_message_received')
 * @param {object} eventData - Event data containing leadId, coachId, etc.
 * @param {string} funnelId - Optional funnel ID to filter rules
 */
const triggerAutomationRules = async (eventType, eventData, funnelId = null) => {
  try {
    if (!channel) {
      console.warn('[AutomationGraphTrigger] Channel not initialized, skipping trigger');
      return;
    }
    
    // Extract leadId and coachId from eventData
    const leadId = eventData.leadId || eventData.lead?._id || eventData.relatedDoc?._id;
    const coachId = eventData.coachId || eventData.coach?._id || eventData.coachId;
    
    if (!leadId) {
      console.warn('[AutomationGraphTrigger] No leadId found in eventData, skipping');
      return;
    }
    
    // Build query to find matching automation rules
    // First, find all active graph-based rules that have trigger nodes matching the event type
    const allRules = await AdminAutomationRule.find({
      isActive: true,
      workflowType: 'graph',
      nodes: {
        $elemMatch: {
          type: 'trigger',
          nodeType: eventType
        }
      }
    });
    
    // Filter rules based on funnel assignment:
    // - If rule has funnelId assigned, it should ONLY trigger for matching funnel events
    // - If rule has NO funnelId (null), it triggers for all funnels
    const matchingRules = allRules.filter(rule => {
      // If rule has no funnel assigned, it matches all funnels
      if (!rule.funnelId) {
        return true;
      }
      
      // If rule has funnel assigned, it only matches if event funnelId matches
      if (funnelId) {
        const ruleFunnelIdStr = rule.funnelId.toString();
        const eventFunnelIdStr = funnelId.toString ? funnelId.toString() : String(funnelId);
        return ruleFunnelIdStr === eventFunnelIdStr;
      }
      
      // Rule has funnel assigned but event has no funnelId - don't match
      return false;
    });
    
    if (matchingRules.length === 0) {
      console.log(`[AutomationGraphTrigger] No matching automation rules found for event: ${eventType}`);
      return;
    }
    
    console.log(`[AutomationGraphTrigger] Found ${matchingRules.length} matching rules for event: ${eventType}`);
    
    // Get lead data
    const lead = await Lead.findById(leadId).populate('coachId');
    if (!lead) {
      console.warn(`[AutomationGraphTrigger] Lead ${leadId} not found`);
      return;
    }
    
    const finalCoachId = coachId || lead.coachId?._id || lead.coachId;
    
    // For each matching rule, find trigger nodes and start execution
    for (const rule of matchingRules) {
      // Find all trigger nodes matching the event type
      const triggerNodes = rule.nodes.filter(
        node => node.type === 'trigger' && node.nodeType === eventType
      );
      
      if (triggerNodes.length === 0) {
        continue;
      }
      
      // Check if rule is assigned to a funnel
      const ruleFunnelId = rule.funnelId || funnelId;
      
      // Start execution for each trigger node (multiple triggers can exist)
      for (const triggerNode of triggerNodes) {
        // Check if execution already exists for this rule+lead+trigger combination
        const mongoose = require('mongoose');
        const AutomationExecutionState = mongoose.models.AutomationExecutionState || 
          mongoose.model('AutomationExecutionState');
        
        const existingExecution = await AutomationExecutionState.findOne({
          automationRuleId: rule._id,
          leadId: lead._id,
          triggerNodeId: triggerNode.id,
          status: { $in: ['running', 'waiting_delay', 'waiting_reply'] }
        });
        
        if (existingExecution) {
          console.log(`[AutomationGraphTrigger] Execution already running for rule ${rule._id}, lead ${leadId}, trigger ${triggerNode.id}`);
          continue;
        }
        
        // Publish trigger message
        const triggerMessage = {
          type: 'trigger.start',
          automationRuleId: rule._id.toString(),
          triggerNodeId: triggerNode.id,
          triggerEvent: eventType,
          triggerData: eventData,
          leadId: lead._id.toString(),
          funnelId: ruleFunnelId ? ruleFunnelId.toString() : null,
          coachId: finalCoachId ? finalCoachId.toString() : null,
          timestamp: Date.now()
        };
        
        await channel.publish(
          AUTOMATION_EXCHANGE,
          'trigger.start',
          Buffer.from(JSON.stringify(triggerMessage)),
          { persistent: true }
        );
        
        console.log(`[AutomationGraphTrigger] Triggered automation rule "${rule.name}" (${rule._id}) from trigger node "${triggerNode.id}" for lead ${leadId}`);
      }
    }
    
  } catch (error) {
    console.error('[AutomationGraphTrigger] Error triggering automation rules:', error);
  }
};

/**
 * Handle reply received for waiting automation executions
 * @param {string} leadId - Lead ID
 * @param {object} messageData - Message data (text, channel, etc.)
 */
const handleReplyReceived = async (leadId, messageData) => {
  try {
    if (!channel) {
      console.warn('[AutomationGraphTrigger] Channel not initialized, skipping reply handling');
      return;
    }
    
    // Find all executions waiting for reply for this lead
    const mongoose = require('mongoose');
    const AutomationExecutionState = mongoose.models.AutomationExecutionState || 
      mongoose.model('AutomationExecutionState');
    
    const waitingExecutions = await AutomationExecutionState.find({
      leadId,
      status: 'waiting_reply',
      'waitingForReply.timeoutAt': { $gt: new Date() }
    });
    
    if (waitingExecutions.length === 0) {
      return; // No executions waiting for reply
    }
    
    // Check each execution's expected replies
    for (const execution of waitingExecutions) {
      const expectedReplies = execution.waitingForReply?.expectedReplies || [];
      const replyText = (messageData.text || messageData.body || '').toLowerCase();
      
      // Check if reply matches any expected reply
      const matches = expectedReplies.some(expected => 
        replyText.includes(expected.toLowerCase())
      );
      
      if (matches || expectedReplies.length === 0) {
        // Publish reply received message
        await channel.publish(
          AUTOMATION_EXCHANGE,
          'reply.received',
          Buffer.from(JSON.stringify({
            type: 'reply.received',
            executionId: execution.executionId,
            messageData: {
              text: messageData.text || messageData.body,
              channel: messageData.channel || 'whatsapp',
              from: messageData.from,
              timestamp: messageData.timestamp || new Date()
            }
          })),
          { persistent: true }
        );
        
        console.log(`[AutomationGraphTrigger] Reply received for execution ${execution.executionId}`);
      }
    }
    
  } catch (error) {
    console.error('[AutomationGraphTrigger] Error handling reply:', error);
  }
};

module.exports = {
  init,
  triggerAutomationRules,
  handleReplyReceived
};
