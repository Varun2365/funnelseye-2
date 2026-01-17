const mongoose = require('mongoose');

const CentralPaymentSchema = new mongoose.Schema({
    // Basic Payment Information
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: String,
        required: true
    },
    referenceId: {
        type: String,
        required: true,
        unique: true
    },
    
    // Payment Details
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
        enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer', 'upi', 'card', 'netbanking', 'wallet']
    },
    
    // Payment Status
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
        default: 'pending'
    },
    
    // Business Context
    businessType: {
        type: String,
        required: true,
        enum: ['product_purchase', 'subscription', 'commission', 'mlm_payout', 'service_payment', 'refund', 'adjustment']
    },
    
    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: ['coach', 'customer', 'admin', 'system']
    },
    
    // Product/Service Information
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    },
    productType: {
        type: String,
        enum: ['book', 'course', 'service', 'subscription', 'commission', 'other']
    },
    productName: String,
    productDescription: String,
    
    // Commission & MLM
    commissionAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    commissionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    mlmLevel: {
        type: Number,
        default: 0,
        min: 0
    },
    sponsorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Tax & Legal
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    taxPercentage: {
        type: Number,
        default: 0,
        min: 0
    },
    tdsAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    tdsPercentage: {
        type: Number,
        default: 0,
        min: 0
    },
    gstAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    gstPercentage: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Payment Gateway Details
    gateway: {
        type: String,
        required: true,
        enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer', 'manual']
    },
    gatewayTransactionId: String,
    gatewayResponse: mongoose.Schema.Types.Mixed,
    
    // Billing Information
    billingAddress: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        gstin: String
    },
    
    // Subscription Details (if applicable)
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    subscriptionPlan: String,
    billingCycle: {
        type: String,
        enum: ['one_time', 'monthly', 'quarterly', 'yearly']
    },
    
    // Timestamps
    paymentDate: {
        type: Date,
        default: Date.now
    },
    completedDate: Date,
    refundDate: Date,
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
    notes: String,
    
    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
CentralPaymentSchema.index({ userId: 1, status: 1 });
CentralPaymentSchema.index({ businessType: 1, status: 1 });
CentralPaymentSchema.index({ gateway: 1, status: 1 });
CentralPaymentSchema.index({ paymentDate: -1 });
CentralPaymentSchema.index({ orderId: 1, paymentId: 1 });

// Virtual for total amount including taxes
CentralPaymentSchema.virtual('totalAmount').get(function() {
    return this.amount + this.taxAmount + this.gstAmount;
});

// Virtual for net amount after deductions
CentralPaymentSchema.virtual('netAmount').get(function() {
    return this.amount - this.commissionAmount - this.tdsAmount;
});

// Pre-save middleware to generate payment ID
CentralPaymentSchema.pre('save', function(next) {
    if (this.isNew && !this.paymentId) {
        this.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    if (this.isNew && !this.referenceId) {
        this.referenceId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

// Static method to get payment statistics
CentralPaymentSchema.statics.getPaymentStats = async function(filters = {}) {
    const stats = await this.aggregate([
        { $match: filters },
        {
            $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                totalTax: { $sum: '$taxAmount' },
                totalCommission: { $sum: '$commissionAmount' },
                totalTDS: { $sum: '$tdsAmount' },
                totalGST: { $sum: '$gstAmount' },
                completedPayments: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                pendingPayments: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                failedPayments: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                }
            }
        }
    ]);
    
    return stats[0] || {
        totalPayments: 0,
        totalAmount: 0,
        totalTax: 0,
        totalCommission: 0,
        totalTDS: 0,
        totalGST: 0,
        completedPayments: 0,
        pendingPayments: 0,
        failedPayments: 0
    };
};

// Instance method to calculate taxes
CentralPaymentSchema.methods.calculateTaxes = function() {
    // GST calculation (18% for most services in India)
    this.gstAmount = Math.round((this.amount * 0.18) * 100) / 100;
    this.gstPercentage = 18;
    
    // TDS calculation (10% for business payments)
    if (this.businessType === 'commission' || this.businessType === 'mlm_payout') {
        this.tdsAmount = Math.round((this.amount * 0.10) * 100) / 100;
        this.tdsPercentage = 10;
    }
    
    // Total tax
    this.taxAmount = this.gstAmount + this.tdsAmount;
    this.taxPercentage = this.taxAmount > 0 ? Math.round((this.taxAmount / this.amount) * 100) : 0;
    
    return this;
};

module.exports = mongoose.model('CentralPayment', CentralPaymentSchema);
