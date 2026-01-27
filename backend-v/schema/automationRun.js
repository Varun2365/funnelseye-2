const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  stepId: String,
  stepName: String,
  channel: {
    type: String,
    enum: ['email', 'whatsapp', 'sms']
  },
  messageId: String,
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'replied', 'failed', 'bounced'],
    required: true
  },
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  repliedAt: Date,

  // Reply content (for AI analysis)
  replyContent: String,
  replyType: {
    type: String,
    enum: ['text', 'image', 'audio', 'document', 'location', 'contact']
  },

  // AI analysis of reply
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed']
    },
    intent: String,
    confidence: Number,
    suggestedAction: String,
    extractedData: mongoose.Schema.Types.Mixed
  },

  errorMessage: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const automationRunSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  sequenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessagingSequence',
    required: true
  },

  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },

  // Run metadata
  runId: {
    type: String,
    required: true,
    unique: true
  },

  trigger: {
    type: String,
    required: true
  },

  triggerData: mongoose.Schema.Types.Mixed,

  // Current state
  status: {
    type: String,
    enum: ['running', 'paused', 'completed', 'failed', 'stopped'],
    default: 'running'
  },

  currentStepId: String,

  // Progress tracking
  stepsCompleted: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 0 },
  progress: { type: Number, default: 0 }, // percentage

  // Timing
  startedAt: {
    type: Date,
    default: Date.now
  },

  completedAt: Date,
  lastActivityAt: {
    type: Date,
    default: Date.now
  },

  // Message logs
  messageLogs: [messageLogSchema],

  // Variables and context
  variables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Error handling
  errors: [{
    stepId: String,
    error: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // AI decisions made during this run
  aiDecisions: [{
    stepId: String,
    decision: String,
    confidence: Number,
    reasoning: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // Mobile notifications sent
  notificationsSent: [{
    type: {
      type: String,
      enum: ['sequence_started', 'message_sent', 'reply_received', 'ai_decision', 'error', 'completed']
    },
    message: String,
    sentAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
  }],

  // Analytics
  messagesSent: { type: Number, default: 0 },
  messagesDelivered: { type: Number, default: 0 },
  messagesOpened: { type: Number, default: 0 },
  messagesClicked: { type: Number, default: 0 },
  repliesReceived: { type: Number, default: 0 },

  // Settings
  timezone: {
    type: String,
    default: 'UTC'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  suppressReservedKeysWarning: true
});

// Indexes
// Note: runId index is already defined in field definition (unique: true)
automationRunSchema.index({ coachId: 1, status: 1 });
automationRunSchema.index({ sequenceId: 1, status: 1 });
automationRunSchema.index({ leadId: 1, status: 1 });
automationRunSchema.index({ lastActivityAt: 1 });

module.exports = mongoose.model('AutomationRun', automationRunSchema);
