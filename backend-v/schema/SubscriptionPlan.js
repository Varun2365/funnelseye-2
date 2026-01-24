const mongoose = require('mongoose');

const courseBundleSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContentCourse',
        required: true
    },
    allowResell: {
        type: Boolean,
        default: true
    },
    allowContentRemix: {
        type: Boolean,
        default: true
    },
    allowCustomPricing: {
        type: Boolean,
        default: true
    },
    suggestedResellPrice: {
        type: Number,
        min: 0
    },
    minimumResellPrice: {
        type: Number,
        min: 0
    },
    maximumResellPrice: {
        type: Number,
        min: 0
    },
    marketingKitIncluded: {
        type: Boolean,
        default: false
    },
    marketingAssets: [{
        type: String,
        trim: true
    }],
    includedModules: [{
        type: String,
        trim: true
    }],
    deliveryNotes: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, { _id: false });

const courseAccessSchema = new mongoose.Schema({
    allowCourseLibrary: {
        type: Boolean,
        default: false
    },
    allowResell: {
        type: Boolean,
        default: false
    },
    allowContentRemix: {
        type: Boolean,
        default: false
    },
    allowCustomPricing: {
        type: Boolean,
        default: false
    },
    allowCourseAssetDownload: {
        type: Boolean,
        default: false
    },
    includeMarketingKits: {
        type: Boolean,
        default: false
    },
    maxActiveResellCourses: {
        type: Number,
        default: 0,
        min: 0
    },
    defaultRevenueSharePercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    minMarkupPercent: {
        type: Number,
        default: 0,
        min: 0
    },
    maxMarkupPercent: {
        type: Number,
        default: 0,
        min: 0
    },
    resellPayoutFrequency: {
        type: String,
        enum: ['weekly', 'bi-weekly', 'monthly', 'on-demand'],
        default: 'monthly'
    },
    allowCouponCreation: {
        type: Boolean,
        default: false
    },
    allowPrivateBundles: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const funnelBundleSchema = new mongoose.Schema({
    funnel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminFunnel',
        required: true
    },
    funnelName: {
        type: String,
        trim: true,
        maxlength: 200
    },
    funnelUrl: {
        type: String,
        trim: true,
        maxlength: 200
    },
    targetAudience: {
        type: String,
        enum: ['customer', 'coach', 'both'],
        default: 'customer'
    },
    stageCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: false });

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RUB', 'BRL', 'MXN', 'ZAR', 'KRW', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'TRY', 'ILS', 'PKR', 'BDT', 'LKR', 'NPR', 'AFN', 'IRR', 'IQD', 'KZT', 'UZS', 'KGS', 'TJS', 'TMT', 'AZN', 'AMD', 'GEL', 'UAH', 'BYN', 'MDL', 'RON', 'BGN', 'HRK', 'RSD', 'MKD', 'ALL', 'BAM', 'MNT', 'LAK', 'KHR', 'MMK', 'BND', 'FJD', 'PGK', 'TOP', 'WST', 'VUV', 'SBD', 'TVD', 'XPF', 'CLP', 'COP', 'PEN', 'UYU', 'ARS', 'BOB', 'PYG', 'VES', 'GYD', 'SRD', 'TTD', 'BBD', 'JMD', 'BZD', 'GTQ', 'HNL', 'NIO', 'CRC', 'PAB', 'DOP', 'HTG', 'CUP', 'AWG', 'ANG', 'XCD', 'KYD', 'BMD', 'BSD']
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: true
    },
    duration: {
        type: Number, // in months
        required: true,
        min: 1
    },
    
    // Comprehensive Features Object
    features: {
        // Core Platform Features
        maxFunnels: {
            type: Number,
            default: -1, // Unlimited
            min: -1
        },
        maxStaff: {
            type: Number,
            default: 2,
            min: 0
        },
        maxDevices: {
            type: Number,
            default: 1,
            min: 0
        },
        
        // AI & Advanced Features
        aiFeatures: {
            type: Boolean,
            default: false
        },
        advancedAnalytics: {
            type: Boolean,
            default: false
        },
        prioritySupport: {
            type: Boolean,
            default: false
        },
        customDomain: {
            type: Boolean,
            default: false
        },
        apiAccess: {
            type: Boolean,
            default: false
        },
        whiteLabel: {
            type: Boolean,
            default: false
        },
        
        // Credits & Resources
        automationRules: {
            type: Number,
            default: 10,
            min: 0
        },
        emailCredits: {
            type: Number,
            default: 1000,
            min: 0
        },
        smsCredits: {
            type: Number,
            default: 100,
            min: 0
        },
        storageGB: {
            type: Number,
            default: 10,
            min: 0
        },
        
        // Integrations
        integrations: [{
            type: String,
            enum: ['zapier', 'webhook', 'api', 'slack', 'discord', 'telegram', 'mailchimp', 'hubspot', 'salesforce']
        }],
        
        // Additional Features
        customBranding: {
            type: Boolean,
            default: false
        },
        advancedReporting: {
            type: Boolean,
            default: false
        },
        teamCollaboration: {
            type: Boolean,
            default: false
        },
        mobileApp: {
            type: Boolean,
            default: true
        },
        webhooks: {
            type: Boolean,
            default: false
        },
        sso: {
            type: Boolean,
            default: false
        },
        funnelsLibrary: {
            type: Boolean,
            default: false
        },
        automationLibrary: {
            type: Boolean,
            default: false
        },
        aiCopywriter: {
            type: Boolean,
            default: false
        },
        aiSalesAssistant: {
            type: Boolean,
            default: false
        },
        marketingPlaybooks: {
            type: Boolean,
            default: false
        },
        communityAccess: {
            type: Boolean,
            default: false
        },
        liveWorkshopsPerMonth: {
            type: Number,
            default: 0,
            min: 0
        },
        coachingCallsPerQuarter: {
            type: Number,
            default: 0,
            min: 0
        },
        crmSeats: {
            type: Number,
            default: 1,
            min: 0
        },
        courseLibraryAccess: {
            type: Boolean,
            default: false
        },
        courseRemixTools: {
            type: Boolean,
            default: false
        },
        marketplaceAccess: {
            type: Boolean,
            default: false
        },
        whatsappAutomation: {
            type: Boolean,
            default: false
        },
        emailAutomation: {
            type: Boolean,
            default: false
        },
        salesPipeline: {
            type: Boolean,
            default: false
        },
        advancedScheduler: {
            type: Boolean,
            default: false
        }
    },
    
    // Comprehensive Limits Object
    limits: {
        maxLeads: {
            type: Number,
            default: -1, // Unlimited
            min: -1
        },
        maxAppointments: {
            type: Number,
            default: 50,
            min: 0
        },
        maxCampaigns: {
            type: Number,
            default: 5,
            min: 0
        },
        maxAutomationRules: {
            type: Number,
            default: 10,
            min: 0
        },
        maxWhatsAppMessages: {
            type: Number,
            default: 100,
            min: 0
        },
        maxEmailTemplates: {
            type: Number,
            default: 10,
            min: 0
        },
        maxLandingPages: {
            type: Number,
            default: 5,
            min: 0
        },
        maxWebinars: {
            type: Number,
            default: 2,
            min: 0
        },
        maxForms: {
            type: Number,
            default: 10,
            min: 0
        },
        maxSequences: {
            type: Number,
            default: 5,
            min: 0
        },
        maxTags: {
            type: Number,
            default: 50,
            min: 0
        },
        maxCustomFields: {
            type: Number,
            default: 20,
            min: 0
        },
        maxResellCourses: {
            type: Number,
            default: 0,
            min: 0
        },
        maxCourseSeats: {
            type: Number,
            default: 0,
            min: 0
        },
        maxSharedTemplates: {
            type: Number,
            default: 0,
            min: 0
        },
        maxAutomationWorkflows: {
            type: Number,
            default: 0,
            min: 0
        },
        maxCourseExports: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    
    // Course Bundles & Access
    courseBundles: {
        type: [courseBundleSchema],
        default: []
    },
    courseAccess: {
        type: courseAccessSchema,
        default: {}
    },
    
    // Funnel Bundles
    funnelBundles: {
        type: [funnelBundleSchema],
        default: []
    },
    
    // Plan Metadata
    isPopular: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    trialDays: {
        type: Number,
        default: 0,
        min: 0,
        max: 90
    },
    setupFee: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Admin Management
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    
    // Plan Categories & Tags
    category: {
        type: String,
        enum: ['starter', 'professional', 'enterprise', 'custom'],
        default: 'professional'
    },
    tags: [{
        type: String,
        trim: true
    }],
    
    // Plan Restrictions
    restrictions: {
        allowedCountries: [{
            type: String,
            length: 2 // ISO country codes
        }],
        restrictedFeatures: [{
            type: String
        }],
        complianceRequired: {
            type: Boolean,
            default: false
        }
    },
    
    // Billing & Pricing
    pricing: {
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        setupFee: {
            type: Number,
            default: 0,
            min: 0
        },
        annualDiscount: {
            type: Number,
            default: 0,
            min: 0,
            max: 50 // percentage
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },

    // Optional Add-ons
    addons: {
        allowAddonPurchases: {
            type: Boolean,
            default: false
        },
        availableAddons: [{
            name: { type: String, trim: true, maxlength: 120 },
            description: { type: String, trim: true, maxlength: 500 },
            price: { type: Number, min: 0 },
            billingCycle: { type: String, enum: ['one-time', 'monthly', 'quarterly', 'yearly'], default: 'one-time' }
        }]
    }
}, {
    timestamps: true
});

// Indexes for better performance
subscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });
subscriptionPlanSchema.index({ billingCycle: 1 });
subscriptionPlanSchema.index({ category: 1 });
subscriptionPlanSchema.index({ price: 1 });
subscriptionPlanSchema.index({ 'features.aiFeatures': 1 });
subscriptionPlanSchema.index({ createdBy: 1 });

// Virtual for monthly price calculation
subscriptionPlanSchema.virtual('monthlyPrice').get(function() {
    switch (this.billingCycle) {
        case 'monthly':
            return this.price;
        case 'quarterly':
            return this.price / 3;
        case 'yearly':
            return this.price / 12;
        default:
            return this.price;
    }
});

// Virtual for yearly price calculation
subscriptionPlanSchema.virtual('yearlyPrice').get(function() {
    switch (this.billingCycle) {
        case 'monthly':
            return this.price * 12;
        case 'quarterly':
            return this.price * 4;
        case 'yearly':
            return this.price;
        default:
            return this.price;
    }
});

// Method to check if feature is included
subscriptionPlanSchema.methods.hasFeature = function(featureName) {
    return this.features[featureName] === true;
};

// Method to get limit value
subscriptionPlanSchema.methods.getLimit = function(limitName) {
    return this.limits[limitName] || 0;
};

// Method to check if plan is unlimited for a specific limit
subscriptionPlanSchema.methods.isUnlimited = function(limitName) {
    const limit = this.limits[limitName];
    return limit === -1 || limit === null || limit === undefined;
};

// Pre-save middleware to ensure data consistency
subscriptionPlanSchema.pre('save', function(next) {
    // Ensure pricing.basePrice matches price
    if (this.pricing && !this.pricing.basePrice) {
        this.pricing.basePrice = this.price;
    }
    
    // Ensure pricing.currency matches currency
    if (this.pricing && !this.pricing.currency) {
        this.pricing.currency = this.currency;
    }
    
    next();
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);