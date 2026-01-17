const mongoose = require('mongoose');

const centralWhatsAppSchema = new mongoose.Schema({
    // Meta API Configuration (Only Required Fields)
    phoneNumberId: {
        type: String,
        required: true,
        unique: true
    },
    accessToken: {
        type: String,
        required: true,
        select: false // Don't include in queries by default for security
    },
    businessAccountId: {
        type: String,
        required: true
    },
    
    // Configuration
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: true
    },
    
    // Template Management
    templates: [{
        templateId: {
            type: String,
            required: true
        },
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
                enum: ['TEXT', 'CURRENCY', 'DATE_TIME']
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        },
        approvedAt: Date
    }],
    
    // Contact Management
    contacts: [{
        phoneNumber: {
            type: String,
            required: true
        },
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
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Usage Statistics
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
            default: 1000
        },
        monthlyLimit: {
            type: Number,
            default: 25000
        }
    },
    
    // Webhook Configuration
    webhook: {
        url: String,
        verifyToken: String,
        isActive: {
            type: Boolean,
            default: false
        },
        lastVerified: Date
    },
    
    // Admin who configured this
    configuredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    
    // Timestamps
    lastSyncAt: Date,
    lastHealthCheck: Date
}, {
    timestamps: true
});

// Indexes
centralWhatsAppSchema.index({ isActive: 1 });
centralWhatsAppSchema.index({ 'templates.templateId': 1 });
centralWhatsAppSchema.index({ 'contacts.phoneNumber': 1 });

// Ensure only one default central WhatsApp
centralWhatsAppSchema.pre('save', async function(next) {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

// Virtual for formatted phone number (using phoneNumberId)
centralWhatsAppSchema.virtual('formattedPhoneNumber').get(function() {
    return this.phoneNumberId;
});

// Method to get active templates
centralWhatsAppSchema.methods.getActiveTemplates = function() {
    return this.templates.filter(template => template.status === 'APPROVED');
};

// Method to get template by name
centralWhatsAppSchema.methods.getTemplateByName = function(templateName) {
    if (!templateName) return null;
    const searchName = templateName.toLowerCase().trim();
    
    // Search by templateName or name (case-insensitive)
    return this.templates.find(template => {
        const tName = (template.templateName || template.name || '').toLowerCase().trim();
        return tName === searchName && template.status === 'APPROVED';
    });
};

// Method to get template by name (including non-approved for admin)
centralWhatsAppSchema.methods.getTemplateByNameAny = function(templateName) {
    if (!templateName) return null;
    const searchName = templateName.toLowerCase().trim();
    
    // Search by templateName or name (case-insensitive)
    return this.templates.find(template => {
        const tName = (template.templateName || template.name || '').toLowerCase().trim();
        return tName === searchName;
    });
};

// Method to add contact
centralWhatsAppSchema.methods.addContact = function(phoneNumber, name = null, profileName = null) {
    const existingContact = this.contacts.find(contact => 
        contact.phoneNumber === phoneNumber
    );
    
    if (existingContact) {
        // Update existing contact
        if (name) existingContact.name = name;
        if (profileName) existingContact.profileName = profileName;
        existingContact.lastMessageAt = new Date();
        existingContact.messageCount += 1;
    } else {
        // Add new contact
        this.contacts.push({
            phoneNumber,
            name,
            profileName,
            lastMessageAt: new Date(),
            messageCount: 1
        });
    }
    
    return this.save();
};

// Method to update statistics
centralWhatsAppSchema.methods.updateStatistics = function(type = 'sent') {
    if (type === 'sent') {
        this.statistics.totalMessagesSent += 1;
        this.statistics.lastMessageSent = new Date();
    } else if (type === 'received') {
        this.statistics.totalMessagesReceived += 1;
        this.statistics.lastMessageReceived = new Date();
    }
    
    return this.save();
};

module.exports = mongoose.model('CentralWhatsApp', centralWhatsAppSchema);
