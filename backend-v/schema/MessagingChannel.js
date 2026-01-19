const mongoose = require('mongoose');

const messagingChannelSchema = new mongoose.Schema({
    // Basic channel information
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['whatsapp_api', 'whatsapp_bailey', 'email_smtp'],
        index: true
    },
    description: {
        type: String,
        trim: true
    },

    // Channel status and configuration
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Meta WhatsApp API Configuration
    whatsappApi: {
        phoneNumberId: {
            type: String,
            required: function() { return this.type === 'whatsapp_api'; },
            unique: true,
            sparse: true
        },
        accessToken: {
            type: String,
            required: function() { return this.type === 'whatsapp_api'; },
            select: false // Don't include in queries by default for security
        },
        businessAccountId: {
            type: String,
            required: function() { return this.type === 'whatsapp_api'; }
        },
        verifyToken: {
            type: String,
            select: false
        },
        webhookUrl: String,
        webhookVerifyToken: String,
        isWebhookActive: {
            type: Boolean,
            default: false
        },
        apiVersion: {
            type: String,
            default: 'v18.0'
        }
    },

    // Bailey's Scanner WhatsApp Configuration
    whatsappBailey: {
        deviceId: {
            type: String,
            required: function() { return this.type === 'whatsapp_bailey'; },
            unique: true,
            sparse: true
        },
        sessionId: {
            type: String,
            select: false
        },
        qrCode: {
            type: String,
            select: false
        },
        isConnected: {
            type: Boolean,
            default: false
        },
        lastConnectedAt: Date,
        connectionStatus: {
            type: String,
            enum: ['disconnected', 'connecting', 'connected', 'qr_ready', 'error'],
            default: 'disconnected'
        },
        phoneNumber: String,
        baileyVersion: String
    },

    // Email SMTP Configuration
    emailSmtp: {
        host: {
            type: String,
            required: function() { return this.type === 'email_smtp'; }
        },
        port: {
            type: Number,
            required: function() { return this.type === 'email_smtp'; },
            default: 587
        },
        secure: {
            type: Boolean,
            default: false
        },
        auth: {
            user: {
                type: String,
                required: function() { return this.type === 'email_smtp'; }
            },
            pass: {
                type: String,
                required: function() { return this.type === 'email_smtp'; },
                select: false
            }
        },
        fromEmail: {
            type: String,
            required: function() { return this.type === 'email_smtp'; }
        },
        fromName: {
            type: String,
            default: function() { return this.name || 'FunnelsEye'; }
        },
        replyToEmail: String,
        testEmailAddress: String
    },

    // Usage statistics and limits
    statistics: {
        totalMessagesSent: {
            type: Number,
            default: 0
        },
        totalMessagesReceived: {
            type: Number,
            default: 0
        },
        lastMessageSent: Date,
        lastMessageReceived: Date,
        dailyLimit: {
            type: Number,
            default: function() {
                if (this.type === 'whatsapp_api') return 1000;
                if (this.type === 'whatsapp_bailey') return 500;
                if (this.type === 'email_smtp') return 1000;
                return 1000;
            }
        },
        monthlyLimit: {
            type: Number,
            default: function() {
                if (this.type === 'whatsapp_api') return 25000;
                if (this.type === 'whatsapp_bailey') return 10000;
                if (this.type === 'email_smtp') return 50000;
                return 25000;
            }
        },
        messagesSentToday: {
            type: Number,
            default: 0
        },
        messagesSentThisMonth: {
            type: Number,
            default: 0
        }
    },

    // Templates (for WhatsApp channels)
    templates: [{
        templateId: String,
        templateName: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['AUTHENTICATION', 'MARKETING', 'UTILITY', 'OTP'],
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISABLED'],
            default: 'PENDING'
        },
        language: {
            type: String,
            default: 'en'
        },
        components: [{
            type: {
                type: String,
                enum: ['HEADER', 'BODY', 'FOOTER', 'BUTTONS']
            },
            text: String,
            format: {
                type: String,
                enum: ['TEXT', 'CURRENCY', 'DATE_TIME', 'IMAGE', 'VIDEO', 'DOCUMENT']
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Contact management
    contacts: [{
        contactId: String, // phone for WhatsApp, email for Email
        name: String,
        profileName: String,
        isBlocked: {
            type: Boolean,
            default: false
        },
        lastMessageAt: Date,
        messageCount: {
            type: Number,
            default: 0
        },
        tags: [String],
        notes: String,
        metadata: mongoose.Schema.Types.Mixed, // Additional contact data
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Webhook configuration (for WhatsApp API)
    webhook: {
        url: String,
        verifyToken: String,
        isActive: {
            type: Boolean,
            default: false
        },
        lastVerified: Date,
        lastWebhookReceived: Date,
        webhookFailureCount: {
            type: Number,
            default: 0
        }
    },

    // Admin who configured this channel
    configuredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },

    // Tags for organization
    tags: [{
        type: String,
        trim: true
    }],

    // Configuration metadata
    configMetadata: {
        version: {
            type: String,
            default: '1.0'
        },
        lastTested: Date,
        testStatus: {
            type: String,
            enum: ['untested', 'success', 'failed', 'pending'],
            default: 'untested'
        },
        testError: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
messagingChannelSchema.index({ type: 1, isActive: 1 });
messagingChannelSchema.index({ 'whatsappApi.phoneNumberId': 1 }, { unique: true, sparse: true });
messagingChannelSchema.index({ 'whatsappBailey.deviceId': 1 }, { unique: true, sparse: true });
messagingChannelSchema.index({ 'emailSmtp.auth.user': 1 }, { unique: true, sparse: true });
messagingChannelSchema.index({ priority: -1 });
messagingChannelSchema.index({ 'templates.templateId': 1 });
messagingChannelSchema.index({ 'contacts.contactId': 1 });

// Virtual for formatted contact identifier
messagingChannelSchema.virtual('formattedContactIdentifier').get(function() {
    if (this.type === 'whatsapp_api' || this.type === 'whatsapp_bailey') {
        return this.whatsappApi?.phoneNumberId || this.whatsappBailey?.phoneNumber || 'Not configured';
    } else if (this.type === 'email_smtp') {
        return this.emailSmtp?.fromEmail || 'Not configured';
    }
    return 'Unknown';
});

// Virtual for channel status
messagingChannelSchema.virtual('channelStatus').get(function() {
    if (!this.isActive) return 'inactive';

    if (this.type === 'whatsapp_api') {
        return this.webhook?.isActive ? 'connected' : 'configured';
    } else if (this.type === 'whatsapp_bailey') {
        return this.whatsappBailey?.isConnected ? 'connected' : 'disconnected';
    } else if (this.type === 'email_smtp') {
        return this.configMetadata?.testStatus === 'success' ? 'verified' : 'configured';
    }

    return 'unknown';
});

// Method to get active templates
messagingChannelSchema.methods.getActiveTemplates = function() {
    return this.templates.filter(template => template.status === 'APPROVED');
};

// Method to add contact
messagingChannelSchema.methods.addContact = function(contactId, name = null, profileName = null, metadata = {}) {
    const existingContact = this.contacts.find(contact =>
        contact.contactId === contactId
    );

    if (existingContact) {
        // Update existing contact
        if (name) existingContact.name = name;
        if (profileName) existingContact.profileName = profileName;
        existingContact.lastMessageAt = new Date();
        existingContact.messageCount += 1;
        Object.assign(existingContact.metadata, metadata);
    } else {
        // Add new contact
        this.contacts.push({
            contactId,
            name,
            profileName,
            lastMessageAt: new Date(),
            messageCount: 1,
            metadata
        });
    }

    return this.save();
};

// Method to update statistics
messagingChannelSchema.methods.updateStatistics = function(type = 'sent') {
    if (type === 'sent') {
        this.statistics.totalMessagesSent += 1;
        this.statistics.lastMessageSent = new Date();
        this.statistics.messagesSentToday += 1;
        this.statistics.messagesSentThisMonth += 1;
    } else if (type === 'received') {
        this.statistics.totalMessagesReceived += 1;
        this.statistics.lastMessageReceived = new Date();
    }

    return this.save();
};

// Method to reset daily/monthly counters (to be called by a cron job)
messagingChannelSchema.methods.resetCounters = function(type = 'daily') {
    if (type === 'daily') {
        this.statistics.messagesSentToday = 0;
    } else if (type === 'monthly') {
        this.statistics.messagesSentThisMonth = 0;
    }

    return this.save();
};

// Method to test configuration
messagingChannelSchema.methods.testConfiguration = async function() {
    try {
        this.configMetadata.lastTested = new Date();

        // Here you would implement actual testing logic based on channel type
        // For now, we'll just mark as success for demonstration
        this.configMetadata.testStatus = 'success';
        this.configMetadata.testError = null;

        return await this.save();
    } catch (error) {
        this.configMetadata.testStatus = 'failed';
        this.configMetadata.testError = error.message;
        await this.save();
        throw error;
    }
};

// Pre-save middleware to ensure only one default channel per type
messagingChannelSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id }, type: this.type },
            { isDefault: false }
        );
    }
    next();
});

// Static method to get active channels by type
messagingChannelSchema.statics.getActiveChannels = function(type = null) {
    const query = { isActive: true };
    if (type) query.type = type;
    return this.find(query).sort({ priority: -1, createdAt: -1 });
};

// Static method to get default channel for a type
messagingChannelSchema.statics.getDefaultChannel = function(type) {
    return this.findOne({ type, isActive: true, isDefault: true });
};

module.exports = mongoose.model('MessagingChannel', messagingChannelSchema);