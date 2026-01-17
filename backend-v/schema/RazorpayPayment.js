const mongoose = require('mongoose');

const razorpayPaymentSchema = new mongoose.Schema({
    // Razorpay Payment Details
    razorpayPaymentId: {
        type: String,
        required: false // Will be set after payment completion
    },
    
    razorpayOrderId: {
        type: String,
        required: true
    },
    
    razorpaySignature: {
        type: String,
        required: false // Will be set after payment completion
    },
    
    // Payment Information
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    
    currency: {
        type: String,
        required: true,
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'INR'
    },
    
    // Payment Status
    status: {
        type: String,
        required: true,
        enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
        default: 'created'
    },
    
    // Business Context
    businessType: {
        type: String,
        required: true,
        enum: [
            'coach_plan_purchase',
            'platform_subscription',
            'mlm_commission',
            'coach_payout',
            'refund',
            'other'
        ]
    },
    
    // User Information
    userId: {
        type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String
        required: true
    },
    
    userType: {
        type: String,
        required: true,
        enum: ['coach', 'customer', 'admin', 'system']
    },
    
    // Product/Plan Information
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminProduct'
    },
    
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoachSellablePlan'
    },
    
    productType: {
        type: String,
        enum: ['admin_product', 'coach_plan', 'subscription', 'commission', 'other']
    },
    
    productName: String,
    productDescription: String,
    
    // Coach Information (for coach plans)
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // MLM Information
    mlmLevel: {
        type: Number,
        min: 0,
        max: 12
    },
    
    sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Commission Details
    commissionAmount: {
        type: Number,
        default: 0
    },
    
    platformCommission: {
        type: Number,
        default: 0
    },
    
    coachCommission: {
        type: Number,
        default: 0
    },
    
    // Payment Method Details
    paymentMethod: {
        type: String,
        enum: ['card', 'netbanking', 'wallet', 'upi', 'emi', 'other']
    },
    
    bank: String,
    wallet: String,
    vpa: String, // UPI Virtual Payment Address
    
    // Razorpay Response Data
    razorpayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    
    // Webhook Data
    webhookData: {
        type: mongoose.Schema.Types.Mixed
    },
    
    // Refund Information
    refunds: [{
        refundId: String,
        amount: Number,
        status: String,
        reason: String,
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Error Information
    errorCode: String,
    errorDescription: String,
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    capturedAt: Date,
    failedAt: Date
}, {
    timestamps: true
});

// Indexes for efficient querying
// Note: razorpayPaymentId has unique partial index defined below
razorpayPaymentSchema.index({ razorpayOrderId: 1 });
razorpayPaymentSchema.index({ userId: 1, userType: 1 });
razorpayPaymentSchema.index({ coachId: 1 });
razorpayPaymentSchema.index({ status: 1 });
razorpayPaymentSchema.index({ businessType: 1 });
razorpayPaymentSchema.index({ createdAt: -1 });

// Update the updatedAt field on save
razorpayPaymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for payment success
razorpayPaymentSchema.virtual('isSuccessful').get(function() {
    return this.status === 'captured';
});

// Custom index for razorpayPaymentId uniqueness (only when exists)
razorpayPaymentSchema.index(
    { razorpayPaymentId: 1 }, 
    { 
        unique: true,
        partialFilterExpression: { razorpayPaymentId: { $exists: true } }
    }
);

// Virtual for net amount (after refunds)
razorpayPaymentSchema.virtual('netAmount').get(function() {
    const totalRefunds = this.refunds.reduce((sum, refund) => {
        return sum + (refund.status === 'processed' ? refund.amount : 0);
    }, 0);
    return this.amount - totalRefunds;
});

module.exports = mongoose.models.RazorpayPayment || mongoose.model('RazorpayPayment', razorpayPaymentSchema);
