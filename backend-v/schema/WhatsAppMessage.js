const mongoose = require('mongoose');

const WhatsAppMessageSchema = new mongoose.Schema({
    // Message identification
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    wamid: {
        type: String, // WhatsApp message ID from Meta
        required: true
    },
    
    // Sender information
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderType: {
        type: String,
        enum: ['admin', 'coach', 'system'],
        required: true
    },
    
    // Recipient information
    recipientPhone: {
        type: String,
        required: true
    },
    recipientName: {
        type: String,
        default: null
    },
    
    // Message content
    messageType: {
        type: String,
        enum: ['text', 'template', 'media', 'interactive'],
        required: true
    },
    content: {
        text: String,
        templateName: String,
        templateParameters: [String],
        mediaUrl: String,
        mediaType: {
            type: String,
            enum: ['image', 'video', 'audio', 'document']
        },
        caption: String
    },
    
    // Template information (if applicable)
    templateId: {
        type: String,
        default: null
    },
    templateStatus: {
        type: String,
        enum: ['APPROVED', 'PENDING', 'REJECTED', 'DISABLED'],
        default: null
    },
    
    // Message status and delivery
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered', 'read', 'failed'],
        default: 'pending'
    },
    
    // Error handling
    errorCode: {
        type: String,
        default: null
    },
    errorMessage: {
        type: String,
        default: null
    },
    
    // Timestamps
    sentAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: {
        type: Date,
        default: null
    },
    readAt: {
        type: Date,
        default: null
    },
    
    // Conversation tracking
    conversationId: {
        type: String,
        required: true
    },
    threadId: {
        type: String,
        default: null
    },
    
    // Lead/Client association
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // Automation tracking
    automationRuleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AutomationRule',
        default: null
    },
    isAutomated: {
        type: Boolean,
        default: false
    },
    
    // Cost tracking
    creditsUsed: {
        type: Number,
        default: 1
    },
    
    // Metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better query performance
WhatsAppMessageSchema.index({ senderId: 1, sentAt: -1 });
WhatsAppMessageSchema.index({ recipientPhone: 1, sentAt: -1 });
WhatsAppMessageSchema.index({ conversationId: 1, sentAt: -1 });
WhatsAppMessageSchema.index({ leadId: 1, sentAt: -1 });
// messageId already has unique: true, no need for explicit index
WhatsAppMessageSchema.index({ wamid: 1 });
WhatsAppMessageSchema.index({ status: 1, sentAt: -1 });

// Static method to create conversation ID
WhatsAppMessageSchema.statics.createConversationId = function(senderId, recipientPhone) {
    const sortedIds = [senderId.toString(), recipientPhone].sort();
    return `conv_${sortedIds.join('_')}`;
};

// Static method to get conversation messages
WhatsAppMessageSchema.statics.getConversation = function(conversationId, limit = 50, offset = 0) {
    return this.find({ conversationId })
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('senderId', 'name email')
        .populate('leadId', 'name email phone')
        .populate('clientId', 'name email phone');
};

// Static method to get messages by lead
WhatsAppMessageSchema.statics.getMessagesByLead = function(leadId, limit = 50, offset = 0) {
    return this.find({ leadId })
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('senderId', 'name email')
        .populate('automationRuleId', 'name');
};

// Static method to get messages by coach
WhatsAppMessageSchema.statics.getMessagesByCoach = function(coachId, limit = 50, offset = 0) {
    return this.find({ senderId: coachId })
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(offset)
        .populate('leadId', 'name email phone')
        .populate('clientId', 'name email phone');
};

// Instance method to update delivery status
WhatsAppMessageSchema.methods.updateDeliveryStatus = function(status, timestamp = null) {
    this.deliveryStatus = status;
    if (status === 'delivered' && !this.deliveredAt) {
        this.deliveredAt = timestamp || new Date();
    } else if (status === 'read' && !this.readAt) {
        this.readAt = timestamp || new Date();
    }
    return this.save();
};

// Instance method to mark as failed
WhatsAppMessageSchema.methods.markAsFailed = function(errorCode, errorMessage) {
    this.status = 'failed';
    this.deliveryStatus = 'failed';
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    return this.save();
};

const WhatsAppMessage = mongoose.models.WhatsAppMessage || mongoose.model('WhatsAppMessage', WhatsAppMessageSchema);

module.exports = WhatsAppMessage;
