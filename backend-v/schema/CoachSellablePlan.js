const mongoose = require('mongoose');

const coachSellablePlanSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Reference to the admin product
    adminProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminProduct',
        required: true
    },
    
    // Coach's Custom Plan Details
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    
    shortDescription: {
        type: String,
        trim: true,
        maxlength: 500
    },
    
    // Coach's Pricing
    price: {
        type: Number,
        required: true,
        min: 0
    },
    
    currency: {
        type: String,
        required: true,
        enum: ['USD', 'INR', 'EUR', 'GBP'],
        default: 'INR'
    },
    
    originalPrice: {
        type: Number,
        min: 0
    },
    
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    
    // Coach's Custom Features (can add to base product features)
    additionalFeatures: [{
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        icon: { type: String, trim: true }
    }],
    
    // Coach's Custom Content
    additionalContentFiles: [{
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number }, // in bytes
        fileType: { type: String },
        isDownloadable: { type: Boolean, default: true }
    }],
    
    additionalVideoContent: [{
        title: { type: String, required: true },
        videoUrl: { type: String, required: true },
        duration: { type: Number }, // in seconds
        thumbnail: { type: String }
    }],
    
    // Coach's Custom Terms
    customTermsAndConditions: {
        type: String,
        trim: true
    },
    
    customRefundPolicy: {
        type: String,
        trim: true
    },
    
    // Plan Status
    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'archived', 'deleted'],
        default: 'draft'
    },
    
    isPublic: {
        type: Boolean,
        default: false
    },
    
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    // Sales & Analytics
    totalSales: {
        type: Number,
        default: 0
    },
    
    totalRevenue: {
        type: Number,
        default: 0
    },
    
    viewCount: {
        type: Number,
        default: 0
    },
    
    // Coach's Custom Images
    coverImage: {
        type: String,
        trim: true
    },
    
    galleryImages: [{
        type: String,
        trim: true
    }],
    
    // SEO & Marketing
    seoTitle: {
        type: String,
        trim: true,
        maxlength: 60
    },
    
    seoDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    
    seoKeywords: [{
        type: String,
        trim: true
    }],
    
    // Commission Tracking
    commissionEarned: {
        type: Number,
        default: 0
    },
    
    platformCommissionPaid: {
        type: Number,
        default: 0
    },
    
    // Metadata
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    },
    
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
coachSellablePlanSchema.index({ coachId: 1, status: 1 });
coachSellablePlanSchema.index({ adminProductId: 1 });
coachSellablePlanSchema.index({ isPublic: 1, status: 1 });
coachSellablePlanSchema.index({ price: 1 });

// Update the updatedAt field on save
coachSellablePlanSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for discounted price
coachSellablePlanSchema.virtual('discountedPrice').get(function() {
    if (this.discountPercentage > 0) {
        return this.price - (this.price * this.discountPercentage / 100);
    }
    return this.price;
});

// Virtual for plan availability
coachSellablePlanSchema.virtual('isAvailable').get(function() {
    if (this.status !== 'active') return false;
    if (!this.isPublic) return false;
    return true;
});

// Virtual for net revenue (after platform commission)
coachSellablePlanSchema.virtual('netRevenue').get(function() {
    return this.totalRevenue - this.platformCommissionPaid;
});

module.exports = mongoose.models.CoachSellablePlan || mongoose.model('CoachSellablePlan', coachSellablePlanSchema);
