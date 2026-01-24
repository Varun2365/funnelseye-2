const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Message identification
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Message type and channel
    messageType: {
        type: String,
        enum: ['whatsapp', 'email'],
        required: true
    },

    channelCategory: {
        type: String,
        enum: ['meta_whatsapp', 'baileys_whatsapp', 'email'],
        required: true
    },

    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessagingChannel'
    },

    // Sender and recipient
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    recipientId: {
        type: String, // Phone number or email address
        required: true
    },

    // Message content
    message: {
        type: String,
        trim: true
    },

    mediaUrl: {
        type: String,
        trim: true
    },

    mediaType: {
        type: String,
        enum: ['image', 'video', 'document', 'audio'],
        trim: true
    },

    // Template information
    useTemplate: {
        type: Boolean,
        default: false
    },

    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template'
    },

    templateParams: {
        type: mongoose.Schema.Types.Mixed
    },

    // Status and tracking
    status: {
        type: String,
        enum: ['queued', 'sending', 'sent', 'delivered', 'read', 'failed'],
        default: 'queued'
    },

    statusMessage: {
        type: String,
        trim: true
    },

    // External message IDs (from providers)
    externalMessageId: {
        type: String,
        trim: true,
        index: true
    },

    // Timestamps
    queuedAt: {
        type: Date,
        default: Date.now
    },

    sentAt: {
        type: Date
    },

    deliveredAt: {
        type: Date
    },

    readAt: {
        type: Date
    },

    failedAt: {
        type: Date
    },

    // Scheduling
    scheduledAt: {
        type: Date
    },

    // Priority
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },

    // Batch information
    batchId: {
        type: String,
        index: true
    },

    batchIndex: {
        type: Number
    },

    // Credits used
    creditsUsed: {
        type: Number,
        default: 0
    },

    // Error information
    error: {
        type: String,
        trim: true
    },

    // Additional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },

    // Lead/Client association
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    // Add indexes for performance
    indexes: [
        { senderId: 1, createdAt: -1 },
        { status: 1, createdAt: -1 },
        { channelCategory: 1, createdAt: -1 },
        { batchId: 1 },
        { recipientId: 1, createdAt: -1 }
    ]
});

// Static methods
messageSchema.statics.getMessagesByStatus = function(status, limit = 100) {
    return this.find({ status })
        .sort({ createdAt: -1 })
        .limit(limit);
};

messageSchema.statics.getMessagesByChannel = function(channelCategory, limit = 100) {
    return this.find({ channelCategory })
        .sort({ createdAt: -1 })
        .limit(limit);
};

messageSchema.statics.getQueuedMessages = function(limit = 50) {
    return this.find({
        status: 'queued',
        $or: [
            { scheduledAt: { $exists: false } },
            { scheduledAt: { $lte: new Date() } }
        ]
    })
    .sort({ priority: -1, createdAt: 1 })
    .limit(limit);
};

messageSchema.statics.getFailedMessages = function(limit = 100) {
    return this.find({ status: 'failed' })
        .sort({ createdAt: -1 })
        .limit(limit);
};

messageSchema.statics.getMessageStats = function(userId, startDate, endDate) {
    const match = { senderId: userId };
    if (startDate && endDate) {
        match.createdAt = { $gte: startDate, $lte: endDate };
    }

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: {
                    status: '$status',
                    channelCategory: '$channelCategory'
                },
                count: { $sum: 1 },
                creditsUsed: { $sum: '$creditsUsed' }
            }
        },
        {
            $group: {
                _id: '$_id.status',
                channels: {
                    $push: {
                        channel: '$_id.channelCategory',
                        count: '$count',
                        credits: '$creditsUsed'
                    }
                },
                totalCount: { $sum: '$count' },
                totalCredits: { $sum: '$creditsUsed' }
            }
        }
    ]);
};

// Instance methods
messageSchema.methods.markAsSent = function(externalId) {
    this.status = 'sent';
    this.sentAt = new Date();
    this.externalMessageId = externalId;
    return this.save();
};

messageSchema.methods.markAsDelivered = function() {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
};

messageSchema.methods.markAsRead = function() {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
};

messageSchema.methods.markAsFailed = function(error) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.error = error;
    return this.save();
};

module.exports = mongoose.model('Message', messageSchema);