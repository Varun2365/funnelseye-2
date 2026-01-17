const mongoose = require('mongoose');

const AdCampaignSchema = new mongoose.Schema({
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: String, required: true }, // Meta/Facebook campaign ID
    name: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'], default: 'DRAFT' },
    objective: { type: String },
    budget: { type: Number },
    dailyBudget: { type: Number }, // Daily budget in dollars
    spend: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    startDate: { type: Date },
    endDate: { type: Date },
    targeting: { type: mongoose.Schema.Types.Mixed }, // e.g., { age, gender, location, interests }
    results: { type: mongoose.Schema.Types.Mixed }, // e.g., { impressions, clicks, conversions }
    analytics: { type: mongoose.Schema.Types.Mixed }, // e.g., { cpc, ctr, cpm, roas }
    lastSynced: { type: Date },
    metaRaw: { type: mongoose.Schema.Types.Mixed }, // Store raw Meta API response if needed
    // New fields for comprehensive campaign creation
    aiGenerated: { type: Boolean, default: false },
    aiContent: { type: mongoose.Schema.Types.Mixed, default: null },
    targetingRecommendations: { type: mongoose.Schema.Types.Mixed, default: null },
    adTitle: { type: String, default: null },
    adDescription: { type: String, default: null },
    adImageUrl: { type: String, default: null },
    callToAction: { 
        type: String, 
        enum: ['LEARN_MORE', 'SHOP_NOW', 'SIGN_UP', 'DOWNLOAD', 'BOOK_TRAVEL', 'CONTACT_US'],
        default: 'LEARN_MORE'
    },
    schedule: {
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null }
    },
    funnelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Funnel', default: null },
    funnelUrl: { type: String, default: null },
    targetAudience: { type: String, default: null },
    productInfo: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.models.AdCampaign || mongoose.model('AdCampaign', AdCampaignSchema);
