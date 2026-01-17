const MessagingSequence = require('../schema/messagingSequence');
const FlowControl = require('../schema/flowControl');
const AutomationRun = require('../schema/automationRun');
const aiAutomationService = require('./aiAutomationService');

class AutomationEngine {
  constructor() {
    this.activeRuns = new Map(); // runId -> run data
    this.eventQueue = [];
    this.isProcessing = false;
  }

  // Start automation run for a sequence
  async startAutomation(coachId, sequenceId, leadId, triggerData = {}) {
    try {
      // Check if sequence is active
      const sequence = await MessagingSequence.findOne({
        _id: sequenceId,
        coachId,
        isActive: true,
        status: 'active'
      });

      if (!sequence) {
        throw new Error('Sequence not found or not active');
      }

      // Check if lead already has active run for this sequence
      const existingRun = await AutomationRun.findOne({
        coachId,
        sequenceId,
        leadId,
        status: 'running'
      });

      if (existingRun) {
        console.log(`Lead ${leadId} already has active run for sequence ${sequenceId}`);
        return existingRun;
      }

      // Create new automation run
      const runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const automationRun = new AutomationRun({
        coachId,
        sequenceId,
        leadId,
        runId,
        trigger: triggerData.type || 'manual',
        triggerData,
        totalSteps: sequence.steps.length,
        variables: triggerData.variables || {},
        context: triggerData.context || {}
      });

      await automationRun.save();

      // Start the sequence
      await this.processNextStep(automationRun);

      console.log(`Started automation run ${runId} for sequence ${sequence.name}`);
      return automationRun;

    } catch (error) {
      console.error('Error starting automation:', error);
      throw error;
    }
  }

  // Process next step in automation run
  async processNextStep(automationRun) {
    try {
      const sequence = await MessagingSequence.findById(automationRun.sequenceId);

      if (!sequence) {
        await this.failRun(automationRun._id, 'Sequence not found');
        return;
      }

      // Find current step
      let currentStep;
      if (automationRun.currentStepId) {
        currentStep = sequence.steps.find(step => step.stepId === automationRun.currentStepId);
      } else {
        // Start with first step
        currentStep = sequence.steps[0];
      }

      if (!currentStep) {
        await this.completeRun(automationRun._id);
        return;
      }

      // Check conditions for this step
      const conditionsMet = await this.evaluateConditions(currentStep.conditions, automationRun);

      if (!conditionsMet) {
        // Skip to next step
        await this.moveToNextStep(automationRun, sequence, currentStep);
        return;
      }

      // Execute step based on type
      switch (currentStep.stepType) {
        case 'message':
          await this.sendMessage(automationRun, currentStep);
          break;

        case 'wait':
          await this.scheduleWait(automationRun, currentStep);
          break;

        case 'condition':
          await this.evaluateConditionalStep(automationRun, currentStep);
          break;

        case 'action':
          await this.executeAction(automationRun, currentStep);
          break;

        case 'webhook':
          await this.callWebhook(automationRun, currentStep);
          break;
      }

    } catch (error) {
      console.error('Error processing step:', error);
      await this.logError(automationRun._id, automationRun.currentStepId, error.message);
    }
  }

  // Send message step
  async sendMessage(automationRun, step) {
    try {
      const messageData = {
        to: automationRun.leadId,
        channel: step.channel,
        subject: step.subject,
        content: aiAutomationService.generateDynamicContent(
          step.content,
          automationRun.variables,
          automationRun.context.leadData
        ),
        cta: step.cta,
        sequenceId: automationRun.sequenceId,
        stepId: step.stepId,
        runId: automationRun.runId
      };

      // Send via appropriate channel
      let messageId;
      if (step.channel === 'email') {
        messageId = await this.sendEmail(messageData);
      } else if (step.channel === 'whatsapp') {
        messageId = await this.sendWhatsApp(messageData);
      }

      // Log message
      await this.logMessage(automationRun._id, {
        stepId: step.stepId,
        stepName: step.stepName,
        channel: step.channel,
        messageId,
        status: 'sent'
      });

      // Schedule next step
      await this.moveToNextStep(automationRun, null, step);

    } catch (error) {
      await this.logError(automationRun._id, step.stepId, `Message send failed: ${error.message}`);
    }
  }

  // Send email
  async sendEmail(messageData) {
    // Implementation would integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Sending email:', messageData);
    return `email_${Date.now()}`;
  }

  // Send WhatsApp message
  async sendWhatsApp(messageData) {
    // Implementation would integrate with WhatsApp Business API
    console.log('Sending WhatsApp:', messageData);
    return `wa_${Date.now()}`;
  }

  // Evaluate conditions
  async evaluateConditions(conditions, automationRun) {
    if (!conditions || conditions.length === 0) return true;

    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, automationRun);
      if (!result) return false;
    }

    return true;
  }

  // Evaluate single condition
  async evaluateCondition(condition, automationRun) {
    const { field, operator, value } = condition;
    const fieldValue = this.getFieldValue(field, automationRun);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;
      default:
        return true;
    }
  }

  // Get field value from automation run context
  getFieldValue(field, automationRun) {
    const context = {
      ...automationRun.variables,
      ...automationRun.context,
      lead: automationRun.context.leadData || {}
    };

    return field.split('.').reduce((obj, key) => obj?.[key], context);
  }

  // Move to next step
  async moveToNextStep(automationRun, sequence, currentStep) {
    if (!sequence) {
      sequence = await MessagingSequence.findById(automationRun.sequenceId);
    }

    const nextStepId = currentStep.nextSteps?.[0]?.stepId;

    if (nextStepId) {
      automationRun.currentStepId = nextStepId;
      automationRun.stepsCompleted += 1;
      automationRun.progress = (automationRun.stepsCompleted / automationRun.totalSteps) * 100;
      automationRun.lastActivityAt = new Date();

      await automationRun.save();

      // Schedule next step processing
      setTimeout(() => {
        this.processNextStep(automationRun);
      }, 1000); // Small delay to prevent immediate recursion
    } else {
      await this.completeRun(automationRun._id);
    }
  }

  // Handle incoming replies
  async handleReply(runId, replyContent, replyType = 'text') {
    try {
      const automationRun = await AutomationRun.findOne({ runId });

      if (!automationRun || automationRun.status !== 'running') {
        return;
      }

      // Analyze reply with AI
      const aiAnalysis = await aiAutomationService.analyzeReply(replyContent, {
        currentStep: automationRun.currentStepId,
        sequence: await MessagingSequence.findById(automationRun.sequenceId)
      });

      // Log reply
      await this.logReply(automationRun._id, {
        content: replyContent,
        type: replyType,
        aiAnalysis
      });

      // Make AI decision for next action
      const sequence = await MessagingSequence.findById(automationRun.sequenceId);
      const decision = await aiAutomationService.makeSequenceDecision({
        currentStep: automationRun.currentStepId,
        sequence,
        leadData: automationRun.context.leadData
      }, aiAnalysis);

      // Log AI decision
      await this.logAIDecision(automationRun._id, decision);

      // Execute decision
      await this.executeDecision(automationRun, decision);

      // Send mobile notification
      await this.sendMobileNotification(automationRun.coachId, {
        type: 'reply_received',
        message: `Reply received from lead: "${replyContent.substring(0, 50)}..."`,
        runId: automationRun.runId,
        leadId: automationRun.leadId
      });

    } catch (error) {
      console.error('Error handling reply:', error);
    }
  }

  // Execute AI decision
  async executeDecision(automationRun, decision) {
    switch (decision.action) {
      case 'book_appointment':
        await this.createAppointmentTask(automationRun);
        break;

      case 'schedule_call':
        await this.scheduleCall(automationRun);
        break;

      case 'send_more_info':
        await this.sendInfoMessage(automationRun);
        break;

      case 'stop_sequence':
        await this.stopRun(automationRun._id);
        break;

      case 'continue_sequence':
      default:
        // Continue with normal flow
        setTimeout(() => {
          this.processNextStep(automationRun);
        }, 1000);
        break;
    }
  }

  // Logging methods
  async logMessage(runId, messageData) {
    await AutomationRun.findByIdAndUpdate(runId, {
      $push: { messageLogs: messageData },
      $inc: { messagesSent: 1 },
      lastActivityAt: new Date()
    });
  }

  async logReply(runId, replyData) {
    await AutomationRun.findByIdAndUpdate(runId, {
      $push: { messageLogs: replyData },
      $inc: { repliesReceived: 1 },
      lastActivityAt: new Date()
    });
  }

  async logAIDecision(runId, decisionData) {
    await AutomationRun.findByIdAndUpdate(runId, {
      $push: { aiDecisions: decisionData }
    });
  }

  async logError(runId, stepId, error) {
    await AutomationRun.findByIdAndUpdate(runId, {
      $push: { errors: { stepId, error } }
    });
  }

  // Status management
  async completeRun(runId) {
    await AutomationRun.findByIdAndUpdate(runId, {
      status: 'completed',
      completedAt: new Date(),
      progress: 100
    });
  }

  async failRun(runId, reason) {
    await AutomationRun.findByIdAndUpdate(runId, {
      status: 'failed',
      $push: { errors: { error: reason } }
    });
  }

  async stopRun(runId) {
    await AutomationRun.findByIdAndUpdate(runId, {
      status: 'stopped'
    });
  }

  // Mobile notifications
  async sendMobileNotification(coachId, notificationData) {
    // Implementation would integrate with mobile notification service
    console.log('Sending mobile notification:', notificationData);

    // Log notification
    await AutomationRun.findOneAndUpdate(
      { runId: notificationData.runId },
      { $push: { notificationsSent: notificationData } }
    );
  }

  // Helper methods for actions
  async createAppointmentTask(automationRun) {
    // Create a task for booking appointment
    console.log('Creating appointment task for run:', automationRun.runId);
  }

  async scheduleCall(automationRun) {
    // Schedule a call
    console.log('Scheduling call for run:', automationRun.runId);
  }

  async sendInfoMessage(automationRun) {
    // Send additional information
    console.log('Sending info message for run:', automationRun.runId);
  }
}

module.exports = new AutomationEngine();
