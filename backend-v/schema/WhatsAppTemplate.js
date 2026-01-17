const mongoose = require('mongoose');

const whatsAppTemplateSchema = new mongoose.Schema({
    coachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['greeting', 'appointment', 'reminder', 'followup', 'marketing', 'support', 'custom'],
        default: 'custom'
    },
    language: {
        type: String,
        default: 'en_US',
        trim: true
    },
    variables: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['text', 'number', 'date', 'phone', 'email'],
            default: 'text'
        },
        defaultValue: {
            type: String,
            trim: true
        },
        required: {
            type: Boolean,
            default: false
        }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date,
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
whatsAppTemplateSchema.index({ coachId: 1, status: 1 });
whatsAppTemplateSchema.index({ coachId: 1, category: 1 });
whatsAppTemplateSchema.index({ name: 1, coachId: 1 }, { unique: true });

// Virtual for template preview
whatsAppTemplateSchema.virtual('preview').get(function() {
    let preview = this.content;
    
    // Replace variables with placeholder values
    this.variables.forEach(variable => {
        const placeholder = variable.defaultValue || `{${variable.name}}`;
        preview = preview.replace(new RegExp(`{${variable.name}}`, 'g'), placeholder);
    });
    
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
});

// Method to increment usage count
whatsAppTemplateSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    this.lastUsed = new Date();
    return this.save();
};

// Method to get template with variables replaced
whatsAppTemplateSchema.methods.getTemplateWithVariables = function(variables = {}) {
    let content = this.content;
    
    this.variables.forEach(variable => {
        const value = variables[variable.name] || variable.defaultValue || `{${variable.name}}`;
        content = content.replace(new RegExp(`{${variable.name}}`, 'g'), value);
    });
    
    return content;
};

// Static method to get templates by category
whatsAppTemplateSchema.statics.getByCategory = function(coachId, category) {
    return this.find({ coachId, category, status: 'active' }).sort({ usageCount: -1 });
};

// Static method to get most used templates
whatsAppTemplateSchema.statics.getMostUsed = function(coachId, limit = 10) {
    return this.find({ coachId, status: 'active' })
        .sort({ usageCount: -1, lastUsed: -1 })
        .limit(limit);
};

module.exports = mongoose.model('WhatsAppTemplate', whatsAppTemplateSchema);
