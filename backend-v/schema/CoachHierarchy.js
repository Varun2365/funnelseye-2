const mongoose = require('mongoose');

// Schema for coach hierarchy levels
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
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Schema for admin requests to change hierarchy details
const adminRequestSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestType: {
        type: String,
        enum: ['hierarchy_change', 'level_change', 'sponsor_change'],
        required: true
    },
    currentData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    requestedData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    reason: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        trim: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    processedAt: {
        type: Date
    }
}, { timestamps: true });

// Schema for external sponsors (not using digital system)
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
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const CoachHierarchyLevel = mongoose.model('CoachHierarchyLevel', coachHierarchyLevelSchema);
const AdminRequest = mongoose.model('AdminRequest', adminRequestSchema);
const ExternalSponsor = mongoose.model('ExternalSponsor', externalSponsorSchema);

module.exports = {
    CoachHierarchyLevel,
    AdminRequest,
    ExternalSponsor
};
