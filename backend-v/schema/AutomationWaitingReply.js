const mongoose = require('mongoose');

const automationWaitingReplySchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true
  },
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutomationRule',
    required: true,
    index: true
  },
  nodeId: {
    type: String,
    required: true,
    index: true
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  eventPayload: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  adjacencyList: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  waitUntil: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['waiting', 'completed', 'expired'],
    default: 'waiting',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date
  },
  expiredAt: {
    type: Date
  },
  replyPayload: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'automation_waiting_replies'
});

// Compound indexes for efficient queries
automationWaitingReplySchema.index({ leadId: 1, automationId: 1, nodeId: 1 });
automationWaitingReplySchema.index({ status: 1, waitUntil: 1 });

// TTL index to automatically delete expired records after 30 days
automationWaitingReplySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('AutomationWaitingReply', automationWaitingReplySchema);