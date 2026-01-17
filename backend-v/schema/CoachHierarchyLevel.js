const mongoose = require('mongoose');

const coachHierarchyLevelSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
        max: 12
    },
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
    isActive: {
        type: Boolean,
        default: true
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
    lastModifiedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient querying (removed duplicate level index since it's already unique)
coachHierarchyLevelSchema.index({ isActive: 1 });

module.exports = mongoose.models.CoachHierarchyLevel || mongoose.model('CoachHierarchyLevel', coachHierarchyLevelSchema);
