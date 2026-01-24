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
    
    // Campaign settings
    objective: {
        type: String,
        enum: ['OUTCOME_TRAFFIC', 'OUTCOME_LEADS', 'OUTCOME_ENGAGEMENT', 'OUTCOME_APP_PROMOTION', 'OUTCOME_SALES', 'OUTCOME_AWARENESS'],
        default: 'OUTCOME_LEADS'
    },
    
    // Ad content (prefilled)
    adTitle: {
        type: String,
        required: true,
        trim: true
    },
    adDescription: {
        type: String,
        required: true,
        trim: true
    },
    adHeadline: {
        type: String,
        trim: true,
        default: ''
    },
    adText: {
        type: String,
        trim: true,
        default: ''
    },
    adImageUrl: {
        type: String,
        trim: true,
        default: ''
    },
    adVideoUrl: {
        type: String,
        trim: true,
        default: ''
    },
    callToAction: {
        type: String,
        enum: ['LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'DOWNLOAD', 'BOOK_TRAVEL', 'CONTACT_US', 'GET_QUOTE', 'APPLY_NOW', 'SUBSCRIBE'],
        default: 'LEARN_MORE'
    },
    
    // Targeting (prefilled)
    targeting: {
        ageMin: { type: Number, default: null },
        ageMax: { type: Number, default: null },
        genders: [{ type: String, enum: ['male', 'female', 'all'] }],
        locations: {
            countries: [{ type: String }],
            regions: [{ type: String }],
            cities: [{ type: String }]
        },
        interests: [{ type: String }],
        behaviors: [{ type: String }],
        customAudiences: [{ type: String }],
        lookalikeAudiences: [{ type: String }]
    },
    
    // Budget settings (prefilled)
    budget: {
        type: {
            type: String,
            enum: ['daily', 'lifetime'],
            default: 'daily'
        },
        amount: { type: Number, default: null },
        currency: { type: String, default: 'USD' }
    },
    
    // Scheduling (prefilled)
    schedule: {
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        timezone: { type: String, default: 'UTC' }
    },
    
    // Funnel/Product linking
    funnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Funnel',
        default: null
    },
    funnelUrl: {
        type: String,
        trim: true,
        default: ''
    },
    productInfo: {
        type: String,
        trim: true,
        default: ''
    },
    targetAudience: {
        type: String,
        trim: true,
        default: ''
    },
    
    // Placement settings
    placements: {
        type: [String],
        enum: ['facebook_feed', 'instagram_feed', 'instagram_stories', 'messenger', 'audience_network', 'all'],
        default: ['all']
    },
    
    // Optimization settings
    optimization: {
        optimizationGoal: {
            type: String,
            enum: ['LINK_CLICKS', 'IMPRESSIONS', 'REACH', 'LANDING_PAGE_VIEWS', 'OFFSITE_CONVERSIONS', 'POST_ENGAGEMENT'],
            default: 'LINK_CLICKS'
        },
        bidStrategy: {
            type: String,
            enum: ['LOWEST_COST', 'COST_CAP', 'BID_CAP'],
            default: 'LOWEST_COST'
        }
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
