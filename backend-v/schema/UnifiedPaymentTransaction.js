const mongoose = require('mongoose');

const UnifiedPaymentTransactionSchema = new mongoose.Schema({
    // Transaction Identification
    transactionId: {
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

    // Transaction Type & Context
    transactionType: {
        type: String,
        required: true,
        enum: [
            'course_purchase',      // Client buying coach's course
            'product_purchase',      // Client buying coach's product
            'subscription_payment',  // Coach paying platform subscription
            'mlm_commission',        // MLM commission payout
            'instant_payout',        // Instant payout to coach
            'monthly_payout',        // Monthly payout to coach
            'refund',               // Refund transaction
            'adjustment'            // Manual adjustment
        ]
    },
    
    // Checkout Page Reference
    checkoutPage: {
        pageId: {
            type: String,
            required: false
        },
        configuration: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },

    // Amount Details
    grossAmount: {
        type: Number,
        required: true,
        min: 0
    },
    netAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP']
    },

    // Fee Breakdown
    platformFee: {
        type: Number,
        default: 0,
        min: 0
    },
    commissionAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    tdsAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    gstAmount: {
        type: Number,
        default: 0,
        min: 0
    },

    // Parties Involved
    sender: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'sender.type'
        },
        type: {
            type: String,
            required: true,
            enum: ['customer', 'coach', 'admin', 'system']
        },
        name: String,
        email: String,
        phone: String
    },

    receiver: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'receiver.type'
        },
        type: {
            type: String,
            required: true,
            enum: ['customer', 'coach', 'admin', 'system', 'central_account']
        },
        name: String,
        email: String,
        phone: String
    },

    // Product/Service Details
    product: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        type: {
            type: String,
            enum: ['course', 'book', 'service', 'subscription', 'commission', 'other']
        },
        name: String,
        description: String,
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },

    // MLM Details (if applicable)
    mlm: {
        level: {
            type: Number,
            min: 0,
            max: 12
        },
        sponsorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        commissionPercentage: {
            type: Number,
            min: 0,
            max: 100
        }
    },

    // Payment Gateway Details
    gateway: {
        name: {
            type: String,
            required: true,
            enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer', 'upi', 'manual']
        },
        transactionId: String,
        response: mongoose.Schema.Types.Mixed
    },

    // Payout Details (for payouts)
    payout: {
        method: {
            type: String,
            enum: ['upi', 'bank_transfer', 'paytm', 'phonepe', 'google_pay']
        },
        destination: {
            upiId: String,
            bankAccount: {
                accountNumber: String,
                ifscCode: String,
                accountHolder: String
            }
        },
        isInstant: {
            type: Boolean,
            default: false
        },
        fee: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // Transaction Status
    status: {
        type: String,
        required: true,
        enum: [
            'pending',           // Payment initiated
            'processing',        // Payment being processed
            'completed',         // Payment successful
            'failed',           // Payment failed
            'cancelled',        // Payment cancelled
            'refunded',         // Payment refunded
            'partially_refunded' // Partial refund
        ],
        default: 'pending'
    },

    // Timestamps
    initiatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    refundedAt: Date,

    // Post-Transaction Actions
    postTransactionActions: {
        emailSent: {
            type: Boolean,
            default: false
        },
        whatsappSent: {
            type: Boolean,
            default: false
        },
        automationTriggered: {
            type: Boolean,
            default: false
        },
        courseAdded: {
            type: Boolean,
            default: false
        },
        earningsUpdated: {
            type: Boolean,
            default: false
        }
    },

    // Metadata
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'api', 'admin']
        },
        ipAddress: String,
        userAgent: String,
        notes: String
    },

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
// Note: transactionId already has unique index from schema definition
UnifiedPaymentTransactionSchema.index({ orderId: 1 });
UnifiedPaymentTransactionSchema.index({ 'sender.id': 1, 'sender.type': 1 });
UnifiedPaymentTransactionSchema.index({ 'receiver.id': 1, 'receiver.type': 1 });
UnifiedPaymentTransactionSchema.index({ transactionType: 1 });
UnifiedPaymentTransactionSchema.index({ status: 1 });
UnifiedPaymentTransactionSchema.index({ 'gateway.name': 1 });
UnifiedPaymentTransactionSchema.index({ initiatedAt: -1 });
UnifiedPaymentTransactionSchema.index({ 'product.coachId': 1 });
UnifiedPaymentTransactionSchema.index({ 'mlm.sponsorId': 1 });

// Virtual for total fees
UnifiedPaymentTransactionSchema.virtual('totalFees').get(function() {
    return this.platformFee + this.taxAmount + this.tdsAmount + this.gstAmount;
});

// Virtual for coach earnings (for course/product sales)
UnifiedPaymentTransactionSchema.virtual('coachEarnings').get(function() {
    if (this.transactionType === 'course_purchase' || this.transactionType === 'product_purchase') {
        return this.commissionAmount;
    }
    return 0;
});

// Virtual for platform profit
UnifiedPaymentTransactionSchema.virtual('platformProfit').get(function() {
    return this.platformFee;
});

// Pre-save middleware to generate transaction ID
UnifiedPaymentTransactionSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    if (!this.orderId) {
        this.orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    if (!this.referenceId) {
        this.referenceId = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.models.UnifiedPaymentTransaction || mongoose.model('UnifiedPaymentTransaction', UnifiedPaymentTransactionSchema);
