const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema({
    logId: { type: String, required: false, unique: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: false },
    adminEmail: { type: String, required: true },
    adminRole: { type: String, required: true },
    
    // Action Details
    action: { 
        type: String, 
        required: true,
        enum: [
            'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
            'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESTORE_USER', 'SUSPEND_USER', 'VIEW_USERS', 'VIEW_USER_DETAILS', 'UPDATE_USER_STATUS', 'BULK_UPDATE_USERS', 'BULK_DELETE_USERS',
            'CREATE_COACH', 'UPDATE_COACH', 'DELETE_COACH', 'APPROVE_COACH',
            'CREATE_PLAN', 'UPDATE_PLAN', 'DELETE_PLAN', 'APPROVE_PLAN',
            'UPDATE_PAYMENT_SETTINGS', 'UPDATE_MLM_SETTINGS', 'UPDATE_SYSTEM_SETTINGS',
            'PROCESS_PAYOUT', 'APPROVE_REFUND', 'REJECT_REFUND',
            'EXPORT_DATA', 'IMPORT_DATA', 'BACKUP_SYSTEM', 'RESTORE_SYSTEM', 'EXPORT_USERS',
            'ENABLE_MAINTENANCE', 'DISABLE_MAINTENANCE',
            'CREATE_ADMIN', 'UPDATE_ADMIN', 'DELETE_ADMIN', 'CHANGE_ADMIN_PERMISSIONS',
            'VIEW_SENSITIVE_DATA', 'MODIFY_SECURITY_SETTINGS', 'VIEW_USER_ANALYTICS',
            'VIEW_DASHBOARD', 'VIEW_SUBSCRIPTIONS', 'VIEW_PLANS', 'VIEW_COACHES',
            'VIEW_SYSTEM_HEALTH', 'VIEW_SYSTEM_SETTINGS', 'UPDATE_SYSTEM_SETTINGS_SECTION',
            'TOGGLE_MAINTENANCE_MODE', 'VIEW_SYSTEM_LOGS', 'CLEAR_SYSTEM_LOGS',
            'VIEW_SYSTEM_ANALYTICS', 'EXPORT_SYSTEM_ANALYTICS',
            'VIEW_PAYMENT_SETTINGS', 'UPDATE_PLATFORM_FEES', 'UPDATE_MLM_COMMISSIONS',
            'UPDATE_PAYOUT_SETTINGS', 'UPDATE_GATEWAY_SETTINGS', 'VIEW_PAYMENT_ANALYTICS',
            'VIEW_PAYMENT_TRANSACTIONS', 'VIEW_COMMISSION_DISTRIBUTIONS', 'TEST_PAYMENT_GATEWAY',
            'VIEW_AUDIT_LOGS', 'EXPORT_AUDIT_LOGS', 'VIEW_AUDIT_LOG_DETAILS',
            'VIEW_WHATSAPP_SETTINGS', 'UPDATE_WHATSAPP_SETTINGS', 'TEST_WHATSAPP_INTEGRATION',
            'VIEW_WHATSAPP_ANALYTICS', 'VIEW_WHATSAPP_INTEGRATIONS', 'VIEW_WHATSAPP_TEMPLATES',
            'CREATE_WHATSAPP_TEMPLATE', 'VIEW_WHATSAPP_WEBHOOK', 'UPDATE_WHATSAPP_WEBHOOK',
            'VIEW_SECURITY_SETTINGS', 'UPDATE_SECURITY_SETTINGS', 'VIEW_ACTIVE_SESSIONS',
            'TERMINATE_SESSION', 'VIEW_SECURITY_INCIDENTS', 'VIEW_THREAT_SUMMARY', 'UPDATE_MFA_STATUS',
            'VIEW_COMPLIANCE_REPORT',
            'OTHER'
        ]
    },
    category: { 
        type: String, 
        required: true,
        enum: [
            'AUTHENTICATION', 'USER_MANAGEMENT', 'COACH_MANAGEMENT', 
            'PAYMENT_MANAGEMENT', 'MLM_MANAGEMENT', 'SYSTEM_MANAGEMENT',
            'SECURITY', 'DATA_MANAGEMENT', 'ADMIN_MANAGEMENT', 'OTHER'
        ]
    },
    description: { type: String, required: true },
    severity: { 
        type: String, 
        enum: ['low', 'medium', 'high', 'critical'], 
        default: 'medium' 
    },
    
    // Target Information
    targetType: { 
        type: String, 
        enum: ['user', 'coach', 'plan', 'payment', 'system', 'admin', 'other', 'none'] 
    },
    targetId: { type: String },
    targetEmail: { type: String },
    
    // Request Information
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    requestId: { type: String },
    endpoint: { type: String },
    method: { type: String },
    
    // Changes Made
    changes: {
        before: { type: mongoose.Schema.Types.Mixed },
        after: { type: mongoose.Schema.Types.Mixed },
        fieldsChanged: [{ type: String }]
    },
    
    // Result Information
    status: { 
        type: String, 
        enum: ['success', 'failed', 'partial'], 
        default: 'success' 
    },
    errorMessage: { type: String },
    responseTime: { type: Number }, // in milliseconds
    
    // Additional Context
    metadata: {
        browser: { type: String },
        os: { type: String },
        device: { type: String },
        location: {
            country: { type: String },
            city: { type: String },
            coordinates: {
                lat: { type: Number },
                lng: { type: Number }
            }
        },
        sessionId: { type: String },
        referrer: { type: String }
    },
    
    // Retention
    retentionDate: { type: Date },
    archived: { type: Boolean, default: false }
}, { 
    timestamps: true,
    versionKey: false 
});

// Indexes for better performance
adminAuditLogSchema.index({ action: 1 });
adminAuditLogSchema.index({ category: 1 });
adminAuditLogSchema.index({ severity: 1 });
adminAuditLogSchema.index({ createdAt: -1 });
adminAuditLogSchema.index({ ipAddress: 1 });
adminAuditLogSchema.index({ targetType: 1, targetId: 1 });
adminAuditLogSchema.index({ status: 1 });
adminAuditLogSchema.index({ archived: 1 });

// Pre-save middleware to generate logId
adminAuditLogSchema.pre('save', function(next) {
    if (!this.logId) {
        this.logId = `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    
    // Set retention date (default 1 year)
    if (!this.retentionDate) {
        this.retentionDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    
    next();
});

// Static methods
adminAuditLogSchema.statics.createLog = function(logData) {
    return this.create(logData);
};

adminAuditLogSchema.statics.getLogsByAdmin = function(adminId, options = {}) {
    const query = { adminId };
    
    if (options.startDate) query.createdAt = { $gte: options.startDate };
    if (options.endDate) query.createdAt = { ...query.createdAt, $lte: options.endDate };
    if (options.action) query.action = options.action;
    if (options.category) query.category = options.category;
    if (options.severity) query.severity = options.severity;
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 100)
        .select('-changes.before -changes.after'); // Exclude sensitive data by default
};

adminAuditLogSchema.statics.getSecurityLogs = function(options = {}) {
    const query = {
        $or: [
            { category: 'SECURITY' },
            { category: 'AUTHENTICATION' },
            { severity: 'high' },
            { severity: 'critical' },
            { action: { $in: ['LOGIN_FAILED', 'MODIFY_SECURITY_SETTINGS', 'VIEW_SENSITIVE_DATA'] } }
        ]
    };
    
    if (options.startDate) query.createdAt = { $gte: options.startDate };
    if (options.endDate) query.createdAt = { ...query.createdAt, $lte: options.endDate };
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);
};

adminAuditLogSchema.statics.getAuditStats = function(options = {}) {
    const matchStage = {};
    
    if (options.startDate) matchStage.createdAt = { $gte: options.startDate };
    if (options.endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: options.endDate };
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalLogs: { $sum: 1 },
                successCount: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
                failedCount: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
                criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
                highCount: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
                mediumCount: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
                lowCount: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } }
            }
        }
    ]);
};

adminAuditLogSchema.statics.getTopActions = function(options = {}) {
    const matchStage = {};
    
    if (options.startDate) matchStage.createdAt = { $gte: options.startDate };
    if (options.endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: options.endDate };
    
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 },
                lastPerformed: { $max: '$createdAt' }
            }
        },
        { $sort: { count: -1 } },
        { $limit: options.limit || 10 }
    ]);
};

adminAuditLogSchema.statics.cleanupOldLogs = function() {
    const cutoffDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    
    return this.updateMany(
        { 
            createdAt: { $lt: cutoffDate },
            archived: false 
        },
        { 
            $set: { archived: true } 
        }
    );
};

// Instance methods
adminAuditLogSchema.methods.isSensitive = function() {
    const sensitiveActions = [
        'VIEW_SENSITIVE_DATA', 'MODIFY_SECURITY_SETTINGS', 'CHANGE_ADMIN_PERMISSIONS',
        'DELETE_USER', 'DELETE_COACH', 'DELETE_ADMIN', 'BACKUP_SYSTEM', 'RESTORE_SYSTEM'
    ];
    
    return sensitiveActions.includes(this.action) || this.severity === 'critical';
};

adminAuditLogSchema.methods.getFormattedChanges = function() {
    if (!this.changes || !this.changes.fieldsChanged) return [];
    
    return this.changes.fieldsChanged.map(field => ({
        field,
        before: this.changes.before?.[field],
        after: this.changes.after?.[field]
    }));
};

module.exports = mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', adminAuditLogSchema);
