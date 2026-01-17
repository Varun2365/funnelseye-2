const mongoose = require('mongoose');

const LeadMagnetInteractionSchema = new mongoose.Schema({
    // Identification
    interactionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    
    // Coach and Lead Information
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        index: true
    },
    
    // Lead Magnet Details
    magnetType: {
        type: String,
        enum: [
            'ai_diet_planner',
            'bmi_calculator', 
            'fitness_ebook',
            'meal_planner',
            'workout_calculator',
            'progress_tracker',
            'sleep_analyzer',
            'stress_assessment'
        ],
        required: true,
        index: true
    },
    magnetName: {
        type: String,
        required: true
    },
    
    // User Information (for tracking)
    userInfo: {
        name: String,
        email: String,
        phone: String,
        ipAddress: String,
        userAgent: String,
        referrer: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String,
        utmTerm: String,
        utmContent: String
    },
    
    // Interaction Data
    interactionData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    
    // Results Generated
    results: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    
    // Tracking Information
    sessionId: {
        type: String,
        index: true
    },
    pageViews: {
        type: Number,
        default: 1
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    },
    
    // Conversion Tracking
    conversion: {
        status: {
            type: String,
            enum: ['viewed', 'interacted', 'converted', 'lead_created'],
            default: 'viewed'
        },
        convertedAt: Date,
        leadCreatedAt: Date,
        conversionValue: {
            type: Number,
            default: 0
        }
    },
    
    // Engagement Metrics
    engagement: {
        formSubmissions: {
            type: Number,
            default: 0
        },
        downloads: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        returnVisits: {
            type: Number,
            default: 0
        }
    },
    
    // Device and Location Info
    deviceInfo: {
        device: String,
        browser: String,
        os: String,
        screenResolution: String,
        language: String,
        timezone: String
    },
    
    locationInfo: {
        country: String,
        region: String,
        city: String,
        latitude: Number,
        longitude: Number
    },
    
    // Status and Metadata
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned', 'converted'],
        default: 'active'
    },
    
    // Timestamps
    firstVisitAt: {
        type: Date,
        default: Date.now
    },
    lastVisitAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    
    // Additional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better performance
LeadMagnetInteractionSchema.index({ coachId: 1, magnetType: 1, createdAt: -1 });
LeadMagnetInteractionSchema.index({ 'conversion.status': 1 });
LeadMagnetInteractionSchema.index({ 'userInfo.email': 1 });
LeadMagnetInteractionSchema.index({ 'userInfo.ipAddress': 1 });

// Virtual for interaction URL
LeadMagnetInteractionSchema.virtual('interactionUrl').get(function() {
    return `/lead-magnets/${this.magnetType}/${this.interactionId}`;
});

// Method to update engagement
LeadMagnetInteractionSchema.methods.updateEngagement = function(action, data = {}) {
    switch(action) {
        case 'page_view':
            this.pageViews += 1;
            this.lastVisitAt = new Date();
            break;
        case 'form_submit':
            this.engagement.formSubmissions += 1;
            break;
        case 'download':
            this.engagement.downloads += 1;
            break;
        case 'share':
            this.engagement.shares += 1;
            break;
        case 'return_visit':
            this.engagement.returnVisits += 1;
            this.lastVisitAt = new Date();
            break;
        case 'time_spent':
            this.timeSpent += data.seconds || 0;
            break;
        case 'conversion':
            this.conversion.status = 'converted';
            this.conversion.convertedAt = new Date();
            this.status = 'converted';
            break;
        case 'lead_created':
            this.conversion.status = 'lead_created';
            this.conversion.leadCreatedAt = new Date();
            this.status = 'converted';
            break;
    }
    
    return this.save();
};

// Static method to get analytics
LeadMagnetInteractionSchema.statics.getAnalytics = async function(coachId, timeRange = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    
    const analytics = await this.aggregate([
        {
            $match: {
                coachId: mongoose.Types.ObjectId(coachId),
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$magnetType',
                totalInteractions: { $sum: 1 },
                totalPageViews: { $sum: '$pageViews' },
                totalTimeSpent: { $sum: '$timeSpent' },
                conversions: {
                    $sum: {
                        $cond: [
                            { $in: ['$conversion.status', ['converted', 'lead_created']] },
                            1,
                            0
                        ]
                    }
                },
                formSubmissions: { $sum: '$engagement.formSubmissions' },
                downloads: { $sum: '$engagement.downloads' },
                shares: { $sum: '$engagement.shares' },
                avgTimeSpent: { $avg: '$timeSpent' },
                avgPageViews: { $avg: '$pageViews' }
            }
        },
        {
            $sort: { totalInteractions: -1 }
        }
    ]);
    
    return analytics;
};

module.exports = mongoose.model('LeadMagnetInteraction', LeadMagnetInteractionSchema);
