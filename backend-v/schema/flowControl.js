const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true
  },
  operator: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'exists', 'not_exists', 'regex'],
    required: true
  },
  value: mongoose.Schema.Types.Mixed,
  caseSensitive: {
    type: Boolean,
    default: false
  }
});

const actionSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['start_sequence', 'stop_sequence', 'send_message', 'update_lead', 'create_task', 'webhook', 'notification'],
    required: true
  },
  config: {
    sequenceId: mongoose.Schema.Types.ObjectId,
    messageTemplate: String,
    leadFields: mongoose.Schema.Types.Mixed,
    taskData: mongoose.Schema.Types.Mixed,
    webhookUrl: String,
    notificationMessage: String,
    notificationChannels: [String] // ['email', 'whatsapp', 'sms', 'mobile']
  },
  delay: {
    type: Number, // minutes
    default: 0
  }
});

const flowRuleSchema = new mongoose.Schema({
  ruleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,

  trigger: {
    type: {
      type: String,
      enum: ['lead_created', 'lead_updated', 'message_received', 'message_opened', 'link_clicked', 'appointment_booked', 'payment_received', 'time_based', 'custom_event'],
      required: true
    },
    eventData: mongoose.Schema.Types.Mixed // Additional trigger-specific data
  },

  conditions: [conditionSchema],

  actions: [actionSchema],

  // Priority and execution
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },

  executionOrder: {
    type: Number,
    default: 1
  },

  // Limits and throttling
  rateLimit: {
    enabled: { type: Boolean, default: false },
    maxExecutions: { type: Number, default: 100 },
    timeWindow: { type: Number, default: 3600 }, // seconds
  },

  // Analytics
  executions: { type: Number, default: 0 },
  lastExecuted: Date,

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const flowControlSchema = new mongoose.Schema({
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    required: true
  },

  description: String,

  rules: [flowRuleSchema],

  // Global settings
  settings: {
    enableAiDecisions: { type: Boolean, default: false },
    aiConfidenceThreshold: { type: Number, default: 0.7, min: 0, max: 1 },
    maxConcurrentSequences: { type: Number, default: 100 },
    timezone: { type: String, default: 'UTC' },
    businessHours: {
      enabled: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
      timezone: { type: String, default: 'UTC' }
    }
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },

  isActive: {
    type: Boolean,
    default: false
  },

  // Analytics
  totalExecutions: { type: Number, default: 0 },
  successfulExecutions: { type: Number, default: 0 },
  failedExecutions: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
flowControlSchema.index({ coachId: 1, status: 1 });
flowControlSchema.index({ 'rules.trigger.type': 1 });

module.exports = mongoose.model('FlowControl', flowControlSchema);
