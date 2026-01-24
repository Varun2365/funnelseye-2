const mongoose = require('mongoose');

const aiRequestLogSchema = new mongoose.Schema({
    // Request identification
    requestId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // User information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: false, // Can be null for system requests
        index: true
    },
    userEmail: {
        type: String,
        required: false
    },
    userRole: {
        type: String,
        required: false
    },
    
    // AI Service details
    provider: {
        type: String,
        required: true,
        enum: ['openrouter', 'openai', 'anthropic'],
        default: 'openrouter',
        index: true
    },
    model: {
        type: String,
        required: true,
        index: true
    },
    modelId: {
        type: String,
        required: true
    },
    
    // Request details
    requestType: {
        type: String,
        required: true,
        enum: ['chat', 'completion', 'embedding', 'image', 'other'],
        default: 'chat',
        index: true
    },
    endpoint: {
        type: String,
        required: true
    },
    
    // Token usage
    promptTokens: {
        type: Number,
        required: true,
        default: 0
    },
    completionTokens: {
        type: Number,
        required: true,
        default: 0
    },
    totalTokens: {
        type: Number,
        required: true,
        default: 0
    },
    
    // Pricing information
    promptPrice: {
        type: Number,
        required: true,
        default: 0
    },
    completionPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalCost: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    
    // Request/Response data
    prompt: {
        type: String,
        required: false
    },
    promptLength: {
        type: Number,
        required: false
    },
    response: {
        type: String,
        required: false
    },
    responseLength: {
        type: Number,
        required: false
    },
    
    // Status and timing
    status: {
        type: String,
        required: true,
        enum: ['success', 'error', 'timeout', 'rate_limited'],
        default: 'success',
        index: true
    },
    statusCode: {
        type: Number,
        required: false
    },
    errorMessage: {
        type: String,
        required: false
    },
    duration: {
        type: Number, // in milliseconds
        required: false
    },
    
    // Metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Timestamps
    requestedAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    completedAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true,
    collection: 'airequestlogs'
});

// Indexes for efficient querying
aiRequestLogSchema.index({ userId: 1, requestedAt: -1 });
aiRequestLogSchema.index({ model: 1, requestedAt: -1 });
aiRequestLogSchema.index({ status: 1, requestedAt: -1 });
aiRequestLogSchema.index({ provider: 1, requestedAt: -1 });
aiRequestLogSchema.index({ requestedAt: -1 });

// Virtual for formatted cost
aiRequestLogSchema.virtual('formattedCost').get(function() {
    return `${this.currency} ${this.totalCost.toFixed(6)}`;
});

// Method to get summary stats
aiRequestLogSchema.statics.getStats = async function(filters = {}) {
    const match = {};
    if (filters.userId) match.userId = filters.userId;
    if (filters.model) match.model = filters.model;
    if (filters.status) match.status = filters.status;
    if (filters.startDate || filters.endDate) {
        match.requestedAt = {};
        if (filters.startDate) match.requestedAt.$gte = new Date(filters.startDate);
        if (filters.endDate) match.requestedAt.$lte = new Date(filters.endDate);
    }
    
    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                totalTokens: { $sum: '$totalTokens' },
                totalCost: { $sum: '$totalCost' },
                avgTokens: { $avg: '$totalTokens' },
                avgCost: { $avg: '$totalCost' },
                successCount: {
                    $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                },
                errorCount: {
                    $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
                }
            }
        }
    ]);
    
    return stats[0] || {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        avgTokens: 0,
        avgCost: 0,
        successCount: 0,
        errorCount: 0
    };
};

const AIRequestLog = mongoose.model('AIRequestLog', aiRequestLogSchema);

module.exports = AIRequestLog;
