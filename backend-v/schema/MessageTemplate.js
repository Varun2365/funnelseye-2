const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    name: {
        type: String,
        required: true,
        trim: true
    },
    
    description: {
        type: String,
        trim: true
    },
    
    // Template type: whatsapp, email, sms, or universal
                    type: {
                    type: String,
                    enum: ['whatsapp', 'email', 'universal'],
                    required: true,
                    default: 'universal'
                },
    
    // Template category for organization
    category: {
        type: String,
        enum: ['welcome', 'follow_up', 'appointment', 'reminder', 'marketing', 'support', 'custom'],
        required: true,
        default: 'custom'
    },
    
    // Template content with variable placeholders
    content: {
        subject: {
            type: String,
            trim: true,
            required: function() { return this.type === 'email'; }
        },
        body: {
            type: String,
            required: true,
            trim: true
        },
        // For WhatsApp: quick replies, buttons, etc.
        whatsappOptions: {
            quickReplies: [String],
            buttons: [{
                text: String,
                action: String,
                url: String
            }],
            mediaUrl: String,
            mediaType: {
                type: String,
                enum: ['image', 'video', 'document', 'audio']
            }
        },
        // For Email: HTML version, plain text fallback
        emailOptions: {
            htmlBody: String,
            plainTextBody: String,
            attachments: [{
                filename: String,
                url: String,
                contentType: String
            }]
        }
    },
    
    // Available variables that can be used in this template
    availableVariables: [{
        name: String,
        description: String,
        example: String,
        required: Boolean
    }],
    
    // Template variables with default values
    variables: {
        type: Map,
        of: String,
        default: new Map()
    },
    
    // Template status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Is this a pre-built template (system) or coach-created
    isPreBuilt: {
        type: Boolean,
        default: false
    },
    
    // Template usage statistics
    usageStats: {
        totalUses: {
            type: Number,
            default: 0
        },
        lastUsed: Date,
        successRate: {
            type: Number,
            default: 100,
            min: 0,
            max: 100
        }
    },
    
    // Tags for easy searching and organization
    tags: [String],
    
    // Template versioning
    version: {
        type: Number,
        default: 1
    },
    
    // Previous versions for rollback
    previousVersions: [{
        version: Number,
        content: mongoose.Schema.Types.Mixed,
        updatedAt: Date,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coach'
        }
    }]
}, {
    timestamps: true
});

// Indexes for better performance
messageTemplateSchema.index({ coachId: 1, type: 1, category: 1 });
messageTemplateSchema.index({ coachId: 1, isActive: 1 });
messageTemplateSchema.index({ isPreBuilt: 1, type: 1, category: 1 });

// Pre-save middleware to handle versioning
messageTemplateSchema.pre('save', function(next) {
    if (this.isModified('content') && !this.isNew) {
        // Store previous version
        const previousVersion = {
            version: this.version,
            content: this.content,
            updatedAt: new Date(),
            updatedBy: this.coachId
        };
        
        this.previousVersions.push(previousVersion);
        this.version += 1;
    }
    next();
});

// Method to render template with variables
messageTemplateSchema.methods.renderTemplate = function(variables = {}) {
    let renderedContent = { ...this.content };
    
    // Replace variables in body
    if (renderedContent.body) {
        renderedContent.body = this.replaceVariables(renderedContent.body, variables);
    }
    
    // Replace variables in subject (for emails)
    if (renderedContent.subject) {
        renderedContent.subject = this.replaceVariables(renderedContent.subject, variables);
    }
    
    // Replace variables in WhatsApp options
    if (renderedContent.whatsappOptions) {
        if (renderedContent.whatsappOptions.quickReplies) {
            renderedContent.whatsappOptions.quickReplies = renderedContent.whatsappOptions.quickReplies.map(
                reply => this.replaceVariables(reply, variables)
            );
        }
        
        if (renderedContent.whatsappOptions.buttons) {
            renderedContent.whatsappOptions.buttons = renderedContent.whatsappOptions.buttons.map(button => ({
                ...button,
                text: this.replaceVariables(button.text, variables),
                url: button.url ? this.replaceVariables(button.url, variables) : undefined
            }));
        }
    }
    
    return renderedContent;
};

// Method to replace template variables
messageTemplateSchema.methods.replaceVariables = function(text, variables) {
    let result = text;
    
    // Replace {{variable}} placeholders
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(`{{${key}}}`, 'gi');
        result = result.replace(placeholder, value || '');
    }
    
    // Replace default variables if not provided
    for (const [key, value] of this.variables) {
        if (!variables[key]) {
            const placeholder = new RegExp(`{{${key}}}`, 'gi');
            result = result.replace(placeholder, value || '');
        }
    }
    
    return result;
};

// Method to validate required variables
messageTemplateSchema.methods.validateVariables = function(variables = {}) {
    const missingVariables = [];
    
    for (const variable of this.availableVariables) {
        if (variable.required && !variables[variable.name] && !this.variables.has(variable.name)) {
            missingVariables.push(variable.name);
        }
    }
    
    return {
        isValid: missingVariables.length === 0,
        missingVariables
    };
};

// Static method to get pre-built templates
messageTemplateSchema.statics.getPreBuiltTemplates = function(type = null, category = null) {
    const query = { isPreBuilt: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    return this.find(query).sort({ category: 1, name: 1 });
};

// Static method to duplicate a template
messageTemplateSchema.statics.duplicateTemplate = function(templateId, coachId, newName) {
    return this.findById(templateId).then(template => {
        if (!template) throw new Error('Template not found');
        
        const duplicatedTemplate = new this({
            ...template.toObject(),
            _id: undefined,
            coachId: coachId,
            name: newName || `${template.name} (Copy)`,
            isPreBuilt: false,
            usageStats: {
                totalUses: 0,
                lastUsed: null,
                successRate: 100
            },
            previousVersions: [],
            version: 1
        });
        
        return duplicatedTemplate.save();
    });
};

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
