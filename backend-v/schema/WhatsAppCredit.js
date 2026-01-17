const mongoose = require('mongoose');

const WhatsAppCreditSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true,
        index: true
    },
    
    // Credit balance
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Credit package details
    package: {
        name: {
            type: String,
            default: 'Free Tier'
        },
        credits: {
            type: Number,
            default: 100 // Free tier gets 100 credits
        },
        price: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    
    // Usage tracking
    usage: {
        totalMessagesSent: {
            type: Number,
            default: 0
        },
        creditsUsed: {
            type: Number,
            default: 0
        },
        lastUsed: {
            type: Date,
            default: null
        }
    },
    
    // Credit transactions
    transactions: [{
        type: {
            type: String,
            enum: ['purchase', 'usage', 'refund', 'bonus'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        reference: {
            type: String, // Payment reference, order ID, etc.
            default: null
        }
    }],
    
    // Status
    status: {
        type: String,
        enum: ['active', 'suspended', 'expired'],
        default: 'active'
    },
    
    // Expiry
    expiresAt: {
        type: Date,
        default: null // null means no expiry
    },
    
    // Auto-renewal
    autoRenew: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
WhatsAppCreditSchema.index({ status: 1 });
WhatsAppCreditSchema.index({ expiresAt: 1 });

// Virtual for remaining credits
WhatsAppCreditSchema.virtual('remainingCredits').get(function() {
    return this.balance;
});

// Virtual for usage percentage
WhatsAppCreditSchema.virtual('usagePercentage').get(function() {
    if (this.usage.creditsUsed === 0) return 0;
    const totalCredits = this.usage.creditsUsed + this.balance;
    return Math.round((this.usage.creditsUsed / totalCredits) * 100);
});

// Method to deduct credits
WhatsAppCreditSchema.methods.deductCredits = function(amount, description = 'Message sent') {
    if (this.balance < amount) {
        throw new Error('Insufficient credits');
    }
    
    this.balance -= amount;
    this.usage.creditsUsed += amount;
    this.usage.totalMessagesSent += 1;
    this.usage.lastUsed = new Date();
    
    // Add transaction record
    this.transactions.push({
        type: 'usage',
        amount: -amount,
        description: description,
        timestamp: new Date()
    });
    
    return this.save();
};

// Method to add credits
WhatsAppCreditSchema.methods.addCredits = function(amount, description = 'Credits purchased', reference = null) {
    this.balance += amount;
    
    // Add transaction record
    this.transactions.push({
        type: 'purchase',
        amount: amount,
        description: description,
        reference: reference,
        timestamp: new Date()
    });
    
    return this.save();
};

// Method to check if user can send message
WhatsAppCreditSchema.methods.canSendMessage = function() {
    return this.status === 'active' && this.balance > 0;
};

// Static method to get or create credits for coach
WhatsAppCreditSchema.statics.getOrCreateCredits = async function(coachId) {
    let credits = await this.findOne({ coachId });
    
    if (!credits) {
        credits = new this({
            coachId,
            balance: 100, // Free tier
            package: {
                name: 'Free Tier',
                credits: 100,
                price: 0,
                currency: 'USD'
            }
        });
        await credits.save();
    }
    
    return credits;
};

module.exports = mongoose.model('WhatsAppCredit', WhatsAppCreditSchema);
