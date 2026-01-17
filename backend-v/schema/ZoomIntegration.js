const mongoose = require('mongoose');

const zoomIntegrationSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Zoom OAuth credentials (for Server-to-Server OAuth apps) - Optional for OAuth 2.0 flow
    clientId: {
        type: String,
        required: false,
        trim: true
    },
    
    clientSecret: {
        type: String,
        required: false,
        trim: true
    },
    
    // OAuth tokens (for server-to-server apps)
    accessToken: {
        type: String,
        trim: true
    },
    
    refreshToken: {
        type: String,
        trim: true
    },
    
    tokenExpiresAt: Date,
    
    // Token generation timestamp
    tokenGeneratedAt: Date,
    
    // Zoom account information
    zoomAccountId: {
        type: String,
        trim: true
    },
    
    zoomEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    
    // Meeting settings and defaults
    meetingSettings: {
        // Default meeting duration in minutes
        defaultDuration: {
            type: Number,
            default: 60,
            min: 15,
            max: 480
        },
        
        // Default meeting type
        defaultType: {
            type: String,
            enum: ['instant', 'scheduled', 'recurring'],
            default: 'scheduled'
        },
        
        // Default meeting settings
        settings: {
            hostVideo: {
                type: Boolean,
                default: true
            },
            participantVideo: {
                type: Boolean,
                default: true
            },
            joinBeforeHost: {
                type: Boolean,
                default: false
            },
            muteUponEntry: {
                type: Boolean,
                default: true
            },
            watermark: {
                type: Boolean,
                default: false
            },
            usePersonalMeetingId: {
                type: Boolean,
                default: false
            },
            waitingRoom: {
                type: Boolean,
                default: true
            },
            autoRecording: {
                type: String,
                enum: ['none', 'local', 'cloud'],
                default: 'none'
            }
        },
        
        // Custom meeting templates
        templates: [{
            name: String,
            description: String,
            duration: Number,
            settings: mongoose.Schema.Types.Mixed,
            isDefault: Boolean
        }]
    },
    
    // Integration status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Last sync status
    lastSync: {
        timestamp: Date,
        status: {
            type: String,
            enum: ['success', 'failed', 'pending'],
            default: 'pending'
        },
        error: String
    },
    
    // Usage statistics
    usageStats: {
        totalMeetings: {
            type: Number,
            default: 0
        },
        totalParticipants: {
            type: Number,
            default: 0
        },
        totalDuration: {
            type: Number,
            default: 0
        },
        lastMeetingCreated: Date
    },
    
    // Webhook configuration
    webhooks: {
        enabled: {
            type: Boolean,
            default: false
        },
        url: String,
        secret: String,
        events: [String] // meeting.created, meeting.updated, etc.
    }
}, {
    timestamps: true
});

// Indexes
zoomIntegrationSchema.index({ coachId: 1, isActive: 1 });
zoomIntegrationSchema.index({ zoomAccountId: 1 });

// Pre-save middleware to encrypt sensitive data
zoomIntegrationSchema.pre('save', function(next) {
    // In production, you should encrypt apiKey and apiSecret
    // For now, we'll store them as-is (implement encryption later)
    next();
});

// Method to check if integration is valid
zoomIntegrationSchema.methods.isValid = function() {
    // Support both OAuth 2.0 (accessToken) and Server-to-Server (clientId/clientSecret)
    return this.isActive && (
        (this.accessToken && (!this.tokenExpiresAt || new Date() < this.tokenExpiresAt)) ||
        (this.clientId && this.clientSecret)
    );
};

// Method to check if token needs refresh
zoomIntegrationSchema.methods.needsTokenRefresh = function() {
    if (!this.tokenExpiresAt) return false;
    // Refresh token if it expires in the next 5 minutes
    return new Date() > new Date(this.tokenExpiresAt.getTime() - 5 * 60 * 1000);
};

// Method to get default meeting settings
zoomIntegrationSchema.methods.getDefaultMeetingSettings = function() {
    const defaultTemplate = this.meetingSettings.templates.find(t => t.isDefault);
    
    if (defaultTemplate) {
        return {
            ...this.meetingSettings.settings,
            ...defaultTemplate.settings,
            duration: defaultTemplate.duration
        };
    }
    
    return {
        ...this.meetingSettings.settings,
        duration: this.meetingSettings.defaultDuration
    };
};

// Method to create meeting template
zoomIntegrationSchema.methods.createMeetingTemplate = function(templateData) {
    const template = {
        name: templateData.name,
        description: templateData.description,
        duration: templateData.duration || this.meetingSettings.defaultDuration,
        settings: templateData.settings || {},
        isDefault: templateData.isDefault || false
    };
    
    // If this is set as default, unset others
    if (template.isDefault) {
        this.meetingSettings.templates.forEach(t => t.isDefault = false);
    }
    
    this.meetingSettings.templates.push(template);
    return this.save();
};

// Method to update usage statistics
zoomIntegrationSchema.methods.updateUsageStats = function(meetingData) {
    this.usageStats.totalMeetings += 1;
    this.usageStats.totalParticipants += meetingData.participants || 0;
    this.usageStats.totalDuration += meetingData.duration || 0;
    this.usageStats.lastMeetingCreated = new Date();
    
    return this.save();
};

module.exports = mongoose.model('ZoomIntegration', zoomIntegrationSchema);
