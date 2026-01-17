const mongoose = require('mongoose');

const WhatsAppAIKnowledgeSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    
    // Knowledge Content
    businessInfo: {
        companyName: String,
        services: [String],
        products: [String],
        pricing: String,
        contactInfo: String,
        website: String,
        socialMedia: [String]
    },
    
    // AI Prompt Configuration
    systemPrompt: {
        type: String,
        required: true,
        maxlength: [2000, 'System prompt cannot exceed 2000 characters']
    },
    
    // Response Settings
    responseSettings: {
        maxLength: {
            type: Number,
            default: 150,
            min: 50,
            max: 300
        },
        tone: {
            type: String,
            enum: ['professional', 'friendly', 'casual', 'formal'],
            default: 'friendly'
        },
        includeEmojis: {
            type: Boolean,
            default: true
        },
        autoReplyEnabled: {
            type: Boolean,
            default: true
        }
    },
    
    // Business Hours
    businessHours: {
        enabled: {
            type: Boolean,
            default: true
        },
        timezone: {
            type: String,
            default: 'Asia/Kolkata'
        },
        schedule: [{
            day: {
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            },
            startTime: String, // Format: "09:00"
            endTime: String,   // Format: "18:00"
            isActive: {
                type: Boolean,
                default: true
            }
        }],
        afterHoursMessage: {
            type: String,
            default: "Thank you for your message! We're currently outside business hours. We'll get back to you soon."
        }
    },
    
    // Auto-Reply Rules
    autoReplyRules: [{
        trigger: {
            type: String,
            required: true
        },
        condition: {
            type: String,
            enum: ['contains', 'equals', 'starts_with', 'regex'],
            default: 'contains'
        },
        response: {
            type: String,
            required: true
        },
        priority: {
            type: Number,
            default: 1
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    
    // Status and Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    
    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    
    // Statistics
    stats: {
        totalReplies: {
            type: Number,
            default: 0
        },
        lastUsed: Date,
        successRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    }
}, {
    timestamps: true
});

// Indexes
WhatsAppAIKnowledgeSchema.index({ isActive: 1, isDefault: 1 });
WhatsAppAIKnowledgeSchema.index({ createdBy: 1 });

// Ensure only one default knowledge base
WhatsAppAIKnowledgeSchema.pre('save', async function(next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { $set: { isDefault: false } }
        );
    }
    next();
});

module.exports = mongoose.model('WhatsAppAIKnowledge', WhatsAppAIKnowledgeSchema);
