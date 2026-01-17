const mongoose = require('mongoose');

const coachPaymentSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['upi', 'bank_transfer', 'centralized_system']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    paymentType: {
        type: String,
        required: true,
        enum: ['commission', 'bonus', 'referral_reward', 'performance_bonus', 'monthly_payout', 'other'],
        default: 'commission'
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    reference: {
        type: String,
        trim: true,
        default: null
    },
    transactionId: {
        type: String,
        trim: true,
        default: null
    },
    upiId: {
        type: String,
        trim: true,
        default: null
    },
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String
    },
    processingDetails: {
        initiatedAt: Date,
        processedAt: Date,
        completedAt: Date,
        failedAt: Date,
        failureReason: String
    },
    metadata: {
        source: {
            type: String,
            enum: ['mlm_commission', 'lead_generation', 'subscription_referral', 'platform_bonus', 'other'],
            default: 'other'
        },
        period: {
            startDate: Date,
            endDate: Date
        },
        relatedTransactions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        }],
        tags: [String]
    },
    notes: {
        type: String,
        trim: true,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better query performance
coachPaymentSchema.index({ coachId: 1, status: 1 });
coachPaymentSchema.index({ paymentType: 1, status: 1 });
coachPaymentSchema.index({ 'metadata.period.startDate': 1, 'metadata.period.endDate': 1 });
coachPaymentSchema.index({ createdAt: -1 });
// Note: paymentId already has unique index from schema definition

// Virtual for payment duration
coachPaymentSchema.virtual('processingDuration').get(function() {
    if (this.processingDetails.initiatedAt && this.processingDetails.completedAt) {
        return this.processingDetails.completedAt - this.processingDetails.initiatedAt;
    }
    return null;
});

// Virtual for isOverdue (if pending for more than 7 days)
coachPaymentSchema.virtual('isOverdue').get(function() {
    if (this.status === 'pending') {
        const now = new Date();
        const initiatedDate = this.processingDetails.initiatedAt || this.createdAt;
        const daysPending = Math.ceil((now - initiatedDate) / (1000 * 60 * 60 * 24));
        return daysPending > 7;
    }
    return false;
});

// Pre-save middleware to generate payment ID if not provided
coachPaymentSchema.pre('save', function(next) {
    if (!this.paymentId) {
        this.paymentId = `CP_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Pre-save middleware to update processing details
coachPaymentSchema.pre('save', function(next) {
    const now = new Date();
    
    if (this.isModified('status')) {
        switch (this.status) {
            case 'processing':
                this.processingDetails.processedAt = now;
                break;
            case 'completed':
                this.processingDetails.completedAt = now;
                break;
            case 'failed':
                this.processingDetails.failedAt = now;
                break;
        }
    }
    
    next();
});

// Static method to get payment statistics for a coach
coachPaymentSchema.statics.getCoachPaymentStats = async function(coachId, period = null) {
    let query = { coachId };
    
    if (period) {
        query.createdAt = {
            $gte: period.startDate,
            $lte: period.endDate
        };
    }
    
    const stats = await this.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);
    
    const result = {
        totalPayments: 0,
        totalAmount: 0,
        pendingAmount: 0,
        completedAmount: 0,
        failedAmount: 0,
        byStatus: {}
    };
    
    stats.forEach(stat => {
        result.byStatus[stat._id] = {
            count: stat.count,
            amount: stat.totalAmount
        };
        
        if (stat._id === 'completed') {
            result.completedAmount = stat.totalAmount;
        } else if (stat._id === 'pending') {
            result.pendingAmount = stat.totalAmount;
        } else if (stat._id === 'failed') {
            result.failedAmount = stat.totalAmount;
        }
        
        result.totalAmount += stat.totalAmount;
        result.totalPayments += stat.count;
    });
    
    return result;
};

// Instance method to mark payment as processed
coachPaymentSchema.methods.markAsProcessed = function(processedBy) {
    this.status = 'processing';
    this.processedBy = processedBy;
    this.processingDetails.processedAt = new Date();
    return this.save();
};

// Instance method to mark payment as completed
coachPaymentSchema.methods.markAsCompleted = function(transactionId = null) {
    this.status = 'completed';
    if (transactionId) {
        this.transactionId = transactionId;
    }
    this.processingDetails.completedAt = new Date();
    return this.save();
};

// Instance method to mark payment as failed
coachPaymentSchema.methods.markAsFailed = function(reason) {
    this.status = 'failed';
    this.processingDetails.failureReason = reason;
    this.processingDetails.failedAt = new Date();
    return this.save();
};

module.exports = mongoose.model('CoachPayment', coachPaymentSchema);
