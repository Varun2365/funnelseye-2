const mongoose = require('mongoose');

const commissionSettingsSchema = new mongoose.Schema({
    settingId: {
        type: String,
        required: true,
        unique: true
    },
    commissionPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 10 // Default 10% commission
    },
    minimumSubscriptionAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    maximumCommissionAmount: {
        type: Number,
        required: false,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    effectiveTo: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
commissionSettingsSchema.index({ isActive: 1 });
commissionSettingsSchema.index({ effectiveFrom: 1 });
commissionSettingsSchema.index({ effectiveTo: 1 });

module.exports = mongoose.models.CommissionSettings || mongoose.model('CommissionSettings', commissionSettingsSchema);
