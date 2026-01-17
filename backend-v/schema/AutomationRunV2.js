// AutomationRunV2 Schema - Enterprise-grade concurrency-safe automation runs
const mongoose = require('mongoose');

// Message log sub-schema with enhanced tracking
const messageLogV2Schema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    index: true
  },
  stepId: {
    type: String,
    required: true
  },
  nodeId: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    enum: ['whatsapp', 'email', 'sms', 'push', 'internal'],
    required: true
  },
  type: {
    type: String,
    enum: ['outbound', 'inbound', 'system'],
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'failed', 'expired'],
    required: true
  },

  // Timing
  queuedAt: { type: Date, default: Date.now },
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  repliedAt: Date,
  expiredAt: Date,

  // Content
  content: {
    text: String,
    template: String,
    mediaUrl: String,
    metadata: mongoose.Schema.Types.Mixed
  },

  // Reply handling
  replyContent: String,
  replyType: {
    type: String,
    enum: ['text', 'image', 'audio', 'document', 'location', 'contact']
  },

  // AI analysis
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed']
    },
    intent: String,
    confidence: Number,
    extractedData: mongoose.Schema.Types.Mixed,
    suggestedActions: [String]
  },

  // Error handling
  error: String,
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },

  // Relationships
  parentMessageId: String, // For reply chains
  correlationId: String // For tracking related messages
}, { _id: true, timestamps: true });

// Execution history sub-schema
const executionHistoryV2Schema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true
  },
  stepId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'failed', 'skipped', 'waiting'],
    required: true
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  duration: Number, // in milliseconds
  result: mongoose.Schema.Types.Mixed,
  error: String,
  retryCount: { type: Number, default: 0 }
}, { _id: true, timestamps: true });

// Action queue sub-schema for pending actions
const actionQueueV2Schema = new mongoose.Schema({
  actionId: {
    type: String,
    required: true,
    unique: true
  },
  nodeId: {
    type: String,
    required: true
  },
  stepId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'queued'
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  dependencies: [String], // Action IDs this depends on
  scheduledFor: Date,
  expiresAt: Date,
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 3 },
  processingNode: String, // Which server/worker is processing this
  lockExpiresAt: Date, // For distributed locking
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

// Main AutomationRunV2 schema
const automationRunV2Schema = new mongoose.Schema({
  // Unique identification - CRITICAL for isolation
  runId: {
    type: String,
    required: true,
    unique: true
  },

  // Relationships
  automationRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutomationRule',
    required: true,
    index: true
  },

  funnelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Funnel',
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
  triggerEvent: {
    type: String,
    required: true
  },

  triggerData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Current state - CRITICAL for concurrency
  status: {
    type: String,
    enum: ['initializing', 'running', 'waiting_for_reply', 'waiting_for_delay', 'waiting_for_condition', 'paused', 'completed', 'failed', 'cancelled'],
    default: 'initializing',
    index: true
  },

  // Current execution context
  currentNodeId: {
    type: String,
    index: true
  },

  currentStepId: {
    type: String,
    index: true
  },

  // Graph state
  graphState: {
    nodes: mongoose.Schema.Types.Mixed,
    edges: mongoose.Schema.Types.Mixed,
    viewport: mongoose.Schema.Types.Mixed
  },

  // Execution tracking
  executionHistory: [executionHistoryV2Schema],
  messageLogs: [messageLogV2Schema],
  actionQueue: [actionQueueV2Schema],

  // Progress tracking
  progress: {
    completedNodes: { type: Number, default: 0 },
    totalNodes: { type: Number, default: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 }
  },

  // Timing
  startedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  completedAt: Date,
  pausedAt: Date,

  // Reply handling
  activeReplyHandlers: [{
    nodeId: String,
    stepId: String,
    expectedReplies: [String],
    timeoutAt: Date,
    messageId: String
  }],

  // Variables and context (per-run isolation)
  variables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Error handling
  errorLogs: [{
    nodeId: String,
    stepId: String,
    error: String,
    timestamp: { type: Date, default: Date.now },
    retryCount: { type: Number, default: 0 }
  }],

  // AI decisions
  aiDecisions: [{
    nodeId: String,
    stepId: String,
    decision: String,
    confidence: Number,
    reasoning: String,
    alternatives: [String],
    timestamp: { type: Date, default: Date.now }
  }],

  // Analytics
  metrics: {
    messagesSent: { type: Number, default: 0 },
    messagesDelivered: { type: Number, default: 0 },
    messagesOpened: { type: Number, default: 0 },
    messagesClicked: { type: Number, default: 0 },
    repliesReceived: { type: Number, default: 0 },
    aiDecisionsMade: { type: Number, default: 0 },
    processingTime: { type: Number, default: 0 }, // total processing time in ms
    waitTime: { type: Number, default: 0 } // total wait time in ms
  },

  // Concurrency control - CRITICAL
  lockToken: {
    type: String,
    sparse: true
  },

  lockExpiresAt: Date,

  processingWorker: {
    type: String,
    index: true
  },

  // Version control
  version: {
    type: String,
    default: '2.0'
  },

  // Settings
  timezone: { type: String, default: 'UTC' },
  priority: { type: Number, default: 5, min: 1, max: 10 },

  // Cleanup
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }

}, {
  timestamps: true,
  collection: 'automation_runs_v2'
});

// Critical indexes for performance and isolation
// Note: runId and lockToken indexes are already defined in schema fields
automationRunV2Schema.index({ automationRuleId: 1, leadId: 1 }, { unique: true }); // Prevent duplicate runs
automationRunV2Schema.index({ coachId: 1, status: 1 });
automationRunV2Schema.index({ leadId: 1, status: 1 });
automationRunV2Schema.index({ funnelId: 1, status: 1 });
automationRunV2Schema.index({ currentNodeId: 1, status: 1 });
automationRunV2Schema.index({ lockExpiresAt: 1 }, { expireAfterSeconds: 0 });
automationRunV2Schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
automationRunV2Schema.index({ lastActivityAt: 1 });
automationRunV2Schema.index({ priority: -1, status: 1 });

// Instance methods for concurrency control
automationRunV2Schema.methods.acquireLock = function(workerId, ttlSeconds = 300) {
  const lockToken = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const lockExpiresAt = new Date(Date.now() + (ttlSeconds * 1000));

  // Try to acquire lock atomically
  return this.constructor.findOneAndUpdate(
    {
      _id: this._id,
      $or: [
        { lockToken: { $exists: false } },
        { lockExpiresAt: { $lt: new Date() } }
      ]
    },
    {
      lockToken,
      lockExpiresAt,
      processingWorker: workerId,
      lastActivityAt: new Date()
    },
    { new: true }
  );
};

automationRunV2Schema.methods.releaseLock = function() {
  return this.constructor.findOneAndUpdate(
    { _id: this._id, lockToken: this.lockToken },
    {
      $unset: { lockToken: 1, lockExpiresAt: 1, processingWorker: 1 },
      lastActivityAt: new Date()
    }
  );
};

automationRunV2Schema.methods.heartbeat = function() {
  return this.constructor.findOneAndUpdate(
    { _id: this._id, lockToken: this.lockToken },
    {
      lockExpiresAt: new Date(Date.now() + 300000), // 5 minutes
      lastActivityAt: new Date()
    }
  );
};

automationRunV2Schema.methods.addToActionQueue = function(action) {
  return this.constructor.findOneAndUpdate(
    { _id: this._id },
    {
      $push: { actionQueue: action },
      lastActivityAt: new Date()
    },
    { new: true }
  );
};

automationRunV2Schema.methods.markActionCompleted = function(actionId, result) {
  return this.constructor.findOneAndUpdate(
    { _id: this._id, 'actionQueue.actionId': actionId },
    {
      $set: {
        'actionQueue.$.status': 'completed',
        'actionQueue.$.result': result,
        'actionQueue.$.completedAt': new Date()
      },
      lastActivityAt: new Date()
    }
  );
};

automationRunV2Schema.methods.markActionFailed = function(actionId, error) {
  return this.constructor.findOneAndUpdate(
    { _id: this._id, 'actionQueue.actionId': actionId },
    {
      $set: {
        'actionQueue.$.status': 'failed',
        'actionQueue.$.error': error,
        'actionQueue.$.completedAt': new Date()
      },
      $inc: { 'actionQueue.$.retryCount': 1 },
      lastActivityAt: new Date()
    }
  );
};

const AutomationRunV2 = mongoose.model('AutomationRunV2', automationRunV2Schema);

module.exports = AutomationRunV2;
