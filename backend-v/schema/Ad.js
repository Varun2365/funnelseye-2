const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: String, required: true }, // Meta campaign ID
    adSetId: { type: String, required: true }, // Meta ad set ID
    adId: { type: String, required: true }, // Meta ad ID
    creativeId: { type: String, required: true }, // Meta creative ID
    name: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'DELETED'], default: 'DRAFT' },
    adset_id: { type: String }, // Meta ad set ID reference
    creative: { type: mongoose.Schema.Types.Mixed }, // Creative reference
    lastSynced: { type: Date },
    metaRaw: { type: mongoose.Schema.Types.Mixed }, // Store raw Meta API response
}, { timestamps: true });

module.exports = mongoose.model('Ad', AdSchema);