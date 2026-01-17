const mongoose = require('mongoose');

const whatsAppConversationSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WhatsAppDevice',
        required: true
    },
    conversationId: {
        type: String,
        required: true,
        unique: true
    },
    participantPhone: {
        type: String,
        required: true,
        trim: true
    },
    participantName: {
        type: String,
        trim: true
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    lastMessageContent: {
        type: String,
        trim: true
    },
    lastMessageDirection: {
        type: String,
        enum: ['inbound', 'outbound']
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked'],
        default: 'active'
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        sparse: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
whatsAppConversationSchema.index({ coachId: 1, lastMessageAt: -1 });
whatsAppConversationSchema.index({ coachId: 1, status: 1 });
whatsAppConversationSchema.index({ participantPhone: 1 });
whatsAppConversationSchema.index({ leadId: 1 }, { sparse: true });

// Virtual for messages
whatsAppConversationSchema.virtual('messages', {
    ref: 'WhatsAppMessage',
    localField: 'conversationId',
    foreignField: 'conversationId'
});

// Update conversation when new message is added
whatsAppConversationSchema.methods.updateLastMessage = function(messageContent, direction) {
    this.lastMessageAt = new Date();
    this.lastMessageContent = messageContent;
    this.lastMessageDirection = direction;
    this.totalMessages += 1;
    
    if (direction === 'inbound') {
        this.unreadCount += 1;
    }
    
    return this.save();
};

// Mark conversation as read
whatsAppConversationSchema.methods.markAsRead = function() {
    this.unreadCount = 0;
    return this.save();
};

module.exports = mongoose.model('WhatsAppConversation', whatsAppConversationSchema);
