// Admin Funnel Schema - Mirrors the regular Funnel schema for admin-managed funnels

const mongoose = require('mongoose');

// Sub-schema for basic SEO and social media information
const basicInfoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    favicon: {
        type: String, // URL or path to favicon
        default: null,
    },
    keywords: {
        type: String,
        trim: true,
        default: '',
    },
    socialTitle: {
        type: String,
        trim: true,
        default: '',
    },
    socialImage: {
        type: String, // URL or path to social sharing image
        default: null,
    },
    socialDescription: {
        type: String,
        trim: true,
        default: '',
    },
    customHtmlHead: {
        type: String, // For custom scripts/meta tags in <head>
        default: '',
    },
    customHtmlBody: {
        type: String, // For custom scripts at the end of <body>
        default: '',
    },
}, { _id: false });


// Sub-schema for individual Funnel Stages
const stageSchema = new mongoose.Schema({
    pageId: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    selectedTemplateKey: {
        type: String,
        default: null,
    },
    html: {
        type: String,
        required: true,
        default: '',
    },
    css: {
        type: String,
        default: '',
    },
    js: {
        type: String,
        default: '',
    },
    assets: {
        type: [String],
        default: [],
    },
    basicInfo: {
        type: basicInfoSchema,
        required: true,
        default: () => ({}),
    },
    order: {
        type: Number,
        min: 0,
    },
    isEnabled: {
        type: Boolean,
        default: true,
    },
});


// Main Admin Funnel Schema
const adminFunnelSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,
    },
    description: {
        type: String,
        required: false,
        trim: true,
        maxlength: 500,
    },
    isActive: {
        type: Boolean,
        default: false, // Default to inactive for admin funnels
    },
    funnelUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[\w\-\/]+$/, 'Please use a valid URL path segment (letters, numbers, hyphens, slashes).'],
    },
    // Optionally, reference to a custom domain (if you want to link a funnel to a specific custom domain)
    customDomain: {
        type: String, // e.g., 'coachvarun.in'
        trim: true,
        lowercase: true,
        match: [/^[a-z0-9\-\.]+$/, 'Domain can only contain lowercase letters, numbers, hyphens, and dots'],
        maxlength: 100,
        default: null
    },
    targetAudience: {
        type: String,
        enum: ['customer', 'coach'], // <-- Changed to enum
        default: 'customer',        // <-- Default set to 'customer'
        required: true,             // <-- Added required: true as enum implies a choice must be made
    },
    stages: {
        type: [stageSchema],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Indices for uniqueness and efficient queries
adminFunnelSchema.index({ adminId: 1, name: 1 }, { unique: true });
// adminFunnelSchema.index({ funnelUrl: 1 }, { unique: true });

adminFunnelSchema.index(
    { _id: 1, "stages.pageId": 1 },
    { unique: true, partialFilterExpression: { "stages.pageId": { $exists: true } } }
);

adminFunnelSchema.index(
    { _id: 1, "stages.order": 1 },
    { unique: true, partialFilterExpression: { "stages.order": { $exists: true } } }
);

module.exports = mongoose.models.AdminFunnel || mongoose.model('AdminFunnel', adminFunnelSchema);