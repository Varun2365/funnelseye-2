/**
 * Coach Ad Draft Schema
 * 
 * Represents a coach's ad instance created from an Admin Ad Template.
 * Contains coach-specific runtime configuration: pixel, budget, audience, etc.
 * 
 * CRITICAL: All pixel, account, budget, and audience data belongs to the coach.
 */

const mongoose = require('mongoose');

const CoachAdDraftSchema = new mongoose.Schema({
    // Coach ownership
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Reference to admin template (structural blueprint)
    adminTemplateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdTemplate',
        required: true,
        index: true
    },
    
    // Campaign configuration (coach-owned)
    campaignName: {
        type: String,
        required: true,
        trim: true
    },
    objective: {
        type: String,
        enum: ['OUTCOME_TRAFFIC', 'OUTCOME_LEADS', 'OUTCOME_ENGAGEMENT', 'OUTCOME_APP_PROMOTION', 'OUTCOME_SALES', 'OUTCOME_AWARENESS'],
        required: true
    },
    
    // Creative content (coach-provided)
    creativeContent: {
        headline: {
            type: String,
            required: true,
            trim: true
        },
        primaryText: {
            type: String,
            required: true,
            trim: true
        },
        mediaAssets: [{
            type: {
                type: String,
                enum: ['image', 'video'],
                required: true
            },
            url: {
                type: String,
                required: true
            },
            thumbnailUrl: { type: String, default: null }
        }],
        callToAction: {
            type: String,
            enum: ['LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'DOWNLOAD', 'BOOK_TRAVEL', 'CONTACT_US', 'GET_QUOTE', 'APPLY_NOW', 'SUBSCRIBE'],
            required: true
        }
    },
    
    // Destination (coach's funnel/URL)
    destinationUrl: {
        type: String,
        required: true,
        trim: true
    },
    funnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminFunnel',
        default: null
    },
    
    // Pixel & Conversion (resolved from coach's credentials)
    pixelId: {
        type: String,
        trim: true,
        default: null
        // Resolved from CoachMarketingCredentials.metaAds.pixelId at creation time
    },
    conversionEvent: {
        type: String,
        enum: ['PageView', 'ViewContent', 'Search', 'AddToCart', 'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration', 'Subscribe', 'StartTrial'],
        default: 'PageView'
    },
    
    // Budget (coach-owned)
    budget: {
        type: {
            type: String,
            enum: ['daily', 'lifetime'],
            required: true,
            default: 'daily'
        },
        amount: {
            type: Number,
            required: true,
            min: 1
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    
    // Schedule (coach-configured)
    schedule: {
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        timezone: { type: String, default: 'UTC' }
    },
    
    // Audience configuration (coach-owned)
    audienceType: {
        type: String,
        enum: ['cold', 'retargeting', 'lookalike', 'custom'],
        default: 'cold'
    },
    audienceConfig: {
        // For cold audience
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
            behaviors: [{ type: String }]
        },
        // For retargeting audience
        retargeting: {
            audienceId: { type: String, default: null },
            lookbackWindow: { type: Number, default: 30 },
            exclusionWindow: { type: Number, default: 1 },
            stageId: { type: String, default: null }, // For stage-wise retargeting
            eventType: { type: String, default: null } // FormFilled, PageEngaged, etc.
        },
        // For lookalike audience
        lookalike: {
            sourceAudienceId: { type: String, default: null },
            percentage: { type: Number, default: 1, min: 1, max: 10 }
        }
    },
    
    // Format selection (coach chooses from template's supportedFormats)
    selectedFormat: {
        type: String,
        enum: ['single_image', 'single_video', 'carousel', 'collection', 'dynamic'],
        default: 'single_image'
    },
    
    // Andromeda settings (if template supports it)
    andromedaConfig: {
        enabled: { type: Boolean, default: false },
        format: { type: String, default: null },
        dynamicProductAds: {
            enabled: { type: Boolean, default: false },
            catalogId: { type: String, default: null },
            productSetId: { type: String, default: null }
        },
        carouselSettings: {
            maxCards: { type: Number, default: 10, min: 2, max: 10 }
        }
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
    
    // Status
    status: {
        type: String,
        enum: ['draft', 'pending_review', 'approved', 'active', 'paused', 'completed', 'archived'],
        default: 'draft'
    },
    
    // Meta campaign IDs (created when ad goes live)
    metaCampaignId: { type: String, default: null },
    metaAdSetId: { type: String, default: null },
    metaAdId: { type: String, default: null },
    metaCreativeId: { type: String, default: null },
    
    // Metadata
    notes: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }]
}, {
    timestamps: true,
    collection: 'coach_ad_drafts'
});

// Indexes
CoachAdDraftSchema.index({ coachId: 1, status: 1 });
CoachAdDraftSchema.index({ adminTemplateId: 1 });
CoachAdDraftSchema.index({ metaCampaignId: 1 });
CoachAdDraftSchema.index({ createdAt: -1 });

const CoachAdDraft = mongoose.model('CoachAdDraft', CoachAdDraftSchema);

module.exports = CoachAdDraft;
