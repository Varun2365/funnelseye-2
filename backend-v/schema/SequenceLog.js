const mongoose = require('mongoose');

const SequenceLogSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    sequence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NurturingSequence',
        required: true
    },
    step: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    stepNumber: {
        type: Number,
        required: true
    },
    stepName: {
        type: String,
        required: true
    },
    actionType: {
        type: String,
        required: true,
        enum: [
            'send_whatsapp_message',
            'send_email',
            'send_sms',
            'create_task',
            'update_lead_score',
            'add_lead_tag',
            'schedule_appointment',
            'send_notification',
            'wait_delay'
        ]
    },
    status: {
        type: String,
        required: true,
        enum: ['scheduled', 'executed', 'failed', 'skipped', 'cancelled'],
        default: 'scheduled'
    },
    scheduledAt: {
        type: Date,
        required: false
    },
    executedAt: {
        type: Date,
        required: false
    },
    executionDuration: {
        type: Number, // in milliseconds
        required: false
    },
    errorMessage: {
        type: String,
        required: false
    },
    retryCount: {
        type: Number,
        default: 0
    },
    nextRetryAt: {
        type: Date,
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better performance
SequenceLogSchema.index({ lead: 1, sequence: 1, step: 1 });
SequenceLogSchema.index({ status: 1, executedAt: 1 });
SequenceLogSchema.index({ scheduledAt: 1, status: 'scheduled' });

// Virtual for step execution status
SequenceLogSchema.virtual('isOverdue').get(function() {
    if (this.status === 'scheduled' && this.scheduledAt) {
        return new Date() > this.scheduledAt;
    }
    return false;
});

// Method to mark as executed
SequenceLogSchema.methods.markExecuted = function() {
    this.status = 'executed';
    this.executedAt = new Date();
    if (this.scheduledAt) {
        this.executionDuration = this.executedAt.getTime() - this.scheduledAt.getTime();
    }
    return this.save();
};

// Method to mark as failed
SequenceLogSchema.methods.markFailed = function(errorMessage, retryCount = 0) {
    this.status = 'failed';
    this.errorMessage = errorMessage;
    this.retryCount = retryCount;
    this.executedAt = new Date();
    return this.save();
};

// Method to schedule retry
SequenceLogSchema.methods.scheduleRetry = function(retryDelayHours = 24) {
    this.status = 'scheduled';
    this.nextRetryAt = new Date(Date.now() + (retryDelayHours * 60 * 60 * 1000));
    this.retryCount += 1;
    return this.save();
};

// Static method to get overdue steps
SequenceLogSchema.statics.getOverdueSteps = function() {
    return this.find({
        status: 'scheduled',
        scheduledAt: { $lt: new Date() }
    }).populate('lead sequence');
};

// Static method to get execution statistics
SequenceLogSchema.statics.getExecutionStats = async function(sequenceId, startDate, endDate) {
    const matchStage = { sequence: mongoose.Types.ObjectId(sequenceId) };
    
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    return await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgExecutionTime: { $avg: '$executionDuration' }
            }
        }
    ]);
};

const SequenceLog = mongoose.models.SequenceLog || mongoose.model('SequenceLog', SequenceLogSchema);

module.exports = SequenceLog;
