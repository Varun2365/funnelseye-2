const mongoose = require('mongoose');

/**
 * Message Task Schema
 * Tracks queued messages to be sent through various messaging channels
 */
const messageTaskSchema = new mongoose.Schema({
    // Channel information
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessagingChannel',
        required: true
    },
    channelType: {
        type: String,
        required: true,
        enum: ['whatsapp_api', 'whatsapp_bailey', 'email_smtp', 'sms']
    },

    // Message content
    templateId: {
        type: String,
        default: null
    },
    message: {
        type: String,
        required: true
    },

    // Recipient
    recipient: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Phone number validation for WhatsApp/SMS
                if (this.channelType.includes('whatsapp') || this.channelType === 'sms') {
                    return /^\+\d{10,15}$/.test(v);
                }
                // Email validation for email channels
                if (this.channelType === 'email_smtp') {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                }
                return true;
            },
            message: 'Invalid recipient format for channel type'
        }
    },

    // Status and timing
    status: {
        type: String,
        enum: ['queued', 'processing', 'sent', 'failed'],
        default: 'queued'
    },
    scheduledAt: {
        type: Date,
        default: Date.now
    },
    sentAt: {
        type: Date
    },

    // Error handling
    error: {
        type: String
    },
    retryCount: {
        type: Number,
        default: 0,
        max: 3
    },

    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },

    // Template variables (for dynamic content)
    variables: {
        type: Map,
        of: String,
        default: {}
    }
}, {
    timestamps: true,
    collection: 'messagetasks'
});

// Indexes for performance
messageTaskSchema.index({ status: 1, scheduledAt: 1 });
messageTaskSchema.index({ channelId: 1, status: 1 });
messageTaskSchema.index({ createdBy: 1 });
messageTaskSchema.index({ scheduledAt: 1 });

// Pre-save middleware
messageTaskSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Static methods
messageTaskSchema.statics.getPendingTasks = function(limit = 10) {
    return this.find({
        status: 'queued',
        scheduledAt: { $lte: new Date() }
    })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit)
    .populate('channelId');
};

messageTaskSchema.statics.getTasksByStatus = function(status, limit = 50) {
    return this.find({ status })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate('channelId');
};

module.exports = mongoose.model('MessageTask', messageTaskSchema);