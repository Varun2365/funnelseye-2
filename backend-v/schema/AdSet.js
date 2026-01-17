const mongoose = require('mongoose');

const AdSetSchema = new mongoose.Schema({
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: String, required: true }, // Meta campaign ID
    adSetId: { type: String, required: true }, // Meta ad set ID
    name: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'], default: 'DRAFT' },
    targeting: { type: mongoose.Schema.Types.Mixed }, // Age, gender, location, interests
    daily_budget: { type: Number },
    lifetime_budget: { type: Number },
    billing_event: { type: String, enum: ['IMPRESSIONS', 'LINK_CLICKS'], default: 'IMPRESSIONS' },
    optimization_goal: { type: String, enum: ['LINK_CLICKS', 'REACH', 'IMPRESSIONS', 'LEAD_GENERATION'], default: 'LINK_CLICKS' },
    start_time: { type: Date },
    end_time: { type: Date },
    lastSynced: { type: Date },
    metaRaw: { type: mongoose.Schema.Types.Mixed }, // Store raw Meta API response
}, { timestamps: true });

module.exports = mongoose.model('AdSet', AdSetSchema);
