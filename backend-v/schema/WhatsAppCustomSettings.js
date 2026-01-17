const mongoose = require('mongoose');

const WhatsAppCustomSettingsSchema = new mongoose.Schema({
    // Owner Information
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    ownerType: {
        type: String,
        enum: ['admin', 'coach'],
        required: true,
        index: true
    },
    
    // Settings Name and Description
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    
    // Inheritance Settings
    inheritance: {
        enabled: {
            type: Boolean,
            default: false
        },
        inheritFrom: {
            type: String,
            enum: ['admin', 'parent_coach'],
            default: 'admin'
        },
        customizations: [{
            field: String, // Which field is customized
            value: mongoose.Schema.Types.Mixed, // Custom value
            overridden: {
                type: Boolean,
                default: true
            }
        }]
    },
    
    // AI Knowledge Base Settings
    aiKnowledge: {
        useDefault: {
            type: Boolean,
            default: true
        },
        customKnowledgeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WhatsAppAIKnowledge'
        },
        customizations: {
            systemPrompt: String,
            businessInfo: {
                companyName: String,
                services: [String],
                products: [String],
                pricing: String,
                contactInfo: String,
                website: String,
                socialMedia: [String]
            },
            responseSettings: {
                maxLength: {
                    type: Number,
                    min: 50,
                    max: 500,
                    default: 150
                },
                tone: {
                    type: String,
                    enum: ['professional', 'friendly', 'casual', 'formal', 'enthusiastic'],
                    default: 'friendly'
                },
                includeEmojis: {
                    type: Boolean,
                    default: true
                },
                autoReplyEnabled: {
                    type: Boolean,
                    default: true
                },
                responseDelay: {
                    type: Number,
                    min: 0,
                    max: 300, // 5 minutes max delay
                    default: 0
                }
            }
        }
    },
    
    // Business Hours Settings
    businessHours: {
        useDefault: {
            type: Boolean,
            default: true
        },
        customSchedule: {
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
                },
                breakTimes: [{
                    startTime: String,
                    endTime: String,
                    label: String
                }]
            }],
            holidays: [{
                date: Date,
                name: String,
                isActive: {
                    type: Boolean,
                    default: false
                }
            }],
            afterHoursMessage: {
                type: String,
                default: "Thank you for your message! We're currently outside business hours. We'll get back to you soon."
            },
            holidayMessage: {
                type: String,
                default: "Thank you for your message! We're currently on holiday. We'll get back to you when we return."
            }
        }
    },
    
    // Auto-Reply Rules Settings
    autoReplyRules: {
        useDefault: {
            type: Boolean,
            default: true
        },
        customRules: [{
            name: String,
            trigger: {
                type: String,
                required: true
            },
            condition: {
                type: String,
                enum: ['contains', 'equals', 'starts_with', 'ends_with', 'regex', 'not_contains'],
                default: 'contains'
            },
            response: {
                type: String,
                required: true
            },
            priority: {
                type: Number,
                default: 1,
                min: 1,
                max: 100
            },
            isActive: {
                type: Boolean,
                default: true
            },
            conditions: [{
                field: String, // sender, message_type, time, etc.
                operator: String, // equals, contains, greater_than, etc.
                value: mongoose.Schema.Types.Mixed
            }],
            cooldownPeriod: {
                type: Number, // minutes
                default: 0
            },
            maxUsesPerDay: {
                type: Number,
                default: 0 // 0 = unlimited
            }
        }]
    },
    
    // Message Filtering Settings
    messageFiltering: {
        enabled: {
            type: Boolean,
            default: false
        },
        filters: [{
            name: String,
            type: {
                type: String,
                enum: ['sender', 'content', 'time', 'frequency', 'message_type']
            },
            conditions: [{
                field: String,
                operator: String,
                value: mongoose.Schema.Types.Mixed
            }],
            action: {
                type: String,
                enum: ['auto_reply', 'assign', 'escalate', 'ignore', 'archive'],
                default: 'auto_reply'
            },
            isActive: {
                type: Boolean,
                default: true
            }
        }]
    },
    
    // Notification Settings
    notifications: {
        enabled: {
            type: Boolean,
            default: true
        },
        channels: [{
            type: {
                type: String,
                enum: ['email', 'sms', 'push', 'webhook']
            },
            config: mongoose.Schema.Types.Mixed,
            triggers: [{
                event: {
                    type: String,
                    enum: ['new_message', 'urgent_message', 'ai_failed', 'after_hours', 'holiday']
                },
                enabled: {
                    type: Boolean,
                    default: true
                }
            }]
        }],
        escalation: {
            enabled: {
                type: Boolean,
                default: false
            },
            rules: [{
                condition: String,
                escalateTo: mongoose.Schema.Types.ObjectId,
                timeDelay: Number, // minutes
                isActive: Boolean
            }]
        }
    },
    
    // Analytics and Reporting Settings
    analytics: {
        enabled: {
            type: Boolean,
            default: true
        },
        tracking: {
            responseTime: {
                type: Boolean,
                default: true
            },
            aiPerformance: {
                type: Boolean,
                default: true
            },
            userSatisfaction: {
                type: Boolean,
                default: false
            },
            conversionTracking: {
                type: Boolean,
                default: false
            }
        },
        reporting: {
            frequency: {
                type: String,
                enum: ['daily', 'weekly', 'monthly'],
                default: 'weekly'
            },
            recipients: [mongoose.Schema.Types.ObjectId],
            includeCharts: {
                type: Boolean,
                default: true
            }
        }
    },
    
    // Integration Settings
    integrations: {
        crm: {
            enabled: {
                type: Boolean,
                default: false
            },
            provider: String,
            config: mongoose.Schema.Types.Mixed
        },
        calendar: {
            enabled: {
                type: Boolean,
                default: false
            },
            provider: String,
            config: mongoose.Schema.Types.Mixed
        },
        payment: {
            enabled: {
                type: Boolean,
                default: false
            },
            provider: String,
            config: mongoose.Schema.Types.Mixed
        }
    },
    
    // Advanced Settings
    advanced: {
        messageRetention: {
            days: {
                type: Number,
                default: 90,
                min: 1,
                max: 365
            },
            autoArchive: {
                type: Boolean,
                default: true
            }
        },
        spamProtection: {
            enabled: {
                type: Boolean,
                default: true
            },
            maxMessagesPerHour: {
                type: Number,
                default: 10
            },
            blacklistedWords: [String],
            whitelistedContacts: [String]
        },
        aiOptimization: {
            enabled: {
                type: Boolean,
                default: true
            },
            learningEnabled: {
                type: Boolean,
                default: false
            },
            responseVariation: {
                type: Number,
                min: 0,
                max: 100,
                default: 20
            }
        }
    },
    
    // Status and Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    
    // Version Control
    version: {
        type: Number,
        default: 1
    },
    parentVersion: {
        type: Number,
        default: 0
    },
    
    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Statistics
    stats: {
        totalMessages: {
            type: Number,
            default: 0
        },
        aiReplies: {
            type: Number,
            default: 0
        },
        lastUsed: Date,
        performanceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
WhatsAppCustomSettingsSchema.index({ ownerId: 1, ownerType: 1 });
WhatsAppCustomSettingsSchema.index({ isActive: 1, isDefault: 1 });
WhatsAppCustomSettingsSchema.index({ 'inheritance.enabled': 1 });

// Ensure only one default per owner
WhatsAppCustomSettingsSchema.pre('save', async function(next) {
    if (this.isDefault && this.isModified('isDefault')) {
        await this.constructor.updateMany(
            { 
                _id: { $ne: this._id },
                ownerId: this.ownerId,
                ownerType: this.ownerType
            },
            { $set: { isDefault: false } }
        );
    }
    next();
});

// Method to get effective settings (with inheritance)
WhatsAppCustomSettingsSchema.methods.getEffectiveSettings = function(parentSettings) {
    if (!this.inheritance.enabled || !parentSettings) {
        return this;
    }
    
    const effectiveSettings = this.toObject();
    
    // Apply inheritance for each customized field
    this.inheritance.customizations.forEach(customization => {
        if (customization.overridden && parentSettings[customization.field]) {
            effectiveSettings[customization.field] = customization.value;
        }
    });
    
    return effectiveSettings;
};

// Method to check if field is customized
WhatsAppCustomSettingsSchema.methods.isFieldCustomized = function(fieldPath) {
    return this.inheritance.customizations.some(
        customization => customization.field === fieldPath && customization.overridden
    );
};

// Method to add customization
WhatsAppCustomSettingsSchema.methods.addCustomization = function(fieldPath, value) {
    const existingIndex = this.inheritance.customizations.findIndex(
        c => c.field === fieldPath
    );
    
    if (existingIndex >= 0) {
        this.inheritance.customizations[existingIndex].value = value;
        this.inheritance.customizations[existingIndex].overridden = true;
    } else {
        this.inheritance.customizations.push({
            field: fieldPath,
            value: value,
            overridden: true
        });
    }
    
    return this.save();
};

// Method to remove customization
WhatsAppCustomSettingsSchema.methods.removeCustomization = function(fieldPath) {
    this.inheritance.customizations = this.inheritance.customizations.filter(
        c => c.field !== fieldPath
    );
    
    return this.save();
};

module.exports = mongoose.model('WhatsAppCustomSettings', WhatsAppCustomSettingsSchema);
