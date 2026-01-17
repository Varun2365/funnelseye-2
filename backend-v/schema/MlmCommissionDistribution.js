const mongoose = require('mongoose');

const mlmCommissionDistributionSchema = new mongoose.Schema({
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    level: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    platformFee: {
        type: Number,
        required: true,
        min: 0
    },
    netAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'cancelled'],
        default: 'pending'
    },
    payoutId: {
        type: String,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for better performance
mlmCommissionDistributionSchema.index({ recipientId: 1, createdAt: -1 });
mlmCommissionDistributionSchema.index({ subscriptionId: 1 });
mlmCommissionDistributionSchema.index({ status: 1 });
mlmCommissionDistributionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MlmCommissionDistribution', mlmCommissionDistributionSchema);