const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: String,
        required: true,
        enum: ['basic', 'professional', 'enterprise']
    },
    planDetails: {
        name: String,
        price: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        interval: {
            type: String,
            enum: ['week', 'month', 'year'],
            default: 'month'
        },
        features: [String],
        maxLeads: mongoose.Schema.Types.Mixed, // Can be number or 'Unlimited'
        maxStaff: mongoose.Schema.Types.Mixed
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['stripe', 'paypal', 'razorpay', 'bank_transfer']
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    currentPeriodStart: {
        type: Date,
        default: Date.now
    },
    nextBillingDate: {
        type: Date,
        required: true
    },
    lastRenewalDate: {
        type: Date
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'past_due', 'unpaid'],
        default: 'active'
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
SubscriptionSchema.index({ coachId: 1, status: 1 });
SubscriptionSchema.index({ nextBillingDate: 1 });
SubscriptionSchema.index({ status: 1, nextBillingDate: 1 });

module.exports = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
