const mongoose = require('mongoose');

const coachSubscriptionSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
        default: 'trial'
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    nextBillingDate: {
        type: Date
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    paymentHistory: [{
        paymentId: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        paymentDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['success', 'failed', 'pending', 'refunded'],
            required: true
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String
    }],
    trialEndDate: {
        type: Date
    },
    cancellationDate: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    notes: {
        type: String
    },
    
    // Template access based on subscription
    availableTemplates: [{
        templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MessageTemplate',
            required: true
        },
        templateName: {
            type: String,
            required: true
        },
        grantedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes
coachSubscriptionSchema.index({ coachId: 1 }, { unique: true }); // Ensure one subscription per coach
coachSubscriptionSchema.index({ coachId: 1, status: 1 });
coachSubscriptionSchema.index({ endDate: 1 });
coachSubscriptionSchema.index({ nextBillingDate: 1 });

// Virtual for checking if subscription is active
coachSubscriptionSchema.virtual('isActive').get(function() {
    const now = new Date();
    return this.status === 'active' && this.endDate > now;
});

// Virtual for checking if subscription is in trial
coachSubscriptionSchema.virtual('isTrial').get(function() {
    const now = new Date();
    return this.status === 'trial' && this.trialEndDate && this.trialEndDate > now;
});

// Virtual for days remaining
coachSubscriptionSchema.virtual('daysRemaining').get(function() {
    const now = new Date();
    const diffTime = this.endDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('CoachSubscription', coachSubscriptionSchema);