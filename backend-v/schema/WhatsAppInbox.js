const mongoose = require('mongoose');

const WhatsAppInboxSchema = new mongoose.Schema({
    // Message Identification
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    wamid: {
        type: String,
        index: true // WhatsApp Message ID from Meta
    },
    
    // Participants
    senderPhone: {
        type: String,
        required: true,
        index: true
    },
    senderName: String,
    recipientPhone: {
        type: String,
        required: true,
        index: true
    },
    
    // Conversation Management
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    
    // Message Content
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'template'],
        required: true
    },
    content: {
        text: String,
        mediaUrl: String,
        mediaType: String,
        caption: String,
        fileName: String,
        fileSize: Number,
        location: {
            latitude: Number,
            longitude: Number,
            name: String,
            address: String
        },
        contact: {
            name: String,
            phone: String
        }
    },
    
    // Message Direction
    direction: {
        type: String,
        enum: ['inbound', 'outbound'],
        required: true
    },
    
    // Status Tracking
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed', 'pending'],
        default: 'pending'
    },
    
    // Timestamps
    sentAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: Date,
    readAt: Date,
    failedAt: Date,
    
    // Error Handling
    errorCode: String,
    errorMessage: String,
    
    // AI Processing
    aiProcessed: {
        type: Boolean,
        default: false
    },
    aiReply: {
        generated: Boolean,
        messageId: String,
        prompt: String,
        response: String,
        confidence: Number,
        processedAt: Date
    },
    
    // Lead Association
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        index: true
    },
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    
    // User Association (for inbox access)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    userType: {
        type: String,
        enum: ['admin', 'coach', 'staff'],
        required: true
    },
    
    // Thread Management
    threadId: {
        type: String,
        index: true
    },
    replyToMessageId: String,
    
    // Tags and Categories
    tags: [String],
    category: {
        type: String,
        enum: ['general', 'support', 'sales', 'complaint', 'feedback', 'other'],
        default: 'general'
    },
    
    // Priority and Assignment
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Follow-up
    requiresFollowUp: {
        type: Boolean,
        default: false
    },
    followUpAt: Date,
    followUpNotes: String,
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
    
    // Read Status per User
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Archive Status
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: Date,
    archivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
WhatsAppInboxSchema.index({ conversationId: 1, sentAt: -1 });
WhatsAppInboxSchema.index({ userId: 1, userType: 1, sentAt: -1 });
WhatsAppInboxSchema.index({ senderPhone: 1, sentAt: -1 });
WhatsAppInboxSchema.index({ leadId: 1, sentAt: -1 });
WhatsAppInboxSchema.index({ coachId: 1, sentAt: -1 });
WhatsAppInboxSchema.index({ assignedTo: 1, sentAt: -1 });
WhatsAppInboxSchema.index({ isArchived: 1, sentAt: -1 });
WhatsAppInboxSchema.index({ requiresFollowUp: 1, followUpAt: 1 });

// Virtual for conversation summary
WhatsAppInboxSchema.virtual('conversationSummary').get(function() {
    return {
        messageId: this.messageId,
        senderPhone: this.senderPhone,
        senderName: this.senderName,
        content: this.content.text || this.content.caption || '[Media]',
        sentAt: this.sentAt,
        direction: this.direction,
        status: this.status
    };
});

// Method to mark as read by user
WhatsAppInboxSchema.methods.markAsRead = function(userId) {
    const existingRead = this.readBy.find(read => read.userId.toString() === userId.toString());
    if (!existingRead) {
        this.readBy.push({ userId, readAt: new Date() });
    }
    return this.save();
};

// Method to check if read by user
WhatsAppInboxSchema.methods.isReadBy = function(userId) {
    return this.readBy.some(read => read.userId.toString() === userId.toString());
};

module.exports = mongoose.model('WhatsAppInbox', WhatsAppInboxSchema);
