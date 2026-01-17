const mongoose = require('mongoose');

const CoachTransactionSchema = new mongoose.Schema({
    // Transaction Identification
    transactionId: {
        type: String,
        required: true,
        unique: true,
        default: () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },
    
    // Coach Information
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Transaction Type
    transactionType: {
        type: String,
        required: true,
        enum: [
            'commission_earned',      // Commission from sales
            'direct_sale',           // Direct product/course sale
            'mlm_commission',        // MLM level commission
            'referral_bonus',        // Referral bonus
            'performance_bonus',     // Performance-based bonus
            'payout_received',       // Money received via payout
            'payout_requested',      // Payout request made
            'payout_processing',     // Payout being processed
            'payout_completed',      // Payout completed
            'payout_failed',         // Payout failed
            'payout_cancelled',      // Payout cancelled
            'refund_processed',     // Refund processed
            'platform_fee_deducted', // Platform fee deduction
            'tax_deducted',         // Tax deduction
            'adjustment',           // Manual adjustment
            'other'                 // Other transaction types
        ]
    },
    
    // Transaction Direction
    direction: {
        type: String,
        required: true,
        enum: ['incoming', 'outgoing'],
        default: 'incoming'
    },
    
    // Amount Information
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
        required: true,
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'INR'
    },
    
    // Fee Breakdown
    fees: {
        platformFee: {
            type: Number,
            default: 0,
            min: 0
        },
        processingFee: {
            type: Number,
            default: 0,
            min: 0
        },
        payoutFee: {
            type: Number,
            default: 0,
            min: 0
        },
        taxAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        totalFees: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    
    // Commission Details (for commission transactions)
    commissionDetails: {
        level: {
            type: Number,
            min: 0,
            max: 12
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100
        },
        baseAmount: {
            type: Number,
            min: 0
        },
        sponsorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sourceTransactionId: {
            type: String
        }
    },
    
    // Product/Service Information
    productInfo: {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdminProduct'
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CoachSellablePlan'
        },
        productName: String,
        productType: {
            type: String,
            enum: ['course', 'book', 'service', 'subscription', 'other']
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        customerName: String,
        customerEmail: String
    },
    
    // Payment Gateway Information
    paymentGateway: {
        name: {
            type: String,
            enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer', 'upi', 'manual']
        },
        transactionId: String,
        orderId: String,
        paymentId: String,
        gatewayResponse: mongoose.Schema.Types.Mixed
    },
    
    // Payout Information (for payout transactions)
    payoutInfo: {
        payoutId: String,
        payoutMethod: {
            type: String,
            enum: ['upi', 'bank_transfer', 'paytm', 'phonepe', 'google_pay']
        },
        destination: {
            upiId: String,
            bankAccount: {
                accountNumber: String,
                ifscCode: String,
                accountHolder: String,
                bankName: String
            }
        },
        isInstant: {
            type: Boolean,
            default: false
        },
        processingTime: Number, // in minutes
        initiatedAt: Date,
        completedAt: Date,
        failedAt: Date,
        failureReason: String
    },
    
    // Transaction Status
    status: {
        type: String,
        required: true,
        enum: [
            'pending',           // Transaction initiated
            'processing',        // Being processed
            'completed',         // Successfully completed
            'failed',           // Failed
            'cancelled',        // Cancelled
            'refunded',         // Refunded
            'partially_refunded' // Partially refunded
        ],
        default: 'pending'
    },
    
    // Timestamps
    transactionDate: {
        type: Date,
        default: Date.now
    },
    
    processedAt: Date,
    completedAt: Date,
    failedAt: Date,
    
    // Reference Information
    referenceId: String,
    externalReference: String,
    
    // Notes and Metadata
    notes: String,
    metadata: {
        source: {
            type: String,
            enum: ['web', 'mobile', 'api', 'admin', 'system', 'webhook']
        },
        ipAddress: String,
        userAgent: String,
        sessionId: String,
        campaignId: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String
    },
    
    // Audit Information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Reconciliation
    isReconciled: {
        type: Boolean,
        default: false
    },
    
    reconciledAt: Date,
    
    reconciledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
CoachTransactionSchema.index({ coachId: 1, transactionDate: -1 });
CoachTransactionSchema.index({ transactionType: 1 });
CoachTransactionSchema.index({ status: 1 });
CoachTransactionSchema.index({ direction: 1 });
// Note: transactionId already has unique index from schema definition
CoachTransactionSchema.index({ 'productInfo.productId': 1 });
CoachTransactionSchema.index({ 'productInfo.planId': 1 });
CoachTransactionSchema.index({ 'paymentGateway.transactionId': 1 });
CoachTransactionSchema.index({ 'payoutInfo.payoutId': 1 });
CoachTransactionSchema.index({ transactionDate: -1 });

// Compound indexes
CoachTransactionSchema.index({ coachId: 1, transactionType: 1, status: 1 });
CoachTransactionSchema.index({ coachId: 1, direction: 1, transactionDate: -1 });

// Virtual for transaction summary
CoachTransactionSchema.virtual('summary').get(function() {
    return {
        transactionId: this.transactionId,
        type: this.transactionType,
        direction: this.direction,
        amount: this.netAmount,
        currency: this.currency,
        status: this.status,
        date: this.transactionDate
    };
});

// Virtual for earnings calculation
CoachTransactionSchema.virtual('isEarning').get(function() {
    return this.direction === 'incoming' && 
           ['commission_earned', 'direct_sale', 'mlm_commission', 'referral_bonus', 'performance_bonus'].includes(this.transactionType);
});

// Virtual for payout calculation
CoachTransactionSchema.virtual('isPayout').get(function() {
    return this.direction === 'outgoing' && 
           ['payout_received', 'payout_requested', 'payout_processing', 'payout_completed'].includes(this.transactionType);
});

// Pre-save middleware to calculate total fees
CoachTransactionSchema.pre('save', function(next) {
    if (this.fees) {
        this.fees.totalFees = (this.fees.platformFee || 0) + 
                              (this.fees.processingFee || 0) + 
                              (this.fees.payoutFee || 0) + 
                              (this.fees.taxAmount || 0);
    }
    next();
});

// Static method to get coach earnings summary
CoachTransactionSchema.statics.getCoachEarningsSummary = async function(coachId, startDate, endDate) {
    const matchStage = {
        coachId: new mongoose.Types.ObjectId(coachId),
        direction: 'incoming',
        status: 'completed',
        transactionType: { $in: ['commission_earned', 'direct_sale', 'mlm_commission', 'referral_bonus', 'performance_bonus'] }
    };
    
    if (startDate && endDate) {
        matchStage.transactionDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    const summary = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$transactionType',
                totalAmount: { $sum: '$netAmount' },
                transactionCount: { $sum: 1 },
                totalFees: { $sum: '$fees.totalFees' }
            }
        },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: '$totalAmount' },
                totalTransactions: { $sum: '$transactionCount' },
                totalFeesPaid: { $sum: '$totalFees' },
                breakdown: {
                    $push: {
                        type: '$_id',
                        amount: '$totalAmount',
                        count: '$transactionCount'
                    }
                }
            }
        }
    ]);
    
    return summary[0] || {
        totalEarnings: 0,
        totalTransactions: 0,
        totalFeesPaid: 0,
        breakdown: []
    };
};

// Static method to get coach payout summary
CoachTransactionSchema.statics.getCoachPayoutSummary = async function(coachId, startDate, endDate) {
    const matchStage = {
        coachId: new mongoose.Types.ObjectId(coachId),
        direction: 'outgoing',
        transactionType: { $in: ['payout_received', 'payout_completed'] }
    };
    
    if (startDate && endDate) {
        matchStage.transactionDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }
    
    const summary = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalPayouts: { $sum: '$netAmount' },
                payoutCount: { $sum: 1 },
                totalFees: { $sum: '$fees.totalFees' }
            }
        }
    ]);
    
    return summary[0] || {
        totalPayouts: 0,
        payoutCount: 0,
        totalFees: 0
    };
};

module.exports = mongoose.models.CoachTransaction || mongoose.model('CoachTransaction', CoachTransactionSchema);
