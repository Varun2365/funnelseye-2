const mongoose = require('mongoose');

const adminRequestSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestType: {
        type: String,
        required: true,
        enum: ['level_change', 'sponsor_change', 'team_rank_change', 'president_team_rank_change']
    },
    currentData: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    requestedData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true,
        default: ''
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: {
        type: Date
    },
    supportingDocuments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Pre-save middleware to ensure no requestId field exists
adminRequestSchema.pre('save', function(next) {
    // Remove requestId field if it exists (safety measure)
    if (this.requestId !== undefined) {
        delete this.requestId;
    }
    next();
});

// Pre-update middleware to ensure no requestId field exists
adminRequestSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    // Remove requestId from update operations
    if (this.getUpdate() && this.getUpdate().requestId !== undefined) {
        delete this.getUpdate().requestId;
    }
    next();
});

// Indexes for efficient querying
adminRequestSchema.index({ coachId: 1 });
adminRequestSchema.index({ status: 1 });
adminRequestSchema.index({ requestType: 1 });
adminRequestSchema.index({ createdAt: -1 });
adminRequestSchema.index({ processedBy: 1 });

module.exports = mongoose.models.AdminRequest || mongoose.model('AdminRequest', adminRequestSchema);
