const mongoose = require('mongoose');

const PaymentGatewayConfigSchema = new mongoose.Schema({
    // Gateway Information
    gatewayName: {
        type: String,
        required: true,
        unique: true,
        enum: ['razorpay', 'stripe', 'paypal', 'bank_transfer', 'manual']
    },
    
    // Gateway Status
    isEnabled: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: false
    },
    
    // Gateway Priority (for fallback)
    priority: {
        type: Number,
        default: 1,
        min: 1
    },
    
    // Gateway Configuration
    config: {
        // Razorpay Configuration
        razorpay: {
            keyId: String,
            keySecret: String,
            webhookSecret: String,
            environment: {
                type: String,
                enum: ['test', 'live'],
                default: 'test'
            }
        },
        
        // Stripe Configuration
        stripe: {
            publishableKey: String,
            secretKey: String,
            webhookSecret: String,
            environment: {
                type: String,
                enum: ['test', 'live'],
                default: 'test'
            }
        },
        
        // PayPal Configuration
        paypal: {
            clientId: String,
            clientSecret: String,
            webhookId: String,
            environment: {
                type: String,
                enum: ['sandbox', 'live'],
                default: 'sandbox'
            }
        },
        
        // Bank Transfer Configuration
        bank_transfer: {
            bankName: String,
            accountNumber: String,
            ifscCode: String,
            accountHolderName: String,
            branchName: String
        },
        
        // Manual Payment Configuration
        manual: {
            instructions: String,
            contactEmail: String,
            contactPhone: String,
            processingTime: String
        }
    },
    
    // Supported Payment Methods
    supportedPaymentMethods: [{
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet', 'bank_transfer', 'paypal', 'apple_pay', 'google_pay']
    }],
    
    // Supported Currencies
    supportedCurrencies: [{
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP']
    }],
    
    // Fee Structure
    feeStructure: {
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        fixed: {
            type: Number,
            default: 0,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    
    // Gateway Limits
    limits: {
        minAmount: {
            type: Number,
            default: 1,
            min: 0
        },
        maxAmount: {
            type: Number,
            default: 1000000,
            min: 0
        },
        dailyLimit: {
            type: Number,
            default: 10000000,
            min: 0
        },
        monthlyLimit: {
            type: Number,
            default: 100000000,
            min: 0
        }
    },
    
    // Gateway Health
    health: {
        lastCheck: Date,
        isHealthy: {
            type: Boolean,
            default: true
        },
        responseTime: Number,
        successRate: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        },
        errorCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    
    // Gateway Features
    features: {
        supportsRefunds: {
            type: Boolean,
            default: false
        },
        supportsPartialRefunds: {
            type: Boolean,
            default: false
        },
        supportsRecurringPayments: {
            type: Boolean,
            default: false
        },
        supportsInstallments: {
            type: Boolean,
            default: false
        },
        supportsInternationalPayments: {
            type: Boolean,
            default: false
        }
    },
    
    // Webhook Configuration
    webhooks: {
        enabled: {
            type: Boolean,
            default: false
        },
        url: String,
        events: [String],
        lastWebhookReceived: Date,
        webhookFailures: {
            type: Number,
            default: 0
        }
    },
    
    // Admin Settings
    adminSettings: {
        autoEnable: {
            type: Boolean,
            default: false
        },
        requireApproval: {
            type: Boolean,
            default: true
        },
        notificationEmail: String,
        allowedUserTypes: [{
            type: String,
            enum: ['coach', 'customer', 'admin', 'system']
        }]
    },
    
    // Metadata
    description: String,
    documentationUrl: String,
    supportEmail: String,
    supportPhone: String,
    
    // Audit
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    }
}, {
    timestamps: true
});

// Indexes
// Note: gatewayName already has unique index from schema definition
PaymentGatewayConfigSchema.index({ isEnabled: 1, isActive: 1 });
PaymentGatewayConfigSchema.index({ priority: 1 });

// Pre-save middleware
PaymentGatewayConfigSchema.pre('save', function(next) {
    // Set default supported currencies based on gateway
    if (this.isNew && this.gatewayName === 'razorpay') {
        this.supportedCurrencies = ['INR'];
        this.supportedPaymentMethods = ['card', 'upi', 'netbanking', 'wallet'];
    } else if (this.isNew && this.gatewayName === 'stripe') {
        this.supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
        this.supportedPaymentMethods = ['card', 'apple_pay', 'google_pay'];
    } else if (this.isNew && this.gatewayName === 'paypal') {
        this.supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
        this.supportedPaymentMethods = ['paypal'];
    }
    
    next();
});

// Static method to get active gateways
PaymentGatewayConfigSchema.statics.getActiveGateways = function() {
    return this.find({ isEnabled: true, isActive: true }).sort({ priority: 1 });
};

// Static method to get gateway by name
PaymentGatewayConfigSchema.statics.getGatewayByName = function(gatewayName) {
    return this.findOne({ gatewayName, isEnabled: true, isActive: true });
};

// Instance method to calculate fees
PaymentGatewayConfigSchema.methods.calculateFees = function(amount) {
    const percentageFee = (amount * this.feeStructure.percentage) / 100;
    const totalFee = percentageFee + this.feeStructure.fixed;
    return Math.round(totalFee * 100) / 100;
};

// Instance method to check if amount is within limits
PaymentGatewayConfigSchema.methods.isAmountWithinLimits = function(amount) {
    return amount >= this.limits.minAmount && amount <= this.limits.maxAmount;
};

module.exports = mongoose.model('PaymentGatewayConfig', PaymentGatewayConfigSchema);
