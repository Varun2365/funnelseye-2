const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    // Log Identification
    logId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Log Type and Category
    logType: {
        type: String,
        enum: ['admin_action', 'system_event', 'security_event', 'performance_alert', 'error', 'user_activity', 'payment_event', 'mlm_event'],
        required: true
    },
    
    category: {
        type: String,
        enum: ['settings', 'users', 'payments', 'mlm', 'analytics', 'security', 'performance', 'maintenance', 'general'],
        required: true
    },
    
    // Severity Level
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    
    // Action Details
    action: {
        type: String,
        required: true
    },
    
    description: {
        type: String,
        required: true
    },
    
    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    
    userEmail: {
        type: String,
        required: false
    },
    
    userRole: {
        type: String,
        enum: ['admin', 'coach', 'staff'],
        required: false
    },
    
    // Request Information
    requestInfo: {
        ipAddress: { type: String },
        userAgent: { type: String },
        method: { type: String },
        endpoint: { type: String },
        requestId: { type: String }
    },
    
    // Changes Made
    changes: {
        before: { type: mongoose.Schema.Types.Mixed },
        after: { type: mongoose.Schema.Types.Mixed },
        fieldsChanged: [{ type: String }]
    },
    
    // Related Entities
    relatedEntities: [{
        entityType: { type: String },
        entityId: { type: mongoose.Schema.Types.ObjectId },
        entityName: { type: String }
    }],
    
    // Performance Metrics
    performance: {
        responseTime: { type: Number }, // ms
        memoryUsage: { type: Number }, // MB
        cpuUsage: { type: Number }, // percentage
        databaseQueries: { type: Number }
    },
    
    // Error Information (for error logs)
    error: {
        message: { type: String },
        stack: { type: String },
        code: { type: String },
        statusCode: { type: Number }
    },
    
    // Metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        default: Date.now
    },
    
    // Expiration (for automatic cleanup)
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
systemLogSchema.index({ logType: 1, timestamp: -1 });
systemLogSchema.index({ category: 1, timestamp: -1 });
systemLogSchema.index({ severity: 1, timestamp: -1 });
systemLogSchema.index({ userId: 1, timestamp: -1 });
systemLogSchema.index({ 'relatedEntities.entityType': 1, 'relatedEntities.entityId': 1 });
systemLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
