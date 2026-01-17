const mongoose = require('mongoose');

const EmailMessageSchema = new mongoose.Schema({
    // Message identification
    messageId: {
        type: String,
        unique: true,
        required: true
    },
    
    // Sender and recipient information
    from: {
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            default: null
        }
    },
    to: {
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            default: null
        }
    },
    
    // Message content
    subject: {
        type: String,
        required: true
    },
    body: {
        text: {
            type: String,
            default: null
        },
        html: {
            type: String,
            default: null
        }
    },
    
    // Message metadata
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'template', 'media'],
        default: 'text'
    },
    
    // Template information (if applicable)
    template: {
        name: {
            type: String,
            default: null
        },
        parameters: [{
            type: String
        }]
    },
    
    // Media attachments
    attachments: [{
        filename: String,
        contentType: String,
        size: Number,
        url: String
    }],
    
    // Status tracking
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed', 'pending'],
        default: 'pending'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    
    // User association
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        default: null
    },
    
    // Lead association
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now
    },
    
    // Email provider information
    provider: {
        type: String,
        enum: ['gmail', 'outlook', 'yahoo', 'sendgrid', 'mailgun', 'aws-ses'],
        required: true
    },
    
    // Error tracking
    error: {
        message: String,
        code: String,
        timestamp: Date
    },
    
    // Meta 24-hour window tracking
    metaWindowInfo: {
        isWithin24Hours: {
            type: Boolean,
            default: false
        },
        windowExpiresAt: {
            type: Date,
            default: null
        },
        lastTemplateMessage: {
            type: Date,
            default: null
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
EmailMessageSchema.index({ coachId: 1, timestamp: -1 });
EmailMessageSchema.index({ to: 1, timestamp: -1 });
EmailMessageSchema.index({ from: 1, timestamp: -1 });
EmailMessageSchema.index({ direction: 1, timestamp: -1 });
EmailMessageSchema.index({ status: 1, timestamp: -1 });
EmailMessageSchema.index({ isRead: 1, timestamp: -1 });
EmailMessageSchema.index({ 'metaWindowInfo.isWithin24Hours': 1, timestamp: -1 });

// Virtual for conversation grouping
EmailMessageSchema.virtual('conversationKey').get(function() {
    if (this.direction === 'inbound') {
        return this.from.email;
    } else {
        return this.to.email;
    }
});

// Method to mark as read
EmailMessageSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Method to update status
EmailMessageSchema.methods.updateStatus = function(status) {
    this.status = status;
    return this.save();
};

// Static method to get conversation messages
EmailMessageSchema.statics.getConversationMessages = function(email, coachId, limit = 50) {
    return this.find({
        $or: [
            { from: { email: email }, coachId: coachId },
            { to: { email: email }, coachId: coachId }
        ]
    })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('leadId', 'firstName lastName phone email');
};

// Static method to get unread count
EmailMessageSchema.statics.getUnreadCount = function(coachId) {
    return this.countDocuments({
        coachId: coachId,
        direction: 'inbound',
        isRead: false
    });
};

module.exports = mongoose.models.EmailMessage || mongoose.model('EmailMessage', EmailMessageSchema);
