const mongoose = require('mongoose');

const adminProductSchema = new mongoose.Schema({
    // Product Details
    name: {
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
    
    // Product Categories
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
            'supplements',
            'equipment',
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
    
    // Product Type
    productType: {
        type: String,
        required: true,
        enum: ['digital', 'physical', 'service', 'subscription'],
        default: 'digital'
    },
    
    // Pricing Information (Base price - coaches can set their own prices)
    basePrice: {
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
    
    // Coach Pricing Rules
    pricingRules: {
        allowCustomPricing: {
            type: Boolean,
            default: true
        },
        minPrice: {
            type: Number,
            min: 0
        },
        maxPrice: {
            type: Number,
            min: 0
        },
        suggestedMarkup: {
            type: Number,
            min: 0,
            max: 1000, // percentage
            default: 0
        }
    },
    
    // Product Features
    features: [{
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        icon: { type: String, trim: true }
    }],
    
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
    
    // Physical Product Details (if applicable)
    physicalProduct: {
        weight: { type: Number }, // in grams
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number }
        },
        shippingClass: { type: String },
        requiresShipping: { type: Boolean, default: false }
    },
    
    // Service Details (if applicable)
    serviceDetails: {
        duration: { type: Number }, // in minutes
        durationType: { type: String, enum: ['minutes', 'hours', 'days'] },
        isRecurring: { type: Boolean, default: false },
        recurringInterval: { type: String, enum: ['weekly', 'monthly', 'yearly'] }
    },
    
    // Product Status
    status: {
        type: String,
        enum: ['draft', 'active', 'inactive', 'archived'],
        default: 'draft'
    },
    
    isAvailableForCoaches: {
        type: Boolean,
        default: true
    },
    
    // Inventory (for physical products)
    inventory: {
        trackInventory: { type: Boolean, default: false },
        stockQuantity: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 10 },
        allowBackorder: { type: Boolean, default: false }
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
    
    // Commission Settings
    commissionSettings: {
        platformCommissionPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 10
        },
        coachCommissionPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 80
        }
    },
    
    // Analytics
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
    
    // Metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    
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
adminProductSchema.index({ category: 1, status: 1 });
adminProductSchema.index({ productType: 1, status: 1 });
adminProductSchema.index({ isAvailableForCoaches: 1, status: 1 });
adminProductSchema.index({ tags: 1 });
adminProductSchema.index({ basePrice: 1 });

// Update the updatedAt field on save
adminProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for product availability
adminProductSchema.virtual('isAvailable').get(function() {
    if (this.status !== 'active') return false;
    if (!this.isAvailableForCoaches) return false;
    if (this.inventory.trackInventory && this.inventory.stockQuantity <= 0) return false;
    return true;
});

// Virtual for coach pricing info
adminProductSchema.virtual('coachPricingInfo').get(function() {
    return {
        basePrice: this.basePrice,
        currency: this.currency,
        allowCustomPricing: this.pricingRules.allowCustomPricing,
        minPrice: this.pricingRules.minPrice,
        maxPrice: this.pricingRules.maxPrice,
        suggestedMarkup: this.pricingRules.suggestedMarkup
    };
});

module.exports = mongoose.models.AdminProduct || mongoose.model('AdminProduct', adminProductSchema);
