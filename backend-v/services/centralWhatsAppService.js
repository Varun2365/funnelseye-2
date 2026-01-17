const axios = require('axios');
const CentralWhatsApp = require('../schema/CentralWhatsApp');
const logger = require('../utils/logger');

class CentralWhatsAppService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v23.0';
        this.centralConfig = null;
    }

    // Initialize the central WhatsApp configuration
    async initialize() {
        try {
            this.centralConfig = await CentralWhatsApp.findOne({ 
                isActive: true, 
                isDefault: true 
            }).select('+accessToken');
            
            if (!this.centralConfig) {
                throw new Error('No active central WhatsApp configuration found');
            }
            
            logger.info(`[CentralWhatsApp] Initialized with phone number: ${this.centralConfig.phoneNumberId}`);
            return this.centralConfig;
        } catch (error) {
            logger.error('[CentralWhatsApp] Initialization failed:', error.message);
            throw error;
        }
    }

    // Get central WhatsApp configuration
    async getConfig() {
        if (!this.centralConfig) {
            await this.initialize();
        }
        return this.centralConfig;
    }

    // Format components for Meta API v23.0 (based on official Meta documentation)
    formatComponentsForMeta(components) {
        console.log('🔧 [CentralWhatsApp] formatComponentsForMeta called with:', JSON.stringify(components, null, 2));
        
        return components.map((component, index) => {
            console.log(`🔧 [CentralWhatsApp] Processing component ${index}:`, JSON.stringify(component, null, 2));
            
            if (component.type === 'BODY') {
                // Extract variables from text (e.g., {{1}}, {{2}}, {{3}})
                const variables = component.text.match(/\{\{(\d+)\}\}/g) || [];
                const variableCount = variables.length;
                
                let formattedComponent = {
                    type: 'BODY',
                    text: component.text
                };
                
                // Add example if there are variables (as per Meta documentation)
                if (variableCount > 0) {
                    // Create example values array - Meta expects nested array for multiple variables
                    const exampleValues = [];
                    for (let i = 1; i <= variableCount; i++) {
                        exampleValues.push(`sample_value_${i}`);
                    }
                    
                    formattedComponent.example = {
                        body_text: [exampleValues] // Note: nested array as per Meta docs
                    };
                }
                
                console.log(`🔧 [CentralWhatsApp] Formatted BODY component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
                
            } else if (component.type === 'HEADER') {
                let formattedComponent = {
                    type: 'HEADER',
                    format: component.format || 'TEXT',
                    text: component.text
                };
                
                // Add example if there are variables (as per Meta documentation)
                const variables = component.text.match(/\{\{(\d+)\}\}/g) || [];
                if (variables.length > 0) {
                    formattedComponent.example = {
                        header_text: [`sample_header_value`]
                    };
                }
                
                console.log(`🔧 [CentralWhatsApp] Formatted HEADER component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
                
            } else if (component.type === 'FOOTER') {
                // FOOTER doesn't need example (as per Meta documentation)
                const formattedComponent = {
                    type: 'FOOTER',
                    text: component.text
                };
                console.log(`🔧 [CentralWhatsApp] Formatted FOOTER component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
                
            } else if (component.type === 'BUTTONS') {
                const formattedComponent = {
                    type: 'BUTTONS',
                    buttons: component.buttons || []
                };
                console.log(`🔧 [CentralWhatsApp] Formatted BUTTONS component:`, JSON.stringify(formattedComponent, null, 2));
                return formattedComponent;
            }
            
            return component;
        });
    }

    // Send text message
    // Helper to format phone number to E.164 format
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters except +
        let formatted = phoneNumber.replace(/[^\d+]/g, '');
        
        // If doesn't start with +, assume it needs country code
        if (!formatted.startsWith('+')) {
            // If starts with 0, remove it (common in local formats)
            if (formatted.startsWith('0')) {
                formatted = formatted.substring(1);
            }
            // Default to +1 if no country code (you may want to make this configurable)
            // For now, require explicit country code
            if (!formatted.startsWith('+')) {
                throw new Error('Phone number must include country code (e.g., +1234567890)');
            }
        }
        
        // Validate E.164 format: + followed by 1-15 digits
        if (!/^\+[1-9]\d{1,14}$/.test(formatted)) {
            throw new Error(`Invalid phone number format. Must be E.164 format: +[country code][number] (e.g., +1234567890)`);
        }
        
        return formatted;
    }

    async sendTextMessage(to, text, coachId = null) {
        try {
            const config = await this.getConfig();
            
            // Validate and format phone number
            const formattedTo = this.formatPhoneNumber(to);
            
            if (!text || text.trim().length === 0) {
                throw new Error('Message text cannot be empty');
            }
            
            const messageData = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedTo,
                type: 'text',
                text: {
                    preview_url: false,
                    body: text.trim()
                }
            };

            logger.info(`[CentralWhatsApp] Sending text message to ${formattedTo}`);
            logger.debug(`[CentralWhatsApp] Message payload:`, JSON.stringify(messageData, null, 2));

            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/messages`,
                'POST',
                messageData
            );

            logger.info(`[CentralWhatsApp] Meta API response:`, JSON.stringify(response, null, 2));

            // Validate response contains message ID
            if (!response.messages || !response.messages[0] || !response.messages[0].id) {
                logger.error(`[CentralWhatsApp] Invalid response from Meta API:`, response);
                throw new Error('Meta API did not return a valid message ID. Response: ' + JSON.stringify(response));
            }

            // Update statistics
            await config.updateStatistics('sent');
            
            // Add contact if not exists
            await config.addContact(formattedTo);

            const messageId = response.messages[0].id;
            logger.info(`[CentralWhatsApp] Text message sent successfully. Message ID: ${messageId}, Recipient: ${formattedTo}`);
            
            return {
                success: true,
                messageId: messageId,
                wamid: messageId, // WhatsApp message ID
                status: 'sent',
                recipient: formattedTo
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending text message to ${to}:`, error.response?.data || error.message);
            logger.error(`[CentralWhatsApp] Error details:`, {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                stack: error.stack
            });
            throw error;
        }
    }

    // Send template message
    async sendTemplateMessage(to, templateName, language = null, parameters = [], coachId = null) {
        try {
            const config = await this.getConfig();
            
            // Validate and format phone number
            const formattedTo = this.formatPhoneNumber(to);
            
            // Get template from synced data
            const template = config.getTemplateByName(templateName);
            if (!template) {
                // List available templates for debugging
                const availableTemplates = config.templates?.map(t => `${t.name || t.templateName} (${t.language})`).join(', ') || 'none';
                throw new Error(`Template '${templateName}' not found. Available templates: ${availableTemplates}`);
            }

            // Check if template is approved
            if (template.status !== 'APPROVED') {
                throw new Error(`Template '${templateName}' is not approved. Current status: ${template.status}`);
            }

            // ALWAYS use the template's language from synced data - this is the most reliable
            const templateLanguage = template.language || 'en';
            
            logger.info(`[CentralWhatsApp] Template '${templateName}' - Using language from synced data: ${templateLanguage}`);

            // Count required parameters from template components
            let requiredParamCount = 0;
            if (template.components && template.components.length > 0) {
                template.components.forEach(comp => {
                    if (comp.type === 'BODY' && comp.text) {
                        // Count {{1}}, {{2}}, etc. placeholders
                        const matches = comp.text.match(/\{\{(\d+)\}\}/g);
                        if (matches) {
                            requiredParamCount = Math.max(requiredParamCount, matches.length);
                        }
                    }
                });
            }
            
            logger.info(`[CentralWhatsApp] Template '${templateName}' requires ${requiredParamCount} parameters, received ${parameters?.length || 0}`);
            
            // Validate parameter count
            if (requiredParamCount > 0 && (!parameters || parameters.length < requiredParamCount)) {
                throw new Error(`Template '${templateName}' requires ${requiredParamCount} parameters but only ${parameters?.length || 0} were provided. Please provide all required parameters.`);
            }

            const messageData = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedTo,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: templateLanguage
                    }
                }
            };

            // Add parameters if required and provided
            if (requiredParamCount > 0 && parameters && parameters.length > 0) {
                // Ensure all parameters are strings and take only required count
                const stringParams = parameters.slice(0, requiredParamCount).map(param => String(param || ''));
                messageData.template.components = [{
                    type: 'body',
                    parameters: stringParams.map(param => ({
                        type: 'text',
                        text: param
                    }))
                }];
            }

            logger.info(`[CentralWhatsApp] Sending template message to ${formattedTo} using template ${templateName}`);
            logger.debug(`[CentralWhatsApp] Message payload:`, JSON.stringify(messageData, null, 2));

            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/messages`,
                'POST',
                messageData
            );

            logger.info(`[CentralWhatsApp] Meta API response:`, JSON.stringify(response, null, 2));

            // Validate response contains message ID
            if (!response.messages || !response.messages[0] || !response.messages[0].id) {
                logger.error(`[CentralWhatsApp] Invalid response from Meta API:`, response);
                throw new Error('Meta API did not return a valid message ID. Response: ' + JSON.stringify(response));
            }

            // Update statistics
            await config.updateStatistics('sent');
            
            // Add contact if not exists
            await config.addContact(formattedTo);

            const messageId = response.messages[0].id;
            logger.info(`[CentralWhatsApp] Template message sent successfully. Message ID: ${messageId}, Recipient: ${formattedTo}, Template: ${templateName}`);
            
            return {
                success: true,
                messageId: messageId,
                wamid: messageId, // WhatsApp message ID
                status: 'sent',
                recipient: formattedTo,
                template: templateName
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending template message to ${to}:`, error.response?.data || error.message);
            logger.error(`[CentralWhatsApp] Error details:`, {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                stack: error.stack
            });
            throw error;
        }
    }

    // Send media message
    async sendMediaMessage(to, mediaType, mediaUrl, caption = null, coachId = null) {
        try {
            const config = await this.getConfig();
            
            // Validate and format phone number
            const formattedTo = this.formatPhoneNumber(to);
            
            if (!mediaUrl || mediaUrl.trim().length === 0) {
                throw new Error('Media URL is required');
            }

            const messageData = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedTo,
                type: mediaType,
                [mediaType]: {
                    link: mediaUrl.trim()
                }
            };

            if (caption && (mediaType === 'image' || mediaType === 'video')) {
                messageData[mediaType].caption = caption.trim();
            }

            logger.info(`[CentralWhatsApp] Sending media message to ${formattedTo}`);
            logger.debug(`[CentralWhatsApp] Message payload:`, JSON.stringify(messageData, null, 2));

            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/messages`,
                'POST',
                messageData
            );

            logger.info(`[CentralWhatsApp] Meta API response:`, JSON.stringify(response, null, 2));

            // Validate response contains message ID
            if (!response.messages || !response.messages[0] || !response.messages[0].id) {
                logger.error(`[CentralWhatsApp] Invalid response from Meta API:`, response);
                throw new Error('Meta API did not return a valid message ID. Response: ' + JSON.stringify(response));
            }

            // Update statistics
            await config.updateStatistics('sent');
            
            // Add contact if not exists
            await config.addContact(formattedTo);

            const messageId = response.messages[0].id;
            logger.info(`[CentralWhatsApp] Media message sent successfully. Message ID: ${messageId}, Recipient: ${formattedTo}, Type: ${mediaType}`);
            
            return {
                success: true,
                messageId: messageId,
                wamid: messageId, // WhatsApp message ID
                status: 'sent',
                recipient: formattedTo,
                mediaType: mediaType
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending media message to ${to}:`, error.response?.data || error.message);
            logger.error(`[CentralWhatsApp] Error details:`, {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                stack: error.stack
            });
            throw error;
        }
    }

    // Create template
    async createTemplate(templateData) {
        try {
            const config = await this.getConfig();
            
            // Use the stored business account ID from configuration
            const businessAccountId = config.businessAccountId;
            if (!businessAccountId) {
                throw new Error('WhatsApp Business Account ID not configured. Please set up the central WhatsApp configuration first.');
            }
            
            console.log('📱 [CentralWhatsApp] Using stored business account ID:', businessAccountId);
            
            // Meta API v23.0 requires specific component structure (based on official docs)
            const formattedComponents = this.formatComponentsForMeta(templateData.components);
            console.log('🔧 [CentralWhatsApp] Original components:', JSON.stringify(templateData.components, null, 2));
            console.log('🔧 [CentralWhatsApp] Formatted components:', JSON.stringify(formattedComponents, null, 2));
            
            const templatePayload = {
                name: templateData.name,
                category: templateData.category,
                language: templateData.language || 'en',
                components: formattedComponents
            };
            
            console.log('🔧 [CentralWhatsApp] Final payload:', JSON.stringify(templatePayload, null, 2));

            const response = await this.makeApiCall(
                `/${businessAccountId}/message_templates`,
                'POST',
                templatePayload
            );

            // Add template to our database
            config.templates.push({
                templateId: response.id,
                templateName: templateData.name,
                category: templateData.category,
                status: 'PENDING',
                language: templateData.language || 'en',
                components: templateData.components
            });

            await config.save();

            logger.info(`[CentralWhatsApp] Template created: ${templateData.name}`);
            return {
                success: true,
                templateId: response.id,
                templateName: templateData.name,
                status: 'PENDING'
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error creating template:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get templates with full information for sending messages
    async getTemplates() {
        try {
            const config = await this.getConfig();
            
            if (!config.templates || config.templates.length === 0) {
                logger.warn(`[CentralWhatsApp] No templates found in database. Consider syncing templates first.`);
                return {
                    success: true,
                    templates: [],
                    message: 'No templates found. Please sync templates first.'
                };
            }

            // Format all templates with full information
            const formattedTemplates = config.templates.map(template => {
                return this.formatTemplateForResponse(template);
            });

            // Filter to only approved templates by default
            const approvedTemplates = formattedTemplates.filter(t => t.status === 'APPROVED');

            logger.info(`[CentralWhatsApp] Retrieved ${formattedTemplates.length} templates (${approvedTemplates.length} approved)`);

            return {
                success: true,
                templates: formattedTemplates,
                approvedTemplates: approvedTemplates,
                total: formattedTemplates.length,
                approved: approvedTemplates.length,
                // Summary for easier consumption
                summary: {
                    total: formattedTemplates.length,
                    approved: approvedTemplates.length,
                    pending: formattedTemplates.filter(t => t.status === 'PENDING').length,
                    rejected: formattedTemplates.filter(t => t.status === 'REJECTED').length,
                    disabled: formattedTemplates.filter(t => t.status === 'DISABLED').length
                }
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error getting templates:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get templates LIVE from Meta API (fresh fetch, not from database cache)
    async getTemplatesFromMeta() {
        try {
            const config = await this.getConfig();
            
            const businessAccountId = config.businessAccountId;
            if (!businessAccountId) {
                throw new Error('WhatsApp Business Account ID not configured');
            }
            
            logger.info(`[CentralWhatsApp] Fetching templates LIVE from Meta API...`);
            
            const response = await this.makeApiCall(
                `/${businessAccountId}/message_templates`,
                'GET'
            );

            if (!response.data) {
                return {
                    success: true,
                    templates: [],
                    message: 'No templates found in Meta account'
                };
            }

            // Format templates with all required information
            const formattedTemplates = (response.data || []).map(metaTemplate => {
                // Count parameters from template body
                let parameterCount = 0;
                if (metaTemplate.components && metaTemplate.components.length > 0) {
                    metaTemplate.components.forEach(comp => {
                        if (comp.type === 'BODY' && comp.text) {
                            const matches = comp.text.match(/\{\{(\d+)\}\}/g);
                            if (matches) {
                                parameterCount = Math.max(parameterCount, matches.length);
                            }
                        }
                    });
                }

                return {
                    templateId: metaTemplate.id,
                    templateName: metaTemplate.name,
                    name: metaTemplate.name, // Alias for compatibility
                    category: metaTemplate.category,
                    status: metaTemplate.status,
                    language: metaTemplate.language || 'en',
                    components: metaTemplate.components || [],
                    parameterCount: parameterCount,
                    source: 'meta_live',
                    // Extract body text for preview
                    bodyPreview: metaTemplate.components?.find(c => c.type === 'BODY')?.text || '',
                };
            });

            // Filter by status
            const approvedTemplates = formattedTemplates.filter(t => t.status === 'APPROVED');
            const pendingTemplates = formattedTemplates.filter(t => t.status === 'PENDING');
            const rejectedTemplates = formattedTemplates.filter(t => t.status === 'REJECTED');

            logger.info(`[CentralWhatsApp] Fetched ${formattedTemplates.length} templates from Meta (${approvedTemplates.length} approved)`);

            return {
                success: true,
                templates: formattedTemplates,
                approvedTemplates: approvedTemplates,
                summary: {
                    total: formattedTemplates.length,
                    approved: approvedTemplates.length,
                    pending: pendingTemplates.length,
                    rejected: rejectedTemplates.length
                }
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error fetching templates from Meta:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get business profile
    async getBusinessProfile() {
        try {
            const config = await this.getConfig();
            
            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/whatsapp_business_profile`,
                'GET'
            );

            return {
                success: true,
                profile: response
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error getting business profile:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Update business profile
    async updateBusinessProfile(profileData) {
        try {
            const config = await this.getConfig();
            
            const response = await this.makeApiCall(
                `/${config.phoneNumberId}/whatsapp_business_profile`,
                'POST',
                profileData
            );

            // Update local config (simplified - no business fields to update)
            // Business profile updates are handled by Meta directly
            
            await config.save();

            logger.info(`[CentralWhatsApp] Business profile updated`);
            return {
                success: true,
                profile: response
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error updating business profile:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Get contacts
    async getContacts(limit = 100, offset = 0) {
        try {
            const config = await this.getConfig();
            
            const contacts = config.contacts
                .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                .slice(offset, offset + limit);

            return {
                success: true,
                contacts: contacts,
                total: config.contacts.length,
                limit: limit,
                offset: offset
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error getting contacts:`, error.message);
            throw error;
        }
    }

    // Update contact name
    async updateContact(phoneNumber, name) {
        try {
            const config = await this.getConfig();
            
            const contact = config.contacts.find(c => c.phoneNumber === phoneNumber);
            if (!contact) {
                throw new Error('Contact not found');
            }
            
            contact.name = name || null;
            await config.save();
            
            logger.info(`[CentralWhatsApp] Contact updated: ${phoneNumber}`);
            return {
                success: true,
                contact: contact
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error updating contact:`, error.message);
            throw error;
        }
    }

    // Send bulk messages
    async sendBulkMessages(contacts, message, templateName, parameters, mediaUrl, mediaType) {
        try {
            const results = [];
            let sentCount = 0;
            let failedCount = 0;
            
            // Get template language once if sending template messages
            let templateLanguage = 'en';
            if (templateName && templateName.trim()) {
                const config = await this.getConfig();
                const template = config.getTemplateByName(templateName);
                templateLanguage = template?.language || 'en';
            }
            
            for (const phoneNumber of contacts) {
                try {
                    let result;
                    
                    if (templateName && templateName.trim()) {
                        // Send template message
                        result = await this.sendTemplateMessage(phoneNumber, templateName, templateLanguage, parameters || []);
                    } else if (mediaUrl && mediaUrl.trim()) {
                        // Send media message
                        result = await this.sendMediaMessage(phoneNumber, mediaUrl, mediaType || 'image', message || '');
                    } else {
                        // Send text message
                        result = await this.sendTextMessage(phoneNumber, message);
                    }
                    
                    results.push({
                        phoneNumber,
                        success: true,
                        messageId: result.messageId
                    });
                    sentCount++;
                } catch (error) {
                    results.push({
                        phoneNumber,
                        success: false,
                        error: error.message
                    });
                    failedCount++;
                }
            }
            
            logger.info(`[CentralWhatsApp] Bulk messages sent: ${sentCount} successful, ${failedCount} failed`);
            return {
                success: true,
                sentCount,
                failedCount,
                results
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error sending bulk messages:`, error.message);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const config = await this.getConfig();
            
            // Test API connection
            await this.makeApiCall(
                `/${config.phoneNumberId}`,
                'GET'
            );

            // Update last health check
            config.lastHealthCheck = new Date();
            await config.save();

            return {
                success: true,
                status: 'healthy',
                phoneNumberId: config.phoneNumberId,
                lastHealthCheck: config.lastHealthCheck
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Health check failed:`, error.message);
            return {
                success: false,
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    // Make API call to Meta
    async makeApiCall(endpoint, method = 'GET', data = null) {
        try {
            const config = await this.getConfig();
            const url = `${this.baseUrl}${endpoint}`;
            
            logger.debug(`[CentralWhatsApp] Making API call: ${method} ${url}`);
            if (data) {
                logger.debug(`[CentralWhatsApp] Request data:`, JSON.stringify(data, null, 2));
            }
            
            const options = {
                method,
                url,
                headers: {
                    'Authorization': `Bearer ${config.accessToken}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.data = data;
            }

            const response = await axios(options);
            
            // Check if response contains error (even with 200 status)
            if (response.data?.error) {
                const errorData = response.data.error;
                logger.error(`[CentralWhatsApp] Meta API returned error in response:`, errorData);
                const enhancedError = new Error(`WhatsApp API Error: ${errorData.message || 'Unknown error'}`);
                enhancedError.code = errorData.code || 'UNKNOWN_ERROR';
                enhancedError.type = errorData.type;
                enhancedError.subcode = errorData.error_subcode;
                enhancedError.originalError = errorData;
                throw enhancedError;
            }
            
            logger.debug(`[CentralWhatsApp] API call successful:`, JSON.stringify(response.data, null, 2));
            return response.data;

        } catch (error) {
            logger.error(`[CentralWhatsApp] API call failed:`, error.response?.data || error.message);
            
            // If it's already an enhanced error, re-throw it
            if (error.code && error.type) {
                throw error;
            }
            
            // Check for specific error types
            if (error.response?.status === 401) {
                const errorData = error.response.data;
                if (errorData?.error?.code === 190) {
                    // Token expired or invalid
                    const errorMessage = errorData.error.message || 'Access token is invalid or expired';
                    const enhancedError = new Error(`WhatsApp Access Token Error: ${errorMessage}`);
                    enhancedError.code = 'TOKEN_EXPIRED';
                    enhancedError.originalError = errorData;
                    throw enhancedError;
                } else if (errorData?.error?.type === 'OAuthException') {
                    // General OAuth error
                    const errorMessage = errorData.error.message || 'OAuth authentication failed';
                    const enhancedError = new Error(`WhatsApp OAuth Error: ${errorMessage}`);
                    enhancedError.code = 'OAUTH_ERROR';
                    enhancedError.originalError = errorData;
                    throw enhancedError;
                }
            }
            
            // Check for template-related errors
            if (error.response?.status === 404) {
                const errorData = error.response.data;
                if (errorData?.error?.code === 132001) {
                    // Template not found or not approved
                    const errorMessage = errorData.error.message || 'Template not found or not approved';
                    const enhancedError = new Error(`WhatsApp Template Error: ${errorMessage}`);
                    enhancedError.code = 'TEMPLATE_NOT_FOUND';
                    enhancedError.originalError = errorData;
                    throw enhancedError;
                }
            }
            
            // Check for phone number validation errors (131047)
            if (error.response?.data?.error?.code === 131047) {
                const errorMessage = error.response.data.error.message || 'Invalid phone number format';
                const enhancedError = new Error(`WhatsApp Phone Number Error: ${errorMessage}`);
                enhancedError.code = 'INVALID_PHONE_NUMBER';
                enhancedError.originalError = error.response.data;
                throw enhancedError;
            }
            
            // Check for 24-hour window errors (131047 or 131051)
            if (error.response?.data?.error?.code === 131051) {
                const errorMessage = error.response.data.error.message || 'Cannot send message outside 24-hour window. Use an approved template.';
                const enhancedError = new Error(`WhatsApp 24-Hour Window Error: ${errorMessage}`);
                enhancedError.code = 'OUTSIDE_24H_WINDOW';
                enhancedError.originalError = error.response.data;
                throw enhancedError;
            }
            
            throw error;
        }
    }

    // Helper method to extract template variables from components
    extractTemplateVariables(components) {
        const variables = [];
        
        if (!components || !Array.isArray(components)) {
            return variables;
        }
        
        for (const component of components) {
            if (component.type === 'BODY') {
                // Extract variables from body text (format: {{1}}, {{2}}, etc.)
                const bodyText = component.text || '';
                const matches = bodyText.match(/\{\{(\d+)\}\}/g);
                if (matches) {
                    matches.forEach(match => {
                        const index = parseInt(match.replace(/\{\{|\}\}/g, ''));
                        if (!variables.find(v => v.index === index)) {
                            variables.push({
                                index: index,
                                placeholder: match,
                                type: 'text',
                                required: true
                            });
                        }
                    });
                }
            } else if (component.type === 'HEADER') {
                // Header can have variables in text format or example
                if (component.format === 'TEXT' && component.text) {
                    const matches = component.text.match(/\{\{(\d+)\}\}/g);
                    if (matches) {
                        matches.forEach(match => {
                            const index = parseInt(match.replace(/\{\{|\}\}/g, ''));
                            if (!variables.find(v => v.index === index)) {
                                variables.push({
                                    index: index,
                                    placeholder: match,
                                    type: 'header',
                                    required: true
                                });
                            }
                        });
                    }
                }
            } else if (component.type === 'BUTTONS') {
                // Buttons can have URL parameters
                if (component.buttons) {
                    component.buttons.forEach((button, btnIndex) => {
                        if (button.type === 'URL' && button.url) {
                            // Check for variables in URL ({{1}}, etc.)
                            const matches = button.url.match(/\{\{(\d+)\}\}/g);
                            if (matches) {
                                matches.forEach(match => {
                                    const index = parseInt(match.replace(/\{\{|\}\}/g, ''));
                                    if (!variables.find(v => v.index === index && v.buttonIndex === btnIndex)) {
                                        variables.push({
                                            index: index,
                                            placeholder: match,
                                            type: 'button_url',
                                            buttonIndex: btnIndex,
                                            buttonText: button.text,
                                            required: true
                                        });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        }
        
        // Sort by index
        return variables.sort((a, b) => a.index - b.index);
    }

    // Helper method to format template for response
    formatTemplateForResponse(template) {
        const variables = this.extractTemplateVariables(template.components);
        
        // Build payload structure for sending messages
        const payload = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            type: 'template',
            template: {
                name: template.templateName || template.name,
                language: {
                    code: template.language || 'en'
                }
            }
        };
        
        // Add components with parameters if there are variables
        const bodyVariables = variables.filter(v => v.type === 'text');
        const headerVariables = variables.filter(v => v.type === 'header');
        const buttonVariables = variables.filter(v => v.type === 'button_url');
        
        if (bodyVariables.length > 0 || headerVariables.length > 0 || buttonVariables.length > 0) {
            payload.template.components = [];
            
            // Body component
            if (bodyVariables.length > 0) {
                payload.template.components.push({
                    type: 'body',
                    parameters: bodyVariables.map(v => ({
                        type: 'text',
                        text: '' // Placeholder - will be replaced with actual values when sending
                    }))
                });
            }
            
            // Header component (if has variables)
            if (headerVariables.length > 0) {
                const headerComponent = (template.components || []).find(c => c.type === 'HEADER');
                if (headerComponent) {
                    payload.template.components.push({
                        type: 'header',
                        parameters: headerVariables.map(v => ({
                            type: 'text',
                            text: '' // Placeholder - will be replaced with actual values when sending
                        }))
                    });
                }
            }
            
            // Button components (if has variables)
            if (buttonVariables.length > 0) {
                const buttonComponent = (template.components || []).find(c => c.type === 'BUTTONS');
                if (buttonComponent && buttonComponent.buttons) {
                    buttonComponent.buttons.forEach((button, btnIndex) => {
                        if (button.type === 'URL') {
                            const btnVars = buttonVariables.filter(v => v.buttonIndex === btnIndex);
                            if (btnVars.length > 0) {
                                const buttonParams = [];
                                buttonParams.push({
                                    type: 'text',
                                    text: '' // Placeholder - will be replaced with actual values when sending
                                });
                                payload.template.components.push({
                                    type: 'button',
                                    sub_type: 'url',
                                    index: btnIndex,
                                    parameters: buttonParams
                                });
                            }
                        }
                    });
                }
            }
        }
        
        return {
            templateId: template.templateId,
            templateName: template.templateName || template.name,
            name: template.templateName || template.name,
            category: template.category,
            status: template.status,
            language: template.language || 'en',
            components: template.components || [],
            variables: variables,
            parameterCount: variables.length,
            parameterInfo: {
                bodyParameters: bodyVariables.length,
                headerParameters: headerVariables.length,
                buttonParameters: buttonVariables.length,
                total: variables.length
            },
            createdAt: template.createdAt,
            approvedAt: template.approvedAt,
            // Payload structure for sending messages (ready to use)
            payload: payload,
            // Example payload with actual structure
            examplePayload: {
                to: '+1234567890',
                ...payload,
                template: {
                    ...payload.template,
                    components: payload.template.components ? payload.template.components.map(comp => {
                        if (comp.parameters) {
                            return {
                                ...comp,
                                parameters: comp.parameters.map((_, idx) => ({
                                    type: 'text',
                                    text: `value${idx + 1}`
                                }))
                            };
                        }
                        return comp;
                    }) : []
                }
            }
        };
    }

    // Sync templates from Meta
    async syncTemplates() {
        try {
            const config = await this.getConfig();
            
            // Use the stored business account ID from configuration
            const businessAccountId = config.businessAccountId;
            if (!businessAccountId) {
                throw new Error('WhatsApp Business Account ID not configured. Please set up the central WhatsApp configuration first.');
            }
            
            logger.info(`[CentralWhatsApp] Starting template sync from Meta...`);
            const response = await this.makeApiCall(
                `/${businessAccountId}/message_templates`,
                'GET'
            );

            // COMPLETELY REPLACE templates instead of merging
            const previousCount = config.templates ? config.templates.length : 0;
            
            // Build new templates array from Meta response
            const newTemplates = (response.data || []).map(metaTemplate => ({
                templateId: metaTemplate.id,
                templateName: metaTemplate.name,
                category: metaTemplate.category,
                status: metaTemplate.status,
                language: metaTemplate.language || 'en',
                components: metaTemplate.components || [],
                createdAt: new Date(),
                approvedAt: metaTemplate.status === 'APPROVED' ? new Date() : null
            }));
            
            // REPLACE the entire templates array
            config.templates = newTemplates;
            
            const newCount = newTemplates.length;
            const removedCount = Math.max(0, previousCount - newCount);
            const addedCount = newCount - (previousCount - removedCount);
            
            logger.info(`[CentralWhatsApp] Template sync completed: ${previousCount} → ${newCount} templates (${previousCount > newCount ? `removed ${removedCount}` : addedCount > 0 ? `added ${addedCount}` : 'no change'})`);

            config.lastSyncAt = new Date();
            await config.save();

            // Clean up orphaned templates in WhatsAppTemplate collection
            await this.cleanupOrphanedTemplates(newTemplates.map(t => t.templateId));

            logger.info(`[CentralWhatsApp] Templates synced successfully`);
            return {
                success: true,
                syncedTemplates: newCount,
                previousCount: previousCount,
                newCount: newCount,
                changes: {
                    added: addedCount,
                    removed: removedCount,
                    total: newCount
                },
                summary: `Templates overridden: ${previousCount} → ${newCount} templates`
            };

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error syncing templates:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Clean up orphaned templates from WhatsAppTemplate collection
    async cleanupOrphanedTemplates(validTemplateIds) {
        try {
            const WhatsAppTemplate = require('../schema/WhatsAppTemplate');
            
            // Find templates that are no longer valid
            const orphanedTemplates = await WhatsAppTemplate.find({
                templateId: { $nin: validTemplateIds }
            });
            
            if (orphanedTemplates.length > 0) {
                logger.info(`[CentralWhatsApp] Found ${orphanedTemplates.length} orphaned templates to remove`);
                
                // Log which templates are being removed
                for (const template of orphanedTemplates) {
                    logger.info(`[CentralWhatsApp] Removing orphaned template: ${template.name} (${template.templateId})`);
                }
                
                // Remove orphaned templates
                const deleteResult = await WhatsAppTemplate.deleteMany({
                    templateId: { $nin: validTemplateIds }
                });
                
                logger.info(`[CentralWhatsApp] Cleaned up ${deleteResult.deletedCount} orphaned templates from database`);
                
                return {
                    success: true,
                    removedCount: deleteResult.deletedCount,
                    orphanedTemplates: orphanedTemplates.map(t => ({
                        name: t.name,
                        templateId: t.templateId
                    }))
                };
            }
            
            return {
                success: true,
                removedCount: 0,
                message: 'No orphaned templates found'
            };
            
        } catch (error) {
            logger.error(`[CentralWhatsApp] Error cleaning up orphaned templates:`, error);
            throw error;
        }
    }

    // Unified sendMessage method that routes to appropriate method based on message type
    // Accepts message data object with to, type, message, templateId, templateName, templateParameters, mediaUrl, etc.
    async sendMessage(messageData) {
        try {
            const {
                to,
                type = 'text',
                message,
                templateId,
                templateName,
                templateParameters = {},
                template,
                language, // Language can be passed directly from frontend
                mediaUrl,
                mediaType = 'image',
                caption,
                coachId = null,
                variables = {}
            } = messageData;

            // Validate recipient
            if (!to) {
                throw new Error('Recipient phone number is required');
            }

            // Initialize service if needed
            await this.initialize();

            // Handle template messages (Meta templates)
            // Only send Meta template if we have templateName/template object AND no rendered message
            // If message text is provided, it means local template was rendered, so send as text
            if ((type === 'template' || templateName || template || templateId) && !message) {
                let finalTemplateName = templateName;
                // Priority: explicit language param > template object language > looked up from DB
                let finalLanguage = language || null;
                let finalParameters = [];

                // Get config for template lookup
                const config = await this.getConfig();

                // If template object is provided (Meta format), extract name and language first (priority)
                if (template && template.name) {
                    finalTemplateName = template.name;
                    // Only use template object language if not explicitly provided
                    if (!finalLanguage) {
                        if (template.language && template.language.code) {
                            finalLanguage = template.language.code;
                        } else if (template.language && typeof template.language === 'string') {
                            finalLanguage = template.language;
                        }
                    }
                    
                    // Extract parameters from template.components if provided
                    if (template.components && template.components.length > 0) {
                        const bodyComponent = template.components.find(c => c.type === 'body' || c.type === 'BODY');
                        if (bodyComponent && bodyComponent.parameters) {
                            finalParameters = bodyComponent.parameters.map(param => param.text || param);
                        }
                    }
                    
                    logger.info(`[CentralWhatsApp] Using template object - Name: ${finalTemplateName}, Language: ${finalLanguage}`);
                }
                // If templateId is provided (Meta template ID) and template object not provided, look it up from config
                else if (templateId && !templateName) {
                    const metaTemplate = config.templates?.find(t => 
                        t.templateId === templateId || 
                        t.templateId === String(templateId) ||
                        t._id?.toString() === String(templateId)
                    );
                    
                    if (metaTemplate) {
                        finalTemplateName = metaTemplate.templateName || metaTemplate.name;
                        // Only use DB language if not explicitly provided
                        if (!finalLanguage) {
                            finalLanguage = metaTemplate.language;
                        }
                        logger.info(`[CentralWhatsApp] Found Meta template by ID: ${templateId} -> ${finalTemplateName} (${finalLanguage})`);
                    } else {
                        throw new Error(`Template with ID '${templateId}' not found in Meta templates`);
                    }
                }
                // If only templateName is provided, look up the template to get its language
                else if (templateName) {
                    const metaTemplate = config.getTemplateByName(templateName);
                    if (metaTemplate) {
                        // Only use DB language if not explicitly provided
                        if (!finalLanguage) {
                            finalLanguage = metaTemplate.language;
                        }
                        logger.info(`[CentralWhatsApp] Found Meta template by name: ${templateName} -> language: ${finalLanguage}`);
                    } else {
                        logger.warn(`[CentralWhatsApp] Template '${templateName}' not found in config, will use explicitly passed language or default`);
                    }
                }

                // If templateParameters object is provided, convert to array
                if (templateParameters && typeof templateParameters === 'object' && !Array.isArray(templateParameters)) {
                    // Convert object to array of values in order
                    finalParameters = Object.values(templateParameters);
                } else if (Array.isArray(templateParameters)) {
                    finalParameters = templateParameters;
                }

                if (!finalTemplateName) {
                    throw new Error('Template name is required for Meta template messages');
                }

                // Pass null for language to let sendTemplateMessage resolve it from the template
                const result = await this.sendTemplateMessage(to, finalTemplateName, finalLanguage, finalParameters, coachId);
                return this._ensureWamid(result);
            }

            // Handle media messages
            if (type === 'media' || mediaUrl) {
                const result = await this.sendMediaMessage(to, mediaType, mediaUrl, caption, coachId);
                return this._ensureWamid(result);
            }

            // Handle text messages
            if (type === 'text' || message) {
                // If template object with text body is provided, extract text
                let messageText = message;
                if (template && template.components) {
                    const bodyComponent = template.components.find(c => c.type === 'body');
                    if (bodyComponent && bodyComponent.text) {
                        messageText = bodyComponent.text;
                    }
                }

                if (!messageText) {
                    throw new Error('Message text is required for text messages');
                }

                const result = await this.sendTextMessage(to, messageText, coachId);
                return this._ensureWamid(result);
            }

            throw new Error('Invalid message type or missing required fields');

        } catch (error) {
            logger.error(`[CentralWhatsApp] Error in sendMessage:`, error.message);
            return {
                success: false,
                error: error.message,
                errorCode: error.code || (error.message?.includes('TOKEN_EXPIRED') || error.message?.includes('Session has expired') ? 'TOKEN_EXPIRED' : null),
                originalError: error
            };
        }
    }

    // Helper method to ensure wamid is returned in result
    _ensureWamid(result) {
        if (result && result.success) {
            // If wamid is not present, use messageId
            if (!result.wamid && result.messageId) {
                result.wamid = result.messageId;
            }
            // If messageId is not present but id is, use id
            if (!result.messageId && result.id) {
                result.messageId = result.id;
                result.wamid = result.id;
            }
        }
        return result;
    }
}

module.exports = new CentralWhatsAppService();

