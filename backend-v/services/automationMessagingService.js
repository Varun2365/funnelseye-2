const MessagingChannel = require('../schema/MessagingChannel');
const MessageTemplate = require('../schema/MessageTemplate');

/**
 * Automation Messaging Service
 * Provides messaging-related functionality for automation rules
 */

class AutomationMessagingService {

    /**
     * Get available messaging channels for a user
     * @param {string} userId - User ID
     * @param {string} userRole - User role (admin, coach, staff)
     * @param {string} channelType - Optional: filter by channel type
     * @param {boolean} includeInactive - Whether to include inactive channels
     * @returns {Array} Available channels
     */
    async getAvailableChannels(userId, userRole, channelType = null, includeInactive = false) {
        try {
            const query = {};

            // Filter by channel type if specified
            if (channelType) {
                query.type = channelType;
            }

            // Filter by active status unless explicitly requested
            if (!includeInactive) {
                query.isActive = true;
            }

            if (userRole === 'admin' || userRole === 'super_admin') {
                // Admin can see all channels
                // No additional filters needed
            } else {
                // Coach/staff can see their own channels or public ones
                query.$or = [
                    { configuredBy: userId },
                    { isPublic: true }
                ];
            }

            const channels = await MessagingChannel.find(query)
                .sort({ priority: -1, createdAt: -1 })
                .populate('configuredBy', 'name email')
                .lean();

            return channels.map(channel => ({
                id: channel._id,
                name: channel.name,
                type: channel.type,
                description: channel.description,
                isActive: channel.isActive,
                isDefault: channel.isDefault,
                priority: channel.priority,
                statistics: channel.statistics,
                configMetadata: {
                    testStatus: channel.configMetadata?.testStatus,
                    lastTested: channel.configMetadata?.lastTested
                },
                // Channel-specific configuration info (without sensitive data)
                channelInfo: this.getChannelInfo(channel)
            }));

        } catch (error) {
            console.error('Error getting available channels:', error);
            throw error;
        }
    }

    /**
     * Get channel info based on type (safe info only)
     */
    getChannelInfo(channel) {
        switch (channel.type) {
            case 'whatsapp_api':
                return {
                    phoneNumberId: channel.whatsappApi?.phoneNumberId,
                    businessAccountId: channel.whatsappApi?.businessAccountId,
                    webhookActive: channel.whatsappApi?.isWebhookActive,
                    apiVersion: channel.whatsappApi?.apiVersion
                };
            case 'whatsapp_bailey':
                return {
                    deviceId: channel.whatsappBailey?.deviceId,
                    phoneNumber: channel.whatsappBailey?.phoneNumber,
                    isConnected: channel.whatsappBailey?.isConnected,
                    connectionStatus: channel.whatsappBailey?.connectionStatus
                };
            case 'email_smtp':
                return {
                    fromEmail: channel.emailSmtp?.fromEmail,
                    fromName: channel.emailSmtp?.fromName,
                    testEmailAddress: channel.emailSmtp?.testEmailAddress
                };
            default:
                return {};
        }
    }

    /**
     * Get available message templates for a user
     * @param {string} userId - User ID
     * @param {string} templateType - Optional: filter by template type (whatsapp, email, universal)
     * @param {string} category - Optional: filter by category
     * @returns {Array} Available templates
     */
    async getAvailableTemplates(userId, templateType = null, category = null) {
        try {
            const query = { coachId: userId };

            // Filter by template type if specified
            if (templateType && templateType !== 'universal') {
                query.$or = [
                    { type: templateType },
                    { type: 'universal' }
                ];
            }

            // Filter by category if specified
            if (category) {
                query.category = category;
            }

            const templates = await MessageTemplate.find(query)
                .sort({ createdAt: -1 })
                .lean();

            return templates.map(template => ({
                id: template._id,
                name: template.name,
                description: template.description,
                type: template.type,
                category: template.category,
                content: {
                    subject: template.content?.subject,
                    body: template.content?.body,
                    variables: template.content?.variables || []
                },
                whatsappOptions: template.content?.whatsappOptions,
                isActive: template.isActive,
                usageCount: template.usageCount || 0,
                lastUsed: template.lastUsed
            }));

        } catch (error) {
            console.error('Error getting available templates:', error);
            throw error;
        }
    }

    /**
     * Validate messaging configuration for automation action
     * @param {object} config - Action configuration
     * @param {string} userId - User ID
     * @param {string} userRole - User role
     * @returns {object} Validation result
     */
    async validateMessagingConfig(config, userId, userRole) {
        try {
            const errors = [];
            const warnings = [];

            // Validate channel selection
            if (config.channelId) {
                const channel = await MessagingChannel.findById(config.channelId);
                if (!channel) {
                    errors.push('Selected messaging channel does not exist');
                } else if (!channel.isActive) {
                    warnings.push('Selected messaging channel is inactive');
                } else if (userRole !== 'admin' && userRole !== 'super_admin') {
                    // Check if user has access to this channel
                    if (channel.configuredBy.toString() !== userId && !channel.isPublic) {
                        errors.push('You do not have access to the selected messaging channel');
                    }
                }
            }

            // Validate template selection
            if (config.useTemplate && config.templateId) {
                const template = await MessageTemplate.findOne({
                    _id: config.templateId,
                    coachId: userId
                });

                if (!template) {
                    errors.push('Selected message template does not exist or you do not have access to it');
                } else if (!template.isActive) {
                    warnings.push('Selected message template is inactive');
                }
            }

            // Validate message content
            if (!config.useTemplate && !config.message && !config.messageTemplate) {
                errors.push('Message content is required when not using a template');
            }

            // Validate template parameters if using template
            if (config.useTemplate && config.templateId) {
                // Template parameter validation would go here
                // For now, just basic validation
            }

            // Validate channel-specific requirements
            if (config.channelCategory) {
                switch (config.channelCategory) {
                    case 'meta_whatsapp':
                    case 'baileys_whatsapp':
                        // WhatsApp specific validations
                        if (!config.to && !config.recipientPhone) {
                            errors.push('Recipient phone number is required for WhatsApp messages');
                        }
                        break;
                    case 'email':
                        // Email specific validations
                        if (!config.to && !config.recipientEmail) {
                            errors.push('Recipient email address is required for email messages');
                        }
                        break;
                }
            }

            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };

        } catch (error) {
            console.error('Error validating messaging config:', error);
            return {
                isValid: false,
                errors: ['Failed to validate messaging configuration'],
                warnings: []
            };
        }
    }

    /**
     * Get channel categories and their types
     * @returns {object} Channel categories mapping
     */
    getChannelCategories() {
        return {
            'meta_whatsapp': {
                label: 'Meta WhatsApp API',
                description: 'WhatsApp Business API via Meta',
                supportsTemplates: true,
                supportsMedia: true,
                supportsButtons: true
            },
            'baileys_whatsapp': {
                label: 'Bailey\'s WhatsApp',
                description: 'Direct WhatsApp connection via Bailey\'s',
                supportsTemplates: false,
                supportsMedia: true,
                supportsButtons: false
            },
            'email': {
                label: 'Email SMTP',
                description: 'Email via SMTP server',
                supportsTemplates: true,
                supportsMedia: true,
                supportsButtons: false
            }
        };
    }

    /**
     * Get template categories
     * @returns {Array} Template categories
     */
    getTemplateCategories() {
        return [
            { value: 'welcome', label: 'Welcome Messages' },
            { value: 'follow_up', label: 'Follow-up Messages' },
            { value: 'appointment', label: 'Appointment Messages' },
            { value: 'reminder', label: 'Reminder Messages' },
            { value: 'marketing', label: 'Marketing Messages' },
            { value: 'support', label: 'Support Messages' },
            { value: 'custom', label: 'Custom Messages' }
        ];
    }
}

module.exports = new AutomationMessagingService();