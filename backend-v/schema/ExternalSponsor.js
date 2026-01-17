const mongoose = require('mongoose');

const externalSponsorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
externalSponsorSchema.index({ name: 1 });
externalSponsorSchema.index({ phone: 1 });
externalSponsorSchema.index({ email: 1 });
externalSponsorSchema.index({ isActive: 1 });

module.exports = mongoose.models.ExternalSponsor || mongoose.model('ExternalSponsor', externalSponsorSchema);
