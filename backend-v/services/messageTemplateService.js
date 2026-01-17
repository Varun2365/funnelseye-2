const MessageTemplate = require('../schema/MessageTemplate');

/**
 * Message Template Service
 * Handles template management, rendering, and integration with messaging systems
 */
class MessageTemplateService {
    constructor() {
        this.preBuiltTemplates = this.initializePreBuiltTemplates();
    }

    /**
     * Initialize pre-built templates for coaches to use as starting points
     */
    initializePreBuiltTemplates() {
        return [
            {
                name: 'Welcome Message',
                description: 'Friendly welcome message for new leads',
                type: 'whatsapp',
                category: 'welcome',
                content: {
                    body: 'Hi {{lead.name}}! 👋 Welcome to our fitness community! I\'m {{coach.name}}, your personal transformation coach.',
                    whatsappOptions: {
                        quickReplies: ['Tell me about your programs', 'I want to get started', 'I have questions']
                    }
                },
                availableVariables: [
                    { name: 'lead.name', description: 'Lead\'s first name', example: 'John', required: true },
                    { name: 'coach.name', description: 'Coach\'s name', example: 'Sarah', required: true }
                ],
                isPreBuilt: true
            }
        ];
    }

    /**
     * Create a new message template
     */
    async createTemplate(templateData) {
        try {
            const template = new MessageTemplate(templateData);
            await template.save();
            return template;
        } catch (error) {
            console.error(`[MessageTemplateService] Error creating template:`, error);
            throw error;
        }
    }

    /**
     * Get all templates for a coach
     */
    async getCoachTemplates(coachId, filters = {}) {
        try {
            const query = { coachId };
            if (filters.type) query.type = filters.type;
            if (filters.category) query.category = filters.category;
            
            return await MessageTemplate.find(query).sort({ category: 1, name: 1 });
        } catch (error) {
            console.error(`[MessageTemplateService] Error getting coach templates:`, error);
            throw error;
        }
    }

    /**
     * Get pre-built templates
     */
    async getPreBuiltTemplates(type = null, category = null) {
        try {
            const query = { isPreBuilt: true };
            if (type) query.type = type;
            if (category) query.category = category;
            
            return await MessageTemplate.find(query).sort({ category: 1, name: 1 });
        } catch (error) {
            console.error(`[MessageTemplateService] Error getting pre-built templates:`, error);
            throw error;
        }
    }

    /**
     * Get a specific template by ID
     */
    async getTemplateById(templateId, coachId) {
        try {
            const template = await MessageTemplate.findById(templateId);
            if (!template) throw new Error('Template not found');
            
            if (!template.isPreBuilt && template.coachId.toString() !== coachId.toString()) {
                throw new Error('Access denied');
            }
            
            return template;
        } catch (error) {
            console.error(`[MessageTemplateService] Error getting template:`, error);
            throw error;
        }
    }

    /**
     * Update an existing template
     */
    async updateTemplate(templateId, coachId, updates) {
        try {
            const template = await this.getTemplateById(templateId, coachId);
            if (template.isPreBuilt) throw new Error('Cannot modify pre-built templates');
            
            Object.assign(template, updates);
            await template.save();
            return template;
        } catch (error) {
            console.error(`[MessageTemplateService] Error updating template:`, error);
            throw error;
        }
    }

    /**
     * Delete a template
     */
    async deleteTemplate(templateId, coachId) {
        try {
            const template = await this.getTemplateById(templateId, coachId);
            if (template.isPreBuilt) throw new Error('Cannot delete pre-built templates');
            
            await template.deleteOne();
            return { success: true, message: 'Template deleted successfully' };
        } catch (error) {
            console.error(`[MessageTemplateService] Error deleting template:`, error);
            throw error;
        }
    }

    /**
     * Duplicate a template
     */
    async duplicateTemplate(templateId, coachId, newName = null) {
        try {
            const template = await this.getTemplateById(templateId, coachId);
            
            const duplicatedTemplate = new MessageTemplate({
                ...template.toObject(),
                _id: undefined,
                coachId: coachId,
                name: newName || `${template.name} (Copy)`,
                isPreBuilt: false,
                usageStats: { totalUses: 0, lastUsed: null, successRate: 100 },
                previousVersions: [],
                version: 1
            });

            await duplicatedTemplate.save();
            return duplicatedTemplate;
        } catch (error) {
            console.error(`[MessageTemplateService] Error duplicating template:`, error);
            throw error;
        }
    }

    /**
     * Render a template with variables
     */
    async renderTemplate(templateId, variables = {}, coachId = null) {
        try {
            const template = coachId ? 
                await this.getTemplateById(templateId, coachId) : 
                await MessageTemplate.findById(templateId);

            if (!template) throw new Error('Template not found');

            const validation = template.validateVariables(variables);
            if (!validation.isValid) {
                throw new Error(`Missing required variables: ${validation.missingVariables.join(', ')}`);
            }

            const renderedContent = template.renderTemplate(variables);
            
            template.usageStats.totalUses += 1;
            template.usageStats.lastUsed = new Date();
            await template.save();

            return { success: true, template, renderedContent };
        } catch (error) {
            console.error(`[MessageTemplateService] Error rendering template:`, error);
            throw error;
        }
    }

    /**
     * Seed pre-built templates for a coach
     */
    async seedPreBuiltTemplates(coachId) {
        try {
            const existingTemplates = await MessageTemplate.find({ 
                coachId, 
                isPreBuilt: true 
            });

            if (existingTemplates.length > 0) return existingTemplates;

            const seededTemplates = [];
            for (const templateData of this.preBuiltTemplates) {
                const template = new MessageTemplate({ ...templateData, coachId });
                await template.save();
                seededTemplates.push(template);
            }

            return seededTemplates;
        } catch (error) {
            console.error(`[MessageTemplateService] Error seeding templates:`, error);
            throw error;
        }
    }
}

module.exports = new MessageTemplateService();
