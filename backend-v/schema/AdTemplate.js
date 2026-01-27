const mongoose = require('mongoose');

const AdTemplateSchema = new mongoose.Schema({
    // Template identification
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        enum: ['lead_generation', 'sales', 'awareness', 'engagement', 'conversion', 'retargeting', 'other'],
        default: 'other'
    },
    
    // Supported objectives (template capability)
    supportedObjectives: {
        type: [String],
        enum: ['OUTCOME_TRAFFIC', 'OUTCOME_LEADS', 'OUTCOME_ENGAGEMENT', 'OUTCOME_APP_PROMOTION', 'OUTCOME_SALES', 'OUTCOME_AWARENESS'],
        default: ['OUTCOME_LEADS']
    },
    
    // Supported formats (template capability)
    supportedFormats: {
        type: [String],
        enum: ['single_image', 'single_video', 'carousel', 'collection', 'slideshow', 'dynamic'],
        default: ['single_image']
    },
    
    // Required fields structure (what coach must provide)
    requiredFields: {
        headline: { type: Boolean, default: true },
        primaryText: { type: Boolean, default: true },
        mediaSlots: {
            image: { type: Number, default: 1, min: 0 },
            video: { type: Number, default: 0, min: 0 }
        },
        callToActionType: { type: Boolean, default: true },
        destinationUrl: { type: Boolean, default: true }
    },
    
    // Validation rules (template constraints)
    validationRules: {
        maxHeadlineLength: { type: Number, default: 40 },
        maxPrimaryTextLength: { type: Number, default: 125 },
        requiredImageDimensions: {
            width: { type: Number, default: 1200 },
            height: { type: Number, default: 628 }
        },
        supportedCTATypes: {
            type: [String],
            enum: ['LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'DOWNLOAD', 'BOOK_TRAVEL', 'CONTACT_US', 'GET_QUOTE', 'APPLY_NOW', 'SUBSCRIBE'],
            default: ['LEARN_MORE', 'SIGN_UP', 'SHOP_NOW']
        }
    },
    
    // Default content examples (optional guidance)
    defaultContent: {
        exampleHeadline: { type: String, trim: true, default: '' },
        examplePrimaryText: { type: String, trim: true, default: '' },
        exampleCTA: { type: String, trim: true, default: '' }
    },
    
    // Supported conversion events (template capability)
    supportedConversionEvents: {
        type: [String],
        enum: ['PageView', 'ViewContent', 'Search', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration', 'Subscribe', 'StartTrial'],
        default: ['PageView', 'Lead']
    },
    
    // Feature flags (template capabilities)
    flags: {
        supportsRetargeting: { type: Boolean, default: true },
        supportsDynamicAds: { type: Boolean, default: false },
        supportsAndromeda: { type: Boolean, default: false },
        supportsStageWiseRetargeting: { type: Boolean, default: true }
    },
    
    // Template metadata
    tags: [{ type: String, trim: true }],
    isActive: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: false // If true, can be used by all coaches
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        default: null
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date,
        default: null
    },
    
    // AI-generated content flag
    aiGenerated: {
        type: Boolean,
        default: false
    },
    
    
    // Additional custom fields
    customFields: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    collection: 'adtemplates'
});

// Indexes
AdTemplateSchema.index({ name: 1 });
AdTemplateSchema.index({ category: 1 });
AdTemplateSchema.index({ isActive: 1 });
AdTemplateSchema.index({ isPublic: 1 });
AdTemplateSchema.index({ createdBy: 1 });
AdTemplateSchema.index({ tags: 1 });

const AdTemplate = mongoose.model('AdTemplate', AdTemplateSchema);

module.exports = AdTemplate;
