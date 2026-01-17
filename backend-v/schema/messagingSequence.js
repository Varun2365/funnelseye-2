const mongoose = require('mongoose');

const messageStepSchema = new mongoose.Schema({
  stepId: {
    type: String,
    required: true,
    unique: true
  },
  stepName: {
    type: String,
    required: true
  },
  stepType: {
    type: String,
    enum: ['message', 'wait', 'condition', 'action', 'webhook'],
    required: true
  },
  channel: {
    type: String,
    enum: ['email', 'whatsapp', 'sms'],
    required: true
  },

  // Message content
  subject: String,
  content: {
    type: String,
    required: function() { return this.stepType === 'message'; }
  },
  templateId: String,

  // Dynamic variables
  variables: [{
    name: String,
    type: { type: String, enum: ['text', 'number', 'date', 'boolean'] },
    defaultValue: mongoose.Schema.Types.Mixed,
    required: Boolean
  }],

  // Call to Action
  cta: {
    type: {
      type: String,
      enum: ['button', 'link', 'phone', 'reply']
    },
    text: String,
    url: String,
    phoneNumber: String
  },

  // Timing
  delay: {
    type: Number, // minutes
    default: 0
  },
  sendAt: Date,

  // Conditions for this step
  conditions: [{
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'contains', 'greater_than', 'less_than', 'exists', 'not_exists']
    },
    value: mongoose.Schema.Types.Mixed
  }],

  // Next steps
  nextSteps: [{
    stepId: String,
    condition: String // optional condition for branching
  }],

  // Analytics
  sent: { type: Number, default: 0 },
  delivered: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  replied: { type: Number, default: 0 },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const messagingSequenceSchema = new mongoose.Schema({
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

  sequenceType: {
    type: String,
    enum: ['lead_nurture', 'follow_up', 'welcome', 'upsell', 'retention', 'custom'],
    default: 'custom'
  },

  trigger: {
    type: {
      type: String,
      enum: ['manual', 'lead_created', 'lead_updated', 'appointment_booked', 'appointment_completed', 'payment_received', 'custom_event'],
      required: true
    },
    conditions: [{
      field: String,
      operator: String,
      value: mongoose.Schema.Types.Mixed
    }]
  },

  steps: [messageStepSchema],

  // Flow control
  flowControl: {
    maxSteps: { type: Number, default: 50 },
    maxDuration: { type: Number, default: 30 }, // days
    allowParallelFlows: { type: Boolean, default: false },
    stopOnReply: { type: Boolean, default: true },
    aiDecisionEnabled: { type: Boolean, default: false }
  },

  // Settings
  timezone: {
    type: String,
    default: 'UTC'
  },

  businessHours: {
    enabled: { type: Boolean, default: true },
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }] // 0 = Sunday, 6 = Saturday
  },

  // Analytics
  totalRuns: { type: Number, default: 0 },
  activeRuns: { type: Number, default: 0 },
  completedRuns: { type: Number, default: 0 },
  failedRuns: { type: Number, default: 0 },

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

  tags: [String],

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
messagingSequenceSchema.index({ coachId: 1, status: 1 });
messagingSequenceSchema.index({ coachId: 1, sequenceType: 1 });
messagingSequenceSchema.index({ 'trigger.type': 1 });

module.exports = mongoose.model('MessagingSequence', messagingSequenceSchema);
