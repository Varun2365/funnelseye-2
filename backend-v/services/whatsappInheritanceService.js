const WhatsAppCustomSettings = require('../schema/WhatsAppCustomSettings');
const WhatsAppAIKnowledge = require('../schema/WhatsAppAIKnowledge');

class WhatsAppInheritanceService {
    
    /**
     * Get effective settings for a coach with inheritance applied
     * @param {string} coachId - Coach ID
     * @param {string} inheritFrom - 'admin' or 'parent_coach'
     * @returns {Object} Effective settings
     */
    async getEffectiveSettings(coachId, inheritFrom = 'admin') {
        try {
            // Get coach's settings
            const coachSettings = await WhatsAppCustomSettings.findOne({
                ownerId: coachId,
                ownerType: 'coach',
                isActive: true
            });
            
            if (!coachSettings) {
                // Create default coach settings
                const defaultCoachSettings = await this.createDefaultCoachSettings(coachId);
                return await this.getEffectiveSettings(coachId, inheritFrom);
            }
            
            // Get parent settings
            const parentSettings = await this.getParentSettings(inheritFrom);
            
            if (!parentSettings) {
                console.warn(`No parent settings found for inheritance from ${inheritFrom}`);
                return coachSettings;
            }
            
            // Apply inheritance
            const effectiveSettings = this.applyInheritance(coachSettings, parentSettings);
            
            return {
                coachSettings,
                parentSettings,
                effectiveSettings,
                inheritanceEnabled: coachSettings.inheritance.enabled,
                customizations: coachSettings.inheritance.customizations
            };
            
        } catch (error) {
            console.error('Error getting effective settings:', error);
            throw error;
        }
    }
    
    /**
     * Get parent settings based on inheritance type
     * @param {string} inheritFrom - 'admin' or 'parent_coach'
     * @returns {Object} Parent settings
     */
    async getParentSettings(inheritFrom) {
        if (inheritFrom === 'admin') {
            return await WhatsAppCustomSettings.findOne({
                ownerType: 'admin',
                isDefault: true,
                isActive: true
            });
        }
        
        // For parent coach inheritance, implement coach hierarchy logic
        // This would require a coach hierarchy schema
        // For now, default to admin settings
        return await WhatsAppCustomSettings.findOne({
            ownerType: 'admin',
            isDefault: true,
            isActive: true
        });
    }
    
    /**
     * Apply inheritance to coach settings
     * @param {Object} coachSettings - Coach's settings
     * @param {Object} parentSettings - Parent settings
     * @returns {Object} Effective settings
     */
    applyInheritance(coachSettings, parentSettings) {
        if (!coachSettings.inheritance.enabled) {
            return coachSettings;
        }
        
        // Deep clone parent settings
        const effectiveSettings = JSON.parse(JSON.stringify(parentSettings));
        
        // Apply coach customizations
        coachSettings.inheritance.customizations.forEach(customization => {
            if (customization.overridden) {
                this.setNestedProperty(effectiveSettings, customization.field, customization.value);
            }
        });
        
        // Apply coach-specific overrides
        if (!coachSettings.aiKnowledge.useDefault) {
            effectiveSettings.aiKnowledge = coachSettings.aiKnowledge;
        }
        
        if (!coachSettings.businessHours.useDefault) {
            effectiveSettings.businessHours = coachSettings.businessHours;
        }
        
        if (!coachSettings.autoReplyRules.useDefault) {
            effectiveSettings.autoReplyRules = coachSettings.autoReplyRules;
        }
        
        // Always use coach's specific settings for these sections
        effectiveSettings.messageFiltering = coachSettings.messageFiltering;
        effectiveSettings.notifications = coachSettings.notifications;
        effectiveSettings.analytics = coachSettings.analytics;
        effectiveSettings.integrations = coachSettings.integrations;
        effectiveSettings.advanced = coachSettings.advanced;
        
        return effectiveSettings;
    }
    
    /**
     * Set nested property value
     * @param {Object} obj - Target object
     * @param {string} path - Property path (e.g., 'aiKnowledge.responseSettings.maxLength')
     * @param {*} value - Value to set
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }
    
    /**
     * Get nested property value
     * @param {Object} obj - Source object
     * @param {string} path - Property path
     * @returns {*} Property value
     */
    getNestedProperty(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }
        
        return current;
    }
    
    /**
     * Create default coach settings
     * @param {string} coachId - Coach ID
     * @returns {Object} Default coach settings
     */
    async createDefaultCoachSettings(coachId) {
        const defaultSettings = await WhatsAppCustomSettings.create({
            ownerId: coachId,
            ownerType: 'coach',
            name: 'Default Coach Settings',
            description: 'Default WhatsApp settings for coach',
            inheritance: {
                enabled: true,
                inheritFrom: 'admin',
                customizations: []
            },
            aiKnowledge: {
                useDefault: true,
                customizations: {}
            },
            businessHours: {
                useDefault: true,
                customSchedule: {}
            },
            autoReplyRules: {
                useDefault: true,
                customRules: []
            },
            messageFiltering: {
                enabled: false,
                filters: []
            },
            notifications: {
                enabled: true,
                channels: []
            },
            analytics: {
                enabled: true,
                tracking: {
                    responseTime: true,
                    aiPerformance: true,
                    userSatisfaction: false,
                    conversionTracking: false
                }
            },
            integrations: {},
            advanced: {
                messageRetention: {
                    days: 90,
                    autoArchive: true
                },
                spamProtection: {
                    enabled: true,
                    maxMessagesPerHour: 10,
                    blacklistedWords: [],
                    whitelistedContacts: []
                },
                aiOptimization: {
                    enabled: true,
                    learningEnabled: false,
                    responseVariation: 20
                }
            },
            createdBy: coachId
        });
        
        return defaultSettings;
    }
    
    /**
     * Add customization to coach settings
     * @param {string} coachId - Coach ID
     * @param {string} fieldPath - Field path to customize
     * @param {*} value - Custom value
     * @returns {Object} Updated settings
     */
    async addCustomization(coachId, fieldPath, value) {
        let settings = await WhatsAppCustomSettings.findOne({
            ownerId: coachId,
            ownerType: 'coach',
            isActive: true
        });
        
        if (!settings) {
            settings = await this.createDefaultCoachSettings(coachId);
        }
        
        // Add to customizations array
        const existingIndex = settings.inheritance.customizations.findIndex(
            c => c.field === fieldPath
        );
        
        if (existingIndex >= 0) {
            settings.inheritance.customizations[existingIndex].value = value;
            settings.inheritance.customizations[existingIndex].overridden = true;
        } else {
            settings.inheritance.customizations.push({
                field: fieldPath,
                value: value,
                overridden: true
            });
        }
        
        // Update the actual field
        this.setNestedProperty(settings, fieldPath, value);
        
        settings.version += 1;
        await settings.save();
        
        return settings;
    }
    
    /**
     * Remove customization from coach settings
     * @param {string} coachId - Coach ID
     * @param {string} fieldPath - Field path to remove customization
     * @returns {Object} Updated settings
     */
    async removeCustomization(coachId, fieldPath) {
        const settings = await WhatsAppCustomSettings.findOne({
            ownerId: coachId,
            ownerType: 'coach',
            isActive: true
        });
        
        if (!settings) {
            throw new Error('Coach settings not found');
        }
        
        // Remove from customizations array
        settings.inheritance.customizations = settings.inheritance.customizations.filter(
            c => c.field !== fieldPath
        );
        
        // Reset field to parent value
        const parentSettings = await this.getParentSettings(settings.inheritance.inheritFrom);
        if (parentSettings) {
            const parentValue = this.getNestedProperty(parentSettings, fieldPath);
            if (parentValue !== undefined) {
                this.setNestedProperty(settings, fieldPath, parentValue);
            }
        }
        
        settings.version += 1;
        await settings.save();
        
        return settings;
    }
    
    /**
     * Get AI knowledge base with customizations applied
     * @param {string} coachId - Coach ID
     * @returns {Object} Customized AI knowledge base
     */
    async getCustomizedAIKnowledge(coachId) {
        const { effectiveSettings } = await this.getEffectiveSettings(coachId);
        
        let aiKnowledge;
        if (effectiveSettings.aiKnowledge.useDefault && effectiveSettings.aiKnowledge.customKnowledgeId) {
            aiKnowledge = await WhatsAppAIKnowledge.findById(effectiveSettings.aiKnowledge.customKnowledgeId);
        } else {
            aiKnowledge = await WhatsAppAIKnowledge.findOne({ isDefault: true });
        }
        
        if (!aiKnowledge) {
            throw new Error('AI knowledge base not found');
        }
        
        // Apply customizations
        const customizedAI = {
            ...aiKnowledge.toObject(),
            systemPrompt: effectiveSettings.aiKnowledge.customizations?.systemPrompt || aiKnowledge.systemPrompt,
            businessInfo: effectiveSettings.aiKnowledge.customizations?.businessInfo || aiKnowledge.businessInfo,
            responseSettings: {
                ...aiKnowledge.responseSettings,
                ...effectiveSettings.aiKnowledge.customizations?.responseSettings
            }
        };
        
        return customizedAI;
    }
    
    /**
     * Get business hours with customizations applied
     * @param {string} coachId - Coach ID
     * @returns {Object} Customized business hours
     */
    async getCustomizedBusinessHours(coachId) {
        const { effectiveSettings } = await this.getEffectiveSettings(coachId);
        
        if (effectiveSettings.businessHours.useDefault) {
            // Get from AI knowledge base
            const aiKnowledge = await WhatsAppAIKnowledge.findOne({ isDefault: true });
            return aiKnowledge?.businessHours || effectiveSettings.businessHours.customSchedule;
        }
        
        return effectiveSettings.businessHours.customSchedule;
    }
    
    /**
     * Get auto-reply rules with customizations applied
     * @param {string} coachId - Coach ID
     * @returns {Array} Customized auto-reply rules
     */
    async getCustomizedAutoReplyRules(coachId) {
        const { effectiveSettings } = await this.getEffectiveSettings(coachId);
        
        if (effectiveSettings.autoReplyRules.useDefault) {
            // Get from AI knowledge base
            const aiKnowledge = await WhatsAppAIKnowledge.findOne({ isDefault: true });
            return aiKnowledge?.autoReplyRules || [];
        }
        
        return effectiveSettings.autoReplyRules.customRules || [];
    }
    
    /**
     * Check if field is customized
     * @param {string} coachId - Coach ID
     * @param {string} fieldPath - Field path to check
     * @returns {boolean} Whether field is customized
     */
    async isFieldCustomized(coachId, fieldPath) {
        const settings = await WhatsAppCustomSettings.findOne({
            ownerId: coachId,
            ownerType: 'coach',
            isActive: true
        });
        
        if (!settings) {
            return false;
        }
        
        return settings.inheritance.customizations.some(
            c => c.field === fieldPath && c.overridden
        );
    }
    
    /**
     * Get inheritance tree for a coach
     * @param {string} coachId - Coach ID
     * @returns {Object} Inheritance tree
     */
    async getInheritanceTree(coachId) {
        const settings = await WhatsAppCustomSettings.findOne({
            ownerId: coachId,
            ownerType: 'coach',
            isActive: true
        });
        
        if (!settings) {
            return null;
        }
        
        const tree = {
            coach: {
                id: coachId,
                settings: settings,
                customizations: settings.inheritance.customizations
            },
            parent: null,
            effective: null
        };
        
        if (settings.inheritance.enabled) {
            const parentSettings = await this.getParentSettings(settings.inheritance.inheritFrom);
            tree.parent = {
                type: settings.inheritance.inheritFrom,
                settings: parentSettings
            };
            
            tree.effective = this.applyInheritance(settings, parentSettings);
        } else {
            tree.effective = settings;
        }
        
        return tree;
    }
    
    /**
     * Bulk update coach settings inheritance
     * @param {Array} coachIds - Array of coach IDs
     * @param {Object} inheritanceConfig - Inheritance configuration
     * @returns {Object} Update results
     */
    async bulkUpdateInheritance(coachIds, inheritanceConfig) {
        const results = [];
        
        for (const coachId of coachIds) {
            try {
                const settings = await WhatsAppCustomSettings.findOne({
                    ownerId: coachId,
                    ownerType: 'coach',
                    isActive: true
                });
                
                if (settings) {
                    settings.inheritance = {
                        ...settings.inheritance,
                        ...inheritanceConfig
                    };
                    settings.version += 1;
                    await settings.save();
                    
                    results.push({
                        coachId,
                        status: 'success',
                        message: 'Inheritance updated successfully'
                    });
                } else {
                    results.push({
                        coachId,
                        status: 'error',
                        message: 'Coach settings not found'
                    });
                }
            } catch (error) {
                results.push({
                    coachId,
                    status: 'error',
                    message: error.message
                });
            }
        }
        
        return results;
    }
}

module.exports = new WhatsAppInheritanceService();
