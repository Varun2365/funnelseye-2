const mongoose = require('mongoose');

const AdCreativeSchema = new mongoose.Schema({
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaignId: { type: String, required: true }, // Meta campaign ID
    creativeId: { type: String, required: true }, // Meta creative ID
    name: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'PAUSED', 'DELETED'], default: 'ACTIVE' },
    object_story_spec: { type: mongoose.Schema.Types.Mixed }, // Link data, image, message
    image_hash: { type: String }, // Meta image hash
    image_url: { type: String }, // Original image URL
    link: { type: String }, // Target URL
    message: { type: String }, // Ad copy
    call_to_action: { type: mongoose.Schema.Types.Mixed }, // CTA button
    lastSynced: { type: Date },
    metaRaw: { type: mongoose.Schema.Types.Mixed }, // Store raw Meta API response
}, { timestamps: true });

module.exports = mongoose.model('AdCreative', AdCreativeSchema);
