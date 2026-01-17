const mongoose = require('mongoose');

const CheckoutPageSchema = new mongoose.Schema({
    // Basic Information
    pageId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    
    // Category and Type
    category: {
        type: String,
        required: true,
        enum: [
            'selling',           // Product/course selling
            'subscription',      // Platform subscription
            'donation',          // Donation/charity
            'membership',        // Membership fees
            'service',           // Service payments
            'event',             // Event registration
            'custom'             // Custom category
        ],
        default: 'selling'
    },
    
    // Page Configuration
    configuration: {
        // Visual Settings
        theme: {
            primaryColor: {
                type: String,
                default: '#3B82F6'
            },
            secondaryColor: {
                type: String,
                default: '#1F2937'
            },
            backgroundColor: {
                type: String,
                default: '#FFFFFF'
            },
            textColor: {
                type: String,
                default: '#374151'
            }
        },
        
        // Content Settings
        content: {
            title: {
                type: String,
                required: true,
                default: 'Complete Your Purchase'
            },
            subtitle: {
                type: String,
                default: 'Secure payment powered by Funnelseye'
            },
            description: {
                type: String
            },
            successMessage: {
                type: String,
                default: 'Payment successful! You will receive a confirmation shortly.'
            },
            failureMessage: {
                type: String,
                default: 'Payment failed. Please try again.'
            }
        },
        
        // Payment Settings
        payment: {
            currency: {
                type: String,
                default: 'INR',
                enum: ['INR', 'USD', 'EUR', 'GBP']
            },
            supportedGateways: [{
                type: String,
                enum: ['razorpay', 'stripe', 'paypal', 'upi', 'bank_transfer']
            }],
            defaultGateway: {
                type: String,
                default: 'razorpay'
            },
            allowMultipleCurrencies: {
                type: Boolean,
                default: false
            },
            showCurrencySelector: {
                type: Boolean,
                default: false
            }
        },
        
        // Form Fields Configuration
        fields: {
            showName: {
                type: Boolean,
                default: true
            },
            showEmail: {
                type: Boolean,
                default: true
            },
            showPhone: {
                type: Boolean,
                default: true
            },
            showAddress: {
                type: Boolean,
                default: false
            },
            showCompany: {
                type: Boolean,
                default: false
            },
            showTaxId: {
                type: Boolean,
                default: false
            },
            requiredFields: [{
                type: String,
                enum: ['name', 'email', 'phone', 'address', 'company', 'taxId']
            }]
        },
        
        // Product/Service Configuration
        product: {
            showProductImage: {
                type: Boolean,
                default: true
            },
            showProductDescription: {
                type: Boolean,
                default: true
            },
            showQuantitySelector: {
                type: Boolean,
                default: false
            },
            showDiscountCode: {
                type: Boolean,
                default: false
            },
            showTaxBreakdown: {
                type: Boolean,
                default: true
            },
            showCommissionBreakdown: {
                type: Boolean,
                default: false
            }
        },
        
        // Security and Compliance
        security: {
            requireCaptcha: {
                type: Boolean,
                default: false
            },
            requireTermsAcceptance: {
                type: Boolean,
                default: true
            },
            requirePrivacyPolicy: {
                type: Boolean,
                default: true
            },
            showSecurityBadges: {
                type: Boolean,
                default: true
            },
            enableFraudProtection: {
                type: Boolean,
                default: true
            }
        },
        
        // Post-Payment Actions
        postPayment: {
            redirectUrl: {
                type: String
            },
            showThankYouPage: {
                type: Boolean,
                default: true
            },
            sendEmailReceipt: {
                type: Boolean,
                default: true
            },
            sendWhatsAppReceipt: {
                type: Boolean,
                default: false
            },
            triggerAutomation: {
                type: Boolean,
                default: true
            },
            addToMailingList: {
                type: Boolean,
                default: false
            }
        }
    },
    
    // Business Logic Configuration
    businessLogic: {
        // Commission Settings
        commission: {
            enableCommission: {
                type: Boolean,
                default: true
            },
            commissionType: {
                type: String,
                enum: ['percentage', 'fixed', 'mlm'],
                default: 'percentage'
            },
            commissionValue: {
                type: Number,
                default: 0
            },
            coachId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        },
        
        // Tax Configuration
        tax: {
            enableGST: {
                type: Boolean,
                default: true
            },
            gstPercentage: {
                type: Number,
                default: 18
            },
            enableTDS: {
                type: Boolean,
                default: false
            },
            tdsPercentage: {
                type: Number,
                default: 10
            },
            tdsThreshold: {
                type: Number,
                default: 10000
            }
        },
        
        // Payout Configuration
        payout: {
            enableInstantPayout: {
                type: Boolean,
                default: false
            },
            payoutPercentage: {
                type: Number,
                default: 100
            },
            payoutDelay: {
                type: Number,
                default: 0 // days
            }
        }
    },
    
    // Status and Access Control
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft', 'archived'],
        default: 'draft'
    },
    
    isPublic: {
        type: Boolean,
        default: false
    },
    
    accessControl: {
        requireLogin: {
            type: Boolean,
            default: false
        },
        allowedUserTypes: [{
            type: String,
            enum: ['customer', 'coach', 'admin', 'all']
        }],
        passwordProtected: {
            type: Boolean,
            default: false
        },
        password: {
            type: String
        }
    },
    
    // Analytics and Tracking
    analytics: {
        trackConversions: {
            type: Boolean,
            default: true
        },
        trackAbandonment: {
            type: Boolean,
            default: true
        },
        enableHeatmap: {
            type: Boolean,
            default: false
        },
        enableABTesting: {
            type: Boolean,
            default: false
        }
    },
    
    // SEO and Meta
    seo: {
        metaTitle: {
            type: String
        },
        metaDescription: {
            type: String
        },
        metaKeywords: [{
            type: String
        }],
        ogImage: {
            type: String
        },
        ogTitle: {
            type: String
        },
        ogDescription: {
            type: String
        }
    },
    
    // Created and Updated Info
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
CheckoutPageSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Indexes for better performance
CheckoutPageSchema.index({ category: 1, status: 1 });
CheckoutPageSchema.index({ createdBy: 1, createdAt: -1 });
CheckoutPageSchema.index({ isPublic: 1, status: 1 });

module.exports = mongoose.model('CheckoutPage', CheckoutPageSchema);
