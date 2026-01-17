const mongoose = require('mongoose');

const GlobalPaymentSettingsSchema = new mongoose.Schema({
    // Platform Fee Settings
    platformFee: {
        percentage: {
            type: Number,
            default: 10, // 10% platform fee
            min: 0,
            max: 100
        },
        fixedAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        isPercentageBased: {
            type: Boolean,
            default: true
        }
    },

    // Commission Settings
    commission: {
        // MLM Commission Structure
        mlmLevels: [{
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
            isActive: {
                type: Boolean,
                default: true
            }
        }],
        
        // Direct Commission for Course/Product Sales
        directCommission: {
            percentage: {
                type: Number,
                default: 70, // 70% to coach
                min: 0,
                max: 100
            },
            isActive: {
                type: Boolean,
                default: true
            }
        },

        // Minimum Payout Threshold
        minimumPayoutAmount: {
            type: Number,
            default: 500, // ₹500 minimum
            min: 0
        }
    },

    // Payout Settings
    payout: {
        // Instant Payout Settings
        instantPayout: {
            isEnabled: {
                type: Boolean,
                default: true
            },
            fee: {
                type: Number,
                default: 50, // ₹50 fee for instant payout
                min: 0
            },
            minimumAmount: {
                type: Number,
                default: 100, // ₹100 minimum for instant payout
                min: 0
            },
            maximumAmount: {
                type: Number,
                default: 50000, // ₹50,000 maximum for instant payout
                min: 0
            }
        },

        // Monthly Payout Settings
        monthlyPayout: {
            isEnabled: {
                type: Boolean,
                default: true
            },
            dayOfMonth: {
                type: Number,
                default: 5, // 5th of every month
                min: 1,
                max: 31
            },
            timeOfDay: {
                type: String,
                default: '10:00', // 10:00 AM
                match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
            },
            timezone: {
                type: String,
                default: 'Asia/Kolkata'
            }
        },

        // Payout Methods
        supportedMethods: [{
            method: {
                type: String,
                enum: ['upi', 'bank_transfer', 'paytm', 'phonepe', 'google_pay']
            },
            isEnabled: {
                type: Boolean,
                default: true
            },
            fee: {
                type: Number,
                default: 0,
                min: 0
            }
        }]
    },

    // Tax Settings
    tax: {
        gst: {
            isEnabled: {
                type: Boolean,
                default: true
            },
            percentage: {
                type: Number,
                default: 18,
                min: 0,
                max: 100
            }
        },
        tds: {
            isEnabled: {
                type: Boolean,
                default: true
            },
            percentage: {
                type: Number,
                default: 5,
                min: 0,
                max: 100
            },
            threshold: {
                type: Number,
                default: 30000, // ₹30,000 threshold
                min: 0
            }
        }
    },

    // Razorpay Configuration
    razorpay: {
        keyId: {
            type: String,
            trim: true,
            required: false, // Made optional - can be added later via admin panel
            default: null
        },
        keySecret: {
            type: String,
            trim: true,
            required: false, // Made optional - can be added later via admin panel
            default: null
        },
        accountNumber: {
            type: String,
            trim: true,
            required: false
        },
        isActive: {
            type: Boolean,
            default: false // Default to false until credentials are added
        },
        webhookSecret: {
            type: String,
            trim: true
        }
    },

    // Central Account Settings
    centralAccount: {
        // Bank Account Details
        bankAccount: {
            accountNumber: {
                type: String,
                trim: true
            },
            ifscCode: {
                type: String,
                trim: true
            },
            accountHolder: {
                type: String,
                trim: true
            },
            bankName: {
                type: String,
                trim: true
            }
        },

        // UPI Details
        upiId: {
            type: String,
            trim: true,
            match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/, 'Please enter a valid UPI ID']
        },

        // Payment Gateway Accounts
        gatewayAccounts: {
            razorpay: {
                accountId: {
                    type: String,
                    trim: true
                },
                isActive: {
                    type: Boolean,
                    default: true
                }
            },
            stripe: {
                accountId: {
                    type: String,
                    trim: true
                },
                isActive: {
                    type: Boolean,
                    default: false
                }
            }
        }
    },

    // Automation Settings
    automation: {
        // Post-Payment Actions
        postPaymentActions: {
            sendEmailNotification: {
                type: Boolean,
                default: true
            },
            sendWhatsAppNotification: {
                type: Boolean,
                default: true
            },
            triggerAutomationRules: {
                type: Boolean,
                default: true
            },
            updateCoachEarnings: {
                type: Boolean,
                default: true
            },
            addCourseToClient: {
                type: Boolean,
                default: true
            }
        },

        // Payout Notifications
        payoutNotifications: {
            sendPayoutConfirmation: {
                type: Boolean,
                default: true
            },
            sendMonthlyStatement: {
                type: Boolean,
                default: true
            }
        }
    },

    // Record Keeping
    records: {
        totalTransactions: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            default: 0
        },
        totalCommissions: {
            type: Number,
            default: 0
        },
        totalPayouts: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },

    // Metadata
    metadata: {
        version: {
            type: String,
            default: '1.0.0'
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AdminUser'
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000
        }
    }
}, {
    timestamps: true
});

// Indexes
GlobalPaymentSettingsSchema.index({ 'commission.mlmLevels.level': 1 });
GlobalPaymentSettingsSchema.index({ 'payout.monthlyPayout.dayOfMonth': 1 });

// Virtual for total commission percentage
GlobalPaymentSettingsSchema.virtual('totalCommissionPercentage').get(function() {
    return this.commission.mlmLevels.reduce((total, level) => {
        return total + (level.isActive ? level.percentage : 0);
    }, 0);
});

// Virtual for platform profit percentage
GlobalPaymentSettingsSchema.virtual('platformProfitPercentage').get(function() {
    return 100 - this.totalCommissionPercentage - this.platformFee.percentage;
});

module.exports = mongoose.models.GlobalPaymentSettings || mongoose.model('GlobalPaymentSettings', GlobalPaymentSettingsSchema);
