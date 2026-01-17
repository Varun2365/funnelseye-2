const mongoose = require('mongoose');

const coachPlanSchema = new mongoose.Schema({
    planId: {
        type: String,
        required: true,
        unique: true
    },
    
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Plan Details
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
    
    // Pricing
    price: {
        type: Number,
        required: true,
        min: 0
    },
    
    currency: {
        type: String,
        required: true,
        enum: ['USD', 'INR', 'EUR', 'GBP'],
        default: 'USD'
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
    
    // Plan Features
    features: [{
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        icon: { type: String, trim: true }
    }],
    
    // Plan Categories
    category: {
        type: String,
        required: true,
        enum: [
            'fitness_training',
            'nutrition_coaching',
            'weight_loss',
            'muscle_gain',
            'sports_performance',
            'wellness_coaching',
            'rehabilitation',
            'online_courses',
            'ebooks',
            'consultation',
            'other'
        ]
    },
    
    subcategory: {
        type: String,
        trim: true
    },
    
    tags: [{
        type: String,
        trim: true
    }],
    
    // Plan Duration & Access
    duration: {
        type: Number, // in days
        required: true,
        min: 1
    },
    
    durationType: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years', 'lifetime'],
        default: 'months'
    },
    
    accessType: {
        type: String,
        enum: ['instant', 'scheduled', 'manual'],
        default: 'instant'
    },
    
    scheduledReleaseDate: {
        type: Date
    },
    
    // Content & Delivery
    contentFiles: [{
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number }, // in bytes
        fileType: { type: String },
        isDownloadable: { type: Boolean, default: true }
    }],
    
    videoContent: [{
        title: { type: String, required: true },
        videoUrl: { type: String, required: true },
        duration: { type: Number }, // in seconds
        thumbnail: { type: String }
    }],
    
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
    
    // Images
    coverImage: {
        type: String,
        trim: true
    },
    
    galleryImages: [{
        type: String,
        trim: true
    }],
    
    // Terms & Conditions
    termsAndConditions: {
        type: String,
        trim: true
    },
    
    refundPolicy: {
        type: String,
        trim: true
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
coachPlanSchema.index({ category: 1, status: 1 });
coachPlanSchema.index({ price: 1 });
coachPlanSchema.index({ isPublic: 1, status: 1 });
coachPlanSchema.index({ isFeatured: 1, status: 1 });
coachPlanSchema.index({ tags: 1 });

// Update the updatedAt field on save
coachPlanSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for discounted price
coachPlanSchema.virtual('discountedPrice').get(function() {
    if (this.discountPercentage > 0) {
        return this.price - (this.price * this.discountPercentage / 100);
    }
    return this.price;
});

// Virtual for plan availability
coachPlanSchema.virtual('isAvailable').get(function() {
    if (this.status !== 'active') return false;
    if (this.accessType === 'scheduled' && this.scheduledReleaseDate > new Date()) return false;
    return true;
});

module.exports = mongoose.models.CoachPlan || mongoose.model('CoachPlan', coachPlanSchema);
