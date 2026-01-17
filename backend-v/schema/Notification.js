const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    // Recipient information
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    recipientType: {
        type: String,
        enum: ['coach', 'staff', 'client'],
        required: true,
        index: true
    },
    
    // Notification content
    title: {
        type: String,
        required: false,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    
    // Notification metadata
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'system', 'lead_alert', 'task_reminder', 'payment', 'appointment', 'automation'],
        default: 'info',
        index: true
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal',
        index: true
    },
    
    // Action link (optional)
    actionUrl: {
        type: String,
        default: null
    },
    actionLabel: {
        type: String,
        default: null
    },
    
    // Related entities
    relatedEntityType: {
        type: String,
        enum: ['lead', 'task', 'appointment', 'payment', 'deal', 'automation', 'funnel', null],
        default: null
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        index: true
    },
    
    // Source information
    source: {
        type: String,
        enum: ['system', 'automation', 'manual', 'api'],
        default: 'system'
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    
    // Read status
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    },
    
    // Coach association (for filtering)
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true,
        index: true
    },
    
    // Expiration (optional)
    expiresAt: {
        type: Date,
        default: null
    },
    
    // Additional data (for flexibility)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, recipientType: 1, isRead: 1 });
NotificationSchema.index({ coachId: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Static method to create notification
NotificationSchema.statics.createNotification = async function(data) {
    const notification = new this(data);
    await notification.save();
    return notification;
};

// Instance method to mark as read
NotificationSchema.methods.markAsRead = async function() {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function(recipientId, recipientType) {
    return await this.countDocuments({
        recipientId,
        recipientType,
        isRead: false,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });
};

// Static method to mark all as read
NotificationSchema.statics.markAllAsRead = async function(recipientId, recipientType) {
    return await this.updateMany(
        {
            recipientId,
            recipientType,
            isRead: false
        },
        {
            $set: {
                isRead: true,
                readAt: new Date()
            }
        }
    );
};

module.exports = mongoose.model('Notification', NotificationSchema);

